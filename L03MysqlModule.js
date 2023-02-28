// http html을 전송하는 규약. https 보안이 강화된거 //
const http=require("http"); // nodejs 에서 모듈을 찾아온다. 주입해주는것. http 통신과 통신하는 것 // nodejs 에서 제공하는 기본 모듈
const url=require("url");   // nodejs 에서 제공하는 기본 모듈
const queryStr=require("querystring");
const mysql=require("mysql"); // mysql 라이브러리를 찾아온다.

const mysqlConnInfo={
    host: "localhost",
    port: 3306,
    database:"SCOTT",
    user: "root",
    password: "mysql123",
}

// nodejs : 실무에서 사용하지 않는다. (공부용/원리 파악하는)
// expressjs : nodejs 프레임워크를 실무에서 사용함!
// 📍http 자동완성 안되는데, 수업하는 방법
// 1. http -> http2 로 하다가 실행할 때 http 로 실행!
// 2. 비쥬얼스튜디오에서 사용
// 서버만들기
http.createServer((req,resp)=>{
    console.log(req.url);
    const urlObj=url.parse(req.url); //??`
    console.log(urlObj);
    resp.setHeader("content-type", "text/html;charset=UTF-8");
    if(urlObj.pathname=="/"){ // 주소저장
        resp.write("<h1>url 모듈과 mysql 사용해 보기</h1>");
        resp.write(`<p>
                       <a href="power.do?a=3&b=6">
                        파라미터 a, b로 거듭제곱한 결과물을 반화하는 동적페이지(.do)
                       </a>
                   </p>`);
        resp.write(`<p>
                       <a href="deptList.do">
                        부서 리스트
                       </a>
                   </p>`);
        resp.write(`<p>
                       <a href="empList.do">
                        사원 리스트
                       </a>
                   </p>`);
        resp.end();

    }else if(urlObj.pathname=="/power.do") {
        const params=queryStr.parse(urlObj.query);
        console.log(params);
        resp.write("<h1>a b 파라미터를 거듭제곱 합는 동적 페이지</h1>");
        resp.write(`<h2>${params.a} 거듭제곱 ${params.b} = ${Math.pow(params.a,params.b)}</h2>`);
        resp.end();
    }else if(urlObj.pathname=="/deptList.do"){
        resp.write("<h1>부서 리스트 동적페이지 (mysql 모듈 사용)</h1>");
        try{
            const conn=mysql.createConnection(mysqlConnInfo);
            conn.query("SELECT * FROM DEPT",(err,rows,fields)=>{ // ("실행할질의",()=>{쿼리가 실행되고 값이 반환되면 실행되는 콜백함수}) // onload와 같다
                if(err) console.error(err);
                let html=`<table><tr><th>번호</th><th>이름</th><th>위치</th></th>`;
                rows.forEach((row)=>{
                    html+=`<tr>
                            <td>${row.DEPTNO}</td>
                            <td>${row["DNAME"]}</td>
                            <td>${row["LOC"]}</td>
                           </tr>`;
                })
                html+=`</table>`;
                resp.write(html);
                resp.end();
                console.log(rows);
            });
        }catch(e){
            console.error(e);
        }
        // resp.end();
    }else if(urlObj.pathname=="/empList.do"){
        resp.write("<h1>직원 리스트 동적페이지 (mysql 모듈 사용)</h1>");
        try{
            const conn=mysql.createConnection(mysqlConnInfo); // 페이지 요청시 매번 mysql db접속
            conn.query("SELECT * FROM EMP",(err,rows,fields)=>{
                if(err) console.error(err);
                let html=`<table><tr><th>직원번호</th><th>이름</th><th>직업</th><th>급여</th><th>부서번호</th></tr>`;
                rows.forEach((row)=>{
                    html+=`<tr>
                            <td>${row.EMPNO}</td>
                            <td>${row["ENAME"]}</td>
                            <td>${row["JOB"]}</td>
                            <td>${row.SAL}</td>
                            <td>${row.DEPTNO}</td>
                           </tr>`;
                })
                html+=`</table>`;
                resp.write(html);
                resp.end();
                console.log(rows);
            }); // ("실행할질의",()=>{쿼리가 실행되고 값이 반환되면 실행되는 콜백함수}) // onload와 같다
        }catch(e){
            console.error(e);
        }
        // resp.end();
    }else {
        resp.write("<h1>404 없는 주소입니다.</h1>");
        resp.end();
    }
}).listen(7070);

// 수정후 작업다시 볼때 : 터미널 ctrl + L