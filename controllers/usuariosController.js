import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

const segredoJwt = process.env.JWT_SECRET;

if (!segredoJwt) {
  throw new Error("JWT_SECRET não configurada. Defina a variável de ambiente no arquivo .env.");
}

export async function cadastrarUsuario(req, res) {
  const { nome, email, senha } = req.body ?? {};

  if ([nome, email, senha].some((valor) => typeof valor !== "string" || valor.trim() === "")) {
    return res.status(400).json({
      erro: "Os campos 'nome', 'email' e 'senha' são obrigatórios e devem ser strings válidas.",
    });
  }

  const emailNormalizado = email.trim().toLowerCase();
  const senhaCriptografada = await bcrypt.hash(senha, 10);
  let novoUsuario;
  try {
    novoUsuario = await prisma.usuario.create({
      data: {
        nome: nome.trim(),
        email: emailNormalizado,
        senha: senhaCriptografada,
      },
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ erro: "E-mail já cadastrado." });
    }
    throw error;
  }

  return res.status(201).json({
    mensagem: "Usuário cadastrado com sucesso.",
    usuario: {
      id: novoUsuario.id,
      nome: novoUsuario.nome,
      email: novoUsuario.email,
    },
  });
}

/**
 * @openapi
 * /login:
 *   post:
 *     summary: Fazer login
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, senha]
 *             properties:
 *               email: { type: string, format: email }
 *               senha: { type: string, format: password }
 *     responses:
 *       200: { description: Login realizado e token JWT retornado }
 *       401: { description: Credenciais inválidas }
 */
export async function fazerLogin(req, res) {
  const { email, senha } = req.body ?? {};

  if ([email, senha].some((valor) => typeof valor !== "string" || valor.trim() === "")) {
    return res.status(400).json({
      erro: "Os campos 'email' e 'senha' são obrigatórios e devem ser strings válidas.",
    });
  }

  const emailNormalizado = email.trim().toLowerCase();
  const usuario = await prisma.usuario.findUnique({ where: { email: emailNormalizado } });

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
