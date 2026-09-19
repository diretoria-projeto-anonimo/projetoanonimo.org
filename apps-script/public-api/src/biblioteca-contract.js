/**
 * PA-LIB-006 — Contrato da API da Biblioteca Viva (implementação de referência)
 * Versão: 1.0.0 — sandbox, não implantado.
 *
 * Usável em três ambientes:
 *   - Node (module.exports)
 *   - Google Apps Script (funções globais)
 *   - Navegador (window.PABibliotecaContract)
 *
 * Regras centrais:
 *   1. A API pública devolve SEMPRE o mesmo envelope e o mesmo formato de item
 *      (chaves normalizadas em pt-BR sem acento, camelCase).
 *   2. Somente itens com status publicado são expostos.
 *   3. URLs são higienizadas (sem identificadores de conta/vestígios de sessão).
 *   4. O frontend é TOLERANTE: aceita o formato canônico e o legado (colunas
 *      originais da planilha), para permitir implantação em qualquer ordem.
 */

var CONTRACT_VERSION = "1.0.0";
var PROJECT_NAME = "Projeto Anônimo";
var MODULE_NAME = "Biblioteca Viva";
var PUBLIC_STATUSES = ["publicado"];
var EDITORIAL_STATUSES = ["aprovado para publicacao", "aprovado para publicação"];

var LIST_FIELDS = [
  "id", "titulo", "slug", "categoria", "formato", "resumo", "publico", "nivel",
  "tempoLeitura", "versao", "data", "autor", "licenca", "urlArquivo", "urlCapa",
  "urlPagina", "urlFormulario", "cta", "destaque", "status", "palavrasChave",
  "ultimaRevisao", "tituloSeo", "descricaoSeo", "altCapa", "metricaId",
  "tipoMidia", "urlVideo", "urlPdf", "urlAnexos", "legendaMidia", "creditoMidia",
  "creditoCapa", "territorio", "etapaJornada"
];

var DETAIL_EXTRA_FIELDS = [
  "conteudoMarkdown", "sumario", "anexos", "proximoSlug", "tituloProximoPasso",
  "resumoProximoPasso", "ctaProximoPasso", "urlProximoPasso", "ctaDestino"
];

var REQUIRED_FIELDS = ["id", "titulo", "slug", "status"];

/* ------------------------------------------------------------------ */
/* Chaves                                                              */
/* ------------------------------------------------------------------ */

