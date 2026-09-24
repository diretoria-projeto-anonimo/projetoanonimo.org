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
 * Segundo caso real (corrigido em 24/09/2026): quatro artigos do blog terminavam
 * com o checklist interno de controle de qualidade editorial — critérios de gate
 * como limite de palavras, ausência de PII, evidências de grounding e inferência
 * editorial identificada. É anotação de produção: `blog/automacao-oscs.html`,
 * `blog/checklist-colaborativo.html`, `blog/lgpd-contato-marketing.html` e
 * `blog/organizacao-pastas.html`.
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
  // checklist interno de controle de qualidade editorial (segundo caso real)
  ["Checklist de Controle de Qualidade", /Checklist de Controle de Qualidade/i],
  ["Checklist Final de Revisão de Qualidade", /Checklist Final de Revis[ãa]o de Qualidade/i],
  ["Controle de Qualidade Editorial", /Controle de Qualidade Editorial/i],
  ["Limite de Palavras (critério de gate)", /Limite de Palavras/i],
  ["PII (Dados Pessoais Identificáveis)", /PII \(Dados Pessoais Identific/i],
  ["Evidências de Grounding", /Evid[êe]ncias de Grounding/i],
  ["Exclusão de PII", /Exclus[ãa]o de PII/i],
  ["Absolutos e Termos de Obrigação Removidos", /Absolutos e Termos de Obriga[çc][ãa]o Removidos/i],
  ["Isenção de Certificação Legal", /Isen[çc][ãa]o de Certifica[çc][ãa]o Legal/i],
  ["Inferência Editorial Identificada", /Infer[êe]ncia Editorial Identificada/i],
  ["Validação jurídica/técnica necessária", /(VALOR DE VALIDA[ÇC][ÃA]O|VALIDA[ÇC][ÃA]O JUR[ÍI]DICA E T[ÉE]CNICA)\s*NECESS[ÁA]RIA/i],
  ["Marca de conferência de checklist (☒ / ☐)", /[☒☐]/],
];

// alguns trechos podem ter acentos em entidade HTML (nomeada ou numérica);
// compara nas duas formas
function deCodigo(ponto) {
  return Number.isInteger(ponto) && ponto >= 0 && ponto <= 0x10ffff
    ? String.fromCodePoint(ponto)
    : "";
}

function normalizar(texto) {
  return texto
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => deCodigo(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => deCodigo(Number(dec)))
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
