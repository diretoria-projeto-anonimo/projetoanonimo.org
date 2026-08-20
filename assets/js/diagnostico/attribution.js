/**
 * Módulo de Atribuição (First-Touch com aprimoramento).
 * Captura e persiste os parâmetros de atribuição da primeira visita,
 * permitindo a atualização se uma visita posterior tiver atribuição explícita.
 */
const Attribution = (() => {
  const STORAGE_KEY = 'pa_diag01_attribution';
  const { campaign: fallbackCampaign } = window.PA_DIAGNOSTICO_CONFIG;

  const PARAMS_TO_CAPTURE = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
    'gclid', 'gbraid', 'wbraid', 'fbclid'
  ];

  /**
   * Inicializa a captura de atribuição.
   */
  function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const hasExplicitParams = PARAMS_TO_CAPTURE.some(param => urlParams.has(param));

    const existingData = getStoredData();
    const hasStoredExplicitParams = PARAMS_TO_CAPTURE.some(p => existingData[p]);

    // Salva a atribuição se for a primeira visita (sem dados existentes) OU
    // se a visita atual tiver parâmetros explícitos e a armazenada não tiver.
    if (!existingData.first_seen_at || (hasExplicitParams && !hasStoredExplicitParams)) {
      const attributionData = {
        // Mantém o 'first_seen_at' original se já existir
        first_seen_at: existingData.first_seen_at || new Date().toISOString(),
        referrer: existingData.referrer || document.referrer || 'direct',
      };

      PARAMS_TO_CAPTURE.forEach(param => {
        attributionData[param] = urlParams.get(param) || '';
      });

      try {
        // Não armazena PII
        localStorage.setItem(STORAGE_KEY, JSON.stringify(attributionData));
      } catch (error) {
        console.error('Falha ao salvar dados de atribuição:', error);
      }
    }
  }

  /**
   * Retorna os dados de atribuição crus do localStorage.
   * @returns {object}
   */
  function getStoredData() {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      return storedData ? JSON.parse(storedData) : {};
    } catch (error) {
      console.error('Falha ao ler dados de atribuição:', error);
      return {};
    }
  }

  /**
   * Retorna os dados de atribuição para o payload, aplicando o fallback se necessário.
   * @returns {object}
   */
  function getAttributionData() {
    const data = getStoredData();
    const payloadData = {};

    // Garante que todos os campos existam no objeto retornado
    ['first_seen_at', 'referrer', ...PARAMS_TO_CAPTURE].forEach(key => {
      payloadData[key] = data[key] || '';
    });

    // Aplica o fallback APENAS se a campanha estiver vazia
    if (!payloadData.utm_campaign) {
      payloadData.utm_campaign = fallbackCampaign;
    }
    return payloadData;
  }

  init();

  return { getAttributionData };
})();