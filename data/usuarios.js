export const usuarios = [];

let proximoUsuarioId = 1;

export function gerarProximoUsuarioId() {
  const id = proximoUsuarioId;
  proximoUsuarioId += 1;
  return id;
}
