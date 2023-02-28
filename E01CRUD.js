//📍서버만들기 준비! - 모듈 import 불러오기
const http=require("http");// http 서버. 통신
const url=require("url"); // url 분리 + 객체로 만들기 위해. 나누기 위해
const querystring=require("querystring"); // 쿼리스트링 파라미터 나누기+객체
const fs=require("fs/promises"); // 프로미스화 된 파일시스템
const mysql=require("mysql2"); // 프로미스화 된 mysql
const pug=require("pug");
const json = require("./idCheck.json"); // 뷰(html)템플릿 엔진 퍼그

//📍서버생성
const server=http.createServer(); // http 서버 생성
server.listen(8887, ()=>{ // 작업할 서버주소 생성 // 해당 서버주소를 듣고있다.
    console.log("http://localhost:8887 SCOTT CRUD 를 제공하는 서버");
}); // 동일한 포트번호를 만드는 경우. 한쪽 포트번호는 종료를 해야 사용가능
//📍mysql 접속정보
const mysqlConInfo={
    host:"localhost",
    post:3306,
    user:"root",
    password:"mysql123",
    database:"SCOTT"
}
//📍커넥션 풀 - 서버가  mysql db 와 접속 유지
const createPool=mysql.createPool(mysqlConInfo);
const pool=createPool.promise();

