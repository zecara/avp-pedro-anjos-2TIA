import express from "express";
import jogosRoutes from "./routes/jogosRoutes.js";
import usuariosRoutes from "./routes/usuariosRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import { configurarSwagger } from "./swagger.js";
import { fazerLogin } from "./controllers/usuariosController.js";
import { registrarLog } from "./middlewares/logMiddleware.js";

const app = express();
const port = 3000;

app.use(registrarLog);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    mensagem: "API do Catálogo de Jogos está no ar!",
    disciplina: "Desenvolvimento de Websites",
    rotasDisponiveis: [
      "POST   /usuarios",
      "POST   /login",
      "GET    /jogos",
      "GET    /jogos/estatisticas",
      "GET    /jogos/:id",
      "POST   /jogos",
      "PUT    /jogos/:id",
      "DELETE /jogos/:id",
      "POST   /upload",
      "GET    /api-docs",
    ],
  });
});

app.use("/usuarios", usuariosRoutes);
app.post("/login", fazerLogin);
app.use("/jogos", jogosRoutes);
app.use("/upload", uploadRoutes);
app.use("/uploads", express.static("uploads"));
configurarSwagger(app);

app.use((req, res) => {
  res.status(404).json({ erro: "Rota não encontrada." });
});

app.use((error, req, res, next) => {
  if (error) {
    if (error.name === "MulterError") {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ erro: "Arquivo muito grande. O tamanho máximo é 2MB." });
      }
      return res.status(400).json({ erro: `Erro no upload: ${error.message}` });
    }

    if (error.message?.includes("Tipo de arquivo inválido")) {
      return res.status(400).json({ erro: error.message });
    }

    console.error(error);
    return res.status(500).json({ erro: "Erro interno do servidor." });
  }

  return next();
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  console.log(`Documentação disponível em http://localhost:${port}/api-docs`);
});
