import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";

const waitForServer = async (url, timeoutMs = 10000) => {
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
  throw new Error("Servidor não iniciou corretamente.");
};

const startServer = () => {
  const child = spawn("node", ["server.js"], {
    cwd: process.cwd(),
    stdio: ["ignore", "pipe", "pipe"],
  });

  const logs = [];
  child.stdout.on("data", (chunk) => logs.push(chunk.toString()));
  child.stderr.on("data", (chunk) => logs.push(chunk.toString()));

  return { child, logs };
};

test("login e proteção de rotas em /jogos", async () => {
  const { child, logs } = startServer();

  try {
    await waitForServer("http://localhost:3000/");

    const usuarioResponse = await fetch("http://localhost:3000/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: "Teste User",
        email: "teste@teste.com",
        senha: "123456",
      }),
    });

    assert.equal(usuarioResponse.status, 201);

    const loginResponse = await fetch("http://localhost:3000/login", {
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

    const semTokenResponse = await fetch("http://localhost:3000/jogos");
    assert.equal(semTokenResponse.status, 401);

    const comTokenResponse = await fetch("http://localhost:3000/jogos", {
      headers: { Authorization: `Bearer ${loginJson.token}` },
    });

    assert.equal(comTokenResponse.status, 200);
  } finally {
    child.kill("SIGTERM");
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (!child.killed) child.kill("SIGKILL");
  }
});
