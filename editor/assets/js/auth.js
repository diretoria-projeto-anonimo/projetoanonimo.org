"use strict";

const PA_AUTH_KEY = "paGoogleCredential";
const PA_USER_KEY = "paGoogleUser";

function paGetCredential() {
  return sessionStorage.getItem(PA_AUTH_KEY) || "";
}

function paGetUser() {
  try {
    return JSON.parse(sessionStorage.getItem(PA_USER_KEY) || "null");
  } catch {
    return null;
  }
}

function paDecodeCredential(credential) {
  const payload = credential.split(".")[1];
  if (!payload) return null;
  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(decodeURIComponent(
    atob(normalized)
      .split("")
      .map((character) => `%${character.charCodeAt(0).toString(16).padStart(2, "0")}`)
      .join("")
  ));
}

function paCredentialValida(credential) {
  try {
    const claims = paDecodeCredential(credential);
    return Boolean(claims?.exp && claims.exp * 1000 > Date.now() + 30_000);
  } catch {
    return false;
  }
}

function paSalvarSessao(credential) {
  const claims = paDecodeCredential(credential);
  sessionStorage.setItem(PA_AUTH_KEY, credential);
  sessionStorage.setItem(PA_USER_KEY, JSON.stringify({
    email: claims?.email || "",
    name: claims?.name || "",
    picture: claims?.picture || "",
  }));
}

function paEncerrarSessao() {
  paLimparSessao();
  window.location.replace("login.html");
}

function paLimparSessao() {
  sessionStorage.removeItem(PA_AUTH_KEY);
  sessionStorage.removeItem(PA_USER_KEY);
}

function paExigirSessao() {
  if (!paCredentialValida(paGetCredential())) {
    const destino = encodeURIComponent(
      `${location.pathname.split("/").pop() || "dashboard.html"}${location.search}`
    );
    window.location.replace(`login.html?next=${destino}`);
    return false;
  }
  return true;
}

async function paChamarApi(payload) {
  const credential = paGetCredential();
  if (!paCredentialValida(credential)) {
    paEncerrarSessao();
    throw new Error("Sua sessão expirou. Entre novamente.");
  }

  const response = await fetch(window.PA_EDITOR_CONFIG.apiUrl, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ ...payload, googleCredential: credential }),
  });
  const result = await response.json().catch(() => null);
  if (!result?.ok) {
    if (result?.code === "AUTH_REQUIRED") paEncerrarSessao();
    throw new Error(result?.error || "A operação não pôde ser concluída.");
  }
  return result;
}

window.paAuth = Object.freeze({
  getCredential: paGetCredential,
  getUser: paGetUser,
  saveSession: paSalvarSessao,
  clearSession: paLimparSessao,
  signOut: paEncerrarSessao,
  requireSession: paExigirSessao,
  api: paChamarApi,
});
