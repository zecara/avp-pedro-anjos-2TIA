import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));

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
    env: { ...process.env, JWT_SECRET: "test-only-jwt-secret", PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  });

  const logs = [];
  child.stdout.on("data", (chunk) => logs.push(chunk.toString()));
  child.stderr.on("data", (chunk) => logs.push(chunk.toString()));

  return { child, logs };
};

test("login e proteção de rotas em /jogos", async () => {
  const port = await obterPortaLivre();
  const baseUrl = `http://127.0.0.1:${port}`;
  const { child, logs } = startServer(port);

  try {
    await waitForServer(`${baseUrl}/`, logs);

    const usuarioResponse = await fetch(`${baseUrl}/usuarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: "Teste User",
        email: "teste@teste.com",
        senha: "123456",
      }),
    });

    assert.equal(usuarioResponse.status, 201);

    const loginResponse = await fetch(`${baseUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "teste@teste.com",
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
    child.kill("SIGTERM");
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (!child.killed) child.kill("SIGKILL");
  }
});
