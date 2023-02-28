// 유투브 그림 그리는 법 => 따라 그려야 한다 => 그림잘 그릴 수 있나요?
// * 과제를 하는게 따라그리는 것이다! // 수업중에. 코드 그대로 보고 치는건 보는거랑 같다
// alert("안녕!") // script - js 연결 체크하기
//😃학습내용 : 모던자바스크립트 - documentLoad 해당내용

//📢스크립트로 js 파일 불러오기 문제점
// script 의 위치가 head에 있는 경우
// 스크립트가 dom node 생성보다 먼저 실행되서 form 태그 확인이 안된다.
//👉해결방법1 : window.onload : 브라우저가 document 를 모두 load 하고 image 와 스타일 적용까지 완료한 시점
window.onload=function(e){ // window 로드 시점 에 script 를 넣기
    const empInsertForm=document.forms["empInsertForm"];
    console.log("check",empInsertForm); // 스크립트가 dom node 생성보다 먼저 실행됨
}
// window.onload 문제점 발생 : window.onload 가 2개 일때,
// window.onload - node(window) 에 이벤트의 콜백함수를 직접 정의하면 마지막 콜백함수만 실행된다.
//👉해결방법2 : window.addEventListener : onload 실행, addEventListener 도 실행
window.onload=function(e){
    console.log("두번째 콜백함수!"); // 두번째 콜백함수만 실행
}
window.addEventListener("load",(e)=>{
    console.log("addEventListener 로 정의한 콜백함수");
})
//window.onload 는 document load 보다 조금 느리다 (이유는 위에)
//👉해결방법3 : document.DOMContentLoaded *가장 먼저 실행된다. - document 로드 시점 시 진행
// : 브라우저가 document 를 모두 load 한 시점 (window(X)->document, addEventListener 로만 작성 가능)
document.addEventListener("DOMContentLoaded",(e)=>{
    console.log("DOMContentLoaded 로 정의한 콜백함수");
})

//📢개발자 항의! 콜백함수에 정의하는 것 너무너무 보기 싫고 코드도 복잡하다!!
//=>해결방법 : script 태그에 defer(boolean) 라는 속성을 제공 : DOMContentLoaded 시점 쯤까지 기다렸다가 script 문서를 실행!
//😎 사번 체크 (ajax) - 사번이 바뀌면(onchange) 체크! => 👉사번을 체크하는 동적리소스 만들기!
// empInsertForm.empno.onchange=function(e){} // empno 에 onchange 이벤트가 발생하면 실행하겠다
const empInsertForm=document.forms["empInsertForm"];

// empInsertForm.deptno.onblur=deptnoCheck;
// async function deptnoCheck(e)

empInsertForm.empno.onchange=empnoCheck;
async function empnoCheck(e){
    // AJAX (비동기통신) : XMLHttpRequest, fetch
    let val=this.value; // this : onchange가 발생하는 객체 empno
    let url="/empnoCheck.do?empno="+val; // 통신할 url. input 사원번호 입력한값을 파라미터로 받는다
    const res=await fetch(url); // .then((res)=>{return res.json()}) await가 .then 실행하고 매개변수 res를 반환
    if(res.status==200){ //  🍒통신 성공했을 때
        const obj=await res.json(); // .then((obj)=>{...})
        //console.log(obj); // JSON 오브젝트 // {checkId: true}
        // 😃사원번호 중복체크
        if(obj.checkId){ // true // 중복 // obj == {checkId: true, emp:null};
            empnoMsg.innerText=obj.emp.ENAME+"님이 사용중인 사번입니다." // emp : 사원정보
        }else{
            empnoMsg.innerText="사용가능한 사번입니다."
        }

    }else if(res.status==400){ // 파라미터 요청이 잘못된 경우
        this.value=""; // 입력한 값 초기화
        alert("정수만 입력하세요!");
    }else {
        alert(res.status+"오류입니다. 다시시도!"); // == res.statusCode
    }
}
// empInsertForm.empno.onchange= async function(e){
//     // AJAX (비동기통신) : XMLHttpRequest, fetch
//     let val=this.value; // this : onchange가 발생하는 객체 empno
//     let url="/empnoCheck.do?empno="+val; // 통신할 url. input 사원번호 입력한값을 파라미터로 받는다
//     const res=await fetch(url); // .then((res)=>{return res.json()}) await가 .then 실행하고 매개변수 res를 반환
//     if(res.status==200){ //  🍒통신 성공했을 때
//         const obj=await res.json(); // .then((obj)=>{...})
//         //console.log(obj); // JSON 오브젝트 // {checkId: true}
//         // 😃사원번호 중복체크
//         if(obj.checkId){ // true // 중복 // obj == {checkId: true, emp:null};
//             empnoMsg.innerText=obj.emp.ENAME+"님이 사용중인 사번입니다." // emp : 사원정보
//         }else{
//             empnoMsg.innerText="사용가능한 사번입니다."
//         }
//
//     }else if(res.status==400){ // 파라미터 요청이 잘못된 경우
//         this.value=""; // 입력한 값 초기화
//         alert("정수만 입력하세요!");
//     }else {
//         alert(res.status+"오류입니다. 다시시도!"); // == res.statusCode
//     }
// };
// empno 가 바뀌면 empnoCheck 함수 실행 // 함수를 재사용하려고 분리한것!


