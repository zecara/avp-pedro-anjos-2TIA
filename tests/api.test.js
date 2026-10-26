import "dotenv/config";
import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const testDatabaseUrl = process.env.API_TEST_DATABASE_URL;

function isDedicatedTestDatabase(testUrl, configuredUrl) {
  if (!testUrl) return false;

  try {
    const target = new URL(testUrl);
    if (target.protocol !== "mysql:") return false;

    const databaseName = decodeURIComponent(target.pathname.replace(/^\//, ""));
    if (!/(^|[-_])test($|[-_])/i.test(databaseName)) return false;

    if (configuredUrl) {
      const configured = new URL(configuredUrl);
      const normalizeHost = (hostname) => ["localhost", "127.0.0.1", "::1"].includes(hostname.toLowerCase())
        ? "loopback"
        : hostname.toLowerCase();
      const normalizePort = (url) => url.port || "3306";
      const sameDatabase = normalizeHost(target.hostname) === normalizeHost(configured.hostname)
        && normalizePort(target) === normalizePort(configured)
        && decodeURIComponent(target.pathname) === decodeURIComponent(configured.pathname);
      if (sameDatabase) return false;
    }

    return true;
  } catch {
    return false;
  }
}

const testDatabaseReady = isDedicatedTestDatabase(testDatabaseUrl, process.env.DATABASE_URL);
const skipReason = testDatabaseReady
  ? false
  : "Defina API_TEST_DATABASE_URL para um schema MySQL separado cujo nome inclua 'test'; o banco configurado na aplicação não será usado pelos testes.";

const obterPortaLivre = () => new Promise((resolve, reject) => {
  const server = createServer();
  server.once("error", reject);
  server.listen(0, "127.0.0.1", () => {
    const { port } = server.address();
    server.close((error) => error ? reject(error) : resolve(port));
  });
});

const waitForServer = async (url, logs, timeoutMs = 10000) => {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status < 500) return;
    } catch {
      // servidor ainda inicializando
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Servidor não iniciou corretamente. ${logs.join("")}`);
};

const startServer = (port) => {
  const child = spawn("node", ["server.js"], {
    cwd: projectRoot,
    env: {
      ...process.env,
      DATABASE_URL: testDatabaseUrl,
      JWT_SECRET: "test-only-jwt-secret",
      PORT: String(port),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  const logs = [];
  child.stdout.on("data", (chunk) => logs.push(chunk.toString()));
  child.stderr.on("data", (chunk) => logs.push(chunk.toString()));

  return { child, logs };
};

test("login e proteção de rotas em /jogos", { skip: skipReason }, async () => {
  const port = await obterPortaLivre();
  const baseUrl = `http://127.0.0.1:${port}`;
  const emailTeste = `teste-${Date.now()}@teste.com`;
  const { child, logs } = startServer(port);

  try {
    await waitForServer(`${baseUrl}/`, logs);

    const usuarioResponse = await fetch(`${baseUrl}/usuarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: "Teste User",
        email: emailTeste,
        senha: "123456",
      }),
    });

    assert.equal(usuarioResponse.status, 201);

    const loginResponse = await fetch(`${baseUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailTeste,
        senha: "123456",
      }),
    });

    const loginJson = await loginResponse.json();
    assert.equal(loginResponse.status, 200, JSON.stringify(loginJson));
    assert.ok(loginJson.token, "Token deve ser retornado");

    const semTokenResponse = await fetch(`${baseUrl}/jogos`);
    assert.equal(semTokenResponse.status, 401);

    const comTokenResponse = await fetch(`${baseUrl}/jogos`, {
      headers: { Authorization: `Bearer ${loginJson.token}` },
    });

    assert.equal(comTokenResponse.status, 200);

    const ordenarResponse = await fetch(`${baseUrl}/jogos?ordenarPor=anoLancamento`, {
      headers: { Authorization: `Bearer ${loginJson.token}` },
    });
    const jogosOrdenados = await ordenarResponse.json();
    assert.equal(ordenarResponse.status, 200);
    assert.equal(jogosOrdenados[0].anoLancamento, 2010);
    assert.equal(jogosOrdenados.at(-1).anoLancamento, 2022);

    const semCorpoResponse = await fetch(`${baseUrl}/jogos`, {
      method: "POST",
      headers: { Authorization: `Bearer ${loginJson.token}` },
    });
    assert.equal(semCorpoResponse.status, 400);

    const jsonInvalidoResponse = await fetch(`${baseUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{",
    });
    assert.equal(jsonInvalidoResponse.status, 400);

    const alteracaoInvalidaResponse = await fetch(`${baseUrl}/jogos/1`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${loginJson.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ titulo: "Não deve ser aplicado", nota: 11 }),
    });
    assert.equal(alteracaoInvalidaResponse.status, 400);

    const jogoOriginalResponse = await fetch(`${baseUrl}/jogos/1`, {
      headers: { Authorization: `Bearer ${loginJson.token}` },
    });
    const jogoOriginal = await jogoOriginalResponse.json();
    assert.equal(jogoOriginal.titulo, "Red Dead Redemption");
  } finally {
    if (child.exitCode === null && !child.killed) child.kill("SIGTERM");
    if (child.exitCode === null) {
      await Promise.race([
        new Promise((resolve) => child.once("exit", resolve)),
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ]);
    }
    if (child.exitCode === null) {
      child.kill("SIGKILL");
      await new Promise((resolve) => child.once("exit", resolve));
    }
  }
});
