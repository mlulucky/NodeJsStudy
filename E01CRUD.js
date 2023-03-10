//๐์๋ฒ๋ง๋ค๊ธฐ ์ค๋น! - ๋ชจ๋ import ๋ถ๋ฌ์ค๊ธฐ
const http=require("http");// http ์๋ฒ. ํต์ 
const url=require("url"); // url ๋ถ๋ฆฌ + ๊ฐ์ฒด๋ก ๋ง๋ค๊ธฐ ์ํด. ๋๋๊ธฐ ์ํด
const querystring=require("querystring"); // ์ฟผ๋ฆฌ์คํธ๋ง ํ๋ผ๋ฏธํฐ ๋๋๊ธฐ+๊ฐ์ฒด
const fs=require("fs/promises"); // ํ๋ก๋ฏธ์คํ ๋ ํ์ผ์์คํ
const mysql=require("mysql2"); // ํ๋ก๋ฏธ์คํ ๋ mysql
const pug=require("pug");
const json = require("./idCheck.json"); // ๋ทฐ(html)ํํ๋ฆฟ ์์ง ํผ๊ทธ

//๐์๋ฒ์์ฑ
const server=http.createServer(); // http ์๋ฒ ์์ฑ
server.listen(8887, ()=>{ // ์์ํ  ์๋ฒ์ฃผ์ ์์ฑ // ํด๋น ์๋ฒ์ฃผ์๋ฅผ ๋ฃ๊ณ ์๋ค.
    console.log("http://localhost:8887 SCOTT CRUD ๋ฅผ ์ ๊ณตํ๋ ์๋ฒ");
}); // ๋์ผํ ํฌํธ๋ฒํธ๋ฅผ ๋ง๋๋ ๊ฒฝ์ฐ. ํ์ชฝ ํฌํธ๋ฒํธ๋ ์ข๋ฃ๋ฅผ ํด์ผ ์ฌ์ฉ๊ฐ๋ฅ
//๐mysql ์ ์์ ๋ณด
const mysqlConInfo={
    host:"localhost",
    post:3306,
    user:"root",
    password:"mysql123",
    database:"SCOTT"
}
//๐์ปค๋ฅ์ ํ - ์๋ฒ๊ฐ  mysql db ์ ์ ์ ์ ์ง
const createPool=mysql.createPool(mysqlConInfo);
const pool=createPool.promise();

