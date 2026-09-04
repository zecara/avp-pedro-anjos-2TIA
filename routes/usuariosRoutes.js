import { Router } from "express";
import { cadastrarUsuario } from "../controllers/usuariosController.js";

const router = Router();

/**
 * @openapi
 * /usuarios:
 *   post:
 *     summary: Cadastrar usuário
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, email, senha]
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário cadastrado com sucesso
 *       409:
 *         description: E-mail já existe
 */
router.post("/", cadastrarUsuario);

export default router;
