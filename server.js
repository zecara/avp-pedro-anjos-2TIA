const express = require("express");
const jogosRoutes = require("./routes/jogosRoutes");

const app = express();
const PORTA = 3000;

// Middleware para o Express entender JSON no corpo das requisições
app.use(express.json());

// Rota inicial só para confirmar que a API está no ar
app.get("/", (req, res) => {
  res.status(200).json({
    mensagem: "API do Catálogo de Jogos está no ar!",
    rotasDisponiveis: [
      "GET    /jogos",
      "GET    /jogos/:id",
      "POST   /jogos",
      "PUT    /jogos/:id",
      "DELETE /jogos/:id",
    ],
  });
});

// Todas as rotas de jogos ficam agrupadas em /jogos
app.use("/jogos", jogosRoutes);

// Middleware para tratar rotas que não existem
app.use((req, res) => {
  res.status(404).json({ erro: "Rota não encontrada." });
});

app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});
