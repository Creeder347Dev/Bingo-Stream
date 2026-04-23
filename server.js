import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import pool from "./db.js";
import fs from "fs";
import helmet from "helmet";

dotenv.config();

// ===============================
// 🔒 ANTI DOUBLE LOAD (IMPORTANT)
// ===============================
if (global.__SERVER_RUNNING__) {
  console.log("⛔ Serveur déjà initialisé → ignoré");
} else {
  global.__SERVER_RUNNING__ = true;

  console.log("SERVER FILE LOADED");
  console.log("LOADED FROM:", import.meta.url);

  const app = express();
  const PORT = process.env.PORT || 3000;

  // ===============================
  // SECURITY
  // ===============================
  app.use(helmet());
  app.use(express.json({ limit: "100kb" }));
  app.set("trust proxy", 1);

  // ===============================
  // ANTI BRUTE FORCE
  // ===============================
  const failedAttempts = new Map();
  const MAX_ATTEMPTS = 10;

  function getIP(req) {
    let ip = (req.headers["x-forwarded-for"] || req.ip || "")
      .split(",")[0]
      .trim();

    if (ip === "::1") ip = "127.0.0.1";
    if (ip.startsWith("::ffff:")) ip = ip.replace("::ffff:", "");

    return ip;
  }

  function getBanDuration(level) {
    const durations = [
      15 * 60 * 1000,
      60 * 60 * 1000,
      24 * 60 * 60 * 1000,
      7 * 24 * 60 * 60 * 1000
    ];

    return durations[level] || durations[durations.length - 1];
  }

  function checkBan(req, res, next) {
    const ip = getIP(req);
    const data = failedAttempts.get(ip);

    if (data && data.banUntil && Date.now() < data.banUntil) {
      return res.status(429).json({
        error: "Too many attempts",
        retryIn: Math.ceil((data.banUntil - Date.now()) / 1000)
      });
    }

    next();
  }

  function registerFail(ip) {
    let data = failedAttempts.get(ip) || {
      count: 0,
      level: 0
    };

    data.count++;

    if (data.count >= MAX_ATTEMPTS) {
      const duration = getBanDuration(data.level);
      data.banUntil = Date.now() + duration;
      data.count = 0;
      data.level++;
    }

    failedAttempts.set(ip, data);
  }

  function registerSuccess(ip) {
    failedAttempts.delete(ip);
  }

  // ===============================
  // AUTH
  // ===============================
  function auth(req, res, next) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.sendStatus(401);
    }

    const token = header.split(" ")[1];

    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      res.sendStatus(403);
    }
  }

  // ===============================
  // LOGIN
  // ===============================
  app.post("/api/login", checkBan, async (req, res) => {
    try {
      const ip = getIP(req);
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Invalid request" });
      }

      const result = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
      );

      const user = result.rows[0];

      if (!user) {
        registerFail(ip);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        registerFail(ip);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      registerSuccess(ip);

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
  // CONFIG
  // ===============================
  const CONFIG_PATH = "./config.json";

  app.get("/api/config", (req, res) => {
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

  app.post("/api/config", auth, (req, res) => {
    try {
      const data = req.body;

      if (!data || !Array.isArray(data.phrases)) {
        return res.status(400).json({ error: "Invalid config" });
      }

      fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2));
      res.json({ success: true });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur sauvegarde" });
    }
  });

  // ===============================
  // DB WAIT + START SERVER
  // ===============================
  let started = false;

  async function waitForDB(retries = 10, delay = 2000) {
    for (let i = 0; i < retries; i++) {
      try {
        await pool.query("SELECT 1");
        console.log("✅ PostgreSQL connecté");
        return;
      } catch {
        console.log("⏳ DB indisponible, retry...");
        await new Promise(r => setTimeout(r, delay));
      }
    }

    throw new Error("DB unreachable");
  }

  async function startServer() {
    if (started) return;
    started = true;

    try {
      await waitForDB();

      const server = app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
      });

      server.on("error", (err) => {
        if (err.code === "EADDRINUSE") {
          console.error("❌ Port déjà utilisé");
        } else {
          console.error(err);
        }
      });

    } catch (err) {
      console.error("❌ Impossible de démarrer:", err);
    }
  }

  // ===============================
  // START
  // ===============================
  startServer();
}
