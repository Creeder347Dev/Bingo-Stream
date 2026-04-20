import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import pool from "./db.js";

dotenv.config();

const app = express();
app.use(express.json());


// ===============================
// LOGIN ADMIN (NOUVEAU)
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
// SERVER
// ===============================
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
