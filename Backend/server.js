const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./netlearn.db");

db.serialize(() => {

  db.run(`
    CREATE TABLE IF NOT EXISTS users(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT
    )
  `);

});

app.get("/", (req, res) => {
  res.send("NetLearn API Running");
});

app.post("/register", (req, res) => {

  const { name, email, password } = req.body;

  db.run(
    `
    INSERT INTO users
    (name,email,password,role)
    VALUES(?,?,?,?)
    `,
    [name, email, password, "student"],

    function(err) {

      if(err){

        return res.status(400).json({
          success:false,
          message:"Email sudah digunakan"
        });

      }

      res.json({
        success:true,
        message:"Register berhasil"
      });

    }
  );

});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});