//😎상사번호 체크(AJAX) -> 동적리소스 json 만들기
empInsertForm.mgr.onchange= async function(e){
    // AJAX (비동기통신) : XMLHttpRequest, fetch
    let val=this.value; // this : onchange가 발생하는 객체 empno
    let url="/empnoCheck.do?empno="+val; // 통신할 url. input 사원번호 입력한값을 파라미터로 받는다
    const res=await fetch(url); // .then((res)=>{return res.json()}) await가 .then 실행하고 매개변수 res를 반환
    if(res.status==200){ //  🍒통신 성공했을 때
        const obj=await res.json(); // .then((obj)=>{...})
        //console.log(obj); // JSON 오브젝트 // {checkId: true}
        // 😃사원번호 중복체크
        if(obj.checkId){ // true // 중복 // obj == {checkId: true, emp:null};
            mgrMsg.innerText="상사는 "+obj.emp.ENAME+"님 입니다." // emp : 사원정보
        }else{
            mgrMsg.innerText="없는 상사번호입니다."
        }

    }else if(res.status==400){ // 파라미터 요청이 잘못된 경우
        this.value=""; // 입력한 값 초기화
        alert("정수만 입력하세요!");
    }else {
        alert(res.status+"오류입니다. 다시시도!"); // == res.statusCode
    }
};



