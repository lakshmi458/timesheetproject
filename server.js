const express = require("express");
const mysql = require("mysql");
const cors =require("cors");
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const app = express();
const Moment=require('moment')
app.use(express.json());
app.use(cors());

//const db = require('./config/db')

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
   
  
    
    res.send(result[0])
    
    
    
    
  }

  else if(result[1].length>0){
    res.send(result[1])
 
  }
    else{
     
    res.send({message:"Invalid userid/password"});
    }
    
    });
    
    });
/*Forget Node */
app.post("/forget", (req, res) => {

  const username=req.body.username;
  const password=req.body.password;
  const cpassword=req.body.cpassword;
   let userarr=[];
   let userarr1=[];
  db.query( "SELECT count(*) as length FROM user", function (err, result) {
    if (err) throw err;
    count=result[0].length
	 var sql="SELECT * FROM user;SELECT * FROM admin"
  db.query(sql,function (err, result) {
    if (err) throw err;
    for(var i=0;i<count;i++)
    {
userarr.push(result[0][i].uid);
userarr1.push(result[0][i].uid.toLowerCase())
    }
	for(var i=0;i<1;i++)
	{
	userarr.push(result[1][0].uid)
  userarr1.push(result[1][0].uid.toLowerCase())
	}
  console.log("userarr",userarr)
  console.log("userarr1",userarr1)
  if(userarr.includes(username)||userarr1.includes(username))
  {
  if(password===cpassword){
      db.query("UPDATE user SET pass= ? WHERE uid =?",
  [password,username],
  ( err,result)=>{
      if(result.affectedRows!=0){
      
          res.send({message:"updated password successfully..! please login"});
      }
     })
}
 else{
   res.send({message:"password and confirm password not matched"});  
  }
}
else{
 res.send({message:"invalid username"}); 
}
  });
  })
})
  

/*Register Node Id generation*/
app.get("/register", (req, res) => {
  let userarr=[];
  db.query( "SELECT count(*) as length FROM user", function (err, result) {
    if (err) throw err;
    count=result[0].length
	 var sql="SELECT * FROM user"
  db.query(sql,function (err, result) {
    if(result.length>0)
    {
      for(var i=0;i<count;i++)
      {
  userarr.push(result[i].uid.slice(2));
  
      }
      let id=""
      console.log("user",userarr)
     
     let len= Math.max(...userarr)
   console.log("len",len)
   
    
  
      len=parseInt(len)+1
      id ="DS"+len;
   
       res.send({id});
    }
    else
    {
      id ="DS"+1;
      res.send({id});
    
   
}
 
})
})
})


/*Register new employee details*/
app.post("/register", (req, res) => {
  
const email=req.body.emailid;
const userid=req.body.userid.toUpperCase();
const companyid=req.body.companyid.toUpperCase();
const firstname=req.body.firstname.toUpperCase();
const lastname=req.body.lastname.toUpperCase();
const gender=req.body.gender;
const mobile=req.body.mobileno;
const password=req.body.password;
const role=req.body.role;



db.query("INSERT INTO user (Email,uid,cid,fname,lname,gender,mobile,pass,Role,Status) VALUES (?,?,?,?,?,?,?,?,?,?)",
[email,userid,companyid,firstname,lastname,gender,mobile,password,role,"A"],

( err,result)=>{
if(err)

console.log(err);

if(result){

res.send({message:"Registration is success"});
} else{
res.send({message:"Already Registered"});
}
}

);

});


/*Id Dropdown will get the userid's from database*/
app.get("/idsdropdown",(req,res)=>{
  db.query("SELECT uid,fname FROM user",( err,result)=>{  
if(result){
   res.send(result);
   console.log(result)
}
else{
   console.log(err);
}
  })

})

/*selectprofile will get the profile details of given userid*/
app.get("/selectprofile", (req, res) => {
  let userid=req.query.a;

 db.query("SELECT * FROM user WHERE uid=?",[userid],function(err,result){
     if(result){
 res.send(result);
     }
     else{
         res.send({message:"nothing"});
     }
  })
})

/*Here we are able to update the employee details*/
app.post("/updateprofile", (req, res) => {
   
  const email=req.body.emailid;
  const userid=req.body.userid.toUpperCase();
  const companyid=req.body.companyid.toUpperCase();
  const firstname=req.body.firstname.toUpperCase();
  const lastname=req.body.lastname.toUpperCase();
  const gender=req.body.gender;
  const mobile=req.body.mobileno;
  const password=req.body.password;
  const role=req.body.role;
 const status=req.body.status;
 
  
  db.query("UPDATE user SET Email=?,uid=?,cid=?,fname=?,lname=?,gender=?,mobile=?,pass=?,Role=?,Status=? WHERE uid=?",
  [email,userid,companyid,firstname,lastname,gender,mobile,password,role,status,userid],
  
  ( err,result)=>{
  if(err)
  
  console.log("update Register Error: ",err);
  
  if(result){
  
  res.send({message:"Updated  successfully.."});
  
  }
  }
  );
  });




  /*insert project details Node*/
     app.post("/CreateProject", (req, res) => {
      var Projectarr=[];
      var ProjectCount='';
	   db.query( "SELECT count(*) as length FROM project", function (err, result) {
     if (err) throw err;
     ProjectCount=result[0].length
     //console.log(ProjectCount);
	  db.query("select * from project", function (err, result) {
   Projectarr=[];
      if (err) throw err;
      for(var i=0;i<ProjectCount;i++)
      {
      Projectarr[i]=result[i].Project;
    
   
      }
    
      const taskList=req.body.taskList;
      const id=req.body.id;
      //console.log(taskList)
      //console.log("Projectarr",Projectarr)
      
    let ProjectValue=[];
    var k=0;
      for(var i=0;i<taskList.length;i++)
      {
     //console.log("taskList"+taskList[i].Project);
    
    
         if(Projectarr.includes(taskList[i].Project.toUpperCase()))
         {
     
          //console.log("there");
      }
      else{
          //console.log("hii");
         // Projectarr[ProjectCount]=taskList[i].Project+"^"+taskList[i].Client;
       //   ProjectCount++;
          k++;
          ProjectValue.push(new Array(id,taskList[i].Project.toUpperCase(),taskList[i].NoOfHours,taskList[i].PStartDate,taskList[i].PEndDate,taskList[i].Resources))
      }}
      //console.log("ProjectValues:",ProjectValue);
      var sql="insert into Project(UserId,Project,NoOfHours,PStartDate,PEndDate,Resources) VALUES?";
    
   if(k>0)
   {
     //console.log("Hello");
      db.query(sql,[ProjectValue],
      // db.query("insert into project(UserId,Client,Project,NoOfHours,PStartDate,PEndDate,Resources) VALUES (?,?,?,?,?,?,?)",
      // [id,taskList[i].Client,taskList[i].projectName,taskList[i].Hours,taskList[i].PStartDate,taskList[i].PEndDate,taskList[i].Resources],
      // );
      
  
      (err,result)=>{
      
        if(result){
          res.send({message:"Data Inserted Successfully"});
        //  res.send(result);
              }
              else{
                 // res.send({message:"Already Project Exited"});
              }
  }
  );
      
      }
      else{
        //console.log("else block")
        db.query("select * from project",
        (err,result)=>{
      
          if(result){
            res.send({message:"Already Project Exited"});
                }
                // else{
                //     res.send({message:"Already Project Exited"});
                // }
    }
    );
      }
  
      
      
      
      
      
  }
  );
     });
	    });

 /*edit project request node*/
 app.post("/EditProjectRequest",(req,res)=>{
  db.query("SELECT Project FROM project",( err,result)=>{  
if(result){
   res.send(result);


}
else{
   console.log(err);
}
  })

})

/*Project Select Node*/
app.get("/ProjectSelect", (req, res) => {
  let ProjectClient=req.query.a;
//console.log(ProjectClient);


 db.query("SELECT * FROM project WHERE Project=?",[ProjectClient],function(err,result){
     if(result){
 res.send(result);
 //res.render(result);
     }
     else{
         res.send({message:"nothing"});
     }
  })
})

/*Edit Project Node*/
app.post("/editProject", (req, res) => {
  const taskList=req.body.taskList;
  const id=req.body.id;
  const ProjectClient=req.body.ProjectClient;
  //console.log(ProjectClient)
 let projectclient=[];
 projectclient=ProjectClient.split(",");


if(taskList.length>0)
{
 
 //console.log("taskList"+taskList[0].Project);
  db.query("UPDATE project SET UserId=?,Project=?,NoOfHours=?,PStartDate=?,PEndDate=?,Resources=? WHERE Project=?",
[id,taskList[0].Project,taskList[0].NoOfHours, taskList[0].PStartDate,taskList[0].PEndDate,taskList[0].Resources,taskList[0].Project],
  

  (err,result)=>{
  
    if(result){
     // res.send(result);
      res.send({message:"Data Successfully Updated"});
      //console.log("Data Successfully Updated")
          }
          else{
              res.send({message:"Already Project Exited"});
          }
}
);
  
  }
  else{
    //console.log("Hello")
    db.query("Delete from project WHERE Client=? AND Project=?",[projectclient[0],projectclient[1]],
    (err,result)=>{
  
      if(result){
       // res.send(result);
        res.send({message:"Data Successfully Deleted"});
      //  console.log("Data Successfully Deleted")
            }
            else{
                res.send({message:"Already Project Exited"});
            }
  }
  );
  }
}
)
  
  


