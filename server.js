import express from "express";
import fs from "fs";
import jwt from "jsonwebtoken";
import { WebSocketServer } from "ws";

const app = express();
app.use(express.json());

const PASSWORD = process.env.ADMIN_PASSWORD || "admin";
const JWT_SECRET = "secret";

app.post("/api/login",(req,res)=>{
  if(req.body.password !== PASSWORD) return res.sendStatus(401);
  const token = jwt.sign({}, JWT_SECRET);
  res.json({token});
});

function auth(req,res,next){
  const token = req.headers.authorization?.split(" ")[1];
  try{ jwt.verify(token, JWT_SECRET); next(); }
  catch{ res.sendStatus(403); }
}

app.get("/api/config",(req,res)=>{
  const data = fs.readFileSync("./config.json");
  res.json(JSON.parse(data));
});

app.post("/api/config",auth,(req,res)=>{
  fs.writeFileSync("./config.json", JSON.stringify(req.body, null, 2));
  wss.clients.forEach(c=>c.send(JSON.stringify({type:"update"})));
  res.json({ok:true});
});

app.post("/api/reset",auth,(req,res)=>{
  wss.clients.forEach(c=>c.send(JSON.stringify({type:"reset"})));
  res.json({ok:true});
});

const server = app.listen(3000);
const wss = new WebSocketServer({ server });
