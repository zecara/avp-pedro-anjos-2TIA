import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const examplePath = fileURLToPath(new URL("../.env.example", import.meta.url));
const envPath = fileURLToPath(new URL("../.env", import.meta.url));

if (existsSync(envPath)) {
  console.log(".env já existe; nenhuma configuração foi alterada.");
  process.exit(0);
}

const example = readFileSync(examplePath, "utf8");
if (!/^JWT_SECRET=.*$/m.test(example)) {
  throw new Error(".env.example precisa conter uma linha JWT_SECRET.");
}

const secret = randomBytes(32).toString("hex");
const envContent = example.replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${secret}`);

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
