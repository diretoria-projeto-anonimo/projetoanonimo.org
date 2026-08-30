"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const materialJs = fs.readFileSync(path.join(root, "assets", "js", "material.js"), "utf8");
const draft = fs.readFileSync(path.join(root, "docs", "editorial", "drafts", "plano-30-dias-organizacao-digital.md"), "utf8");

const startMarker = "<!-- CONTEUDO_MARKDOWN_INICIO -->";
const endMarker = "<!-- CONTEUDO_MARKDOWN_FIM -->";
const content = draft.split(startMarker)[1]?.split(endMarker)[0]?.trim();
assert.ok(content, "a fonte editorial deve delimitar o conteúdo público");

const sandbox = { console, URL, URLSearchParams, Intl, Date, document: { addEventListener() {} }, window: { PA_BIBLIOTECA_CONFIG: {} } };
vm.runInNewContext(`${materialJs}\n;globalThis.__plano30 = { MATERIAL_EDITORIAL_DEFAULTS, markdownSeguroParaHtml };`, sandbox);

const { MATERIAL_EDITORIAL_DEFAULTS, markdownSeguroParaHtml } = sandbox.__plano30;
const defaults = MATERIAL_EDITORIAL_DEFAULTS["plano-30-dias-organizacao-digital"];

assert.equal(defaults.urlCapa, "../assets/img/library/plano-30-dias-organizacao-digital-v2.webp");
assert.equal(defaults.ctaDestino, "#preparar");
assert.equal(defaults.proximoSlug, "checklist-diagnostico-digital");
assert.match(defaults.creditoCapa, /gerada por IA com OpenAI/);
assert.match(draft, /Versão:\*\* 3\.1-piloto/);
assert.match(draft, /URL do formulário:\*\* vazio/);
assert.match(draft, /quatro semanas/i);
assert.match(draft, /Sem rostos, pessoas, mãos, partes do corpo/i);

const html = markdownSeguroParaHtml(content);
assert.match(html, /id="preparar"|<h2>Como preparar o plano<\/h2>/);
for (let semana = 1; semana <= 4; semana += 1) assert.match(html, new RegExp(`Semana ${semana}`));
assert.match(html, /editorial-callout/);
assert.equal((content.match(/^- \[ \] /gm) || []).length, 16, "o plano deve manter exatamente 16 ações distribuídas nas quatro semanas");
assert.doesNotMatch(html, /diagnostic-checklist-item|type="radio"|<form/);
assert.doesNotMatch(content, /compartilhe senha|copie senha|exclusão em massa/i);
assert.doesNotMatch(content, /@[a-z0-9.-]+\.[a-z]{2,}/i);
assert.doesNotMatch(content, /\b(?:\d[ .-]?){10,11}\b/);
assert.ok(fs.existsSync(path.join(root, "assets", "img", "library", "plano-30-dias-organizacao-digital-v2.png")));
assert.ok(fs.existsSync(path.join(root, "assets", "img", "library", "plano-30-dias-organizacao-digital-v2.webp")));

console.log("plano-30-dias-pilot.test.cjs: todos os cenários passaram");
