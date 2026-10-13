/**
 * Teste de integração da API de referência (dist/Code.gs) com o catálogo REAL
 * (evidência do endpoint em produção convertida em planilha simulada).
 * Executa com: node --test tests/api-referencia.test.cjs
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const EVIDENCE = path.join(__dirname, "fixtures", "pa-lib");
const catalogo = JSON.parse(
  fs.readFileSync(path.join(EVIDENCE, "01_catalogo_completo.json"), "utf8")
);
const DIST = path.join(__dirname, "..", "apps-script", "public-api", "Code.gs");

/** Monta a planilha simulada: cabeçalho com as COLUNAS ORIGINAIS + linhas. */
function planilhaSimulada(items) {
  const headers = Object.keys(items[0]);
  const rows = items.map((item) => headers.map((h) => String(item[h] == null ? "" : item[h])));
  return [headers].concat(rows);
}

function criarApi() {
  const code = fs.readFileSync(DIST, "utf8");
  let ultimaResposta = null;
  const contexto = {
    console,
    URL,
    Date,
    JSON,
    Math,
    Object,
    Array,
    String,
    Number,
    RegExp,
    Error,
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (k) => (k === "SHEET_NAME" ? "Biblioteca" : null),
      }),
    },
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ({
        getSheetByName: (name) =>
          name === "Biblioteca"
            ? { getDataRange: () => ({ getDisplayValues: () => planilhaSimulada(catalogo.items) }) }
            : null,
      }),
    },
    ContentService: {
      MimeType: { JSON: "application/json" },
      createTextOutput: (body) => ({
        setMimeType: () => {
          ultimaResposta = JSON.parse(body);
          return ultimaResposta;
        },
      }),
    },
  };
  contexto.globalThis = contexto;
  vm.createContext(contexto);
  vm.runInContext(code, contexto, { filename: "dist/Code.gs" });
  return {
    doGet: (params) => {
      contexto.doGet({ parameter: params });
      return ultimaResposta;
    },
  };
}

test("API de referência: catálogo completo com envelope v1", () => {
  const api = criarApi();
  const r = api.doGet({ module: "biblioteca" });
  assert.equal(r.schemaVersion, "1.0.0");
  assert.equal(r.ok, true);
  assert.equal(r.module, "Biblioteca Viva");
  assert.equal(r.count, 4);
  assert.equal(r.totalPublished, 4);
  assert.equal(r.items.length, 4);
  assert.equal(typeof r.generatedAt, "string");
});

test("API de referência: filtros ignorados hoje passam a funcionar", () => {
  const api = criarApi();
  assert.equal(api.doGet({ module: "biblioteca", destaque: "true" }).count, 3);
  assert.equal(api.doGet({ module: "biblioteca", busca: "Google" }).items[0].id, "PA-LIB-002");
  assert.equal(
    api.doGet({ module: "biblioteca", categoria: "Inteligencia Artificial" }).items[0].id,
    "PA-LIB-001"
  );
  assert.equal(api.doGet({ module: "biblioteca", formato: "Guia" }).items[0].id, "PA-LIB-002");
  assert.equal(api.doGet({ module: "biblioteca", busca: "Organização" }).count, 3);
  assert.equal(api.doGet({ module: "biblioteca", busca: "inexistente-xyz" }).count, 0);
});

test("API de referência: detalhe por slug e por id, com markdown preservado", () => {
  const api = criarApi();
  const porSlug = api.doGet({ module: "biblioteca", slug: "ia-para-organizacoes-sociais" });
  assert.equal(porSlug.ok, true);
  assert.equal(porSlug.item.id, "PA-LIB-001");
  assert.ok(porSlug.item.conteudoMarkdown.length > 100);
  assert.equal(porSlug.totalPublished, 4);

  const porId = api.doGet({ module: "biblioteca", slug: "PA-LIB-004" });
  assert.equal(porId.item.slug, "plano-30-dias-organizacao-digital");

  const ausente = api.doGet({ module: "biblioteca", slug: "nao-existe-xyz" });
  assert.equal(ausente.ok, false);
  assert.equal(ausente.code, "NOT_FOUND");
});

test("API de referência: módulo inválido devolve MODULE_NOT_FOUND", () => {
  const api = criarApi();
  const r = api.doGet({ module: "naoexiste" });
  assert.equal(r.ok, false);
  assert.equal(r.code, "MODULE_NOT_FOUND");
});

test("API de referência: rascunho nunca é exposto ao público", () => {
  const api = criarApi();
  const r = api.doGet({ module: "biblioteca" });
  r.items.forEach((item) => assert.equal(item.status.toLowerCase(), "publicado"));
  assert.ok(!JSON.stringify(r).includes("ouid"), "URLs higienizadas");
});
