const express = require("express");
const mysql = require("mysql");
const cors =require("cors");
const app = express();
app.use(express.json());
app.use(cors());
const PORT=process.env.PORT ;
const db = require('./config/db')

db.connect((err) => {

if (err) {
throw err;
}
console.log("MySql Connected");
});

/*Forget Node */
console.log("BEFORE FORGET")
app.post("https://backendserver01.herokuapp.com/forget", (req, res) => {
  console.log("AFTER FORGET")
  const username=req.body.username;
  const password=req.body.password;
  const cpassword=req.body.cpassword;
  console.log("username",username,"pass",password,"cpass",cpassword)
   let userarr=[];
  db.query( "SELECT count(*) as length FROM user", function (err, result) {
    if (err) throw err;
    count=result[0].length
	 var sql="SELECT * FROM user;SELECT * FROM admin"
  db.query(sql,function (err, result) {
    if (err) throw err;
    for(var i=0;i<count;i++)
    {
userarr.push(result[0][i].uid);
    }
	for(var i=0;i<1;i++)
	{
	userarr.push(result[1][0].uid)
	}
  console.log("userarr",userarr)
  if(userarr.includes(username))
  {
  if(password===cpassword){
      db.query("UPDATE heroku_0a6414aa002a7cc.admin SET pass= ? WHERE uid =?",
  [password,username],
  ( err,result)=>{
      if(result.affectedRows!=0){
      
          res.send({message:"updated password successfully..! please login"});
      }
     })
}
 else{
   res.send({message:"password and confirm password not mismatched"});  
  }
}
else{
 res.send({message:"invalid username"}); 
}
  });
  })
})
  

  


      
app.listen(PORT, () => {

    console.log("Server started on port 3000");
    
    });
    