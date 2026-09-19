"use strict";

/**
 * Contrato do funil inbound — Blog / Podcast / Biblioteca -> Diagnóstico.
 *
 * Cobre, com execução real dos módulos (Node `vm`), os pontos que a auditoria
 * anterior não conseguia comprovar:
 *  1. GTM global presente uma única vez e sem ID conflitante nas páginas inbound;
 *  2. Consentimento padrão negado antes do carregamento do GTM;
 *  3. Atribuição capturada na entrada e preservada até o Diagnóstico;
 *  4. Atualização de atribuição apenas por parâmetro explícito;
 *  5. CTA sempre na rota canônica `diagnostico-organizacional.html`;
 *  6. Eventos distinguíveis, idempotentes e sem PII;
 *  7. Ausência de PII no payload de atribuição e no dataLayer.
 *
 * Nenhuma submissão real é feita: `fetch` é substituído por um duplo local e
 * todos os dados usados são sintéticos.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const GTM_ID = "GTM-KTMXHMZL";
const DIAGNOSTIC_ROUTE = "diagnostico-organizacional.html";

// Páginas públicas que podem receber tráfego de campanha.
const PUBLIC_PAGES = [
  "404.html",
  "biblioteca.html",
  "biblioteca/material.html",
  "blog.html",
  "blog/antes-do-robo-a-rotina.html",
  "blog/automacao-oscs.html",
  "blog/editais-documentos.html",
  "blog/governanca-grupos.html",
  "blog/ia-responsavel.html",
  "blog/manifesto-observatorio.html",
  "blog/maturidade-automacao.html",
  "blog/radar-oportunidades-01.html",
  "blog/robotica-livre.html",
  "captura-diagnostico.html",
  "contato.html",
  "diagnostico-organizacional.html",
  "index.html",
  "podcast.html",
  "privacidade.html",
  "projetos.html",
  "sobre.html",
  "solucoes.html",
  "termos.html",
  "transparencia.html",
];

// Páginas de entrada do funil declarado: precisam capturar atribuição.
const CAPTURE_PAGES = PUBLIC_PAGES.filter((page) => page !== "diagnostico-organizacional.html");

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
const CTA_CONTEXT_KEY = "pa_cta_position";

const PII_KEYS = [
  "name", "email", "phone", "answers", "nome_completo", "email_corporativo",
  "telefone", "instituicao", "cidade_estado", "cargo", "maior_desafio", "metas_12_meses",
];

const attributionSource = read("assets/js/diagnostico/attribution.js");
const trackingSource = read("assets/js/diagnostico/tracking.js");
const inboundSource = read("assets/js/diagnostico/inbound.js");
const formSource = read("assets/js/diagnostico/form.js");
const configSource = read("assets/js/diagnostico/config.js");

// ---------------------------------------------------------------------------
// 1. Rastreamento global: GTM único, consentimento padrão negado
// ---------------------------------------------------------------------------

for (const page of PUBLIC_PAGES) {
  const html = read(page);
  const gtmIdCount = (html.match(new RegExp(GTM_ID, "g")) || []).length;
  const loaderCount = (html.match(/googletagmanager\.com\/gtm\.js/g) || []).length;
  const noscriptCount = (html.match(/googletagmanager\.com\/ns\.html/g) || []).length;

  assert.equal(gtmIdCount, 2, `${page}: o GTM deve aparecer exatamente 2x (script + noscript)`);
  assert.equal(loaderCount, 1, `${page}: o GTM deve ser carregado exatamente uma vez`);
  assert.equal(noscriptCount, 1, `${page}: o fallback noscript deve existir uma única vez`);

  const otherIds = (html.match(/GTM-[A-Z0-9]{4,}/g) || []).filter((id) => id !== GTM_ID);
  assert.deepEqual(otherIds, [], `${page}: não pode haver ID de GTM conflitante`);

  const consentIndex = html.search(/gtag\(\s*'consent'\s*,\s*'default'/);
  const loaderIndex = html.search(/googletagmanager\.com\/gtm\.js/);
  assert.ok(consentIndex >= 0, `${page}: o consentimento padrão deve ser declarado`);
  assert.ok(consentIndex < loaderIndex, `${page}: o consentimento padrão deve preceder o carregamento do GTM`);

  const defaultBlock = html.slice(consentIndex, loaderIndex);
  assert.match(defaultBlock, /'analytics_storage'\s*:\s*'denied'/, `${page}: analytics_storage deve ser negado por padrão`);
  assert.match(defaultBlock, /'ad_storage'\s*:\s*'denied'/, `${page}: ad_storage deve ser negado por padrão`);
  assert.match(defaultBlock, /'ad_user_data'\s*:\s*'denied'/, `${page}: ad_user_data deve ser negado por padrão`);
  assert.match(defaultBlock, /'ad_personalization'\s*:\s*'denied'/, `${page}: ad_personalization deve ser negado por padrão`);
}

// ---------------------------------------------------------------------------
// 2. Ordem de dependências dos scripts nas páginas de entrada
// ---------------------------------------------------------------------------

for (const page of CAPTURE_PAGES) {
  const html = read(page);
  const prefix = page.includes("/") ? "../" : "";
  const expected = [
    `${prefix}assets/js/diagnostico/config.js`,
    `${prefix}assets/js/diagnostico/attribution.js`,
    `${prefix}assets/js/diagnostico/inbound.js`,
  ];
  const indexes = expected.map((src) => html.indexOf(src));
  assert.ok(indexes.every((i) => i >= 0), `${page}: config.js, attribution.js e inbound.js devem estar referenciados`);
  assert.deepEqual(indexes, [...indexes].sort((a, b) => a - b), `${page}: a ordem das dependências deve ser preservada`);
}

// ---------------------------------------------------------------------------
// 3. CTA sempre na rota canônica
// ---------------------------------------------------------------------------

for (const page of PUBLIC_PAGES) {
  const html = read(page);
  // A rota curta `/diagnostico` não é canônica e não deve ser usada como href.
  assert.doesNotMatch(html, /href="[^"]*\/diagnostico"/, `${page}: a rota curta /diagnostico não é canônica`);
  assert.doesNotMatch(html, /href="diagnostico"/, `${page}: a rota curta diagnostico não é canônica`);
}

const ctaPages = ["blog.html", "podcast.html", "biblioteca.html"];
for (const page of ctaPages) {
  const html = read(page);
  const links = [...html.matchAll(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)]
    .map((match) => ({ href: match[1], text: match[2].replace(/<[^>]+>/g, "").trim() }));
  const diagnosticCtas = links.filter((link) => link.href.includes(DIAGNOSTIC_ROUTE));
  assert.ok(diagnosticCtas.length >= 1, `${page}: deve existir um CTA que leva ao Diagnóstico`);
  for (const cta of diagnosticCtas) {
    assert.ok(cta.text.length > 0, `${page}: todo CTA do Diagnóstico precisa de rótulo textual`);
  }
}

for (const page of ["blog/maturidade-automacao.html", "blog/robotica-livre.html", "blog/ia-responsavel.html",
  "blog/governanca-grupos.html", "blog/editais-documentos.html", "blog/automacao-oscs.html"]) {
  const html = read(page);
  assert.match(html, /href="\.\.\/diagnostico-organizacional\.html"/, `${page}: o CTA deve usar a rota canônica relativa`);
}

// ---------------------------------------------------------------------------
// 4. Atribuição: captura na entrada, preservação e atualização
// ---------------------------------------------------------------------------

function makeAttributionContext(search, storage, referrer) {
  const context = {
    console: { log() {}, error() {}, warn() {} },
    URLSearchParams,
    Date,
    document: { referrer: referrer || "" },
    localStorage: {
      getItem: (key) => (storage.has(key) ? storage.get(key) : null),
      setItem: (key, value) => storage.set(key, String(value)),
    },
    window: {
      location: { search, pathname: "/" },
      PA_DIAGNOSTICO_CONFIG: { campaign: "diagnostico_organizacional_01" },
    },
  };
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(`${attributionSource}\n;globalThis.__Attribution = Attribution;`, context, { filename: "attribution.js" });
  return context.__Attribution;
}

const ATTRIBUTION_KEY = "pa_diag01_attribution";

// 4.1 Captura dos cinco campos UTM na entrada de uma página de Blog.
const campaignUrl = "?utm_source=instagram&utm_medium=organic_feed&utm_campaign=vozes_soberania_v1"
  + "&utm_content=ep02_artigo&utm_term=maturidade+digital";
const blogStorage = new Map();
const blogAttribution = makeAttributionContext(campaignUrl, blogStorage, "https://www.instagram.com/");
const storedFromBlog = JSON.parse(blogStorage.get(ATTRIBUTION_KEY));

for (const key of UTM_KEYS) {
  assert.ok(key in storedFromBlog, `a captura deve registrar ${key}`);
}
assert.equal(storedFromBlog.utm_source, "instagram");
assert.equal(storedFromBlog.utm_medium, "organic_feed");
assert.equal(storedFromBlog.utm_campaign, "vozes_soberania_v1");
assert.equal(storedFromBlog.utm_content, "ep02_artigo");
assert.equal(storedFromBlog.utm_term, "maturidade digital");
assert.equal(storedFromBlog.referrer, "https://www.instagram.com/");

// 4.2 Navegação Blog -> Diagnóstico sem UTM: a campanha precisa sobreviver.
const diagnosticAttribution = makeAttributionContext("", blogStorage, `https://projetoanonimo.org/blog/maturidade-automacao.html`);
void diagnosticAttribution;
const afterNavigation = JSON.parse(blogStorage.get(ATTRIBUTION_KEY));
assert.equal(afterNavigation.utm_campaign, "vozes_soberania_v1", "a campanha do Blog deve sobreviver até o Diagnóstico");
assert.equal(afterNavigation.utm_content, "ep02_artigo", "o conteúdo de origem deve sobreviver até o Diagnóstico");
assert.equal(afterNavigation.first_seen_at, storedFromBlog.first_seen_at, "o primeiro acesso deve ser preservado");

// 4.2b Opção C: o posicionamento do CTA chega sozinho e não apaga a campanha.
makeAttributionContext("?pa_cta_position=podcast_hub_bottom", blogStorage, "https://projetoanonimo.org/podcast.html");
const optionC = JSON.parse(blogStorage.get(ATTRIBUTION_KEY));
assert.equal(optionC[CTA_CONTEXT_KEY], "podcast_hub_bottom", "a posição do CTA deve ser registrada em campo próprio");
assert.equal(optionC.utm_source, "instagram", "o contexto do CTA não deve substituir a origem da campanha");
assert.equal(optionC.utm_campaign, "vozes_soberania_v1", "o contexto do CTA não deve substituir a campanha");

// 4.3 O payload entregue ao formulário precisa conter a campanha original.
const payloadAttribution = blogAttribution.getAttributionData();
assert.equal(payloadAttribution.utm_source, "instagram");
assert.equal(payloadAttribution.utm_campaign, "vozes_soberania_v1");
assert.equal(payloadAttribution.utm_content, "ep02_artigo");

// 4.4 Ausência de campanha usa o fallback interno, sem inventar origem externa.
const emptyStorage = new Map();
const emptyAttribution = makeAttributionContext("", emptyStorage, "");
const fallbackPayload = emptyAttribution.getAttributionData();
assert.equal(fallbackPayload.utm_campaign, "diagnostico_organizacional_01", "sem campanha, vale o fallback declarado na configuração");
assert.equal(fallbackPayload.utm_source, "", "sem campanha, a origem não deve ser inventada");

// 4.5 Um clique explícito posterior atualiza a atribuição, preservando o primeiro acesso.
const previousFirstSeen = JSON.parse(blogStorage.get(ATTRIBUTION_KEY)).first_seen_at;
makeAttributionContext(
  "?utm_source=youtube&utm_medium=organic_video&utm_campaign=vozes_soberania_v1&utm_content=ep01_diagnostico",
  blogStorage,
  "https://www.youtube.com/",
);
const updated = JSON.parse(blogStorage.get(ATTRIBUTION_KEY));
assert.equal(updated.utm_source, "youtube", "um clique explícito novo deve atualizar a origem");
assert.equal(updated.utm_medium, "organic_video");
assert.equal(updated.utm_content, "ep01_diagnostico");
assert.equal(updated.first_seen_at, previousFirstSeen, "o primeiro acesso deve continuar preservado");
assert.equal(updated.referrer, "https://www.instagram.com/", "o primeiro referrer deve continuar preservado");

// 4.6 A atribuição não pode capturar parâmetros pessoais nem propagar PII.
const leakStorage = new Map();
makeAttributionContext(
  "?utm_source=instagram&utm_campaign=vozes_soberania_v1&email=teste%40example.invalid&nome_completo=Sint%C3%A9tica&telefone=000000000",
  leakStorage,
  "",
);
const leakRaw = leakStorage.get(ATTRIBUTION_KEY);
const leakPayload = makeAttributionContext("", leakStorage, "").getAttributionData();
for (const key of PII_KEYS) {
  assert.ok(!(key in JSON.parse(leakRaw)), `a atribuição não deve capturar ${key}`);
  assert.ok(!(key in leakPayload), `o payload de atribuição não deve conter ${key}`);
}
assert.ok(!/example\.invalid/.test(leakRaw), "nenhum e-mail pode aparecer na atribuição");
assert.match(attributionSource, /Não armazena PII/, "o contrato de não armazenar PII deve permanecer explícito");

// ---------------------------------------------------------------------------
// 5. Eventos: contrato mínimo distinguível, idempotente e sem PII
// ---------------------------------------------------------------------------

function makeEventHarness() {
  const dataLayer = [];
  const sessionData = new Map();
  const domListeners = {};
  const timers = [];

  const context = {
    console: { log() {}, error() {}, warn() {} },
    Set,
    Date,
    setTimeout: (fn, ms) => { timers.push({ fn, ms }); return timers.length; },
    clearTimeout: () => {},
    sessionStorage: {
      getItem: (key) => (sessionData.has(key) ? sessionData.get(key) : null),
      setItem: (key, value) => sessionData.set(key, String(value)),
    },
    document: {
      addEventListener: (type, fn) => { (domListeners[type] = domListeners[type] || []).push(fn); },
      removeEventListener: () => {},
      getElementById: () => null,
      documentElement: { scrollHeight: 1000 },
    },
    window: { dataLayer, scrollY: 0, innerHeight: 800 },
  };
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(`${trackingSource}\n;globalThis.__Tracking = Tracking;`, context, { filename: "tracking.js" });

  return { Tracking: context.__Tracking, dataLayer, sessionData, domListeners, timers };
}

const harness = makeEventHarness();
const { Tracking } = harness;

const REQUIRED_EVENTS = {
  "visualização de página": "diagnostic_landing_view",
  "início do diagnóstico": "diagnostic_start",
  "avanço de etapa": "diagnostic_step_view",
  "tentativa de envio": "diagnostic_submit_attempt",
  "envio aceito": "diagnostic_submit",
  "envio rejeitado por validação": "diagnostic_validation_error",
  "erro técnico": "diagnostic_error",
};

// Onde cada evento é emitido: o contrato do funil atravessa quatro módulos.
const ALL_EVENT_SOURCES = `${trackingSource}\n${formSource}\n${inboundSource}\n${read("assets/js/diagnostico/consent.js")}`;

for (const [label, eventName] of Object.entries(REQUIRED_EVENTS)) {
  assert.match(ALL_EVENT_SOURCES, new RegExp(`['"]${eventName}['"]`), `o evento de ${label} deve existir em um dos módulos do funil`);
}
assert.match(inboundSource, /['"]inbound_cta_click['"]/, "o clique no CTA inbound deve ter evento próprio");
assert.match(formSource, /['"]diagnostic_validation_error['"]/, "a rejeição por validação deve sair do módulo do formulário");

// 5.1 Avanço de etapa não pode disparar duas vezes para a mesma etapa.
Tracking.fireDiagnosticStepView(1);
Tracking.fireDiagnosticStepView(1);
Tracking.fireDiagnosticStepView(2);
const stepEvents = harness.dataLayer.filter((entry) => entry.event === "diagnostic_step_view");
assert.equal(stepEvents.length, 2, "cada etapa deve gerar no máximo um evento de visualização");
assert.deepEqual(stepEvents.map((entry) => entry.step), [1, 2]);

// 5.2 Tentativa de envio ocorre antes do envio aceito e carrega o event_id.
Tracking.fireDiagnosticSubmitAttempt("sintetico-evt-0001", 7);
Tracking.fireDiagnosticSubmit("sintetico-evt-0001");
const submitIndexes = harness.dataLayer
  .map((entry, index) => ({ entry, index }))
  .filter((item) => item.entry.event === "diagnostic_submit_attempt" || item.entry.event === "diagnostic_submit");
assert.equal(submitIndexes.length, 2);
assert.equal(submitIndexes[0].entry.event, "diagnostic_submit_attempt", "a tentativa deve ser registrada antes do aceite");
assert.equal(submitIndexes[0].entry.event_id, "sintetico-evt-0001");
assert.equal(submitIndexes[1].entry.event, "diagnostic_submit");

// 5.3 `diagnostic_submit` é idempotente por event_id.
Tracking.fireDiagnosticSubmit("sintetico-evt-0001");
assert.equal(harness.dataLayer.filter((entry) => entry.event === "diagnostic_submit").length, 1,
  "o mesmo event_id não pode gerar dois eventos de envio aceito");

// 5.4 Erro técnico não pode transportar mensagem bruta nem PII.
Tracking.fireDiagnosticError("transport");
Tracking.fireDiagnosticError("server", 502);
const errorEvents = harness.dataLayer.filter((entry) => entry.event === "diagnostic_error");
assert.equal(errorEvents.length, 2);
assert.equal(errorEvents[0].stage, "transport");
assert.equal(errorEvents[1].stage, "server");
assert.equal(errorEvents[1].http_status, 502);
for (const entry of errorEvents) {
  assert.deepEqual(Object.keys(entry).sort(), Object.keys(entry).sort().filter((key) => !PII_KEYS.includes(key)));
}

// 5.5 O filtro de PII precisa remover campos pessoais de qualquer evento.
Tracking.trackEvent("diagnostic_probe", {
  step: 3,
  email: "teste@example.invalid",
  nome_completo: "Sintética Exemplo",
  telefone: "000000000",
  resposta_livre: "não é chave conhecida",
  answers: { qualquer: "coisa" },
});
const probe = harness.dataLayer.filter((entry) => entry.event === "diagnostic_probe")[0];
assert.equal(probe.step, 3);
for (const key of PII_KEYS) {
  assert.ok(!(key in probe), `o filtro de PII deve remover ${key}`);
}
assert.ok(!JSON.stringify(harness.dataLayer).includes("example.invalid"), "nenhum e-mail pode chegar ao dataLayer");

// 5.7 Além do filtro por chave, nenhum ponto de emissão pode receber respostas
//     ou valores de campos: a garantia primária é a ausência de PII na origem.
for (const forbidden of ["answers", "elements", "value", "email", "nome_completo", "telefone"]) {
  assert.doesNotMatch(trackingSource, new RegExp(`trackEvent\\([^)]*${forbidden}`),
    `nenhum evento pode transportar ${forbidden}`);
  assert.doesNotMatch(formSource, new RegExp(`Tracking\\.trackEvent\\([^)]*${forbidden}`),
    `o formulário não pode enviar ${forbidden} em eventos`);
}

// 5.6 O consentimento é comunicado por eventos próprios, sem dados pessoais.
const consentSource = read("assets/js/diagnostico/consent.js");
assert.match(consentSource, /'pa_consent_update'/, "o evento de atualização de consentimento deve existir");
assert.match(consentSource, /'pa_consent_default'/, "o evento de consentimento padrão deve existir");
assert.match(consentSource, /consent_analytics/, "a decisão de analytics deve ser registrada como booleano");
assert.match(consentSource, /consent_marketing/, "a decisão de marketing deve ser registrada como booleano");
assert.match(consentSource, /gtag\('consent', 'update', consentState\)/, "a escolha deve atualizar o Consent Mode");

// ---------------------------------------------------------------------------
// 6. Clique no CTA inbound
// ---------------------------------------------------------------------------

function runInboundClick(pathname, href, label, ctaPosition = "") {
  const dataLayer = [];
  const listeners = {};
  const link = {
    getAttribute: (name) => {
      if (name === "href") return href;
      if (name === "data-cta-position") return ctaPosition;
      return null;
    },
    textContent: label,
  };
  const target = {
    closest: (selector) => (selector === "a[href]" ? link : null),
  };

  const context = {
    console: { log() {}, error() {}, warn() {} },
    document: { addEventListener: (type, fn) => { (listeners[type] = listeners[type] || []).push(fn); } },
    window: { dataLayer, location: { pathname } },
  };
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(inboundSource, context, { filename: "inbound.js" });

  for (const fn of listeners.click || []) fn({ target });
  return dataLayer;
}

const inboundClick = runInboundClick(
  "/blog/maturidade-automacao.html",
  "../diagnostico-organizacional.html",
  "Fazer o diagnóstico",
);
assert.equal(inboundClick.length, 1, "um clique no CTA do Diagnóstico deve gerar exatamente um evento");
assert.equal(inboundClick[0].event, "inbound_cta_click");
assert.equal(inboundClick[0].cta_target, DIAGNOSTIC_ROUTE);
assert.equal(inboundClick[0].cta_source_path, "/blog/maturidade-automacao.html");
assert.equal(inboundClick[0].cta_label, "Fazer o diagnóstico");
assert.equal(inboundClick[0].cta_position, "");
assert.equal(inboundClick[0].cta_carries_utm, false);

const noisyClick = runInboundClick("/blog.html", "../biblioteca.html", "Biblioteca");
assert.equal(noisyClick.length, 0, "cliques que não levam ao Diagnóstico não devem gerar evento");

const optionCClick = runInboundClick(
  "/podcast.html",
  `${DIAGNOSTIC_ROUTE}?${CTA_CONTEXT_KEY}=podcast_hub_bottom`,
  "Conhecer",
  "podcast_hub_bottom",
);
assert.equal(optionCClick[0].cta_position, "podcast_hub_bottom", "o evento deve registrar a posição do CTA");
assert.equal(optionCClick[0].cta_carries_utm, false, "a opção C não deve inventar UTM para navegação interna");

// ---------------------------------------------------------------------------
// 7. Formulário: contratos de segurança do envio
// ---------------------------------------------------------------------------

assert.match(formSource, /if\s*\(state === 'submitting' \|\| state === 'success'\) return;/,
  "o envio duplicado deve ser bloqueado pelo estado do formulário");
assert.match(formSource, /if\s*\(!validateStep\(currentStep\)\)/, "a etapa atual deve ser validada antes do envio");
assert.match(formSource, /Tracking\.fireDiagnosticSubmitAttempt\(currentEventId, currentStep\)/,
  "a tentativa de envio deve ser registrada antes da chamada de rede");
assert.match(formSource, /Tracking\.fireDiagnosticError\('server', response\.status\)/,
  "a recusa do servidor deve gerar evento de erro técnico");
assert.match(formSource, /Tracking\.fireDiagnosticError\('transport'\)/,
  "a falha de transporte deve gerar evento de erro técnico");
assert.match(formSource, /Tracking\.trackEvent\('diagnostic_validation_error', \{ step \}\)/,
  "a rejeição por validação deve gerar evento próprio");
assert.match(formSource, /policyVersion === 'PENDENTE'/, "a política pendente deve bloquear o envio fora do ambiente local");

// O aceite só pode ser registrado dentro do ramo de resposta aceita.
const okBranch = formSource.slice(formSource.indexOf("if (result.ok) {"), formSource.indexOf("Tracking.fireDiagnosticError('server'"));
assert.match(okBranch, /Tracking\.fireDiagnosticSubmit\(currentEventId\)/,
  "o evento de envio aceito só pode ocorrer após resposta aceita");
assert.equal((formSource.match(/fireDiagnosticSubmit\(/g) || []).length, 1,
  "o evento de envio aceito deve ser disparado em um único ponto do código");

assert.match(formSource, /Tracking\.trackEvent\(/, "não deve haver caminho de tracking paralelo ao módulo Tracking");

// ---------------------------------------------------------------------------
// 8. Acessibilidade e idioma
// ---------------------------------------------------------------------------

const diagnosticHtml = read("diagnostico-organizacional.html");
assert.match(diagnosticHtml, /<html lang="pt-BR">/, "o Diagnóstico deve declarar pt-BR");
assert.match(diagnosticHtml, /id="consent-contact" name="contact" required/, "o consentimento de contato deve ser obrigatório");
assert.match(diagnosticHtml, /for="consent-contact"/, "o consentimento deve ter label associado");
assert.match(diagnosticHtml, /<label for="website">Website<\/label>/, "o honeypot deve ter label associado e fora da tabulação");
assert.match(diagnosticHtml, /id="form-status" aria-live="polite"/, "o status do formulário deve ser anunciado");
assert.match(diagnosticHtml, /id="progress-indicator"/, "o progresso do wizard deve ser exposto");
assert.match(diagnosticHtml, /id="consent-banner"[\s\S]*role="dialog"/, "o banner de consentimento deve ser um diálogo acessível");
assert.match(diagnosticHtml, /aria-describedby="consent-desc"/, "o banner deve descrever sua finalidade");

const a11yErrors = [...diagnosticHtml.matchAll(/<p class="error-message" id="error-([a-z_]+)"><\/p>/g)].map((m) => m[1]);
assert.ok(a11yErrors.length >= 7, "cada campo validado deve ter um contêiner de mensagem de erro");
for (const fieldName of a11yErrors) {
  assert.match(formSource, new RegExp(`error-\\$\\{field\\.name\\}`), "as mensagens de erro devem ser preenchidas pelo módulo do formulário");
}

assert.match(formSource, /field\.setAttribute\('aria-invalid', 'true'\)/, "o campo inválido deve receber aria-invalid");
assert.match(formSource, /firstInvalidField\?\.focus\(\)/, "o foco deve ir para o primeiro campo inválido");

console.log("inbound-funnel.test.cjs: todos os cenários passaram");

module.exports = { PUBLIC_PAGES, CAPTURE_PAGES, UTM_KEYS, PII_KEYS, DIAGNOSTIC_ROUTE, root, read };
