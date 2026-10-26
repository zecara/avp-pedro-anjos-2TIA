import test from "node:test";
import assert from "node:assert/strict";
import { detectarTipoImagem } from "../lib/imageTypes.js";

test("reconhece assinaturas de imagem suportadas", () => {
  assert.equal(detectarTipoImagem(Buffer.from([0xff, 0xd8, 0xff, 0x00])), "image/jpeg");
  assert.equal(
    detectarTipoImagem(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0x00])),
    "image/png",
  );
  assert.equal(
    detectarTipoImagem(Buffer.from("RIFF0000WEBP", "ascii")),
    "image/webp",
  );
});

test("rejeita assinatura desconhecida ou incompleta", () => {
  assert.equal(detectarTipoImagem(Buffer.from("not-an-image")), null);
  assert.equal(detectarTipoImagem(Buffer.from([0xff, 0xd8])), null);
  assert.equal(detectarTipoImagem(Buffer.from("RIFF0000NOPE", "ascii")), null);
});
