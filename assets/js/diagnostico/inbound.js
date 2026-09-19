/**
 * Módulo do funil inbound (páginas de entrada: Blog, Podcast e Biblioteca).
 *
 * Responsabilidade única: registrar o clique no CTA que leva ao Diagnóstico
 * Organizacional, para que o funil seja distinguível de ponta a ponta.
 *
 * Contratos respeitados:
 * - reutiliza o `window.dataLayer` já criado pelo snippet do GTM; não carrega
 *   o GTM novamente e não cria uma segunda implementação de consentimento;
 * - não cria cookies nem novas chaves de armazenamento: a captura de atribuição
 *   continua sendo feita exclusivamente por `attribution.js`;
 * - não envia PII: apenas o destino do CTA, o caminho da página de origem, um
 *   rótulo curto do próprio link, a posição declarada do CTA e um sinalizador
 *   booleano de presença de UTM.
 *
 * Este arquivo deve ser carregado depois de `config.js` e `attribution.js`
 * (a ordem é verificada por `tests/inbound-funnel.test.cjs`).
 */
(function () {
  'use strict';

  var DIAGNOSTIC_TARGET = 'diagnostico-organizacional.html';
  var MAX_LABEL_LENGTH = 80;

  var PII_KEYS = ['name', 'email', 'phone', 'answers', 'nome_completo', 'email_corporativo', 'telefone', 'instituicao'];

  function safeLabel(link) {
    var text = (link.textContent || '').replace(/\s+/g, ' ').trim();
    return text.slice(0, MAX_LABEL_LENGTH);
  }

  function safePosition(link) {
    var value = (link.getAttribute('data-cta-position') || '').trim();
    return /^[a-z0-9_-]{1,80}$/i.test(value) ? value : '';
  }

  function handleClick(event) {
    var target = event && event.target;
    if (!target || typeof target.closest !== 'function') return;

    var link = target.closest('a[href]');
    if (!link) return;

    var href = link.getAttribute('href') || '';
    if (href.indexOf(DIAGNOSTIC_TARGET) === -1) return;

    var payload = {
      event: 'inbound_cta_click',
      cta_target: DIAGNOSTIC_TARGET,
      cta_source_path: window.location.pathname,
      cta_label: safeLabel(link),
      cta_position: safePosition(link),
      cta_carries_utm: href.indexOf('utm_') !== -1
    };

    // Defesa em profundidade: nunca propagar chaves de PII para o dataLayer.
    PII_KEYS.forEach(function (key) {
      delete payload[key];
    });

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
  }

  document.addEventListener('click', handleClick);
})();
