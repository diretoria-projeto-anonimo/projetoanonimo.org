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
const materialHtml = read("biblioteca/material.html");
const bibliotecaHtml = read("biblioteca.html");
const indexHtml = read("index.html");
const checklistDraft = read(
  "docs/editorial/drafts/checklist-diagnostico-digital-v3.1.md"
);
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
assert.match(materialJs, /ctaDestino/);
assert.match(materialJs, /urlProximoPasso/);
assert.match(materialJs, /checklist-diagnostico-digital-v2\.webp/);
assert.match(materialJs, /ia-organizacoes-sociais-v2\.webp/);
assert.match(materialJs, /plano-30-dias-organizacao-digital-v2\.webp/);
assert.match(materialJs, /Imagem ilustrativa gerada por IA com OpenAI/);
assert.match(materialJs, /criarMetadado\("Etapa da jornada", etapaJornada\)/);
assert.match(materialJs, /"altCapa",\s*"textoAlternativoDaCapa"/);
assert.match(materialJs, /diagnostic-checklist-item/);
assert.match(materialJs, /modoChecklist/);
assert.match(styleCss, /\.library-card-link:focus-visible/);
assert.match(styleCss, /\.material-next-step/);
assert.match(styleCss, /\.diagnostic-checklist-option:focus-within/);
assert.match(styleCss, /\.diagnostic-checklist-option:has\(input:checked\)/);
assert.match(materialHtml, /style\.css\?v=1\.7/);
assert.match(materialHtml, /material\.js\?v=2\.1/);
assert.match(bibliotecaHtml, /style\.css\?v=1\.7/);
assert.match(bibliotecaHtml, /assets\/js\/main\.js\?v=[0-9.]+/);
assert.match(indexHtml, /assets\/js\/main\.js\?v=[0-9.]+/);
assert.match(mainJs, /checklist-diagnostico-digital-v2\.webp/);
assert.equal(
  (checklistDraft.match(/^- \[ \] /gm) || []).length,
  25,
  "o Piloto 02 deve manter exatamente 25 itens observáveis"
);
assert.ok(fs.existsSync(path.join(root, "assets/img/library/google-workspace-oscs-v2.webp")));
assert.ok(fs.existsSync(path.join(root, "assets/img/library/checklist-diagnostico-digital-v2.png")));
assert.ok(fs.existsSync(path.join(root, "assets/img/library/checklist-diagnostico-digital-v2.webp")));
assert.ok(fs.existsSync(path.join(root, "assets/img/library/ia-organizacoes-sociais-v2.png")));
assert.ok(fs.existsSync(path.join(root, "assets/img/library/ia-organizacoes-sociais-v2.webp")));
assert.ok(fs.existsSync(path.join(root, "assets/img/library/plano-30-dias-organizacao-digital-v2.png")));
assert.ok(fs.existsSync(path.join(root, "assets/img/library/plano-30-dias-organizacao-digital-v2.webp")));

assert.match(formJs, /action:\s*"getMaterial"/);
assert.match(formJs, /modoEdicao\s*\?\s*"updateMaterial"\s*:\s*"createMaterial"/);
assert.match(formJs, /await carregarMaterial\(\)/);
assert.match(formHtml, /name="altCapa"/);
assert.match(formHtml, /name="creditoCapa"/);
assert.match(formHtml, /name="proximoSlug"/);
assert.match(formHtml, /name="urlProximoPasso"/);
assert.match(formHtml, /name="ctaDestino"/);
assert.match(formHtml, /name="tituloSeo"/);
assert.match(formHtml, /name="descricaoSeo"/);
assert.match(formJs, /ctaProximoPasso/);
assert.match(formJs, /urlProximoPasso/);
assert.match(formJs, /ctaDestino/);
assert.match(formJs, /tituloSeo/);
assert.match(formJs, /descricaoSeo/);
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

// --- conteudo institucional versionado (projetos e solucoes) ---
const conteudoEstaticoPath = path.join(root, "assets/data/site-content.json");
assert.ok(
  fs.existsSync(conteudoEstaticoPath),
  "assets/data/site-content.json deve existir (fonte da verdade do conteudo institucional)"
);
const conteudoEstatico = JSON.parse(fs.readFileSync(conteudoEstaticoPath, "utf8"));

