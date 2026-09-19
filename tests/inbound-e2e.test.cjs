"use strict";

/**
 * Ponta a ponta do funil inbound, em Node `vm`.
 *
 * Executa os módulos REAIS (`config.js`, `attribution.js`, `tracking.js`,
 * `form.js`) sobre um DOM mínimo e um transporte substituído, e percorre:
 *
 *   entrada no Blog com UTM -> clique no CTA -> navegação para o Diagnóstico
 *   -> preenchimento das sete etapas -> envio com dados sintéticos
 *
 * Comprova: a atribuição da campanha chega ao payload do formulário, o evento
 * de aceite só ocorre após resposta aceita, o envio duplicado é bloqueado, a
 * falha de transporte gera evento de erro e nenhum dado pessoal alcança o
 * dataLayer. Nenhuma requisição real é feita: `fetch` é um duplo local.
 */

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const attributionSource = read("assets/js/diagnostico/attribution.js");
const trackingSource = read("assets/js/diagnostico/tracking.js");
const formSource = read("assets/js/diagnostico/form.js");
const configSource = read("assets/js/diagnostico/config.js");

const ATTRIBUTION_KEY = "pa_diag01_attribution";
const OFFICIAL_ENDPOINT = "https://script.google.com/macros/s/AKfycbw_kf2bj6m9bkMJXuX9dz6zTkQ2aqLDr2zs0mqu-miPdoYUdq3bOhooKg5FTM2_lNOkRw/exec";

// Dados exclusivamente sintéticos — nenhum dado pessoal real.
const SYNTHETIC = {
  nome_completo: "Pessoa Sintética de Teste",
  email_corporativo: "teste@example.invalid",
  telefone: "000000000",
  cidade_estado: "Cidade/UF",
  instituicao: "Organização Sintética",
  cargo: "Cargo Sintético",
  tipo_organizacao: "OSC",
  colaboradores: "1 a 10",
  maior_desafio: "Desafio sintético",
  metas_12_meses: "Meta sintética",
};

// ---------------------------------------------------------------------------
// DOM mínimo
// ---------------------------------------------------------------------------

function createElement(props = {}) {
  const attributes = new Map(Object.entries(props.attributes || {}));
  const listeners = {};
  const children = [];

  const element = {
    id: props.id || "",
    name: props.name || "",
    type: props.type || "text",
    required: Boolean(props.required),
    value: props.value !== undefined ? props.value : "",
    checked: Boolean(props.checked),
    hidden: Boolean(props.hidden),
    disabled: Boolean(props.disabled),
    tabindex: props.tabindex,
    textContent: props.textContent || "",
    className: "",
    style: {},
    dataset: props.dataset || {},
    listeners,
    children,
    parentElement: props.parentElement || null,
    addEventListener(type, handler) {
      (listeners[type] = listeners[type] || []).push(handler);
    },
    removeEventListener() {},
    setAttribute(name, value) { attributes.set(name, String(value)); },
    removeAttribute(name) { attributes.delete(name); },
    getAttribute(name) { return attributes.has(name) ? attributes.get(name) : null; },
    hasAttribute(name) { return attributes.has(name); },
    focus() { element.focused = true; },
    scrollIntoView() {},
    reset() {},
    querySelectorAll(selector) {
      const fields = props.fields || [];
      if (selector.includes('tabindex="-1"')) {
        return fields.filter((field) => field.getAttribute("tabindex") !== "-1");
      }
      return fields;
    },
    dispatch(type, event) {
      for (const handler of listeners[type] || []) handler(event);
    },
  };

  if (props.tabindex !== undefined) attributes.set("tabindex", String(props.tabindex));
  return element;
}

class FakeFormData {
  constructor(form) {
    this.entries = [];
    for (const field of form.elements) {
      if (!field.name) continue;
      if (field.type === "checkbox" && !field.checked) continue;
      this.entries.push([field.name, field.value]);
    }
  }
  get(name) {
    const found = this.entries.find((entry) => entry[0] === name);
    return found ? found[1] : null;
  }
  getAll(name) {
    return this.entries.filter((entry) => entry[0] === name).map((entry) => entry[1]);
  }
}

