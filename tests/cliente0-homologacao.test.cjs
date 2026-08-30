"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const harness = require("./apps-script.test.cjs");

const results = [];
function runCase(id, title, operation) {
  try {
    const evidence = operation();
    results.push({ id, title, status: "APROVADO_LOCAL", evidence });
  } catch (error) {
    results.push({ id, title, status: "FALHOU", evidence: error.message });
    throw error;
  }
}

function parseOutput(output) {
  return JSON.parse(output.value);
}

const synthetic = {
  titulo: "Material Cliente 0 — Teste Sintético",
  slug: "cliente-0-teste-sintetico",
  autor: "Equipe de Homologação",
  resumo: "Registro sintético criado exclusivamente para validar o framework.",
  status: "Rascunho",
};

runCase("C0-01", "Login permitido", () => {
  const result = harness.post({ action: "verifySession" });
  assert.equal(result.ok, true);
  assert.equal(result.user.email, "editor@projetoanonimo.org");
  return "credencial sintética autorizada aceita";
});

runCase("C0-02", "Login não permitido", () => {
  const output = harness.context.doPost({
    postData: {
      contents: JSON.stringify({
        action: "verifySession",
        googleCredential: "outsider",
      }),
    },
  });
  const result = parseOutput(output);
  assert.equal(result.ok, false);
  assert.equal(result.code, "FORBIDDEN");
  return "credencial externa sintética bloqueada com FORBIDDEN";
});

let createdId = "";
runCase("C0-03", "Criar rascunho", () => {
  const result = harness.post({ action: "createMaterial", ...synthetic });
  assert.equal(result.operation, "created");
  assert.equal(result.status, "Rascunho");
  createdId = result.id;
  assert.equal(harness.rowObject(synthetic.slug).status, "Rascunho");
  return `slug=${synthetic.slug}; status=Rascunho`;
});

runCase("C0-04", "Reabrir e editar", () => {
  const opened = harness.post({ action: "getMaterial", slug: synthetic.slug });
  assert.equal(opened.material.resumo, synthetic.resumo);

  const updatedSummary = "Resumo sintético atualizado na homologação local.";
  const updated = harness.post({
    action: "updateMaterial",
    slugOriginal: synthetic.slug,
    id: createdId,
    ...synthetic,
    resumo: updatedSummary,
  });
  assert.equal(updated.operation, "updated");

  const reopened = harness.post({ action: "getMaterial", slug: synthetic.slug });
  assert.equal(reopened.material.resumo, updatedSummary);
  return "resumo sintético persistiu após reabertura";
});

runCase("C0-05", "Upload de capa", () => {
  const result = harness.post({
    action: "uploadFile",
    fileType: "capa",
    status: "Rascunho",
    fileName: "cliente-0-capa-sintetica.png",
    mimeType: "image/png",
    base64: Buffer.from("imagem-sintetica").toString("base64"),
  });
  assert.equal(result.ok, true);
  assert.equal(result.fileType, "capa");
  assert.equal(harness.uploadedFiles.at(-1).folderId, "folder-capas");
  return `arquivo=${result.name}; destino=CAPAS`;
});

runCase("C0-06", "Upload de PDF e anexo", () => {
  const pdf = harness.post({
    action: "uploadFile",
    fileType: "arquivo",
    status: "Rascunho",
    fileName: "cliente-0-material-sintetico.pdf",
    mimeType: "application/pdf",
    base64: Buffer.from("pdf-sintetico").toString("base64"),
  });
  assert.equal(pdf.ok, true);
  assert.equal(harness.uploadedFiles.at(-1).folderId, "folder-revisao");

  const attachment = harness.post({
    action: "uploadFile",
    fileType: "anexo",
    status: "Rascunho",
    fileName: "cliente-0-anexo-sintetico.txt",
    mimeType: "text/plain",
    base64: Buffer.from("anexo-sintetico").toString("base64"),
  });
  assert.equal(attachment.ok, true);
  assert.equal(harness.uploadedFiles.at(-1).folderId, "folder-anexos");
  return "PDF direcionado a REVISAO; anexo direcionado a ANEXOS";
});

