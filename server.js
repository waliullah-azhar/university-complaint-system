const express = require("express");
const bcrypt = require("bcrypt");
const session = require("express-session");
const db = require("./db");
const app = express();
const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = require("./config/s3");
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");

app.use(
  session({
    secret: "secretkey123",
    resave: false,
    saveUninitialized: false,
  })
);

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: "complaint-attachment-123",
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + "-" + file.originalname);
        }
    })
});

// ================= ROUTES =================

// Home
app.get("/", (req, res) => {
  res.redirect("/login");
});

// Login Page
app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

// Register Page
app.get("/register", (req, res) => {
  res.render("register", { error: null });
});

// Register User
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.render("register", {
      error: "All fields are required.",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (name,email,password) VALUES (?,?,?)",
    [name, email, hashedPassword],
    (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.render("register", {
            error: "Email already exists.",
          });
        }

        return res.render("register", {
          error: "Something went wrong.",
        });
      }

      res.redirect("/login");
    }
  );
});

// Login User
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], async (err, results) => {
        if (err) return res.send("Database error");

        if (results.length === 0)
            return res.send("Wrong credentials");

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match)
            return res.send("Wrong credentials");

        // ✅ Save session info
        req.session.userId = user.id;
        req.session.name = user.name;
        req.session.role = user.role || 'user';
        req.session.email = user.email;

        // ✅ Redirect based on role
        if (user.role === "admin") {
            res.redirect("/admin/dashboard");
        } else {
            res.redirect("/dashboard");  // regular user dashboard
        }
    });
});

// Dashboard

app.get("/dashboard", (req, res) => {

    if (!req.session.userId)
        return res.redirect("/login");

    const userId = req.session.userId;

    const sql = "SELECT * FROM complaints WHERE user_id=?";

    db.query(sql, [userId], (err, complaints) => {

        if (err)
            return res.send("Error loading dashboard");

        res.render("dashboard", {
            user: {
                name: req.session.name,
                role: req.session.role
            },
            complaints: complaints
        });
    });
});




// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});


app.get("/complaint/new", async (req, res) => {
    res.render("new_complaint");
});

app.post("/complaint/new", upload.single("file"), async (req, res) => {
    try {
        const { title, description, category, priority } = req.body;
        const userId = req.session.userId;

        const fileUrl = req.file ? req.file.location : null;

        const sql = `
            INSERT INTO complaints
            (user_id, title, description, category, file_url, priority)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(sql, [userId, title, description, category, fileUrl, priority], async (err, result) => {
            if (err) {
                console.log("DB Error:", err);
                return res.send("Error submitting complaint. Check server logs.");
            }
            res.redirect("/dashboard");
        });

    } catch (error) {
        console.log("Server Error:", error);
        res.send("Something went wrong. Check server logs.");
    }
});




// Show edit form

app.get("/complaint/edit/:id", (req, res) => {
    const complaintId = req.params.id;
    const userId = req.session.userId;

    const sql = "SELECT * FROM complaints WHERE id=? AND user_id=?";
    db.query(sql, [complaintId, userId], (err, results) => {
        if (err) return res.send("DB error");
        if (results.length === 0) return res.send("Complaint not found");

        res.render("edit_complaint", { complaint: results[0] });
    });
});


// Handle edit submission

// POST updated complaint
app.post("/complaint/edit/:id", upload.single("file"), async (req, res) => {
    const complaintId = req.params.id;
    const userId = req.session.userId;
    const { title, description, category, priority } = req.body;
    const fileUrl = req.file ? req.file.location : null;

    let sql, params;

    if (fileUrl) {
        sql = `UPDATE complaints SET title=?, description=?, category=?, priority=?, file_url=? WHERE id=? AND user_id=?`;
        params = [title, description, category, priority, fileUrl, complaintId, userId];
    } else {
        sql = `UPDATE complaints SET title=?, description=?, category=?, priority=? WHERE id=? AND user_id=?`;
        params = [title, description, category, priority, complaintId, userId];
    }

    db.query(sql, params, (err, result) => {
        if (err) {
            console.log("DB Error:", err);
            return res.send("Error updating complaint");
        }
        res.redirect("/dashboard");
    });
});



function isAdmin(req, res, next) {
    if (req.session.role === "admin") return next();
    res.send("Access Denied");
}



app.get("/admin/dashboard", isAdmin, (req, res) => {
    const sql = `
        SELECT complaints.*, users.name AS user_name, users.email AS user_email
        FROM complaints
        JOIN users ON complaints.user_id = users.id
        ORDER BY complaints.id DESC
    `;

    db.query(sql, (err, results) => {
        if (err){
	console.log("Admin DB Error:",err);
	 return res.send("Error loading admin dashboard")};

        res.render("admin_dashboard", { complaints: results });
    });
});







app.post("/admin/update/:id", isAdmin, (req, res) => {
    const complaintId = req.params.id;
    const { status, admin_response } = req.body;

    const sql = `
        UPDATE complaints
        SET status = ?, admin_response = ?
        WHERE id = ?
    `;

    db.query(sql, [status, admin_response, complaintId], (err) => {
        if (err) {
            console.log("❌ UPDATE ERROR:", err); // show real error
            return res.send("Error updating complaint");
        }

        res.redirect("/admin/dashboard");
    });
});


// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