/*Create TimeSheet Node*/
app.post("/edittimesheet", (req, res) => {
  var TimeSheetarr=[];
  let k=0;
  let l=0;
  let j=0;
  let sickleave=0;
  let vacationLeave=0;
 var TimeSheetCount='';
 db.query( "SELECT count(*) as length FROM edittimesheet", function (err, TimeSheetcount) {
      if (err) throw err;
      TimeSheetCount=TimeSheetcount[0].length
     
     db.query("select * from edittimesheet", function (err, TimeSheet) {
       if (err) throw err;
       for(var i=0;i<TimeSheetCount;i++)
       {
       TimeSheetarr[i]=TimeSheet[i].UserId+"^"+TimeSheet[i].Date+"^"+TimeSheet[i].Location+"^"+TimeSheet[i].Project+"^"+TimeSheet[i].AA_Types;
       
     
    
       }
     
    
       const taskList=req.body.taskList;
    
       const myDate=req.body.myDate;
       const id=req.body.id;
       const submit=req.body.Submit
       let DeleteArr=[];
       let DublicateEntry=[];
       let CreateEntry=[];
       let SickHrs=0;
       let VacationHrs=0;
       const len = taskList.length;
       let AA_Type=""
       let hrsgreaterthan24=0;
       let Weekends=0;
       let Sunday=0;
       let Monday=0;
       let Tuesday=0;
       let Wednesday=0;
       let Thursday=0;
       let Friday=0;
       let Saturday=0;
       let AA_Type_Sunday="";
       let AA_Type_Monday="";
       let AA_Type_Tuesday="";
       let AA_Type_Wednesday="";
       let AA_Type_Thursday="";
       let AA_Type_Friday="";
       let AA_Type_Saturday="";
       let WeekAA_Type="";
       var queries = '';
      let Create=0;
      let Update=0;
      let Regular_HRSWeek="";
      let VacationAccural=0;
       let SundayDate=req.body.myDate;
       console.log("submit",submit)
       var d = new Date(SundayDate)
let MondayDate=new Date(d.setDate(d.getDate() + 1))
MondayDate= Moment(MondayDate).format('MMM DD yyyy')
let TuesdayDate=new Date(d.setDate(d.getDate() + 1))
TuesdayDate= Moment(TuesdayDate).format('MMM DD yyyy')
let WednesdayDate=new Date(d.setDate(d.getDate() + 1))
WednesdayDate= Moment(WednesdayDate).format('MMM DD yyyy')
let ThursdayDate=new Date(d.setDate(d.getDate() + 1))
ThursdayDate= Moment(ThursdayDate).format('MMM DD yyyy')
let FridayDate=new Date(d.setDate(d.getDate() + 1))
FridayDate= Moment(FridayDate).format('MMM DD yyyy')
let SaturdayDate=new Date(d.setDate(d.getDate() + 1))
SaturdayDate= Moment(SaturdayDate).format('MMM DD yyyy')
let WeekDays=[SundayDate,MondayDate,TuesdayDate,WednesdayDate,ThursdayDate,FridayDate,SaturdayDate]
let WeekDates=[];
   
      var Sql="SELECT EmployeeGroup,Seniority,SickLeave,Vacation from user WHERE uid=?"
       db.query(Sql,[id],function (err, EmployeeGroupUser) {
   
        db.query("SELECT NoOfLeaves from sick WHERE EmployeeGroup=?",[EmployeeGroupUser[0].EmployeeGroup],function(err,sickNoOfLeaves){
        db.query("SELECT * FROM vacation WHERE Employeegroup=? ",[EmployeeGroupUser[0].EmployeeGroup],function(err,VacationNoOfLeaves){     
          db.query("SELECT * FROM edittimesheet",function(err,TimeSheet){ 
          for(var i=0;i<len;i++){
         
  if(taskList[i].Sunday==""){taskList[i].Sunday=0;}
  if(taskList[i].Monday==""){taskList[i].Monday=0;}
  if(taskList[i].Tuesday==""){taskList[i].Tuesday=0;}
  if(taskList[i].Wednesday==""){taskList[i].Wednesday=0;}
  if(taskList[i].Thursday==""){taskList[i].Thursday=0;}
  if(taskList[i].Friday==""){taskList[i].Friday=0;}
  if(taskList[i].Saturday==""){taskList[i].Saturday=0;}
  if(!DublicateEntry.includes(id+"^"+myDate+"^"+taskList[i].Location+"^"+taskList[i].Project+"^"+taskList[i].AA_Types))
  {
    DublicateEntry.push(id+"^"+myDate+"^"+taskList[i].Location+"^"+taskList[i].Project+"^"+taskList[i].AA_Types)
   
  if(!TimeSheetarr.includes(id+"^"+myDate+"^"+taskList[i].Location+"^"+taskList[i].Project+"^"+taskList[i].AA_Types))
  {

  
Create=1;
   DeleteArr[i]=id+"^"+myDate+"^"+taskList[i].Location+"^"+taskList[i].Project+"^"+taskList[i].AA_Types;
   CreateEntry.push(new Array(id,myDate,taskList[i].Project,taskList[i].Sunday,taskList[i].Cmt1,taskList[i].Monday,taskList[i].Cmt2,taskList[i].Tuesday,taskList[i].Cmt3,taskList[i].Wednesday,taskList[i].Cmt4,taskList[i].Thursday,taskList[i].Cmt5,taskList[i].Friday,taskList[i].Cmt6,taskList[i].Saturday,taskList[i].Cmt7,submit,taskList[i].Location,taskList[i].Shift_Premium,taskList[i].AA_Types,"",id));
  }
  else{
   
Update=1;
   
   DeleteArr[i]=taskList[i].UserId+"^"+taskList[i].Date+"^"+taskList[i].Location+"^"+taskList[i].Project+"^"+taskList[i].AA_Types;
  queries += mysql.format("UPDATE edittimesheet SET UserId=?,Date=?,Project=?,Sunday=?,Cmt1=?,Monday=?,Cmt2=?,Tuesday=?,Cmt3=?,Wednesday=?,Cmt4=?,Thursday=?,Cmt5=?,Friday=?,Cmt6=?,Saturday=?,Cmt7=?,Submit=?,Location=?,Shift_Premium=?,AA_Types=?,Remarks=?,SubmittedBy=? WHERE UserId=? AND Date=? AND Project=? AND Location=? AND AA_Types=?;",[id,myDate,taskList[i].Project,taskList[i].Sunday,taskList[i].Cmt1,taskList[i].Monday,taskList[i].Cmt2,taskList[i].Tuesday,taskList[i].Cmt3,taskList[i].Wednesday,taskList[i].Cmt4,taskList[i].Thursday,taskList[i].Cmt5,taskList[i].Friday,taskList[i].Cmt6,taskList[i].Saturday,taskList[i].Cmt7,submit,taskList[i].Location,taskList[i].Shift_Premium,taskList[i].AA_Types,"",id,id,myDate,taskList[i].Project,taskList[i].Location,taskList[i].AA_Types])



 }
}
  if(parseInt(taskList[i].Sunday)>24||parseInt(taskList[i].Monday)>24||parseInt(taskList[i].Tuesday)>24||parseInt(taskList[i].Wednesday)>24||parseInt(taskList[i].Thursday)>24||parseInt(taskList[i].Friday)>24||parseInt(taskList[i].Saturday)>24)
  {
    hrsgreaterthan24=1;
  }
  if(taskList[i].AA_Types==="Regular Hours")
  {
    Regular_HRSWeek=taskList[i].Monday+"^"+taskList[i].Wednesday+"^"+taskList[i].Thursday+"^"+taskList[i].Friday
  Sunday=Sunday+parseInt(taskList[i].Sunday);
  Monday=Monday+parseInt(taskList[i].Monday);
  Tuesday=Tuesday+parseInt(taskList[i].Tuesday);
  Wednesday=Wednesday+parseInt(taskList[i].Wednesday);
  Thursday=Thursday+parseInt(taskList[i].Thursday);
  Friday=Friday+parseInt(taskList[i].Friday);
  Saturday=Saturday+parseInt(taskList[i].Saturday);

  }
  else{
    console.log("Sunday",taskList[i].Sunday)
  
    if(parseInt(taskList[i].Sunday)!==0)
    {
      AA_Type_Sunday=taskList[i].AA_Types;
     Sunday=Sunday+parseInt(taskList[i].Sunday);
    }
    if(parseInt(taskList[i].Monday)!==0)
    {
      AA_Type_Monday=taskList[i].AA_Types;
    Monday=Monday+parseInt(taskList[i].Monday);
    }
    if(parseInt(taskList[i].Tuesday)!==0)
    {
      AA_Type_Tuesday=taskList[i].AA_Types;
    Tuesday=Tuesday+parseInt(taskList[i].Tuesday);
    }
    if(parseInt(taskList[i].Wednesday)!==0)
    {
      AA_Type_Wednesday=taskList[i].AA_Types;
    Wednesday=Wednesday+parseInt(taskList[i].Wednesday);
    }
    if(parseInt(taskList[i].Thursday)!==0)
    {
      AA_Type_Thursday=taskList[i].AA_Types;
    Thursday=Thursday+parseInt(taskList[i].Thursday);
    }
   if(parseInt(taskList[i].Friday)!==0)
   {
    AA_Type_Friday=taskList[i].AA_Types;
   Friday=Friday+parseInt(taskList[i].Friday);
   }
   if(parseInt(taskList[i].Saturday)!==0)
   {
    AA_Type_Saturday=taskList[i].AA_Types;
   Saturday=Saturday+parseInt(taskList[i].Saturday);
   }
    }
  

            if(taskList[i].AA_Types==="Vacation"||taskList[i].AA_Types==="Sick Leave")
            {
        if(parseInt(taskList[i].Sunday)>0||parseInt(taskList[i].Saturday)>0) 
        {
           Weekends=1;
           WeekAA_Type=taskList[i].AA_Types;

        }  
            
            if(taskList[i].Sunday==="8"||taskList[i].Sunday==="4"||taskList[i].Sunday===0||taskList[i].Sunday==="0")
      {
       
       
  
       }
       else{
        AA_Type=taskList[i].AA_Types
        VacationHrs=1;
        SickHrs=1;
        console.log("hello",taskList[i].Sunday)
      }
     if(taskList[i].Monday==="8"||taskList[i].Monday==="4"||taskList[i].Monday===0||taskList[i].Monday==="0")
      {
      
      }
      else{
        AA_Type=taskList[i].AA_Types
        VacationHrs=1;
        SickHrs=1;
      }
     if(taskList[i].Tuesday==="8"||taskList[i].Tuesday==="4"||taskList[i].Tuesday===0||taskList[i].Tuesday==="0" )
      {
       
      }
      else{
        AA_Type=taskList[i].AA_Types
        VacationHrs=1;
        SickHrs=1;
      }
       if(taskList[i].Wednesday==="8"||taskList[i].Wednesday==="4"||taskList[i].Wednesday===0||taskList[i].Wednesday==="0")
      {
        
      }
      else{
        AA_Type=taskList[i].AA_Types
        VacationHrs=1;
        SickHrs=1;
      }
         if(taskList[i].Thursday==="8"||taskList[i].Thursday==="4"||taskList[i].Thursday===0||taskList[i].Thursday==="0" )
        {
          
        }
        else{
          AA_Type=taskList[i].AA_Types
          VacationHrs=1;
          SickHrs=1;
        }
           if(taskList[i].Friday==="8"||taskList[i].Friday==="4"||taskList[i].Friday===0||taskList[i].Friday==="0" )
          {
             
         }
         else{
          AA_Type=taskList[i].AA_Types
          VacationHrs=1;
          SickHrs=1;
        }
          if(taskList[i].Saturday==="8"||taskList[i].Saturday==="4"||taskList[i].Saturday===0||taskList[i].Saturday==="0" )
         {
            
        }
        else{
          AA_Type=taskList[i].AA_Types
          VacationHrs=1;
          SickHrs=1;
        }
          }
  console.log(hrsgreaterthan24,Weekends)
 //SickLeave Entitlement 
if(taskList[i].AA_Types==="Sick Leave"&&hrsgreaterthan24!=1&&Weekends!=1)
{
 
  if(l!=1&&SickHrs!=1&&hrsgreaterthan24!=1&&Weekends!=1)
  {
    let jl=0;
  
   for(let Days=0;Days<7;Days++)
   {
     if(!WeekDates.includes(WeekDays[Days].substring(7,11)))
     {
       WeekDates[jl]=WeekDays[Days].substring(7,11)
       jl++;;
       console.log(WeekDates,WeekDays)
     }
     }
     for(let years=0;years<WeekDates.length;years++)
     {
     
      let RDay=1
      const YEAR=WeekDates[years]+"-"+"Jan";
      let myDate=WeekDates[years]+"-"+"Jan"+"-"+RDay;
      console.log("myDate",myDate,WeekDates.length)
  
      var NoOfWeeks=Moment(WeekDates[years], "YYYY").weeksInYear();
      var Day= Moment(myDate).isoWeekday()
      myDate=Moment(myDate).format('YYYY-MM-DD')
    
      var CurrentDate = new Date(new Date(parseInt(myDate.substring(0,4)), parseInt(myDate.substring(5,7))-1, parseInt(myDate.substring(8,10))));
  
      var CurrentWeekDay = CurrentDate.getDay();
  
      var CurrentWeekDate = new Date(
      new Date(CurrentDate).setDate(CurrentDate.getDate() - CurrentWeekDay)
      );
  
      var Day1 = new Date(new Date(CurrentWeekDate).setDate(CurrentWeekDate.getDate() + 0)).toDateString();
   
      var Week1= Moment(Day1).format('MMM DD yyyy')
   
      let Sick_Leave_String="";
      for(let Weeks=0;Weeks<=NoOfWeeks;Weeks++)
      {
      

       for(let res=0;res<TimeSheet.length;res++)
       {
        let  TimeSheetWeeklyDate= Moment(req.body.myDate).format('MMM DD yyyy')
if(TimeSheet[res].Date===Week1&&TimeSheet[res].AA_Types==="Sick Leave"&&TimeSheet[res].UserId===id&&TimeSheet[res].Date!==TimeSheetWeeklyDate&&TimeSheet[res].Submit==="Approval")
{
 
  var h = new Date(Week1)
  let SundayWeek=Week1;
  let  MondayWeek =new Date(h.setDate(h.getDate() + 1))
  MondayWeek= Moment(MondayWeek).format('MMM DD yyyy')
  let  TuesdayWeek =new Date(h.setDate(h.getDate() + 1))
  TuesdayWeek= Moment(TuesdayWeek).format('MMM DD yyyy')
  let  WednesdayWeek =new Date(h.setDate(h.getDate() + 1))
  WednesdayWeek= Moment(WednesdayWeek).format('MMM DD yyyy')
  let  ThursdayWeek =new Date(h.setDate(h.getDate() + 1))
  ThursdayWeek= Moment(ThursdayWeek).format('MMM DD yyyy')
  let  FridayWeek =new Date(h.setDate(h.getDate() + 1))
  FridayWeek= Moment(FridayWeek).format('MMM DD yyyy')
  let  SaturdayWeek =new Date(h.setDate(h.getDate() + 1))
  SaturdayWeek= Moment(SaturdayWeek).format('MMM DD yyyy')
  if(SundayWeek.includes(WeekDates[years]))
  {
    Sick_Leave_String=Sick_Leave_String+"^"+TimeSheet[res].Sunday;
  }
  if(MondayWeek.includes(WeekDates[years]))
  {
    Sick_Leave_String=Sick_Leave_String+"^"+TimeSheet[res].Monday;
  }
  if(TuesdayWeek.includes(WeekDates[years]))
  {
    Sick_Leave_String=Sick_Leave_String+"^"+TimeSheet[res].Tuesday;
  }
  if(WednesdayWeek.includes(WeekDates[years]))
  {
    Sick_Leave_String=Sick_Leave_String+"^"+TimeSheet[res].Wednesday;
  }
  if(ThursdayWeek.includes(WeekDates[years]))
  {
    Sick_Leave_String=Sick_Leave_String+"^"+TimeSheet[res].Thursday;
  }
  if(FridayWeek.includes(WeekDates[years]))
  {
    Sick_Leave_String=Sick_Leave_String+"^"+TimeSheet[res].Friday;
  }
  if(SaturdayWeek.includes(WeekDates[years]))
  {
    Sick_Leave_String=Sick_Leave_String+"^"+TimeSheet[res].Saturday;
  }
 

}
       }
      
      
      
       var e = new Date(Week1)
     let  WeekDate1 =new Date(e.setDate(e.getDate() + 7))
  
        Week1= Moment(WeekDate1).format('MMM DD yyyy')
    
       }
      
      
       if(SundayDate.includes(WeekDates[years]))
       {
       
         Sick_Leave_String=Sick_Leave_String+"^"+taskList[i].Sunday;
       }
       if(MondayDate.includes(WeekDates[years]))
       {
         Sick_Leave_String=Sick_Leave_String+"^"+taskList[i].Monday;
       }
       if(TuesdayDate.includes(WeekDates[years]))
       {
         Sick_Leave_String=Sick_Leave_String+"^"+taskList[i].Tuesday;
       }
       if(WednesdayDate.includes(WeekDates[years]))
       {
         Sick_Leave_String=Sick_Leave_String+"^"+taskList[i].Wednesday;
       }
       if(ThursdayDate.includes(WeekDates[years]))
       {
         Sick_Leave_String=Sick_Leave_String+"^"+taskList[i].Thursday;
       }
       if(FridayDate.includes(WeekDates[years]))
       {
         Sick_Leave_String=Sick_Leave_String+"^"+taskList[i].Friday;
       }
       if(SaturdayDate.includes(WeekDates[years]))
       {
         Sick_Leave_String=Sick_Leave_String+"^"+taskList[i].Saturday;
       }
       console.log("Sick Levae",Sick_Leave_String)
       let Days_Arr=[];
       Days_Arr=Sick_Leave_String.split("^");
       let Total=0;
       for(let m=1;m<Days_Arr.length;m++)
       {
  
Total=Total+parseInt(Days_Arr[m])

       }
       console.log("Total",Total)
     
     
  
 

 
     if(Total>(sickNoOfLeaves[0].NoOfLeaves*8)){
      sickleave=1;
    }
    
  }
  }
   
  }

//VacationAccural

   if(taskList[i].AA_Types==="Vacation"&&hrsgreaterthan24!=1&&Weekends!=1){
   
  

  
      if(l!=1&&VacationHrs!=1&&hrsgreaterthan24!=1&&Weekends!=1)
      {
        let jl=0;
  
        for(let Days=0;Days<7;Days++)
        {
          if(!WeekDates.includes(WeekDays[Days].substring(7,11)))
          {
            WeekDates[jl]=WeekDays[Days].substring(7,11)
            jl++;;
            console.log(WeekDates,WeekDays)
          }
          }
          for(let years=0;years<WeekDates.length;years++)
          {
          
           let RDay=1
           const YEAR=WeekDates[years]+"-"+"Jan";
           let myDate=WeekDates[years]+"-"+"Jan"+"-"+RDay;
           console.log("myDate",myDate,WeekDates.length)
       
           var NoOfWeeks=Moment(WeekDates[years], "YYYY").weeksInYear();
           var Day= Moment(myDate).isoWeekday()
           myDate=Moment(myDate).format('YYYY-MM-DD')
      
           var CurrentDate = new Date(new Date(parseInt(myDate.substring(0,4)), parseInt(myDate.substring(5,7))-1, parseInt(myDate.substring(8,10))));
    
           var CurrentWeekDay = CurrentDate.getDay();
     
           var CurrentWeekDate = new Date(
           new Date(CurrentDate).setDate(CurrentDate.getDate() - CurrentWeekDay)
           );
     
           var Day1 = new Date(new Date(CurrentWeekDate).setDate(CurrentWeekDate.getDate() + 0)).toDateString();
     
           var Week1= Moment(Day1).format('MMM DD yyyy')
       
           let Vacation_String="";
           let Vacation_Accured=0;
           for(let Weeks=0;Weeks<=NoOfWeeks;Weeks++)
           {
           
     
            for(let res=0;res<TimeSheet.length;res++)
            {
             let  TimeSheetWeeklyDate= Moment(req.body.myDate).format('MMM DD yyyy')
             var h = new Date(Week1)
             let SundayWeek=Week1;
             let  MondayWeek =new Date(h.setDate(h.getDate() + 1))
             MondayWeek= Moment(MondayWeek).format('MMM DD yyyy')
             let  TuesdayWeek =new Date(h.setDate(h.getDate() + 1))
             TuesdayWeek= Moment(TuesdayWeek).format('MMM DD yyyy')
             let  WednesdayWeek =new Date(h.setDate(h.getDate() + 1))
             WednesdayWeek= Moment(WednesdayWeek).format('MMM DD yyyy')
             let  ThursdayWeek =new Date(h.setDate(h.getDate() + 1))
             ThursdayWeek= Moment(ThursdayWeek).format('MMM DD yyyy')
             let  FridayWeek =new Date(h.setDate(h.getDate() + 1))
             FridayWeek= Moment(FridayWeek).format('MMM DD yyyy')
             let  SaturdayWeek =new Date(h.setDate(h.getDate() + 1))
             SaturdayWeek= Moment(SaturdayWeek).format('MMM DD yyyy')
     if(TimeSheet[res].Date===Week1&&TimeSheet[res].Date!==TimeSheetWeeklyDate&&TimeSheet[res].AA_Types==="Vacation"&&TimeSheet[res].UserId===id&&TimeSheet[res].Submit==="Approval")
     {
    
      
       if(SundayWeek.includes(WeekDates[years]))
       {
        Vacation_String=Vacation_String+"^"+TimeSheet[res].Sunday;
       }
       if(MondayWeek.includes(WeekDates[years]))
       {
        Vacation_String=Vacation_String+"^"+TimeSheet[res].Monday;
       }
       if(TuesdayWeek.includes(WeekDates[years]))
       {
        Vacation_String=Vacation_String+"^"+TimeSheet[res].Tuesday;
       }
       if(WednesdayWeek.includes(WeekDates[years]))
       {
        Vacation_String=Vacation_String+"^"+TimeSheet[res].Wednesday;
       }
       if(ThursdayWeek.includes(WeekDates[years]))
       {
        Vacation_String=Vacation_String+"^"+TimeSheet[res].Thursday;
       }
       if(FridayWeek.includes(WeekDates[years]))
       {
        Vacation_String=Vacation_String+"^"+TimeSheet[res].Friday;
       }
       if(SaturdayWeek.includes(WeekDates[years]))
       {
        Vacation_String=Vacation_String+"^"+TimeSheet[res].Saturday;
       }
      
   
     }
     if(TimeSheet[res].Date===Week1&&TimeSheet[res].Date!==TimeSheetWeeklyDate&&TimeSheet[res].AA_Types==="Regular Hours"&&TimeSheet[res].UserId===id&&TimeSheet[res].Submit==="Approval")
     {
      
     
      if(MondayWeek.includes(WeekDates[years]))
                                {
                                    if(parseInt(TimeSheet[res].Monday)<=8)
                                    {
                                        Vacation_Accured=Vacation_Accured+parseInt(TimeSheet[res].Monday)
                                    }
                                    else{
                                        Vacation_Accured=Vacation_Accured+8;
                                    }
                                 
                                }
                                if(TuesdayWeek.includes(WeekDates[years]))
                                {
                                    if(parseInt(TimeSheet[res].Tuesday)<=8)
                                    {
                                        Vacation_Accured=Vacation_Accured+parseInt(TimeSheet[res].Tuesday)
                                    }
                                    else{
                                        Vacation_Accured=Vacation_Accured+8;
                                    }
                                  
                                }
                                if(WednesdayWeek.includes(WeekDates[years]))
                                {
                                    if(parseInt(TimeSheet[res].Wednesday)<=8)
                                    {
                                        Vacation_Accured=Vacation_Accured+parseInt(TimeSheet[res].Wednesday)
                                    }
                                    else{
                                        Vacation_Accured=Vacation_Accured+8;
                                    }
                               
                                }
                                if(ThursdayWeek.includes(WeekDates[years]))
                                {
                                    if(parseInt(TimeSheet[res].Thursday)<=8)
                                    {
                                        Vacation_Accured=Vacation_Accured+parseInt(TimeSheet[res].Thursday)
                                    }
                                    else{
                                        Vacation_Accured=Vacation_Accured+8;
                                    }
                                   
                                }
                                if(FridayWeek.includes(WeekDates[years]))
                                {
                                    if(parseInt(TimeSheet[res].Friday)<=8)
                                    {
                                        Vacation_Accured=Vacation_Accured+parseInt(TimeSheet[res].Friday)
                                    }
                                    else{
                                        Vacation_Accured=Vacation_Accured+8;
                                    }
                                  
                                }
   
     }
            }
           
           
           
            var e = new Date(Week1)
          let  WeekDate1 =new Date(e.setDate(e.getDate() + 7))
        //  console.log("WeekDate1",WeekDate1)
             Week1= Moment(WeekDate1).format('MMM DD yyyy')
           // console.log("Week1_After",Week1)
            }
           
           
            if(SundayDate.includes(WeekDates[years]))
            {
             
              Vacation_String=Vacation_String+"^"+taskList[i].Sunday;
            }
            if(MondayDate.includes(WeekDates[years]))
            {
              Vacation_String=Vacation_String+"^"+taskList[i].Monday;
            }
            if(TuesdayDate.includes(WeekDates[years]))
            {
              Vacation_String=Vacation_String+"^"+taskList[i].Tuesday;
            }
            if(WednesdayDate.includes(WeekDates[years]))
            {
              Vacation_String=Vacation_String+"^"+taskList[i].Wednesday;
            }
            if(ThursdayDate.includes(WeekDates[years]))
            {
              Vacation_String=Vacation_String+"^"+taskList[i].Thursday;
            }
            if(FridayDate.includes(WeekDates[years]))
            {
              Vacation_String=Vacation_String+"^"+taskList[i].Friday;
            }
            if(SaturdayDate.includes(WeekDates[years]))
            {
              Vacation_String=Vacation_String+"^"+taskList[i].Saturday;
            }
            let arr123=[];
            arr123=Regular_HRSWeek.split("^");
           
              if(MondayDate.includes(WeekDates[years]))
              {
                Vacation_Accured=Vacation_Accured+arr123[0];
              }
              if(TuesdayDate.includes(WeekDates[years]))
              {
                Vacation_Accured=Vacation_Accured+arr123[0];
              }
              if(WednesdayDate.includes(WeekDates[years]))
              {
                Vacation_Accured=Vacation_Accured+arr123[0];
              }
              if(ThursdayDate.includes(WeekDates[years]))
              {
                Vacation_Accured=Vacation_Accured+arr123[0];
              }
              if(FridayDate.includes(WeekDates[years]))
              {
                Vacation_Accured=Vacation_Accured+arr123[0];
              }
            console.log("Vacation",Vacation_String)
            let Days_Arr=[];
            Days_Arr=Vacation_String.split("^");
            let vacationLeavetotal=0;
            for(let m=1;m<Days_Arr.length;m++)
            {
       
              vacationLeavetotal=vacationLeavetotal+parseInt(Days_Arr[m])
     
            }
            console.log("Total1234566",vacationLeavetotal)
          
          
      
     
      for(let vac=0;vac<VacationNoOfLeaves.length;vac++)
      {
          if((parseInt(VacationNoOfLeaves[vac].MaxSeniority)>=parseInt(EmployeeGroupUser[0].Seniority))&&(parseInt(EmployeeGroupUser[0].Seniority)>=parseInt(VacationNoOfLeaves[vac].MinSeniority)))
          {
            let Vacation_Accured_Total= Math.round(((VacationNoOfLeaves[vac].NoOfLeaves/2080)*(Vacation_Accured))*10000)/10000  
            let Vaction_Vacation_total=Math.round(((VacationNoOfLeaves[vac].NoOfLeaves/2080)*(vacationLeavetotal))*10000)/10000  
            if(Vaction_Vacation_total>Vacation_Accured_Total)
            {
             VacationAccural=1;
              
            }
            
         
      }
    

       
    }
  }
}
     
  }
 //Vacation Entitlement
//Vacation Entitlement
   if(taskList[i].AA_Types==="Vacation"&&hrsgreaterthan24!=1&&Weekends!=1){
   
    let x;
  let tmstotal=0;
  console.log(DublicateEntry,"entry")
  if(DublicateEntry.includes(id+"^"+myDate+"^"+taskList[i].Location+"^"+taskList[i].Project+"^"+taskList[i].AA_Types))
  {
    tmstotal=(tmstotal+parseInt(taskList[i].Sunday)+parseInt(taskList[i].Monday)+parseInt(taskList[i].Tuesday)+parseInt(taskList[i].Wednesday)+parseInt(taskList[i].Thursday)+parseInt(taskList[i].Friday)+parseInt(taskList[i].Saturday))
  
  DublicateEntry.push(id+"^"+myDate+"^"+taskList[i].Location+"^"+taskList[i].Project+"^"+taskList[i].AA_Types)
     
      if(TimeSheetarr.includes(id+"^"+myDate+"^"+taskList[i].Location+"^"+taskList[i].Project+"^"+taskList[i].AA_Types))
      {
        l=1;
      }
      else{
        console.log("else")
     CreateEntry.push(new Array(id,myDate,taskList[i].Project,taskList[i].Sunday,taskList[i].Cmt1,taskList[i].Monday,taskList[i].Cmt2,taskList[i].Tuesday,taskList[i].Cmt3,taskList[i].Wednesday,taskList[i].Cmt4,taskList[i].Thursday,taskList[i].Cmt5,taskList[i].Friday,taskList[i].Cmt6,taskList[i].Saturday,taskList[i].Cmt7,submit,taskList[i].Location,taskList[i].Shift_Premium,taskList[i].AA_Types));
      k++;
       }
    }
  



      if(l!=1&&VacationHrs!=1&&hrsgreaterthan24!=1&&Weekends!=1)
      {
        console.log("123456789")
     
        let vacationLeavetotal=0;
        let vacationLeavetotal1=0;
        let Mixedyear=0,nextyear=0;
       
        if((WeekDays[0].substring(7,11))===WeekDays[6].substring(7,11))
        {
          vacationLeavetotal=vacationLeavetotal+parseInt(taskList[i].Sunday)+parseInt(taskList[i].Monday)+parseInt(taskList[i].Tuesday)+parseInt(taskList[i].Wednesday)+parseInt(taskList[i].Thursday)+parseInt(taskList[i].Friday)+parseInt(taskList[i].Saturday)
         console.log("Non-mixed year")
         console.log("vacationLeavetotal outer",vacationLeavetotal)
        }
        else
        {
          Mixedyear=1
          for( x=0;x<7;x++)
          { 
            console.log(WeekDays[x].substring(0,6),"WeekDays[i].substring(0,6)")
            if(WeekDays[x].substring(0,6)==="Jan 01")
            {
              console.log("Index of Mixed Year",x)
              break;
            }
          }
        // if(x==1)
        // {
        // vacationLeavetotal=vacationLeavetotal+parseInt(taskList[i].Sunday)
        // vacationLeavetotal1=vacationLeavetotal1+parseInt(taskList[i].Monday)+parseInt(taskList[i].Tuesday)+parseInt(taskList[i].Wednesday)+parseInt(taskList[i].Thursday)+parseInt(taskList[i].Friday)
        // }
         if(x==2)
        {
        vacationLeavetotal=vacationLeavetotal+parseInt(taskList[i].Sunday)+parseInt(taskList[i].Monday)
        vacationLeavetotal1=vacationLeavetotal1+parseInt(taskList[i].Tuesday)+parseInt(taskList[i].Wednesday)+parseInt(taskList[i].Thursday)+parseInt(taskList[i].Friday)
        }
        else if(x==3)
        {
        vacationLeavetotal=vacationLeavetotal+parseInt(taskList[i].Sunday)+parseInt(taskList[i].Monday)+parseInt(taskList[i].Tuesday)
        vacationLeavetotal1=vacationLeavetotal1+parseInt(taskList[i].Wednesday)+parseInt(taskList[i].Thursday)+parseInt(taskList[i].Friday)
        }
        else if(x==4)
        {
        vacationLeavetotal=vacationLeavetotal+parseInt(taskList[i].Sunday)+parseInt(taskList[i].Monday)+parseInt(taskList[i].Tuesday)+parseInt(taskList[i].Wednesday)
        vacationLeavetotal1=vacationLeavetotal1+parseInt(taskList[i].Thursday)+parseInt(taskList[i].Friday)
       
        }
        else if(x==5)
        {
        vacationLeavetotal=vacationLeavetotal+parseInt(taskList[i].Sunday)+parseInt(taskList[i].Monday)+parseInt(taskList[i].Tuesday)+parseInt(taskList[i].Wednesday)+parseInt(taskList[i].Thursday)  
        vacationLeavetotal1=vacationLeavetotal1+parseInt(taskList[i].Friday)
       
       } else if(x==6)
       vacationLeavetotal=vacationLeavetotal+parseInt(taskList[i].Sunday)+parseInt(taskList[i].Monday)+parseInt(taskList[i].Tuesday)+parseInt(taskList[i].Wednesday)+parseInt(taskList[i].Thursday)+parseInt(taskList[i].Friday)
       console.log("Mixed year VacationLeavetot",vacationLeavetotal)
      }
          
        
        //  console.log("EmployeeGroupUser[0].Vacation"+EmployeeGroupUser[0].Vacation)
        
        if(EmployeeGroupUser[0].Vacation=='0'){
          console.log(vacationLeavetotal+"    vacationLeavetotal")
          console.log(VacationNoOfLeaves+"    VacationNoOfLeaves")

         for(let i=0;i<VacationNoOfLeaves.length;i++)
         {
           console.log(VacationNoOfLeaves[i].MinSeniority+"VacationNoOfLeaves[i].MinSeniority top")
           console.log(VacationNoOfLeaves[i].MaxSeniority+"VacationNoOfLeaves[i].MaxSeniority top")
             if(VacationNoOfLeaves[i].MinSeniority<=EmployeeGroupUser[0].Seniority<=VacationNoOfLeaves[0].MaxSeniority)
             {
              console.log(EmployeeGroupUser[0].Seniority+"    EmployeeGroupUser[0].Seniority")
              console.log(vacationLeavetotal1+"    vacationLeavetotal1")
              console.log(vacationLeavetotal+"    vacationLeavetotal")
              console.log(VacationNoOfLeaves[i].NoOfLeaves*8+"    VacationNoOfLeaves[i].NoOfLeaves*8)")
         
              if(vacationLeavetotal>(VacationNoOfLeaves[i].NoOfLeaves*8))
           {
              console.log("if block")
             vacationLeave=1;
           }
           else{                    
            if(Mixedyear==0)
            db.query("UPDATE user SET Vacation= ? WHERE uid =?",[myDate.substring(7,11)+"-"+ (vacationLeavetotal),id]);
           else
           {
             nextyear=parseInt(myDate.substring(7,11))+1;
           db.query("UPDATE user SET Vacation= ? WHERE uid =?",[myDate.substring(7,11)+"-"+vacationLeavetotal+"," +nextyear+"-"+vacationLeavetotal1,id]);
           // console.log("mydate1",mydate1)
           }
          }
          
       }
    
      }
         //vacationLeavetotal=vacationLeavetotal+parseInt(EmployeeGroupUser[0].Vacation)
         console.log("tmstotal1",tmstotal)
        }
       
        else{
          console.log("tmstotal2",tmstotal)
         let EmployeeGroup=[],remarray=[],count=0;
         EmployeeGroup=EmployeeGroupUser[0].Vacation.split(",")
     //    console.log("EmployeeGrouplen:"+EmployeeGroup.length)
         for(let j=0;j<EmployeeGroup.length;j++)
         remarray[j]=EmployeeGroup[j]
        for(let j=0;j<EmployeeGroup.length;j++){
//console.log("EmployeeGroup[j].substring(0,4)",EmployeeGroup[j].substring(0,4))
  //        console.log("myDate.substring(7,11)",myDate.substring(7,11))
         if(EmployeeGroup[j].substring(0,4)===myDate.substring(7,11)){
           count++
          
         
           console.log("same year tmstotal remarr",tmstotal)
           vacationLeavetotal=(vacationLeavetotal+parseInt(EmployeeGroup[j].substring(5,EmployeeGroup[j].length))-tmstotal)
           console.log(vacationLeavetotal,"vacationLeavetotal inner")
            
          remarray[j]=myDate.substring(7,11)+"-"+(vacationLeavetotal);
         // console.log("remarray"+remarray[j])
      
         }
         else{
          count=count+0
          
          console.log("new year tmstotal remarr",tmstotal)
        //  vacationLeavetotal=(vacationLeavetotal+parseInt(EmployeeGroup[j].substring(5,EmployeeGroup[j].length))-tmstotal)
          console.log(vacationLeavetotal,"vacationLeavetotal inner")
           
       // remarray[j]=myDate.substring(7,11)+"-"+(vacationLeavetotal);
         }
         
       }
 
        console.log("UpdatedRemainingarray",remarray.toString())
         
         //for loop
         if(count===0)
         {
            if(Mixedyear==1)
            {
            nextyear=parseInt(myDate.substring(7,11))+1;
           db.query("UPDATE user SET Vacation= ? WHERE uid =?",[EmployeeGroupUser[0].Vacation+","+myDate.substring(7,11)+"-"+vacationLeavetotal+"," +nextyear+"-"+vacationLeavetotal1,id]);
            }
            console.log("tmstotal4",tmstotal)
            if(Mixedyear==0)
           db.query("UPDATE user SET Vacation= ? WHERE uid =?",[EmployeeGroupUser[0].Vacation+","+myDate.substring(7,11)+"-"+vacationLeavetotal,id]);
          // console.log("new year"+EmployeeGroupUser[0].Vacation+","+myDate.substring(7,11)+"-"+vacationLeavetotal,id);
         
        } 
         else
         {
          console.log("tmstotal5",tmstotal)
           // console.log("sameyear"+EmployeeGroup[j])
           // console.log("Updatedvalues:"+EmployeeGroup[j].substring(5,7))//database vacation values
           // console.log("VacTotal:"+vacationLeavetotal)//Timesheet values
           console.log("Length of vaca:",EmployeeGroup[j].length)
           //vacationLeavetotal=vacationLeavetotal+parseInt(EmployeeGroup[j].substring(5,EmployeeGroup[j].length)) 
          
          // console.log("remarraylen"+remarray.length)
           for(let i=0;i<VacationNoOfLeaves.length;i++)
         {
        //  console.log(VacationNoOfLeaves[i].MinSeniority+"VacationNoOfLeaves[i].MinSeniority")
          //console.log(VacationNoOfLeaves[i].MaxSeniority+"VacationNoOfLeaves[i].MaxSeniority")

             if(VacationNoOfLeaves[i].MinSeniority<=EmployeeGroupUser[0].Seniority<=VacationNoOfLeaves[0].MaxSeniority)
             {
              
                console.log(vacationLeavetotal+"   vacationLeavetotal")
              //  console.log(VacationNoOfLeaves[i].NoOfLeaves*8+"  VacationNoOfLeaves[i].NoOfLeaves*8")
                console.log(remarray+"remarray");
            
                if(!(vacationLeavetotal>(VacationNoOfLeaves[i].NoOfLeaves*8)))
                {
                  console.log("same year update:",remarray)
                // vacationLeave=2;
                console.log("tmstotal6",tmstotal)
               if(Mixedyear==0)
               
                db.query("UPDATE user SET Vacation= ? WHERE uid =?",[remarray.toString(),id]);
                
                
                if(Mixedyear==1)
                {
                  nextyear=parseInt(myDate.substring(7,11))+1;  
                db.query("UPDATE user SET Vacation= ? WHERE uid =?",[remarray.toString()+","+nextyear+"-"+vacationLeavetotal1,id]);
                //console.log("same year update:",myDate.substring(7,11)+"-"+vacationLeavetotal,id)
                }
              }
                if(vacationLeavetotal>(VacationNoOfLeaves[i].NoOfLeaves*8))
                {
                //  console.log("Skipped if")
                  vacationLeave=1;
                }
                break;
              }  
       
       
            }
      
     
     }
     
    
    
       }
         

}


  
     
  } 
 
          
        }
        let lo=0;
  var sql="insert into edittimesheet(UserId,Date,Project,Sunday,Cmt1,Monday,Cmt2,Tuesday,Cmt3,Wednesday,Cmt4,Thursday,Cmt5,Friday,Cmt6,Saturday,Cmt7,Submit,Location,Shift_Premium,AA_Types,Remarks,SubmittedBy) VALUES?";
   console.log(CreateEntry,"CreateEntry") 
 console.log("sickLeave",sickleave,l,k,VacationHrs,AA_Type_Monday,Monday,AA_Type_Sunday,Weekends,WeekAA_Type)
 if(Weekends!==1&&hrsgreaterthan24!==1&&VacationHrs!==1&&SickHrs!==1&&vacationLeave!==1&&sickleave!==1)
 {
lo=1;
   if(Update===1)
   {
     console.log("Update",Update,submit)
  db.query(queries) 
   }
  if(Create===1)
  {
    console.log("hellooo")
 db.query(sql,[CreateEntry])
  }
  for(var i=0;i<TimeSheetCount;i++)
  {
    let key=TimeSheet[i].UserId+"^"+TimeSheet[i].Date+"^"+TimeSheet[i].Location+"^"+TimeSheet[i].Project+"^"+TimeSheet[i].AA_Types;
  
    if(id===TimeSheet[i].UserId&&myDate.includes(TimeSheet[i].Date))
{
  if(!DeleteArr.includes(key))
  {
  
   if(TimeSheet[i].AA_Types==="Vacation"){
      let vacationtotal= parseInt(TimeSheet[i].Sunday)+parseInt(TimeSheet[i].Monday)+parseInt(TimeSheet[i].Tuesday)+parseInt(TimeSheet[i].Wednesday)+parseInt(TimeSheet[i].Thursday)+parseInt(TimeSheet[i].Friday)+parseInt(TimeSheet[i].Saturday)
console.log("vacationtotal",vacationtotal)
      db.query("select Vacation,uid FROM user WHERE uid=? ",[id],function(err,vacationdelete){
        let yeararr=[],remarr=[]
      yeararr=  vacationdelete[0].Vacation.split(",")
      for(let l=0;l<yeararr.length;l++){
        if(yeararr[l].substring(0,4)!==myDate.substring(7,11)){
          remarr[l]=yeararr[l]
         
        }
      }
      const deletearr = remarr.filter((a) => a);
     // console.log(deletearr,"delte remarray");
      for(let k=0;k<yeararr.length;k++){
      if(yeararr[k].substring(0,4)===myDate.substring(7,11)){
        //console.log("yeararr[k].substring(0,4)",yeararr[k].substring(0,4))
        //console.log("myDate.substring(7,11)",myDate.substring(7,11))
 let vactot=yeararr[k].substring(5,yeararr[k].length)-vacationtotal
// console.log("vactot:",vactot)
// console.log("deletearr.length:",deletearr.length)
 if(deletearr.length!==0)
 db.query("UPDATE user SET Vacation= ? WHERE uid =?",[deletearr.toString()+","+myDate.substring(7,11)+"-"+vactot,id]);
 else
 db.query("UPDATE user SET Vacation= ? WHERE uid =?",[myDate.substring(7,11)+"-"+vactot,id]);
      }
    }  
   
      })
    
      }
  
    db.query("DELETE FROM edittimesheet WHERE UserId=? AND Date=? AND Location=? AND Project=? AND AA_Types=?",[id,myDate,TimeSheet[i].Location,TimeSheet[i].Project,TimeSheet[i].AA_Types])
  }
}
  }
 }
 if(VacationAccural===1)
 {
   db.query("select * from edittimesheet", function (err, result) {
     if(result){
     //  console.log(WeekAA_Type+" can't enter hrs on Weekends")
     return  res.send({message:"We don't have enter vacation Hrs more than vacation Accural"});
           }
        
   
   });
 }
else if(Weekends===1&&(WeekAA_Type==="Sick Leave"||WeekAA_Type==="Vacation"))
 {
  db.query("select * from edittimesheet", function (err, result) {
    if(result){
    //  console.log(WeekAA_Type+" can't enter hrs on Weekends")
    return  res.send({message:"vacation/sick hrs can't be entered on Weekends"});
          }
       
  
  });
 }
else if(Sunday>8&&(AA_Type_Sunday!="Regular Hours"&&AA_Type_Sunday!==""))
 {
  
  db.query("select * from edittimesheet", function (err, result) {
    if(result){
      console.log("updates")
    return  res.send({message:"Regular hrs reported more than 8hrs can't access any other AA_Type"});
          }
       
  
  });
 }
 else if(Monday>8&&(AA_Type_Monday!="Regular Hours"&&AA_Type_Monday!==""))
 {
   console.log("Monday",Monday)
  db.query("select * from edittimesheet", function (err, result) {
    if(result){
      //console.log("updates")
    return  res.send({message:"Regular hrs reported more than 8hrs can't access any other AA_Type"});
          }
       
  
  });
 }
 else if(Tuesday>8&&(AA_Type_Tuesday!="Regular Hours"&&AA_Type_Tuesday!==""))
 {
  db.query("select * from edittimesheet", function (err, result) {
    if(result){
      //console.log("updates")
    return  res.send({message:"Regular hrs reported more than 8hrs can't access any other AA_Type"});
          }
       
  
  });
 }
 else if(Wednesday>8&&(AA_Type_Wednesday!="Regular Hours"&&AA_Type_Wednesday!==""))
 {
  db.query("select * from edittimesheet", function (err, result) {
    if(result){
      //console.log("updates")
    return  res.send({message:"Regular hrs reported more than 8hrs can't access any other AA_Type"});
          }
       
  
  });
 }
 else if(Thursday>8&&(AA_Type_Thursday!="Regular Hours"&&AA_Type_Thursday!==""))
 {
  db.query("select * from edittimesheet", function (err, result) {
    if(result){
      //console.log("updates")
    return  res.send({message:"Regular hrs reported more than 8hrs can't access any other AA_Type"});
          }
       
  
  });
 }
 else if(Friday>8&&(AA_Type_Friday!="Regular Hours"&&AA_Type_Friday!==""))
 {
  db.query("select * from edittimesheet", function (err, result) {
    if(result){
      //console.log("updates")
    return  res.send({message:"Regular hrs reported more than 8hrs can't access any other AA_Type"});
          }
       
  
  });
 }
 else if(Saturday>8&&(AA_Type_Saturday!="Regular Hours"&&AA_Type_Saturday!==""))
 {
  db.query("select * from edittimesheet", function (err, result) {
    if(result){
      //console.log("updates")
    return  res.send({message:"Regular hrs reported more than 8hrs can't access any other AA_Type"});
          }
       
  
  });
 }
 else if(hrsgreaterthan24===1)
 {
  db.query("select * from edittimesheet", function (err, result) {
    if(result){
      //console.log("updates")
    return  res.send({message:"You have entered more than 24 Hrs on a Day"});
          }
       
  
  });
 }
 else if(sickleave===1)
 {
  db.query("select * from edittimesheet", function (err, result) {
    if(result){
      //console.log("updates")
    return  res.send({message:"Allocated sickLeaves are used please select another AA_Type"});
          }
       
  
  });
 }
 else if(vacationLeave===1)
 {
  db.query("select * from edittimesheet", function (err, result) {
    if(result){
      //console.log("updates")
    return  res.send({message:"Allocated vacation leaves are used please select another AA_Type"});
          }
       
  
  });
 }
 else if(SickHrs===1&&AA_Type==="Sick Leave")
 {
  db.query("select * from edittimesheet", function (err, result) {
    if(result){
      //console.log("updates")
    return  res.send({message:"sick can be allowed either 4hrs or 8 hrs only"});
          }
       
  
  });
 } 
 else if(VacationHrs===1&&AA_Type==="Vacation")
 {
  db.query("select * from edittimesheet", function (err, result) {
    if(result){
      //console.log("updates")
    return  res.send({message:"Vacation can be allowed either 4hrs or 8 hrs only"});
          }
       
  
  });
 }
 else if(lo===1&&submit===1){
  db.query("select * from edittimesheet", function (err, result) {
    if(result){
      console.log("updates")
    return  res.send({message:"TimeSheet Successfully Saved for this Period"});
          }
       
  
  });
 }
 
 else if(lo===1&&(submit==="0"||submit==="Approval")){
  
  db.query("select * from edittimesheet", function (err, result) {
    if(result){
      //console.log("updates")
    return  res.send({message:"TimeSheet Successfully Submitted for this Period"});
          }
       
  
  });
 }
 
  

   
      
      })
    })
      })
    } )
    }) 
  }) 
    
       
       
  
  });

 
