const DEFAULT_SHEET_NAME = "Biblioteca";
const DEFAULT_METRICS_SHEET_NAME = "MetricasV2";
const METRIC_TYPES = [
  "visualizacao", "clique", "download", "formulario", "compartilhamento"
];
const METRIC_ORIGINS = ["biblioteca-individual"];
const UPLOAD_FOLDER_PROPERTIES = [
  "BIBLIOTECA_PASTA_CAPAS",
  "BIBLIOTECA_PASTA_ANEXOS",
  "BIBLIOTECA_PASTA_PUBLICADOS",
  "BIBLIOTECA_PASTA_REVISAO"
];

function diagnosticarConfiguracao() {
  const propertyNames = [
    "GOOGLE_CLIENT_ID",
    "ALLOWED_EDITOR_EMAILS",
    "SPREADSHEET_ID",
    "SHEET_NAME"
  ].concat(UPLOAD_FOLDER_PROPERTIES);
  const properties = PropertiesService.getScriptProperties();
  const missing = propertyNames.filter(function (name) {
    return !properties.getProperty(name);
  });
  const result = {
    ok: missing.length === 0,
    missing: missing,
    sheet: null,
    uploadFolders: []
  };

  if (!missing.length) {
    const sheet = sheet_();
    result.sheet = {
      name: sheet.getName(),
      rows: sheet.getLastRow(),
      columns: sheet.getLastColumn()
    };
    result.uploadFolders = UPLOAD_FOLDER_PROPERTIES.map(function (propertyName) {
      const folder = DriveApp.getFolderById(properties.getProperty(propertyName));
      return { property: propertyName, id: folder.getId(), name: folder.getName() };
    });
  }

  console.log(JSON.stringify(result, null, 2));
  return result;
}

function doPost(event) {
  try {
    const payload = JSON.parse((event.postData && event.postData.contents) || "{}");
    const action = String(payload.action || "");

    if (action === "recordMetric") return recordMetric_(payload);

    const user = requireEditor_(payload.googleCredential);
    if (action === "verifySession") return json_({ ok: true, user: user });
    if (action === "listEditorial") return listEditorial_(payload);
    if (action === "getMetricsSummary") return getMetricsSummary_();
    if (action === "getMaterial") return getMaterial_(payload);
    if (action === "createMaterial") {
      return withScriptLock_(function () { return saveMaterial_(payload, false); });
    }
    if (action === "updateMaterial") {
      return withScriptLock_(function () { return saveMaterial_(payload, true); });
    }
    if (action === "uploadFile") return uploadFile_(payload);

    throw apiError_("Ação não reconhecida.", "INVALID_ACTION");
  } catch (error) {
    return json_({
      ok: false,
      code: error.code || "SERVER_ERROR",
      error: error.message || "Erro interno."
    });
  }
}

function recordMetric_(payload) {
  const type = normalize_(limitedText_(payload.type, 32));
  const origin = normalize_(limitedText_(payload.origin, 48));
  const reference = slugify_(limitedText_(payload.reference, 100));
  const session = limitedText_(payload.session, 100);
  const device = normalize_(limitedText_(payload.device, 16));
  const version = limitedText_(payload.version, 24);
  const metricId = limitedText_(payload.metricId, 100);

  if (METRIC_TYPES.indexOf(type) === -1 ||
      METRIC_ORIGINS.indexOf(origin) === -1 ||
      !reference || !session) {
    throw apiError_("Métrica inválida.", "VALIDATION_ERROR");
  }
  if (!/^[a-zA-Z0-9-]{8,100}$/.test(session)) {
    throw apiError_("Sessão inválida.", "VALIDATION_ERROR");
  }

  const material = findMaterial_(reference, metricId);
  if (!material || normalize_(material.item.status) !== "publicado") {
    throw apiError_("Referência pública inválida.", "VALIDATION_ERROR");
  }

  const cache = CacheService.getScriptCache();
  const cacheKey = ["metric", session, type, reference].join(":");
  if (cache.get(cacheKey)) {
    return json_({ ok: true, accepted: false, duplicate: true });
  }

  cache.put(cacheKey, "1", type === "visualizacao" ? 21600 : 10);

  return withScriptLock_(function () {
    const sheet = metricsSheet_();
    sheet.appendRow([
      new Date(),
      metricId || material.item.id || "",
      type,
      origin,
      reference,
      ["mobile", "desktop"].indexOf(device) >= 0 ? device : "unknown",
      version
    ]);
    return json_({ ok: true, accepted: true });
  });
}