//📍server.on 서버에서 발생한 요청 request 발생시 실행하는 처리 영역
server.on("request", async (req,res)=>{ // 서버 콜백함수
    const urlObj=url.parse(req.url); // url 오브젝트로 형변환
    const params=querystring.parse(urlObj.query); // url 쿼리스트링을 객체로 변환
    const urlSplits=urlObj.pathname.split("/"); // 정적 리소스, 동적리소스 구분
    // 정적리소스 - 파라미터(X)
    if(urlSplits[1]==="public"){
        if(urlSplits[2]==="js") { // js 파일이면
            res.setHeader("content-type","application/javascript"); // 자바스크립트로 응답
        } else if(urlSplits[2]==="css") {
            res.setHeader("content-type","text/css");
        } else if(urlSplits[2]==="image"){
            res.setHeader("content-type","image/jpeg");
        }
        // 예외처리 - 주소가 잘못되었을 떄, 통신에 실패했을떄
        try{
            // fs : 서버가 실행되고 있는 컴퓨터를 기준으로 파일을 검색
            // 상대경로 . (== ./ ) : 서버가 실행되고 있는 위치(폴더)를 기준으로 파일을 검색 // .파일이름 (== ./파일이름)
            let data= await fs.readFile("."+urlObj.pathname);
            res.write(data);
            res.end();
        }catch(e){
            res.statusCode=404;
            res.end();
        }
    }
    // 동적리소스 (public 정적리소스가 아니면 모두 정적리소스)
    else {
        if(urlObj.pathname==="/") {
            //😃인덱스페이지
            let html=pug.renderFile("./templates/index.pug");
            res.write(html);
            res.end();
        }else if(urlObj.pathname==="/empList.do") {
            //😃empList 리스트 페이지
            try {
               const [rows,f]=await pool.query("SELECT * FROM EMP");
               let html=pug.renderFile("./templates/empList.pug", {empList:rows}); // 👀
                res.write(html);
                res.end();
            }catch(e){
                console.error(e);
            }
        }else if(urlObj.pathname==="/empDetail.do"){
            // 😃empDetail 상세 페이지
            let empno=Number(params.empno);  // 파라미터 정수 형변환
            if(Number.isNaN(empno)) { // 파라미터가 NaN인 경우
                res.statusCode=400;
                res.write("<h1>해당 페이지에 꼭 필요한 파라미터를 보내지 않았습니다!</h1>");
                res.end();
                return;
            } // 파라미터가 NaN이 아닌 경우
            let sql="SELECT * FROM EMP WHERE EMPNO=?";
            const [rows,f]=await pool.query(sql,[empno]); // 👀
            let html=pug.renderFile("./templates/empDetail.pug",{emp:rows[0]});
            res.write(html);
            res.end();
        }else if(urlObj.pathname==="/empUpdate.do"&&req.method==="GET"){ //📍form 양식, 페이지 html
            //😃empUpdate 수정 페이지
            let empno=Number(params.empno);
            if(Number.isNaN(empno)) { // 파라미터 NaN 인 경우
                res.statusCode=400;
                res.write("<h1>해당 페이지에 꼭 필요한 파라미터를 보내지 않았습니다!</h1>")
                res.end();
                return;
            } // 파라미터 NaN 이 아닌 경우
            let sql="SELECT * FROM EMP WHERE EMPNO=?";
            const [rows,f]=await  pool.query(sql,[empno]);
            let html=pug.renderFile("./templates/empUpdate.pug",{emp:rows[0]});
            res.write(html);
            res.end();
        } else if(urlObj.pathname==="/empUpdate.do"&&req.method==="POST"){ //📍form 액션. 정보 전송
            let postquery=""; // POST 방식의 파라미터
            let update=0; // 업데이트 성공여부 확인용 변수
            req.on("data",(param)=>{ // 파라미터 불러오기
                postquery+=param; // POST 파라미터 담기
            });
            req.on("end",async ()=>{ // 파라미터 불러 온뒤 . req.on 비동기 -> 동기 실행
                console.log(postquery);
                const postPs=querystring.parse(postquery); // POST 파라미터 객체 파싱
                console.log(typeof postPs.comm,postPs.comm); // comm - string 타입 // 모든 파라미터는 문자열
                console.log((postPs.comm.trim()==="")?null:parseFloat(postPs.comm))
                //"" => null
                try { // 파라미터에 값 대입 (+예외처리)
                    // boolean ("" 0 null undefined NaN) => false
                    console.log(!"");
                    let sql=`UPDATE EMP SET ENAME=?,SAL=?,COMM=?,JOB=?,MGR=?,DEPTNO=?,HIREDATE=? WHERE EMPNO=?`
                    const [result]=await pool.execute(sql,[ // 매개변수 값 대입
                        postPs.ename,
                        (postPs.sal.trim()==="")?null:parseFloat(postPs.sal), // 공백 null 처리 // 넘어오는 파라미터가 문자열이라서. 공백도 문자열이다
                        (postPs.comm.trim()==="")?null:parseFloat(postPs.comm), // 공백 null 처리
                        postPs.job,
                        (!postPs.mgr.trim())?null:parseInt(postPs.mgr), // 공백 null 처리 // 공백을 제거했을때 공백이면 ?
                        (postPs.deptno.trim()=="")?null:parseInt(postPs.deptno), // 공백 null 처리
                        postPs.hiredate,
                        parseInt(postPs.empno)]) // empno 는 pk. 무조건 입력해야하는 값
                        // DML // execute : mysql 프라미스 객체(동기화)
                    console.log(result);
                    update=result.affectedRows;
                }catch(e){
                    console.error(e);
                }
                // 오류없이 잘 실행되고 update 도 잘되면 update=1
                if(update>0){ // 업데이트가 성공되면
                    // 302 : redirect (이 페이지가 직접 응답하지 않고 다른 페이지가 응답하도록 다시 서버 내부에서 요청)
                    res.writeHead(302,{location:"/empDetail.do?empno="+postPs.empno});
                    res.end();
                } else{ // 업데이트가 실패하면
                    res.writeHead(302,{location:"/empUpdate.do?empno="+postPs.empno});
                    res.end();
                }
            });
        }else if(urlObj.pathname==="/empInsert.do"&&req.method==="GET"){
            //😃empInsert 등록 페이지
            let html=pug.renderFile("./templates/empInsert.pug");
            res.write(html);
            res.end();
        }else if(urlObj.pathname==="/empInsert.do"&&req.method==="POST"){
            let postQuery="";
            req.on("data",(p)=>{ // POST 파라미터에 값 대입.
                postQuery+=p;
            })
            req.on("end",async()=>{
                const postPs=querystring.parse(postQuery);
                for(let key in postPs) {
                    if(postPs[key].trim()=="") postPs[key]=null; // input value 공백"" => null 처리
                }
                let sql=`INSERT INTO EMP (EMPNO, ENAME, JOB, MGR, HIREDATE, SAL, COMM, DEPTNO)
                                            VALUE (?,?,?,?,?,?,?,?)`;
                let insert=0; // 등록 성공여부 확인용 변수
                try {
                    const [result]=await pool.execute(sql,
                        [postPs.empno,
                               postPs.ename,
                               postPs.job,
                               postPs.mgr,
                               postPs.hiredate,
                               Number(postPs.sal),
                               postPs.comm,
                               postPs.deptno
                        ]); // 물음표? 에 파라미터 대입
                    insert=result.affectedRows;
                }catch (e) {
                    console.error(e);
                }
                if(insert>0){ // 등록 성공
                    res.writeHead(302,{location:"/empList.do"});
                    res.end();
                }else{ // 등록 실패
                    res.writeHead(302,{location:"/empInsert.do"});
                    res.end();
                }
            });
        } else if(urlObj.pathname==="/empDelete.do") {
            //😃empDelete 삭제 페이지
            let empno=Number(params.empno);
            if(Number.isNaN(empno)) { // NaN 인경우
                res.statusCode=400;
                res.write("<h1>해당 페이지에 꼭 필요한 파라미터를 보내지 않았습니다!</h1>")
                res.end();
                return;
            }
            let sql="DELETE FROM EMP WHERE EMPNO=?"
            let del=0; // 삭제 성공여부 체크
            try{
                const [result]=await pool.execute(sql,[empno]);
                del=result.affectedRows;
            }catch(e){
                console.error(e);
            }
            if(del>0){ // 삭제 성공
                res.writeHead(302,{location:"/empList.do"});
                res.end();
            }else{ // 삭제 실패
                res.writeHead(302,{location:"/empUpdate.do?empno="+params.empno});
                res.end();
            }
        } else if(urlObj.pathname==="/deptList.do") {
            //😃deptList 조회 페이지
            try { // pool.query : SELECT
                const [rows,f]=await pool.query("SELECT * FROM DEPT");
                let html=pug.renderFile("./templates/deptList.pug", {deptList:rows}); // 👀
                // 🍋rows 는 해당하는 sql DEPT 테이블의 전체 한줄한줄 전부를 담은 것.
                // 🍋deptList 는 변수명. rows 안에는 DEPT 테이블이 들어가 있다.
                res.write(html);
                res.end();
            }catch(e){
                console.error(e);
            }
        }else if(urlObj.pathname==="/deptDetail.do"){
            //😃deptDetail 상세 페이지
            let deptno=Number(params.deptno);  // 파라미터 정수 형변환
            if(Number.isNaN(deptno)) { // 파라미터가 NaN인 경우
                res.statusCode=400;
                res.write("<h1>해당 페이지에 꼭 필요한 파라미터를 보내지 않았습니다!</h1>");
                res.end();
                return;
            } // 파라미터가 NaN이 아닌 경우
            let sql="SELECT * FROM DEPT WHERE DEPTNO=?";
            const [rows,f]=await pool.query(sql,[deptno]); // 👀 sql DEPTNO=? 파라미터 뒤에 파라미터 deptno 를 넣은 그 값이 rows
            let html=pug.renderFile("./templates/deptDetail.pug",{dept:rows[0]});
            // 🍋rows 는 해당하는 deptno 파라미터와 동일한 deptno를 가진 객체. deptno 는 유일한 값이므로 값이 하나이기 때문에 rows[0] 이라고 표현
            // => 파라미터와 맞는 deptno 를 가진 객체가 html 문자열로 출력된다.
            res.write(html);
            res.end();
        }else if(urlObj.pathname==="/deptUpdate.do"&&req.method==="GET") { // form 양식
            //😃deptUpdate 상세 페이지
            let deptno=Number(params.deptno);
            if(Number.isNaN(deptno)) { // NaN 인경우
                res.statusCode=400;
                res.write("<h1>해당 페이지에 꼭 필요한 파라미터를 보내지 않았습니다!</h1>")
                res.end();
                return;
            }
            let sql="SELECT * FROM DEPT WHERE DEPTNO=?";
            const [rows,f]=await pool.query(sql,[deptno]);
            // html 문서에는 html 파일이라는 양식이라고 head 안에 정보가 들어가 있기 때문에
            // 응답헤더로 어떤 파일양식으로 응답하겠다라고 명시하지 않아도 된다.
            let html=pug.renderFile("./templates/deptUpdate.pug",{dept:rows[0]});
            res.write(html);
            res.end();
        }else if(urlObj.pathname==="/deptUpdate.do"&&req.method==="POST"){ // form 액션. 정보 전송
            let postquery=""; // POST 파라미터 불러올 변수선언
            let update=0;
            req.on("data",(param)=>{
                postquery+=param;
            });
            req.on("end",async ()=>{
                console.log(postquery);
                const postPs=querystring.parse(postquery);
                console.log(postPs);
                try {
                    let sql=`UPDATE DEPT SET DNAME=?,LOC=? WHERE DEPTNO=?`
                    const [result]=await pool.execute(sql,[postPs.dname,postPs.loc,postPs.deptno]);
                    // DEPTNO 부서번호는 pk(primary key) 대표 키 - pk를 참조하는 사원이 있는 경우 삭제할 수 없다. - 참조의 무결성
                    console.log(result);
                    update=result.affectedRows;
                }catch(e){
                    console.error(e);
                }
                // 오류없이 잘 실행되고 update 도 잘되면 update=1
                if(update>0){ // 업데이트가 성공되면
                    // 302 : redirect (이 페이지가 직접 응답하지 않고 다른 페이지가 응답하도록 다시 서버 내부에서 요청)
                    res.writeHead(302,{location:"/deptDetail.do?deptno="+postPs.deptno});
                    res.end();
                } else{ // 업데이트가 실패하면
                    res.writeHead(302,{location:"/deptUpdate.do?deptno="+postPs.deptno});
                    res.end();
                }
            });
        }else if(urlObj.pathname==="/deptInsert.do"&&req.method==="GET"){
            //😃deptInsert 등록 페이지
            let html=pug.renderFile("./templates/deptInsert.pug");
            res.write(html);
            res.end();
        }else if(urlObj.pathname==="/deptInsert.do"&&req.method==="POST"){
            let postQuery="";
            req.on("data",(p)=>{
                postQuery+=p;
            })
            req.on("end",async()=>{
                const postPs=querystring.parse(postQuery);
                for(let key in postPs) {
                    if(postPs[key].trim()=="") postPs[key]=null;
                }
                let sql=`INSERT INTO DEPT (DEPTNO, DNAME, LOC) VALUE (?,?,?)`;
                let insert=0; // 등록 성공여부 체크 변수
                try {
                    const [result]=await pool.execute(sql,[postPs.deptno,postPs.dname,postPs.loc]);
                    insert=result.affectedRows;
                }catch (e) {
                    console.error(e);
                }
                if(insert>0){ // 등록 성공
                    res.writeHead(302,{location:"/deptList.do"});
                    res.end();
                }else{ // 등록 실패
                    res.writeHead(302,{location:"/deptInsert.do"});
                    res.end();
                }
            });
        } else if(urlObj.pathname==="/deptDelete.do") {
            //😃deptDelete 삭제 페이지
            let deptno=Number(params.deptno);
            if(Number.isNaN(deptno)) { // NaN 인경우
                res.statusCode=400;
                res.write("<h1>해당 페이지에 꼭 필요한 파라미터를 보내지 않았습니다!</h1>")
                res.end();
                return;
            }
            let sql="DELETE FROM DEPT WHERE DEPTNO=?"
            let del=0;
            try{
                const [result]=await pool.execute(sql,[deptno]);
                del=result.affectedRows;
            }catch(e){
                console.error(e);
            }
            if(del>0){
                res.writeHead(302,{location:"/deptList.do"});
                res.end();
            }else{
                res.writeHead(302,{location:"/deptUpdate.do?deptno="+params.deptno});
                res.end();
            }
          // 💚AJAX 의 원리! - 사원번호체크예시💚
        } else if(urlObj.pathname==="/empnoCheck.do") {
            //empno가 동일한 사원이 있으면 true 없으면 false
            const resObj={checkId: false, emp:null}; // id체크, 사원정보 // Object 를 문자열로 응답하는 JSON 이라 부른다.
            // 페이지 파라미터 요청을 잘못한 경우 - 에러
            if(!params.empno || isNaN(params.empno)) { // (null,undefined,"" : 문자열 / 0) => false;
                // 파라미터가 null(없음) 이거나 NaN(문자포함) 인 경우
                res.statusCode=400; // 이 동적 페이지에 요청을 잘 못 했다.(꼭 필요한 파라미터가 없다)
                res.end(); // 응답종료
                return; // if문을 포함하는 함수 종료 // 아래 코드 실행 안됨
            }
            // 파라미터 요청을 잘 한경우! (위 if문 실행 안됨)
            let empno=parseInt(params.empno); // 파라미터 정수로 형변환
            // 데이터 접속하기!
            let sql="SELECT * FROM EMP WHERE EMPNO=?";
            try{ // 통신오류 예외처리 - mysql 접속(pool)
                const[rows,f]=await pool.query(sql,[empno]);
                // 🍋 pool.query(sql,파라미터) (== SELECT)
                // => sql 테이블 조건의 첫번째 ? 물음표에 파라미터 empno 넣기
                // => 결과를 오브젝트(배열)로 반환한다 => rows(해당 empno에 맞는 테이블-가로.emp.객체.사원), f(테이블구조)
                if(rows.length>0) { // empno 파라미터 조건을 만족하는 emp가 1명 있는 경우 (empno는 pk 라서 중복없이 하나만 가능)
                    resObj.checkId=true;
                    resObj.emp=rows[0]; // 파라미터 empno에 해당하는 사원정보
                }
            }catch(e){
                console.error(e); // 오류가 발생하면 500
                res.statusCode=500;
                res.end();
                return;
            }
            // 응답헤더 : 응답하는 문서형식 - json
            res.setHeader("content-type","application/json;charset=UTF-8;");
            res.write(JSON.stringify(resObj));
            res.end();

        } else if(urlObj.pathname==="/deptnoCheck.do") {
            const resObj={checkDeptno: false, dept:null};
            // 페이지 파라미터 요청을 잘못한 경우 - 에러
            if(!params.deptno || isNaN(params.deptno)) { // (null,undefined,"" : 문자열 / 0) => false;
                // 파라미터가 null(없음) 이거나 NaN(문자포함) 인 경우
                res.statusCode=400; // 이 동적 페이지에 요청을 잘 못 했다.(꼭 필요한 파라미터가 없다)
                res.end(); // 응답종료
                return; // if문을 포함하는 함수 종료 // 아래 코드 실행 안됨
            }
            // 파라미터 요청을 잘 한경우! (위 if문 실행 안됨)
            let deptno=parseInt(params.deptno); // 파라미터 정수로 형변환
            // 데이터 접속하기!
            let sql="SELECT * FROM DEPT WHERE DEPTNO=?";
            try{ // 통신오류 예외처리 - mysql 접속(pool)
                const[rows,f]=await pool.query(sql,[deptno]);
                // 🍋 pool.query(sql,파라미터) (== SELECT)
                // => sql 테이블 조건의 첫번째 ? 물음표에 파라미터 empno 넣기
                // => 결과를 오브젝트(배열)로 반환한다 => rows(해당 empno에 맞는 테이블-가로.emp.객체.사원), f(테이블구조)
                if(rows.length>0) { // empno 파라미터 조건을 만족하는 emp가 1명 있는 경우 (empno는 pk 라서 중복없이 하나만 가능)
                    resObj.checkDeptno=true;
                    resObj.dept=rows[0]; // 파라미터 empno에 해당하는 사원정보
                }
            }catch(e){
                console.error(e); // 오류가 발생하면 500
                res.statusCode=500;
                res.end();
                return;
            }
            // 응답헤더 : 응답하는 문서형식 - json
            res.setHeader("content-type","application/json;charset=UTF-8;");
            res.write(JSON.stringify(resObj));
            res.end();
        }


        // 🍋사번 확인페이지 비동기 통신 : AJAX(XMLHttpRequest, fetch)
        /*   else if(urlObj.pathname==="/empnoCheck.do") {
            // 💎Object 객체
            // {key: value} => 문서화, 문자열 JSON (브라우저의 요청에 응답할 문서(데이터) 양식)
            // JSON 은 문서도 되고 객체이기도 하다.
            // 통신 data 주고 받으려고
            // http 통신은 html 문서를 서버와 브라우저가 주고 받으려고 (브라우저는 html 을 그래픽으로 표현하는 데 사용)
            // http(모든) 통신에서 xml 태그로 구분되어 있는 데이터를 주고 받기 위해서
            // http(모든) 통신에서 json 문서는 객체를 문자열로 변환된 데이터를 주고 받기 위해서
            const resObj={checkId:false, emp:null}; // JSON // emp : 사원정보
            // => Object(객체)를 문자열로 응답하는 것을 JSON 이라 부른다.
            // key 표현 "" 따옴표 붙여도 되고, '' 또는 안적어도 된다.
            // empno 가 동일한 사원이 있으면 true , 없으면 false
            if(!params.empno || isNaN(params.empno)) { // (null,undefined,"",0(x - 문자열이 올거니까 0은 제외))=>false
                res.statusCode=400; // 에러 // 이 동적 페이지에 요청을 잘못했다.(꼭 필요한 파라미터가 없다.)
                res.end(); return;
            }
            // * params 파라미터 empno 가 있고 empno 가 NaN 이 아닌 경우(number 인 경우)
            let empno=parseInt(params.empno); // 파라미터 empno 정수 형변환
            let sql="SELECT * FROM EMP WHERE EMPNO=?"; // 결과가 있으면 true, 없으면 false
            try { // 📍예외처리!
                const[rows,f]=await pool.query(sql,[empno]); //empno 를 sql 파라미터에 담겠다 , rows 는 결과
                //📍pool.query (== SELECT) : 무조건 SELECT 의 결과는 배열이다. // 물음표 2번째 3번째에 파라미터 넣는거는 [empno, deptno, ename] 이런식으로 쓰기 // 물음표 첫번째에 empno 파라미터 넣기 // preparedstatement 가 포함되어 있다. // 물음표의 위치에다가 파라미터를 넣을 수 있다.
                // 👀mysql pool.query 는 결과를 오브젝트로 반환한다 (mysql 에서 응답받은 responseText 문자열을 오브젝트로 파싱하는 과정이 포함되있다) // 그냥 mysql 에서 파일 불러오는 것은 파싱을 해줘야 한다.
                if(rows.length>0) { // 사번이 중복인 경우🍋 // 입력한 사번의 객체가 0보다 크다 는 이미 그 사번을 쓰는 객체가 1명이라도 있다는 것 )// rows 는 내가 입력한 empno 사번을 파라미터로 갖는 결과. SELECT 는 무조건 배열이라서. // 내가입력한 사번은 하나뿐
                    resObj.checkId=true;
                    resObj.emp=rows[0]; // emp : 사원정보 // ex) 스미스와 사번이 같으면 // 🍋내가 입력한 empno 사번을 갖는 객체. 어차피 객체가 1개라서 0번째 인덱스로 표현
                }
            }catch(e){
                console.error(e); // 오류가 발생하면 500(서버에서 발생하는 오류)
                res.statusCode=500; // ? 안알려줌 => 오류는 고마운 친구!
                res.end(); return;
            }
            // json 으로 응답하는 문서
            res.setHeader("content-type","application/json;charset=UTF-8;"); // 응답하는 문서형식
            res.write(JSON.stringify(resObj)); // {"checkId":true} 문자열로
            res.end();
        }


        */




        else {
            res.statusCode=404;
            res.setHeader("content-type","text/html;charset=UTF-8");
            res.write("<h1>존재하지 않는 페이지 입니다.</h1>")
            res.end();
        }
    }
})


