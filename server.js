const express = require("express");
const mysql = require("mysql");
const cors =require("cors");
const app = express();
app.use(express.json());
app.use(cors());

const db = require('./config/db')

db.connect((err) => {

if (err) {
throw err;
}
console.log("MySql Connected");
});
/*Login Node Details*/
app.post("/login", (req, res) => {

  const username=req.body.username;
  const password=req.body.password;
console.log(username,"username",password,"pass");

  var sql="SELECT * FROM user WHERE uid =? AND pass =?;SELECT * FROM admin WHERE uid=? AND pass=?"
  db.query(sql,
  [username,password,username,password],
  
  ( err,result)=>{
  if(result[0].length>0)
  {
 
    if(result[0][0].uid===username&&result[0][0].pass===password){
   
  res.send(result[0])
    }
    else{
      res.send({message:"Invalid username"});
      console.log("invalid password")
    }
  
  
}

else if(result[1].length>0){
if(result[1][0].uid===username&&result[1][0].pass===password){
 
    res.send(result[1])
    
    
  }
  else{
    res.send({message:"Invalid username"});
    console.log("invalid password")
  }
}
  else{
   
  res.send({message:"Invalid userid/password"});
  }
  
  });
  
  });

/*Forget Node 
console.log("BEFORE FORGET")
app.post("/forget", (req, res) => {
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
  

 */ 


      
app.listen(process.env.PORT || 3001, () => {

    console.log("Server started on port 3000");
    
    });
    