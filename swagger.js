import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Catálogo de Jogos",
      version: "1.0.0",
      description: "API REST para cadastro, autenticação, upload de imagens e documentação básica.",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor local",
      },
    ],
  },
  apis: ["./routes/*.js", "./controllers/*.js", "./server.js"],
};

export const swaggerSpec = swaggerJsdoc(options);

export function configurarSwagger(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
