/**
 * Módulo de Gerenciamento de Consentimento (Campanha 01).
 * Controla o banner de consentimento, a persistência da escolha do usuário
 * e a integração com o Google Consent Mode v2.
 */
document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'pa_consent_v1';
  const { policyVersion } = window.PA_DIAGNOSTICO_CONFIG;

  // Estado global acessível para GTM
  window.PA_CONSENT = {
    analytics: false,
    marketing: false,
  };

  let previousMarketingConsent = false;

  const banner = document.getElementById('consent-banner');
  const modal = document.getElementById('consent-modal');
  if (!banner || !modal) return;

  const acceptAllBtn = document.getElementById('consent-accept-all');
  const rejectAllBtn = document.getElementById('consent-reject-all');
  const manageBtn = document.getElementById('consent-manage');
  const savePrefsBtn = document.getElementById('consent-save-prefs');
  const closeModalBtn = document.getElementById('consent-close-modal');
  const form = document.getElementById('consent-form');
  const openPrefsFooterBtn = document.getElementById('open-consent-preferences');
  const analyticsToggle = document.getElementById('consent-analytics');
  const marketingToggle = document.getElementById('consent-marketing');

  let focusableElements = [];
  let firstFocusableEl = null;
  let lastFocusableEl = null;
  let activeElementBeforeModal = null;

  /**
   * Salva as preferências de consentimento no localStorage.
   * @param {boolean} analytics
   * @param {boolean} marketing
   */
  function savePreferences(analytics, marketing) {
    const consentData = {
      version: policyVersion,
      analytics,
      marketing,
      updated_at: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consentData));
    } catch (error) {
      console.error('Falha ao salvar consentimento:', error);
    }
    return consentData;
  }

  /**
   * Lê as preferências de consentimento do localStorage.
   * @returns {object|null}
   */
  function loadPreferences() {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const data = JSON.parse(storedData);
        // Valida a versão da política e a estrutura básica
        if (data.version === policyVersion && typeof data.analytics !== 'undefined' && typeof data.marketing !== 'undefined') {
          return data;
        }
      }
    } catch (error) {
      console.error('Falha ao ler consentimento:', error);
    }
    return null;
  }

  /**
   * Atualiza o Google Consent Mode e o dataLayer.
   * @param {object} prefs - As preferências de consentimento.
   */
  function updateConsent(prefs) {
    const consentState = {
      analytics_storage: prefs.analytics ? 'granted' : 'denied',
      ad_storage: prefs.marketing ? 'granted' : 'denied',
      ad_user_data: prefs.marketing ? 'granted' : 'denied',
      ad_personalization: prefs.marketing ? 'granted' : 'denied',
    };

    gtag('consent', 'update', consentState);

    window.PA_CONSENT = {
      analytics: prefs.analytics,
      marketing: prefs.marketing,
    };

    window.dataLayer.push({
      event: 'pa_consent_update',
      consent_analytics: prefs.analytics,
      consent_marketing: prefs.marketing,
    });

    // Dispara o evento específico para o Meta Pixel SOMENTE na transição false -> true.
    if (prefs.marketing && !previousMarketingConsent) {
      window.dataLayer.push({
        event: 'pa_marketing_consent_granted'
      });
    }
    // Atualiza o estado anterior para a próxima verificação.
    previousMarketingConsent = prefs.marketing;
  }

  function hideBanner() {
    banner.hidden = true;
  }

  function showModal() {
    activeElementBeforeModal = document.activeElement;
    modal.hidden = false;
    
    const storedPrefs = loadPreferences() || { analytics: false, marketing: false };
    analyticsToggle.checked = storedPrefs.analytics;
    marketingToggle.checked = storedPrefs.marketing;

    focusableElements = Array.from(modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'));
    firstFocusableEl = focusableElements[0];
    lastFocusableEl = focusableElements[focusableElements.length - 1];
    
    firstFocusableEl.focus();
    modal.addEventListener('keydown', trapFocus);
  }

  function hideModal() {
    modal.hidden = true;
    modal.removeEventListener('keydown', trapFocus);
    activeElementBeforeModal?.focus();
  }

  function trapFocus(e) {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) { // Shift + Tab
      if (document.activeElement === firstFocusableEl) {
        lastFocusableEl.focus();
        e.preventDefault();
      }
    } else { // Tab
      if (document.activeElement === lastFocusableEl) {
        firstFocusableEl.focus();
        e.preventDefault();
      }
    }
  }

  function handleAcceptAll() {
    const prefs = savePreferences(true, true);
    updateConsent(prefs);
    hideBanner();
  }

  function handleRejectAll() {
    const prefs = savePreferences(false, false);
    updateConsent(prefs);
    hideBanner();
  }

  function handleSavePrefs(e) {
    e.preventDefault();
    const prefs = savePreferences(analyticsToggle.checked, marketingToggle.checked);
    updateConsent(prefs);
    hideModal();
    hideBanner();
  }

  // --- Inicialização ---
  // Define o estado inicial do PA_CONSENT com base no localStorage antes de qualquer outra coisa.
  const storedPrefs = loadPreferences();
  if (storedPrefs) {
    window.PA_CONSENT.analytics = storedPrefs.analytics;
    window.PA_CONSENT.marketing = storedPrefs.marketing;
    // Aplica o consentimento salvo imediatamente
    updateConsent(storedPrefs);
    hideBanner();
  } else {
    // Mostra o banner pois não há escolha
    banner.hidden = false;
    window.dataLayer.push({ event: 'pa_consent_default' });
  }

  function setupListeners() {
    const storedPrefs = loadPreferences();
    acceptAllBtn.addEventListener('click', handleAcceptAll);
    rejectAllBtn.addEventListener('click', handleRejectAll);
    manageBtn.addEventListener('click', showModal);
    closeModalBtn.addEventListener('click', hideModal);
    savePrefsBtn.addEventListener('click', handleSavePrefs);

    // Fechar modal com a tecla Escape
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        hideModal();
      }
    });
    if (openPrefsFooterBtn) {
      openPrefsFooterBtn.addEventListener('click', showModal);
    }
  }

  setupListeners();
});