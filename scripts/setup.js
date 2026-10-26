import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parse } from "dotenv";

const examplePath = fileURLToPath(new URL("../.env.example", import.meta.url));
const envPath = fileURLToPath(new URL("../.env", import.meta.url));
const parentEnvPath = fileURLToPath(new URL("../../.env", import.meta.url));

const example = readFileSync(examplePath, "utf8");
if (!/^JWT_SECRET=.*$/m.test(example)) {
  throw new Error(".env.example precisa conter uma linha JWT_SECRET.");
}

const parentDatabaseUrl = existsSync(parentEnvPath)
  ? parse(readFileSync(parentEnvPath, "utf8")).DATABASE_URL
  : undefined;
const validParentDatabaseUrl = parentDatabaseUrl && /^mysql:\/\//i.test(parentDatabaseUrl)
  ? parentDatabaseUrl
  : undefined;

if (existsSync(envPath)) {
  const current = readFileSync(envPath, "utf8");
  const currentConfig = parse(current);
  const currentDatabaseUrl = currentConfig.DATABASE_URL;
  const isPlaceholder = !currentDatabaseUrl || /usuario:senha@host|nome_do_banco/.test(currentDatabaseUrl);

  if (currentDatabaseUrl && !isPlaceholder) {
    console.log(".env já contém DATABASE_URL; nenhuma configuração foi alterada.");
    process.exit(0);
  }

  const exampleDatabaseUrl = example.match(/^DATABASE_URL=.*$/m)?.[0];
  if (!exampleDatabaseUrl) {
    throw new Error(".env.example precisa conter uma linha DATABASE_URL.");
  }

  const databaseUrlLine = validParentDatabaseUrl
    ? `DATABASE_URL=${JSON.stringify(validParentDatabaseUrl)}`
    : exampleDatabaseUrl;
  const updated = /^DATABASE_URL\s*=.*$/m.test(current)
    ? current.replace(/^DATABASE_URL\s*=.*$/m, databaseUrlLine)
    : `${current}${current.length > 0 && !current.endsWith("\n") ? "\n" : ""}${databaseUrlLine}`;
  writeFileSync(envPath, `${updated.replace(/\n*$/, "")}\n`, "utf8");
  console.log(validParentDatabaseUrl
    ? "DATABASE_URL copiada da configuração local da pasta principal."
    : "DATABASE_URL de exemplo adicionada ao .env; configure os dados do seu MySQL/MariaDB.");
  process.exit(0);
}

const secret = randomBytes(32).toString("hex");
const initialDatabaseUrl = validParentDatabaseUrl
  ? `DATABASE_URL=${JSON.stringify(validParentDatabaseUrl)}`
  : example.match(/^DATABASE_URL=.*$/m)?.[0];
const envContent = example
  .replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${secret}`)
  .replace(/^DATABASE_URL=.*$/m, initialDatabaseUrl);

try {
  writeFileSync(envPath, envContent, { encoding: "utf8", flag: "wx" });
  console.log("Configuração criada em .env com uma chave JWT aleatória.");
  console.log("Inicie a API com: npm start");
} catch (error) {
  if (error.code === "EEXIST") {
    console.log(".env já existe; nenhuma configuração foi alterada.");
    process.exit(0);
  }
  throw error;
}
