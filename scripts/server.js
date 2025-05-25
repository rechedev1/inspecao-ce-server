const express = require("express");
const path = require("path");
const app = express();

const uploadRouter = require("../routes/upload");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir HTML na raiz
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

// Servir JS e CSS
app.get("/scripts/index.js", (req, res) => {
  res.sendFile(path.join(__dirname, "index.js"));
});
app.get("/css/styles.css", (req, res) => {
  res.sendFile(path.join(__dirname, "../css/styles.css"));
});

// Rota
app.use("/upload", uploadRouter);

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
