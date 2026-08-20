import express from "express";
import jogosRoutes from "./routes/jogosRoutes.js";

const app = express();
const port = 3000;

// Middleware para o Express entender JSON no corpo das requisições
app.use(express.json());

// Rota inicial só para confirmar que a API está no ar
app.get("/", (req, res) => {
  res.json({
    mensagem: "API do Catálogo de Jogos está no ar!",
    disciplina: "Desenvolvimento de Websites",
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

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