function getMetricsSummary_() {
  const values = metricsSheet_().getDataRange().getDisplayValues();
  const totals = emptyMetricTotals_();
  const byReference = {};
  let latestAt = "";

  if (values.length > 1) {
    const headers = values[0].map(canonicalKey_);
    values.slice(1).filter(function (row) { return row.some(Boolean); })
      .forEach(function (row) {
        const metric = rowToObject_(headers, row);
        const type = normalize_(metric.type);
        const reference = slugify_(metric.reference);
        if (METRIC_TYPES.indexOf(type) === -1 || !reference) return;
        totals[type] += 1;
        if (!byReference[reference]) byReference[reference] = emptyMetricTotals_();
        byReference[reference][type] += 1;
        const timestamp = String(metric.timestamp || "");
        if (timestamp > latestAt) latestAt = timestamp;
      });
  }

  return json_({
    ok: true,
    totals: totals,
    byReference: byReference,
    latestAt: latestAt
  });
}

function emptyMetricTotals_() {
  return {
    visualizacao: 0,
    clique: 0,
    download: 0,
    formulario: 0,
    compartilhamento: 0
  };
}

function doGet(event) {
  const action = String((event.parameter && event.parameter.action) || "listPublic");
  if (action !== "listPublic") {
    return json_({ ok: false, error: "Use POST para operações editoriais." });
  }
  const items = rowsAsObjects_().filter(function (item) {
    return normalize_(item.status) === "publicado";
  });
  return json_({ ok: true, items: items });
}

function requireEditor_(credential) {
  if (!credential) throw apiError_("Autenticação necessária.", "AUTH_REQUIRED");
  const clientId = requiredProperty_("GOOGLE_CLIENT_ID");
  const url = "https://oauth2.googleapis.com/tokeninfo?id_token=" +
    encodeURIComponent(credential);
  const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  if (response.getResponseCode() !== 200) {
    throw apiError_("Sessão Google inválida ou expirada.", "AUTH_REQUIRED");
  }
  const claims = JSON.parse(response.getContentText());
  const validIssuer = claims.iss === "accounts.google.com" ||
    claims.iss === "https://accounts.google.com";
  if (!validIssuer || claims.aud !== clientId || claims.email_verified !== "true") {
    throw apiError_("Credencial Google inválida.", "AUTH_REQUIRED");
  }
  const allowed = requiredProperty_("ALLOWED_EDITOR_EMAILS")
    .split(",").map(normalize_).filter(Boolean);
  if (allowed.indexOf(normalize_(claims.email)) === -1) {
    throw apiError_("Esta conta Google não tem acesso editorial.", "FORBIDDEN");
  }
  return { email: claims.email, name: claims.name || claims.email };
}

function listEditorial_(payload) {
  const items = rowsAsObjects_();
  const query = normalize_(payload.query);
  const status = normalize_(payload.status);
  const filtered = items.filter(function (item) {
    if (status && normalize_(item.status) !== status) return false;
    if (!query) return true;
    return [item.titulo, item.slug, item.categoria, item.formato]
      .map(normalize_).join(" ").indexOf(query) !== -1;
  });
  filtered.sort(function (a, b) {
    return String(b.ultimaRevisao || b.data || "")
      .localeCompare(String(a.ultimaRevisao || a.data || ""));
  });
  return json_({ ok: true, items: filtered });
}

function getMaterial_(payload) {
  const located = findMaterial_(payload.slug, payload.id);
  if (!located) throw apiError_("Material não encontrado.", "NOT_FOUND");
  return json_({ ok: true, material: located.item });
}

