"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const dashboardHtml = read("editor/dashboard.html");
const dashboardJs = read("editor/assets/js/dashboard.js");
const formHtml = read("editor/novo-material.html");
const formJs = read("editor/assets/js/material-form.js");
const loginHtml = read("editor/login.html");
const authJs = read("editor/assets/js/auth.js");

assert.match(dashboardHtml, /id="filtro-status"/);
assert.match(dashboardJs, /action:\s*"listEditorial"/);
assert.match(dashboardJs, /action:\s*"getMetricsSummary"/);
assert.match(dashboardJs, /novo-material\.html\?slug=/);
assert.match(dashboardJs, />Editar</);
assert.match(dashboardHtml, /id="total-visualizacoes"/);
assert.match(dashboardHtml, /id="total-downloads"/);
assert.match(dashboardHtml, /id="ultima-atividade"/);

const materialJs = read("assets/js/material.js");
assert.match(materialJs, /action:\s*"recordMetric"/);

assert.match(formJs, /action:\s*"getMaterial"/);
assert.match(formJs, /modoEdicao\s*\?\s*"updateMaterial"\s*:\s*"createMaterial"/);
assert.match(formJs, /await carregarMaterial\(\)/);
assert.doesNotMatch(formHtml, /name="editorToken"/);
assert.doesNotMatch(formJs, /paEditorToken|editorToken/);

assert.match(loginHtml, /accounts\.google\.com\/gsi\/client/);
assert.match(loginHtml, /id="google-signin"/);
assert.match(authJs, /googleCredential/);
assert.match(authJs, /requireSession/);
assert.match(dashboardHtml, /id="editor-signout"/);
assert.match(formHtml, /id="editor-signout"/);

for (const html of [dashboardHtml, formHtml]) {
  const configIndex = html.indexOf('src="assets/js/config.js"');
  const authIndex = html.indexOf('src="assets/js/auth.js"');
  const editorIndex = html.indexOf('src="assets/js/editor.js"');
  assert.ok(configIndex >= 0 && configIndex < authIndex && authIndex < editorIndex);
}

console.log("frontend-contract.test.cjs: todos os cenários passaram");
