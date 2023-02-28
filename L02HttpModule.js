const http=require("http");
// nodejs 에서 라이브러리(모듈)를 임폴트 하는 방법                                // nodjs : 서버와 서블릿을 모두 직접 구현해야한다.  //톰캣 : 서블릿만 구현하면됨. 서버는 제공해준다.
// http : 서버를 생성하고 클라이언트의 요청을 처리할 수 있다.(nodejs 는 웹앱서버-)     //<-> 웹서버 - 정적리소스실행
console.log(http);
// 톰갯 서버에 해당
http.createServer(function(req,res){ // 1. createServer : 서버를 만든다. 서버
    let url=req.url.split("?")[0];// 요청한 리소스의 주소
    let queryString=req.url.split("?")[1]; // 요청한 파라미터들
    console.log(url);
    res.setHeader("content-type","text/html;charset=UTF-8") // 웹브라우저에서 텍스트문자열 인코딩 설정

    // 자바 서블릿 페이지에 해당 // 요청이 오면 url로 구분해 만들어주는 것 - 동적페이지
    if(url=="/") { // index 동적 페이지(== 동적 리소스) (우리가 만든 주소. 페이지) // 파라미터로 동적페이지의 상태를 바꾼다 // 모든 동적페이지는 주소에 파라미터를 갖는다 https://plusdeal.naver.com/?listType=SHOPPING_MAIN&grpSeq=1&ic=K07176&contentsSeq=5990749&sort=1
        res.write("<h1>node js 의 http 모듈 안녕!</h1>") // 출력하는 문자열. 응답하는 문자열
        res.write("<h2>npm 으로 nodemon 설치</h2>")
        res.write("<p>npm 은 노드 패키지 매니저로 라이브러리 의존성 주입을 한다!</p>")
        res.write(`<p>
                       <a href="power.do?a=3&b=6">
                        파라미터 a, b로 넘기면 두 값을 거듭제곱한 결과물을 반화하는 동적페이지(.do)
                       </a>
                   </p>`); // 백틱으로 띄어쓰기 주기
        res.end(); // 입력후 반드시 닫아줘야함. // end 해야지 끝내고 서버가 전송을 한다.
    // }else if(url=="/power.do?a=3&b=6"){ // 동적페이지는 / 슬러쉬 꼭 붙여야 한다. // ? 오른쪽: 쿼리스트림 / 왼쪽 ? : url
    }else if(url=="/power.do"){ // 동적페이지는 / 슬러쉬 꼭 붙여야 한다. // ? 오른쪽: 쿼리스트림 / 왼쪽 ? : url
        // req.getParameter(key) return val
        // ? key=val & key2=val2 & key3=val3 .. http 통신에서 파라미터를 이렇게 보낸다고 약속!!
        const params=queryString.split("&"); // & 를 기준으로 파라미터를 자른다 // ["key=val", "key2=val2",...]
        const paramObj={};
        params.forEach((param)=>{ // "key=val"
            let key=param.split("=")[0]; // key  ["key" "val"]
            let val=param.split("=")[1]; // val
            paramObj[key]=val;
        });
        // {key:val,key2:val2,...}
        console.log(paramObj);
        res.write(`<h1>${paramObj.a} 거듭제곱 ${paramObj.b} 의 결과는 : ${Math.pow(paramObj.a,paramObj.b)}</h1>>`)
        res.end();
    }else { // 찾는 리소스(페이지)가 없는 경우 에러처리 (톰캣은 자동으로)
        req.statusCode=404;
        res.write("<h1>404 찾는 리소스가 없습니다!</h1>") // http://localhost:7070/a.html 없는페이지 브라우저 주소창에 입력
        res.end(); // 입력후 반드시 닫아줘야함.
    }
}).listen(7070); // ip주소(localhost):7070 => 서버에 접속 // 브라우저에 localhost:7070 주소치면 페이지 나온다.
// port(포트번호) 0 ~ 2000 : 컴퓨터 OS가 시스템 어플을 위해 사용 중
// port(포트번호) 3306 : mysql 이 설치되면
// port(포트번호) 80 : 해당 사용자 컴퓨터가 진짜 서버컴퓨터가 되면 서버를 서비스하기 위한 기본 포트. 80번을 비워놔야한다.

// node .\L02HttpModule.js 터미널 실행 명령어
// 파일 수정 후 터미널 ctrl c 로 종료하고 다시 터미널에 들어가기
// npx nodemon .\L02HttpModule.js 터미널 노드몬 실행명령어
// 노드몬  - package.josn : 의존성 주입
