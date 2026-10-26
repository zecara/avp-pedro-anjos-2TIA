import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Catálogo de Jogos API",
      version: "1.0.0",
      description:
        "API REST para gerenciar um catálogo de jogos, com cadastro de usuários, autenticação por token JWT, operações CRUD e upload de imagens.",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor local de desenvolvimento",
      },
    ],
  },
  apis: ["./routes/*.js", "./controllers/*.js", "./server.js"],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);

const swaggerCustomCss = readFileSync(
  fileURLToPath(new URL("./swagger.css", import.meta.url)),
  "utf8",
);

export function configurarSwagger(app) {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: swaggerCustomCss,
      customSiteTitle: "Catálogo de Jogos API | Swagger",
    }),
  );
}