for (const modulo of ["projetos", "solucoes"]) {
  const blocoModulo = conteudoEstatico[modulo];
  assert.ok(blocoModulo && Array.isArray(blocoModulo.items), `site-content.json: ${modulo}.items`);
  assert.ok(blocoModulo.items.length >= 6, `${modulo}: esperado ao menos 6 itens publicados`);

  for (const item of blocoModulo.items) {
    assert.ok(item.ID, `${modulo}: item sem ID`);
    assert.ok(item["Título"], `${modulo}: item sem Título`);
    assert.ok(item["Público"], `${modulo}: item sem Público`);
    assert.ok(item.Resumo, `${modulo}: item sem Resumo`);
    assert.ok(item.CTA, `${modulo}: item sem CTA`);
    assert.ok(item.URL, `${modulo}: item sem URL`);
    assert.equal(
      String(item.Status).trim().toLowerCase(),
      "publicado",
      `${modulo}: somente itens publicados entram no arquivo`
    );
  }
}

// as solucoes usam capa oficial mapeada por titulo em main.js
const mapaCapas = mainJs.match(/const SOLUTION_COVER_IMAGES = Object\.freeze\(\{([\s\S]*?)\}\);/);
assert.ok(mapaCapas, "SOLUTION_COVER_IMAGES deve existir em main.js");
for (const item of conteudoEstatico.solucoes.items) {
  assert.ok(
    mapaCapas[1].includes(`"${item["Título"]}"`),
    `sem capa mapeada para a solucao: ${item["Título"]}`
  );
}

// a pagina anuncia 6 projetos disponiveis: o conteudo precisa cobrir esse numero
assert.match(read("projetos.html"), /id="projetos-contador">6 projetos disponíveis/);

// config canonica versionada (o modulo config do CMS historico tinha links quebrados)
assert.ok(conteudoEstatico.config && typeof conteudoEstatico.config === "object");
assert.match(conteudoEstatico.config.youtube, /^https:\/\/www\.youtube\.com\/channel\//);
assert.doesNotMatch(conteudoEstatico.config.youtube, /projetoanonimoorg/);
assert.match(conteudoEstatico.config.email, /^[^@]+@projetoanonimo\.org$/);

// fallback estatico implementado no front-end
assert.match(mainJs, /CONTEUDO_ESTATICO_URL = "assets\/data\/site-content\.json"/);
assert.match(mainJs, /async function fetchModuloEstatico\(moduleKey\)/);
assert.match(mainJs, /error\.moduloAusente = true/);
assert.doesNotMatch(mainJs, /fetchModulo\("config", \{ raw: true \}\)/);

// o conteudo versionado tem precedencia sobre a API (sem esperar a rede)
const posicaoEstatico = mainJs.indexOf("const estatico = await fetchModuloEstatico(moduleKey);");
const posicaoApi = mainJs.indexOf("const response = await fetch(url);");
assert.ok(posicaoEstatico > 0, "fetchModulo deve consultar o conteudo versionado");
assert.ok(
  posicaoEstatico < posicaoApi,
  "o conteudo versionado deve ser consultado antes da API publica"
);

// links internos do proprio site sao aceitos (senao o CTA do card desaparece)
assert.match(mainJs, /function isRelativeUrl\(value\) \{/);
assert.match(mainJs, /function isInternalUrl\(value\) \{/);
assert.match(mainJs, /return isRelativeUrl\(trimmed\) \? escapeHTML\(trimmed\) : "#";/);
assert.match(
  mainJs,
  /const targetAttrs = hasUrl && !isInternalUrl\(url\) \? "target=\\"_blank\\" rel=\\"noopener\\"" : "";/
);

// os cards de projeto e solucao apontam para paginas internas
for (const item of [...conteudoEstatico.projetos.items, ...conteudoEstatico.solucoes.items]) {
  assert.match(
    item.URL,
    /^[a-z0-9._-]+\.html$/i,
    `URL interna esperada no item ${item.ID}: ${item.URL}`
  );
}

// todas as paginas carregam a mesma versao do bundle
const versoesMainJs = new Set();
for (const pagina of fs.readdirSync(root).filter((nome) => nome.endsWith(".html"))) {
  const versao = read(pagina).match(/assets\/js\/main\.js\?v=([0-9.]+)/);
  if (versao) versoesMainJs.add(versao[1]);
}
assert.equal(
  versoesMainJs.size,
  1,
  `versoes divergentes de assets/js/main.js: ${[...versoesMainJs].join(", ")}`
);
console.log("frontend-contract.test.cjs: todos os cenários passaram");
