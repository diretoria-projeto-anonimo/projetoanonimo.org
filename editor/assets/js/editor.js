"use strict";

if (!window.paAuth?.requireSession()) {
  throw new Error("Sessão editorial necessária.");
}

document.getElementById("editor-signout")?.addEventListener("click", () => {
  window.paAuth.signOut();
});
document.documentElement.classList.add("editor-js");
