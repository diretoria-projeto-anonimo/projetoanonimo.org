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
const mainJs = read("assets/js/main.js");
const styleCss = read("assets/css/style.css");
assert.match(materialJs, /action:\s*"recordMetric"/);
assert.match(mainJs, /class="card library-card-link"/);
assert.match(mainJs, /isInternalMaterial/);
assert.match(
  mainJs,
  /<span class="card-cta" aria-hidden="true">\$\{cta\}<\/span>/
);
assert.match(materialJs, /material-cover-caption/);
assert.match(materialJs, /material-next-step/);
assert.match(materialJs, /biblioteca-card biblioteca-card-link/);
assert.match(materialJs, /editorial-callout/);
assert.match(styleCss, /\.library-card-link:focus-visible/);
assert.match(styleCss, /\.material-next-step/);
assert.ok(fs.existsSync(path.join(root, "assets/img/library/google-workspace-oscs-v2.webp")));

assert.match(formJs, /action:\s*"getMaterial"/);
assert.match(formJs, /modoEdicao\s*\?\s*"updateMaterial"\s*:\s*"createMaterial"/);
assert.match(formJs, /await carregarMaterial\(\)/);
assert.match(formHtml, /name="altCapa"/);
assert.match(formHtml, /name="creditoCapa"/);
assert.match(formHtml, /name="proximoSlug"/);
assert.match(formJs, /ctaProximoPasso/);
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

const blogHtml = read("blog.html");
const manifestoHtml = read("blog/manifesto-observatorio.html");
const blogCss = read("assets/css/blog.css");
const sitemapXml = read("sitemap.xml");

assert.match(blogHtml, /href="blog\/manifesto-observatorio\.html"/);
assert.match(blogHtml, /article-card__visual--manifesto/);
assert.match(manifestoHtml, /rel="canonical" href="https:\/\/projetoanonimo\.org\/blog\/manifesto-observatorio\.html"/);
assert.match(manifestoHtml, /property="og:image" content="https:\/\/projetoanonimo\.org\/assets\/img\/blog\/manifesto-observatorio-master-v1\.jpg"/);
assert.match(manifestoHtml, /"datePublished":"2026-08-23"/);
assert.match(manifestoHtml, /href="\.\.\/diagnostico-organizacional\.html"/);
assert.match(blogCss, /\.article-card__visual--manifesto/);
assert.match(sitemapXml, /https:\/\/projetoanonimo\.org\/blog\/manifesto-observatorio\.html/);
assert.ok(fs.existsSync(path.join(root, "assets/img/blog/manifesto-observatorio-master-v1.jpg")));

console.log("frontend-contract.test.cjs: todos os cenários passaram");
