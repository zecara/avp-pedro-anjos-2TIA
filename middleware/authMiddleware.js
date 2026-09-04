import jwt from "jsonwebtoken";

const segredoJwt = process.env.JWT_SECRET || "segredo-av2-jogos";

export function autenticarToken(req, res, next) {
  const cabecalho = req.headers.authorization;

  if (!cabecalho || !cabecalho.startsWith("Bearer ")) {
    return res.status(401).json({ erro: "Token de autenticação ausente." });
  }

  const token = cabecalho.split(" ")[1];

  try {
    const dadosToken = jwt.verify(token, segredoJwt);
    req.usuario = dadosToken;
    return next();
  } catch (error) {
    return res.status(401).json({ erro: "Token inválido ou expirado." });
  }
}
