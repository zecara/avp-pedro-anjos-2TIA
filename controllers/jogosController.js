import prisma from "../lib/prisma.js";

const anoAtual = new Date().getFullYear();

function validarCampoObrigatorio(req, res, nomeCampo, valor) {
  if (valor === undefined || typeof valor !== "string" || valor.trim() === "") {
    return res.status(400).json({
      erro: `O campo '${nomeCampo}' é obrigatório e deve ser uma string válida.`,
    });
  }

  return null;
}

function validarCamposOpcionais(body, res) {
  const { anoLancamento, nota, concluido } = body;

  if (anoLancamento !== undefined) {
    if (!Number.isInteger(anoLancamento) || anoLancamento < 1970 || anoLancamento > anoAtual + 1) {
      return res.status(400).json({
        erro: `O campo 'anoLancamento' deve ser um número inteiro entre 1970 e ${anoAtual + 1}.`,
      });
    }
  }

  if (nota !== undefined) {
    if (typeof nota !== "number" || Number.isNaN(nota) || nota < 0 || nota > 10) {
      return res.status(400).json({
        erro: "O campo 'nota' deve ser um número entre 0 e 10.",
      });
    }
  }

  if (concluido !== undefined) {
    if (typeof concluido !== "boolean") {
      return res.status(400).json({
        erro: "O campo 'concluido' deve ser um valor booleano (true ou false).",
      });
    }
  }

  return null;
}

// GET /jogos -> lista todos os jogos cadastrados
export async function listarJogos(req, res) {
  const { genero, concluido: concluidoParam, ordenarPor } = req.query;
  const where = {};

  if (genero !== undefined && String(genero).trim() !== "") {
    where.genero = { contains: String(genero).trim() };
  }

  if (concluidoParam !== undefined) {
    const valorConcluido = String(concluidoParam).trim().toLowerCase();

    if (valorConcluido === "true" || valorConcluido === "false") {
      where.concluido = valorConcluido === "true";
    }
  }

  const camposOrdenacaoValidos = {
    titulo: "titulo",
    anolancamento: "anoLancamento",
    nota: "nota",
  };
  const campoOrdenacao = String(ordenarPor ?? "").trim().toLowerCase();
  const orderBy = camposOrdenacaoValidos[campoOrdenacao]
    ? { [camposOrdenacaoValidos[campoOrdenacao]]: "asc" }
    : undefined;

  const jogos = await prisma.jogo.findMany({ where, orderBy });
  return res.status(200).json(jogos);
}

export async function listarEstatisticas(req, res) {
  const jogos = await prisma.jogo.findMany({
    select: { concluido: true, nota: true, genero: true },
  });
  const totalJogos = jogos.length;
  const quantidadeConcluidos = jogos.filter((jogo) => jogo.concluido).length;
  const quantidadeNaoConcluidos = totalJogos - quantidadeConcluidos;
  const notasValidas = jogos.map((jogo) => jogo.nota).filter((nota) => nota !== null);
  const notaMedia = notasValidas.length > 0
    ? Number((notasValidas.reduce((total, nota) => total + nota, 0) / notasValidas.length).toFixed(1))
    : 0;
  const contagemGeneros = jogos.reduce((contagem, jogo) => {
    const genero = jogo.genero.trim();
    contagem[genero] = (contagem[genero] || 0) + 1;
    return contagem;
  }, {});
  const generoMaisFrequente = Object.entries(contagemGeneros).length > 0
    ? Object.entries(contagemGeneros).sort((a, b) => b[1] - a[1])[0][0]
    : "N/A";

  return res.status(200).json({
    totalJogos,
    quantidadeConcluidos,
    quantidadeNaoConcluidos,
    notaMedia,
    generoMaisFrequente,
  });
}

// GET /jogos/:id -> consulta um jogo específico pelo ID
export async function buscarJogoPorId(req, res) {
  const id = Number(req.params.id);
  const jogo = Number.isInteger(id) ? await prisma.jogo.findUnique({ where: { id } }) : null;

  if (!jogo) {
    return res.status(404).json({ erro: `Jogo com ID ${id} não encontrado.` });
  }

  return res.status(200).json(jogo);
}

