/**
 * PA-LIB-006 — Biblioteca Viva · API pública (arquivo gerado)
 * NÃO EDITAR À MÃO: rode `node apps-script/public-api/build-api-gs.cjs`.
 * Conteúdo: src/biblioteca-contract.js + src/wrapper.gs.
 * Fonte canônica do projeto Apps Script da API pública (endpoint institucional).
 */
﻿/**
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

/*
 * Slugs de acesso restrito.
 *
 * Um item restrito NUNCA sai na API pública: não aparece na listagem, não
 * entra em `totalPublished` e o detalhe responde AUTH_REQUIRED sem corpo.
 * A leitura autorizada acontece pelo endpoint editorial (ação getMaterial),
 * que já valida credencial Google e lista de e-mails — nenhum mecanismo
 * novo de autenticação foi criado para isso.
 *
 * O wrapper pode sobrepor esta lista pela propriedade de script
 * PA_SLUGS_RESTRITOS (slugs separados por vírgula), para mudar a política
 * sem tocar no código.
 */
var RESTRICTED_SLUGS_PADRAO = ["manual-de-marca-e-design-system"];
var RESTRICTED_SLUGS = RESTRICTED_SLUGS_PADRAO.slice();

/** Troca a política de restrição. Lista vazia restaura o padrão. */
function setRestrictedSlugs(lista) {
  var limpa = (lista || []).map(function (valor) {
    return accentFold(valor);
  }).filter(Boolean);
  RESTRICTED_SLUGS = limpa.length ? limpa : RESTRICTED_SLUGS_PADRAO.slice();
  return RESTRICTED_SLUGS.slice();
}

/** Lista ativa, para verificação e teste. */
function restrictedSlugs() {
  return RESTRICTED_SLUGS.slice();
}

/** Verdadeiro se o item está sob acesso restrito, por slug ou por id. */
function isRestricted(item) {
  if (!item) return false;
  var slug = accentFold(item.slug);
  var id = accentFold(item.id);
  return RESTRICTED_SLUGS.some(function (alvo) {
    return alvo === slug || alvo === id;
  });
}

/**
 * Regra única do que é exposto publicamente.
 * Publicado E não restrito. Manter num só lugar evita que listagem e
 * detalhe divirjam — foi a divergência entre os dois que abriu a exposição.
 */
function isPubliclyAvailable(item) {
  return isPublished(item) && !isRestricted(item);
}
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
  // `legendadacapa` NAO mapeia para `legendaMidia` — e o motivo esta em
  // normalizeItem: `item[canonicalKey(key)] = source[key]` deixa a ULTIMA coluna
  // lida vencer. Com as duas apontando para o mesmo campo, criar a coluna
  // "Legenda da capa" sobrescreveria a legenda da midia em silencio, sem erro e
  // sem aviso. Sem o alias, "Legenda da capa" normaliza para `legendadacapa`,
  // que nao esta em PUBLIC_FIELDS: fica visivel e inofensiva, nao destrutiva.
  legendadamidia: "legendaMidia",
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
/** Parâmetros removidos por exporem identidade de conta ou rastro de sessão. */
var SENSITIVE_URL_PARAMS = ["ouid", "usp", "authuser", "email", "token", "access_token", "auth_token"];

/**
 * Higieniza URL: aceita http(s) e caminhos relativos do site; remove
 * parâmetros que expõem identidade de conta (ouid) ou rastros de sessão (usp).
 *
 * POR QUE NÃO USA `new URL()`
 *   O runtime V8 do Apps Script não expõe a Web API `URL` (nem `searchParams`).
 *   A versão anterior chamava `new URL(raw)` dentro de um try/catch que devolvia
 *   "" — então TODO url absoluto vindo da planilha (urlCapa, urlPagina,
 *   urlArquivo, urlVideo, urlPdf…) chegava vazio na API pública, sem erro
 *   visível. Provado por experimento: um caminho relativo (`/assets/...`) passa
 *   e é devolvido, enquanto o mesmo caminho em URL absoluto volta "".
 *   A limpeza por regex resolve o mesmo caso sem depender de API de plataforma.
 */
