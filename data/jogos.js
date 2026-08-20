// Simulação de um banco de dados em memória.
// Enquanto o servidor estiver rodando, os dados ficam armazenados aqui.
// Quando o servidor for reiniciado, a lista volta ao estado inicial.

export const jogos = [
  {
    id: 1,
    titulo: "Red Dead Redemption",
    genero: "Ação/Aventura",
    plataforma: "PS4",
    anoLancamento: 2010,
    nota: 9.6,
    concluido: true,
  },
  {
    id: 2,
    titulo: "Red Dead Redemption 2",
    genero: "Ação/Aventura",
    plataforma: "PS5",
    anoLancamento: 2018,
    nota: 9.8,
    concluido: true,
  },
  {
    id: 3,
    titulo: "Stardew Valley",
    genero: "Simulação",
    plataforma: "PC",
    anoLancamento: 2016,
    nota: 9.3,
    concluido: false,
  },
  {
    id: 4,
    titulo: "Shadow of the Colossus",
    genero: "Aventura",
    plataforma: "PS4",
    anoLancamento: 2018,
    nota: 9.4,
    concluido: true,
  },
  {
    id: 5,
    titulo: "God of War Ragnarök",
    genero: "Ação",
    plataforma: "PS5",
    anoLancamento: 2022,
    nota: 9.5,
    concluido: false,
  },
  {
    id: 6,
    titulo: "The Last of Us Part II",
    genero: "Ação/Sobrevivência",
    plataforma: "PS5",
    anoLancamento: 2020,
    nota: 9.1,
    concluido: false,
  },
];

// Controla o próximo ID disponível para novos cadastros.
let proximoId = jogos.length > 0 ? Math.max(...jogos.map((j) => j.id)) + 1 : 1;

export function gerarProximoId() {
  const id = proximoId;
  proximoId += 1;
  return id;
}