function saveMaterial_(payload, updating) {
  const sheet = sheet_();
  const headers = ensureHeaders_(sheet, payload);
  const submitted = cleanMaterial_(payload);
  const located = findMaterial_(payload.slugOriginal || submitted.slug, submitted.id);
  const slugOwner = findMaterial_(submitted.slug, "");

  if (updating && !located) {
    throw apiError_("Material a atualizar não foi encontrado.", "NOT_FOUND");
  }
  if (!updating && located) {
    throw apiError_("Já existe um material com este slug.", "CONFLICT");
  }
  if (updating && slugOwner && (!located || slugOwner.row !== located.row)) {
    throw apiError_("O novo slug já pertence a outro material.", "CONFLICT");
  }

  const clean = Object.assign({}, located ? located.item : {}, submitted);
  clean.id = clean.id || Utilities.getUuid();
  clean.ultimaRevisao = new Date().toISOString();
  if (!clean.data) clean.data = clean.ultimaRevisao.slice(0, 10);

  const values = headers.map(function (header) {
    const key = canonicalKey_(header);
    return clean[key] !== undefined ? clean[key] : "";
  });

  if (located) sheet.getRange(located.row, 1, 1, headers.length).setValues([values]);
  else sheet.appendRow(values);

  return json_({
    ok: true,
    id: clean.id,
    slug: clean.slug,
    status: clean.status,
    operation: located ? "updated" : "created"
  });
}

function uploadFile_(payload) {
  if (!payload.base64 || !payload.fileName) {
    throw apiError_("Arquivo inválido.", "INVALID_FILE");
  }
  const folderProperty = uploadFolderProperty_(payload.fileType, payload.status);
  const folder = DriveApp.getFolderById(requiredProperty_(folderProperty));
  const bytes = Utilities.base64Decode(payload.base64);
  const blob = Utilities.newBlob(bytes, payload.mimeType, safeFileName_(payload.fileName));
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return json_({
    ok: true,
    id: file.getId(),
    name: file.getName(),
    fileType: String(payload.fileType || ""),
    url: "https://drive.google.com/uc?export=download&id=" + file.getId()
  });
}

function uploadFolderProperty_(fileType, status) {
  const type = normalize_(fileType);
  if (type === "capa") return "BIBLIOTECA_PASTA_CAPAS";
  if (type === "anexo") return "BIBLIOTECA_PASTA_ANEXOS";
  if (normalize_(status) === "publicado") return "BIBLIOTECA_PASTA_PUBLICADOS";
  return "BIBLIOTECA_PASTA_REVISAO";
}

function findMaterial_(slug, id) {
  const sheet = sheet_();
  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return null;
  const headers = values[0].map(canonicalKey_);
  const slugIndex = headers.indexOf("slug");
  const idIndex = headers.indexOf("id");
  for (let index = 1; index < values.length; index += 1) {
    const idMatch = id && idIndex >= 0 && String(values[index][idIndex]) === String(id);
    const slugMatch = slug && slugIndex >= 0 &&
      normalize_(values[index][slugIndex]) === normalize_(slug);
    if (idMatch || slugMatch) {
      return { row: index + 1, item: rowToObject_(headers, values[index]) };
    }
  }
  return null;
}

function rowsAsObjects_() {
  const values = sheet_().getDataRange().getDisplayValues();
  if (values.length < 2) return [];
  const headers = values[0].map(canonicalKey_);
  return values.slice(1)
    .filter(function (row) { return row.some(Boolean); })
    .map(function (row) { return rowToObject_(headers, row); });
}

function rowToObject_(headers, row) {
  const object = {};
  headers.forEach(function (header, index) { object[header] = row[index]; });
  return object;
}

function sheet_() {
  const properties = PropertiesService.getScriptProperties();
  const spreadsheetId = properties.getProperty("SPREADSHEET_ID");
  const spreadsheet = spreadsheetId
    ? SpreadsheetApp.openById(spreadsheetId)
    : SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw apiError_("Planilha não configurada.", "CONFIG_ERROR");
  const name = properties.getProperty("SHEET_NAME") || DEFAULT_SHEET_NAME;
  const sheet = spreadsheet.getSheetByName(name);
  if (!sheet) throw apiError_("Aba não encontrada: " + name, "CONFIG_ERROR");
  return sheet;
}