function sanitizeUrl(value) {
  var raw = cleanText(value, 2048);
  if (!raw) return "";
  if (raw.indexOf("/") === 0 && raw.indexOf("//") !== 0) return raw; // caminho relativo
  if (!/^https?:\/\//i.test(raw)) return "";

  var corte = raw.search(/[?#]/);
  if (corte < 0) return raw;
  var base = raw.slice(0, corte);
  var cauda = raw.slice(corte);
  var fragmento = "";
  var posHash = cauda.indexOf("#");
  if (posHash >= 0) {
    fragmento = cauda.slice(posHash);
    cauda = cauda.slice(0, posHash);
  }
  if (cauda.charAt(0) !== "?") return base + cauda + fragmento;

  var mantidos = cauda.slice(1).split("&").filter(function (par) {
    if (!par) return false;
    var nome = par.split("=")[0];
    try {
      nome = decodeURIComponent(nome);
    } catch (e) {
      // nome cru já serve para a comparação
    }
    return SENSITIVE_URL_PARAMS.indexOf(nome.toLowerCase()) === -1;
  });
  return base + (mantidos.length ? "?" + mantidos.join("&") : "") + fragmento;
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
  var published = items.filter(isPubliclyAvailable);
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
  var normalizados = (opts.items || []).map(normalizeItem);

  /*
   * A consulta ao material restrito vem ANTES do filtro público, para que a
   * resposta seja AUTH_REQUIRED e não NOT_FOUND — é esse código que a página
   * usa para oferecer o acesso autenticado. Nenhum campo do item acompanha a
   * resposta: nem título, nem resumo, nem markdown.
   */
  if (findBySlugOrId(normalizados.filter(isRestricted), opts.slugOrId)) {
    var negado = buildErrorEnvelope(
      "AUTH_REQUIRED",
      "Material de acesso restrito. Entre com uma conta autorizada."
    );
    negado.restricted = true;
    return negado;
  }

  var published = normalizados.filter(isPubliclyAvailable);
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
  isRestricted: isRestricted,
  isPubliclyAvailable: isPubliclyAvailable,
  restrictedSlugs: restrictedSlugs,
  setRestrictedSlugs: setRestrictedSlugs,
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


/**
 * PA-LIB-006 — API pública de referência da Biblioteca Viva (Apps Script).
 * ARQUIVO DE SANDBOX — não implantado. Gerado por build-api-gs.cjs
 * (wrapper + lib/biblioteca-contract.js + funções de leitura da planilha).
 *
 * Parâmetros aceitos:
 *   ?module=biblioteca            (obrigatório; único módulo público)
 *   ?slug=<slug|id>               → detalhe (inclui markdown, sumário, próximo passo)
 *   ?categoria=<valor>            → filtro exato (sem acento/caixa)
 *   ?formato=<valor>              → filtro exato
 *   ?nivel=<valor>                → filtro exato
 *   ?destaque=true|false          → filtro booleano
 *   ?busca=<texto>                → busca em título, slug, categoria, formato,
 *                                   resumo, público, território e palavras-chave
 *   ?status=<status>              → restringe (apenas publicado é exposto)
 *   ?include=detalhe              → lista já com markdown (uso interno)
 *
 * Resposta: envelope v1 com schemaVersion, count, totalPublished e items.
 * Propriedades opcionais do script: SPREADSHEET_ID, SHEET_NAME.
 * Sem propriedades, usa o Catálogo Mestre abaixo e detecta a aba pelo cabeçalho.
 */

var CATALOGO_PADRAO_ID = "1kamRM5lR5hES3dZukEqqVsDMHCVirXV5uSuOuB2R8_Q";

function doGet(e) {
  var params = (e && e.parameter) || {};
  try {
    var moduleKey = bvSlugParam_(params.module || "biblioteca");
    if (moduleKey && moduleKey !== "biblioteca") {
      return bvJsonOut_(buildErrorEnvelope("MODULE_NOT_FOUND", "Módulo não encontrado."));
    }

    setRestrictedSlugs(bvRestrictedSlugs_());

    var items = bvReadCatalogItems_();
    var detail = bvSlugParam_(params.include) === "detalhe";

    if (params.slug) {
      return bvJsonOut_(buildDetailEnvelope({ items: items, slugOrId: params.slug }));
    }

    var filters = {
      status: params.status ? bvSlugParam_(params.status) : "publicado",
      categoria: params.categoria || "",
      formato: params.formato || "",
      nivel: params.nivel || "",
      destaque: params.destaque || "",
      busca: params.busca || ""
    };

    var envelope = buildEnvelope({ items: items, filters: filters, detail: detail });
    envelope.filters = bvCompactFilters_(filters);
    return bvJsonOut_(envelope);
  } catch (error) {
    return bvJsonOut_(buildErrorEnvelope(
      (error && error.code) || "SERVER_ERROR",
      (error && error.message) || "Erro interno."
    ));
  }
}

/** Remove filtros vazios do eco de resposta. */
function bvCompactFilters_(filters) {
  var compact = {};
  Object.keys(filters || {}).forEach(function (key) {
    if (filters[key] !== "" && filters[key] != null) compact[key] = filters[key];
  });
  return compact;
}

/**
 * Verificação manual dentro do editor do Apps Script (somente leitura).
 * Uso: selecionar esta função e clicar em Executar — a primeira execução também
 * concede as autorizações necessárias (OAuth). Resultado no "Registro de execução".
 */
function testarCatalogoBiblioteca() {
  var resumo = { etapa: [], ok: false };
  try {
    var propriedades = PropertiesService.getScriptProperties();
    resumo.spreadsheetId = propriedades.getProperty("SPREADSHEET_ID") || "(usando planilha ativa)";
    resumo.sheetName = propriedades.getProperty("SHEET_NAME") || "Biblioteca (padrão)";
    resumo.etapa.push("propriedades lidas");

    var sheet = bvCatalogSheet_();
    var valores = sheet.getDataRange().getDisplayValues();
    resumo.linhas = Math.max(0, valores.length - 1);
    resumo.colunas = valores.length ? valores[0].length : 0;
    resumo.cabecalho = valores.length ? valores[0].slice(0, 6) : [];
    resumo.etapa.push("aba lida: " + sheet.getName());

    var itens = bvReadCatalogItems_();
    var envelope = buildEnvelope({ items: itens, generatedAt: new Date().toISOString() });
    var detalhe = buildDetailEnvelope({
      items: itens,
      slugOrId: (envelope.items[0] || {}).slug || ""
    });

    resumo.totalLinhasCatalogo = itens.length;
    resumo.publicados = envelope.totalPublished;
    resumo.count = envelope.count;
    resumo.schemaVersion = envelope.schemaVersion;
    resumo.primeiros = envelope.items.slice(0, 3).map(function (item) {
      return item.id + " · " + item.slug;
    });
    resumo.slugsDuplicados = uniqueSlugs(envelope.items);
    resumo.detalheOk = Boolean(detalhe && detalhe.ok);
    resumo.detalheTemMarkdown = Boolean(detalhe && detalhe.item && detalhe.item.conteudoMarkdown);
    resumo.etapa.push("envelope montado");
    resumo.ok = resumo.publicados > 0 && resumo.slugsDuplicados.length === 0;
    resumo.proximoPasso = resumo.ok
      ? "Tudo certo: implante uma NOVA VERSÃO na implantação existente (mesma URL /exec)."
      : "Verifique SPREADSHEET_ID, SHEET_NAME, a coluna Status (apenas 'Publicado' é exposta) e slugs duplicados.";
  } catch (erro) {
    resumo.erro = (erro && erro.message) || String(erro);
    resumo.codigo = (erro && erro.code) || "ERRO";
    resumo.etapa.push("falhou: " + resumo.erro);
  }
  Logger.log(JSON.stringify(resumo, null, 2));
  return resumo;
}

function bvSlugParam_(value) {
  return accentFold(value) || "";
}

/**
 * Política de acesso restrito.
 *
 * Sem a propriedade PA_SLUGS_RESTRITOS, vale o padrão declarado no contrato.
 * Com ela, a lista separada por vírgula substitui o padrão — assim a política
 * muda por configuração, sem editar e reimplantar código.
 *
 * Isto NÃO é um segredo: são slugs públicos. Nenhuma credencial é lida aqui.
 */
function bvRestrictedSlugs_() {
  var bruto = PropertiesService.getScriptProperties()
    .getProperty("PA_SLUGS_RESTRITOS");
  if (!bruto) return null;
  return String(bruto).split(",").map(function (valor) {
    return valor.trim();
  }).filter(Boolean);
}

/** Lê a aba do catálogo como objetos brutos (a normalização é do contrato). */
function bvReadCatalogItems_() {
  var values = bvCatalogSheet_().getDataRange().getDisplayValues();
  if (values.length < 2) return [];
  var headers = values[0];
  return values.slice(1)
    .filter(function (row) { return row.some(Boolean); })
    .map(function (row) {
      var object = {};
      headers.forEach(function (header, index) {
        if (header) object[header] = row[index];
      });
      return object;
    });
}

function bvCatalogSheet_() {
  var properties = PropertiesService.getScriptProperties();
  var spreadsheetId = properties.getProperty("SPREADSHEET_ID") || CATALOGO_PADRAO_ID;
  var spreadsheet = null;
  try {
    spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  } catch (erroAbertura) {
    spreadsheet = null;
  }
  if (!spreadsheet) spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw bvError_("Planilha não configurada.", "CONFIG_ERROR");

  var name = properties.getProperty("SHEET_NAME") || "Biblioteca";
  var sheet = spreadsheet.getSheetByName(name);
  if (!sheet) sheet = bvDetectarAbaCatalogo_(spreadsheet);
  if (!sheet) throw bvError_("Aba não encontrada: " + name, "CONFIG_ERROR");
  return sheet;
}

/**
 * Fallback: encontra a aba do catálogo pela linha de cabeçalho, aceitando
 * qualquer nome de aba que tenha as colunas `slug` e (`id` ou `titulo`).
 */
function bvDetectarAbaCatalogo_(spreadsheet) {
  var abas = spreadsheet.getSheets();
  for (var i = 0; i < abas.length; i += 1) {
    var ultimaColuna = Math.max(1, abas[i].getLastColumn());
    var cabecalho = abas[i].getRange(1, 1, 1, ultimaColuna).getDisplayValues()[0];
    var chaves = cabecalho.map(canonicalKey);
    if (chaves.indexOf("slug") >= 0 &&
        (chaves.indexOf("titulo") >= 0 || chaves.indexOf("id") >= 0)) {
      return abas[i];
    }
  }
  return null;
}

function bvError_(message, code) {
  var error = new Error(message);
  error.code = code;
  return error;
}

function bvJsonOut_(body) {
  return ContentService.createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
