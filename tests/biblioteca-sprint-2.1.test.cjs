"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const html = read("biblioteca.html");
const mainJs = read("assets/js/main.js");
const materialJs = read("assets/js/material.js");
const version = read("VERSAO.txt");
const manifest = JSON.parse(read("apps-script/appsscript.json"));

for (const id of [
  "ordenacao-select",
  "limpar-filtros",
  "carregar-mais",
  "tentar-novamente",
]) {
  assert.match(html, new RegExp(`id="${id}"`));
}

assert.match(html, /id="biblioteca-lista"[^>]*aria-busy="true"/);
assert.match(html, /assets\/js\/main\.js\?v=1\.6/);
assert.match(html, /assets\/css\/style\.css\?v=1\.7/);

assert.match(mainJs, /const BIBLIOTECA_PAGE_SIZE = 6/);
assert.match(mainJs, /function sortItems\(/);
assert.match(mainJs, /function restoreLibraryFiltersFromUrl\(/);
assert.match(mainJs, /function syncLibraryFiltersToUrl\(/);
assert.match(mainJs, /state\.visibleCount \+= BIBLIOTECA_PAGE_SIZE/);
assert.match(mainJs, /function setLibraryErrorState\(/);
assert.match(mainJs, /skeleton-card/);
assert.match(mainJs, /window\.addEventListener\("popstate"/);

assert.match(materialJs, /version:\s*"1\.2\.0"/);
assert.match(version, /Versão: 1\.3\.0 RC/);

assert.equal(manifest.timeZone, "America/Sao_Paulo");
assert.equal(manifest.runtimeVersion, "V8");
assert.deepEqual(manifest.oauthScopes, [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/script.external_request",
]);

const classList = () => ({
  values: new Set(),
  toggle(name, enabled) {
    if (enabled) this.values.add(name);
    else this.values.delete(name);
  },
});

const elements = new Map([
  ["search-input", { value: "gestão" }],
  ["categoria-select", { value: "" }],
  ["formato-select", { value: "" }],
  ["ordenacao-select", { value: "recentes" }],
  ["biblioteca-lista", { innerHTML: "", setAttribute() {} }],
  ["biblioteca-vazio", { textContent: "", classList: classList() }],
  ["resultado-contador", { textContent: "" }],
  ["biblioteca-status", { textContent: "", classList: classList() }],
  ["carregar-mais", { textContent: "", disabled: false, classList: classList() }],
  ["tentar-novamente", { classList: classList() }],
  ["limpar-filtros", { classList: classList() }],
]);

let replacedUrl = "";
const sandbox = {
  console,
  URL,
  URLSearchParams,
  document: {
    addEventListener() {},
    getElementById(id) {
      return elements.get(id) || null;
    },
  },
  window: {
    addEventListener() {},
    location: {
      href: "https://projetoanonimo.org/biblioteca.html?origem=teste#conteudo",
      search: "?origem=teste",
    },
    history: {
      replaceState(_state, _title, url) {
        replacedUrl = url;
      },
    },
  },
  fetch: async () => {
    throw new Error("fetch não deve ser chamado neste teste");
  },
};

vm.runInNewContext(
  `${mainJs}\n;globalThis.__c01 = { state, sortItems, filterItems, syncLibraryFiltersToUrl };`,
  sandbox
);

const sortedTitles = Array.from(
  sandbox.__c01.sortItems(
    [
      { titulo: "Zeta", ultimaRevisao: "2026-08-01" },
      { titulo: "Alfa", ultimaRevisao: "2026-08-20" },
    ],
    "titulo-asc"
  ),
  (item) => item.titulo
);
assert.deepEqual(sortedTitles, ["Alfa", "Zeta"]);

sandbox.__c01.syncLibraryFiltersToUrl({
  query: "gestão",
  category: "Gestão Digital",
  format: "Guia",
  order: "titulo-asc",
});
assert.match(replacedUrl, /^\/biblioteca\.html\?/);
assert.match(replacedUrl, /origem=teste/);
assert.match(replacedUrl, /busca=gest%C3%A3o/);
assert.match(replacedUrl, /categoria=Gest%C3%A3o\+Digital/);
assert.match(replacedUrl, /formato=Guia/);
assert.match(replacedUrl, /ordem=titulo-asc/);
assert.match(replacedUrl, /#conteudo$/);

sandbox.__c01.state.items = [
  { titulo: "Guia de Gestão", resumo: "Rotina segura", ultimaRevisao: "2026-08-20" },
  { titulo: "Cultura Maker", resumo: "Oficina", ultimaRevisao: "2026-08-21" },
];
sandbox.__c01.filterItems({ syncUrl: false });
assert.equal(sandbox.__c01.state.filtered.length, 1);
assert.equal(sandbox.__c01.state.filtered[0].titulo, "Guia de Gestão");
assert.match(elements.get("biblioteca-lista").innerHTML, /Guia de Gestão/);

console.log("biblioteca-sprint-2.1.test.cjs: todos os cenários passaram");
