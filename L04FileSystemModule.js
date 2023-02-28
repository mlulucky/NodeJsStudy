// 모듈 : 어플리케이션이나 라이브러리 등을 모듈 (개발자에 의해서 생성된 가장 작은 단위의 무언가)
// 라이브러리 : 필요에 의해서 사용되는 객체( or 객체의 집단(패키지))
// 어플리케이션 : 유저에게 서비스 되는 것
// 패키지 : 유사한 사용을 위해 모인 객체의 집단(컬렉션프레임워크 List,Map,Set,Date) (컬렉션프레임워크 : 개발자를 위한 모든 도구)
// 프레임워크 : 모듈을 제어하고 프로그래밍 시 프레임워크에 규칙에 따를 때
// => 여러 라이브러리의 집단으로 특정 서비스가 가진 한계를 벗어나기 위해 그 서비스 전체를 제어하는 단위
// => 아예 새로운 언어를 배운다고 생각해도 된다.
// spring : 톰캣 서버가 가진 불안정성과 객체지향(OOP)의 한계를 벗어나기 위해 관점지향(AOP)을 적용하는 프레임워크
// expressjs : nodejs 가 갖는 불편함(1~10까지 다 구현해야하는 것)을 해소하고 미들웨어를 적용하는 프레임워크
// => 특정서비스를 더 거대한 것으로 극복하는 // spring 안에 톰캣이 포함 되어있고, express 안에 노드가 들어가 있다.
// 보통 서비스는 프레임워크로 하고있다
// 프레임워크 단점 : 배우기 어렵다, 작은 서비스에 적용하기 어렵다. (큰회사에서는 프레임워크 사용. 작은회사에서는 잘 사용 x)

// nodejs : 서버에서 실행되는 언어 (자바스크립트), npm(nodejsPackageManager)을 제공(라이브러리 다운(== 의존성 주입) maven, gradle)  (핫해서. 누구나 다 배우고 싶어한다. 엄청 반긴다)
// 오답 : 서버입니다. // 정답 : http 서버 모듈을 제공합니다.=> 서버 구현이 가능
// 서버 언어 : 동적페이지에 적용되는 언어(서블릿(동적페이지)에 적용된 자바(언어))
// nodjs 는 서버 언어 이기도하면서 서버를 구현한다. 서버페이지도 만들고, 동적페이지도 만든다.
// 📍리소스는 클라이언트가 찾을 수 있는 자료

//📍모듈 임폴트
const http=require("http");
const url=require("url"); // 💎url 에서 path 와 queryString 을 분리 // url 을 동적리소스를 만들기 위해서
const querystring=require("querystring"); // 💎queryString 을 Object 로 변환 // js 에서는 카멜케이스 쓰지 않는다. 전부 소문자로.. -> queryString(X) => querystring
const fs=require("fs"); // filesystem // 파일리더와 비슷 : 정적리소스를 불러오기 위해서 // java FilReader+Writer : 파일을 문자열로 불러오는 것(읽어오는것+쓰는것)   // 과 비슷 // file system
const fsPromise=require("fs/promises"); // fs(파일시스템)을 프라미스화 한것

//📍서버만들기 - 노드js 는  멀티스레드이다
const server=http.createServer(); // nodejs 로 구현한 서버(자바의 톰캣과 같다)
server.listen(8888); // 📍이벤트 리스너 // listen : 클라이언트에서 해당 서버에 요청이 들어올 때 마다 요청 이벤트를 실행
// 💎url : 서버주소+패스(리소스주소)+쿼리스트링
// 💎서버주소 : www.naver.com (도메인) 127.3.0.13:80 // ip + port 번호를 맵핑하는 주소 // ip 주소 : 인터넷상에서의 컴퓨터주소 // port 번호 : 서버주소(서버가 인터넷상 컴퓨터상에서 갖는 고유 번호)
// 💎pathname : /book/detail.do  // 해당 서버에서 공개되어 있는 리소스의 주소
// 💎쿼리스트링 : ?bid=12313k1 // 해당하는 동적 리소스에 제공하는 파라미터들 (질의하는 문자열)

