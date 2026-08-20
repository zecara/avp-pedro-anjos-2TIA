import { Router } from "express";
import {
  listarJogos,
  buscarJogoPorId,
  cadastrarJogo,
  editarJogo,
  excluirJogo,
} from "../controllers/jogosController.js";

const router = Router();

router.get("/", listarJogos);          // GET    /jogos
router.get("/:id", buscarJogoPorId);   // GET    /jogos/:id
router.post("/", cadastrarJogo);       // POST   /jogos
router.put("/:id", editarJogo);        // PUT    /jogos/:id
router.delete("/:id", excluirJogo);    // DELETE /jogos/:id

export default router;
