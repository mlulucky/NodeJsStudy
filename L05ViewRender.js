const http=require("http");
const url=require("url"); // url 을 동적리소스로 쓰기 위해
const querystring=require("querystring")// 정적리소스를 불러오기 위해서
const fs=require("fs/promises");
const mysql=require("mysql");
const mysql2=require("mysql2/promise"); // mysql 을 프라미스화한 라이브러리 // await 로 시점 동기화 가능
const pug=require("pug");

const mysqlConnInfo={ // 디비 접속
    host: "localhost",
    port: 3306,
    database:"SCOTT",
    user: "root",
    password: "mysql123",
}
// 📍오늘 수업목표!
// 부서리스트 출력하기
// 서버와 html 출력부분을 분리시키기
// 서버사이드 렌더링 해보기!

// 서버생성
const server=http.createServer();
// server.listen (== addEventListener 와 비슷)
// 클라이언트 리소스(페이지,문서)요청을 계속 기다리다, 요청이 들어오면 server.on 콜백함수 실행
server.listen(8888,()=>{ // 서버의 콜백함수 // 서버 port 를 연다. 어떤 포트를 listen 들을건가
    console.log("http://localhost:8888 에 서버가 열림");
})
// 서버에 클라이언트 요청이 동시에 들어오면 nodejs 의 콜백함수가 동시에 처리.
server.on("request",async (req,res)=>{ // *서버 콜백함수 // server.on 이벤트리스너 , lisener 콜백함수
    // 예) 동적페이지 /L05EmpDetail.do?empno=7369
    const urlObj=url.parse(req.url); // url 문자열 -> 오브젝트로 변환 Url {"key":value, "key":value,...}
    const params=querystring.parse(urlObj.query); // url 쿼리를 오브젝트로 변환 // urlObj 의 쿼리(쿼리스트링) 'empno=7369' => {empno: '7369'}
    console.log("params",params, typeof params);
    console.log("urlObj",urlObj); // url {key: "", .. pathname: "/파일이름" }
    if(urlObj.pathname==="/") { // 인덱스 페이지 (pathname : 리소스의 주소)
        let data=await fs.readFile("L05Index.html"); // readFile 멀티스레드. *await 로 동기화 // 파일을 문자열로 읽어오면. 파일을 렌더하면 // js 는 멀티스레드! 효율적
        res.write(data); // 화면 출력 (data : 리소스(파일)를 문자열로 불러온 것)
        res.end(); // 응답완료
    } else if (urlObj.pathname==="/deptListModel1.do"){ // deptListModel1 파일 페이지
        // 📍DB 접속
        try{ // mysql 접속시 발생할 에러 예외처리
            const conn=mysql.createConnection(mysqlConnInfo); // mysql 커넥션 객체를 반환. 접속
            conn.query("SELECT * FROM DEPT", (err,rows)=>{ // 쿼리가 성공하면 콜백함수 // 테이블 요청(쿼리)
                if(err) console.error(err); // 에러 발생시 에러 출력
                console.log("rows",rows); // rows : DEPT 테이블의 줄 하나하나 객체 [{},{},{},{}]
            /*  rows [
                RowDataPacket { DEPTNO: 10, DNAME: 'ACCOUNTING', LOC: 'NEWYORK' },
                RowDataPacket { DEPTNO: 20, DNAME: 'RESEARCH', LOC: 'DALLAS' },
                RowDataPacket { DEPTNO: 30, DNAME: 'SALES', LOC: 'CHICAGO' },
                RowDataPacket { DEPTNO: 40, DNAME: 'OPERATIONS', LOC: 'BOSTON' },
                RowDataPacket { DEPTNO: 50, DNAME: '개발', LOC: '한국_서울' }
            ]*/
                // 📢view 렌더1. Model1 - html 을 동적페이지에 직접 작성
                let html="<table>";
                html+="<thead><tr><td>부서번호</td><td>부서이름</td><td>부서위치</td></tr></thead>"
                for(const low of rows) { // Array 객체 // low : { DEPTNO: 10, DNAME: 'ACCOUNTING', LOC: 'NEW YORK'}
                    html+="<tr>";
                    html+="<td>"+low["DEPTNO"]+"</td>";
                    html+="<td>"+low["DNAME"]+"</td>";
                    html+="<td>"+low["LOC"]+"</td>";
                    html+="</tr>";
                }
                html+="</table>";
                res.write(html);
                res.end(); // 응답완료
                // conn.query() 쿼리가 실행되는 것보다 end()가 먼저 실행이 되므로
                // 되면 write가 실행이 안된다.?
            }); // 쿼리의 콜백함수
        }catch(e){
            console.error(e);
        }
        // 응답헤더
        res.setHeader("content-type","text/html;charset=UTF-8"); // 문서의 형식. 모든 동적페이지에 적용을 해야한다.
        res.write("<h1>model1 은 한페이지를 적어도 3명의 개발자(dba,backend,frontend)가 다 같이 작업합니다! 지옥</h1>");
        res.write("<h2>동적페이지에서 html 을 렌더하면 프론트엔드 개발자가 회사를 그만둘 수 있다</h2>"); <!-- 동적페이지에서 css 작업이 어렵다 --> <!-- html 렌더링 -->
        // res.end();
        // 위치를 conn.query() 쿼리의 콜백함수 안으로 옮기기!!
        // 왜? res.end()가 쿼리의 콜백함수 밖에 있을 때 conn.query() 쿼리가 실행되는 것보다 end()(응답완료)가 먼저 실행이 되므로
        // 쿼리의 화면출력 res.write() 가 실행되기전에 end() 응답완료가 되면 화면출력이 실행안되므로
    } else if(urlObj.pathname==="/deptList.do") {
        // 📢 view 렌더2 : html 을 파일 분리 + fs(파일불러오기) + deptList 를 Object js로 반환 후 클라이언트가 렌더
        // + 파일을 프로미스화된 mysql2 사용
        let data=await fs.readFile("L05DeptList.html"); // readFile : 문자열로 파일을 불러오겠다 // 문자열로 html 파일 불러오기
        const conn=await mysql2.createConnection(mysqlConnInfo); // Object 를 const 로 선언하는건 그냥 개발자 습관
        const [rows,fields]=await conn.query("SELECT * FROM DEPT"); // fields 테이블 구조(desc dept 와 유사) // 동기화시점
        // 👉프로미스 mysql2 - 콜백함수를 사용하지 않고 await 로 바로 동기화 해서 rows, fields 를 불러오기
        // res.write("const deptList="+JSON.stringify(rows)); // Object 를 JSON 문자열(오브젝트명세서) 으로 변환
        res.write(`<script>const deptList= ${JSON.stringify(rows)}</script>`);
        // res 는 응답받은 페이지. L05DeptList.html 에 출력하겠다~
        // 👉DeptList html 의 head 안에 script 로 DEPT JSON 문자열을 넣은것, 변수이름이 deptList
        // => script 로 html 불러오기 - 일반적인 방법은 아니다 // L05DeptList.html 안에서 deptList 객체 사용가능
        console.log(fields) // 테이블 구조 설명
        console.log("rows",rows); // 🍒rows 는 DEPT 테이블 객체(Array 배열객체) [{DETPNO: , DNAME: , LOC: },{},{},...]
        res.write(data);
        res.end();
    } else if(urlObj.pathname=="/deptListPug.do") { // 서버(템플릿엔진) 4개 // node(뷰템플릿 pug),express(pug),톰캣(jsp),spring(thymeleaf)) - 서버 운영 시 하루에 10명정도는 괜찮음. 100명 정도 - 통신사에 돈 내야한다
        // 📢 view 렌더3 : 템플릿엔진 pug 사용
        try {
            // db 접속 후 퍼그에게 데이터 넘기기
            const conn=await mysql2.createConnection(mysqlConnInfo); // mysql 접속객체 반환  // 필요할때마다 mysql 에 접속 => 메모리가 생겼다 삭제된다 한다. -> 해결방법으로 커넥션 풀을 한다. - db에 접속 유지하기 L06CRUD 파일에서 사용!
            const [rows,fields]=await conn.query("SELECT * FROM DEPT");// 접속한 객체로 쿼리 받아오기
            let html=pug.renderFile("L05DeptList.pug",{deptList:rows}); // html 파일로 반환 // 퍼그 렌더링
            // 📍pug 문서에서 html 을 렌더링(출력) 할때 Object 를 참조할 수 있다. ==> 서버사이드 렌더
            // 👉pug 에게 오브젝트 rows(DEPT 테이블.객체 Array) 를 넘길때, 오브젝트니까 key:value 로 쓰는게 좋다!
            // => option{key:value} -> option{deptList:rows} // deptList 는 오브젝트의 key 이름. 내가정한 이름
            // 👉 L05DeptList.pug 에서 deptList(rows 객체) 를 쓸 수 있다.
            res.write(html); // 화면 출력 // pug.renderFile() : pug 템플릿이 html 로 바꿔서 반환
            res.end(); // 응답완료
        }catch(e){
            console.error(e);
            res.statusCode=500;
            res.write("<h1>db나 렌더링에서 오류가 발생했습니다. 다시 시도 500</h1>");
            res.end();
        }
    } else if(urlObj.pathname=="/empListPug.do"){
        try{
            const conn=await mysql2.createConnection(mysqlConnInfo);
            const [rows,fields]=await conn.query("SELECT * FROM EMP"); // 👀데이터 출력하는 방법 다시 확인하기 DATA_FORMAT(HIREDATE,'%Y-%m-%d') HIREDATE
            // const [rows,fields]=await conn.query("SELECT * FROM EMP"); // 👀데이터 출력하는 방법 다시 확인하기 DATA_FORMAT(HIREDATE,'%Y-%m-%d') HIREDATE
            // console.log(rows);   // 튜플, 객체(emp 1명)
            // console.log(fields); // 테이블 구조 정보
            let html=pug.renderFile("L05EmpList.pug",{empList:rows});
            res.write(html);
            res.end();

        }catch(e){
            console.error(e);
        }
    } else if(urlObj.pathname==="L05EmpDetail.do"){ // 💎🍋과제 : 사원 상세정보 연결하기
        const conn=await mysql2.createConnection(mysqlConnInfo);
        const [rows,f]=await conn.query("SELECT * FROM EMP WHERE EMPNO=?", [params.empno]);
        let html=pug.renderFile("L05EmpDetail.pug",{emp:rows[0]});
        res.write(html);
        res.end();
    } else {
        res.setHeader("content-type","text/html;charset=UTF-8"); <!-- html 파일로 응답하기 -->
        res.statusCode=404;
        res.write("<h1>404 존재하지 않는 리소스 입니다.</h1>"); <!-- 잘못된 주소 -->
        res.end();
    }

    // 템플릿 엔진 == 서버사이드 렌더링
    // pug 노드서버사이드 렌더링 템플릿엔진
    // 퍼그 - 문법이 귀엽다 / 코가짧다는 의미는 html 을 단축해서 쓴다

})