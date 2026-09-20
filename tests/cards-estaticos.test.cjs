"use strict";

/**
 * Contrato dos cards estáticos de Projetos e Soluções.
 *
 * O conteúdo vive em `assets/data/site-content.json` e é escrito nas páginas
 * por `tools/gerar-cards-estaticos.cjs`. Estes testes garantem que:
 *   1. o HTML está em sincronia com o JSON (o que garante o conteúdo sem JS);
 *   2. cada item aparece na página com seus campos e CTA;
 *   3. os filtros e o contador também estão no HTML;
 *   4. o JavaScript filtra os cards existentes em vez de recriar a lista.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const raiz = path.join(__dirname, "..");
const ler = (relativo) => fs.readFileSync(path.join(raiz, relativo), "utf8");

const gerador = require("../tools/gerar-cards-estaticos.cjs");
const conteudo = JSON.parse(ler("assets/data/site-content.json"));
const projetosHtml = ler("projetos.html");
const solucoesHtml = ler("solucoes.html");
const mainJs = ler("assets/js/main.js");
const styleCss = ler("assets/css/style.css");

const { escapeHTML } = gerador;

// 1) HTML em sincronia com o conteudo versionado
const gerado = gerador.gerar();
assert.equal(
  projetosHtml,
  gerado["projetos.html"],
  "projetos.html divergente de site-content.json: rode `node tools/gerar-cards-estaticos.cjs`"
);
assert.equal(
  solucoesHtml,
  gerado["solucoes.html"],
  "solucoes.html divergente de site-content.json: rode `node tools/gerar-cards-estaticos.cjs`"
);

// 2) conteudo presente no HTML (vale para quem nao executa JavaScript)
assert.equal(
  (projetosHtml.match(/<article class="project-card"/g) || []).length,
  conteudo.projetos.items.length,
  "um card por projeto publicado"
);
assert.equal(
  (solucoesHtml.match(/<article class="project-card solution-card"/g) || []).length,
  conteudo.solucoes.items.length,
  "um card por solucao publicada"
);

for (const item of conteudo.projetos.items) {
  const titulo = item["Título"];
  assert.ok(projetosHtml.includes(`<h3>${escapeHTML(titulo)}</h3>`), `projeto ausente: ${titulo}`);
  assert.ok(
    projetosHtml.includes(`data-area="${escapeHTML(item["Área"])}"`),
    `area ausente no card: ${titulo}`
  );
  assert.ok(
    projetosHtml.includes(`data-publico="${escapeHTML(item["Público"])}"`),
    `publico ausente no card: ${titulo}`
  );
  assert.ok(
    projetosHtml.includes(`data-resumo="${escapeHTML(item.Resumo)}"`),
    `resumo ausente no card: ${titulo}`
  );
  assert.ok(
    projetosHtml.includes(`href="${escapeHTML(item.URL)}">${escapeHTML(item.CTA)}</a>`),
    `CTA ausente no card: ${titulo}`
  );
}

for (const item of conteudo.solucoes.items) {
  const titulo = item["Título"];
  assert.ok(solucoesHtml.includes(`<h3>${escapeHTML(titulo)}</h3>`), `solucao ausente: ${titulo}`);
  assert.ok(
    solucoesHtml.includes(`data-categoria="${escapeHTML(item["Categoria"])}"`),
    `categoria ausente no card: ${titulo}`
  );

  const capa = gerador.CAPAS_SOLUCOES[titulo];
  assert.ok(capa, `solucao sem capa mapeada: ${titulo}`);
  assert.ok(
    solucoesHtml.includes(`<img src="${capa}"`),
    `capa ausente no card: ${titulo}`
  );
  assert.ok(
    fs.existsSync(path.join(raiz, capa)),
    `arquivo de capa inexistente: ${capa}`
  );
  assert.ok(mainJs.includes(capa), `capa ${capa} deve constar tambem em main.js`);
}

// 3) filtros e contador no HTML
const areas = gerador.valoresUnicos(conteudo.projetos.items, ["area", "Área"]);
const publicos = gerador.valoresUnicos(conteudo.projetos.items, ["publico", "Público"]);
const categorias = gerador.valoresUnicos(conteudo.solucoes.items, ["categoria", "Categoria"]);

for (const area of areas) {
  assert.ok(projetosHtml.includes(`<option value="${escapeHTML(area)}">`), `opcao de area ausente: ${area}`);
}
for (const publico of publicos) {
  assert.ok(
    projetosHtml.includes(`<option value="${escapeHTML(publico)}">`),
    `opcao de publico ausente: ${publico}`
  );
}
for (const categoria of categorias) {
  assert.ok(
    solucoesHtml.includes(`<option value="${escapeHTML(categoria)}">`),
    `opcao de categoria ausente: ${categoria}`
  );
}

const totalProjetos = conteudo.projetos.items.length;
const totalSolucoes = conteudo.solucoes.items.length;
assert.ok(
  projetosHtml.includes(`<p id="projetos-contador">${totalProjetos} projetos disponíveis • ${totalProjetos} no total</p>`),
  "contador de projetos incorreto no HTML"
);
assert.ok(
  solucoesHtml.includes(`<p id="solucoes-contador">${totalSolucoes} soluções disponíveis • ${totalSolucoes} no total</p>`),
  "contador de solucoes incorreto no HTML"
);

// 4) o JavaScript filtra os cards existentes
assert.match(mainJs, /function lerCardsEstaticos\(list, seletor, campoCategoria\)/);
assert.match(mainJs, /lerCardsEstaticos\(list, "article\.project-card", "area"\)/);
assert.match(mainJs, /lerCardsEstaticos\(list, "article\.solution-card", "categoria"\)/);
assert.match(mainJs, /item\.elemento\.hidden = !visiveis\.has\(item\)/);
assert.match(mainJs, /state\.projects\.some\(\(item\) => item && item\.elemento\)/);
assert.match(mainJs, /state\.solutions\.some\(\(item\) => item && item\.elemento\)/);
assert.match(styleCss, /\[hidden\] \{\s*display: none !important;/);

console.log("cards-estaticos.test.cjs: todos os cenários passaram");
