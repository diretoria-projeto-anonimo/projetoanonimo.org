/**
 * Teste de integração da API de referência (apps-script/public-api/Code.gs) com o
 * catálogo REAL (evidência do endpoint em produção convertida em planilha simulada).
 * Executa com: node --test tests/api-referencia.test.cjs
 *
 * CAMINHOS adaptados do sandbox `sandbox/biblioteca-viva/` para o layout do repo.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const EVIDENCE = path.join(__dirname, "fixtures", "pa-lib-audit", "evidence");
const catalogo = JSON.parse(
  fs.readFileSync(path.join(EVIDENCE, "01_catalogo_completo.json"), "utf8")
);
const DIST = path.join(__dirname, "..", "apps-script", "public-api", "Code.gs");

/** Monta a planilha simulada: cabeçalho com as COLUNAS ORIGINAIS + linhas. */
function planilhaSimulada(items) {
  // União das colunas: um item extra pode trazer campos que o primeiro não tem.
  const headers = [...new Set(items.flatMap((item) => Object.keys(item)))];
  const rows = items.map((item) => headers.map((h) => String(item[h] == null ? "" : item[h])));
  return [headers].concat(rows);
}

function criarApi(extras = {}, props = {}) {
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
        getProperty: (k) =>
          k === "SHEET_NAME" ? "Biblioteca" : props[k] !== undefined ? props[k] : null,
      }),
    },
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ({
        getSheetByName: (name) =>
          name === "Biblioteca"
            ? {
                getDataRange: () => ({
                  getDisplayValues: () =>
                    planilhaSimulada(catalogo.items.concat(extras.items || [])),
                }),
              }
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

/* =====================================================================
   Acesso restrito — PA-BRD-001 (Manual de Marca e Design System)
   ===================================================================== */

/** Item restrito de teste: o slug real, com conteúdo reconhecível. */
function itemRestrito(overrides = {}) {
  return Object.assign(
    {},
    catalogo.items[0],
    {
      ID: "PA-BRD-001",
      Slug: "manual-de-marca-e-design-system",
      Título: "Manual de Marca e Design System",
      Status: "Publicado",
      "Conteúdo Markdown":
        "# CONTEUDO-INTERNO-DO-MANUAL-DE-MARCA — não pode sair na API pública",
    },
    overrides
  );
}

test("acesso restrito: item não aparece na listagem nem em totalPublished", () => {
  const api = criarApi({ items: [itemRestrito()] });
  const r = api.doGet({ module: "biblioteca" });

  assert.equal(r.ok, true);
  assert.equal(r.totalPublished, 4, "o restrito não conta como publicado");
  assert.equal(r.count, 4);
  assert.ok(
    !r.items.some((i) => i.slug === "manual-de-marca-e-design-system"),
    "o slug restrito não pode estar na listagem"
  );
  assert.ok(
    !JSON.stringify(r).includes("CONTEUDO-INTERNO-DO-MANUAL-DE-MARCA"),
    "nenhum fragmento do conteúdo restrito pode aparecer na listagem"
  );
});

test("acesso restrito: detalhe responde AUTH_REQUIRED e não devolve corpo", () => {
  const api = criarApi({ items: [itemRestrito()] });
  const r = api.doGet({ module: "biblioteca", slug: "manual-de-marca-e-design-system" });

  assert.equal(r.ok, false);
  assert.equal(r.code, "AUTH_REQUIRED");
  assert.equal(r.restricted, true);
  assert.equal(r.item, undefined, "não pode vir item");
  assert.equal(r.items, undefined, "não pode vir lista");

  const serializado = JSON.stringify(r);
  ["CONTEUDO-INTERNO-DO-MANUAL-DE-MARCA", "conteudoMarkdown", "Manual de Marca"].forEach(
    (proibido) => {
      assert.ok(!serializado.includes(proibido), `vazou: ${proibido}`);
    }
  );
});

test("acesso restrito: também bloqueia a consulta por id", () => {
  const api = criarApi({ items: [itemRestrito()] });
  const r = api.doGet({ module: "biblioteca", slug: "PA-BRD-001" });
  assert.equal(r.code, "AUTH_REQUIRED");
  assert.equal(r.item, undefined);
});

test("acesso restrito: aos materiais públicos nada muda", () => {
  const api = criarApi({ items: [itemRestrito()] });
  const pub = api.doGet({ module: "biblioteca", slug: "ia-para-organizacoes-sociais" });
  assert.equal(pub.ok, true);
  assert.equal(pub.item.id, "PA-LIB-001");
  assert.ok(pub.item.conteudoMarkdown.length > 100);
  assert.equal(pub.totalPublished, 4);

  const busca = api.doGet({ module: "biblioteca", busca: "Manual de Marca" });
  assert.equal(busca.count, 0, "a busca não pode revelar o restrito");
});

test("acesso restrito: PA_SLUGS_RESTRITOS troca a política sem tocar no código", () => {
  const api = criarApi(
    {},
    { PA_SLUGS_RESTRITOS: "ia-para-organizacoes-sociais" }
  );

  const lista = api.doGet({ module: "biblioteca" });
  assert.equal(lista.totalPublished, 3);
  assert.ok(!lista.items.some((i) => i.slug === "ia-para-organizacoes-sociais"));

  const detalhe = api.doGet({ module: "biblioteca", slug: "ia-para-organizacoes-sociais" });
  assert.equal(detalhe.code, "AUTH_REQUIRED");

  // O slug do manual não está neste catálogo, mas o padrão foi substituído:
  // continua sendo NOT_FOUND, não AUTH_REQUIRED.
  const manual = api.doGet({ module: "biblioteca", slug: "manual-de-marca-e-design-system" });
  assert.equal(manual.code, "NOT_FOUND");
});

test("acesso restrito: lista vazia em PA_SLUGS_RESTRITOS restaura o padrão", () => {
  const api = criarApi({ items: [itemRestrito()] }, { PA_SLUGS_RESTRITOS: "   " });
  const r = api.doGet({ module: "biblioteca", slug: "manual-de-marca-e-design-system" });
  assert.equal(r.code, "AUTH_REQUIRED", "o padrão de fábrica volta a valer");
});
