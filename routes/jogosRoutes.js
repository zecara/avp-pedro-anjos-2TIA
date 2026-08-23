import { Router } from "express";
import {
  listarJogos,
  listarEstatisticas,
  buscarJogoPorId,
  cadastrarJogo,
  editarJogo,
  excluirJogo,
} from "../controllers/jogosController.js";

const router = Router();

router.get("/estatisticas", listarEstatisticas); // GET /jogos/estatisticas
router.get("/", listarJogos);                    // GET /jogos
router.get("/:id", buscarJogoPorId);             // GET /jogos/:id
router.post("/", cadastrarJogo);                 // POST /jogos
router.put("/:id", editarJogo);                  // PUT /jogos/:id
router.delete("/:id", excluirJogo);              // DELETE /jogos/:id

export default router;