runCase("C0-07", "Publicar no ambiente de teste", () => {
  const result = harness.post({
    action: "updateMaterial",
    slugOriginal: synthetic.slug,
    id: createdId,
    ...synthetic,
    status: "Publicado",
  });
  assert.equal(result.status, "Publicado");

  const publicList = parseOutput(harness.context.doGet({ parameter: {} }));
  assert.ok(publicList.items.some((item) => item.slug === synthetic.slug));
  return "material sintético retornado pela API pública simulada";
});

runCase("C0-08", "Biblioteca Viva", () => {
  require("./biblioteca-sprint-2.1.test.cjs");
  return "busca, ordenação, URL e carregamento progressivo validados em VM local";
});

const metricSession = "cliente0-session-sintetica";
runCase("C0-09", "Métrica pública", () => {
  const before = harness.metricsRows.length;
  const result = harness.postPublic({
    action: "recordMetric",
    metricId: createdId,
    type: "visualizacao",
    origin: "biblioteca-individual",
    reference: synthetic.slug,
    session: metricSession,
    device: "desktop",
    version: "1.2.0",
  });
  assert.equal(result.accepted, true);
  assert.equal(harness.metricsRows.length, before + 1);
  assert.equal(harness.metricsRows.at(-1).includes(metricSession), false);
  return "visualização aceita sem persistir identificador de sessão";
});

runCase("C0-10", "Abuso de métrica", () => {
  const before = harness.metricsRows.length;
  const duplicate = harness.postPublic({
    action: "recordMetric",
    type: "visualizacao",
    origin: "biblioteca-individual",
    reference: synthetic.slug,
    session: metricSession,
  });
  assert.equal(duplicate.duplicate, true);
  assert.equal(harness.metricsRows.length, before);

  const invalid = harness.postPublic({
    action: "recordMetric",
    type: "administrar",
    origin: "biblioteca-individual",
    reference: synthetic.slug,
    session: "outra-session-sintetica",
  });
  assert.equal(invalid.code, "VALIDATION_ERROR");
  return "repetição limitada e tipo inválido rejeitado";
});

runCase("C0-11", "Arquivar", () => {
  const result = harness.post({
    action: "updateMaterial",
    slugOriginal: synthetic.slug,
    id: createdId,
    ...synthetic,
    status: "Arquivado",
  });
  assert.equal(result.status, "Arquivado");

  const publicList = parseOutput(harness.context.doGet({ parameter: {} }));
  assert.equal(publicList.items.some((item) => item.slug === synthetic.slug), false);
  return "material sintético arquivado e removido da listagem pública simulada";
});

runCase("C0-12", "Sair", () => {
  const storage = new Map([
    ["paGoogleCredential", "credencial-sintetica"],
    ["paGoogleUser", JSON.stringify({ name: "Pessoa de Teste" })],
  ]);
  let redirectedTo = "";
  const authContext = {
    console,
    sessionStorage: {
      getItem: (key) => storage.get(key) || null,
      setItem: (key, value) => storage.set(key, value),
      removeItem: (key) => storage.delete(key),
    },
    window: {
      location: {
        replace(value) {
          redirectedTo = value;
        },
      },
    },
    location: { pathname: "/editor/dashboard.html", search: "" },
    fetch: async () => ({ json: async () => ({ ok: true }) }),
    atob: (value) => Buffer.from(value, "base64").toString("binary"),
    decodeURIComponent,
    encodeURIComponent,
  };
  vm.createContext(authContext);
  const authPath = path.join(__dirname, "..", "editor", "assets", "js", "auth.js");
  vm.runInContext(fs.readFileSync(authPath, "utf8"), authContext, {
    filename: authPath,
  });
  authContext.window.paAuth.signOut();
  assert.equal(storage.size, 0);
  assert.equal(redirectedTo, "login.html");
  return "sessão local removida e redirecionamento para login confirmado";
});

assert.equal(results.length, 12);
assert.equal(results.every((item) => item.status === "APROVADO_LOCAL"), true);

console.log("\nHomologação local Cliente 0:");
results.forEach((item) => {
  console.log(`${item.id} | ${item.status} | ${item.title} | ${item.evidence}`);
});
console.log("cliente0-homologacao.test.cjs: 12/12 casos locais aprovados");

module.exports = { results };
