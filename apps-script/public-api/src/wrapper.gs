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
