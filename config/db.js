const mysql = require("mysql");


const db = mysql.createPool({

    host: "us-cdbr-east-04.cleardb.com",
    user: "b15e68aaaa3ba5",
    password: "8df22ef2",
    database: "heroku_0a6414aa002a7cc",
    connectionLimit: 7,
    dateStrings: true,
    multipleStatements: true


 

    });
    
module.exports = db;


