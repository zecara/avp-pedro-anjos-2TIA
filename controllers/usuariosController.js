import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { usuarios, gerarProximoUsuarioId } from "../data/usuarios.js";

const segredoJwt = process.env.JWT_SECRET || "segredo-av2-jogos";

export async function cadastrarUsuario(req, res) {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({
      erro: "Os campos 'nome', 'email' e 'senha' são obrigatórios.",
    });
  }

  const emailExistente = usuarios.find(
    (usuario) => usuario.email.toLowerCase() === email.toLowerCase()
  );

  if (emailExistente) {
    return res.status(409).json({ erro: "E-mail já cadastrado." });
  }

  const senhaCriptografada = await bcrypt.hash(senha, 10);

  const novoUsuario = {
    id: gerarProximoUsuarioId(),
    nome,
    email,
    senha: senhaCriptografada,
  };

  usuarios.push(novoUsuario);

  return res.status(201).json({
    mensagem: "Usuário cadastrado com sucesso.",
    usuario: {
      id: novoUsuario.id,
      nome: novoUsuario.nome,
      email: novoUsuario.email,
    },
  });
}

export async function fazerLogin(req, res) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({
      erro: "Os campos 'email' e 'senha' são obrigatórios.",
    });
  }

  const usuario = usuarios.find(
    (item) => item.email.toLowerCase() === email.toLowerCase()
  );

  if (!usuario) {
    return res.status(401).json({ erro: "Credenciais inválidas." });
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha);

  if (!senhaValida) {
    return res.status(401).json({ erro: "Credenciais inválidas." });
  }

  const token = jwt.sign(
    { id: usuario.id, email: usuario.email, nome: usuario.nome },
    segredoJwt,
    { expiresIn: "1h" }
  );

  return res.status(200).json({
    mensagem: "Login realizado com sucesso.",
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
    },
  });
}
