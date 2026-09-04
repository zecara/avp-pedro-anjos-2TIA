import { Router } from "express";
import {
  listarJogos,
  listarEstatisticas,
  buscarJogoPorId,
  cadastrarJogo,
  editarJogo,
  excluirJogo,
} from "../controllers/jogosController.js";
import { autenticarToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(autenticarToken);

/**
 * @openapi
 * /jogos:
 *   get:
 *     summary: Listar jogos
 *     tags: [Jogos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de jogos
 */
router.get("/", listarJogos);

/**
 * @openapi
 * /jogos/estatisticas:
 *   get:
 *     summary: Estatísticas dos jogos
 *     tags: [Jogos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas do catálogo
 */
router.get("/estatisticas", listarEstatisticas);

/**
 * @openapi
 * /jogos/{id}:
 *   get:
 *     summary: Buscar jogo por ID
 *     tags: [Jogos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Jogo encontrado
 */
router.get("/:id", buscarJogoPorId);

/**
 * @openapi
 * /jogos:
 *   post:
 *     summary: Cadastrar jogo
 *     tags: [Jogos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [titulo, genero, plataforma]
 *             properties:
 *               titulo: { type: string }
 *               genero: { type: string }
 *               plataforma: { type: string }
 *               anoLancamento: { type: integer }
 *               nota: { type: number, minimum: 0, maximum: 10 }
 *               concluido: { type: boolean }
 *     responses:
 *       201:
 *         description: Jogo cadastrado
 */
router.post("/", cadastrarJogo);

/**
 * @openapi
 * /jogos/{id}:
 *   put:
 *     summary: Editar jogo
 *     tags: [Jogos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo: { type: string }
 *               genero: { type: string }
 *               plataforma: { type: string }
 *               nota: { type: number, minimum: 0, maximum: 10 }
 *               concluido: { type: boolean }
 *     responses:
 *       200:
 *         description: Jogo atualizado
 */
router.put("/:id", editarJogo);

/**
 * @openapi
 * /jogos/{id}:
 *   delete:
 *     summary: Excluir jogo
 *     tags: [Jogos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Jogo removido
 */
router.delete("/:id", excluirJogo);

export default router;
