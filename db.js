const mysql = require('mysql2');

const db = mysql.createConnection({
    host: "complaint-db.c672cockm4to.us-east-1.rds.amazonaws.com",
    user: "admin",
    password: "Complaint"
,
    database: "complaint_system"
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("Connected to RDS MySQL!");
    }
});

module.exports = db;