/*EditTimeSheet Node*/

  app.get("/TimeSheetSelect", (req, res) => {
    let id=req.query.a;
    let WeekDate=req.query.myDate
  console.log(id);
  console.log(WeekDate);
  
 
  db.query("select * from edittimesheet WHERE UserId=? AND Date=?",[id,WeekDate], function (err, result) {
    if(result.length>0){
      console.log("Hello")
      res.send(result);
     
          }
          else{
              res.send({message:"Already Project Exited"});
          }
   
  
  });
});
app.post("/createtimesheet", (req, res) => {
  var TimeSheetarr=[];
  let k=0;
  let l=0;
  let j=0;
  let sickleave=0;
  let vacationLeave=0;
 var TimeSheetCount='';
 db.query( "SELECT count(*) as length FROM edittimesheet", function (err, TimeSheetcount) {
      if (err) throw err;
      TimeSheetCount=TimeSheetcount[0].length
     
     db.query("select * from edittimesheet", function (err, TimeSheet) {
       if (err) throw err;
       for(var i=0;i<TimeSheetCount;i++)
       {
       TimeSheetarr[i]=TimeSheet[i].UserId+"^"+TimeSheet[i].Date+"^"+TimeSheet[i].Location+"^"+TimeSheet[i].Project+"^"+TimeSheet[i].AA_Types;
       
     
    
       }
   
       
       const taskList=req.body.taskList;
    
       const myDate=req.body.myDate;
       const id=req.body.id;
       const submit=req.body.Submit
       let DeleteArr=[];
       let DublicateEntry=[];
       let CreateEntry=[];
       let SickHrs=0;
       let VacationHrs=0;
       const len = taskList.length;
       let AA_Type=""
       let hrsgreaterthan24=0;
       let Weekends=0;
       let Sunday=0;
       let Monday=0;
       let Tuesday=0;
       let Wednesday=0;
       let Thursday=0;
       let Friday=0;
       let Saturday=0;
       let AA_Type_Sunday="";
       let AA_Type_Monday="";
       let AA_Type_Tuesday="";
       let AA_Type_Wednesday="";
       let AA_Type_Thursday="";
       let AA_Type_Friday="";
       let AA_Type_Saturday="";
       let WeekAA_Type="";
       let Regular_HRSWeek="";
       let VacationAccural=0;
      
       let SundayDate=req.body.myDate;
       var d = new Date(SundayDate)
let MondayDate=new Date(d.setDate(d.getDate() + 1))
MondayDate= Moment(MondayDate).format('MMM DD yyyy')
let TuesdayDate=new Date(d.setDate(d.getDate() + 1))
TuesdayDate= Moment(TuesdayDate).format('MMM DD yyyy')
let WednesdayDate=new Date(d.setDate(d.getDate() + 1))
WednesdayDate= Moment(WednesdayDate).format('MMM DD yyyy')
let ThursdayDate=new Date(d.setDate(d.getDate() + 1))
ThursdayDate= Moment(ThursdayDate).format('MMM DD yyyy')
let FridayDate=new Date(d.setDate(d.getDate() + 1))
FridayDate= Moment(FridayDate).format('MMM DD yyyy')
let SaturdayDate=new Date(d.setDate(d.getDate() + 1))
SaturdayDate= Moment(SaturdayDate).format('MMM DD yyyy')
let WeekDays=[SundayDate,MondayDate,TuesdayDate,WednesdayDate,ThursdayDate,FridayDate,SaturdayDate]
let WeekDates=[];
      //  console.log("id",id)
      var Sql="SELECT EmployeeGroup,Seniority,SickLeave,Vacation from user WHERE uid=?"
       db.query(Sql,[id],function (err, EmployeeGroupUser) {
      //  console.log("Employee",EmployeeGroupUser[0])
        db.query("SELECT NoOfLeaves from sick WHERE EmployeeGroup=?",[EmployeeGroupUser[0].EmployeeGroup],function(err,sickNoOfLeaves){
        db.query("SELECT * FROM vacation WHERE Employeegroup=? ",[EmployeeGroupUser[0].EmployeeGroup],function(err,VacationNoOfLeaves){     
          db.query("SELECT * FROM edittimesheet",function(err,TimeSheet){ 
          for(var i=0;i<len;i++){
         
  if(taskList[i].Sunday==""){taskList[i].Sunday=0;}
  if(taskList[i].Monday==""){taskList[i].Monday=0;}
  if(taskList[i].Tuesday==""){taskList[i].Tuesday=0;}
  if(taskList[i].Wednesday==""){taskList[i].Wednesday=0;}
  if(taskList[i].Thursday==""){taskList[i].Thursday=0;}
  if(taskList[i].Friday==""){taskList[i].Friday=0;}
  if(taskList[i].Saturday==""){taskList[i].Saturday=0;}
  if(parseInt(taskList[i].Sunday)>24||parseInt(taskList[i].Monday)>24||parseInt(taskList[i].Tuesday)>24||parseInt(taskList[i].Wednesday)>24||parseInt(taskList[i].Thursday)>24||parseInt(taskList[i].Friday)>24||parseInt(taskList[i].Saturday)>24)
  {
    hrsgreaterthan24=1;
  }
  if(taskList[i].AA_Types==="Regular Hours")
  {
    Regular_HRSWeek=taskList[i].Monday+"^"+taskList[i].Wednesday+"^"+taskList[i].Thursday+"^"+taskList[i].Friday
  Sunday=Sunday+parseInt(taskList[i].Sunday);
  Monday=Monday+parseInt(taskList[i].Monday);
  Tuesday=Tuesday+parseInt(taskList[i].Tuesday);
  Wednesday=Wednesday+parseInt(taskList[i].Wednesday);
  Thursday=Thursday+parseInt(taskList[i].Thursday);
  Friday=Friday+parseInt(taskList[i].Friday);
  Saturday=Saturday+parseInt(taskList[i].Saturday);

  }
  else{
    console.log("Sunday",taskList[i].Sunday)
  
    if(parseInt(taskList[i].Sunday)!==0)
    {
      AA_Type_Sunday=taskList[i].AA_Types;
     Sunday=Sunday+parseInt(taskList[i].Sunday);
    }
    if(parseInt(taskList[i].Monday)!==0)
    {
      AA_Type_Monday=taskList[i].AA_Types;
    Monday=Monday+parseInt(taskList[i].Monday);
    }
    if(parseInt(taskList[i].Tuesday)!==0)
    {
      AA_Type_Tuesday=taskList[i].AA_Types;
    Tuesday=Tuesday+parseInt(taskList[i].Tuesday);
    }
    if(parseInt(taskList[i].Wednesday)!==0)
    {
      AA_Type_Wednesday=taskList[i].AA_Types;
    Wednesday=Wednesday+parseInt(taskList[i].Wednesday);
    }
    if(parseInt(taskList[i].Thursday)!==0)
    {
      AA_Type_Thursday=taskList[i].AA_Types;
    Thursday=Thursday+parseInt(taskList[i].Thursday);
    }
   if(parseInt(taskList[i].Friday)!==0)
   {
    AA_Type_Friday=taskList[i].AA_Types;
   Friday=Friday+parseInt(taskList[i].Friday);
   }
   if(parseInt(taskList[i].Saturday)!==0)
   {
    AA_Type_Saturday=taskList[i].AA_Types;
   Saturday=Saturday+parseInt(taskList[i].Saturday);
   }
    }
  

            if(taskList[i].AA_Types==="Vacation"||taskList[i].AA_Types==="Sick Leave")
            {
        if(parseInt(taskList[i].Sunday)>0||parseInt(taskList[i].Saturday)>0) 
        {
           Weekends=1;
           WeekAA_Type=taskList[i].AA_Types;

        }  
            
            if(taskList[i].Sunday==="8"||taskList[i].Sunday==="4"||taskList[i].Sunday===0||taskList[i].Sunday==="0")
      {
       
       
  
       }
       else{
        AA_Type=taskList[i].AA_Types
        VacationHrs=1;
        SickHrs=1;
        console.log("hello",taskList[i].Sunday)
      }
     if(taskList[i].Monday==="8"||taskList[i].Monday==="4"||taskList[i].Monday===0||taskList[i].Monday==="0")
      {
      
      }
      else{
        AA_Type=taskList[i].AA_Types
        VacationHrs=1;
        SickHrs=1;
      }
     if(taskList[i].Tuesday==="8"||taskList[i].Tuesday==="4"||taskList[i].Tuesday===0||taskList[i].Tuesday==="0" )
      {
       
      }
      else{
        AA_Type=taskList[i].AA_Types
        VacationHrs=1;
        SickHrs=1;
      }
       if(taskList[i].Wednesday==="8"||taskList[i].Wednesday==="4"||taskList[i].Wednesday===0||taskList[i].Wednesday==="0")
      {
        
      }
      else{
        AA_Type=taskList[i].AA_Types
        VacationHrs=1;
        SickHrs=1;
      }
         if(taskList[i].Thursday==="8"||taskList[i].Thursday==="4"||taskList[i].Thursday===0||taskList[i].Thursday==="0" )
        {
          
        }
        else{
          AA_Type=taskList[i].AA_Types
          VacationHrs=1;
          SickHrs=1;
        }
           if(taskList[i].Friday==="8"||taskList[i].Friday==="4"||taskList[i].Friday===0||taskList[i].Friday==="0" )
          {
             
         }
         else{
          AA_Type=taskList[i].AA_Types
          VacationHrs=1;
          SickHrs=1;
        }
          if(taskList[i].Saturday==="8"||taskList[i].Saturday==="4"||taskList[i].Saturday===0||taskList[i].Saturday==="0" )
         {
            
        }
        else{
          AA_Type=taskList[i].AA_Types
          VacationHrs=1;
          SickHrs=1;
        }
          }
  console.log(hrsgreaterthan24,Weekends)
  
if(taskList[i].AA_Types==="Sick Leave"&&hrsgreaterthan24!=1&&Weekends!=1)
{
  
  if(!DublicateEntry.includes(id+"^"+myDate+"^"+taskList[i].Location+"^"+taskList[i].Project+"^"+taskList[i].AA_Types)){
    DublicateEntry.push(id+"^"+myDate+"^"+taskList[i].Location+"^"+taskList[i].Project+"^"+taskList[i].AA_Types)
    if(TimeSheetarr.includes(id+"^"+myDate+"^"+taskList[i].Location+"^"+taskList[i].Project+"^"+taskList[i].AA_Types)){
    l=1;}
    else{
   CreateEntry.push(new Array(id,myDate,taskList[i].Project,taskList[i].Sunday,taskList[i].Cmt1,taskList[i].Monday,taskList[i].Cmt2,taskList[i].Tuesday,taskList[i].Cmt3,taskList[i].Wednesday,taskList[i].Cmt4,taskList[i].Thursday,taskList[i].Cmt5,taskList[i].Friday,taskList[i].Cmt6,taskList[i].Saturday,taskList[i].Cmt7,submit,taskList[i].Location,taskList[i].Shift_Premium,taskList[i].AA_Types,id));
    k++;}}
  if(l!=1&&SickHrs!=1&&hrsgreaterthan24!=1&&Weekends!=1)
  {
    let jl=0;
  
   for(let Days=0;Days<7;Days++)
   {
     if(!WeekDates.includes(WeekDays[Days].substring(7,11)))
     {
       WeekDates[jl]=WeekDays[Days].substring(7,11)
       jl++;;
       console.log(WeekDates,WeekDays)
     }
     }
     for(let years=0;years<WeekDates.length;years++)
     {
     
      let RDay=1
      const YEAR=WeekDates[years]+"-"+"Jan";
      let myDate=WeekDates[years]+"-"+"Jan"+"-"+RDay;
      console.log("myDate",myDate,WeekDates.length)
  
      var NoOfWeeks=Moment(WeekDates[years], "YYYY").weeksInYear();
      var Day= Moment(myDate).isoWeekday()
      myDate=Moment(myDate).format('YYYY-MM-DD')
    
      var CurrentDate = new Date(new Date(parseInt(myDate.substring(0,4)), parseInt(myDate.substring(5,7))-1, parseInt(myDate.substring(8,10))));
  
      var CurrentWeekDay = CurrentDate.getDay();
  
      var CurrentWeekDate = new Date(
      new Date(CurrentDate).setDate(CurrentDate.getDate() - CurrentWeekDay)
      );
  
      var Day1 = new Date(new Date(CurrentWeekDate).setDate(CurrentWeekDate.getDate() + 0)).toDateString();
   
      var Week1= Moment(Day1).format('MMM DD yyyy')
   
      let Sick_Leave_String="";
      for(let Weeks=0;Weeks<=NoOfWeeks;Weeks++)
      {
      

       for(let res=0;res<TimeSheet.length;res++)
       {
      
if(TimeSheet[res].Date===Week1&&TimeSheet[res].AA_Types==="Sick Leave"&&TimeSheet[res].UserId===id&&TimeSheet[res].Submit==="Approval")
{
 
  var h = new Date(Week1)
  let SundayWeek=Week1;
  let  MondayWeek =new Date(h.setDate(h.getDate() + 1))
  MondayWeek= Moment(MondayWeek).format('MMM DD yyyy')
  let  TuesdayWeek =new Date(h.setDate(h.getDate() + 1))
  TuesdayWeek= Moment(TuesdayWeek).format('MMM DD yyyy')
  let  WednesdayWeek =new Date(h.setDate(h.getDate() + 1))
  WednesdayWeek= Moment(WednesdayWeek).format('MMM DD yyyy')
  let  ThursdayWeek =new Date(h.setDate(h.getDate() + 1))
  ThursdayWeek= Moment(ThursdayWeek).format('MMM DD yyyy')
  let  FridayWeek =new Date(h.setDate(h.getDate() + 1))
  FridayWeek= Moment(FridayWeek).format('MMM DD yyyy')
  let  SaturdayWeek =new Date(h.setDate(h.getDate() + 1))
  SaturdayWeek= Moment(SaturdayWeek).format('MMM DD yyyy')
  if(SundayWeek.includes(WeekDates[years]))
  {
    Sick_Leave_String=Sick_Leave_String+"^"+TimeSheet[res].Sunday;
  }
  if(MondayWeek.includes(WeekDates[years]))
  {
    Sick_Leave_String=Sick_Leave_String+"^"+TimeSheet[res].Monday;
  }
  if(TuesdayWeek.includes(WeekDates[years]))
  {
    Sick_Leave_String=Sick_Leave_String+"^"+TimeSheet[res].Tuesday;
  }
  if(WednesdayWeek.includes(WeekDates[years]))
  {
    Sick_Leave_String=Sick_Leave_String+"^"+TimeSheet[res].Wednesday;
  }
  if(ThursdayWeek.includes(WeekDates[years]))
  {
    Sick_Leave_String=Sick_Leave_String+"^"+TimeSheet[res].Thursday;
  }
  if(FridayWeek.includes(WeekDates[years]))
  {
    Sick_Leave_String=Sick_Leave_String+"^"+TimeSheet[res].Friday;
  }
  if(SaturdayWeek.includes(WeekDates[years]))
  {
    Sick_Leave_String=Sick_Leave_String+"^"+TimeSheet[res].Saturday;
  }
 

}
       }
      
      
      
       var e = new Date(Week1)
     let  WeekDate1 =new Date(e.setDate(e.getDate() + 7))
  
        Week1= Moment(WeekDate1).format('MMM DD yyyy')
    
       }
      
      
       if(SundayDate.includes(WeekDates[years]))
       {
      //   console.log("12334455")
         Sick_Leave_String=Sick_Leave_String+"^"+taskList[i].Sunday;
       }
       if(MondayDate.includes(WeekDates[years]))
       {
         Sick_Leave_String=Sick_Leave_String+"^"+taskList[i].Monday;
       }
       if(TuesdayDate.includes(WeekDates[years]))
       {
         Sick_Leave_String=Sick_Leave_String+"^"+taskList[i].Tuesday;
       }
       if(WednesdayDate.includes(WeekDates[years]))
       {
         Sick_Leave_String=Sick_Leave_String+"^"+taskList[i].Wednesday;
       }
       if(ThursdayDate.includes(WeekDates[years]))
       {
         Sick_Leave_String=Sick_Leave_String+"^"+taskList[i].Thursday;
       }
       if(FridayDate.includes(WeekDates[years]))
       {
         Sick_Leave_String=Sick_Leave_String+"^"+taskList[i].Friday;
       }
       if(SaturdayDate.includes(WeekDates[years]))
       {
         Sick_Leave_String=Sick_Leave_String+"^"+taskList[i].Saturday;
       }
       console.log("Sick Levae",Sick_Leave_String)
       let Days_Arr=[];
       Days_Arr=Sick_Leave_String.split("^");
       let Total=0;
       for(let m=1;m<Days_Arr.length;m++)
       {
  
Total=Total+parseInt(Days_Arr[m])

       }
       console.log("Total",Total)
     
     
  
 

 
     if(Total>=(sickNoOfLeaves[0].NoOfLeaves*8)){
      sickleave=1;
    }
    
  }
  }
   
  }

//Vacation Accural

   if(taskList[i].AA_Types==="Vacation"&&hrsgreaterthan24!=1&&Weekends!=1){
   
  

    if(!DublicateEntry.includes(id+"^"+myDate+"^"+taskList[i].Location+"^"+taskList[i].Project+"^"+taskList[i].AA_Types)){
      DublicateEntry.push(id+"^"+myDate+"^"+taskList[i].Location+"^"+taskList[i].Project+"^"+taskList[i].AA_Types)
      if(TimeSheetarr.includes(id+"^"+myDate+"^"+taskList[i].Location+"^"+taskList[i].Project+"^"+taskList[i].AA_Types)){
      l=1;}
      else{
     CreateEntry.push(new Array(id,myDate,taskList[i].Project,taskList[i].Sunday,taskList[i].Cmt1,taskList[i].Monday,taskList[i].Cmt2,taskList[i].Tuesday,taskList[i].Cmt3,taskList[i].Wednesday,taskList[i].Cmt4,taskList[i].Thursday,taskList[i].Cmt5,taskList[i].Friday,taskList[i].Cmt6,taskList[i].Saturday,taskList[i].Cmt7,submit,taskList[i].Location,taskList[i].Shift_Premium,taskList[i].AA_Types,id));
      k++;}}
      if(l!=1&&VacationHrs!=1&&hrsgreaterthan24!=1&&Weekends!=1)
      {
        let jl=0;
  
        for(let Days=0;Days<7;Days++)
        {
          if(!WeekDates.includes(WeekDays[Days].substring(7,11)))
          {
            WeekDates[jl]=WeekDays[Days].substring(7,11)
            jl++;;
            console.log(WeekDates,WeekDays)
          }
          }
          for(let years=0;years<WeekDates.length;years++)
          {
          
           let RDay=1
           const YEAR=WeekDates[years]+"-"+"Jan";
           let myDate=WeekDates[years]+"-"+"Jan"+"-"+RDay;
           console.log("myDate",myDate,WeekDates.length)
       
           var NoOfWeeks=Moment(WeekDates[years], "YYYY").weeksInYear();
           var Day= Moment(myDate).isoWeekday()
           myDate=Moment(myDate).format('YYYY-MM-DD')
      
           var CurrentDate = new Date(new Date(parseInt(myDate.substring(0,4)), parseInt(myDate.substring(5,7))-1, parseInt(myDate.substring(8,10))));
    
           var CurrentWeekDay = CurrentDate.getDay();
     
           var CurrentWeekDate = new Date(
           new Date(CurrentDate).setDate(CurrentDate.getDate() - CurrentWeekDay)
           );
     
           var Day1 = new Date(new Date(CurrentWeekDate).setDate(CurrentWeekDate.getDate() + 0)).toDateString();
     
           var Week1= Moment(Day1).format('MMM DD yyyy')
       
           let Vacation_String="";
           let Vacation_Accured=0;
           for(let Weeks=0;Weeks<=NoOfWeeks;Weeks++)
           {
           
     
            for(let res=0;res<TimeSheet.length;res++)
            {
              var h = new Date(Week1)
              let SundayWeek=Week1;
              let  MondayWeek =new Date(h.setDate(h.getDate() + 1))
              MondayWeek= Moment(MondayWeek).format('MMM DD yyyy')
              let  TuesdayWeek =new Date(h.setDate(h.getDate() + 1))
              TuesdayWeek= Moment(TuesdayWeek).format('MMM DD yyyy')
              let  WednesdayWeek =new Date(h.setDate(h.getDate() + 1))
              WednesdayWeek= Moment(WednesdayWeek).format('MMM DD yyyy')
              let  ThursdayWeek =new Date(h.setDate(h.getDate() + 1))
              ThursdayWeek= Moment(ThursdayWeek).format('MMM DD yyyy')
              let  FridayWeek =new Date(h.setDate(h.getDate() + 1))
              FridayWeek= Moment(FridayWeek).format('MMM DD yyyy')
              let  SaturdayWeek =new Date(h.setDate(h.getDate() + 1))
              SaturdayWeek= Moment(SaturdayWeek).format('MMM DD yyyy')
     if(TimeSheet[res].Date===Week1&&TimeSheet[res].AA_Types==="Vacation"&&TimeSheet[res].UserId===id&&TimeSheet[res].Submit==="Approval")
     {
      
     
       if(SundayWeek.includes(WeekDates[years]))
       {
        Vacation_String=Vacation_String+"^"+TimeSheet[res].Sunday;
       }
       if(MondayWeek.includes(WeekDates[years]))
       {
        Vacation_String=Vacation_String+"^"+TimeSheet[res].Monday;
       }
       if(TuesdayWeek.includes(WeekDates[years]))
       {
        Vacation_String=Vacation_String+"^"+TimeSheet[res].Tuesday;
       }
       if(WednesdayWeek.includes(WeekDates[years]))
       {
        Vacation_String=Vacation_String+"^"+TimeSheet[res].Wednesday;
       }
       if(ThursdayWeek.includes(WeekDates[years]))
       {
        Vacation_String=Vacation_String+"^"+TimeSheet[res].Thursday;
       }
       if(FridayWeek.includes(WeekDates[years]))
       {
        Vacation_String=Vacation_String+"^"+TimeSheet[res].Friday;
       }
       if(SaturdayWeek.includes(WeekDates[years]))
       {
        Vacation_String=Vacation_String+"^"+TimeSheet[res].Saturday;
       }
      
   
     }
            
     if(TimeSheet[res].Date===Week1&&TimeSheet[res].AA_Types==="Regular Hours"&&TimeSheet[res].UserId===id&&TimeSheet[res].Submit==="Approval")
     {
      
     
      if(MondayWeek.includes(WeekDates[years]))
                                {
                                    if(parseInt(TimeSheet[res].Monday)<=8)
                                    {
                                        Vacation_Accured=Vacation_Accured+parseInt(TimeSheet[res].Monday)
                                    }
                                    else{
                                        Vacation_Accured=Vacation_Accured+8;
                                    }
                                 
                                }
                                if(TuesdayWeek.includes(WeekDates[years]))
                                {
                                    if(parseInt(TimeSheet[res].Tuesday)<=8)
                                    {
                                        Vacation_Accured=Vacation_Accured+parseInt(TimeSheet[res].Tuesday)
                                    }
                                    else{
                                        Vacation_Accured=Vacation_Accured+8;
                                    }
                                  
                                }
                                if(WednesdayWeek.includes(WeekDates[years]))
                                {
                                    if(parseInt(TimeSheet[res].Wednesday)<=8)
                                    {
                                        Vacation_Accured=Vacation_Accured+parseInt(TimeSheet[res].Wednesday)
                                    }
                                    else{
                                        Vacation_Accured=Vacation_Accured+8;
                                    }
                               
                                }
                                if(ThursdayWeek.includes(WeekDates[years]))
                                {
                                    if(parseInt(TimeSheet[res].Thursday)<=8)
                                    {
                                        Vacation_Accured=Vacation_Accured+parseInt(TimeSheet[res].Thursday)
                                    }
                                    else{
                                        Vacation_Accured=Vacation_Accured+8;
                                    }
                                   
                                }
                                if(FridayWeek.includes(WeekDates[years]))
                                {
                                    if(parseInt(TimeSheet[res].Friday)<=8)
                                    {
                                        Vacation_Accured=Vacation_Accured+parseInt(TimeSheet[res].Friday)
                                    }
                                    else{
                                        Vacation_Accured=Vacation_Accured+8;
                                    }
                                  
                                }
   
     }
            }
           
           
           
            var e = new Date(Week1)
          let  WeekDate1 =new Date(e.setDate(e.getDate() + 7))
        //  console.log("WeekDate1",WeekDate1)
             Week1= Moment(WeekDate1).format('MMM DD yyyy')
           // console.log("Week1_After",Week1)
            }
           
           
            if(SundayDate.includes(WeekDates[years]))
            {
             
              Vacation_String=Vacation_String+"^"+taskList[i].Sunday;
            }
            if(MondayDate.includes(WeekDates[years]))
            {
              Vacation_String=Vacation_String+"^"+taskList[i].Monday;
            }
            if(TuesdayDate.includes(WeekDates[years]))
            {
              Vacation_String=Vacation_String+"^"+taskList[i].Tuesday;
            }
            if(WednesdayDate.includes(WeekDates[years]))
            {
              Vacation_String=Vacation_String+"^"+taskList[i].Wednesday;
            }
            if(ThursdayDate.includes(WeekDates[years]))
            {
              Vacation_String=Vacation_String+"^"+taskList[i].Thursday;
            }
            if(FridayDate.includes(WeekDates[years]))
            {
              Vacation_String=Vacation_String+"^"+taskList[i].Friday;
            }
            if(SaturdayDate.includes(WeekDates[years]))
            {
              Vacation_String=Vacation_String+"^"+taskList[i].Saturday;
            }
          //  console.log("Vacation",Vacation_String)
            let Days_Arr=[];
            Days_Arr=Vacation_String.split("^");
            let vacationLeavetotal=0;
            for(let m=1;m<Days_Arr.length;m++)
            {
       
              vacationLeavetotal=vacationLeavetotal+parseInt(Days_Arr[m])
     
            }
            let arr123=[];
            arr123=Regular_HRSWeek.split("^");
           
              if(MondayDate.includes(WeekDates[years]))
              {
                Vacation_Accured=Vacation_Accured+arr123[0];
              }
              if(TuesdayDate.includes(WeekDates[years]))
              {
                Vacation_Accured=Vacation_Accured+arr123[0];
              }
              if(WednesdayDate.includes(WeekDates[years]))
              {
                Vacation_Accured=Vacation_Accured+arr123[0];
              }
              if(ThursdayDate.includes(WeekDates[years]))
              {
                Vacation_Accured=Vacation_Accured+arr123[0];
              }
              if(FridayDate.includes(WeekDates[years]))
              {
                Vacation_Accured=Vacation_Accured+arr123[0];
              }
            
            console.log("Total",vacationLeavetotal)
          
          
      
     
            for(let vac=0;vac<VacationNoOfLeaves.length;vac++)
            {
                if((parseInt(VacationNoOfLeaves[vac].MaxSeniority)>=parseInt(EmployeeGroupUser[0].Seniority))&&(parseInt(EmployeeGroupUser[0].Seniority)>=parseInt(VacationNoOfLeaves[vac].MinSeniority)))
                {
               let Vacation_Accured_Total= Math.round(((VacationNoOfLeaves[vac].NoOfLeaves/2080)*(Vacation_Accured))*10000)/10000  
               let Vaction_Vacation_total=Math.round(((VacationNoOfLeaves[vac].NoOfLeaves/2080)*(vacationLeavetotal))*10000)/10000  
               if(Vaction_Vacation_total>Vacation_Accured_Total)
               {
                VacationAccural=1;
                 console.log("helooo123456789")
               }
             
            }
          
      
             
          }
  }
}
     
  }
  //Vacation Entitlement
    if(taskList[i].AA_Types==="Vacation"&&hrsgreaterthan24!=1&&Weekends!=1&&VacationAccural!=1){
   
  let x;
    if(!DublicateEntry.includes(id+"^"+myDate+"^"+taskList[i].Location+"^"+taskList[i].Project+"^"+taskList[i].AA_Types)){
      DublicateEntry.push(id+"^"+myDate+"^"+taskList[i].Location+"^"+taskList[i].Project+"^"+taskList[i].AA_Types)
      if(TimeSheetarr.includes(id+"^"+myDate+"^"+taskList[i].Location+"^"+taskList[i].Project+"^"+taskList[i].AA_Types)){
      l=1;}
      else{
     CreateEntry.push(new Array(id,myDate,taskList[i].Project,taskList[i].Sunday,taskList[i].Cmt1,taskList[i].Monday,taskList[i].Cmt2,taskList[i].Tuesday,taskList[i].Cmt3,taskList[i].Wednesday,taskList[i].Cmt4,taskList[i].Thursday,taskList[i].Cmt5,taskList[i].Friday,taskList[i].Cmt6,taskList[i].Saturday,taskList[i].Cmt7,submit,taskList[i].Location,taskList[i].Shift_Premium,taskList[i].AA_Types));
      k++;}}
      if(l!=1&&VacationHrs!=1&&hrsgreaterthan24!=1&&Weekends!=1)
      {
        console.log("123456789")
        let vacationLeavetotal=0;
        let vacationLeavetotal1=0;
        let Mixedyear=0,nextyear=0;
        console.log("VacationWeekDays",WeekDays)
        if((WeekDays[0].substring(7,11))===WeekDays[6].substring(7,11))
        {
          vacationLeavetotal=vacationLeavetotal+parseInt(taskList[i].Sunday)+parseInt(taskList[i].Monday)+parseInt(taskList[i].Tuesday)+parseInt(taskList[i].Wednesday)+parseInt(taskList[i].Thursday)+parseInt(taskList[i].Friday)+parseInt(taskList[i].Saturday)
         console.log("Non-mixed year")
        }
        else
        {
          Mixedyear=1
          for( x=0;x<7;x++)
          { 
            console.log(WeekDays[x].substring(0,6),"WeekDays[i].substring(0,6)")
            if(WeekDays[x].substring(0,6)==="Jan 01")
            {
              console.log("Index of Mixed Year",x)
              break;
            }
          }
        // if(x==1)
        // {
        // vacationLeavetotal=vacationLeavetotal+parseInt(taskList[i].Sunday)
        // vacationLeavetotal1=vacationLeavetotal1+parseInt(taskList[i].Monday)+parseInt(taskList[i].Tuesday)+parseInt(taskList[i].Wednesday)+parseInt(taskList[i].Thursday)+parseInt(taskList[i].Friday)
        // }
         if(x==2)
        {
        vacationLeavetotal=vacationLeavetotal+parseInt(taskList[i].Sunday)+parseInt(taskList[i].Monday)
        vacationLeavetotal1=vacationLeavetotal1+parseInt(taskList[i].Tuesday)+parseInt(taskList[i].Wednesday)+parseInt(taskList[i].Thursday)+parseInt(taskList[i].Friday)
        }
        else if(x==3)
        {
        vacationLeavetotal=vacationLeavetotal+parseInt(taskList[i].Sunday)+parseInt(taskList[i].Monday)+parseInt(taskList[i].Tuesday)
        vacationLeavetotal1=vacationLeavetotal1+parseInt(taskList[i].Wednesday)+parseInt(taskList[i].Thursday)+parseInt(taskList[i].Friday)
        }
        else if(x==4)
        {
        vacationLeavetotal=vacationLeavetotal+parseInt(taskList[i].Sunday)+parseInt(taskList[i].Monday)+parseInt(taskList[i].Tuesday)+parseInt(taskList[i].Wednesday)
        vacationLeavetotal1=vacationLeavetotal1+parseInt(taskList[i].Thursday)+parseInt(taskList[i].Friday)
       
        }
        else if(x==5)
        {
        vacationLeavetotal=vacationLeavetotal+parseInt(taskList[i].Sunday)+parseInt(taskList[i].Monday)+parseInt(taskList[i].Tuesday)+parseInt(taskList[i].Wednesday)+parseInt(taskList[i].Thursday)  
        vacationLeavetotal1=vacationLeavetotal1+parseInt(taskList[i].Friday)
       
       } else if(x==6)
       vacationLeavetotal=vacationLeavetotal+parseInt(taskList[i].Sunday)+parseInt(taskList[i].Monday)+parseInt(taskList[i].Tuesday)+parseInt(taskList[i].Wednesday)+parseInt(taskList[i].Thursday)+parseInt(taskList[i].Friday)
       console.log("Mixed year VacationLeavetot",vacationLeavetotal)
      }
          
        
        //  console.log("EmployeeGroupUser[0].Vacation"+EmployeeGroupUser[0].Vacation)
         
        if(EmployeeGroupUser[0].Vacation=='0'){
          console.log(vacationLeavetotal+"    vacationLeavetotal")
          console.log(VacationNoOfLeaves+"    VacationNoOfLeaves")

         for(let i=0;i<VacationNoOfLeaves.length;i++)
         {
           console.log(VacationNoOfLeaves[i].MinSeniority+"VacationNoOfLeaves[i].MinSeniority top")
           console.log(VacationNoOfLeaves[i].MaxSeniority+"VacationNoOfLeaves[i].MaxSeniority top")
             if(VacationNoOfLeaves[i].MinSeniority<=EmployeeGroupUser[0].Seniority<=VacationNoOfLeaves[0].MaxSeniority)
             {
              console.log(EmployeeGroupUser[0].Seniority+"    EmployeeGroupUser[0].Seniority")
              console.log(vacationLeavetotal1+"    vacationLeavetotal1")
              console.log(vacationLeavetotal+"    vacationLeavetotal")
              console.log(VacationNoOfLeaves[i].NoOfLeaves*8+"    VacationNoOfLeaves[i].NoOfLeaves*8)")
         
              if(vacationLeavetotal>(VacationNoOfLeaves[i].NoOfLeaves*8))
           {
              console.log("if block")
             vacationLeave=1;
           }
           else{                    
            if(Mixedyear==0)
            db.query("UPDATE user SET Vacation= ? WHERE uid =?",[myDate.substring(7,11)+"-"+vacationLeavetotal,id]);
           else
           {
             nextyear=parseInt(myDate.substring(7,11))+1;
           db.query("UPDATE user SET Vacation= ? WHERE uid =?",[myDate.substring(7,11)+"-"+vacationLeavetotal+"," +nextyear+"-"+vacationLeavetotal1,id]);
           // console.log("mydate1",)
           }
          }
          
       }
     }
         //vacationLeavetotal=vacationLeavetotal+parseInt(EmployeeGroupUser[0].Vacation)
        }
        else{
        
         let EmployeeGroup=[],remarray=[],count=0;
         EmployeeGroup=EmployeeGroupUser[0].Vacation.split(",")
     //    console.log("EmployeeGrouplen:"+EmployeeGroup.length)
         for(let j=0;j<EmployeeGroup.length;j++)
         remarray[j]=EmployeeGroup[j]
         nextyear=parseInt(myDate.substring(7,11))+1;
        for(let j=0;j<EmployeeGroup.length;j++){
         if(EmployeeGroup[j].substring(0,4)===myDate.substring(7,11) ){
           count++
          
           //console.log("EmployeeGroup:"+EmployeeGroup[j])
           vacationLeavetotal=vacationLeavetotal+parseInt(EmployeeGroup[j].substring(5,EmployeeGroup[j].length)) 
          
          remarray[j]=myDate.substring(7,11)+"-"+vacationLeavetotal;
         // console.log("remarray"+remarray[j])
      
         }
         
       }
 
        console.log("UpdatedRemainingarray",remarray.toString())
         
         //for loop
         if(count===0)
         {
            if(Mixedyear==1)
            {
            nextyear=parseInt(myDate.substring(7,11))+1;
           db.query("UPDATE user SET Vacation= ? WHERE uid =?",[EmployeeGroupUser[0].Vacation+","+myDate.substring(7,11)+"-"+vacationLeavetotal+"," +nextyear+"-"+vacationLeavetotal1,id]);
            }
            if(Mixedyear==0)
           db.query("UPDATE user SET Vacation= ? WHERE uid =?",[EmployeeGroupUser[0].Vacation+","+myDate.substring(7,11)+"-"+vacationLeavetotal,id]);
          // console.log("new year"+EmployeeGroupUser[0].Vacation+","+myDate.substring(7,11)+"-"+vacationLeavetotal,id);
         
        } 
         else
         {
           // console.log("sameyear"+EmployeeGroup[j])
           // console.log("Updatedvalues:"+EmployeeGroup[j].substring(5,7))//database vacation values
           // console.log("VacTotal:"+vacationLeavetotal)//Timesheet values
           console.log("Length of vaca:",EmployeeGroup[j].length)
           //vacationLeavetotal=vacationLeavetotal+parseInt(EmployeeGroup[j].substring(5,EmployeeGroup[j].length)) 
          
          // console.log("remarraylen"+remarray.length)
           for(let i=0;i<VacationNoOfLeaves.length;i++)
         {
          console.log(VacationNoOfLeaves[i].MinSeniority+"VacationNoOfLeaves[i].MinSeniority")
          console.log(VacationNoOfLeaves[i].MaxSeniority+"VacationNoOfLeaves[i].MaxSeniority")

             if(VacationNoOfLeaves[i].MinSeniority<=EmployeeGroupUser[0].Seniority<=VacationNoOfLeaves[0].MaxSeniority)
             {
              
                console.log(vacationLeavetotal+"   vacationLeavetotal")
                console.log(VacationNoOfLeaves[i].NoOfLeaves*8+"  VacationNoOfLeaves[i].NoOfLeaves*8")
                console.log(remarray+"remarray");
            
                if(!(vacationLeavetotal>(VacationNoOfLeaves[i].NoOfLeaves*8)))
                {
                  console.log("same year update:",remarray)
                // vacationLeave=2;
               if(Mixedyear==0)
                db.query("UPDATE user SET Vacation= ? WHERE uid =?",[remarray.toString(),id]);
                if(Mixedyear==1)
                {
                  nextyear=parseInt(myDate.substring(7,11))+1;  
                db.query("UPDATE user SET Vacation= ? WHERE uid =?",[remarray.toString()+","+nextyear+"-"+vacationLeavetotal1,id]);
                //console.log("same year update:",myDate.substring(7,11)+"-"+vacationLeavetotal,id)
                }
              }
                if(vacationLeavetotal>(VacationNoOfLeaves[i].NoOfLeaves*8))
                {
                  console.log("Skipped if")
                  vacationLeave=1;
                }
                break;
              }  
       }
    
     
     }
     
   //let yeararr=[]
 //let EmployeeGroup1=[],EmployeeGroup11=[]
  // EmployeeGroup1=EmployeeGroupUser[0].Vacation.split("-")
   //EmployeeGroup11=EmployeeGroup1.split("-")
 //for(k=0;k<EmployeeGroup11.length;k++){
   //yeararr=  EmployeeGroup1[j].substring(0,4)
   
   //}
   //console.log("yeararr:"+yeararr)
     
    
       }
       

}
     
  }  
 else{
  if(hrsgreaterthan24!==1&&Weekends!==1)
  {
      if(!DublicateEntry.includes(id+"^"+myDate+"^"+taskList[i].Location+"^"+taskList[i].Project+"^"+taskList[i].AA_Types)){
        DublicateEntry.push(id+"^"+myDate+"^"+taskList[i].Location+"^"+taskList[i].Project+"^"+taskList[i].AA_Types)
        if(TimeSheetarr.includes(id+"^"+myDate+"^"+taskList[i].Location+"^"+taskList[i].Project+"^"+taskList[i].AA_Types)){
        l=1;}
        else{
       CreateEntry.push(new Array(id,myDate,taskList[i].Project,taskList[i].Sunday,taskList[i].Cmt1,taskList[i].Monday,taskList[i].Cmt2,taskList[i].Tuesday,taskList[i].Cmt3,taskList[i].Wednesday,taskList[i].Cmt4,taskList[i].Thursday,taskList[i].Cmt5,taskList[i].Friday,taskList[i].Cmt6,taskList[i].Saturday,taskList[i].Cmt7,submit,taskList[i].Location,taskList[i].Shift_Premium,taskList[i].AA_Types,id));
        k++;}}
 }
    }
          
        }
      var sql="insert into edittimesheet(UserId,Date,Project,Sunday,Cmt1,Monday,Cmt2,Tuesday,Cmt3,Wednesday,Cmt4,Thursday,Cmt5,Friday,Cmt6,Saturday,Cmt7,Submit,Location,Shift_Premium,AA_Types,SubmittedBy) VALUES?";

      console.log("sickLeave",sickleave,l,k,VacationHrs,AA_Type_Monday,Monday,AA_Type_Sunday,Weekends,WeekAA_Type)
if(VacationAccural===1)
{
  db.query("select * from edittimesheet", function (err, result) {
    if(result){
    //  console.log(WeekAA_Type+" can't enter hrs on Weekends")
    return  res.send({message:"We don't have enter vacation Hrs more than vacation Accural"});
          }
       
  
  });
}
  else if(Weekends===1&&(WeekAA_Type==="Sick Leave"||WeekAA_Type==="Vacation"))
 {
  db.query("select * from edittimesheet", function (err, result) {
    if(result){
    //  console.log(WeekAA_Type+" can't enter hrs on Weekends")
    return  res.send({message:"vacation/sick hrs can't be entered on Weekends"});
          }
       
  
  });
 }
else if(Sunday>8&&(AA_Type_Sunday!=="Regular Hours"&&AA_Type_Sunday!==""))
 {
  
  db.query("select * from edittimesheet", function (err, result) {
    if(result){
      //console.log("updates")
    return  res.send({message:"Regular hrs reported more than 8hrs can't access any other AA_Type"});
          }
       
  
  });
 }
 else if(Monday>8&&(AA_Type_Monday!="Regular Hours"&&AA_Type_Monday!==""))
 {
   console.log("Monday")
  db.query("select * from edittimesheet", function (err, result) {
    if(result){
      //console.log("updates")
    return  res.send({message:"Regular hrs reported more than 8hrs can't access any other AA_Type"});
          }
       
  
  });
 }
 else if(Tuesday>8&&(AA_Type_Tuesday!="Regular Hours"&&AA_Type_Tuesday!==""))
 {
  db.query("select * from edittimesheet", function (err, result) {
    if(result){
      //console.log("updates")
    return  res.send({message:"Regular hrs reported more than 8hrs can't access any other AA_Type"});
          }
       
  
  });
 }
 else if(Wednesday>8&&(AA_Type_Wednesday!="Regular Hours"&&AA_Type_Wednesday!==""))
 {
  db.query("select * from edittimesheet", function (err, result) {
    if(result){
      //console.log("updates")
    return  res.send({message:"Regular hrs reported more than 8hrs can't access any other AA_Type"});
          }
       
  
  });
 }
 else if(Thursday>8&&(AA_Type_Thursday!="Regular Hours"&&AA_Type_Thursday!==""))
 {
  db.query("select * from edittimesheet", function (err, result) {
    if(result){
      //console.log("updates")
    return  res.send({message:"Regular hrs reported more than 8hrs can't access any other AA_Type"});
          }
       
  
  });
 }
 else if(Friday>8&&(AA_Type_Friday!="Regular Hours"&&AA_Type_Friday!==""))
 {
  db.query("select * from edittimesheet", function (err, result) {
    if(result){
      //console.log("updates")
    return  res.send({message:"Regular hrs reported more than 8hrs can't access any other AA_Type"});
          }
       
  
  });
 }
 else if(Saturday>8&&(AA_Type_Saturday!="Regular Hours"&&AA_Type_Saturday!==""))
 {
  db.query("select * from edittimesheet", function (err, result) {
    if(result){
      //console.log("updates")
    return  res.send({message:"Regular hrs reported more than 8hrs can't access any other AA_Type"});
          }
       
  
  });
 }
 else if(hrsgreaterthan24===1)
 {
  db.query("select * from edittimesheet", function (err, result) {
    if(result){
      //console.log("updates")
    return  res.send({message:"You have entered more than 24 Hrs on a Day"});
          }
       
  
  });
 }
 else if(sickleave===1)
 {
  db.query("select * from edittimesheet", function (err, result) {
    if(result){
      //console.log("updates")
    return  res.send({message:"Allocated sickLeaves are used please select another AA_Type"});
          }
       
  
  });
 }
 else if(vacationLeave===1)
 {
  db.query("select * from edittimesheet", function (err, result) {
    if(result){
      //console.log("updates")
    return  res.send({message:"Allocated vacation leaves are used please select another AA_Type"});
          }
       
  
  });
 }
 else if(SickHrs===1&&AA_Type==="Sick Leave")
 {
  db.query("select * from edittimesheet", function (err, result) {
    if(result){
      //console.log("updates")
    return  res.send({message:"sick can be allowed either 4hrs or 8 hrs only"});
          }
       
  
  });
 } 
 else if(VacationHrs===1&&AA_Type==="Vacation")
 {
  db.query("select * from edittimesheet", function (err, result) {
    if(result){
      //console.log("updates")
    return  res.send({message:"Vacation can be allowed either 4hrs or 8 hrs only"});
          }
       
  
  });
 }
 
   else if(k>0)
   {
    console.log(CreateEntry,"CreateEntry")
     db.query(sql,[CreateEntry],
      (err,result)=>{
    
         if(result){
          // res.send({message:"Data Inserted Successfully"});
        
               
    if(l===1)
   {
     j=1;
     console.log("updated",j)
  return  res.send({message:"Timesheet already submitted for this period"});
    }
    else{
      console.log("inserted")
    return  res.send({message:"Timesheet saved for this period"});
    }
   }
  }
   );
       
       }

    else if(j===0&&l===1)
       {
        console.log("l",l,"j",j)
        db.query("select * from edittimesheet", function (err, result) {
          if(result){
            console.log("updates")
          return  res.send({message:"Timesheet already submitted for this period"});
                }
             
        
        });
       }
      
      })
    })
      })
    } )
    }) 
  }) 
    
       
       
  
       });
    

