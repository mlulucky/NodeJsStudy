// CreateReadUpdateDelete // create == inset // read == select
// 유저에게 db를 제어할 수 있는 인터페이스(모델,서비스)
// 유저가 직접 db에 접속해서 데이터를 조작하면 안되나요? 안됩니다.
// 1. 데이터 조작의 인터페이스를 제한할 수 없다. (보안)
// 2. 불필요한 정보가 많아서 유저가 어려워서 이용하지 않는다. (서비스)
// 3. 유저가 sql 을 배워야 한다. (어려움)
// 4.....
// ex) 앱 확장성 - ex) 당근마켓 - 중고차, 부동산, .. 분리 ~! (정보가 많으면 어려움) (분리하면 유저들이 흩어진다)

// create, alter, drop :
// table 을 생성하거나 구조를 바꾸거나 삭제하는 명령어(DDL)
// update,delete,insert(DML),select(DQL 질의어) :
// table 에 데이터를 추가하거나 삭제 또는 수정 조회 서비스
// es6 부터는 var 사용을 권장하지 않는다. (변수는 지역,전역 구분이 있어야 하는데, var 은 무조건 전역)

// var http 모듈은 전역변수라서 var로도 쓸 수 있다. // const 로 쓰면 값이 바뀌지 않는다. // 클래스 바깥은 어차피 전역
// v8 또는 jvm 실행될때 메모리에 등록하는 것 : 백그라운드 (쓰든안쓰든 무조건 등록되는거)
// java 는 java.lang.*, java.util.* 패키지가 가지고 있는 라이브러리가 많은편 => 패키지 전체를 import 하면 무거워진다.
// nodejs 는 백그라운드에서 가지고 있는 모듈이 적은 편이라 빠르지만 모듈 등록이 귀찮다.
// 🍒웹앱서버 배우면 -> 다른 웹앱서버는 사용법만 익히면 바로 할수 있는 수준이 되기를
// 매일매일 공부 배워야한다 개발자라는 직업 - 쓰는게 매일매일 바뀐다 => 지친다..
// 웹앱서버 원리를 알면 다른 웹앱서버 공부는 재밌다.
// node.js (원시적인 웹앱서버 - 자동으로 하는 것이 없다 - 서버가 이렇게 돌아가는구나를 알게된다)
// 요즘 나오는 웹앱서버는 다 자동으로 된다. (노드js를 배우면 자동으로 뭘 해주는거를 안다)
// nodejs 를 잘하면 다른 웹앱서버를 쉽게 배운다.


// 📍서버만들기 준비! 모듈 import
const http=require("http"); // http 통신과 통신 // 서버를 생성하고 클라이언트의 요청을 처리
const url=require("url");
const querystring=require("querystring");
const fs=require("fs/promises"); // 프로미스화 된 파일시스템
const mysql=require("mysql2");   // 프로미스화 된 mysql
const pug=require("pug");

// nodejs 서버에 리소스 요청시 하는데 요청 이벤트로 처리
const server=http.createServer(); // 서버반환, 서버생성
server.listen(8888,()=>{ // 서버가 만들어질때 // 서버가 만들어지면 안내문을 만들어줄수 있다 // 콜백함수
    console.log("http://localhost:8888 SCOTT CRUD 를 제공하는 서버"); // 서버 반환 및 생성시, 안내문 로그
});
const mysqlConInfo={ // mysql 접속정보
    host:"localhost",
    port: 3306,
    user: "root",
    password: "mysql123",
    database: "SCOTT"
}
// 📍커넥션 풀
const createPool=mysql.createPool(mysqlConInfo); // 커넥션 풀 생성 , 서버에서 mysql 접속을 계속 유지
const pool=createPool.promise(); // promise 객체를 쓸수있다. // 커넥션 풀 프로미스화
// 클라이언트(브라우저)가 페이지 요청이 들어오면 서버가 매번 db에 접속해서 통신 => 비효율적 (const conn=mysql.createConnection(mysqlConnInfo);)
// 해결방법 - 커넥션 풀! (커넥션을 이미 맺고 있다 ex) 전화를 안끊고 있는것과 같다.)
// mysql createPool - 최대로 얼마나 기다릴지, 통신을 제한할지 옵션이 있다. - 계속 전화를 걸고있으면 그러니까
// 쓰는 방법은 pool.query

