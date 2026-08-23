import { jogos, gerarProximoId } from "../data/jogos.js";

const anoAtual = new Date().getFullYear();

function validarCampoObrigatorio(req, res, nomeCampo, valor) {
  if (valor === undefined || typeof valor !== "string" || valor.trim() === "") {
    return res.status(400).json({
      erro: `O campo '${nomeCampo}' é obrigatório e deve ser uma string válida.`,
    });
  }

  return null;
}

function validarCamposOpcionais(req, res) {
  const { anoLancamento, nota, concluido } = req.body;

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
export function listarJogos(req, res) {
  const { genero, concluido: concluidoParam, ordenarPor } = req.query;

  let jogosFiltrados = [...jogos];

  if (genero !== undefined && String(genero).trim() !== "") {
    const termoGenero = String(genero).trim().toLowerCase();
    jogosFiltrados = jogosFiltrados.filter((jogo) =>
      typeof jogo.genero === "string" && jogo.genero.toLowerCase().includes(termoGenero)
    );
  }

  if (concluidoParam !== undefined) {
    const valorConcluido = String(concluidoParam).trim().toLowerCase();

    if (valorConcluido === "true" || valorConcluido === "false") {
      const concluidoBoolean = valorConcluido === "true";
      jogosFiltrados = jogosFiltrados.filter((jogo) => jogo.concluido === concluidoBoolean);
    }
  }

  if (ordenarPor !== undefined) {
    const campoOrdenacao = String(ordenarPor).trim().toLowerCase();
    const camposOrdenacaoValidos = ["titulo", "anoLancamento", "nota"];

    if (camposOrdenacaoValidos.includes(campoOrdenacao)) {
      jogosFiltrados.sort((jogoA, jogoB) => {
        if (campoOrdenacao === "titulo") {
          return String(jogoA.titulo).localeCompare(String(jogoB.titulo));
        }

        return Number(jogoA[campoOrdenacao]) - Number(jogoB[campoOrdenacao]);
      });
    }
  }

  res.status(200).json(jogosFiltrados);
}

export function listarEstatisticas(req, res) {
  const totalJogos = jogos.length;
  const quantidadeConcluidos = jogos.filter((jogo) => jogo.concluido === true).length;
  const quantidadeNaoConcluidos = totalJogos - quantidadeConcluidos;

  const notasValidas = jogos
    .filter((jogo) => typeof jogo.nota === "number" && !Number.isNaN(jogo.nota))
    .map((jogo) => jogo.nota);

  const somaNotas = notasValidas.reduce((total, nota) => total + nota, 0);
  const notaMedia = notasValidas.length > 0 ? Number((somaNotas / notasValidas.length).toFixed(1)) : 0;

  const contagemGeneros = jogos.reduce((acumulador, jogo) => {
    const genero = typeof jogo.genero === "string" ? jogo.genero.trim() : "";

    if (genero) {
      acumulador[genero] = (acumulador[genero] || 0) + 1;
    }

    return acumulador;
  }, {});

  const generoMaisFrequente = Object.entries(contagemGeneros).length > 0
    ? Object.entries(contagemGeneros).sort((a, b) => b[1] - a[1])[0][0]
    : "N/A";

  res.status(200).json({
    totalJogos,
    quantidadeConcluidos,
    quantidadeNaoConcluidos,
    notaMedia,
    generoMaisFrequente,
  });
}

// GET /jogos/:id -> consulta um jogo específico pelo ID
export function buscarJogoPorId(req, res) {
  const id = Number(req.params.id);
  const jogo = jogos.find((j) => j.id === id);

  if (!jogo) {
    return res.status(404).json({ erro: `Jogo com ID ${id} não encontrado.` });
  }

  res.status(200).json(jogo);
}

// POST /jogos -> cadastra um novo jogo
export function cadastrarJogo(req, res) {
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
  } = req.body;

  const erroTitulo = validarCampoObrigatorio(req, res, "titulo", titulo);
  if (erroTitulo) {
    return erroTitulo;
  }

  const erroGenero = validarCampoObrigatorio(req, res, "genero", genero);
  if (erroGenero) {
    return erroGenero;
  }

  const erroPlataforma = validarCampoObrigatorio(req, res, "plataforma", plataforma);
  if (erroPlataforma) {
    return erroPlataforma;
  }

  const erroCamposOpcionais = validarCamposOpcionais(req, res);
  if (erroCamposOpcionais) {
    return erroCamposOpcionais;
  }

  const novoJogo = {
    id: gerarProximoId(),
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
  };

  jogos.push(novoJogo);

  res.status(201).json({
    mensagem: "Jogo cadastrado com sucesso.",
    jogo: novoJogo,
  });
}

