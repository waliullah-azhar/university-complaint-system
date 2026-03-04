const bcrypt = require("bcrypt");
const db = require("./db"); // your database connection

// ⚠️ CHANGE THESE BEFORE RUNNING
const adminName = "Hammad";
const adminEmail = "hammad@example.com";
const adminPassword = "hammad123"; // plain password, will be hashed

async function createAdmin() {
    try {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";

        db.query(sql, [adminName, adminEmail, hashedPassword, "admin"], (err, result) => {
            if (err) {
                if (err.code === "ER_DUP_ENTRY") {
                    console.log("Admin user already exists.");
                } else {
                    console.error("Error creating admin:", err);
                }
            } else {
                console.log("Admin user created successfully!");
            }
            db.end(); // close DB connection
        });
    } catch (error) {
        console.error("Error hashing password:", error);
    }
}

createAdmin();
