import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import pool from "./db.js";
import fs from "fs";

dotenv.config();

const app = express();
app.use(express.json());

const CONFIG_PATH = "./config.json";


// ===============================
// AUTH MIDDLEWARE
// ===============================
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.sendStatus(401);

  const token = header.split(" ")[1];

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch {
    res.sendStatus(403);
  }
}


// ===============================
// LOGIN ADMIN
// ===============================
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Wrong password" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.json({ token });

  } catch (err) {
    console.error("Login error:", err);
    res.sendStatus(500);
  }
});


// ===============================
// CONFIG (AJOUT)
// ===============================

// GET config
app.get("/api/config", auth, (req, res) => {
  try {
    if (!fs.existsSync(CONFIG_PATH)) {
      return res.json({ phrases: [] });
    }

    const data = fs.readFileSync(CONFIG_PATH, "utf-8");
    res.json(JSON.parse(data));

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lecture config" });
  }
});

// SAVE config
app.post("/api/config", auth, (req, res) => {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur sauvegarde" });
  }
});


// ===============================
// SERVER
// ===============================
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
