const express = require("express");
const router = express.Router();

const {
  listarJogos,
  buscarJogoPorId,
  cadastrarJogo,
  editarJogo,
  excluirJogo,
} = require("../controllers/jogosController");

// Rotas do recurso "jogos"
router.get("/", listarJogos);          // GET    /jogos
router.get("/:id", buscarJogoPorId);   // GET    /jogos/:id
router.post("/", cadastrarJogo);       // POST   /jogos
router.put("/:id", editarJogo);        // PUT    /jogos/:id
router.delete("/:id", excluirJogo);    // DELETE /jogos/:id

module.exports = router;
