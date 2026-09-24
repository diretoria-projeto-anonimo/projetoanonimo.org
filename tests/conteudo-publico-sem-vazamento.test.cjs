"use strict";

/**
 * Guarda contra informação interna vazar para páginas públicas.
 *
 * Caso real (corrigido em 24/09/2026): `blog/seguranca-workspace.html` começava
 * com o briefing de produção do artigo — "Metadados de Publicação (CMS / SEO)",
 * meta title, meta description, slug sugerido, tags e briefing da capa, com uma
 * paleta azul que nem é a da marca. Isso ficou no ar até ser encontrado numa
 * revisão de conteúdo.
 *
 * Este teste varre as páginas públicas e falha se qualquer marcador de produção
 * interna reaparecer. `editor/` fica de fora: é ferramenta interna, não site.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const raiz = path.join(__dirname, "..");
const PASTAS_PUBLICAS = ["", "blog", "biblioteca"];

const MARCADORES = [
  ["Metadados de Publicação (briefing de CMS/SEO)", /Metadados de Publica[çc][ãa]o/i],
  ["Meta Title", /Meta Title/i],
  ["Meta Description", /Meta Description/i],
  ["Slug Sugerido", /Slug Sugerido/i],
  ["Tags Recomendadas", /Tags Recomendadas/i],
  ["Briefing de Imagem de Capa", /Briefing de Imagem de Capa/i],
  ["Briefing de Capa", /Briefing de Capa/i],
  ["Score do gate de auditoria", /Score do gate/i],
  ["NÃO PUBLICAR", /N[ÃA]O PUBLICAR/i],
  ["DEPENDE DE APROVAÇÃO", /DEPENDE DE APROVA[ÇC][ÃA]O/i],
  ["CONFIDENCIAL", /CONFIDENCIAL/i],
  ["RASCUNHO DE PRODUÇÃO", /RASCUNHO DE PRODU[ÇC][ÃA]O/i],
];

// alguns trechos podem ter acentos em entidade HTML; compara nas duas formas
function normalizar(texto) {
  return texto
    .replace(/&ccedil;/gi, "ç")
    .replace(/&atilde;/gi, "ã")
    .replace(/&otilde;/gi, "õ")
    .replace(/&aacute;/gi, "á")
    .replace(/&eacute;/gi, "é")
    .replace(/&iacute;/gi, "í")
    .replace(/&oacute;/gi, "ó")
    .replace(/&uacute;/gi, "ú")
    .replace(/&ecirc;/gi, "ê")
    .replace(/&ocirc;/gi, "ô")
    .replace(/&nbsp;/gi, " ");
}

const paginas = [];
for (const pasta of PASTAS_PUBLICAS) {
  const alvo = path.join(raiz, pasta);
  for (const arquivo of fs.readdirSync(alvo)) {
    if (!arquivo.endsWith(".html")) continue;
    paginas.push({
      relativo: pasta ? path.join(pasta, arquivo) : arquivo,
      caminho: path.join(alvo, arquivo),
    });
  }
}

assert.ok(
  paginas.length >= 25,
  `esperado ao menos 25 páginas públicas para varrer, encontradas ${paginas.length}`
);

const achados = [];
for (const pagina of paginas) {
  const conteudo = normalizar(fs.readFileSync(pagina.caminho, "utf8"));
  for (const [rotulo, padrao] of MARCADORES) {
    if (padrao.test(conteudo)) achados.push(`${pagina.relativo}: "${rotulo}"`);
  }
}

assert.deepEqual(
  achados,
  [],
  `página pública com informação interna:\n  ${achados.join("\n  ")}`
);

console.log(
  `conteudo-publico-sem-vazamento.test.cjs: ${paginas.length} páginas públicas sem informação interna`
);
