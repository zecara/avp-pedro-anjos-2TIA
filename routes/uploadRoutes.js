import { Router } from "express";
import { open, unlink } from "node:fs/promises";
import { upload } from "../middlewares/uploadMiddleware.js";
import { autenticarToken } from "../middlewares/authMiddleware.js";
import { detectarTipoImagem } from "../lib/imageTypes.js";

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
router.post("/", upload.single("imagem"), async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ erro: "Nenhum arquivo enviado." });
  }

  let handle;
  try {
    handle = await open(req.file.path, "r");
    const header = Buffer.alloc(12);
    const { bytesRead } = await handle.read(header, 0, header.length, 0);
    const tipoReal = detectarTipoImagem(header.subarray(0, bytesRead));

    if (!tipoReal || tipoReal !== req.file.mimetype) {
      await handle.close();
      handle = null;
      await unlink(req.file.path);
      return res.status(400).json({ erro: "O conteúdo do arquivo não corresponde a uma imagem JPG, PNG ou WEBP válida." });
    }
  } catch (error) {
    if (handle) await handle.close().catch(() => {});
    await unlink(req.file.path).catch(() => {});
    return next(error);
  }
  await handle.close();

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
