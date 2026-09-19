"use strict";

/**
 * Sincronia do contrato da Biblioteca Viva.
 *
 * Garante que a versão do contrato declarada em três lugares permaneça igual:
 *   1. frontend  — assets/js/biblioteca-contract.js  (CONTRACT_VERSION)
 *   2. API pública — apps-script/public-api/Code.gs   (CONTRACT_VERSION gerado)
 *   3. fontes da API — apps-script/public-api/src/biblioteca-contract.js
 *
 * Também protege contra truncamento do arquivo gerado: as peças essenciais do
 * contrato e do wrapper precisam continuar presentes.
 *
 * Rode com: node tests/biblioteca-contrato-sync.test.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const ler = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const versaoDe = (fonte) => {
  const m = fonte.match(/CONTRACT_VERSION\s*=\s*"([^"]+)"/);
  assert.ok(m, "CONTRACT_VERSION não encontrado");
  return m[1];
};

const frontend = ler("assets/js/biblioteca-contract.js");
const apiGerada = ler("apps-script/public-api/Code.gs");
const apiFonte = ler("apps-script/public-api/src/biblioteca-contract.js");
const wrapper = ler("apps-script/public-api/src/wrapper.gs");

const vFrontend = versaoDe(frontend);
const vApiGerada = versaoDe(apiGerada);
const vApiFonte = versaoDe(apiFonte);

assert.equal(
  vApiGerada,
  vFrontend,
  `apps-script/public-api/Code.gs está na versão ${vApiGerada} e o frontend em ${vFrontend}: rode node apps-script/public-api/build-api-gs.cjs`,
);
assert.equal(vApiFonte, vFrontend, "src/biblioteca-contract.js divergente do frontend");

// Schema declarado no envelope precisa ser a própria versão do contrato.
assert.match(
  apiGerada,
  /schemaVersion:\s*CONTRACT_VERSION/,
  "o envelope deve declarar schemaVersion: CONTRACT_VERSION",
);

// Peças essenciais do contrato e do wrapper não podem desaparecer.
for (const funcao of [
  "buildEnvelope",
  "buildDetailEnvelope",
  "buildErrorEnvelope",
  "filterItems",
  "normalizeItem",
  "toPublicSummary",
  "isPublished",
  "sanitizeUrl",
  "doGet",
]) {
  assert.ok(
    new RegExp(`function ${funcao}\\(`).test(apiGerada),
    `função ${funcao} ausente no Code.gs gerado`,
  );
}

for (const garantia of ["NOT_FOUND", "MODULE_NOT_FOUND"]) {
  assert.ok(apiGerada.includes(garantia), `código de erro ${garantia} ausente`);
}

// A API pública não pode carregar ações editoriais (projeto distinto do painel).
for (const proibida of ["saveMaterial_", "requireEditor_", "recordEditor_", "doPost"]) {
  assert.ok(
    !new RegExp(`function ${proibida}\\(`).test(apiGerada),
    `a API pública não deve expor ${proibida} (isso é do backend editorial)`,
  );
}

// O wrapper precisa continuar roteando por módulo.
assert.ok(wrapper.includes("module"), "wrapper.gs deve rotear por ?module=");

console.log(
  `biblioteca-contrato-sync: OK (contrato ${vFrontend} igual no frontend, no Code.gs gerado e nas fontes)`,
);
