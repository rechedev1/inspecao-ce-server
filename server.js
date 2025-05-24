const express = require("express");
const cors = require("cors");
const uploadRoute = require("./routes/upload");

const app = express();

app.use(cors());
app.use("/upload", uploadRoute);

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