/** Normaliza uma chave: sem acento, sem separadores, minúscula. */
function keyId(value) {
  return String(value == null ? "" : value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
}

/** Apelidos aceitos → campo canônico do contrato. */
var KEY_ALIASES = {
  id: "id", identificador: "id", codigo: "id",
  titulo: "titulo", title: "titulo",
  slug: "slug",
  categoria: "categoria", category: "categoria",
  formato: "formato", format: "formato",
  resumo: "resumo", descricao: "resumo", description: "resumo",
  publico: "publico", publicoalvo: "publico",
  nivel: "nivel", level: "nivel",
  tempodeleitura: "tempoLeitura", tempoleitura: "tempoLeitura",
  tempoestimadodeleitura: "tempoLeitura",
  versao: "versao", version: "versao",
  data: "data", datapublicacao: "data",
  autor: "autor", author: "autor",
  licenca: "licenca", license: "licenca",
  urldoarquivo: "urlArquivo", urlarquivo: "urlArquivo", arquivourl: "urlArquivo",
  urldacapa: "urlCapa", urlcapa: "urlCapa", capaurl: "urlCapa", capa: "urlCapa",
  urldapagina: "urlPagina", urlpagina: "urlPagina", paginaurl: "urlPagina",
  urldoformulario: "urlFormulario", urlformulario: "urlFormulario",
  formulariourl: "urlFormulario",
  urlvideo: "urlVideo", urldovideo: "urlVideo",
  urlpdf: "urlPdf", urldopdf: "urlPdf",
  urldeanexos: "urlAnexos", urlanexos: "urlAnexos",
  cta: "cta", chamada: "cta",
  destaque: "destaque", featured: "destaque",
  status: "status", situacao: "status", situacaopublicacao: "status",
  palavraschave: "palavrasChave", palavraschaves: "palavrasChave",
  keywords: "palavrasChave", tags: "palavrasChave",
  ultimarevisao: "ultimaRevisao", revisao: "ultimaRevisao",
  tituloseo: "tituloSeo", seotitle: "tituloSeo",
  descricaoseo: "descricaoSeo", seodescription: "descricaoSeo",
  textoalternativodacapa: "altCapa", altcapa: "altCapa", alttext: "altCapa",
  metricaid: "metricaId",
  conteudomarkdown: "conteudoMarkdown", markdown: "conteudoMarkdown",
  conteudo: "conteudoMarkdown",
  sumario: "sumario", indice: "sumario",
  tipodemidia: "tipoMidia", tipomidia: "tipoMidia",
  legendadamidia: "legendaMidia", legendadacapa: "legendaMidia",
  creditodemidia: "creditoMidia",
  creditodacapa: "creditoCapa",
  anexos: "anexos",
  territorio: "territorio", territory: "territorio",
  etapadajornada: "etapaJornada", etapajornada: "etapaJornada",
  proximoslug: "proximoSlug", nextslug: "proximoSlug",
  tituloproximopasso: "tituloProximoPasso", titulodoproximopasso: "tituloProximoPasso",
  resumoproximopasso: "resumoProximoPasso", resumodoproximopasso: "resumoProximoPasso",
  ctaproximopasso: "ctaProximoPasso", ctadoproximopasso: "ctaProximoPasso",
  urlproximopasso: "urlProximoPasso", urldoproximopasso: "urlProximoPasso",
  ctadestino: "ctaDestino", destinodocta: "ctaDestino"
};

function canonicalKey(value) {
  var id = keyId(value);
  return KEY_ALIASES[id] || id;
}

/* ------------------------------------------------------------------ */
/* Texto, URL e PII                                                    */
/* ------------------------------------------------------------------ */

function cleanText(value, maxLength) {
  var text = String(value == null ? "" : value)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .trim();
  var max = maxLength || 20000;
  return text.length > max ? text.slice(0, max) : text;
}

function accentFold(value) {
  return String(value == null ? "" : value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function slugify(value) {
  return accentFold(value).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/**
 * Higieniza URL: aceita http(s) e caminhos relativos do site; remove
 * parâmetros que expõem identidade de conta (ouid) ou rastros de sessão (usp).
 */
function sanitizeUrl(value) {
  var raw = cleanText(value, 2048);
  if (!raw) return "";
  if (raw.indexOf("/") === 0 && raw.indexOf("//") !== 0) return raw; // caminho relativo
  var url;
  try {
    url = new URL(raw);
  } catch (e) {
    return "";
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return "";
  ["ouid", "usp", "authuser", "email", "token", "access_token"].forEach(function (param) {
    url.searchParams.delete(param);
  });
  var query = url.searchParams.toString();
  var base = url.origin + url.pathname + (query ? "?" + query : "");
  return base + (url.hash || "");
}

function toBoolean(value) {
  if (typeof value === "boolean") return value;
  var text = accentFold(value);
  return ["sim", "s", "true", "1", "yes", "destaque"].indexOf(text) !== -1;
}

function toList(value) {
  if (Array.isArray(value)) {
    return value.map(function (item) { return cleanText(item, 120); }).filter(Boolean);
  }
  return cleanText(value, 2000)
    .split(/[;|]/)
    .map(function (item) { return cleanText(item, 120); })
    .filter(Boolean);
}

/** Redige e-mail, telefone e documento em textos de log. */
function redactPII(value) {
  return String(value == null ? "" : value)
    .replace(/[\w.\-+]+@[\w\-]+(?:\.[\w\-]+)+/g, "[email]")
    .replace(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, "[documento]")
    .replace(/(?:\+?55[\s-]?)?\(?\d{2}\)?[\s-]?9?\d{4}[\s-]?\d{4}\b/g, "[telefone]");
}

/** Infere código de erro quando a API antiga devolve apenas mensagem. */
var ERROR_CODE_HINTS = [
  [/n[ãa]o encontrado/i, "NOT_FOUND"],
  [/m[óo]dulo/i, "MODULE_NOT_FOUND"],
  [/planilha|propriedade|configura/i, "CONFIG_ERROR"],
  [/credencial|sess[ãa]o|acesso/i, "AUTH_REQUIRED"],
  [/inv[áa]lid/i, "VALIDATION_ERROR"]
];

function inferErrorCode(message) {
  var text = String(message || "");
  for (var i = 0; i < ERROR_CODE_HINTS.length; i += 1) {
    if (ERROR_CODE_HINTS[i][0].test(text)) return ERROR_CODE_HINTS[i][1];
  }
  return "API_ERROR";
}

/* ------------------------------------------------------------------ */
/* Itens                                                               */
/* ------------------------------------------------------------------ */

function normalizeItem(raw) {
  var source = raw && typeof raw === "object" ? raw : {};
  var item = {};
  Object.keys(source).forEach(function (key) {
    item[canonicalKey(key)] = source[key];
  });

  var normalized = {
    id: cleanText(item.id, 80),
    titulo: cleanText(item.titulo, 300),
    slug: slugify(item.slug || item.titulo),
    categoria: cleanText(item.categoria, 120),
    formato: cleanText(item.formato, 120),
    resumo: cleanText(item.resumo, 1200),
    publico: cleanText(item.publico, 300),
    nivel: cleanText(item.nivel, 120),
    tempoLeitura: cleanText(item.tempoLeitura, 60),
    versao: cleanText(item.versao, 60),
    data: cleanText(item.data, 40),
    autor: cleanText(item.autor, 160),
    licenca: cleanText(item.licenca, 120),
    urlArquivo: sanitizeUrl(item.urlArquivo),
    urlCapa: sanitizeUrl(item.urlCapa),
    urlPagina: sanitizeUrl(item.urlPagina),
    urlFormulario: sanitizeUrl(item.urlFormulario),
    urlVideo: sanitizeUrl(item.urlVideo),
    urlPdf: sanitizeUrl(item.urlPdf),
    urlAnexos: sanitizeUrl(item.urlAnexos),
    urlProximoPasso: sanitizeUrl(item.urlProximoPasso),
    cta: cleanText(item.cta, 200),
    destaque: toBoolean(item.destaque),
    status: cleanText(item.status, 60),
    palavrasChave: toList(item.palavrasChave),
    ultimaRevisao: cleanText(item.ultimaRevisao, 40),
    tituloSeo: cleanText(item.tituloSeo, 300),
    descricaoSeo: cleanText(item.descricaoSeo, 500),
    altCapa: cleanText(item.altCapa, 600),
    metricaId: cleanText(item.metricaId, 80),
    tipoMidia: cleanText(item.tipoMidia, 60),
    legendaMidia: cleanText(item.legendaMidia, 600),
    creditoMidia: cleanText(item.creditoMidia, 400),
    creditoCapa: cleanText(item.creditoCapa, 400),
    territorio: cleanText(item.territorio, 160),
    etapaJornada: cleanText(item.etapaJornada, 200),
    proximoSlug: slugify(item.proximoSlug),
    tituloProximoPasso: cleanText(item.tituloProximoPasso, 300),
    resumoProximoPasso: cleanText(item.resumoProximoPasso, 800),
    ctaProximoPasso: cleanText(item.ctaProximoPasso, 200),
    ctaDestino: cleanText(item.ctaDestino, 200)
  };

  // Conteúdo (markdown/sumário/anexos) é opcional e preservado como fonte nativa.
  if (item.conteudoMarkdown != null && item.conteudoMarkdown !== "") {
    normalized.conteudoMarkdown = cleanText(item.conteudoMarkdown, 200000);
  }
  if (item.sumario != null && item.sumario !== "") {
    normalized.sumario = toList(item.sumario);
  }
  if (item.anexos != null && item.anexos !== "") {
    normalized.anexos = toList(item.anexos).map(sanitizeUrl).filter(Boolean);
  }
  return normalized;
}

function isPublished(item) {
  return PUBLIC_STATUSES.indexOf(accentFold(item && item.status)) !== -1;
}

function isEditoriallyApproved(item) {
  var status = accentFold(item && item.status);
  return PUBLIC_STATUSES.indexOf(status) !== -1 ||
    EDITORIAL_STATUSES.map(accentFold).indexOf(status) !== -1;
}

function missingRequiredFields(item) {
  return REQUIRED_FIELDS.filter(function (field) {
    var value = item ? item[field] : null;
    return value === undefined || value === null || value === "";
  });
}

function findBySlugOrId(items, slugOrId) {
  var wanted = accentFold(slugOrId);
  if (!wanted) return null;
  return (items || []).find(function (item) {
    return accentFold(item.slug) === wanted || accentFold(item.id) === wanted;
  }) || null;
}

function toPublicSummary(item) {
  var summary = {};
  LIST_FIELDS.forEach(function (field) {
    if (item[field] !== undefined) summary[field] = item[field];
  });
  return summary;
}

/* ------------------------------------------------------------------ */
/* Filtros                                                             */
/* ------------------------------------------------------------------ */

function filterItems(items, filters) {
  var query = filters || {};
  return (items || []).filter(function (item) {
    if (query.status) {
      if (accentFold(item.status) !== accentFold(query.status)) return false;
    }
    if (query.slug && accentFold(item.slug) !== accentFold(query.slug)) return false;
    if (query.categoria && accentFold(item.categoria) !== accentFold(query.categoria)) return false;
    if (query.formato && accentFold(item.formato) !== accentFold(query.formato)) return false;
    if (query.nivel && accentFold(item.nivel) !== accentFold(query.nivel)) return false;
    if (query.destaque !== undefined && query.destaque !== null && query.destaque !== "") {
      if (toBoolean(item.destaque) !== toBoolean(query.destaque)) return false;
    }
    if (query.busca) {
      var haystack = accentFold([
        item.titulo, item.slug, item.categoria, item.formato, item.resumo,
        item.publico, item.territorio,
        (item.palavrasChave || []).join(" ")
      ].join(" "));
      if (haystack.indexOf(accentFold(query.busca)) === -1) return false;
    }
    return true;
  });
}

function uniqueSlugs(items) {
  var seen = {};
  var duplicates = [];
  (items || []).forEach(function (item) {
    if (!item.slug) return;
    if (seen[item.slug]) duplicates.push(item.slug);
    seen[item.slug] = true;
  });
  return duplicates;
}

/* ------------------------------------------------------------------ */
/* Envelope (API)                                                      */
/* ------------------------------------------------------------------ */

function buildEnvelope(options) {
  var opts = options || {};
  var items = (opts.items || []).map(normalizeItem);
  var published = items.filter(isPublished);
  var detail = Boolean(opts.detail);
  var filtered = filterItems(published, opts.filters || {});
  var payload = detail ? filtered : filtered.map(toPublicSummary);
  return {
    schemaVersion: CONTRACT_VERSION,
    ok: true,
    project: opts.project || PROJECT_NAME,
    module: opts.module || MODULE_NAME,
    generatedAt: opts.generatedAt || new Date().toISOString(),
    count: payload.length,
    totalPublished: published.length,
    filters: opts.filters || {},
    items: payload
  };
}

function buildDetailEnvelope(options) {
  var opts = options || {};
  var published = (opts.items || []).map(normalizeItem).filter(isPublished);
  var item = findBySlugOrId(published, opts.slugOrId);
  if (!item) {
    return {
      schemaVersion: CONTRACT_VERSION,
      ok: false,
      project: opts.project || PROJECT_NAME,
      module: opts.module || MODULE_NAME,
      generatedAt: opts.generatedAt || new Date().toISOString(),
      code: "NOT_FOUND",
      error: "Material não encontrado."
    };
  }
  return {
    schemaVersion: CONTRACT_VERSION,
    ok: true,
    project: opts.project || PROJECT_NAME,
    module: opts.module || MODULE_NAME,
    generatedAt: opts.generatedAt || new Date().toISOString(),
    count: 1,
    totalPublished: published.length,
    item: item
  };
}

function buildErrorEnvelope(code, message, options) {
  var opts = options || {};
  return {
    schemaVersion: CONTRACT_VERSION,
    ok: false,
    project: opts.project || PROJECT_NAME,
    module: opts.module || MODULE_NAME,
    generatedAt: opts.generatedAt || new Date().toISOString(),
    code: code || "SERVER_ERROR",
    error: message || "Erro interno."
  };
}

/* ------------------------------------------------------------------ */
/* Consumo (frontend)                                                  */
/* ------------------------------------------------------------------ */

function ContractError(code, message) {
  var error = new Error(message);
  error.name = "ContractError";
  error.code = code;
  return error;
}

/**
 * Interpreta a resposta da API. Aceita o formato canônico (v1) e o legado
 * (colunas originais da planilha) — o frontend pode ser publicado antes da API.
 */
function parseEnvelope(payload) {
  if (!payload || typeof payload !== "object") {
    throw ContractError("MALFORMED", "Resposta da API inválida.");
  }
  if (payload.ok === false) {
    throw ContractError(payload.code || inferErrorCode(payload.error),
      payload.error || "A API retornou erro.");
  }
  if (!Array.isArray(payload.items)) {
    if (payload.item && typeof payload.item === "object") {
      return { items: [normalizeItem(payload.item)], count: 1, totalPublished: 1, detail: true };
    }
    throw ContractError("MALFORMED", "A API não devolveu a lista de materiais.");
  }
  var raw = payload.items.map(normalizeItem);
  var published = raw.filter(isPublished);
  var duplicates = uniqueSlugs(published);
  if (duplicates.length) {
    throw ContractError("DUPLICATE_SLUG", "Slugs duplicados: " + duplicates.join(", "));
  }
  published.forEach(function (item) {
    var missing = missingRequiredFields(item);
    if (missing.length) {
      throw ContractError("INVALID_ITEM",
        "Material " + (item.slug || item.id || "?") + " sem campos: " + missing.join(", "));
    }
  });
  // O cliente recalcula o count a partir do que recebeu (defesa contra
  // respostas inconsistentes) e nunca aceita totalPublished menor que count.
  var count = published.length;
  var totalPublished = typeof payload.totalPublished === "number"
    ? Math.max(payload.totalPublished, count)
    : count;
  return {
    schemaVersion: payload.schemaVersion || "legacy",
    items: published.map(toPublicSummary),
    count: count,
    totalPublished: totalPublished,
    generatedAt: payload.generatedAt || null,
    legacy: !payload.schemaVersion
  };
}

/**
 * Carrega a biblioteca com fallback: tenta a rede, cai para o cache local e,
 * por último, sinaliza indisponibilidade. Nunca lança para a interface.
 */
async function loadWithFallback(options) {
  var opts = options || {};
  try {
    var payload = await opts.fetchPayload();
    var parsed = parseEnvelope(payload);
    if (typeof opts.saveCache === "function") {
      try { opts.saveCache(parsed.items); } catch (e) { /* cache é best-effort */ }
    }
    return { status: "ok", source: "network", items: parsed.items, count: parsed.count,
      totalPublished: parsed.totalPublished, legacy: parsed.legacy };
  } catch (networkError) {
    var cached = null;
    try { cached = typeof opts.readCache === "function" ? opts.readCache() : null; } catch (e) { cached = null; }
    if (Array.isArray(cached) && cached.length) {
      return { status: "degraded", source: "cache", items: cached,
        count: cached.length, totalPublished: cached.length,
        error: redactPII(networkError && networkError.message) };
    }
    return { status: "unavailable", source: "none", items: [], count: 0,
      totalPublished: 0, error: redactPII(networkError && networkError.message) };
  }
}

var PABibliotecaContract = {
  CONTRACT_VERSION: CONTRACT_VERSION,
  PROJECT_NAME: PROJECT_NAME,
  MODULE_NAME: MODULE_NAME,
  LIST_FIELDS: LIST_FIELDS,
  DETAIL_EXTRA_FIELDS: DETAIL_EXTRA_FIELDS,
  REQUIRED_FIELDS: REQUIRED_FIELDS,
  canonicalKey: canonicalKey,
  keyId: keyId,
  cleanText: cleanText,
  accentFold: accentFold,
  slugify: slugify,
  sanitizeUrl: sanitizeUrl,
  toBoolean: toBoolean,
  toList: toList,
  redactPII: redactPII,
  normalizeItem: normalizeItem,
  isPublished: isPublished,
  isEditoriallyApproved: isEditoriallyApproved,
  missingRequiredFields: missingRequiredFields,
  findBySlugOrId: findBySlugOrId,
  toPublicSummary: toPublicSummary,
  filterItems: filterItems,
  uniqueSlugs: uniqueSlugs,
  buildEnvelope: buildEnvelope,
  buildDetailEnvelope: buildDetailEnvelope,
  buildErrorEnvelope: buildErrorEnvelope,
  inferErrorCode: inferErrorCode,
  parseEnvelope: parseEnvelope,
  loadWithFallback: loadWithFallback
};

if (typeof module !== "undefined" && module.exports) module.exports = PABibliotecaContract;
if (typeof globalThis !== "undefined") globalThis.PABibliotecaContract = PABibliotecaContract;
