const { jogos, gerarProximoId } = require("../data/jogos");

// GET /jogos -> lista todos os jogos cadastrados
function listarJogos(req, res) {
  return res.status(200).json(jogos);
}

// GET /jogos/:id -> consulta um jogo específico pelo ID
function buscarJogoPorId(req, res) {
  const id = Number(req.params.id);
  const jogo = jogos.find((j) => j.id === id);

  if (!jogo) {
    return res.status(404).json({ erro: `Jogo com ID ${id} não encontrado.` });
  }

  return res.status(200).json(jogo);
}

// POST /jogos -> cadastra um novo jogo
function cadastrarJogo(req, res) {
  const { titulo, genero, plataforma, anoLancamento, nota, concluido } = req.body;

  if (!titulo || !genero || !plataforma) {
    return res.status(400).json({
      erro: "Os campos 'titulo', 'genero' e 'plataforma' são obrigatórios.",
    });
  }

  const novoJogo = {
    id: gerarProximoId(),
    titulo,
    genero,
    plataforma,
    anoLancamento: anoLancamento ?? null,
    nota: nota ?? null,
    concluido: concluido ?? false,
  };

  jogos.push(novoJogo);

  return res.status(201).json({
    mensagem: "Jogo cadastrado com sucesso.",
    jogo: novoJogo,
  });
}

// PUT /jogos/:id -> edita um jogo existente
function editarJogo(req, res) {
  const id = Number(req.params.id);
  const jogo = jogos.find((j) => j.id === id);

  if (!jogo) {
    return res.status(404).json({ erro: `Jogo com ID ${id} não encontrado.` });
  }

  const { titulo, genero, plataforma, anoLancamento, nota, concluido } = req.body;

  if (titulo !== undefined) jogo.titulo = titulo;
  if (genero !== undefined) jogo.genero = genero;
  if (plataforma !== undefined) jogo.plataforma = plataforma;
  if (anoLancamento !== undefined) jogo.anoLancamento = anoLancamento;
  if (nota !== undefined) jogo.nota = nota;
  if (concluido !== undefined) jogo.concluido = concluido;

  return res.status(200).json({
    mensagem: "Jogo atualizado com sucesso.",
    jogo,
  });
}

// DELETE /jogos/:id -> remove um jogo pelo ID
function excluirJogo(req, res) {
  const id = Number(req.params.id);
  const indice = jogos.findIndex((j) => j.id === id);

  if (indice === -1) {
    return res.status(404).json({ erro: `Jogo com ID ${id} não encontrado.` });
  }

  const [jogoRemovido] = jogos.splice(indice, 1);

  return res.status(200).json({
    mensagem: "Jogo removido com sucesso.",
    jogo: jogoRemovido,
  });
}

module.exports = {
  listarJogos,
  buscarJogoPorId,
  cadastrarJogo,
  editarJogo,
  excluirJogo,
};