function buildDom() {
  // Campos por etapa, na ordem usada pelo wizard real.
  const step1 = Object.entries({
    nome_completo: SYNTHETIC.nome_completo,
    email_corporativo: SYNTHETIC.email_corporativo,
    telefone: SYNTHETIC.telefone,
    cidade_estado: SYNTHETIC.cidade_estado,
    instituicao: SYNTHETIC.instituicao,
    cargo: SYNTHETIC.cargo,
  }).map(([name, value]) => createElement({ id: name, name, type: name === "email_corporativo" ? "email" : "text", required: true, value }));

  const step2 = [
    createElement({ id: "tipo_organizacao", name: "tipo_organizacao", type: "select", required: true, value: SYNTHETIC.tipo_organizacao }),
    createElement({ id: "colaboradores", name: "colaboradores", type: "select", required: true, value: SYNTHETIC.colaboradores }),
  ];

  const step6 = [
    createElement({ id: "ad-dados", name: "areas_desenvolver", type: "checkbox", value: "Gestão de Dados", checked: true }),
    createElement({ id: "ad-ia", name: "areas_desenvolver", type: "checkbox", value: "IA", checked: true }),
    createElement({ id: "ad-outro", name: "areas_desenvolver", type: "checkbox", value: "Outro", checked: false }),
    createElement({ id: "maior_desafio", name: "maior_desafio", type: "textarea", required: true, value: SYNTHETIC.maior_desafio }),
    createElement({ id: "metas_12_meses", name: "metas_12_meses", type: "textarea", required: true, value: SYNTHETIC.metas_12_meses }),
  ];

  const contactField = createElement({ id: "consent-contact", name: "contact", type: "checkbox", required: true, checked: true });
  const marketingField = createElement({ id: "lead-consent-marketing", name: "marketing", type: "checkbox", checked: false });
  const honeypot = createElement({ id: "website", name: "website", type: "text", value: "", tabindex: -1 });
  const step7 = [contactField, marketingField, honeypot];

  const steps = [step1, step2, [], [], [], step6, step7].map((fields, index) =>
    createElement({ dataset: { step: String(index + 1) }, fields, hidden: index !== 0 }));

  const allFields = [...step1, ...step2, ...step6, ...step7];

  const form = createElement({ id: "diag-form", fields: allFields });
  form.querySelectorAll = (selector) => (selector === ".form-step" ? steps : []);
  form.elements = allFields.slice();
  for (const field of allFields) if (field.name) form.elements[field.name] = field;

  const progressParent = createElement({});
  const progressIndicator = createElement({ id: "progress-indicator" });
  progressIndicator.parentElement = progressParent;

  const registry = {
    "diag-form": form,
    "submit-button": createElement({ id: "submit-button", textContent: "Enviar diagnóstico" }),
    "prev-button": createElement({ id: "prev-button", hidden: true }),
    "next-button": createElement({ id: "next-button" }),
    "reset-button": createElement({ id: "reset-button" }),
    "form-status": createElement({ id: "form-status" }),
    "success-message": createElement({ id: "success-message", hidden: true }),
    "progress-indicator": progressIndicator,
    "submission-id": createElement({ id: "submission-id" }),
  };
  for (const field of allFields) registry[`error-${field.name}`] = createElement({ id: `error-${field.name}` });

  return { registry, form, steps, contactField, marketingField, honeypot, progressParent };
}

// ---------------------------------------------------------------------------
// Execução do funil
// ---------------------------------------------------------------------------

function runFunnel(options = {}) {
  const { entrySearch, fetchImpl } = options;
  const dom = buildDom();
  const dataLayer = [];
  const storage = new Map();
  const session = new Map();
  const domReady = [];
  const fetchCalls = [];

  const localStorageStub = {
    getItem: (key) => (storage.has(key) ? storage.get(key) : null),
    setItem: (key, value) => storage.set(key, String(value)),
  };
  const sessionStorageStub = {
    getItem: (key) => (session.has(key) ? session.get(key) : null),
    setItem: (key, value) => session.set(key, String(value)),
  };

  // --- Documento A: entrada no Blog com UTM -------------------------------
  // Contexto próprio porque em produção são documentos distintos; o que
  // atravessa a navegação é apenas o armazenamento da mesma origem.
  const entryContext = {
    console: { log() {}, error() {}, warn() {} },
    Set, Date, JSON, URLSearchParams,
    localStorage: localStorageStub,
    sessionStorage: sessionStorageStub,
    document: { addEventListener() {}, removeEventListener() {}, getElementById: () => null, documentElement: { scrollHeight: 1000 } },
    window: { dataLayer, location: { search: entrySearch, pathname: "/blog/maturidade-automacao.html", hostname: "projetoanonimo.org" }, scrollY: 0, innerHeight: 800 },
  };
  entryContext.globalThis = entryContext;
  vm.createContext(entryContext);
  vm.runInContext(`${configSource}\n${attributionSource}`, entryContext, { filename: "entry-attribution.js" });
  const storedAtEntry = storage.get(ATTRIBUTION_KEY);

  // --- Documento B: página canônica do Diagnóstico -------------------------
  const context = {
    console: { log() {}, error() {}, warn() {} },
    Set, Date, JSON, URLSearchParams, Uint8Array,
    crypto: { getRandomValues: (array) => crypto.webcrypto.getRandomValues(array) },
    setTimeout: () => 0,
    clearTimeout: () => {},
    FormData: FakeFormData,
    localStorage: localStorageStub,
    sessionStorage: sessionStorageStub,
    document: {
      addEventListener: (type, handler) => { if (type === "DOMContentLoaded") domReady.push(handler); },
      removeEventListener: () => {},
      getElementById: (id) => dom.registry[id] || null,
      documentElement: { scrollHeight: 1000 },
    },
    window: { dataLayer, location: { search: "", pathname: "/diagnostico-organizacional.html", hostname: "127.0.0.1" }, scrollY: 0, innerHeight: 800 },
    fetch: async (url, init) => {
      fetchCalls.push({ url, init });
      return fetchImpl(url, init);
    },
  };
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(
    `${configSource}\n${attributionSource}\n${trackingSource}\n${formSource}`,
    context,
    { filename: "diagnostic-page.js" },
  );

  // --- Ciclo de vida real da página ---------------------------------------
  for (const handler of domReady) handler();

  return { context, dom, dataLayer, storage, storedAtEntry, fetchCalls };
}

