/**
 * Guarda anti-drift — contrato do frontend (PA-LIB-006).
 *
 * POR QUE ESTE TESTE EXISTE
 *   Não existe gerador para `frontend/assets/js/biblioteca-contract.js`: ele é
 *   mantido à mão e por isso ficou 4 versões atrás do contrato canônico. Em
 *   08/10/2026 a cópia do sandbox ainda filtrava por `isPublished` em vez de
 *   `isPubliclyAvailable`, não tinha o ramo `AUTH_REQUIRED`, mantinha o alias
 *   destrutivo `legendadacapa -> legendaMidia` e usava uma lista de parâmetros
 *   sensíveis sem `auth_token`. Tudo isso no navegador.
 *
 *   O padrão do projeto é contrato ÚNICO: em pa-capas-fila, org-main e outros,
 *   `apps-script/public-api/src/biblioteca-contract.js` e
 *   `assets/js/biblioteca-contract.js` são o MESMO arquivo. Este teste preserva
 *   esse padrão.
 *
 * O QUE ELE VERIFICA
 *   1. O contrato do frontend é igual ao canônico
 *      (`apps-script/public-api/src/biblioteca-contract.js`), tolerando apenas
 *      diferença de terminador de linha.
 *   2. O arquivo é carregável no navegador: define `PABibliotecaContract` no
 *      global, com `URL`/`URLSearchParams` presentes.
 *   3. Não depende de API do Apps Script (que não existe no navegador).
 *   4. Não reaparece o alias destrutivo.
 *
 * CAMINHOS — adaptados do sandbox `sandbox/biblioteca-viva/` para o layout do
 *   repositório: o canônico está em `apps-script/public-api/src/` e a cópia do
 *   site em `assets/js/`.
 *
 * Executa com: node --test tests/contrato-frontend-sync.test.cjs
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const CANONICO = path.join(__dirname, "..", "apps-script", "public-api", "src", "biblioteca-contract.js");
const FRONTEND = path.join(__dirname, "..", "assets", "js", "biblioteca-contract.js");

const ler = (p) => fs.readFileSync(p, "utf8");
/** Compara conteúdo tolerando CRLF vs LF, que é artefato de editor. */
const normalizar = (t) => t.replace(/\r\n/g, "\n");

test("contrato do frontend: é igual ao contrato canônico", () => {
  assert.equal(
    normalizar(ler(FRONTEND)),
    normalizar(ler(CANONICO)),
    "frontend/assets/js/biblioteca-contract.js divergiu de lib/biblioteca-contract.js.\n" +
      "Não há gerador para essa cópia: ela é mantida à mão. Ao alterar o contrato\n" +
      "canônico, copie-o para o frontend — foi a falta disso que deixou o navegador\n" +
      "4 versões atrás, filtrando material restrito como se fosse público."
  );
});

test("contrato do frontend: carrega no navegador e expõe PABibliotecaContract", () => {
  // Contexto com URL e URLSearchParams, como no navegador.
  const contexto = vm.createContext({ URL, URLSearchParams });
  vm.runInContext(ler(FRONTEND), contexto);

  const C = contexto.PABibliotecaContract;
  assert.ok(C, "o contrato do frontend não definiu globalThis.PABibliotecaContract");
  assert.equal(typeof C.sanitizeUrl, "function");
  assert.equal(typeof C.buildEnvelope, "function");
  assert.equal(typeof C.buildDetailEnvelope, "function");
});

test("contrato do frontend: comporta-se como o canônico no que importa", () => {
  const contexto = vm.createContext({ URL, URLSearchParams });
  vm.runInContext(ler(FRONTEND), contexto);
  const C = contexto.PABibliotecaContract;

  // auth_token, o parâmetro mais recente autorizado
  assert.equal(C.sanitizeUrl("https://x.org/a?auth_token=1&keep=1"), "https://x.org/a?keep=1");
  assert.equal(C.sanitizeUrl("https://x.org/a?my_auth_token=1"), "https://x.org/a?my_auth_token=1");
  assert.equal(C.sanitizeUrl("https://x.org/a/b.png"), "https://x.org/a/b.png");

  // material restrito: fora da listagem, AUTH_REQUIRED no detalhe
  const itens = [
    { id: "PA-BRD-001", slug: "manual-de-marca-e-design-system", status: "Publicado",
      titulo: "Manual", conteudoMarkdown: "# INTERNO" },
    { id: "PA-LIB-004", slug: "plano-30-dias-organizacao-digital", status: "Publicado",
      conteudoMarkdown: "# publico" },
  ];
  const env = C.buildEnvelope({ items: itens });
  assert.equal(env.totalPublished, 1);
  assert.ok(!env.items.some((i) => i.slug === "manual-de-marca-e-design-system"));

  const det = C.buildDetailEnvelope({ items: itens, slugOrId: "manual-de-marca-e-design-system" });
  assert.equal(det.code, "AUTH_REQUIRED");
  assert.equal(det.item, undefined);
  assert.ok(!JSON.stringify(det).includes("INTERNO"));
});

test("contrato do frontend: não depende de API do Apps Script", () => {
  const t = ler(FRONTEND);
  ["PropertiesService", "SpreadsheetApp", "ContentService", "UrlFetchApp", "CacheService"].forEach(
    (api) => assert.ok(!t.includes(api), `o contrato do frontend não pode usar ${api}, que não existe no navegador`)
  );
});

test("contrato do frontend: sem o alias destrutivo legendaCapa -> legendaMidia", () => {
  const codigo = ler(FRONTEND)
    .split("\n")
    .filter((l) => {
      const s = l.trim();
      return s && !s.startsWith("*") && !s.startsWith("/*") && !s.startsWith("//");
    })
    .join("\n");
  assert.ok(
    !/legendadacapa:\s*"legendaMidia"/.test(codigo),
    "o alias `legendadacapa -> legendaMidia` sobrescreve a legenda da mídia em silêncio"
  );
});
