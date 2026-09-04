import { Router } from "express";
import { upload } from "../middleware/uploadMiddleware.js";
import { autenticarToken } from "../middleware/authMiddleware.js";

const router = Router();

router.use(autenticarToken);

/**
 * @openapi
 * /upload:
 *   post:
 *     summary: Upload de imagem
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               imagem:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Upload realizado com sucesso
 *       400:
 *         description: Arquivo inválido ou ausente
 *       401:
 *         description: Token inválido ou ausente
 */
router.post("/", upload.single("imagem"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ erro: "Nenhum arquivo enviado." });
  }

  return res.status(200).json({
    mensagem: "Upload realizado com sucesso.",
    arquivo: {
      nome: req.file.filename,
      tamanho: req.file.size,
      tipo: req.file.mimetype,
      caminho: `/uploads/${req.file.filename}`,
    },
  });
});

export default router;
