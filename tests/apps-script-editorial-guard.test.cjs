"use strict";

/**
 * Guarda do backend editorial (painel editor/).
 *
 * O backend editorial é um projeto Apps Script separado da API pública. Este teste
 * protege contra:
 *   1. remoção/renomeação das funções que o painel e o fluxo editorial consomem;
 *   2. mistura de responsabilidades (o backend editorial não deve implementar o
 *      contrato público da Biblioteca Viva, que vive em apps-script/public-api);
 *   3. quebra de sintaxe no arquivo (o Apps Script falha inteiro se houver erro).
 *
 * A verificação de sincronia com a produção é manual e está documentada em
 * apps-script/CONFIGURAR.md (clasp pull + comparação).
 *
 * Rode com: node tests/apps-script-editorial-guard.test.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const fonte = fs.readFileSync(path.join(root, "apps-script", "Code.gs"), "utf8");

// 1. Funções essenciais do backend editorial.
const obrigatorias = [
  "doPost",                 // entrada das ações editoriais
  "requireEditor_",         // autorização por e-mail permitido
  "listEditorial_",         // listagem do painel
  "saveMaterial_",          // gravação de material
  "getMaterial_",           // leitura de material
  "recordMetric_",          // métricas públicas
  "getMetricsSummary_",     // resumo de métricas
  "diagnosticarConfiguracao", // verificação de propriedades
  "uploadFile_",            // upload de capas/anexos
];
for (const fn of obrigatorias) {
  assert.ok(
    new RegExp(`function ${fn}\\(`).test(fonte),
    `função ${fn} ausente no backend editorial`,
  );
}

// 2. Separação de responsabilidades: o contrato público não pertence a este arquivo.
for (const proibida of ["buildEnvelope", "buildDetailEnvelope", "toPublicSummary", "parseEnvelope"]) {
  assert.ok(
    !new RegExp(`function ${proibida}\\(`).test(fonte),
    `o backend editorial não deve implementar ${proibida} (isso é de apps-script/public-api)`,
  );
}

// 3. Ações editoriais continuam exigindo credencial.
assert.match(fonte, /requireEditor_\(/, "as ações editoriais devem continuar exigindo credencial");
assert.match(fonte, /ALLOWED_EDITOR_EMAILS/, "a lista de e-mails permitidos deve continuar sendo usada");

// 4. Sintaxe válida: o Apps Script não sobe um projeto com erro de parsing.
assert.doesNotThrow(() => {
  new vm.Script(fonte, { filename: "apps-script/Code.gs" });
}, "apps-script/Code.gs tem erro de sintaxe");

console.log(
  `apps-script-editorial-guard: OK (${obrigatorias.length} funções essenciais, separação do contrato público e sintaxe válida)`,
);
