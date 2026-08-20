/**
 * Módulo de Tracking de Eventos.
 * Abstrai o envio de eventos para o dataLayer e gerencia eventos específicos.
 */
const Tracking = (() => {
  window.dataLayer = window.dataLayer || [];
  const submittedEventIds = new Set();

  const sessionFlags = {
    qualifiedVisit: 'pa_diag01_qualified_visit_sent',
    diagnosticStart: 'pa_diag01_diagnostic_start_sent'
  };

  /**
   * Envia um evento para o dataLayer, garantindo que PII não seja incluído.
   * @param {string} eventName - O nome do evento.
   * @param {object} [data={}] - Dados adicionais do evento.
   */
  function trackEvent(eventName, data = {}) {
    // NUNCA enviar PII ou respostas para o dataLayer
    const piiKeys = ['name', 'email', 'phone', 'answers', 'nome_completo', 'email_corporativo', 'telefone', 'instituicao'];
    const safeData = { ...data };
    piiKeys.forEach(key => delete safeData[key]);

    console.log('Tracking Event:', eventName, safeData);
    window.dataLayer.push({
      event: eventName,
      ...safeData
    });
  }

  /**
   * Inicializa os listeners para eventos automáticos.
   */
  function init() {
    // 1. diagnostic_landing_view
    trackEvent('diagnostic_landing_view');

    // 2. qualified_visit
    initQualifiedVisitTracking();

    // 3. diagnostic_cta_click
    const heroCta = document.getElementById('diagnostic-hero-cta');
    if (heroCta) {
      heroCta.addEventListener('click', () => {
        trackEvent('diagnostic_cta_click', { cta_id: 'diagnostic-hero-cta' });
      });
    }
  }

  /**
   * Configura o tracking de "visita qualificada" (30s OU 50% de scroll).
   */
  function initQualifiedVisitTracking() {
    if (sessionStorage.getItem(sessionFlags.qualifiedVisit)) return;

    const sendQualifiedVisitEvent = () => {
      if (sessionStorage.getItem(sessionFlags.qualifiedVisit)) return;
      sessionStorage.setItem(sessionFlags.qualifiedVisit, 'true');
      trackEvent('qualified_visit');
      document.removeEventListener('scroll', scrollListener);
      clearTimeout(timer);
    };

    const timer = setTimeout(sendQualifiedVisitEvent, 30000);
    const scrollListener = () => {
      if ((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100 >= 50) {
        sendQualifiedVisitEvent();
      }
    };
    document.addEventListener('scroll', scrollListener, { passive: true });
  }

  function fireDiagnosticStart() {
    if (!sessionStorage.getItem(sessionFlags.diagnosticStart)) {
      sessionStorage.setItem(sessionFlags.diagnosticStart, 'true');
      trackEvent('diagnostic_start');
    }
  }

  function fireDiagnosticSubmit(eventId) {
    if (eventId && !submittedEventIds.has(eventId)) {
      submittedEventIds.add(eventId);
      trackEvent('diagnostic_submit', { event_id: eventId });
    }
  }

  document.addEventListener('DOMContentLoaded', init);

  return { trackEvent, fireDiagnosticStart, fireDiagnosticSubmit };
})();