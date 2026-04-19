import express from "express";
import fs from "fs";
import jwt from "jsonwebtoken";
import { WebSocketServer } from "ws";

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "secret123";
const PASSWORD = process.env.ADMIN_PASSWORD || "admin";

app.post("/api/login",(req,res)=>{
  if(req.body.password !== PASSWORD) return res.sendStatus(401);
  const token = jwt.sign({role:"admin"}, JWT_SECRET, {expiresIn:"2h"});
  res.json({token});
});

function auth(req,res,next){
  const header = req.headers.authorization;
  if(!header) return res.sendStatus(401);
  const token = header.split(" ")[1];
  try{
    jwt.verify(token, JWT_SECRET);
    next();
  }catch{
    res.sendStatus(403);
  }
}

app.get("/api/config",(req,res)=>{
  const data = fs.readFileSync("./config.json");
  res.json(JSON.parse(data));
});

app.post("/api/config", auth,(req,res)=>{
  const clean = req.body.phrases.map(p=>p.trim()).filter(Boolean);
  fs.writeFileSync("./config.json", JSON.stringify({phrases:clean}, null, 2));

  wss.clients.forEach(c=>c.send(JSON.stringify({type:"update"})));

  res.json({ok:true});
});

const server = app.listen(3000, ()=>console.log("Server running"));

const wss = new WebSocketServer({ server });