/*TimeSheet Client And Project*/
app.get("/ClientSelect", (req, res) => {
  userid=req.query.a
  //console.log("userid",userid);

db.query("select * from project WHERE UserId=? OR Resources like?",[userid,'%' + userid + '%'], function (err, result) {
  if (err) throw err;
 res.send(result)


});
});

/*Project Reports*/
app.get("/projectreports",(req,res)=>{
  db.query("SELECT * FROM project ",( err,result)=>{
  if(result){
  res.send(JSON.stringify(result));
  //console.log("project reports:"+JSON.stringify( result))
  }
  else{
  console.log(err);
  }
  })
  
  })

  /*TimeSheet Reports*/
  app.get("/TimeSheetReports",(req,res)=>{
    db.query("SELECT * FROM edittimesheet ",( err,result)=>{
    if(result){
    res.send(JSON.stringify(result));
  //  console.log("project reports:"+JSON.stringify( result))
    }
    else{
    console.log(err);
    }
    })
    
    })
    app.get("/User",(req,res)=>{
      db.query("SELECT * FROM user",( err,result)=>{
      if(result){
      res.send(JSON.stringify(result));
    //  console.log("project reports:"+JSON.stringify( result))
      }
      else{
      console.log(err);
      }
      })
      
      })
//WeeklyReports
app.get("/weeklyreports",(req,res)=>{
  const WDate=req.query.WDate;//request date
  //console.log("wdate:"+WDate)
  const ID=req.query.ID;//consultant login id
  const Role=req.query.Role;
  const UserIds=req.query.UserIds;//hr or manager login (ids dropdown)
 const Uid = UserIds.split("-")
console.log("UserIds:",UserIds)
var sql="SELECT edittimesheet.*,admin.fname FROM edittimesheet  JOIN admin ON edittimesheet.UserId = admin.uid UNION SELECT edittimesheet.*,user.fname FROM edittimesheet  JOIN user ON edittimesheet.UserId = user.uid  Where edittimesheet.UserId=? and edittimesheet.Date=?"
if(Role=="Manager" || Role=="HR"){
  if(UserIds=="All"){
  var sql= "SELECT edittimesheet.*,admin.fname FROM edittimesheet  JOIN admin ON edittimesheet.UserId = admin.uid UNION SELECT edittimesheet.*,user.fname FROM edittimesheet  JOIN user ON edittimesheet.UserId = user.uid  Where edittimesheet.Date=?"
   var values= [WDate]
  // console.log("all:"+values)
      } 
 else{
  var values=[Uid[0],WDate]
 // console.log("all one:"+values)
      }
    } 
else{
var values=[ID,WDate]
//console.log("one:"+values)

}

db.query(sql,values,( err,result)=>{  
  if(result.length>0){
 
     res.send(result);
   console.log("weekly reports :"+JSON.stringify( result))
  }
  else{
    res.send({msg:"No Records to display"});
   // console.log("else ")
  }
    })
})
 //AA_Types
 app.get("/aa_types",(req,res)=>{
  db.query("SELECT * FROM aa_types ",( err,result)=>{
  if(result){
  res.send(JSON.stringify(result));
//  console.log("project reports:"+JSON.stringify( result))
  }
  else{
  console.log(err);
  }
  })
  
  })
  //VacationEntitlementReports
  app.get("/Vacation",(req,res)=>{
    let   ReportUsers=req.query.ReportUsers;
 let   LoginId=req.query.id;
console.log(ReportUsers)
 let users=[];
 
  db.query("select user.uid,employee.user.EmployeeGroup,employee.user.fname,employee.user.Seniority,employee.vacation.EmployeeGroup,employee.vacation.NoOfLeaves,employee.vacation.MinSeniority,employee.vacation.MaxSeniority from employee.user INNER JOIN employee.vacation on employee.vacation.EmployeeGroup=employee.user.EmployeeGroup ",( err,result)=>{
    if(result){
    res.send(result);
   console.log("project reports:",result)
    }
    else{
    console.log(err);
    }
    })
    
    })
  //VacationAccural
  app.get("/VacationAccrual",(req,res)=>{
    let   ReportUsers=req.query.ReportUsers;
 let   LoginId=req.query.id;

 let users=[];
 let k=0;
 if(ReportUsers!=="")
 { let Arr=[];
   Arr=ReportUsers.split(",");
   for(let i=0;i<Arr.length;i++)
   {
     let Arr1=[]
     Arr1=Arr[i].split("-")
users[k]=Arr1[0];
k++;
   }
 }
 else{
   users[k]=LoginId
 }
 //console.log("Users",users)
  db.query("select user.uid,employee.user.EmployeeGroup,employee.user.fname,employee.user.Seniority,employee.vacation.EmployeeGroup,employee.vacation.NoOfLeaves,employee.vacation.MinSeniority,employee.vacation.MaxSeniority from employee.user INNER JOIN employee.vacation on employee.vacation.EmployeeGroup=employee.user.EmployeeGroup WHERE employee.user.uid in (?) ",[users],( err,result)=>{
    if(result){
    res.send(result);
   console.log("project reports:",result)
    }
    else{
    console.log(err);
    }
    })
    
    })
  //SickLeave
  app.get("/SickLeave",(req,res)=>{
 let   ReportUsers=req.query.ReportUsers;
 let   LoginId=req.query.id;
 let users=[];
 let k=0;
 if(ReportUsers!=="")
 { let Arr=[];
   Arr=ReportUsers.split(",");
   for(let i=0;i<Arr.length;i++)
   {
     let Arr1=[]
     Arr1=Arr[i].split("-")
users[k]=Arr1[0];
k++;
   }
 }
 else{
   users[k]=LoginId
 }
 console.log("Users",users)
 console.log("ReportUsers",ReportUsers,LoginId)
    db.query("select employee.user.uid,employee.user.EmployeeGroup,employee.user.fname,employee.sick.EmployeeGroup,employee.sick.NoOfLeaves from employee.user INNER JOIN employee.sick on employee.sick.EmployeeGroup=employee.user.EmployeeGroup WHERE employee.user.uid in (?) ",[users],( err,result)=>{
      if(result){
      res.send(result);
   //  console.log("project reports:",result)
      }
      else{
      console.log(err);
      }
      })
      
      })
