const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { google } = require("googleapis");

const router = express.Router();

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Apenas arquivos de imagem são permitidos."), false);
    }
  },
});

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
  scopes: ["https://www.googleapis.com/auth/drive.file"],
});

const FOLDER_ID = "1-1SdaNfV_rYAyMbgbPbXxg-MRFcH8yH4";

router.post("/", upload.array("arquivos", 100), async (req, res) => {
  const drive = google.drive({ version: "v3", auth: await auth.getClient() });

  const nomeDaPasta = req.body.pasta;
  if (!nomeDaPasta) {
    console.log("Chassi não informado.");
    return res
      .status(400)
      .json({ message: "O nome da pasta (chassi) é obrigatório." });
  }

  try {
    console.log(`Criando pasta: ${nomeDaPasta}`);

    const pastaCriada = await drive.files.create({
      resource: {
        name: nomeDaPasta,
        mimeType: "application/vnd.google-apps.folder",
        parents: [FOLDER_ID],
      },
      fields: "id",
    });

    const pastaId = pastaCriada.data.id;
    console.log(`Pasta criada com ID: ${pastaId}`);

    // Drive API: Enviar arquivos
    await Promise.all(
      req.files.map(async (file) => {
        try {
          console.log(`Enviando: ${file.originalname}`);
          const fileMetadata = {
            name: file.originalname,
            parents: [pastaId],
          };
          const media = {
            mimeType: file.mimetype,
            body: fs.createReadStream(file.path),
          };

          await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: "id",
          });

          fs.unlinkSync(file.path);
          console.log(`Enviado e removido local: ${file.originalname}`);
        } catch (err) {
          console.error(`Erro ao enviar ${file.originalname}:`, err);
          throw new Error(`Falha no envio de ${file.originalname}`);
        }
      })
    );

    console.log("Enviando resposta ao frontend...");
    res.status(200).json({ message: "Foto enviada com sucesso!" });
  } catch (error) {
    console.error("Erro geral no upload:", error);
    res.status(500).json({ message: "Erro no upload: " + error.message });
  }
});

module.exports = router;
