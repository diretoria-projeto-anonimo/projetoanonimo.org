/**
 * Gera o Code.gs da API pública da Biblioteca Viva (PA-LIB-006) a partir de:
 *   src/biblioteca-contract.js  (implementação de referência do contrato)
 *   src/wrapper.gs              (wrapper doGet / roteamento de módulos)
 *
 * Uso: node apps-script/public-api/build-api-gs.cjs
 * Nada é implantado: apenas monta o arquivo para revisão e envio ao Apps Script.
 */
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const lib = fs.readFileSync(path.join(root, "src", "biblioteca-contract.js"), "utf8");
const wrapper = fs.readFileSync(path.join(root, "src", "wrapper.gs"), "utf8");

const banner = [
  "/**",
  " * PA-LIB-006 — Biblioteca Viva · API pública (arquivo gerado)",
  " * NÃO EDITAR À MÃO: rode `node apps-script/public-api/build-api-gs.cjs`.",
  " * Conteúdo: src/biblioteca-contract.js + src/wrapper.gs.",
  " * Fonte canônica do projeto Apps Script da API pública (endpoint institucional).",
  " */",
  "",
].join("\n");

// remove o bloco de exportação CommonJS (o Apps Script não usa module.exports)
const semModulo = lib.replace(/\nif \(typeof module[\s\S]*$/, "\n");
const out = banner + semModulo + "\n" + wrapper;

const destino = path.join(root, "Code.gs");
fs.writeFileSync(destino, out, "utf8");
console.log("apps-script/public-api/Code.gs gerado com", out.split("\n").length, "linhas");