//ManagerApproval
app.get("/ManagerApproval", (req, res) => {
  let id=req.query.a;
 // let WeekDate=req.query.myDate
console.log(id);
//console.log(WeekDate);
db.query("select * from user WHERE Reports_To=?",[id],function(err,result1)
{
  //console.log("hello",result1)
if(result1.length>0)
{
  let Arr=[];
  for(let i=0;i<result1.length;i++)
  {

Arr[i]=result1[i].uid;
  }

db.query("SELECT edittimesheet.*,user.fname,user.Reports_To FROM edittimesheet INNER JOIN user ON edittimesheet.UserId =user.uid WHERE edittimesheet.UserId in (?) AND edittimesheet.Submit=?",[Arr,"0"], function (err, result) {
 
  if(result){
    
    res.send(result);
   console.log("hellooooo",result)
        }
        else{
            res.send({message:"Already Project Exited"});
        }
      })
    }
});
});


//ApprovalTimeSheet
app.post("/ApprovalTimeSheet", (req, res) => {
  let taskList=req.body.taskList;
 let submit=req.body.Submit;
 let id=req.body.id;
 let count=0;
 let F=0;
console.log("taskLst",taskList)
for(let i=0;i<taskList.length;i++)
{
 if(taskList[i].Checked===true)
 {
F=1;
 }
  if(submit==="Reject"&&taskList[i].Checked===true&&(taskList[i].Remarks===""||taskList[i].Remarks===null))
  {
    count=1;
  }
if(count!==1&&taskList[i].Checked===true)
{
 
db.query("UPDATE edittimesheet SET Submit=?,Remarks=?,SubmittedBy=? WHERE UserId=? AND Date=?",[submit,taskList[i].Remarks,id,taskList[i].UserId,taskList[i].Date])
let mail1Reject=[];var uid1=[];array1=[],array2=[];

console.log(taskList[i].UserId+"  taskList[i].UserId"+taskList[i].Date+"tasklist[i].Date")
db.query("select edittimesheet.UserId,edittimesheet.Submit,edittimesheet.Date,user.uid,user.email from edittimesheet INNER JOIN user on edittimesheet.UserId=user.uid where Submit='Reject' AND UserId=? AND Date=?",[taskList[i].UserId,taskList[i].Date],function(err,resultReject){
console.log("result reject   "+JSON.stringify(resultReject));
//console.log(taskList[i].UserId+"  taskList[i].UserId"+taskList[i].Date+"tasklist[i].Date")
  for(let i=0;i<resultReject.length;i++)
  mail1Reject[i]=resultReject[i].email
  
  console.log(mail1Reject+"  mail all  Reject");
   

    var transporter = nodemailer.createTransport({
      pool:true,
      secure:true,

      host: "smtp.ethereal.email",
      service: 'gmail',
      auth: {
        user: 'anuradhareddygade9@gmail.com',
        pass: 'Adireddy123##reddy'
      },
      tls: {rejectUnauthorized: false}
    });
    
    console.log(mail1Reject+"  mail.toString()");
    
    var mailOptions = {
      from: 'anuradhareddygade9@gmail.com',

      to: mail1Reject,
      subject: "Timesheet Rejected",
      text: taskList[i].Date+"Timesheet Rejected"
    };


  
      console.log('running a task every Reject Thursday consultent');
     
      transporter.sendMail(mailOptions, function(error, info){
      
          console.log('Email sent: ' + info.response);
          transporter.close();
       // }
      });
    });

}  
}
if(F===0)
{
  
db.query("select * from edittimesheet", function (err, result) {

  if(result){
  
    return  res.send({message:"Please Select anyone of them"});
        }
      
      })
    
    }
else if(count===1)
{
  
db.query("select * from edittimesheet", function (err, result) {

  if(result){
  
    return  res.send({message:"Please fill the Remarks field"});
        }
      
      })
    
    }
    else
    {
    db.query("select * from edittimesheet", function (err, result) {
    
      if(result.length>0){
    
        res.send(result);
       
            }
            else{
                res.send({message:"Already Project Exited"});
            }
          })
        
        }
});

