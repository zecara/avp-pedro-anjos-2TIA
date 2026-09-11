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

/*
const legacySwaggerCustomCss = `
  :root {
    color-scheme: dark;
    --swagger-bg: #10141c;
    --swagger-surface: #171d28;
    --swagger-surface-raised: #1d2633;
    --swagger-border: #2d3a4b;
    --swagger-text: #e6edf5;
    --swagger-muted: #aebdce;
    --swagger-accent: #5ed6c0;
  }

  html,
  body {
    background: var(--swagger-bg) !important;
  }

  body {
    color: var(--swagger-text);
  }

  .swagger-ui {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 24px 48px;
    color: var(--swagger-text);
    font-family: "Segoe UI", Tahoma, sans-serif;
  }

  .swagger-ui .topbar {
    background: #0b0f15;
    border-bottom: 1px solid var(--swagger-border);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.24);
  }

  .swagger-ui .topbar .download-url-wrapper input[type="text"] {
    background: var(--swagger-surface);
    border: 1px solid var(--swagger-border);
    color: var(--swagger-text);
  }

  .swagger-ui .information-container {
    padding: 36px 0 18px;
  }

  .swagger-ui .info .title,
  .swagger-ui .info hgroup h2,
  .swagger-ui .opblock-tag,
  .swagger-ui .opblock-summary-description,
  .swagger-ui label,
  .swagger-ui .parameter__name,
  .swagger-ui .response-col_status,
  .swagger-ui table thead tr th {
    color: var(--swagger-text);
  }

  .swagger-ui .info p,
  .swagger-ui .info li,
  .swagger-ui .opblock-description-wrapper p,
  .swagger-ui .response-col_description,
  .swagger-ui .parameter__type,
  .swagger-ui .servers > label {
    color: var(--swagger-muted);
  }

  .swagger-ui .opblock-tag {
    margin: 28px 0 12px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--swagger-border);
    font-size: 1.15rem;
  }

  .swagger-ui .opblock {
    margin: 12px 0;
    border: 1px solid var(--swagger-border);
    border-radius: 8px;
    background: var(--swagger-surface);
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.14);
    overflow: hidden;
  }

  .swagger-ui .opblock .opblock-summary {
    padding: 10px 14px;
  }

  .swagger-ui .opblock .opblock-summary-method {
    min-width: 76px;
    border-radius: 5px;
    box-shadow: none;
    font-weight: 700;
  }

  .swagger-ui .opblock-summary-path,
  .swagger-ui .opblock-summary-description {
    color: var(--swagger-text);
  }

  .swagger-ui .opblock-get { border-color: #287d9a; background: rgba(28, 104, 132, 0.18); }
  .swagger-ui .opblock-post { border-color: #358b5c; background: rgba(28, 112, 67, 0.18); }
  .swagger-ui .opblock-put { border-color: #b17a25; background: rgba(156, 102, 19, 0.18); }
  .swagger-ui .opblock-delete { border-color: #a74852; background: rgba(143, 42, 53, 0.18); }

  .swagger-ui .opblock-body,
  .swagger-ui .opblock-section-header,
  .swagger-ui .responses-inner {
    background: rgba(9, 13, 19, 0.34);
  }

  .swagger-ui .opblock-section-header {
    border-top: 1px solid var(--swagger-border);
    border-bottom: 1px solid var(--swagger-border);
  }

  .swagger-ui .opblock-section-header h4,
  .swagger-ui .model-title,
  .swagger-ui .response-col_links {
    color: var(--swagger-text);
  }

  .swagger-ui input[type="text"],
  .swagger-ui input[type="email"],
  .swagger-ui input[type="password"],
  .swagger-ui textarea,
  .swagger-ui select {
    border: 1px solid var(--swagger-border);
    border-radius: 5px;
    background: var(--swagger-surface-raised);
    color: var(--swagger-text);
  }

  .swagger-ui .btn {
    border: 1px solid var(--swagger-border);
    border-radius: 5px;
    background: var(--swagger-surface-raised);
    color: var(--swagger-text);
    transition: background 160ms ease, border-color 160ms ease, transform 160ms ease;
  }

  .swagger-ui .btn:hover {
    border-color: var(--swagger-accent);
    background: #263547;
    transform: translateY(-1px);
  }

  .swagger-ui .btn.authorize {
    min-height: 40px;
    padding: 0 16px;
    border: 1px solid #7ce8d4;
    border-radius: 7px;
    background: #5ed6c0;
    box-shadow: 0 5px 16px rgba(36, 194, 166, 0.25);
    color: #061615;
    font-weight: 700;
    transition: background 180ms ease, border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
  }

  .swagger-ui .btn.authorize:hover {
    border-color: #a1f4e5;
    background: #83e8d7;
    box-shadow: 0 8px 22px rgba(36, 194, 166, 0.36);
    color: #041110;
    transform: translateY(-1px);
  }

  .swagger-ui .btn.authorize:focus-visible {
    outline: 3px solid rgba(161, 244, 229, 0.35);
    outline-offset: 2px;
  }

  .swagger-ui .btn.authorize svg {
    width: 16px;
    height: 16px;
    margin-right: 6px;
    fill: #061615;
    stroke: #061615;
    stroke-width: 1.5;
    vertical-align: -3px;
  }

  .swagger-ui .dialog-ux .modal-ux,
  .swagger-ui .dialog-ux .modal-ux-content,
  .swagger-ui .dialog-ux .modal-ux-header {
    background: var(--swagger-surface);
    color: var(--swagger-text);
  }

  .swagger-ui .dialog-ux .modal-ux-header {
    border-bottom: 1px solid var(--swagger-border);
  }

  .swagger-ui .highlight-code,
  .swagger-ui .microlight,
  .swagger-ui .model-box {
    background: #0b1017 !important;
    color: #d9e5f2 !important;
  }

  .swagger-ui .model-box,
  .swagger-ui table thead tr th,
  .swagger-ui table tbody tr td {
    border-color: var(--swagger-border);
  }

  .swagger-ui .model,
  .swagger-ui .model-toggle,
  .swagger-ui .prop-type,
  .swagger-ui .prop-format {
    color: var(--swagger-muted);
  }

  .swagger-ui a {
    color: var(--swagger-accent);
  }

  @media (max-width: 720px) {
    .swagger-ui {
      padding: 0 12px 32px;
    }

    .swagger-ui .information-container {
      padding-top: 24px;
    }

    .swagger-ui .opblock .opblock-summary {
      align-items: flex-start;
      gap: 8px;
    }

    .swagger-ui .opblock .opblock-summary-method {
      min-width: 62px;
    }
  }
`;
*/

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
