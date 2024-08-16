const express = require("express");
const https = require("https");
const fs = require("fs");
const cors = require('cors'); 


const app = express();
const port = 11434;

// CORS 配置
const corsOptions = {
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500','http://127.0.0.1:3000', 'http://localhost:3000'], // 允许的源
  methods: ['GET', 'POST', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization'], 
  credentials: true, 
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions)); 
app.use(express.static('public')); 
app.use(express.json()); 

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.get("/abc", (req, res) => {
  res.send("Hello, World!");
});

app.post("/v1/chat/completions", async (req, res) => {
  try {
    console.log("Received request body:", req.body);
    const response = await fetch("http://127.0.0.1:11434/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: req.body.model,
        messages: req.body.messages,
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    for await (const chunk of response.body) {
      res.write(chunk);
    }
    res.end();
  } catch (error) {
    console.error("Detailed error:", error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

let options;
try {
  options = {
    key: fs.readFileSync("./ssl/localhost.key"),
    cert: fs.readFileSync("./ssl/localhost.crt"),
  };
} catch (error) {
  console.error("Error reading SSL certificate or key files:", error);
  process.exit(1); 
}

const server = https.createServer(options, app);

server.listen(port, () => {
  console.log(`App listening on https://localhost:${port}`);
});
