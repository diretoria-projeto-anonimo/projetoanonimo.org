/**
 * Módulo de Gerenciamento do Formulário de Diagnóstico (Wizard).
 * Orquestra validação, submissão, tracking e estados da UI.
 */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('diag-form');
  if (!form) return;

  // Elementos da UI
  const submitButton = document.getElementById('submit-button');
  const prevButton = document.getElementById('prev-button');
  const nextButton = document.getElementById('next-button');
  const resetButton = document.getElementById('reset-button');
  const formStatusEl = document.getElementById('form-status');
  const successMessageEl = document.getElementById('success-message');
  const progressIndicator = document.getElementById('progress-indicator');
  const formSteps = Array.from(form.querySelectorAll('.form-step'));

  // Configuração e Estado
  const { endpoint, formCode, landingVersion, policyVersion } = window.PA_DIAGNOSTICO_CONFIG;
  const SESSION_ID_KEY = 'pa_diag01_session_id';
  const TOTAL_STEPS = formSteps.length;
  let state = 'idle'; // idle, submitting, success, error
  let currentEventId = null;
  let currentStep = 1;

  const CHECKBOX_ARRAY_FIELDS = [
    'ferramentas_produtividade', 'ferramentas_ia', 'canais_comunicacao',
    'areas_desenvolver', 'conteudos_servicos'
  ];

  // --- Funções Utilitárias ---
  const generateUUID = () => ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16));
  const getSessionId = () => {
    let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
      sessionId = generateUUID();
      sessionStorage.setItem(SESSION_ID_KEY, sessionId);
    }
    return sessionId;
  };

  // --- Gerenciamento de Estado da UI ---
  const updateState = (newState, message = '') => {
    state = newState;
    const isSubmitting = state === 'submitting';

    // Botões
    submitButton.disabled = isSubmitting;
    nextButton.disabled = isSubmitting;
    prevButton.disabled = isSubmitting;
    submitButton.textContent = isSubmitting ? 'Enviando...' : 'Enviar diagnóstico';

    // Mensagem de status
    formStatusEl.textContent = message;
    formStatusEl.className = `form-status ${state === 'error' ? 'error' : ''}`;
    formStatusEl.style.display = message ? 'block' : 'none';

    // Visibilidade do formulário vs. sucesso
    const showSuccess = state === 'success';
    form.hidden = showSuccess;
    progressIndicator.parentElement.hidden = showSuccess;
    successMessageEl.hidden = !showSuccess;
  };

  const changeStep = (targetStep) => {
    if (targetStep < 1 || targetStep > TOTAL_STEPS) return;

    // Valida a etapa atual antes de avançar
    if (targetStep > currentStep && !validateStep(currentStep)) return;

    currentStep = targetStep;

    formSteps.forEach(stepEl => {
      const stepNumber = parseInt(stepEl.dataset.step, 10);
      stepEl.hidden = stepNumber !== currentStep;
    });

    progressIndicator.textContent = `Etapa ${currentStep} de ${TOTAL_STEPS}`;
    prevButton.hidden = currentStep === 1;
    nextButton.hidden = currentStep === TOTAL_STEPS;
    submitButton.hidden = currentStep !== TOTAL_STEPS;

    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // --- Validação ---
  const validateStep = (step) => {
    const fields = formSteps[step - 1].querySelectorAll('[name]:not([tabindex="-1"])');
    let firstInvalidField = null;
    clearErrors(fields);

    const isValid = Array.from(fields).every(field => {
  let fieldIsValid = true;
  let errorMessage = '';

  if (field.required) {
    if (field.type === 'checkbox') {
      if (!field.checked) {
        fieldIsValid = false;
        errorMessage = 'Este campo é obrigatório.';
      }
    } else if (field.value.trim() === '') {
      fieldIsValid = false;
      errorMessage = 'Este campo é obrigatório.';
    }
  }

  if (
    fieldIsValid &&
    field.type === 'email' &&
    field.value &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)
  ) {
    fieldIsValid = false;
    errorMessage = 'Por favor, insira um e-mail válido.';
  }

  if (!fieldIsValid) {
    showError(field, errorMessage);
    if (!firstInvalidField) firstInvalidField = field;
  }

  return fieldIsValid;
});


    if (!isValid) {
      Tracking.trackEvent('diagnostic_validation_error', { step });
      firstInvalidField?.focus();
    }
    return isValid;
  };

  function showError(field, message) {
  const errorId = `error-${field.name}`;
  const errorEl = document.getElementById(errorId);
  field.setAttribute('aria-invalid', 'true');
  field.setAttribute('aria-describedby', errorId);
  if (errorEl) errorEl.textContent = message;
}

  const clearErrors = (fields) => {
    fields.forEach(field => {
      const errorId = `error-${field.name}`;
      const errorEl = document.getElementById(errorId);
      field.removeAttribute('aria-invalid');
      field.removeAttribute('aria-describedby');
      if (errorEl) errorEl.textContent = '';
    });
  };

  // --- Coleta e Envio de Dados ---
  const getAnswers = () => {
    const formData = new FormData(form);
    const answers = {};

    // Usar um Set para obter nomes de campos únicos
const NON_ANSWER_FIELDS = new Set([
  'contact',
  'marketing',
  'website'
]);

const fieldNames = new Set(
  Array.from(form.elements)
    .map(el => el.name)
    .filter(name => name && !NON_ANSWER_FIELDS.has(name))
);
    fieldNames.forEach(name => {
      if (CHECKBOX_ARRAY_FIELDS.includes(name)) {
        answers[name] = formData.getAll(name);
      } else {
        const value = formData.get(name);
        if (value !== null) answers[name] = value;
      }
    });

    return answers;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (state === 'submitting' || state === 'success') return;

    if (!validateStep(currentStep)) {
      updateState('error', 'Por favor, revise os campos destacados.');
      return;
    }

    if (policyVersion === 'PENDENTE' && !['127.0.0.1', 'localhost'].includes(window.location.hostname)) {
      updateState('error', 'Configuração de política pendente. Envio bloqueado.');
      return;
    }

    updateState('submitting', 'Enviando diagnóstico...');
    if (!currentEventId) currentEventId = generateUUID();

    const payload = {
      metadata: {
        form_code: formCode,
        landing_path: window.location.pathname,
        landing_version: landingVersion,
        session_id: getSessionId(),
        event_id: currentEventId,
      },
      attribution: Attribution.getAttributionData(),
      answers: getAnswers(),
      consents: {
        contact: form.elements.contact.checked,
        marketing: form.elements.marketing.checked,
        policy_version: policyVersion,
      },
      website: form.elements.website.value, // Honeypot
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        redirect: 'follow',
      });

      const result = await response.json();

      if (result.ok) {
        Tracking.fireDiagnosticSubmit(currentEventId);
        updateState('success');
        document.getElementById('submission-id').textContent = result.submission_id || 'N/A';
      } else {
        throw new Error(result.message || 'Ocorreu um erro no servidor.');
      }
    } catch (error) {
      console.error('Erro na submissão:', error);
      updateState('error', 'Falha ao enviar. Por favor, tente novamente.');
      // Mantém o event_id para a nova tentativa
    }
  };

  // --- Reset e Inicialização ---
  const resetForm = () => {
    form.reset();
    const allFields = form.querySelectorAll('[name]');
    clearErrors(allFields);
    currentEventId = null; // Permite a geração de um novo event_id
    changeStep(1);
    updateState('idle');
  };

  const initListeners = () => {
    form.addEventListener('submit', handleSubmit);
    resetButton.addEventListener('click', resetForm);
    nextButton.addEventListener('click', () => changeStep(currentStep + 1));
    prevButton.addEventListener('click', () => changeStep(currentStep - 1));

    // Dispara `diagnostic_start` na primeira interação real
    form.addEventListener('input', Tracking.fireDiagnosticStart, { once: true });
  };

  // Inicialização
  getSessionId();
  initListeners();
  changeStep(1); // Garante o estado inicial correto do wizard
});