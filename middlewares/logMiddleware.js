export function registrarLog(req, res, next) {
  const horario = new Date().toISOString();
  console.log(`[${horario}] ${req.method} ${req.originalUrl}`);
  next();
}
