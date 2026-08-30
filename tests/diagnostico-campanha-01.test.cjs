"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const html = read("diagnostico-organizacional.html");
const config = read("assets/js/diagnostico/config.js");
const attribution = read("assets/js/diagnostico/attribution.js");
const tracking = read("assets/js/diagnostico/tracking.js");
const form = read("assets/js/diagnostico/form.js");

const markupOnly = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "");
const ids = [...markupOnly.matchAll(/<[A-Za-z][^>]*\bid="([^"]+)"/g)].map((match) => match[1]);
assert.equal(new Set(ids).size, ids.length, "a landing não pode conter IDs duplicados");

const steps = [...html.matchAll(/data-step="(\d+)"/g)].map((match) => Number(match[1]));
assert.deepEqual(steps, [1, 2, 3, 4, 5, 6, 7], "o wizard deve manter sete etapas ordenadas");

const expectedScripts = [
  "assets/js/diagnostico/config.js",
  "assets/js/diagnostico/consent.js",
  "assets/js/diagnostico/attribution.js",
  "assets/js/diagnostico/tracking.js",
  "assets/js/diagnostico/form.js",
];
const scriptIndexes = expectedScripts.map((source) => html.indexOf(`src="${source}"`));
assert.ok(scriptIndexes.every((index) => index >= 0), "todos os scripts da campanha devem estar referenciados");
assert.deepEqual(scriptIndexes, [...scriptIndexes].sort((a, b) => a - b), "os scripts devem preservar a ordem de dependências");

assert.match(config, /formCode:\s*"PA-FRM-011"/);
assert.match(config, /campaign:\s*"diagnostico_organizacional_01"/);
assert.match(config, /policyVersion:\s*"PA-LGL-001-v1\.0"/);

for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
  assert.match(attribution, new RegExp(`['"]${key}['"]`), `a atribuição deve coletar ${key}`);
}

const attributionStorage = new Map([
  ["pa_diag01_attribution", JSON.stringify({
    first_seen_at: "2026-08-01T10:00:00.000Z",
    referrer: "https://example.org/original",
    utm_source: "origem_antiga",
    utm_medium: "teste_antigo",
    utm_campaign: "campanha_antiga",
  })],
]);
const attributionContext = {
  console,
  URLSearchParams,
  Date,
  document: { referrer: "" },
  localStorage: {
    getItem: (key) => attributionStorage.get(key) || null,
    setItem: (key, value) => attributionStorage.set(key, value),
  },
  window: {
    location: {
      search: "?utm_source=meta&utm_medium=paid_social&utm_campaign=diagnostico_organizacional_01&utm_content=feed_v3",
    },
    PA_DIAGNOSTICO_CONFIG: { campaign: "diagnostico_organizacional_01" },
  },
};
vm.createContext(attributionContext);
vm.runInContext(attribution, attributionContext, { filename: "attribution.js" });
const updatedAttribution = JSON.parse(attributionStorage.get("pa_diag01_attribution"));
assert.equal(updatedAttribution.first_seen_at, "2026-08-01T10:00:00.000Z", "a primeira visita deve ser preservada");
assert.equal(updatedAttribution.referrer, "https://example.org/original", "o primeiro referrer deve ser preservado");
assert.equal(updatedAttribution.utm_source, "meta", "um clique explícito deve substituir a origem antiga");
assert.equal(updatedAttribution.utm_medium, "paid_social");
assert.equal(updatedAttribution.utm_campaign, "diagnostico_organizacional_01");
assert.equal(updatedAttribution.utm_content, "feed_v3");

assert.match(form, /answers:\s*getAnswers\(\)/, "respostas devem permanecer em answers");
assert.match(form, /consents:\s*\{[\s\S]*contact:[\s\S]*marketing:[\s\S]*policy_version:/, "consentimentos devem permanecer separados");
assert.match(form, /website:\s*form\.elements\.website\.value/, "o honeypot deve permanecer fora de answers");
assert.match(form, /formData\.getAll\(name\)/, "campos múltiplos devem usar FormData.getAll");
assert.match(form, /if\s*\(!currentEventId\)\s*currentEventId\s*=\s*generateUUID\(\)/, "retry deve reutilizar o event_id atual");
assert.match(form, /Mantém o event_id para a nova tentativa/, "o contrato de retry deve permanecer explícito");
assert.match(form, /policyVersion\s*===\s*['"]PENDENTE['"][\s\S]*127\.0\.0\.1[\s\S]*localhost/, "PENDENTE deve bloquear fora do ambiente local");

assert.match(tracking, /const submittedEventIds = new Set\(\)/, "diagnostic_submit deve ser idempotente por event_id");
assert.match(tracking, /!submittedEventIds\.has\(eventId\)/);
assert.match(tracking, /submittedEventIds\.add\(eventId\)/);
for (const piiKey of ["name", "email", "phone", "answers", "nome_completo", "email_corporativo", "telefone", "instituicao"]) {
  assert.match(tracking, new RegExp(`['"]${piiKey}['"]`), `o filtro de PII deve conter ${piiKey}`);
}

const videoRelative = "assets/media/videos/campanhas/campanha-01/PA-CAM-001_SITE_VIDEO-PROMOCIONAL_v0.1.2_2026-08-27.mp4";
assert.match(html, new RegExp(videoRelative.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
const videoPath = path.join(root, videoRelative);
assert.ok(fs.existsSync(videoPath), "o vídeo oficial da campanha deve existir");
assert.equal(fs.statSync(videoPath).size, 7007488, "o vídeo deve corresponder à versão validada no Drive");
assert.match(tracking, /video_id:\s*['"]PA-CAM-001-v0\.1\.2['"]/);

console.log("diagnostico-campanha-01.test.cjs: todos os cenários passaram");
