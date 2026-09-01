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
    "ia-para-organizacoes-sociais-v3.1.md"
  ),
  "utf8"
);

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
  `${materialJs}\n;globalThis.__iaPilot = { MATERIAL_EDITORIAL_DEFAULTS, markdownSeguroParaHtml };`,
  sandbox
);

const { MATERIAL_EDITORIAL_DEFAULTS, markdownSeguroParaHtml } =
  sandbox.__iaPilot;
const defaults = MATERIAL_EDITORIAL_DEFAULTS["ia-para-organizacoes-sociais"];

assert.equal(defaults.urlCapa, "../assets/img/library/ia-organizacoes-sociais-v2.webp");
assert.equal(defaults.ctaDestino, "#como-usar");
assert.equal(defaults.proximoSlug, "google-workspace-para-oscs");
assert.match(defaults.creditoCapa, /gerada por IA com OpenAI/);

assert.match(draft, /Versão:\*\* 3\.1-piloto/);
assert.match(draft, /URL do formulário:\*\* vazio/);
assert.match(draft, /ia-organizacoes-sociais-v2\.webp/);
assert.match(draft, /absolutamente no faces|sem rostos/i);

const html = markdownSeguroParaHtml(content);
assert.match(html, /id="como-usar"|<h2>Como usar<\/h2>/);
assert.match(html, /<pre><code>Task:|<pre><code>Tarefa:/);
assert.match(html, /editorial-callout/);
assert.equal((content.match(/^- \[ \] /gm) || []).length, 7);
assert.doesNotMatch(html, /diagnostic-checklist-item|type="radio"|<form/);
assert.doesNotMatch(content, /@[a-z0-9.-]+\.[a-z]{2,}/i);
assert.doesNotMatch(content, /\b(?:\d[ .-]?){10,11}\b/);

assert.ok(
  fs.existsSync(
    path.join(root, "assets", "img", "library", "ia-organizacoes-sociais-v2.png")
  )
);
assert.ok(
  fs.existsSync(
    path.join(root, "assets", "img", "library", "ia-organizacoes-sociais-v2.webp")
  )
);

console.log("ia-pilot.test.cjs: todos os cenários passaram");
