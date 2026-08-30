"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const materialJs = fs.readFileSync(
  path.join(__dirname, "..", "assets", "js", "material.js"),
  "utf8"
);

const sandbox = {
  console,
  URL,
  URLSearchParams,
  Intl,
  Date,
  document: {
    addEventListener() {},
  },
  window: {
    PA_BIBLIOTECA_CONFIG: {},
  },
};

vm.runInNewContext(
  `${materialJs}\n;globalThis.__materialRenderer = { formatarData, markdownSeguroParaHtml };`,
  sandbox
);

const { formatarData, markdownSeguroParaHtml } = sandbox.__materialRenderer;

assert.equal(formatarData("2026-08-30T00:00:00.000Z"), "30/08/2026");

const html = markdownSeguroParaHtml([
  "#### Entrada",
  "",
  "```text",
  "00_INSTITUCIONAL",
  "  01_GOVERNANCA",
  "```",
  "",
  "**CTA:** `Fazer o checklist →`",
].join("\n"));

assert.match(html, /<h4>Entrada<\/h4>/);
assert.match(
  html,
  /<pre><code>00_INSTITUCIONAL\n  01_GOVERNANCA\n<\/code><\/pre>/
);
assert.match(html, /<strong>CTA:<\/strong> <code>Fazer o checklist →<\/code>/);
assert.doesNotMatch(html, /```|####/);

console.log("material-renderer.test.cjs: todos os cenários passaram");

