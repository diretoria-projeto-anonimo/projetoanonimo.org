/**
 * Testes obrigatórios do contrato da Biblioteca Viva (PA-LIB-006).
 * Executa com: node --test sandbox/biblioteca-viva/tests/
 *
 * Usa como fixture a RESPOSTA REAL do endpoint em produção (evidência coletada
 * em sandbox/PA-LIB-AUDIT/evidence/), garantindo que o contrato proposto
 * normaliza exatamente o que está publicado.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const C = require("../apps-script/public-api/src/biblioteca-contract.js");

const EVIDENCE = path.join(__dirname, "fixtures", "pa-lib");
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(EVIDENCE, name), "utf8"));

const catalogoReal = readJson("01_catalogo_completo.json");
const slugReal = readJson("03_slug_existente.json");
const erroReal = readJson("04_slug_inexistente.json");

const FIXTURE_CANONICO = {
  schemaVersion: "1.0.0",
  ok: true,
  project: "Projeto Anônimo",
  module: "Biblioteca Viva",
  generatedAt: "2026-09-10T18:00:00.000Z",
  count: 1,
  totalPublished: 2,
  items: [
    {
      id: "PA-LIB-001",
      titulo: "IA para Organizações Sociais",
      slug: "ia-para-organizacoes-sociais",
      categoria: "Inteligência Artificial",
      formato: "Guia prático",
      resumo: "Guia de uso responsável.",
      status: "Publicado",
      urlCapa: "https://projetoanonimo.org/assets/img/library/ia.webp",
    },
    {
      id: "PA-LIB-006",
      titulo: "Checklist de Governança",
      slug: "checklist-governanca",
      categoria: "Governança",
      formato: "Checklist orientado",
      resumo: "Checklist.",
      status: "Rascunho",
      destaque: "NÃO",
    },
  ],
};

test("1. parsing do payload canônico (v1) devolve apenas publicados", () => {
  const parsed = C.parseEnvelope(FIXTURE_CANONICO);
  assert.equal(parsed.items.length, 1);
  assert.equal(parsed.items[0].slug, "ia-para-organizacoes-sociais");
  assert.equal(parsed.count, 1);
  assert.equal(parsed.totalPublished, 2);
  assert.equal(parsed.legacy, false);
});

test("1b. parsing do payload LEGADO real (colunas em português) funciona", () => {
  const parsed = C.parseEnvelope(catalogoReal);
  assert.equal(parsed.legacy, true);
  assert.equal(parsed.items.length, 4);
  const primeiro = parsed.items[0];
  assert.equal(primeiro.id, "PA-LIB-001");
  assert.equal(primeiro.tempoLeitura, "15–20 min");
  assert.equal(primeiro.urlFormulario, "");
  assert.ok(Array.isArray(primeiro.palavrasChave));
});

test("2. presença dos quatro materiais publicados", () => {
  const ids = C.parseEnvelope(catalogoReal).items.map((i) => i.id).sort();
  assert.deepEqual(ids, ["PA-LIB-001", "PA-LIB-002", "PA-LIB-003", "PA-LIB-004"]);
  const porSlug = Object.fromEntries(
    C.parseEnvelope(catalogoReal).items.map((i) => [i.slug, i.titulo])
  );
  assert.equal(porSlug["ia-para-organizacoes-sociais"], "IA para Organizações Sociais");
  assert.equal(porSlug["plano-30-dias-organizacao-digital"],
    "Plano de 30 Dias para Organização Digital");
});

test("3. slug único (duplicidade vira erro explícito)", () => {
  const duplicado = {
    ok: true,
    items: [
      { id: "A", titulo: "Um", slug: "mesmo-slug", status: "Publicado" },
      { id: "B", titulo: "Dois", slug: "mesmo-slug", status: "Publicado" },
    ],
  };
  assert.throws(() => C.parseEnvelope(duplicado), (err) => err.code === "DUPLICATE_SLUG");
  assert.deepEqual(C.uniqueSlugs(C.parseEnvelope(catalogoReal).items), []);
});

test("4. campos obrigatórios são exigidos", () => {
  const semTitulo = { ok: true, items: [{ id: "X", slug: "x", status: "Publicado" }] };
  assert.throws(() => C.parseEnvelope(semTitulo), (err) => err.code === "INVALID_ITEM");
  const ok = C.parseEnvelope(catalogoReal).items;
  ok.forEach((item) => {
    assert.deepEqual(C.missingRequiredFields(item), []);
  });
});

test("5. filtro de status: só 'Publicado' é público", () => {
  assert.equal(C.isPublished({ status: "Publicado" }), true);
  assert.equal(C.isPublished({ status: "publicado" }), true);
  assert.equal(C.isPublished({ status: "Rascunho" }), false);
  assert.equal(C.isPublished({ status: "Em revisão" }), false);
  assert.equal(C.isPublished({ status: "Aprovado para publicação" }), false);
  assert.equal(C.isEditoriallyApproved({ status: "Aprovado para publicação" }), true);

  const misto = {
    ok: true,
    items: [
      { id: "1", titulo: "Pub", slug: "pub", status: "Publicado" },
      { id: "2", titulo: "Rasc", slug: "rasc", status: "Rascunho" },
    ],
  };
  assert.equal(C.parseEnvelope(misto).items.length, 1);
});

test("6. fallback da interface: rede → cache → indisponível", async () => {
  const cache = [{ slug: "cache-1", titulo: "Do cache", status: "Publicado" }];

  const falha = async () => { throw new Error("network down para o usuario teste@exemplo.org"); };

  const comCache = await C.loadWithFallback({
    fetchPayload: falha,
    readCache: () => cache,
  });
  assert.equal(comCache.status, "degraded");
  assert.equal(comCache.source, "cache");
  assert.equal(comCache.items.length, 1);
  assert.ok(!comCache.error.includes("@"), "erro deve ir redigido no fallback");

  const semCache = await C.loadWithFallback({ fetchPayload: falha, readCache: () => null });
  assert.equal(semCache.status, "unavailable");
  assert.equal(semCache.items.length, 0);

  let salvo = null;
  const sucesso = await C.loadWithFallback({
    fetchPayload: async () => FIXTURE_CANONICO,
    saveCache: (items) => { salvo = items; },
  });
  assert.equal(sucesso.status, "ok");
  assert.equal(sucesso.source, "network");
  assert.ok(Array.isArray(salvo) && salvo.length === 1, "cache público deve ser gravado");
});

test("7. resposta vazia é tratada como catálogo vazio válido", () => {
  const vazio = { schemaVersion: "1.0.0", ok: true, count: 0, totalPublished: 0, items: [] };
  const parsed = C.parseEnvelope(vazio);
  assert.equal(parsed.items.length, 0);
  assert.equal(parsed.count, 0);
});

test("8. resposta de erro e resposta malformada", () => {
  assert.throws(() => C.parseEnvelope(erroReal), (err) => err.code === "NOT_FOUND");
  assert.throws(() => C.parseEnvelope(null), (err) => err.code === "MALFORMED");
  assert.throws(() => C.parseEnvelope("<html>erro 500</html>"), (err) => err.code === "MALFORMED");
  assert.throws(() => C.parseEnvelope({ ok: true }), (err) => err.code === "MALFORMED");
  const envelopeErro = C.buildErrorEnvelope("CONFIG_ERROR", "Propriedade ausente.");
  assert.equal(envelopeErro.ok, false);
  assert.equal(envelopeErro.code, "CONFIG_ERROR");
  assert.equal(envelopeErro.schemaVersion, C.CONTRACT_VERSION);
});

test("9. acentos e caixa não quebram parsing, filtro nem slug", () => {
  const itens = C.parseEnvelope(catalogoReal).items;
  assert.equal(C.accentFold("Organizações") , "organizacoes");
  assert.equal(C.slugify("Inteligência Artificial"), "inteligencia-artificial");
  assert.equal(C.filterItems(itens, { busca: "organizacoes" }).length, 1);
  assert.equal(C.filterItems(itens, { busca: "Organizações" }).length, 1);
  assert.equal(C.filterItems(itens, { busca: "organizacao" }).length, 3);
  assert.equal(C.filterItems(itens, { categoria: "inteligencia artificial" }).length, 1);
  assert.equal(C.filterItems(itens, { busca: "Google" })[0].id, "PA-LIB-002");
  assert.equal(C.filterItems(itens, { formato: "Guia" }).length, 1, "formato é exato: 'Guia' só casa com 'Guia'");
  assert.equal(C.filterItems(itens, { formato: "Guia" })[0].id, "PA-LIB-002");
  assert.equal(C.filterItems(itens, { formato: "Guia prático" })[0].id, "PA-LIB-001");
  assert.equal(C.filterItems(itens, { formato: "Guia " }).length, 1, "espaços nas pontas são tolerados");

  const slugPayload = C.parseEnvelope(slugReal);
  assert.equal(slugPayload.detail, true);
  assert.equal(slugPayload.items[0].id, "PA-LIB-001");
  assert.equal(slugPayload.items[0].slug, "ia-para-organizacoes-sociais");
});

test("10. nenhum dado pessoal ou identificador de conta é exposto", () => {
  const texto = JSON.stringify(C.buildEnvelope({
    items: catalogoReal.items,
    generatedAt: "2026-09-10T18:00:00.000Z",
  }));
  assert.ok(texto.indexOf("ouid") === -1, "URL de formulário não pode expor ouid");
  assert.ok(!/[\w.\-+]+@[\w\-]+\.[a-zA-Z]{2,}/.test(texto), "payload público sem e-mail");
  assert.ok(!/(\+?55)?\s?\(?\d{2}\)?\s?9?\d{4}[\s\-]?\d{4}\b/.test(texto), "sem telefone");

  const sujo = C.sanitizeUrl(
    "https://docs.google.com/forms/d/e/ABC/viewform?usp=sharing&ouid=108472809593565418259"
  );
  assert.equal(sujo, "https://docs.google.com/forms/d/e/ABC/viewform");
  assert.equal(C.sanitizeUrl("javascript:alert(1)"), "");
  assert.equal(C.sanitizeUrl("/diagnostico-organizacional.html"), "/diagnostico-organizacional.html");

  assert.equal(
    C.redactPII("contato lead@osc.org.br e (19) 98143-8968"),
    "contato [email] e [telefone]"
  );
});

test("11. filtros do contrato (os que a API hoje ignora)", () => {
  const itens = C.parseEnvelope(catalogoReal).items;
  assert.equal(C.filterItems(itens, { destaque: "true" }).length, 3);
  assert.equal(C.filterItems(itens, { destaque: true }).length, 3);
  assert.equal(C.filterItems(itens, { busca: "plano" })[0].id, "PA-LIB-004");
  assert.equal(C.filterItems(itens, { slug: "checklist-diagnostico-digital" })[0].id, "PA-LIB-003");
  assert.equal(C.filterItems(itens, { categoria: "Gestão Digital" }).length, 1);
  assert.equal(
    C.filterItems(itens, { busca: "inexistente-xyz" }).length,
    0
  );
});

test("12. envelope canônico traz count, totalPublished e schemaVersion", () => {
  const envelope = C.buildEnvelope({
    items: catalogoReal.items,
    generatedAt: "2026-09-10T18:00:00.000Z",
    filters: { destaque: true },
  });
  assert.equal(envelope.schemaVersion, C.CONTRACT_VERSION);
  assert.equal(envelope.module, "Biblioteca Viva");
  assert.equal(envelope.count, 3);
  assert.equal(envelope.totalPublished, 4);
  assert.equal(envelope.items.length, 3);
  assert.ok(!("conteudoMarkdown" in envelope.items[0]), "lista não carrega o markdown completo");
});

test("13. envelope de detalhe (slug) e não encontrado", () => {
  const ok = C.buildDetailEnvelope({
    items: catalogoReal.items,
    slugOrId: "ia-para-organizacoes-sociais",
  });
  assert.equal(ok.ok, true);
  assert.equal(ok.item.id, "PA-LIB-001");
  assert.ok(ok.item.conteudoMarkdown.length > 100, "detalhe preserva a fonte markdown");
  assert.equal(ok.totalPublished, 4);

  const nao = C.buildDetailEnvelope({ items: catalogoReal.items, slugOrId: "nao-existe" });
  assert.equal(nao.ok, false);
  assert.equal(nao.code, "NOT_FOUND");

  const porId = C.buildDetailEnvelope({ items: catalogoReal.items, slugOrId: "PA-LIB-003" });
  assert.equal(porId.item.slug, "checklist-diagnostico-digital");
});

// PDFs publicados: o catalogo aponta "URL do arquivo" para estes enderecos.
// Sem os arquivos no repositorio, o botao principal da pagina do material quebra.
test("PDFs publicados existem em assets/media/library", () => {
  const pdfs = [
    "ia-para-organizacoes-sociais-v3.1.pdf",
    "google-workspace-para-oscs-v3.1.pdf",
    "checklist-diagnostico-digital-v3.1.pdf",
  ];

  for (const nome of pdfs) {
    const caminho = path.join(__dirname, "..", "assets", "media", "library", nome);
    assert.ok(fs.existsSync(caminho), `PDF ausente: ${nome}`);

    const conteudo = fs.readFileSync(caminho);
    assert.equal(conteudo.subarray(0, 5).toString("latin1"), "%PDF-", `${nome} nao e um PDF`);
    assert.ok(conteudo.length > 50 * 1024, `${nome} parece truncado (${conteudo.length} bytes)`);
  }
});
