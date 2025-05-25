const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 8080;

const uploadRouter = require("../routes/upload");

app.use((req, res, next) => {
  const accessToken = req.query.access;
  const tokenCorreto = process.env.ACCESS_TOKEN || "jatinsp1";

  const isStatic =
    req.path.startsWith("/scripts") || req.path.startsWith("/css");
  if (isStatic) return next();

  if (accessToken !== tokenCorreto) {
    return res.status(403).send("Acesso negado. Token inválido.");
  }

  next();
});

// Body parsers
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

// Rota de upload
app.use("/upload", uploadRouter);

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
