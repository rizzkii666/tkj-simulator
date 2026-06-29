const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./netlearn.db");

db.serialize(() => {
  // Create users table with level, xp, and avatar columns
  db.run(`
    CREATE TABLE IF NOT EXISTS users(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT,
      level INTEGER DEFAULT 1,
      xp INTEGER DEFAULT 0,
      avatar TEXT
    )
  `);

  // Try altering in case table was created with older schema
  db.run("ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1", () => {});
  db.run("ALTER TABLE users ADD COLUMN xp INTEGER DEFAULT 0", () => {});
  db.run("ALTER TABLE users ADD COLUMN avatar TEXT", () => {});

  // Create activities table for statistics
  db.run(`
    CREATE TABLE IF NOT EXISTS activities(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_email TEXT,
      activity_name TEXT,
      type TEXT,
      xp_gained INTEGER,
      timestamp TEXT
    )
  `);

  // Seed default demo data if empty
  db.get("SELECT count(*) as count FROM users", (err, row) => {
    if (row && row.count === 0) {
      db.run("INSERT INTO users (name, email, password, role, level, xp, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)",
        ["Siswa Demo TKJ", "demo@tkj.sch.id", "siswa123", "student", 3, 350, "👨‍💻"]);
      db.run("INSERT INTO users (name, email, password, role, level, xp, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)",
        ["Pak Budi (Guru)", "guru@tkj.sch.id", "guru123", "teacher", 1, 0, "👨‍🏫"]);
        
      // Seed initial activities for stats demo
      const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
      db.run("INSERT INTO activities (user_email, activity_name, type, xp_gained, timestamp) VALUES (?, ?, ?, ?, ?)",
        ["demo@tkj.sch.id", "Menyelesaikan Crimping Kabel T568B", "Crimping", 100, now]);
      db.run("INSERT INTO activities (user_email, activity_name, type, xp_gained, timestamp) VALUES (?, ?, ?, ?, ?)",
        ["demo@tkj.sch.id", "Uji Ping PC-1 ke PC-2 Sukses", "Simulation", 20, now]);
    }
  });
});

app.get("/", (req, res) => {
  res.send("NetLearn SQLite API Running");
});

// Register
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  const userRole = "student"; // Selalu paksa peran sebagai 'student' untuk pendaftaran baru
  const defaultAvatar = "🎒";

  db.run(
    `INSERT INTO users (name, email, password, role, level, xp, avatar) VALUES (?, ?, ?, ?, 1, 0, ?)`,
    [name, email, password, userRole, defaultAvatar],
    function(err) {
      if (err) {
        return res.status(400).json({
          success: false,
          message: "Email sudah digunakan atau data tidak lengkap"
        });
      }
      res.json({
        success: true,
        message: "Registrasi berhasil"
      });
    }
  );
});

// Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err || !user) {
      return res.status(400).json({ success: false, message: "Email tidak terdaftar" });
    }
    if (user.password !== password) {
      return res.status(400).json({ success: false, message: "Password salah" });
    }
    res.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        level: user.level,
        xp: user.xp,
        avatar: user.avatar || (user.role === "teacher" ? "👨‍🏫" : "🎒")
      }
    });
  });
});

// Update Progress (XP, Level, Logs Activity)
app.post("/update-progress", (req, res) => {
  const { email, xp, level, activity_name, type, xp_gained } = req.body;

  db.run("UPDATE users SET xp = ?, level = ? WHERE email = ?", [xp, level, email], function(err) {
    if (err) {
      return res.status(400).json({ success: false, message: "Gagal memperbarui kemajuan" });
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    db.run(
      "INSERT INTO activities (user_email, activity_name, type, xp_gained, timestamp) VALUES (?, ?, ?, ?, ?)",
      [email, activity_name, type, xp_gained, now],
      function(err2) {
        if (err2) {
          return res.status(400).json({ success: false, message: "Gagal mencatat aktivitas belajar" });
        }
        res.json({ success: true, message: "Aktivitas dan progress berhasil diperbarui" });
      }
    );
  });
});

// Get Students List (Leaderboard / Gradebook)
app.get("/students", (req, res) => {
  db.all(
    "SELECT name, email, level, xp, role, avatar FROM users WHERE role = 'student' ORDER BY (level * 2000 + xp) DESC",
    [],
    (err, rows) => {
      if (err) {
        return res.status(400).json({ success: false, message: "Gagal memuat daftar siswa" });
      }
      res.json({ success: true, students: rows });
    }
  );
});

// Reset Student Progress
app.post("/reset-student", (req, res) => {
  const { email } = req.body;

  db.run("UPDATE users SET level = 1, xp = 0 WHERE email = ?", [email], (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: "Gagal melakukan reset" });
    }
    db.run("DELETE FROM activities WHERE user_email = ?", [email], (err2) => {
      res.json({ success: true, message: "Progres belajar siswa berhasil direset" });
    });
  });
});

// Get Student Activity Stats
app.get("/student-stats", (req, res) => {
  const { email } = req.query;

  db.all(
    "SELECT * FROM activities WHERE user_email = ? ORDER BY id DESC",
    [email],
    (err, rows) => {
      if (err) {
        return res.status(400).json({ success: false, message: "Gagal memuat riwayat aktivitas" });
      }
      res.json({ success: true, activities: rows });
    }
  );
});

// Update Profile
app.post("/update-profile", (req, res) => {
  const { email, name, password, avatar } = req.body;

  if (password) {
    db.run(
      "UPDATE users SET name = ?, password = ?, avatar = ? WHERE email = ?",
      [name, password, avatar, email],
      function(err) {
        if (err) {
          return res.status(400).json({ success: false, message: "Gagal memperbarui profil" });
        }
        res.json({ success: true, message: "Profil dan password berhasil diperbarui" });
      }
    );
  } else {
    db.run(
      "UPDATE users SET name = ?, avatar = ? WHERE email = ?",
      [name, avatar, email],
      function(err) {
        if (err) {
          return res.status(400).json({ success: false, message: "Gagal memperbarui profil" });
        }
        res.json({ success: true, message: "Profil berhasil diperbarui" });
      }
    );
  }
});

app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on port 5000 (accessible on LAN) with SQLite storage enabled");
});