function metricsSheet_() {
  const properties = PropertiesService.getScriptProperties();
  const spreadsheetId = properties.getProperty("SPREADSHEET_ID");
  const spreadsheet = spreadsheetId
    ? SpreadsheetApp.openById(spreadsheetId)
    : SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw apiError_("Planilha não configurada.", "CONFIG_ERROR");
  const name = properties.getProperty("METRICS_SHEET_NAME") ||
    DEFAULT_METRICS_SHEET_NAME;
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(name);
    sheet.appendRow([
      "timestamp", "metricId", "type", "origin",
      "reference", "device", "version"
    ]);
  }
  return sheet;
}

function ensureHeaders_(sheet, payload) {
  const required = [
    "id", "titulo", "slug", "categoria", "formato", "resumo", "publico",
    "nivel", "tempoLeitura", "versao", "autor", "licenca", "urlArquivo",
    "urlCapa", "urlVideo", "urlFormulario", "cta", "destaque", "status",
    "palavrasChave", "conteudoMarkdown", "anexos", "data", "ultimaRevisao",
    "altCapa", "creditoCapa", "territorio", "etapaJornada",
    "proximoSlug", "tituloProximoPasso", "resumoProximoPasso",
    "ctaProximoPasso", "urlProximoPasso", "ctaDestino",
    "tituloSeo", "descricaoSeo"
  ];
  const lastColumn = Math.max(sheet.getLastColumn(), 1);
  let headers = sheet.getRange(1, 1, 1, lastColumn).getDisplayValues()[0]
    .filter(Boolean);
  if (!headers.length) headers = required.slice();
  required.forEach(function (header) {
    if (headers.map(canonicalKey_).indexOf(canonicalKey_(header)) === -1) {
      headers.push(header);
    }
  });
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  return headers;
}

function cleanMaterial_(payload) {
  const clean = {};
  Object.keys(payload).forEach(function (key) {
    if (["action", "googleCredential", "base64", "slugOriginal"].indexOf(key) === -1) {
      clean[canonicalKey_(key)] = payload[key];
    }
  });
  clean.slug = slugify_(clean.slug || clean.titulo);
  if (!clean.titulo || !clean.slug) throw apiError_("Título e slug são obrigatórios.", "VALIDATION_ERROR");
  return clean;
}

function canonicalKey_(value) {
  const normalized = String(value || "").normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
  const aliases = {
    tempodeleitura: "tempoLeitura",
    tempoleitura: "tempoLeitura",
    urlarquivo: "urlArquivo",
    urldoarquivo: "urlArquivo",
    urlcapa: "urlCapa",
    urldacapa: "urlCapa",
    urlvideo: "urlVideo",
    urldovideo: "urlVideo",
    urlformulario: "urlFormulario",
    urldoformulario: "urlFormulario",
    palavraschave: "palavrasChave",
    conteudomarkdown: "conteudoMarkdown",
    ultimarevisao: "ultimaRevisao",
    altcapa: "altCapa",
    creditocapa: "creditoCapa",
    territorio: "territorio",
    etapajornada: "etapaJornada",
    proximoslug: "proximoSlug",
    tituloproximopasso: "tituloProximoPasso",
    resumoproximopasso: "resumoProximoPasso",
    ctaproximopasso: "ctaProximoPasso",
    urlproximopasso: "urlProximoPasso",
    ctadestino: "ctaDestino",
    tituloseo: "tituloSeo",
    descricaoseo: "descricaoSeo"
  };
  return aliases[normalized] || normalized;
}

function normalize_(value) {
  return String(value || "").normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
}

function slugify_(value) {
  return normalize_(value).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function safeFileName_(value) {
  return String(value || "arquivo").replace(/[\\/:*?"<>|]/g, "-");
}

function limitedText_(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function requiredProperty_(name) {
  const value = PropertiesService.getScriptProperties().getProperty(name);
  if (!value) throw apiError_("Propriedade ausente: " + name, "CONFIG_ERROR");
  return value;
}

function withScriptLock_(operation) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    throw apiError_("O editor está ocupado. Tente novamente.", "BUSY");
  }
  try {
    return operation();
  } finally {
    lock.releaseLock();
  }
}

function apiError_(message, code) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function json_(body) {
  return ContentService.createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