//     async function empnoCheck() {
//     // AJAX(XMLHttpRequest, fetch) 비동기 통신 - url 전환없이 페이지 불러오기.(서버에서 데이터불러오기)
//
//     let val = empInsertForm.empno.value; // 입력한 값 // submit 제출 안에서는 this 는 form // this 가 넘어가면 form 으로 바껴서!! // this 가 바인딩이 안될수도 있어서
//     const parentNode=(empInsertForm.empno.closest(".inputCont"));  // this 가 바인딩이 안될수도 있어서
//     alert(val);
//     console.log(val);
//
//
//
//  /*
//     // 사번은 무조건 3글자이상 수만 입력가능!(유효성검사)
//     if(val.length<3 || !isNaN(val)) { // 텍스트는 문자열 길이 length 를 갖는다.
//         /!*empnoMsg.innerText="3글자 이상의 수만 입력 가능합니다."
//         parentNode.classList.add("error");
//         parentNode.classList.remove("success");
//         return false; // 3글자 이상 수만 ajax 통신을 한다*!/
//     }
//     // let val = this.value; // this 는 empInsertForm.empno
//     let url = "/empnoCheck.do?empno="+val; // 📍empno 사번 input 태그에 입력한 값이 파라미터 // 불러오려는 url
//     // 폼에 empno input 의 값을 바꿨을때(onchange)
//     // url이 empnoCheck.do 에서 do?empno=val 로 입력한 값을 파라미터로 보낸다.
//     // fetch(url) 하면 /empnoCheck 패스네임이 같은
//     // empnoCheck.do 페이지가 실행이 되고.
//     // 서버와 통신이 되서 데이터를 가져온거 res.json()
//
//     // url 로 통신한 결과(응답한)를 res 로 연결
//     // json()은 Response 스트림을 가져와 스트림이 완료될때까지 읽는다. 그리고 다 읽은 body의 텍스트를 Promise형태로 반환
//     const res = await fetch(url); // .then((res)=>{return res.json()}) // await 가 then 을 실행하고 첫번째 콜백함수에 res 를 매개변수로 받는다
//     if (res.status==200) { // 통신이 성공했을 때 // 📍통신상태 js 는 status // nodejs 는 statusCode
//         const obj = await res.json(); // .then((obj)=>{ 동기화시점 })
//         console.log(obj); // {checkId: true} // {checkId: false, emp: null} // {checkId: true, emp: {…}}
//         // true : 사번 중복인 경우 , false : 사용가능한 경우
//
//         // 사번체크 안내문 띄우기
//         if(obj.checkId){ // obj.checkId 가 true 이면 // ❓❓??obj 안에 emp 가 있다
//             empnoMsg.innerText=obj.emp.ENAME+"님이 사용 중인 사번입니다.";
//             // parentNode.classList.add("error");
//             // parentNode.classList.remove("success");
//         }else { // obj.checkId 가 false 이면
//             empnoMsg.innerText="사용 가능한 사번입니다."
//             parentNode.classList.add("success");
//             // parentNode.classList.remove("remove");
//             // return true;
//         }
//     } else if (res.status==400) { // 파라미터 잘못 입력한 경우 // 입력한 값이 정수가 아니거나 없는 경우
//         this.value="";// empno 사번 입력한 값 초기화
//         alert("정수만 입력하세요!");
//     }
//     else {
//         alert(res.status+" 오류입니다. 다시 시도!")
//     }
//
//     */
//
//
//
//
// }
// 📢부서번호 중복체크
empInsertForm.deptno.onblur=deptnoCheck;
    async function deptnoCheck(e) { // empno 에 onchange 이벤트가 발생하면 실행하겠다
    // 🍋AJAX(XMLHttpRequest, fetch) 비동기 통신 , 자바스크립트의 비동기 통신
    // url 전환없이 다른페이지 불러오기.
    console.log(this);
    let val = empInsertForm.deptno.value;
    if(!val) { // 공백일 때 // val===""
        deptnoMsg.innerText="부서가 null 처리됩니다."
        return true; // 부서가 없는 경우 null 처리 // 사번은 무조건 적어야 한다.
    }

    const parentNode=(empInsertForm.deptno.closest(".inputCont"));
    // let val = this.value; // this 는 empInsertForm.empno
    let url = "/deptnoCheck.do?deptno="+val; // 📍empno 사번 input 태그에 입력한 값이 파라미터 // 불러오려는 url
    const res = await fetch(url); // .then((res)=>{return res.json()}) // await 가 then 을 실행하고 첫번째 콜백함수 실행
    if (res.status==200) { // 통신이 성공했을 때 // 📍통신상태 js 는 status // nodejs 는 statusCode
        const obj = await res.json(); // .then((obj)=>{ 동기화시점 })
        console.log(obj); // {checkId: true} // {checkId: false, emp: null} // {checkId: true, emp: {…}}
        // true : 사용가능한 경우 // false : 사번 중복인 경우
        if(obj.checkDeptno){ // obj.checkId 가 true 이면
            deptnoMsg.innerText=`${obj.dept.DNAME}(지역:${obj.dept.LOC}) 부서입니다.`;
            return true;
        }else { // obj.checkId 가 false 이면
            deptnoMsg.innerText="없는 부서번호를 참조할 수 없습니다.";
            // console.log(obj.dept);
        }
    } else if (res.status==400) { // 입력한 값이 정수가 아니거나 없는 경우
        this.value="";// 값 초기화
        alert("정수만 입력하세요!");
    }
    else {
        alert(res.status+" 오류입니다. 다시 시도!")
    }
}
empInsertForm.ename.onchange=enameCheck;
function enameCheck(){
    const parentNode=empInsertForm.ename.closest(".inputCont"); // 내 부모중에 가장 근접한 부모를 찾는다
    if(empInsertForm.ename.value.length<2) {
        enameMsg.innerText="이름은 2글자 이상 입력하세요!";
        parentNode.classList.add("remove");
        parentNode.classList.remove("success");
        return false;
    } else {
        enameMsg.innerText="";
        parentNode.classList.add("success");
        parentNode.classList.add("error");
        return true; // if 실행이 아니면 true
    }
}