//SuperAdminApproval
app.get("/SuperAdminApproval", (req, res) => {
  let id=req.query.a;
 let SuperAdmin=req.query.SuperAdmin;
console.log("SuperAdmin",SuperAdmin,id)
db.query("SELECT edittimesheet.*,user.fname,user.Reports_To FROM edittimesheet INNER JOIN user ON edittimesheet.UserId =user.uid WHERE edittimesheet.Submit=?",[SuperAdmin], function (err, result) {
 
  if(result.length>0){
    
    res.send(result);
   // console.log(result)
   
        }
        else{
            res.send({message:"Already Project Exited"});
        }
      })
    })
//User DashBoard
 /*TimeSheet Reports*/
 app.get("/UserDashBoard",(req,res)=>{
  let id=req.query.a;

  console.log("id",id)
  let Arr=[ 0, 1, 'Reject' ]
 db.query("SELECT * FROM edittimesheet WHERE UserId=? AND Submit=? ",[id,"Reject"],( err,result)=>{
 if(result){
 res.send(JSON.stringify(result));
 console.log("result",result)
 }
 else{
 console.log(err);
 }
 })
 
 })
 app.get("/UserDashBoardSubmit",(req,res)=>{
   let id=req.query.a;
 
   console.log("id",id)
   let Arr=[ 0, 1, 'Reject' ]
  db.query("SELECT * FROM edittimesheet WHERE UserId=? AND Submit=? ",[id,"1"],( err,result)=>{
  if(result){
  res.send(JSON.stringify(result));
  console.log("result",result)
  }
  else{
  console.log(err);
  }
  })
  
  })
  app.get("/UserDashBoardApproval",(req,res)=>{
   let id=req.query.a;
 
   console.log("id",id)
   let Arr=[ 0, 1, 'Reject' ]
  db.query("SELECT * FROM edittimesheet WHERE UserId=? AND Submit=? ",[id,"0"],( err,result)=>{
  if(result){
  res.send(JSON.stringify(result));
  console.log("result",result)
  }
  else{
  console.log(err);
  }
  })
  
  })
  let mail=[];var uid=[];array1=[],array2=[];
    var CurrentDate = new Date();
          var CurrentWeekDay = CurrentDate.getDay();

          var CurrentWeekDate = new Date(
          new Date(CurrentDate).setDate(CurrentDate.getDate() - CurrentWeekDay)
          );

          var CurrentWeekDate=CurrentWeekDate.toDateString();
          CurrentWeekDate=CurrentWeekDate.substring(4,15);
            console.log(CurrentWeekDate+"CurrentWeekDate");
      db.query("select edittimesheet.UserId,edittimesheet.Submit,edittimesheet.Date,user.uid,user.email from edittimesheet INNER JOIN employee.user on edittimesheet.UserId=user.uid where Submit='1'and Date=?",[CurrentWeekDate],function(err,result){
        console.log(JSON.stringify(result)+"result")
       if(result.length>0)
       {
        for(let i=0;i<result.length;i++)
        mail[i]=result[i].email
        
        console.log(mail+"  mail all 1329");
         

          var transporter = nodemailer.createTransport({
            pool:true,
            secure:true,
    
            host: "smtp.ethereal.email",
            service: 'gmail',
            auth: {
              user: 'anuradhareddygade9@gmail.com',
              pass: 'Adireddy123##reddy'
            },
            tls: {rejectUnauthorized: false}
          });
          
          console.log(mail+"  mail.toString()");
          
          var mailOptions = {
            from: 'anuradhareddygade9@gmail.com',

            to: mail,
            subject: "Timesheet submit pending",
            text: CurrentWeekDate+"Timesheet submit pending"
          };


          cron.schedule('35 17 * * Tuesday', () => {//minutes,hours,month,year,day 24hrs time format
            console.log('running a task every Friday consultent');
           
            transporter.sendMail(mailOptions, function(error, info){
            
                console.log('Email sent: ' + info.response);
                transporter.close();
             // }
            });
          });
        }  });
        
     

      













        let Reports_id=[],userId=[];


        db.query("select edittimesheet.UserId,edittimesheet.Submit,edittimesheet.Date,user.uid,user.Email,user.Reports_To from edittimesheet INNER JOIN user on edittimesheet.UserId=user.uid where Submit='0'AND Date=?",[CurrentWeekDate],function(err,result){
          db.query("Select distinct user.uid as Reports_To,user.email from user where user.Role='Manager'", function (err, result1) {
          if(result.length>0)
          {
            console.log(JSON.stringify(result)+"result") 
            let Maillist=[];
            let k=0;

            for(var i=0;i<result.length;i++){
              Reports_id[i]=result[i].Reports_To;
              userId[i]=result[i].uid;
            }

            console.log(Reports_id+"  Reports_id");
            var count=0,count1=0;
            for(var i=0;i<result1.length;i++){
              console.log("Reports_id[i]"+Reports_id[i])
              console.log("result1[i].Reports_To"+result1[i].Reports_To)
              if((Reports_id).includes(result1[i].Reports_To)){

                Maillist[i]=result1[i].email;
                console.log(Maillist[i]+"Maillist[i]");
                count++
                
              }else{
                console.log("else block");
                count1++
              }
            }

            const Maillist1 = Maillist.filter((a) => a);

            console.log(count+"count if")
            console.log(count1+"count else")
            console.log(Maillist1.toString(),"Maillist1")
              var transporter = nodemailer.createTransport({
                pool:true,
                secure:true,
         
             host: "smtp.ethereal.email",
                service: 'gmail',
                auth: {
                  user: 'anuradhareddygade9@gmail.com',
                  pass: 'Adireddy123##reddy'
             },           tls: {rejectUnauthorized: false}
              });
              if(Maillist.length>0){
                //console.log(mail[0].toString()+"  mail.toString()");
                // console.log(result1[j].Email)
                  var mailOptions = {           
                  from: 'anuradhareddygade9@gmail.com',
                
                to: Maillist1.toString(),
                  subject: "Timesheet Approval pending",
                  text: CurrentWeekDate+"Timesheet Approval pending"
                };
              }
         
         
             cron.schedule('35 17 * * Tuesday', () => {//minutes,hours,month,year,day 24hrs time format
                console.log('running a task every Friday manager');
          
                transporter.sendMail(mailOptions, function(error, info){
                
                    console.log('Email sent: ' + info.response);
                    transporter.close();
                  //}
                });
              });
            }
        
            });
         });



app.listen("3001", () => {

    console.log("Server started on port 3000");
    
    });
    