// POST /jogos -> cadastra um novo jogo
export async function cadastrarJogo(req, res) {
  const body = req.body ?? {};
  const {
    titulo,
    genero,
    plataforma,
    anoLancamento,
    nota,
    concluido,
    desenvolvedora,
    distribuidora,
    classificacaoIndicativa,
    horasParaZerar,
    sinopse,
  } = body;

  for (const [nomeCampo, valor] of Object.entries({ titulo, genero, plataforma })) {
    const erro = validarCampoObrigatorio(req, res, nomeCampo, valor);
    if (erro) return erro;
  }

  const erroCamposOpcionais = validarCamposOpcionais(body, res);
  if (erroCamposOpcionais) return erroCamposOpcionais;

  for (const campo of ["desenvolvedora", "distribuidora", "classificacaoIndicativa", "sinopse"]) {
    if (body[campo] !== undefined && body[campo] !== null && typeof body[campo] !== "string") {
      return res.status(400).json({ erro: `O campo '${campo}' deve ser uma string.` });
    }
  }
  if (horasParaZerar !== undefined && horasParaZerar !== null && (!Number.isInteger(horasParaZerar) || horasParaZerar < 0)) {
    return res.status(400).json({ erro: "O campo 'horasParaZerar' deve ser um inteiro não negativo." });
  }

  const jogo = await prisma.jogo.create({
    data: {
      titulo: titulo.trim(),
      genero: genero.trim(),
      plataforma: plataforma.trim(),
      anoLancamento: anoLancamento ?? null,
      nota: nota ?? null,
      concluido: concluido ?? false,
      desenvolvedora: desenvolvedora ?? null,
      distribuidora: distribuidora ?? null,
      classificacaoIndicativa: classificacaoIndicativa ?? null,
      horasParaZerar: horasParaZerar ?? null,
      sinopse: sinopse ?? null,
    },
  });

  return res.status(201).json({ mensagem: "Jogo cadastrado com sucesso.", jogo });
}

// PATCH /jogos/:id -> edita um jogo existente
export async function editarJogo(req, res) {
  const body = req.body ?? {};
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(404).json({ erro: `Jogo com ID ${id} não encontrado.` });
  }

  const camposObrigatorios = ["titulo", "genero", "plataforma"];
  for (const campo of camposObrigatorios) {
    if (body[campo] !== undefined) {
      const erro = validarCampoObrigatorio(req, res, campo, body[campo]);
      if (erro) return erro;
    }
  }

  const erroCamposOpcionais = validarCamposOpcionais(body, res);
  if (erroCamposOpcionais) return erroCamposOpcionais;
  for (const campo of ["desenvolvedora", "distribuidora", "classificacaoIndicativa", "sinopse"]) {
    if (body[campo] !== undefined && body[campo] !== null && typeof body[campo] !== "string") {
      return res.status(400).json({ erro: `O campo '${campo}' deve ser uma string.` });
    }
  }
  if (body.horasParaZerar !== undefined && body.horasParaZerar !== null
    && (!Number.isInteger(body.horasParaZerar) || body.horasParaZerar < 0)) {
    return res.status(400).json({ erro: "O campo 'horasParaZerar' deve ser um inteiro não negativo." });
  }

  const camposAtualizaveis = [
    "titulo",
    "genero",
    "plataforma",
    "anoLancamento",
    "nota",
    "concluido",
    "desenvolvedora",
    "distribuidora",
    "classificacaoIndicativa",
    "horasParaZerar",
    "sinopse",
  ];
  const data = Object.fromEntries(
    camposAtualizaveis
      .filter((campo) => body[campo] !== undefined)
      .map((campo) => [campo, body[campo]])
  );
  for (const campo of camposObrigatorios) {
    if (data[campo] !== undefined) data[campo] = data[campo].trim();
  }
  delete data.id;

  try {
    const jogo = await prisma.jogo.update({ where: { id }, data });
    return res.status(200).json({ mensagem: "Jogo atualizado com sucesso.", jogo });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ erro: `Jogo com ID ${id} não encontrado.` });
    }
    throw error;
  }
}

// DELETE /jogos/:id -> remove um jogo pelo ID
export async function excluirJogo(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(404).json({ erro: `Jogo com ID ${id} não encontrado.` });
  }

  try {
    const jogo = await prisma.jogo.delete({ where: { id } });
    return res.status(200).json({ mensagem: "Jogo removido com sucesso.", jogo });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ erro: `Jogo com ID ${id} não encontrado.` });
    }
    throw error;
  }
}