empInsertForm.job.onchange=jobCheck;
function jobCheck(){
    const parentNode=empInsertForm.job.closest(".inputCont"); // 내 부모중에 가장 근접한 부모를 찾는다
    if(empInsertForm.job.value.length<2) {
        jobMsg.innerText="직책은 2글자 이상 입력하세요!";
        parentNode.classList.add("remove");
        parentNode.classList.remove("success");
        return false;
    } else {
        jobMsg.innerText="";
        parentNode.classList.add("success");
        parentNode.classList.add("error");
        return true; // if 실행이 아니면 true
    }
}
empInsertForm.sal.onchange=salCheck;
function salCheck(){
    let val=empInsertForm.sal.value;
    const parentNode=empInsertForm.sal.closest(".inputCont");
    // isNaN : "" => 0 바꾸면서 수가 가능!
    if(val.trim() && !isNaN(val)) { // val 이 공백이 아니고. 한줄이상 이고 NaN 이 아닌경우
        salMsg.innerText=""
        parentNode.classList.add("success");
        parentNode.classList.remove("error");
        return true;   // return 이 코드위에 있으면 코드 밑에가 실행이 안된다.
    } else {
        salMsg.innerText="급여는 수만 입력 가능합니다."
    }
}

empInsertForm.comm.onblur=commCheck;
function commCheck(){
    let val=empInsertForm.comm.value;
    const parentNode=empInsertForm.comm.closest(".inputCont");
    // isNaN : "" => 0 바꾸면서 수가 가능! // 0 은 false
    if(val=="") { // == !val // val 이 null 이면? null 처리 안내문
        // comm 상여금을 null 처리해준거는 CRUD.js 에서   (postPs.comm.trim()==="")?null:parseFloat(postPs.comm), // 공백 null 처리
        commMsg.innerText="상여금이 null 처리됩니다."
        return true; // commCheck 함수 종료 및 true 반환
    }
    //"    "=>""
    //"  fa "=>"fa"
    if(val.trim() && !isNaN(val)) { // val 이 공백이 아니고. 한줄이상 이고 NaN 이 아닌경우
        commMsg.innerText=""
        parentNode.classList.add("success");
        parentNode.classList.remove("error");
        return true;   // return 이 코드위에 있으면 코드 밑에가 실행이 안된다.
    } else {
        commMsg.innerText="상여금은 수만 입력 가능합니다."
        parentNode.classList.add("error");
        parentNode.classList.remove("success");
    }
}
empInsertForm.onsubmit=async function(e) { // 제출버튼 클릭시 // 화살표 함수시 this 는 window
    e.preventDefault(); // form.onsubmit() 이벤트를 막는다.
    // async 함수에서 반환하는 값은 무조건 프라미스화가 된다. => 🍒await 로 결과를 받는다
    // return true 를 하면 프라미스화가 되서
    // return true => return new Promise((res)=>{res(true)});
    let empnoState=await empnoCheck(); // 사번 유효성 체크 // 유효성검사 함수 실행
    let deptnoState=await deptnoCheck();
    let enameState=enameCheck();
    let jobState=jobCheck();
    let salState=salCheck();
    let commState=commCheck();
    console.log(empnoState); // Promise {<fulfilled>: false} // await 하면 false
    if(empnoState && mgrState && deptnoState && enameState && jobState && salState && commState) {
        empInsertForm.submit(); // onsubmit 이벤트로 재귀함수가 되지 않는다.
    }

    // const deptnoCheck2=deptnoCheck.bind(empInsertForm.deptno); // deptno 를 empInsertForm.deptno 로 바인딩하기
    // deptnoCheck2();
    // empInsertForm.submit(); // 제출!
}



// form submit 버튼을 누르면 form.onsubmit() 이벤트가 발생하면서
// form 양식(input)에 작성한 내역을 액션에 작성한 동적페이지에 제출!!
// 😃유효성 검사 : 액션페이지에서 처리하지 못하는 값을 미리 검출하고 경고하는 일!
// 양식의 제출을 막아야 한다!


// 브라우저가 form 요청(2번)
// 서버가 동적페이지에서 -> html 렌더링
// 브라우저가 페이지 읽다가
// 스크립트가 또 있으면 서버에 다시 가져와서 실행한다.