//📍동적리소스 만들기 - 웹앱페이지
server.on("request", async (req,res)=>{ // request : 요청이 들어올때 발생하는 이벤트 / listener : 콜백함수 // 🍋await 의 콜백함수가 async 함수여야한다! // server.on : 이벤트 리스너와 같다 // listener : 콜백함수
    const urlObj=url.parse(req.url);  // url 을 객체로 변환하여 리턴 // url.parse : url 을 오브젝트로 만들어준다 url{key: "", key: ""}
    console.log(urlObj);
    const params=querystring.parse(urlObj.query); // url.query ❓ // querystring.parse() : 쿼리 문자열을 쿼리 객체로 바꿔주는 역할
    const urlSplits=urlObj.pathname.split("/"); // url 의 슬래시를 짤라내기
    console.log(urlSplits); // [ '', 'public', 'html', 'd.html' ] // 첫번째는 /public 슬래쉬 앞에 아무것도 없어서
    // 😃 url 에 패스에 /public/ 이 포함되면 모두 정적 리소스다 약속!! (=> l04public)(첫번째 폴더는 public이다!)(프로그래밍은 약속이다)
    // 예)  /public/css/a.css => ['','public', 'css', 'a.css']
    // 예2) /public/html/c.html
    // url 의 슬래시를 짤라내기
    // 📍 정적리소스 처리 - nodejs 꼭 맨위에 써져있어야 한다!!
    // 🍋 정적리소스 처리방법 + 리소스가 다른 리소스를 참조하는 방법
    if(urlSplits[1]=="public") { // 🍋정적리소스만 올 수 있다. // 정적 리소스를 요청함! // public 정적리소스의 위치
         if(urlSplits[2]=="html") { // url 패스가 html 일 때 // 정적리소스 종류 분리하기 ex)html, css, js, img ...
            res.setHeader("content-type", "text/html;charset=UTF-8"); // 응답헤더 : 서버가 모든페이지의 응답을 html으로 하라
         } else if(urlSplits[2]="css") { // url 패스가 css(스타일시트)일 때
             res.setHeader("content-type","text/css;"); // css(스타일시트)로 응답
         } else if(urlSplits[2]=="img") {
             res.setHeader("content-type", "image/jpeg;"); // 👀참새이미지 인코딩 에러 // 응답헤더 : 서버가 모든페이지의 응답을 html으로 하라
         } else if(urlSplits[2]=="js") { // 컨텐츠 파일이 js 일때
             res.setHeader("content-type","application/javascript;")
         }
         // 서버 내부에서 / 슬러시로 최상위 상대 주소를 쓰면 윈도우는 c:// 드라이브 또는 맥은 user 하위 로 찾아간다.
        // 컨텐츠 타입을 지정하지 않으면 파일들이 깨져나온다. // 📢톰캣은 컨텐츠 타입을 미리 설정, 처리가 되있다
        // 👀이부분 설명을 잘 못들음 => 수업영상 다시 보기
       /* fs.readFile("."+urlObj.pathname,(err,data)=>{ // 👀여기에 "." 점을 왜 썼을까 ?? // 콜백함수
            if(err) {
                console.err(err);
                res.write("<h1>500 파일 요청을 실패</h1>");
                res.end();// return 역할
            }
            res.write(data);
            res.end();
        });*/
        // 📍promise 로 콜백함수로 페이지 불러오기!!
        try{ // Promise 오류처리 - try catch문
            let data = await fsPromise.readFile("."+urlObj.pathname); // 프로미스로 받아온 data // await - 가장 인접한 콜백함수가 async 함수여야 한다!
            res.write(data);
            res.end();
        }catch(e) {
            console.error(e);
            res.statusCode=500;
            res.write("<h1>500 파일 요청을 실패</h1>");
            res.end(); // 응답 완료 // return 과 같음. 종료
        }
    } else { // 🍋동적 리소스만 // 👀이부분 설명을 잘 못들음 . 왜 else 안에 넣은 것인가.
        res.setHeader("content-type", "text/html;charset=UTF-8"); // 📍응답헤더 : 서버가 모든페이지의 응답을 html으로 하라
        if(req.url=="/") { // 동적리소스 (==자바 servlet) // 인덱스 요청
            res.write("<h1>index 페이지입니다.</h1>");
            res.write("<h2>서버의 리소스 목록</h2>");
            res.write(`
            <ul>
                <li><a href="a.do">a.do 동적 페이지</a></li> <!-- 주소에 / 슬러시 무조건 쓰기 -->
                <li><a href="a.do?a=11.3&b=30.333">a+b 를 연산하는 a.do 동적 페이지</a></li> <!-- 쿼리스트링은 url에 포함되있어서 -->
                <li><a href="b.html">b.html 정적페이지</a></li> <!-- 정적페이지도 노드서버에서 받아서 응답해줘야 서버가 열린다. 안그러면 없는페이지라고 나온다. 톰캣도 이런과정이 있는건데 자동으로 동작하는것 -->
                <li><a href="/public/html/c.html">c.html 정적페이지</a></li> 
                <li><a href="/public/html/d.html">d.html 정적페이지</a></li> 
                <li><a href="/public/css/d.css">d.css 스타일시트</a></li>
                <li><a href="/public/img/d.jpeg">참새 이미지</a></li>
            </ul>
        `);
            res.end();
        } else if (urlObj.pathname=="/a.do"){ // 📍a.do 동적리소스 // 다른 동적리소스 만들기 (else if) // url:  / pathname : / 쿼리스트링:
            let a=parseFloat(params.a); // 문자열 -> 숫자로 변환  // parseFloat(null) -> NaN , Number(null) -> 0
            let b=parseFloat(params.b);
            res.write(`<h1>a.do 페이지 입니다!</h1>`)
            res.write(`<h1>받아온 파라미터 a 와 b 를 + 연산 ${a+b}</h1>`) // a.do 에서는 NaN 이나오는게, 파라미터가 없어서 undefined
            res.end(); // 🍋응답을 완료함!(서버요청을 끝냄) (end()를 안쓰면 클라이언트가 서버가 응답하는 것을 무한대기 할 수도 있다.)
        } else if(urlObj.pathname=="/b.html"){ // 📍정적페이지 / 서버가 응답하는 페이지에 추가
            fs.readFile("b.html",(err,data)=>{ // 시간이 좀 걸린다 // 멀티스레드를 생성 // 비동기 코드 // 파일을 문자열로 불러오는 것 // 멀티스레드, 콜백함수 // 파일이 같은 위치에 있으면 상대주소로 불러올 수 있다.
                // readFile : 파일을 문자열로 불러온다 // 콜백함수 - 멀티스레드
                if(err) console.err(err); // 에러발생시 에러처리
                res.write(data);  // 화면 출력 (data 는 b.html 을 문자열로 반환한것)
                res.end(); // 응답 완료 // end() 시점을 동기
            }); // readFile 멀티스레드(비동기코드) // 파일을 불러왔을때 콜백함수. end 시점을 동기 시켜야 한다.!!
            // res.write(data);  // 화면 출력
            // res.end(); // fs.readFile() 멀티스레드를 생성하는 비동기 코드이기 때문에 // readFile 멀티스레드(비동기코드)를 생성해서 end 가 먼저 끝난다. 코드 동기되지 않아서
        } else {
            res.statusCode=404; // 클라이언트가 없는(잘못된) 리소스를 요청함
            res.write(`<h1>404 존재하지 않는 페이지 입니다!</h1>`);
            res.end();
        }
    }
});












