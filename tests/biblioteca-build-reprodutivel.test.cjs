/**
 * Guarda de reprodutibilidade do build — PA-LIB-006.
 *
 * POR QUE ESTE TESTE EXISTE
 *   Em 04/10/2026 descobriu-se que `lib/` e `api/` estavam atrás do
 *   `dist/Code.gs` que estava no ar. Rodar `node build-api-gs.cjs` teria
 *   REGREDIDO produção: o `sanitizeUrl` voltaria a usar `new URL()`, que não
 *   existe no runtime V8 do Apps Script, e todo url absoluto chegaria vazio.
 *
 * O QUE ELE VERIFICA
 *   Que `fontes -> build` reproduz exatamente o `Code.gs` versionado, e que o
 *   artefato preserva as correções que estão em produção.
 *
 * O QUE ELE *NÃO* FAZ
 *   Não fixa um hash e não congela o projeto. Uma mudança legítima nas fontes
 *   passa, desde que `node apps-script/public-api/build-api-gs.cjs` seja rodado e
 *   o novo `Code.gs` seja versionado junto — que é o fluxo correto.
 *
 * CAMINHOS — vieram do sandbox `sandbox/biblioteca-viva/`, onde as fontes eram
 *   `lib/` + `api/` e o artefato `dist/Code.gs`. No repositório as duas fontes
 *   ficam em `apps-script/public-api/src/` e o artefato em
 *   `apps-script/public-api/Code.gs`.
 *
 * Executa com: node --test tests/build-reprodutivel.test.cjs
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const RAIZ = path.join(__dirname, "..", "apps-script", "public-api");
const ler = (rel) => fs.readFileSync(path.join(RAIZ, rel), "utf8");

/** Reproduz exatamente o que build-api-gs.cjs monta, sem escrever nada. */
function montarDist() {
  const build = ler("build-api-gs.cjs");
  const bloco = build.match(/const banner = \[([\s\S]*?)\]\.join/);
  assert.ok(bloco, "build-api-gs.cjs não tem mais o bloco `const banner`");
  const banner = [...bloco[1].matchAll(/^\s*"(.*)",?$/gm)]
    .map((m) => m[1])
    .join("\n");

  const lib = ler("src/biblioteca-contract.js");
  const wrapper = ler("src/wrapper.gs");
  const semModulo = lib.replace(/\nif \(typeof module[\s\S]*$/, "\n");
  return banner + semModulo + "\n" + wrapper;
}

/**
 * Linhas que são código, não comentário.
 *
 * Necessário porque o próprio comentário do `sanitizeUrl` explica POR QUE não
 * se usa `new URL()` — e uma busca ingênua pelo texto acusaria o comentário.
 * Um bloco /* ... *\/ tem as linhas internas começando por `*`.
 */
function linhasDeCodigo(fonte) {
  return fonte
    .split("\n")
    .filter((linha) => {
      const s = linha.trim();
      return s && !s.startsWith("*") && !s.startsWith("/*") && !s.startsWith("//");
    });
}

test("build reprodutível: fontes -> dist é idêntico ao dist versionado", () => {
  assert.equal(
    montarDist(),
    ler("Code.gs"),
    "lib/ ou api/ divergem de dist/Code.gs.\n" +
      "Rode `node build-api-gs.cjs` e versione o dist/Code.gs resultante — " +
      "ou reverta a alteração nas fontes. NÃO implante um dist gerado a partir " +
      "de fontes divergentes: foi assim que o sanitizeUrl quase voltou a quebrar."
  );
});

test("build reprodutível: o dist se declara arquivo gerado", () => {
  const dist = ler("Code.gs");
  assert.match(dist, /arquivo gerado/);
  assert.match(dist, /NÃO EDITAR À MÃO/);
});

test("build reprodutível: o dist preserva as correções que estão em produção", () => {
  const dist = ler("Code.gs");

  [
    ["bloqueio do PA-BRD-001", "manual-de-marca-e-design-system"],
    ["constante de restrição", "RESTRICTED_SLUGS_PADRAO"],
    ["filtro público único", "isPubliclyAvailable"],
    ["resposta sem corpo", "AUTH_REQUIRED"],
    ["parâmetros sensíveis", "SENSITIVE_URL_PARAMS"],
    ["aceitação de http(s) por regex", "/^https?:\\/\\//i"],
    ["preservação de legendaMidia", 'legendadamidia: "legendaMidia"'],
  ].forEach(([rotulo, termo]) => {
    assert.ok(dist.includes(termo), `o dist perdeu: ${rotulo} (${termo})`);
  });
});

test("build reprodutível: o código do dist não depende de API web do navegador", () => {
  const codigo = linhasDeCodigo(ler("Code.gs")).join("\n");

  assert.ok(
    !/new URL\(/.test(codigo),
    "o código do dist voltou a usar `new URL()`, ausente no runtime V8 do Apps Script"
  );
  assert.ok(
    !/\.searchParams/.test(codigo),
    "o código do dist voltou a usar `searchParams`, ausente no Apps Script"
  );
  assert.ok(
    !/legendadacapa:\s*"legendaMidia"/.test(codigo),
    "o alias `legendadacapa -> legendaMidia` voltou e sobrescreve a legenda da mídia"
  );
});
