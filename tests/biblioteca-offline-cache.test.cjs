"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const mainJs = fs.readFileSync(
  path.join(__dirname, "..", "assets", "js", "main.js"),
  "utf8"
);

function createStorage() {
  const values = new Map();
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    },
  };
}

function loadCacheHelpers(storage = createStorage()) {
  const sandbox = {
    URL,
    Date,
    JSON,
    console,
    document: { addEventListener() {} },
    window: { addEventListener() {}, localStorage: storage },
  };

  vm.runInNewContext(
    `${mainJs}\n;globalThis.__cache = { BIBLIOTECA_CACHE_KEY, BIBLIOTECA_CACHE_TTL_MS, sanitizePublicItemForCache, writeBibliotecaCache, readBibliotecaCache };`,
    sandbox
  );
  return { cache: sandbox.__cache, storage };
}

test("cacheia somente metadados públicos de materiais publicados", () => {
  const { cache } = loadCacheHelpers();
  const sanitized = cache.sanitizePublicItemForCache({
    slug: "material-publico",
    titulo: "Material público",
    status: "Publicado",
    resumo: "Resumo público",
    urlCapa: "https://example.org/capa.png",
    metricId: "nao-deve-ser-gravado",
    session: "nao-deve-ser-gravada",
    token: "nao-deve-ser-gravado",
    auth: "nao-deve-ser-gravado",
    respostasChecklist: { 1: "nao" },
  });

  assert.deepEqual(JSON.parse(JSON.stringify(sanitized)), {
    slug: "material-publico",
    titulo: "Material público",
    categoria: "",
    formato: "",
    nivel: "",
    tempoLeitura: "",
    versao: "",
    resumo: "Resumo público",
    palavrasChave: "",
    destaque: false,
    dataCadastro: "",
    urlCapa: "https://example.org/capa.png",
    paginaUrl: "",
    arquivoUrl: "",
    formularioUrl: "",
    cta: "",
  });
  assert.equal(
    cache.sanitizePublicItemForCache({
      slug: "rascunho",
      titulo: "Rascunho",
      status: "Rascunho",
    }),
    null
  );
  assert.doesNotMatch(JSON.stringify(sanitized), /respostasChecklist|"nao"/);
});

test("lê cache versionado dentro do TTL e invalida cache expirado", () => {
  const { cache, storage } = loadCacheHelpers();
  const now = 1_800_000_000_000;
  const items = [{ slug: "publicado", titulo: "Publicado", status: "Publicado" }];

  assert.equal(cache.writeBibliotecaCache(items, now), true);
  assert.equal(cache.readBibliotecaCache(now + 1).length, 1);
  assert.equal(
    cache.readBibliotecaCache(now + cache.BIBLIOTECA_CACHE_TTL_MS),
    null
  );
  assert.equal(storage.getItem(cache.BIBLIOTECA_CACHE_KEY), null);
});

test("descarta cache corrompido ou indisponível sem interromper a Biblioteca", () => {
  const { cache, storage } = loadCacheHelpers();
  storage.setItem(cache.BIBLIOTECA_CACHE_KEY, "{invalido");
  assert.equal(cache.readBibliotecaCache(), null);
  assert.equal(storage.getItem(cache.BIBLIOTECA_CACHE_KEY), null);

  const unavailableStorage = {
    getItem() {
      throw new Error("storage indisponível");
    },
    setItem() {
      throw new Error("storage indisponível");
    },
    removeItem() {
      throw new Error("storage indisponível");
    },
  };
  const unavailable = loadCacheHelpers(unavailableStorage).cache;
  assert.equal(unavailable.readBibliotecaCache(), null);
  assert.equal(
    unavailable.writeBibliotecaCache([
      { slug: "publicado", titulo: "Publicado", status: "Publicado" },
    ]),
    false
  );
});

console.log("biblioteca-offline-cache.test.cjs: todos os cenários passaram");