const CAMPAIGN_SEARCH = "?utm_source=instagram&utm_medium=organic_feed&utm_campaign=vozes_soberania_v1&utm_content=ep02_artigo";

function advanceToLastStep(funnel) {
  const next = funnel.dom.registry["next-button"];
  for (let i = 0; i < 6; i += 1) next.dispatch("click");
  assert.equal(funnel.dom.registry["progress-indicator"].textContent, "Etapa 7 de 7", "o wizard deve chegar à etapa de envio");
}

function submit(funnel) {
  funnel.dom.form.dispatch("submit", { preventDefault() {} });
}

(async () => {

// ---------------------------------------------------------------------------
// Cenário 1 — envio aceito pelo fluxo local
// ---------------------------------------------------------------------------

const okFunnel = runFunnel({
  entrySearch: CAMPAIGN_SEARCH,
  fetchImpl: async () => ({ ok: true, status: 200, json: async () => ({ ok: true, submission_id: "SYN-0001" }) }),
});

// A captura aconteceu na entrada, antes de qualquer interação.
assert.ok(okFunnel.storedAtEntry, "a atribuição deve ser gravada na entrada do Blog");
assert.equal(JSON.parse(okFunnel.storedAtEntry).utm_campaign, "vozes_soberania_v1");

assert.match(JSON.stringify(okFunnel.dataLayer), /diagnostic_landing_view/, "a visualização da página deve ser registrada");
assert.ok(
  okFunnel.dataLayer.filter((entry) => entry.event === "diagnostic_step_view").length >= 1,
  "as etapas do wizard devem ser registradas",
);

// Primeira interação real dispara o início do diagnóstico.
okFunnel.dom.form.dispatch("input", {});
assert.ok(okFunnel.dataLayer.some((entry) => entry.event === "diagnostic_start"), "o início do diagnóstico deve ser registrado");

advanceToLastStep(okFunnel);
submit(okFunnel);

// Aguarda a resolução assíncrona do envio.
await new Promise((resolve) => setImmediate(resolve));
await new Promise((resolve) => setImmediate(resolve));

assert.equal(okFunnel.fetchCalls.length, 1, "o envio deve produzir exatamente uma chamada de rede");
assert.equal(okFunnel.fetchCalls[0].url, OFFICIAL_ENDPOINT, "o endpoint oficial deve ser preservado");

const payload = JSON.parse(okFunnel.fetchCalls[0].init.body);

// Atribuição da campanha chegou ao formulário, de ponta a ponta.
assert.equal(payload.attribution.utm_source, "instagram");
assert.equal(payload.attribution.utm_medium, "organic_feed");
assert.equal(payload.attribution.utm_campaign, "vozes_soberania_v1", "a campanha do Blog deve chegar ao payload");
assert.equal(payload.attribution.utm_content, "ep02_artigo");

// Contrato do payload.
assert.equal(payload.metadata.form_code, "PA-FRM-011");
assert.equal(payload.metadata.landing_path, "/diagnostico-organizacional.html");
assert.equal(payload.metadata.event_id, payload.metadata.event_id);
assert.equal(typeof payload.metadata.session_id, "string");
assert.equal(payload.answers.nome_completo, SYNTHETIC.nome_completo);
assert.deepEqual(payload.answers.areas_desenvolver, ["Gestão de Dados", "IA"], "campos múltiplos devem ir como array");
assert.equal(payload.consents.contact, true);
assert.equal(payload.consents.marketing, false);
assert.equal(payload.consents.policy_version, "PA-LGL-001-v1.0");
assert.equal(payload.website, "", "o honeypot deve ser enviado separadamente e vazio");

// Separação entre respostas e consentimentos.
assert.ok(!("contact" in payload.answers), "o consentimento não pode vazar para answers");
assert.ok(!("marketing" in payload.answers), "o consentimento não pode vazar para answers");
assert.ok(!("website" in payload.answers), "o honeypot não pode vazar para answers");

// Estado de sucesso na interface.
assert.equal(okFunnel.dom.registry["success-message"].hidden, false, "a mensagem de sucesso deve ser exibida");
assert.equal(okFunnel.dom.form.hidden, true, "o formulário deve ser ocultado após o aceite");
assert.equal(okFunnel.dom.registry["submission-id"].textContent, "SYN-0001", "o identificador de referência deve ser exibido");

// Ordem dos eventos: tentativa antes do aceite.
const okEvents = okFunnel.dataLayer.map((entry) => entry.event);
const attemptIndex = okEvents.indexOf("diagnostic_submit_attempt");
const acceptedIndex = okEvents.indexOf("diagnostic_submit");
assert.ok(attemptIndex >= 0, "a tentativa de envio deve ser registrada");
assert.ok(acceptedIndex > attemptIndex, "o aceite deve ser registrado após a tentativa");
assert.equal(okEvents.filter((name) => name === "diagnostic_submit").length, 1, "o aceite deve ocorrer uma única vez");
assert.ok(!okEvents.includes("diagnostic_error"), "não pode haver erro em um envio aceito");

// Nenhum dado pessoal no dataLayer.
const dataLayerJson = JSON.stringify(okFunnel.dataLayer);
for (const value of Object.values(SYNTHETIC)) {
  assert.ok(!dataLayerJson.includes(value), `nenhum valor pessoal pode aparecer no dataLayer: ${value}`);
}
assert.ok(!dataLayerJson.includes("example.invalid"), "nenhum e-mail pode aparecer no dataLayer");
assert.ok(!dataLayerJson.includes("answers"), "respostas não podem aparecer no dataLayer");

// ---------------------------------------------------------------------------
// Cenário 2 — envio duplicado bloqueado
// ---------------------------------------------------------------------------

const duplicateCalls = okFunnel.fetchCalls.length;
submit(okFunnel);
submit(okFunnel);
await new Promise((resolve) => setImmediate(resolve));
assert.equal(okFunnel.fetchCalls.length, duplicateCalls, "um segundo envio não pode gerar nova chamada de rede");
assert.equal(
  okFunnel.dataLayer.filter((entry) => entry.event === "diagnostic_submit").length,
  1,
  "o aceite deve continuar único após tentativas de reenvio",
);

// ---------------------------------------------------------------------------
// Cenário 3 — falha de transporte
// ---------------------------------------------------------------------------

const failureFunnel = runFunnel({
  entrySearch: CAMPAIGN_SEARCH,
  fetchImpl: async () => { throw new Error("falha sintética de rede"); },
});
advanceToLastStep(failureFunnel);
submit(failureFunnel);
await new Promise((resolve) => setImmediate(resolve));
await new Promise((resolve) => setImmediate(resolve));

const failureEvents = failureFunnel.dataLayer.map((entry) => entry.event);
assert.ok(failureEvents.includes("diagnostic_submit_attempt"), "a tentativa deve ser registrada antes da falha");
assert.ok(!failureEvents.includes("diagnostic_submit"), "não pode haver aceite quando o transporte falha");

const transportError = failureFunnel.dataLayer.find((entry) => entry.event === "diagnostic_error");
assert.ok(transportError, "a falha de transporte deve gerar evento de erro técnico");
assert.equal(transportError.stage, "transport");
assert.equal(failureFunnel.dom.registry["success-message"].hidden, true, "a mensagem de sucesso não pode aparecer em falha");
assert.match(failureFunnel.dom.registry["form-status"].textContent, /Falha ao enviar/, "a mensagem de erro deve ser exibida ao usuário");
assert.ok(!JSON.stringify(failureFunnel.dataLayer).includes("falha sintética de rede"), "a mensagem bruta do erro não pode ir ao dataLayer");

// ---------------------------------------------------------------------------
// Cenário 4 — rejeição por servidor e por validação
// ---------------------------------------------------------------------------

const serverFunnel = runFunnel({
  entrySearch: CAMPAIGN_SEARCH,
  fetchImpl: async () => ({ ok: true, status: 200, json: async () => ({ ok: false, message: "recusado" }) }),
});
advanceToLastStep(serverFunnel);
submit(serverFunnel);
await new Promise((resolve) => setImmediate(resolve));
await new Promise((resolve) => setImmediate(resolve));

const serverError = serverFunnel.dataLayer.find((entry) => entry.event === "diagnostic_error");
assert.ok(serverError, "a recusa do servidor deve gerar evento de erro técnico");
assert.equal(serverError.stage, "server");
assert.equal(serverError.http_status, 200);
assert.ok(!serverFunnel.dataLayer.some((entry) => entry.event === "diagnostic_submit"), "recusa do servidor não gera aceite");

const invalidFunnel = runFunnel({
  entrySearch: CAMPAIGN_SEARCH,
  fetchImpl: async () => ({ ok: true, status: 200, json: async () => ({ ok: true }) }),
});
// Tenta avançar com a etapa 1 vazia: a validação deve bloquear.
for (const field of invalidFunnel.dom.steps[0].querySelectorAll('[name]:not([tabindex="-1"])')) {
  field.value = "";
}
invalidFunnel.dom.registry["next-button"].dispatch("click");

assert.equal(invalidFunnel.dom.registry["progress-indicator"].textContent, "Etapa 1 de 7", "a etapa inválida não pode avançar");
const validationError = invalidFunnel.dataLayer.find((entry) => entry.event === "diagnostic_validation_error");
assert.ok(validationError, "a rejeição por validação deve gerar evento próprio");
assert.equal(validationError.step, 1);
assert.equal(invalidFunnel.fetchCalls.length, 0, "não pode haver chamada de rede quando a validação falha");
assert.equal(
  invalidFunnel.dom.steps[0].querySelectorAll('[name]')[0].getAttribute("aria-invalid"),
  "true",
  "o campo inválido deve ser marcado para leitores de tela",
);
assert.equal(
  invalidFunnel.dom.registry["error-nome_completo"].textContent,
  "Este campo é obrigatório.",
  "a mensagem por campo deve ser preenchida para leitores de tela",
);
assert.equal(
  invalidFunnel.dom.registry["form-status"].textContent,
  "",
  "o avanço bloqueado não altera o status geral do formulário",
);

// O envio com a etapa inválida precisa exibir o status geral e não chamar a rede.
submit(invalidFunnel);
assert.equal(
  invalidFunnel.dom.registry["form-status"].textContent,
  "Por favor, revise os campos destacados.",
  "a mensagem de erro de validação deve ser exibida no envio",
);
assert.equal(invalidFunnel.fetchCalls.length, 0, "não pode haver chamada de rede com a etapa inválida");
assert.equal(
  invalidFunnel.dataLayer.filter((entry) => entry.event === "diagnostic_validation_error").length,
  2,
  "cada tentativa bloqueada pela validação deve gerar um evento",
);

// ---------------------------------------------------------------------------
// Cenário 5 — resposta inesperada (corpo não interpretável)
// ---------------------------------------------------------------------------

const malformedFunnel = runFunnel({
  entrySearch: CAMPAIGN_SEARCH,
  fetchImpl: async () => ({
    ok: true,
    status: 200,
    json: async () => { throw new SyntaxError("corpo não é JSON"); },
  }),
});
advanceToLastStep(malformedFunnel);
submit(malformedFunnel);
await new Promise((resolve) => setImmediate(resolve));
await new Promise((resolve) => setImmediate(resolve));

const malformedEvents = malformedFunnel.dataLayer.map((entry) => entry.event);
assert.ok(malformedEvents.includes("diagnostic_submit_attempt"), "a tentativa deve ser registrada antes da resposta inesperada");
assert.ok(!malformedEvents.includes("diagnostic_submit"), "resposta inesperada não pode gerar aceite");
assert.equal(
  malformedFunnel.dataLayer.filter((entry) => entry.event === "diagnostic_error" && entry.stage === "transport").length,
  1,
  "a resposta inesperada deve ser tratada como falha de transporte",
);
assert.equal(malformedFunnel.dom.registry["success-message"].hidden, true, "não pode haver sucesso em resposta inesperada");
assert.match(malformedFunnel.dom.registry["form-status"].textContent, /Falha ao enviar/, "o usuário deve receber mensagem de erro");
assert.ok(
  !JSON.stringify(malformedFunnel.dataLayer).includes("não é JSON"),
  "a mensagem bruta da exceção não pode ir ao dataLayer",
);

console.log("inbound-e2e.test.cjs: todos os cenários passaram");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
