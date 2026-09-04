import jwt from "jsonwebtoken";

const segredoJwt = process.env.JWT_SECRET || "segredo-av2-jogos";

export function autenticarToken(req, res, next) {
  const cabecalho = req.headers.authorization;

  if (!cabecalho || !cabecalho.startsWith("Bearer ")) {
    return res.status(401).json({ erro: "Token de autenticação ausente." });
  }

  const token = cabecalho.slice(7).trim();

  if (!token) {
    return res.status(401).json({ erro: "Token de autenticação ausente." });
  }

  try {
    req.usuario = jwt.verify(token, segredoJwt);
    return next();
  } catch {
    return res.status(401).json({ erro: "Token inválido ou expirado." });
  }
}