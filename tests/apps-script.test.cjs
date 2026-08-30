"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const headers = [
  "id", "titulo", "slug", "categoria", "formato", "resumo", "status",
  "data", "ultimaRevisao", "urlArquivo", "anexos",
];
const rows = [
  headers,
  ["pub-1", "Material publicado", "material-publicado", "IA", "Guia", "Resumo", "Publicado", "2026-08-01", "2026-08-01", "", ""],
  ["draft-1", "Rascunho original", "rascunho-original", "Gestão", "Artigo", "Antes", "Rascunho", "2026-08-02", "2026-08-02", "https://example.com/original.pdf", "[{\"name\":\"anexo.txt\"}]"],
];
const metricsRows = [
  ["timestamp", "metricId", "type", "origin", "reference", "device", "version"],
];

function createRangeFor(data, row, column, rowCount, columnCount) {
  return {
    getDisplayValues() {
      return Array.from({ length: rowCount }, (_, rowOffset) =>
        Array.from({ length: columnCount }, (_, columnOffset) =>
          String(data[row - 1 + rowOffset]?.[column - 1 + columnOffset] ?? "")
        )
      );
    },
    setValues(values) {
      values.forEach((sourceRow, rowOffset) => {
        const targetIndex = row - 1 + rowOffset;
        data[targetIndex] ||= [];
        sourceRow.forEach((value, columnOffset) => {
          data[targetIndex][column - 1 + columnOffset] = value;
        });
      });
    },
  };
}

function createSheet(data) {
  const sheet = {
    getLastColumn: () => Math.max(...data.map((row) => row.length)),
    getDataRange: () => createRangeFor(
      data, 1, 1, data.length, sheet.getLastColumn()
    ),
    getRange: (row, column, rowCount, columnCount) =>
      createRangeFor(data, row, column, rowCount, columnCount),
    appendRow(values) {
      data.push(values.slice());
    },
  };
  return sheet;
}

const sheet = createSheet(rows);
const metricsSheet = createSheet(metricsRows);
const spreadsheet = {
  getSheetByName(name) {
    if (name === "Biblioteca") return sheet;
    if (name === "MetricasV2") return metricsSheet;
    return null;
  },
  insertSheet(name) {
    assert.equal(name, "MetricasV2");
    return metricsSheet;
  },
};

const properties = {
  GOOGLE_CLIENT_ID: "client-id.apps.googleusercontent.com",
  ALLOWED_EDITOR_EMAILS: "editor@projetoanonimo.org",
  SPREADSHEET_ID: "sheet-id",
  SHEET_NAME: "Biblioteca",
  BIBLIOTECA_PASTA_CAPAS: "folder-capas",
  BIBLIOTECA_PASTA_ANEXOS: "folder-anexos",
  BIBLIOTECA_PASTA_PUBLICADOS: "folder-publicados",
  BIBLIOTECA_PASTA_REVISAO: "folder-revisao",
};