//๐server.on ์๋ฒ์์ ๋ฐ์ํ ์์ฒญ request ๋ฐ์์ ์คํํ๋ ์ฒ๋ฆฌ ์์ญ
server.on("request", async (req,res)=>{ // ์๋ฒ ์ฝ๋ฐฑํจ์
    const urlObj=url.parse(req.url); // url ์ค๋ธ์ ํธ๋ก ํ๋ณํ
    const params=querystring.parse(urlObj.query); // url ์ฟผ๋ฆฌ์คํธ๋ง์ ๊ฐ์ฒด๋ก ๋ณํ
    const urlSplits=urlObj.pathname.split("/"); // ์ ์  ๋ฆฌ์์ค, ๋์ ๋ฆฌ์์ค ๊ตฌ๋ถ
    // ์ ์ ๋ฆฌ์์ค - ํ๋ผ๋ฏธํฐ(X)
    if(urlSplits[1]==="public"){
        if(urlSplits[2]==="js") { // js ํ์ผ์ด๋ฉด
            res.setHeader("content-type","application/javascript"); // ์๋ฐ์คํฌ๋ฆฝํธ๋ก ์๋ต
        } else if(urlSplits[2]==="css") {
            res.setHeader("content-type","text/css");
        } else if(urlSplits[2]==="image"){
            res.setHeader("content-type","image/jpeg");
        }
        // ์์ธ์ฒ๋ฆฌ - ์ฃผ์๊ฐ ์๋ชป๋์์ ๋, ํต์ ์ ์คํจํ์๋
        try{
            // fs : ์๋ฒ๊ฐ ์คํ๋๊ณ  ์๋ ์ปดํจํฐ๋ฅผ ๊ธฐ์ค์ผ๋ก ํ์ผ์ ๊ฒ์
            // ์๋๊ฒฝ๋ก . (== ./ ) : ์๋ฒ๊ฐ ์คํ๋๊ณ  ์๋ ์์น(ํด๋)๋ฅผ ๊ธฐ์ค์ผ๋ก ํ์ผ์ ๊ฒ์ // .ํ์ผ์ด๋ฆ (== ./ํ์ผ์ด๋ฆ)
            let data= await fs.readFile("."+urlObj.pathname);
            res.write(data);
            res.end();
        }catch(e){
            res.statusCode=404;
            res.end();
        }
    }
    // ๋์ ๋ฆฌ์์ค (public ์ ์ ๋ฆฌ์์ค๊ฐ ์๋๋ฉด ๋ชจ๋ ์ ์ ๋ฆฌ์์ค)
    else {
        if(urlObj.pathname==="/") {
            //๐์ธ๋ฑ์คํ์ด์ง
            let html=pug.renderFile("./templates/index.pug");
            res.write(html);
            res.end();
        }else if(urlObj.pathname==="/empList.do") {
            //๐empList ๋ฆฌ์คํธ ํ์ด์ง
            try {
               const [rows,f]=await pool.query("SELECT * FROM EMP");
               let html=pug.renderFile("./templates/empList.pug", {empList:rows}); // ๐
                res.write(html);
                res.end();
            }catch(e){
                console.error(e);
            }
        }else if(urlObj.pathname==="/empDetail.do"){
            // ๐empDetail ์์ธ ํ์ด์ง
            let empno=Number(params.empno);  // ํ๋ผ๋ฏธํฐ ์ ์ ํ๋ณํ
            if(Number.isNaN(empno)) { // ํ๋ผ๋ฏธํฐ๊ฐ NaN์ธ ๊ฒฝ์ฐ
                res.statusCode=400;
                res.write("<h1>ํด๋น ํ์ด์ง์ ๊ผญ ํ์ํ ํ๋ผ๋ฏธํฐ๋ฅผ ๋ณด๋ด์ง ์์์ต๋๋ค!</h1>");
                res.end();
                return;
            } // ํ๋ผ๋ฏธํฐ๊ฐ NaN์ด ์๋ ๊ฒฝ์ฐ
            let sql="SELECT * FROM EMP WHERE EMPNO=?";
            const [rows,f]=await pool.query(sql,[empno]); // ๐
            let html=pug.renderFile("./templates/empDetail.pug",{emp:rows[0]});
            res.write(html);
            res.end();
        }else if(urlObj.pathname==="/empUpdate.do"&&req.method==="GET"){ //๐form ์์, ํ์ด์ง html
            //๐empUpdate ์์  ํ์ด์ง
            let empno=Number(params.empno);
            if(Number.isNaN(empno)) { // ํ๋ผ๋ฏธํฐ NaN ์ธ ๊ฒฝ์ฐ
                res.statusCode=400;
                res.write("<h1>ํด๋น ํ์ด์ง์ ๊ผญ ํ์ํ ํ๋ผ๋ฏธํฐ๋ฅผ ๋ณด๋ด์ง ์์์ต๋๋ค!</h1>")
                res.end();
                return;
            } // ํ๋ผ๋ฏธํฐ NaN ์ด ์๋ ๊ฒฝ์ฐ
            let sql="SELECT * FROM EMP WHERE EMPNO=?";
            const [rows,f]=await  pool.query(sql,[empno]);
            let html=pug.renderFile("./templates/empUpdate.pug",{emp:rows[0]});
            res.write(html);
            res.end();
        } else if(urlObj.pathname==="/empUpdate.do"&&req.method==="POST"){ //๐form ์ก์. ์ ๋ณด ์ ์ก
            let postquery=""; // POST ๋ฐฉ์์ ํ๋ผ๋ฏธํฐ
            let update=0; // ์๋ฐ์ดํธ ์ฑ๊ณต์ฌ๋ถ ํ์ธ์ฉ ๋ณ์
            req.on("data",(param)=>{ // ํ๋ผ๋ฏธํฐ ๋ถ๋ฌ์ค๊ธฐ
                postquery+=param; // POST ํ๋ผ๋ฏธํฐ ๋ด๊ธฐ
            });
            req.on("end",async ()=>{ // ํ๋ผ๋ฏธํฐ ๋ถ๋ฌ ์จ๋ค . req.on ๋น๋๊ธฐ -> ๋๊ธฐ ์คํ
                console.log(postquery);
                const postPs=querystring.parse(postquery); // POST ํ๋ผ๋ฏธํฐ ๊ฐ์ฒด ํ์ฑ
                console.log(typeof postPs.comm,postPs.comm); // comm - string ํ์ // ๋ชจ๋  ํ๋ผ๋ฏธํฐ๋ ๋ฌธ์์ด
                console.log((postPs.comm.trim()==="")?null:parseFloat(postPs.comm))
                //"" => null
                try { // ํ๋ผ๋ฏธํฐ์ ๊ฐ ๋์ (+์์ธ์ฒ๋ฆฌ)
                    // boolean ("" 0 null undefined NaN) => false
                    console.log(!"");
                    let sql=`UPDATE EMP SET ENAME=?,SAL=?,COMM=?,JOB=?,MGR=?,DEPTNO=?,HIREDATE=? WHERE EMPNO=?`
                    const [result]=await pool.execute(sql,[ // ๋งค๊ฐ๋ณ์ ๊ฐ ๋์
                        postPs.ename,
                        (postPs.sal.trim()==="")?null:parseFloat(postPs.sal), // ๊ณต๋ฐฑ null ์ฒ๋ฆฌ // ๋์ด์ค๋ ํ๋ผ๋ฏธํฐ๊ฐ ๋ฌธ์์ด์ด๋ผ์. ๊ณต๋ฐฑ๋ ๋ฌธ์์ด์ด๋ค
                        (postPs.comm.trim()==="")?null:parseFloat(postPs.comm), // ๊ณต๋ฐฑ null ์ฒ๋ฆฌ
                        postPs.job,
                        (!postPs.mgr.trim())?null:parseInt(postPs.mgr), // ๊ณต๋ฐฑ null ์ฒ๋ฆฌ // ๊ณต๋ฐฑ์ ์ ๊ฑฐํ์๋ ๊ณต๋ฐฑ์ด๋ฉด ?
                        (postPs.deptno.trim()=="")?null:parseInt(postPs.deptno), // ๊ณต๋ฐฑ null ์ฒ๋ฆฌ
                        postPs.hiredate,
                        parseInt(postPs.empno)]) // empno ๋ pk. ๋ฌด์กฐ๊ฑด ์๋ ฅํด์ผํ๋ ๊ฐ
                        // DML // execute : mysql ํ๋ผ๋ฏธ์ค ๊ฐ์ฒด(๋๊ธฐํ)
                    console.log(result);
                    update=result.affectedRows;
                }catch(e){
                    console.error(e);
                }
                // ์ค๋ฅ์์ด ์ ์คํ๋๊ณ  update ๋ ์๋๋ฉด update=1
                if(update>0){ // ์๋ฐ์ดํธ๊ฐ ์ฑ๊ณต๋๋ฉด
                    // 302 : redirect (์ด ํ์ด์ง๊ฐ ์ง์  ์๋ตํ์ง ์๊ณ  ๋ค๋ฅธ ํ์ด์ง๊ฐ ์๋ตํ๋๋ก ๋ค์ ์๋ฒ ๋ด๋ถ์์ ์์ฒญ)
                    res.writeHead(302,{location:"/empDetail.do?empno="+postPs.empno});
                    res.end();
                } else{ // ์๋ฐ์ดํธ๊ฐ ์คํจํ๋ฉด
                    res.writeHead(302,{location:"/empUpdate.do?empno="+postPs.empno});
                    res.end();
                }
            });
        }else if(urlObj.pathname==="/empInsert.do"&&req.method==="GET"){
            //๐empInsert ๋ฑ๋ก ํ์ด์ง
            let html=pug.renderFile("./templates/empInsert.pug");
            res.write(html);
            res.end();
        }else if(urlObj.pathname==="/empInsert.do"&&req.method==="POST"){
            let postQuery="";
            req.on("data",(p)=>{ // POST ํ๋ผ๋ฏธํฐ์ ๊ฐ ๋์.
                postQuery+=p;
            })
            req.on("end",async()=>{
                const postPs=querystring.parse(postQuery);
                for(let key in postPs) {
                    if(postPs[key].trim()=="") postPs[key]=null; // input value ๊ณต๋ฐฑ"" => null ์ฒ๋ฆฌ
                }
                let sql=`INSERT INTO EMP (EMPNO, ENAME, JOB, MGR, HIREDATE, SAL, COMM, DEPTNO)
                                            VALUE (?,?,?,?,?,?,?,?)`;
                let insert=0; // ๋ฑ๋ก ์ฑ๊ณต์ฌ๋ถ ํ์ธ์ฉ ๋ณ์
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
                        ]); // ๋ฌผ์ํ? ์ ํ๋ผ๋ฏธํฐ ๋์
                    insert=result.affectedRows;
                }catch (e) {
                    console.error(e);
                }
                if(insert>0){ // ๋ฑ๋ก ์ฑ๊ณต
                    res.writeHead(302,{location:"/empList.do"});
                    res.end();
                }else{ // ๋ฑ๋ก ์คํจ
                    res.writeHead(302,{location:"/empInsert.do"});
                    res.end();
                }
            });
        } else if(urlObj.pathname==="/empDelete.do") {
            //๐empDelete ์ญ์  ํ์ด์ง
            let empno=Number(params.empno);
            if(Number.isNaN(empno)) { // NaN ์ธ๊ฒฝ์ฐ
                res.statusCode=400;
                res.write("<h1>ํด๋น ํ์ด์ง์ ๊ผญ ํ์ํ ํ๋ผ๋ฏธํฐ๋ฅผ ๋ณด๋ด์ง ์์์ต๋๋ค!</h1>")
                res.end();
                return;
            }
            let sql="DELETE FROM EMP WHERE EMPNO=?"
            let del=0; // ์ญ์  ์ฑ๊ณต์ฌ๋ถ ์ฒดํฌ
            try{
                const [result]=await pool.execute(sql,[empno]);
                del=result.affectedRows;
            }catch(e){
                console.error(e);
            }
            if(del>0){ // ์ญ์  ์ฑ๊ณต
                res.writeHead(302,{location:"/empList.do"});
                res.end();
            }else{ // ์ญ์  ์คํจ
                res.writeHead(302,{location:"/empUpdate.do?empno="+params.empno});
                res.end();
            }
        } else if(urlObj.pathname==="/deptList.do") {
            //๐deptList ์กฐํ ํ์ด์ง
            try { // pool.query : SELECT
                const [rows,f]=await pool.query("SELECT * FROM DEPT");
                let html=pug.renderFile("./templates/deptList.pug", {deptList:rows}); // ๐
                // ๐rows ๋ ํด๋นํ๋ sql DEPT ํ์ด๋ธ์ ์ ์ฒด ํ์คํ์ค ์ ๋ถ๋ฅผ ๋ด์ ๊ฒ.
                // ๐deptList ๋ ๋ณ์๋ช. rows ์์๋ DEPT ํ์ด๋ธ์ด ๋ค์ด๊ฐ ์๋ค.
                res.write(html);
                res.end();
            }catch(e){
                console.error(e);
            }
        }else if(urlObj.pathname==="/deptDetail.do"){
            //๐deptDetail ์์ธ ํ์ด์ง
            let deptno=Number(params.deptno);  // ํ๋ผ๋ฏธํฐ ์ ์ ํ๋ณํ
            if(Number.isNaN(deptno)) { // ํ๋ผ๋ฏธํฐ๊ฐ NaN์ธ ๊ฒฝ์ฐ
                res.statusCode=400;
                res.write("<h1>ํด๋น ํ์ด์ง์ ๊ผญ ํ์ํ ํ๋ผ๋ฏธํฐ๋ฅผ ๋ณด๋ด์ง ์์์ต๋๋ค!</h1>");
                res.end();
                return;
            } // ํ๋ผ๋ฏธํฐ๊ฐ NaN์ด ์๋ ๊ฒฝ์ฐ
            let sql="SELECT * FROM DEPT WHERE DEPTNO=?";
            const [rows,f]=await pool.query(sql,[deptno]); // ๐ sql DEPTNO=? ํ๋ผ๋ฏธํฐ ๋ค์ ํ๋ผ๋ฏธํฐ deptno ๋ฅผ ๋ฃ์ ๊ทธ ๊ฐ์ด rows
            let html=pug.renderFile("./templates/deptDetail.pug",{dept:rows[0]});
            // ๐rows ๋ ํด๋นํ๋ deptno ํ๋ผ๋ฏธํฐ์ ๋์ผํ deptno๋ฅผ ๊ฐ์ง ๊ฐ์ฒด. deptno ๋ ์ ์ผํ ๊ฐ์ด๋ฏ๋ก ๊ฐ์ด ํ๋์ด๊ธฐ ๋๋ฌธ์ rows[0] ์ด๋ผ๊ณ  ํํ
            // => ํ๋ผ๋ฏธํฐ์ ๋ง๋ deptno ๋ฅผ ๊ฐ์ง ๊ฐ์ฒด๊ฐ html ๋ฌธ์์ด๋ก ์ถ๋ ฅ๋๋ค.
            res.write(html);
            res.end();
        }else if(urlObj.pathname==="/deptUpdate.do"&&req.method==="GET") { // form ์์
            //๐deptUpdate ์์ธ ํ์ด์ง
            let deptno=Number(params.deptno);
            if(Number.isNaN(deptno)) { // NaN ์ธ๊ฒฝ์ฐ
                res.statusCode=400;
                res.write("<h1>ํด๋น ํ์ด์ง์ ๊ผญ ํ์ํ ํ๋ผ๋ฏธํฐ๋ฅผ ๋ณด๋ด์ง ์์์ต๋๋ค!</h1>")
                res.end();
                return;
            }
            let sql="SELECT * FROM DEPT WHERE DEPTNO=?";
            const [rows,f]=await pool.query(sql,[deptno]);
            // html ๋ฌธ์์๋ html ํ์ผ์ด๋ผ๋ ์์์ด๋ผ๊ณ  head ์์ ์ ๋ณด๊ฐ ๋ค์ด๊ฐ ์๊ธฐ ๋๋ฌธ์
            // ์๋ตํค๋๋ก ์ด๋ค ํ์ผ์์์ผ๋ก ์๋ตํ๊ฒ ๋ค๋ผ๊ณ  ๋ช์ํ์ง ์์๋ ๋๋ค.
            let html=pug.renderFile("./templates/deptUpdate.pug",{dept:rows[0]});
            res.write(html);
            res.end();
        }else if(urlObj.pathname==="/deptUpdate.do"&&req.method==="POST"){ // form ์ก์. ์ ๋ณด ์ ์ก
            let postquery=""; // POST ํ๋ผ๋ฏธํฐ ๋ถ๋ฌ์ฌ ๋ณ์์ ์ธ
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
                    // DEPTNO ๋ถ์๋ฒํธ๋ pk(primary key) ๋ํ ํค - pk๋ฅผ ์ฐธ์กฐํ๋ ์ฌ์์ด ์๋ ๊ฒฝ์ฐ ์ญ์ ํ  ์ ์๋ค. - ์ฐธ์กฐ์ ๋ฌด๊ฒฐ์ฑ
                    console.log(result);
                    update=result.affectedRows;
                }catch(e){
                    console.error(e);
                }
                // ์ค๋ฅ์์ด ์ ์คํ๋๊ณ  update ๋ ์๋๋ฉด update=1
                if(update>0){ // ์๋ฐ์ดํธ๊ฐ ์ฑ๊ณต๋๋ฉด
                    // 302 : redirect (์ด ํ์ด์ง๊ฐ ์ง์  ์๋ตํ์ง ์๊ณ  ๋ค๋ฅธ ํ์ด์ง๊ฐ ์๋ตํ๋๋ก ๋ค์ ์๋ฒ ๋ด๋ถ์์ ์์ฒญ)
                    res.writeHead(302,{location:"/deptDetail.do?deptno="+postPs.deptno});
                    res.end();
                } else{ // ์๋ฐ์ดํธ๊ฐ ์คํจํ๋ฉด
                    res.writeHead(302,{location:"/deptUpdate.do?deptno="+postPs.deptno});
                    res.end();
                }
            });
        }else if(urlObj.pathname==="/deptInsert.do"&&req.method==="GET"){
            //๐deptInsert ๋ฑ๋ก ํ์ด์ง
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
                let insert=0; // ๋ฑ๋ก ์ฑ๊ณต์ฌ๋ถ ์ฒดํฌ ๋ณ์
                try {
                    const [result]=await pool.execute(sql,[postPs.deptno,postPs.dname,postPs.loc]);
                    insert=result.affectedRows;
                }catch (e) {
                    console.error(e);
                }
                if(insert>0){ // ๋ฑ๋ก ์ฑ๊ณต
                    res.writeHead(302,{location:"/deptList.do"});
                    res.end();
                }else{ // ๋ฑ๋ก ์คํจ
                    res.writeHead(302,{location:"/deptInsert.do"});
                    res.end();
                }
            });
        } else if(urlObj.pathname==="/deptDelete.do") {
            //๐deptDelete ์ญ์  ํ์ด์ง
            let deptno=Number(params.deptno);
            if(Number.isNaN(deptno)) { // NaN ์ธ๊ฒฝ์ฐ
                res.statusCode=400;
                res.write("<h1>ํด๋น ํ์ด์ง์ ๊ผญ ํ์ํ ํ๋ผ๋ฏธํฐ๋ฅผ ๋ณด๋ด์ง ์์์ต๋๋ค!</h1>")
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
          // ๐AJAX ์ ์๋ฆฌ! - ์ฌ์๋ฒํธ์ฒดํฌ์์๐
        } else if(urlObj.pathname==="/empnoCheck.do") {
            //empno๊ฐ ๋์ผํ ์ฌ์์ด ์์ผ๋ฉด true ์์ผ๋ฉด false
            const resObj={checkId: false, emp:null}; // id์ฒดํฌ, ์ฌ์์ ๋ณด // Object ๋ฅผ ๋ฌธ์์ด๋ก ์๋ตํ๋ JSON ์ด๋ผ ๋ถ๋ฅธ๋ค.
            // ํ์ด์ง ํ๋ผ๋ฏธํฐ ์์ฒญ์ ์๋ชปํ ๊ฒฝ์ฐ - ์๋ฌ
            if(!params.empno || isNaN(params.empno)) { // (null,undefined,"" : ๋ฌธ์์ด / 0) => false;
                // ํ๋ผ๋ฏธํฐ๊ฐ null(์์) ์ด๊ฑฐ๋ NaN(๋ฌธ์ํฌํจ) ์ธ ๊ฒฝ์ฐ
                res.statusCode=400; // ์ด ๋์  ํ์ด์ง์ ์์ฒญ์ ์ ๋ชป ํ๋ค.(๊ผญ ํ์ํ ํ๋ผ๋ฏธํฐ๊ฐ ์๋ค)
                res.end(); // ์๋ต์ข๋ฃ
                return; // if๋ฌธ์ ํฌํจํ๋ ํจ์ ์ข๋ฃ // ์๋ ์ฝ๋ ์คํ ์๋จ
            }
            // ํ๋ผ๋ฏธํฐ ์์ฒญ์ ์ ํ๊ฒฝ์ฐ! (์ if๋ฌธ ์คํ ์๋จ)
            let empno=parseInt(params.empno); // ํ๋ผ๋ฏธํฐ ์ ์๋ก ํ๋ณํ
            // ๋ฐ์ดํฐ ์ ์ํ๊ธฐ!
            let sql="SELECT * FROM EMP WHERE EMPNO=?";
            try{ // ํต์ ์ค๋ฅ ์์ธ์ฒ๋ฆฌ - mysql ์ ์(pool)
                const[rows,f]=await pool.query(sql,[empno]);
                // ๐ pool.query(sql,ํ๋ผ๋ฏธํฐ) (== SELECT)
                // => sql ํ์ด๋ธ ์กฐ๊ฑด์ ์ฒซ๋ฒ์งธ ? ๋ฌผ์ํ์ ํ๋ผ๋ฏธํฐ empno ๋ฃ๊ธฐ
                // => ๊ฒฐ๊ณผ๋ฅผ ์ค๋ธ์ ํธ(๋ฐฐ์ด)๋ก ๋ฐํํ๋ค => rows(ํด๋น empno์ ๋ง๋ ํ์ด๋ธ-๊ฐ๋ก.emp.๊ฐ์ฒด.์ฌ์), f(ํ์ด๋ธ๊ตฌ์กฐ)
                if(rows.length>0) { // empno ํ๋ผ๋ฏธํฐ ์กฐ๊ฑด์ ๋ง์กฑํ๋ emp๊ฐ 1๋ช ์๋ ๊ฒฝ์ฐ (empno๋ pk ๋ผ์ ์ค๋ณต์์ด ํ๋๋ง ๊ฐ๋ฅ)
                    resObj.checkId=true;
                    resObj.emp=rows[0]; // ํ๋ผ๋ฏธํฐ empno์ ํด๋นํ๋ ์ฌ์์ ๋ณด
                }
            }catch(e){
                console.error(e); // ์ค๋ฅ๊ฐ ๋ฐ์ํ๋ฉด 500
                res.statusCode=500;
                res.end();
                return;
            }
            // ์๋ตํค๋ : ์๋ตํ๋ ๋ฌธ์ํ์ - json
            res.setHeader("content-type","application/json;charset=UTF-8;");
            res.write(JSON.stringify(resObj));
            res.end();

        } else if(urlObj.pathname==="/deptnoCheck.do") {
            const resObj={checkDeptno: false, dept:null};
            // ํ์ด์ง ํ๋ผ๋ฏธํฐ ์์ฒญ์ ์๋ชปํ ๊ฒฝ์ฐ - ์๋ฌ
            if(!params.deptno || isNaN(params.deptno)) { // (null,undefined,"" : ๋ฌธ์์ด / 0) => false;
                // ํ๋ผ๋ฏธํฐ๊ฐ null(์์) ์ด๊ฑฐ๋ NaN(๋ฌธ์ํฌํจ) ์ธ ๊ฒฝ์ฐ
                res.statusCode=400; // ์ด ๋์  ํ์ด์ง์ ์์ฒญ์ ์ ๋ชป ํ๋ค.(๊ผญ ํ์ํ ํ๋ผ๋ฏธํฐ๊ฐ ์๋ค)
                res.end(); // ์๋ต์ข๋ฃ
                return; // if๋ฌธ์ ํฌํจํ๋ ํจ์ ์ข๋ฃ // ์๋ ์ฝ๋ ์คํ ์๋จ
            }
            // ํ๋ผ๋ฏธํฐ ์์ฒญ์ ์ ํ๊ฒฝ์ฐ! (์ if๋ฌธ ์คํ ์๋จ)
            let deptno=parseInt(params.deptno); // ํ๋ผ๋ฏธํฐ ์ ์๋ก ํ๋ณํ
            // ๋ฐ์ดํฐ ์ ์ํ๊ธฐ!
            let sql="SELECT * FROM DEPT WHERE DEPTNO=?";
            try{ // ํต์ ์ค๋ฅ ์์ธ์ฒ๋ฆฌ - mysql ์ ์(pool)
                const[rows,f]=await pool.query(sql,[deptno]);
                // ๐ pool.query(sql,ํ๋ผ๋ฏธํฐ) (== SELECT)
                // => sql ํ์ด๋ธ ์กฐ๊ฑด์ ์ฒซ๋ฒ์งธ ? ๋ฌผ์ํ์ ํ๋ผ๋ฏธํฐ empno ๋ฃ๊ธฐ
                // => ๊ฒฐ๊ณผ๋ฅผ ์ค๋ธ์ ํธ(๋ฐฐ์ด)๋ก ๋ฐํํ๋ค => rows(ํด๋น empno์ ๋ง๋ ํ์ด๋ธ-๊ฐ๋ก.emp.๊ฐ์ฒด.์ฌ์), f(ํ์ด๋ธ๊ตฌ์กฐ)
                if(rows.length>0) { // empno ํ๋ผ๋ฏธํฐ ์กฐ๊ฑด์ ๋ง์กฑํ๋ emp๊ฐ 1๋ช ์๋ ๊ฒฝ์ฐ (empno๋ pk ๋ผ์ ์ค๋ณต์์ด ํ๋๋ง ๊ฐ๋ฅ)
                    resObj.checkDeptno=true;
                    resObj.dept=rows[0]; // ํ๋ผ๋ฏธํฐ empno์ ํด๋นํ๋ ์ฌ์์ ๋ณด
                }
            }catch(e){
                console.error(e); // ์ค๋ฅ๊ฐ ๋ฐ์ํ๋ฉด 500
                res.statusCode=500;
                res.end();
                return;
            }
            // ์๋ตํค๋ : ์๋ตํ๋ ๋ฌธ์ํ์ - json
            res.setHeader("content-type","application/json;charset=UTF-8;");
            res.write(JSON.stringify(resObj));
            res.end();
        }


        // ๐์ฌ๋ฒ ํ์ธํ์ด์ง ๋น๋๊ธฐ ํต์  : AJAX(XMLHttpRequest, fetch)
        /*   else if(urlObj.pathname==="/empnoCheck.do") {
            // ๐Object ๊ฐ์ฒด
            // {key: value} => ๋ฌธ์ํ, ๋ฌธ์์ด JSON (๋ธ๋ผ์ฐ์ ์ ์์ฒญ์ ์๋ตํ  ๋ฌธ์(๋ฐ์ดํฐ) ์์)
            // JSON ์ ๋ฌธ์๋ ๋๊ณ  ๊ฐ์ฒด์ด๊ธฐ๋ ํ๋ค.
            // ํต์  data ์ฃผ๊ณ  ๋ฐ์ผ๋ ค๊ณ 
            // http ํต์ ์ html ๋ฌธ์๋ฅผ ์๋ฒ์ ๋ธ๋ผ์ฐ์ ๊ฐ ์ฃผ๊ณ  ๋ฐ์ผ๋ ค๊ณ  (๋ธ๋ผ์ฐ์ ๋ html ์ ๊ทธ๋ํฝ์ผ๋ก ํํํ๋ ๋ฐ ์ฌ์ฉ)
            // http(๋ชจ๋ ) ํต์ ์์ xml ํ๊ทธ๋ก ๊ตฌ๋ถ๋์ด ์๋ ๋ฐ์ดํฐ๋ฅผ ์ฃผ๊ณ  ๋ฐ๊ธฐ ์ํด์
            // http(๋ชจ๋ ) ํต์ ์์ json ๋ฌธ์๋ ๊ฐ์ฒด๋ฅผ ๋ฌธ์์ด๋ก ๋ณํ๋ ๋ฐ์ดํฐ๋ฅผ ์ฃผ๊ณ  ๋ฐ๊ธฐ ์ํด์
            const resObj={checkId:false, emp:null}; // JSON // emp : ์ฌ์์ ๋ณด
            // => Object(๊ฐ์ฒด)๋ฅผ ๋ฌธ์์ด๋ก ์๋ตํ๋ ๊ฒ์ JSON ์ด๋ผ ๋ถ๋ฅธ๋ค.
            // key ํํ "" ๋ฐ์ดํ ๋ถ์ฌ๋ ๋๊ณ , '' ๋๋ ์์ ์ด๋ ๋๋ค.
            // empno ๊ฐ ๋์ผํ ์ฌ์์ด ์์ผ๋ฉด true , ์์ผ๋ฉด false
            if(!params.empno || isNaN(params.empno)) { // (null,undefined,"",0(x - ๋ฌธ์์ด์ด ์ฌ๊ฑฐ๋๊น 0์ ์ ์ธ))=>false
                res.statusCode=400; // ์๋ฌ // ์ด ๋์  ํ์ด์ง์ ์์ฒญ์ ์๋ชปํ๋ค.(๊ผญ ํ์ํ ํ๋ผ๋ฏธํฐ๊ฐ ์๋ค.)
                res.end(); return;
            }
            // * params ํ๋ผ๋ฏธํฐ empno ๊ฐ ์๊ณ  empno ๊ฐ NaN ์ด ์๋ ๊ฒฝ์ฐ(number ์ธ ๊ฒฝ์ฐ)
            let empno=parseInt(params.empno); // ํ๋ผ๋ฏธํฐ empno ์ ์ ํ๋ณํ
            let sql="SELECT * FROM EMP WHERE EMPNO=?"; // ๊ฒฐ๊ณผ๊ฐ ์์ผ๋ฉด true, ์์ผ๋ฉด false
            try { // ๐์์ธ์ฒ๋ฆฌ!
                const[rows,f]=await pool.query(sql,[empno]); //empno ๋ฅผ sql ํ๋ผ๋ฏธํฐ์ ๋ด๊ฒ ๋ค , rows ๋ ๊ฒฐ๊ณผ
                //๐pool.query (== SELECT) : ๋ฌด์กฐ๊ฑด SELECT ์ ๊ฒฐ๊ณผ๋ ๋ฐฐ์ด์ด๋ค. // ๋ฌผ์ํ 2๋ฒ์งธ 3๋ฒ์งธ์ ํ๋ผ๋ฏธํฐ ๋ฃ๋๊ฑฐ๋ [empno, deptno, ename] ์ด๋ฐ์์ผ๋ก ์ฐ๊ธฐ // ๋ฌผ์ํ ์ฒซ๋ฒ์งธ์ empno ํ๋ผ๋ฏธํฐ ๋ฃ๊ธฐ // preparedstatement ๊ฐ ํฌํจ๋์ด ์๋ค. // ๋ฌผ์ํ์ ์์น์๋ค๊ฐ ํ๋ผ๋ฏธํฐ๋ฅผ ๋ฃ์ ์ ์๋ค.
                // ๐mysql pool.query ๋ ๊ฒฐ๊ณผ๋ฅผ ์ค๋ธ์ ํธ๋ก ๋ฐํํ๋ค (mysql ์์ ์๋ต๋ฐ์ responseText ๋ฌธ์์ด์ ์ค๋ธ์ ํธ๋ก ํ์ฑํ๋ ๊ณผ์ ์ด ํฌํจ๋์๋ค) // ๊ทธ๋ฅ mysql ์์ ํ์ผ ๋ถ๋ฌ์ค๋ ๊ฒ์ ํ์ฑ์ ํด์ค์ผ ํ๋ค.
                if(rows.length>0) { // ์ฌ๋ฒ์ด ์ค๋ณต์ธ ๊ฒฝ์ฐ๐ // ์๋ ฅํ ์ฌ๋ฒ์ ๊ฐ์ฒด๊ฐ 0๋ณด๋ค ํฌ๋ค ๋ ์ด๋ฏธ ๊ทธ ์ฌ๋ฒ์ ์ฐ๋ ๊ฐ์ฒด๊ฐ 1๋ช์ด๋ผ๋ ์๋ค๋ ๊ฒ )// rows ๋ ๋ด๊ฐ ์๋ ฅํ empno ์ฌ๋ฒ์ ํ๋ผ๋ฏธํฐ๋ก ๊ฐ๋ ๊ฒฐ๊ณผ. SELECT ๋ ๋ฌด์กฐ๊ฑด ๋ฐฐ์ด์ด๋ผ์. // ๋ด๊ฐ์๋ ฅํ ์ฌ๋ฒ์ ํ๋๋ฟ
                    resObj.checkId=true;
                    resObj.emp=rows[0]; // emp : ์ฌ์์ ๋ณด // ex) ์ค๋ฏธ์ค์ ์ฌ๋ฒ์ด ๊ฐ์ผ๋ฉด // ๐๋ด๊ฐ ์๋ ฅํ empno ์ฌ๋ฒ์ ๊ฐ๋ ๊ฐ์ฒด. ์ด์ฐจํผ ๊ฐ์ฒด๊ฐ 1๊ฐ๋ผ์ 0๋ฒ์งธ ์ธ๋ฑ์ค๋ก ํํ
                }
            }catch(e){
                console.error(e); // ์ค๋ฅ๊ฐ ๋ฐ์ํ๋ฉด 500(์๋ฒ์์ ๋ฐ์ํ๋ ์ค๋ฅ)
                res.statusCode=500; // ? ์์๋ ค์ค => ์ค๋ฅ๋ ๊ณ ๋ง์ด ์น๊ตฌ!
                res.end(); return;
            }
            // json ์ผ๋ก ์๋ตํ๋ ๋ฌธ์
            res.setHeader("content-type","application/json;charset=UTF-8;"); // ์๋ตํ๋ ๋ฌธ์ํ์
            res.write(JSON.stringify(resObj)); // {"checkId":true} ๋ฌธ์์ด๋ก
            res.end();
        }


        */




        else {
            res.statusCode=404;
            res.setHeader("content-type","text/html;charset=UTF-8");
            res.write("<h1>์กด์ฌํ์ง ์๋ ํ์ด์ง ์๋๋ค.</h1>")
            res.end();
        }
    }
})


