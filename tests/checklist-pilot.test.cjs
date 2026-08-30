"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const materialJs = fs.readFileSync(
  path.join(root, "assets", "js", "material.js"),
  "utf8"
);
const draft = fs.readFileSync(
  path.join(
    root,
    "docs",
    "editorial",
    "drafts",
    "checklist-diagnostico-digital-v3.1.md"
  ),
  "utf8"
);

assert.match(draft, /checklist-diagnostico-digital-v2\.webp/);
assert.match(draft, /gerada por IA com OpenAI/);
assert.doesNotMatch(draft, /Gemini \(Nano Banana\)/);

const startMarker = "<!-- CONTEUDO_MARKDOWN_INICIO -->";
const endMarker = "<!-- CONTEUDO_MARKDOWN_FIM -->";
const content = draft.split(startMarker)[1]?.split(endMarker)[0]?.trim();
assert.ok(content, "a fonte editorial deve delimitar o conteúdo público");

const sandbox = {
  console,
  URL,
  URLSearchParams,
  Intl,
  Date,
  document: { addEventListener() {} },
  window: { PA_BIBLIOTECA_CONFIG: {} },
};

vm.runInNewContext(
  `${materialJs}\n;globalThis.__checklistPilot = { markdownSeguroParaHtml, validarUrl };`,
  sandbox
);

const { markdownSeguroParaHtml, validarUrl } = sandbox.__checklistPilot;
const taskItems = content.match(/^- \[ \] /gm) || [];
assert.equal(taskItems.length, 25, "o conteúdo deve ter cinco dimensões e 25 itens");

const html = markdownSeguroParaHtml(content, { modoChecklist: true });
assert.equal(
  (html.match(/<fieldset class="diagnostic-checklist-item">/g) || []).length,
  25
);
assert.equal((html.match(/type="radio"/g) || []).length, 100);

const names = [...html.matchAll(/name="(checklist-resposta-\d+)"/g)].map(
  (match) => match[1]
);
assert.equal(new Set(names).size, 25, "cada item deve ter um grupo de resposta único");
for (const value of ["sim", "parcial", "nao", "nao-se-aplica"]) {
  assert.equal(
    (html.match(new RegExp(`value="${value}"`, "g")) || []).length,
    25,
    `cada item deve oferecer a resposta ${value}`
  );
}

assert.match(html, /autocomplete="off"/);
assert.doesNotMatch(html, /<form|localStorage|sessionStorage|fetch\(|data-metrica/);
assert.doesNotMatch(html, /pontua[cç][aã]o autom[aá]tica|nível de maturidade:\s*\d/i);

const genericHtml = markdownSeguroParaHtml("- [ ] Item comum");
assert.doesNotMatch(genericHtml, /diagnostic-checklist-item|type="radio"/);

assert.equal(validarUrl("#como-usar"), "#como-usar");
assert.equal(
  validarUrl("/diagnostico-organizacional.html"),
  "/diagnostico-organizacional.html"
);
assert.equal(validarUrl("https://projetoanonimo.org/"), "https://projetoanonimo.org/");
for (const unsafe of [
  "javascript:alert(1)",
  "data:text/html,teste",
  "#1-invalido",
  "#como usar",
]) {
  assert.equal(validarUrl(unsafe), "", `URL insegura deve ser rejeitada: ${unsafe}`);
}

console.log("checklist-pilot.test.cjs: todos os cenários passaram");