// nodemon 실행해주는 라이브러리.
// nodejs 는 웹앱서버
// server.on 서버 생성을 듣겠다~ // 🍋nodejs 사용하는 이유 : 이벤트로 멀티스레드를 만드는 성량이 좋다
server.on("request", async (req,res)=>{ // 서버에 요청이벤트가 발생하면 무언가를 하겠다~
    const urlObj=url.parse(req.url); // 요청에 따라서 url 나누겠다
    const params=querystring.parse(urlObj.query);
    const urlSplits=urlObj.pathname.split("/"); // 정적리소스, 동적리소스 구분
    // 📍정적리소스 - 파라미터(x)
    if(urlSplits[1]==="public"){
        if(urlSplits[2]==="js"){ // js 파일이면
            res.setHeader("content-type","application/javascript");// 응답헤더
        } else if(urlSplits[2]==="css"){
            res.setHeader("content-type","text/css");
        } else if(urlSplits[2]==="image"){
            res.setHeader("content-type","image/jpeg");
        } else if(urlSplits[2]==="html"){
            res.setHeader("content-type","text/html;UTF-8");
        }
        try {
          // 📍파일을 불러오는데 오류가 발생할 수 있어서 에러처리 // 주소가 잘못되었을 때 리소스 요청을 잘못한 것, 통신에 실패했을 때
          // fs : 서버가 실행되고 있는 컴퓨터를 기준으로 파일을 검색
          // 상대경로 / : 컴퓨터의 root 경로(c:// c 드라이버)를 기준으로 파일을 검색
          // 상대경로 . (== ./ ) : 서버가 실행되고 있는 위치(폴더)를 기준으로 파일을 검색 // .파일이름 (== ./파일이름)
          let data=await fs.readFile("."+urlObj.pathname); // "." 상대경로 // 문자열이 된 파일 이 온다. // 서버가 실행되는 폴더 nodejsStudy 를 기준으로 파일을 찾는다 // "." 서버가 컴퓨터의 위치를 기준으로 파일을 찾는다 // 💎주소 무조건 상대경로로 하기!! "."
          //🍋 예) "."+urlObj.pathname -> ./public/img/d.jpeg
          // 상대경로 -> 서버 L06CRUD 파일이 실행되고 있는 폴더 NodeJsStudy 를 기준으로 파일을 찾는것
          // ./ 은 NodeJsStudy 폴더와 같다
          res.write(data); // 불러온 url 리소스를 화면에 출력(readFile 은 html 파일을 문자열로 변환)
          res.end();
        } catch(e) { // 주소가 잘못되었을 때 리소스 요청을 잘못한 것
            res.statusCode=404;
            res.end();
        }
    } else { // 📍동적리소스 (public 정적리소스가 아니면 모두 동적리소스)
        if(urlObj.pathname==="/") {  // 문자열끼리 비교 // "1"==="1" true // 1=="1" true // 타입이 같은데 굳이 == 을 할 이유는 없다 // == 은 타입이 다를때 값을 비교하는 연산으로 주로 쓰인다
            let html=pug.renderFile("./templates/index.pug"); // html 로 렌더 // "." 상대경로로 찾기
            res.write(html); // pug html 렌더 (문자열)
            // console.log(html);
            res.end();
        } else if(urlObj.pathname==="/empList.do"){
            try{
                const [rows,f]=await pool.query("SELECT * FROM EMP");
                let html=pug.renderFile("./templates/empList.pug",{empList:rows});
                // tableNode.rows[] : 해당 테이블의 몇번째 tr
                // rows 는 EMP 테이블 * 전체 의 행(가로, 튜플,객체)
                // (table의 행 (row, 가로) == 튜플, 객체)
                // tr 하나가 객체 1개
                // 배열의 index 는 자료가 순서대로 (붙어)있는 것을 순서를 가져오는 것.
                // 테이블도 배열이다! index 자료 순서로 값을 참조. 가져올 수 있다.! rows[0], rows[1]
                // rows.length 는 배열.자료의 길이 자료의 값의 개수
                // 렌더할때 기준이 rows // pug에서 파일을 렌더할 때, empList 객체를 쓸 수 있다. rows에 key 값을 넘긴다
                // res.write(JSON.stringify(rows)); // res.write() : 문자열만 출력할 수 있다. // rows 는 객체
                res.write(html);
                res.end();
            }catch(e) {
                console.error(e);
            }
        } else if(urlObj.pathname==="/empDetail.do"){
            let empno=Number(params.empno); // undefined, 7786아 -> NaN
            // => params.empno == 파라미터 empno의 값value => 정수로 형변환 (파라미터는 원래 문자열이다)
            // 만약 empno 가 없다? 이페이지는 동작할 수 없다.
            // 400 에러 : 요청할 때 꼭 필요한 파라미터를 보내지 않았다. 필요한 파라미터가 없다.
            if(Number.isNaN(empno)) { // 파라미터가 NaN 인 경우 실행
                res.statusCode=400;
                res.write("<h1>해당 페이지에 꼭 필요한 파라미터를 보내지 않았습니다!</h1>");
                res.end();
                return; // 서버 응답이 완료되어도 밑에 코드가 실행될 수도 있어서 콜백함수를 종료함 // 👀return 과 가장 가까운 콜백함수를 종료 - 여기선 콜백함수 server.on("request", async (req,res)=>{})  // return 을 포함한 가까운 메소드 종료 - if문 종료
                // 개발자들은 블럭에 블럭을 싫어한다. -> if else 로 하기보다 return 으로 구분.!
            }
            // if(Number.isNaN(empno)) 의 else 블럭 역할
            let sql="SELECT * FROM EMP WHERE EMPNO=?"; // ? : preparedStatement //  노드js, 자바 mysql 공통 // sql 해킹을 막기위해서 사용 물음표에 파라미터를 셋팅(대입)하는 것
            const [rows,f]=await pool.query(sql,[empno]);  // 물음표 첫번째에 empno 파라미터를 셋팅
            // pool.query 쿼리에 preparedStatement(?물음표에 파라미터 셋팅) 기능이 포함
            // pol.query 는 SELECT , SELECT 의 결과(rows)는 📍무조건 배열이다.
            // 물음표 위치에 따라 셋팅하는 방법 -> values:[empno, deptno, ename] 이런식으로
            // rows : 파라미터가 empno(Number(params.empno)) 에 해당하는 객체. ex) 사번 7902 해당하는 사원 1명. 배열이라서 rows[0]
            // mysql pool.query 는 결과를 오브젝트로 반환한다 (mysql 에서 응답받은 responseText 문자열을 오브젝트로 파싱하는 과정이 포함되있다) // 그냥 mysql 에서 파일 불러오는 것은 파싱을 해줘야 한다.
            // res.write(JSON.stringify(rows[0])); // rows[0] : 📍무조건 SELECT 의 결과는 배열이다.
            // res.end();

            if(rows.length==0) { // 파라미터 empno 에 해당하는 객체(사원)가 없는 경우
                res.writeHead(302,{location:"/empList.do"}); // redirect 페이지 되돌리기
                res.end();
                return;
            }
            let html=pug.renderFile("./templates/empDetail.pug",{emp:rows[0]}); // 👀rows ???!!! // pug 파일에 객체 emp 를 전달하는 것.
            // 📍pug.renderFile 은 html 을 문자열로 렌더(출력)한다
            // 👉pug 에게 오브젝트 rows(empno가 해당하는 객체)를 s넘김
            // => option{key:value} -> option{emp:rows[0]} // emp 는 오브젝트의 key 이름. 내가정한 이름
            // 👉 empDetail.pug 파일에서 emp(rows[0] 객체) 를 쓸 수 있다.
            // =>예) url 파라미터 empno가 7369일때 rows[0] => {"EMPNO":7369,"ENAME":"SMITH","JOB":"CLERK","MGR":7902,"HIREDATE":"1980-12-16T15:00:00.000Z","SAL":800,"COMM":null,"DEPTNO":30}
            res.write(html);
            res.end();
        }else if(urlObj.pathname==="/empUpdate.do"&&req.method==="GET"){ // 🍒from 보이는 양식 // GET 방식 : 페이지 전환시 쿼리스트링으로 넘어가는 것!
            let empno=Number(params.empno); // undefined, 7786아 -> NaN
            if(Number.isNaN(empno)) { // 파라미터가 NaN 인 경우 실행
                res.statusCode=400;
                res.write("<h1>해당 페이지에 꼭 필요한 파라미터를 보내지 않았습니다!</h1>");
                res.end();
                return;
            }
            // if(Number.isNaN(empno)) 의 else 블럭 역할
            let sql="SELECT * FROM EMP WHERE EMPNO=?";
            const [rows,f]=await pool.query(sql,[empno]); // query 질의. SELECT
            let html=pug.renderFile("./templates/empUpdate.pug",{emp:rows[0]});   // rows 의 0번째를 퍼그한테 넣는다. empno 라는 이름을 지어줘야 한다.
            res.write(html); // 📍무조건 SELECT 의 결과는 배열이다.
            res.end();
        } // 😃 업데이트 페이지생성
        else if(urlObj.pathname==="/empUpdate.do"&&req.method==="POST"){ // 🍒form 제출하는 액션
            //👉POST 방식 // data 를 수정하는 동적리소스 (액션페이지)
            //👉execute DML 을 실행할 때는 오류가 종종 발생하기 때문에 꼭 예외처리를 하세요! - 글자가 길거나, 한글 깨짐 등..
            //👉POST 로 오는 파라미터는 의 요청헤더(네트워크의 Headers)의 본문을 해석해서 받아와야 한다. 왜? POST url 에 파라미터가 없어서
            //👉querystring 은 url 에 오는 파라미터만 객체로 파싱중 // GET 방식은 url 에 포함된 쿼리로 파라미터를 객체화
            // => 그냥 params 로는 파라미터가 안 받아와 진다  // const params=querystring.parse(urlObj.query);
            // 📢POST 통신 방식일때 파라미터 불러오기
            let postquery="";
            let update=0; // 0이면 업데이트 실패, 1이면 업데이트 성공 (setHeader에서 affected Rows 의 값)
            req.on("data",(param)=>{ // 콜백함수, 매개변수로 파라미터가 넘어온다. // 파라미터가 여러개면 여러번 실행
                //🍋req.on(event:"data") : 요청헤더(검사창의 네트워크에서 확인가능)의 문서(데이터)를 읽는 이벤트
                // POST 로 넘긴 querystring 불러오기
                postquery+=param; // 넘어온 param 파라미터들을 더하기

            }); // req.on 은 *비동기코드 => req.on(event "end") 와 동기화 시키기 // req.on(event:"data")가 실행이 종료된 후 실행 되도록!
            req.on("end",async ()=>{ // *async & await 비동기코드 -> 동기화 // 문서가 다 받아와져서 end 시점 : 다불러온 시점. 쿼리스트링이 다 담겨 있다. =>  쿼리실행하기!
                //🍋req.on(event:"end") : 쿼리스트링을 다 받아온 지점. 요청헤더의 문서를 모두 다 읽으면 발생하는 이벤트 // req.on() 비동기 코드 -> 코드 동기화
                // POST 파라미터를 다 불러온 시점에서 쿼리 실행!!
                const postPs=querystring.parse(postquery); //📍POST 파라미터 // 쿼리스트링이 존재한다.
                console.log("postquery",postquery); // affetrows, changerows 1 (성공했음)
                console.log("postPs",postPs)
                // postquery : 포스트방식일때, 요청헤더로 넘어간 파라미터들
                // => empno=7369&ename=SMITH&job=CLERK&sal=800&comm=&hiredate=&mgr=7902&deptno=30
                // postPs : postquery 포스트쿼리를 객체로 변환 (JSON - 오브젝트 명세서(문자열))
                // => {empno: '7369', ename='SMITH',....}

                try { // 파라미터에 값 대입(+예외처리)
                    // 업데이트(수정) EMPNO 사번이 ?무엇인 객체의 이름,급여,상여금,직업,상사,부서번호를 수정!
                    for(let key in postPs) { // 📍input 의 value "" => null 값을 기대하지만 문자열 공백이 온다. (mgr, deptno, comm => null)
                        if(postPs[key].trim()=="") postPs[key]=null; // 값이 공백인 경우 => null 로 변경 // 등록시 값을 입력하지 않는 경우 문자열 처리되는걸 방지
                    } // trim 앞뒤 공백 제거.

                    let sql=`UPDATE EMP SET ENAME=?,SAL=?,COMM=?,JOB=?,MGR=?,DEPTNO=? WHERE EMPNO=?` // ? 물음표 : 파라미터를 대입하려고
                    const [result]=await pool.execute(sql,[postPs.ename,postPs.sal,postPs.comm,
                        postPs.job,postPs.mgr,postPs.deptno,postPs.empno]) // ?물음표 순서대로 파라미터에 값 대입 // 네트워크에 있는 파라미터의 키값 - payload 에 있는 파라미터들 . // 하나만 반환 // DML
                    // pool.execute(sql,values[파라미터1, 파라미터2,...])sql 에 물음표? 파라미터에 파라미터를 담겠다(대입)
                    //📍pool.execute 결과 반환 : sql 쿼리의 물음표? 에 파라미터 대입한 결과
                    // pool.query : SELECT // pool.execute : DML (데이터 조회(SELECT), 추가(INSERT), 변경(UPDATE), 삭제(DELETE) 등의 작업)
                    // [] 매개변수를 받는 문법 (execute 콜백함수가 여러개의 매개변수를 가져서)
                    console.log("result",result); // affectedRows 체크
                    update=result.affectedRows; // 업데이트 성공여부 값 0 또는 1 대입 // == changedRows 값으로 써도 된다.
                    // execute : mysql 프라미스 객체(동기화)
                }catch(e){
                    console.error(e);
                }
                // 오류없이 잘 실행되고 update 도 잘 되면 update=1
                if(update>0) { // 업데이트가 성공되면
                    // 302 : redirect (이 페이지가 직접 응답하지 않고 다른 페이지가 응답하도록 다시 서버 내부에서 요청)
                    // writeHead : 응답헤더
                    res.writeHead(302,{location:"/empDetail.do?empno="+postPs.empno}); // 성공하면 상세페이지로 이동// 응답헤더 정의
                    res.end();
                }else { // 업데이트가 실패하면
                    res.writeHead(302,{location:"/empUpdate.do?empno="+postPs.empno}); // 업데이트(수정폼) 페이지로 이동
                    res.end();
                }
            });
        }else if(urlObj.pathname==="/empInsert.do"&&req.method==="GET"){ // 📍GET : 등록 form // 👀&&req.method==="GET" 안쓰면 겟 포스트를 다 받는다.
            let html=pug.renderFile("./templates/empInsert.pug"); // 상대경로 "." 표시하기!
            res.write(html);
            res.end();
        }else if(urlObj.pathname==="/empInsert.do"&&req.method==="POST"){ // 📍POST : 등록 action
            let postQuery="";
            req.on("data",(p)=>{ // 포스트 파라미터 불러오기
                postQuery+=p; // POST 파라미터 담기
            })
            req.on("end",async()=>{ // 파라미터 불러온뒤 req.on 비동기실행 -> 동기실행 // 이벤트가 여러번 발생할수있어서 event data 와 end 를 분리시켜서 한다.
                const postPs=querystring.parse(postQuery); // POST 파라미터 객체로 파싱 // 문자열 -> 오브젝트
                for(let key in postPs) { // 📍input 의 value "" => null 값을 기대하지만 문자열 공백이 온다. (mgr, deptno, comm => null)
                    if(postPs[key].trim()=="") postPs[key]=null; // 값이 공백인 경우 => null 로 변경 // 등록시 값을 입력하지 않는 경우 문자열 처리되는걸 방지
                } // trim 앞뒤 공백 제거.
                let sql=`INSERT INTO EMP (EMPNO, ENAME, JOB, MGR, HIREDATE, SAL, COMM, DEPTNO) 
                                        VALUE (?,?,?,?,NOW(),?,?,?)`; // 세미콜론 밖에서 쓰기
                // 입사일을 now() 로 한 이유 데이터값으로 안하고 now 로하려고. // ? 물음표하면 날짜 선택해서 받아와야한다.

                let insert=0;
                // 공백은 문자처리 된다. -> 공백을 null 처리 해야한다.
                try { // 📍execute : DML 오류처리하기!
                    const [result]=await pool.execute(sql,[postPs.empno,postPs.ename,postPs.job,postPs.mgr,
                                                  Number(postPs.sal),postPs.comm,postPs.deptno]); // ? 물음표 파라미터 셋팅
                    insert=result.affectedRows;
                    // Number 로 감싸야한다.
                    // result 결과가 넘어온다. 성공하면 affectedRows 가 넘어온다. 1
                    // res.write(JSON.stringify(result)); // 없는 상사와 없는 부서, PK는 수정 할 수 없다.  // 참조의 무결성
                }catch(e){
                    console.error(e)
                }
                if(insert>0) { // 등록 성공 시 -> 사원리스트 페이지로 이동
                    res.writeHead(302, {location: "/empList.do"});
                    res.end();
                }else { // 실패하면 다시 -> insert 폼으로 이동
                    res.writeHead(302, {location: "/empInsert.do"});
                    res.end();
                }
                // res.write(JSON.stringify(postPs)); // 오브젝트 -> 문자열
                // res.end();
            });
        }else if(urlObj.pathname==="/empDelete.do"){ // 삭제 액션페이지
            let empno=Number(params.empno); // 삭제 성공하면
            if(Number.isNaN(empno)) { // NaN 인경우
                res.statusCode=400;
                res.write("<h1>해당 페이지에 꼭 필요한 파라미터를 보내지 않았습니다!</h1>")
                res.end();
                return;
            }
            let sql="DELETE FROM EMP WHERE EMPNO=?"
            let del=0; // delete : 필드를 삭제하는 연산자. 예약어
            try{ // 삭제하다가 오류뜰수도 있어서 오류처리 - 동시에 삭제했을 때 - 한 페이지에서 삭제했는데 다른 페이지에서 다시 삭제눌렀을때 없는 데이터
                const [result] =await  pool.execute(sql, [empno]); // 콜백함수 매개변수 1개이면 [] 안써도 됨
                del=result.affectedRows;
            }catch(e){
                console.error(e);
            }
            if(del>0){
                res.writeHead(302,{location:"/empList.do"});
                res.end();
            }else {
                res.writeHead(302,{location:"/empUpdate.do?empno="+params.empno});
                res.end();
            }
            // 삭제 실패하면

        }else {
            res.statusCode=404; // 디폴트 기본값은 200. 성공시 안써줘도 된다.
            res.setHeader("content-type","text/html;charset=UTF-8");
            res.write("<h1>존재하지 않는 페이지 입니다. 404</h1>");
            res.end();
        }
    }

// 절대경로
// 예) c:\\ ~~
// http://
// http 에 공개키라는 보안키가 추가되면 https - 보안이 강화된 http 통신

// 상대경로
// "/" root 를 기준으로 상대경로
// 예) c드라이브에서 상대경로 : c://a/b/c/d.html             "/z.html" => c://z.html
// 예) 유저경로에서 상대경로  : c://user/경민/c/d.html        "/z.html" => c://user/경민/z.html (mac)

// 예)http://naver.com/a/b/c/d.html  "/z.html" =>  http://naver.com/z.html (서버주소까지 찾아간다.)
// "." or "./" 현재 폴더를 기준으로 하는 상대경로 (a폴더/b폴더/c폴더/d.html)
// 예)http://naver.com/a/b/c/d.html  "./a.html" => http://naver.com/a/b/c/a.html



})



