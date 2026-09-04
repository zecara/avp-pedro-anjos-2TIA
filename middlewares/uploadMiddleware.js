import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadsDir),
  filename: (_req, file, callback) => {
    const extensao = path.extname(file.originalname).toLowerCase();
    callback(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extensao}`);
  },
});

const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];

const fileFilter = (_req, file, callback) => {
  if (!tiposPermitidos.includes(file.mimetype)) {
    return callback(new Error("Tipo de arquivo inválido. Use apenas JPG, JPEG, PNG ou WEBP."));
  }

  callback(null, true);
};

export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter,
});