let fetchedCredential = "";
const cacheValues = new Map();
const uploadedFiles = [];
const context = {
  console,
  Date,
  Error,
  JSON,
  Object,
  String,
  Array,
  Math,
  encodeURIComponent,
  PropertiesService: {
    getScriptProperties: () => ({ getProperty: (name) => properties[name] || null }),
  },
  SpreadsheetApp: {
    openById: () => spreadsheet,
    getActiveSpreadsheet: () => null,
  },
  UrlFetchApp: {
    fetch(url) {
      fetchedCredential = new URL(url).searchParams.get("id_token");
      if (fetchedCredential === "invalid") {
        return { getResponseCode: () => 401, getContentText: () => "{}" };
      }
      return {
        getResponseCode: () => 200,
        getContentText: () => JSON.stringify({
          aud: properties.GOOGLE_CLIENT_ID,
          iss: "https://accounts.google.com",
          email_verified: "true",
          email: fetchedCredential === "outsider"
            ? "outsider@example.com"
            : "editor@projetoanonimo.org",
          name: "Editor",
        }),
      };
    },
  },
  ContentService: {
    MimeType: { JSON: "application/json" },
    createTextOutput(value) {
      return {
        value,
        setMimeType() { return this; },
      };
    },
  },
  Utilities: {
    getUuid: () => `uuid-${rows.length}`,
    base64Decode: (value) => Buffer.from(value, "base64"),
    newBlob: (bytes, mimeType, name) => ({ bytes, mimeType, name }),
  },
  DriveApp: {
    Access: { ANYONE_WITH_LINK: "ANYONE_WITH_LINK" },
    Permission: { VIEW: "VIEW" },
    getFolderById: (folderId) => ({
      createFile: (blob) => {
        const file = {
          id: `file-${uploadedFiles.length + 1}`,
          folderId,
          name: blob.name,
          mimeType: blob.mimeType,
        };
        uploadedFiles.push(file);
        return {
          getId: () => file.id,
          getName: () => file.name,
          setSharing: () => {},
        };
      },
    }),
  },
  LockService: {
    getScriptLock: () => ({
      tryLock: () => true,
      releaseLock: () => {},
    }),
  },
  CacheService: {
    getScriptCache: () => ({
      get: (key) => cacheValues.get(key) || null,
      put: (key, value) => cacheValues.set(key, value),
    }),
  },
};

vm.createContext(context);
const codePath = path.join(__dirname, "..", "apps-script", "Code.gs");
vm.runInContext(fs.readFileSync(codePath, "utf8"), context, { filename: codePath });

function post(payload) {
  const output = context.doPost({
    postData: { contents: JSON.stringify({ googleCredential: "valid", ...payload }) },
  });
  return JSON.parse(output.value);
}

function postPublic(payload) {
  const output = context.doPost({
    postData: { contents: JSON.stringify(payload) },
  });
  return JSON.parse(output.value);
}

function rowObject(slug) {
  const index = headers.indexOf("slug");
  const row = rows.find((item, rowIndex) => rowIndex > 0 && item[index] === slug);
  return row && Object.fromEntries(headers.map((header, column) => [header, row[column]]));
}

assert.deepEqual(
  post({ action: "verifySession" }),
  { ok: true, user: { email: "editor@projetoanonimo.org", name: "Editor" } },
  "a sessão autorizada deve ser aceita"
);

const invalid = context.doPost({
  postData: { contents: JSON.stringify({ action: "verifySession", googleCredential: "invalid" }) },
});
assert.equal(JSON.parse(invalid.value).code, "AUTH_REQUIRED");

const outsider = context.doPost({
  postData: { contents: JSON.stringify({ action: "verifySession", googleCredential: "outsider" }) },
});
assert.equal(JSON.parse(outsider.value).code, "FORBIDDEN");

const publicList = JSON.parse(context.doGet({ parameter: {} }).value);
assert.equal(publicList.items.length, 1, "a API pública não deve expor rascunhos");
assert.equal(publicList.items[0].slug, "material-publicado");

const recordedMetric = postPublic({
  action: "recordMetric",
  metricId: "pub-1",
  type: "visualizacao",
  origin: "biblioteca-individual",
  reference: "material-publicado",
  session: "session-12345678",
  device: "desktop",
  version: "1.2.0",
});
assert.equal(recordedMetric.accepted, true, "a métrica pública válida deve ser aceita");
assert.equal(metricsRows.length, 2);
assert.equal(
  metricsRows[1].includes("session-12345678"),
  false,
  "o identificador da sessão não deve ser persistido"
);

const duplicateMetric = postPublic({
  action: "recordMetric",
  type: "visualizacao",
  origin: "biblioteca-individual",
  reference: "material-publicado",
  session: "session-12345678",
});
assert.equal(duplicateMetric.duplicate, true, "a repetição imediata deve ser limitada");
assert.equal(metricsRows.length, 2);

