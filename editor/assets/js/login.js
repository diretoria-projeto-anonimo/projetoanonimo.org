"use strict";

const loginStatus = document.getElementById("login-status");
const clientId = window.PA_EDITOR_CONFIG.googleClientId;

function mostrarErro(message) {
  loginStatus.textContent = message;
  loginStatus.classList.add("is-error");
}

async function receberCredencial(response) {
  try {
    window.paAuth.saveSession(response.credential);
    await window.paAuth.api({ action: "verifySession" });
    const next = new URLSearchParams(location.search).get("next");
    location.replace(next && !next.includes("://") ? next : "dashboard.html");
  } catch (error) {
    window.paAuth.clearSession();
    mostrarErro(error.message);
  }
}

function iniciarLoginGoogle() {
  if (window.paAuth.getCredential()) {
    window.paAuth.api({ action: "verifySession" })
      .then(() => location.replace("dashboard.html"))
      .catch(() => {});
  }

  if (clientId.startsWith("SUBSTITUA_")) {
    mostrarErro("Configure o Google Client ID em assets/js/config.js.");
    return;
  }
  if (!window.google?.accounts?.id) {
    mostrarErro("Não foi possível carregar o acesso Google. Verifique a conexão.");
    return;
  }
  google.accounts.id.initialize({
    client_id: clientId,
    callback: receberCredencial,
    auto_select: false,
    cancel_on_tap_outside: true,
  });
  google.accounts.id.renderButton(
    document.getElementById("google-signin"),
    { theme: "outline", size: "large", shape: "pill", text: "signin_with" }
  );
}

window.addEventListener("load", iniciarLoginGoogle);
