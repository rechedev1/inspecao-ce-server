const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { google } = require("googleapis");

const router = express.Router();
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }, // máximo 10MB por imagem
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Apenas arquivos de imagem são permitidos."), false);
    }
  },
});

const auth = new google.auth.GoogleAuth({
  keyFile: "credentials.json",
  scopes: ["https://www.googleapis.com/auth/drive.file"],
});

const FOLDER_ID = "1-1SdaNfV_rYAyMbgbPbXxg-MRFcH8yH4";

router.post("/", upload.array("arquivos", 100), async (req, res) => {
  const drive = google.drive({ version: "v3", auth: await auth.getClient() });

  const nomeDaPasta = req.body.pasta;
  if (!nomeDaPasta) {
    return res
      .status(400)
      .json({ message: "O nome da pasta (chassi) é obrigatório." });
  }

  try {
    const pastaCriada = await drive.files.create({
      resource: {
        name: nomeDaPasta,
        mimeType: "application/vnd.google-apps.folder",
        parents: [FOLDER_ID], // cria dentro da pasta raiz
      },
      fields: "id",
    });

    const pastaId = pastaCriada.data.id;

    // Faz upload de todas as imagens para essa pasta
    for (const file of req.files) {
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

      fs.unlinkSync(file.path); // apaga arquivo local
    }

    return res.json({ message: "Upload concluído com sucesso." });
  } catch (error) {
    console.error("Erro ao enviar arquivos:", error);
    return res
      .status(500)
      .json({ message: "Erro no upload: " + error.message });
  }
});

module.exports = router;
