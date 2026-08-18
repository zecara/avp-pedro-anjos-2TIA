// Simulação de um banco de dados em memória.
// Enquanto o servidor estiver rodando, os dados ficam armazenados aqui.
// Quando o servidor for reiniciado, a lista volta ao estado inicial.

let jogos = [
  {
    id: 1,
    titulo: "The Legend of Zelda: Breath of the Wild",
    genero: "Aventura",
    plataforma: "Nintendo Switch",
    anoLancamento: 2017,
    nota: 9.7,
    concluido: true,
  },
  {
    id: 2,
    titulo: "God of War Ragnarök",
    genero: "Ação",
    plataforma: "PS5",
    anoLancamento: 2022,
    nota: 9.5,
    concluido: false,
  },
];

// Controla o próximo ID disponível para novos cadastros.
// Começa a partir do maior ID já existente na lista inicial.
let proximoId = jogos.length > 0 ? Math.max(...jogos.map((j) => j.id)) + 1 : 1;

function gerarProximoId() {
  const id = proximoId;
  proximoId += 1;
  return id;
}

module.exports = {
  jogos,
  gerarProximoId,
};