const invalidMetric = postPublic({
  action: "recordMetric",
  type: "administrar",
  origin: "biblioteca-individual",
  reference: "material-publicado",
  session: "session-abcdefgh",
});
assert.equal(invalidMetric.code, "VALIDATION_ERROR");

const draftMetric = postPublic({
  action: "recordMetric",
  type: "download",
  origin: "biblioteca-individual",
  reference: "rascunho-original",
  session: "session-abcdefgh",
});
assert.equal(draftMetric.code, "VALIDATION_ERROR");

const listed = post({ action: "listEditorial" });
assert.equal(listed.ok, true);
assert.equal(listed.items.length, 2, "a listagem editorial deve incluir publicado e rascunho");
assert.equal(
  post({ action: "listEditorial", status: "Rascunho" }).items.length,
  1,
  "o filtro de status deve localizar o rascunho"
);

const metricsSummary = post({ action: "getMetricsSummary" });
assert.equal(metricsSummary.totals.visualizacao, 1);
assert.equal(metricsSummary.byReference["material-publicado"].visualizacao, 1);

const opened = post({ action: "getMaterial", slug: "rascunho-original" });
assert.equal(opened.material.id, "draft-1");
assert.equal(opened.material.resumo, "Antes");

const updated = post({
  action: "updateMaterial",
  slugOriginal: "rascunho-original",
  id: "draft-1",
  titulo: "Rascunho atualizado",
  slug: "rascunho-atualizado",
  resumo: "Depois",
  status: "Em revisão",
});
assert.equal(updated.operation, "updated");
assert.equal(rowObject("rascunho-atualizado").resumo, "Depois");
assert.equal(rowObject("rascunho-atualizado").status, "Em revisão");
assert.equal(
  rowObject("rascunho-atualizado").urlArquivo,
  "https://example.com/original.pdf",
  "a atualização parcial deve preservar o arquivo existente"
);
assert.equal(
  rowObject("rascunho-atualizado").anexos,
  "[{\"name\":\"anexo.txt\"}]",
  "a atualização parcial deve preservar anexos existentes"
);

const created = post({
  action: "createMaterial",
  titulo: "Novo material",
  slug: "novo-material",
  resumo: "Novo",
  ctaDestino: "#como-usar",
  urlProximoPasso: "/diagnostico-organizacional.html",
  tituloSeo: "Novo material para OSCs",
  descricaoSeo: "Descrição editorial para busca e compartilhamento.",
  status: "Rascunho",
});
assert.equal(created.operation, "created");
assert.equal(rowObject("novo-material").status, "Rascunho");
assert.equal(rowObject("novo-material").ctaDestino, "#como-usar");
assert.equal(
  rowObject("novo-material").urlProximoPasso,
  "/diagnostico-organizacional.html"
);
assert.equal(rowObject("novo-material").tituloSeo, "Novo material para OSCs");
assert.equal(
  rowObject("novo-material").descricaoSeo,
  "Descrição editorial para busca e compartilhamento."
);
for (const expectedHeader of [
  "ctaDestino",
  "urlProximoPasso",
  "tituloSeo",
  "descricaoSeo",
]) {
  assert.ok(
    rows[0].includes(expectedHeader),
    `o contrato deve garantir o cabeçalho ${expectedHeader}`
  );
}

const duplicate = post({
  action: "createMaterial",
  titulo: "Duplicado",
  slug: "novo-material",
  status: "Rascunho",
});
assert.equal(duplicate.ok, false);
assert.equal(duplicate.code, "CONFLICT");

const uploaded = post({
  action: "uploadFile",
  fileName: "material.pdf",
  mimeType: "application/pdf",
  base64: Buffer.from("pdf").toString("base64"),
});
assert.equal(uploaded.ok, true);
assert.equal(uploaded.id, "file-1");

console.log("apps-script.test.cjs: todos os cenários passaram");

module.exports = {
  cacheValues,
  context,
  headers,
  metricsRows,
  post,
  postPublic,
  properties,
  rowObject,
  rows,
  uploadedFiles,
};