// PUT /jogos/:id -> edita um jogo existente
export function editarJogo(req, res) {
  const id = Number(req.params.id);
  const jogo = jogos.find((j) => j.id === id);

  if (!jogo) {
    return res.status(404).json({ erro: `Jogo com ID ${id} não encontrado.` });
  }

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
  } = req.body;

  if (titulo !== undefined) {
    const erroTitulo = validarCampoObrigatorio(req, res, "titulo", titulo);
    if (erroTitulo) {
      return erroTitulo;
    }
    jogo.titulo = titulo.trim();
  }

  if (genero !== undefined) {
    const erroGenero = validarCampoObrigatorio(req, res, "genero", genero);
    if (erroGenero) {
      return erroGenero;
    }
    jogo.genero = genero.trim();
  }

  if (plataforma !== undefined) {
    const erroPlataforma = validarCampoObrigatorio(req, res, "plataforma", plataforma);
    if (erroPlataforma) {
      return erroPlataforma;
    }
    jogo.plataforma = plataforma.trim();
  }

  if (anoLancamento !== undefined) {
    if (!Number.isInteger(anoLancamento) || anoLancamento < 1970 || anoLancamento > anoAtual + 1) {
      return res.status(400).json({
        erro: `O campo 'anoLancamento' deve ser um número inteiro entre 1970 e ${anoAtual + 1}.`,
      });
    }
    jogo.anoLancamento = anoLancamento;
  }

  if (nota !== undefined) {
    if (typeof nota !== "number" || Number.isNaN(nota) || nota < 0 || nota > 10) {
      return res.status(400).json({
        erro: "O campo 'nota' deve ser um número entre 0 e 10.",
      });
    }
    jogo.nota = nota;
  }

  if (concluido !== undefined) {
    if (typeof concluido !== "boolean") {
      return res.status(400).json({
        erro: "O campo 'concluido' deve ser um valor booleano (true ou false).",
      });
    }
    jogo.concluido = concluido;
  }

  if (desenvolvedora !== undefined) jogo.desenvolvedora = desenvolvedora;
  if (distribuidora !== undefined) jogo.distribuidora = distribuidora;
  if (classificacaoIndicativa !== undefined) jogo.classificacaoIndicativa = classificacaoIndicativa;
  if (horasParaZerar !== undefined) jogo.horasParaZerar = horasParaZerar;
  if (sinopse !== undefined) jogo.sinopse = sinopse;

  res.status(200).json({
    mensagem: "Jogo atualizado com sucesso.",
    jogo,
  });
}

// DELETE /jogos/:id -> remove um jogo pelo ID
export function excluirJogo(req, res) {
  const id = Number(req.params.id);
  const indice = jogos.findIndex((j) => j.id === id);

  if (indice === -1) {
    return res.status(404).json({ erro: `Jogo com ID ${id} não encontrado.` });
  }

  const [jogoRemovido] = jogos.splice(indice, 1);

  res.status(200).json({
    mensagem: "Jogo removido com sucesso.",
    jogo: jogoRemovido,
  });
}
