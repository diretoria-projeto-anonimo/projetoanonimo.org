"use strict";

/*
 * Projeto Anônimo — portão de acesso a materiais restritos da Biblioteca Viva.
 *
 * POR QUE ESTE ARQUIVO EXISTE
 * O site é estático (GitHub Pages): não há middleware onde interceptar uma
 * requisição. A proteção real vive no backend — a API pública da Biblioteca
 * Viva deixa de devolver o material restrito, e a leitura autorizada passa
 * pela ação `getMaterial` do endpoint EDITORIAL, que já valida a credencial
 * Google e a lista de e-mails autorizados.
 *
 * Este arquivo é só a interface desse fluxo: mostra o portão, obtém a
 * credencial e pede o material ao backend. Ele NÃO decide quem tem acesso —
 * quem decide é o Apps Script, no servidor. Desligar este script não expõe
 * nada: sem autorização válida o backend não devolve conteúdo.
 *
 * REUTILIZAÇÃO
 * Sessão em sessionStorage, com as MESMAS chaves e a MESMA semântica de
 * `editor/assets/js/auth.js`. Assim, entrar ou sair na área editorial vale
 * aqui, e vice-versa. Nenhum mecanismo paralelo de autenticação foi criado.
 *
 * CONFIGURAÇÃO
 * Os dois valores abaixo identificam o mesmo cliente Google e o mesmo
 * backend de `editor/assets/js/config.js`. O Client ID é público por
 * natureza (ele vai no HTML de qualquer site que use "Entrar com Google");
 * não há segredo neste arquivo.
 */

const PA_ACESSO_RESTRITO = Object.freeze({
  apiUrl:
    "https://script.google.com/macros/s/AKfycby_YNT0D5RXUyR0snSUvOzmVji6CjVhKjzK0IZdaXxOyo_KQAkO1z5T2cXzXEDoZEI/exec",
  googleClientId:
    "1014168318813-ntqfj77856e238ck4tiefon96tt9oe8j.apps.googleusercontent.com",
  chaveCredencial: "paGoogleCredential",
  chaveUsuario: "paGoogleUser",
  origemGsi: "https://accounts.google.com/gsi/client",
});

/* ------------------------------------------------------------------ */
/* Sessão                                                              */
/* ------------------------------------------------------------------ */

function paAcessoCredencial() {
  try {
    return sessionStorage.getItem(PA_ACESSO_RESTRITO.chaveCredencial) || "";
  } catch {
    return "";
  }
}

function paAcessoDecodificar(credencial) {
  try {
    const carga = credencial.split(".")[1];
    if (!carga) return null;
    const normalizada = carga.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(
      decodeURIComponent(
        atob(normalizada)
          .split("")
          .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`)
          .join("")
      )
    );
  } catch {
    return null;
  }
}

function paAcessoCredencialValida(credencial) {
  const dados = paAcessoDecodificar(credencial);
  // 30 s de folga: evita usar uma credencial que expira no meio da requisição.
  return Boolean(dados?.exp && dados.exp * 1000 > Date.now() + 30_000);
}

function paAcessoSalvarSessao(credencial) {
  const dados = paAcessoDecodificar(credencial);
  sessionStorage.setItem(PA_ACESSO_RESTRITO.chaveCredencial, credencial);
  sessionStorage.setItem(
    PA_ACESSO_RESTRITO.chaveUsuario,
    JSON.stringify({
      email: dados?.email || "",
      name: dados?.name || "",
      picture: dados?.picture || "",
    })
  );
}

function paAcessoLimparSessao() {
  try {
    sessionStorage.removeItem(PA_ACESSO_RESTRITO.chaveCredencial);
    sessionStorage.removeItem(PA_ACESSO_RESTRITO.chaveUsuario);
  } catch {
    /* sessionStorage indisponível: a sessão simplesmente não persiste */
  }
}

/* ------------------------------------------------------------------ */
/* Backend                                                             */
/* ------------------------------------------------------------------ */

/**
 * Pede o material restrito ao endpoint editorial (ação `getMaterial`).
 * Devolve o item, ou lança Error com `.codigo` = AUTH_REQUIRED | FORBIDDEN.
 */
async function paAcessoBuscarMaterial(slug) {
  const credencial = paAcessoCredencial();
  if (!paAcessoCredencialValida(credencial)) {
    paAcessoLimparSessao();
    const erro = new Error("Sessão ausente ou expirada.");
    erro.codigo = "AUTH_REQUIRED";
    throw erro;
  }

  const resposta = await fetch(PA_ACESSO_RESTRITO.apiUrl, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      action: "getMaterial",
      slug,
      googleCredential: credencial,
    }),
  });

  const resultado = await resposta.json().catch(() => null);
  if (!resultado?.ok) {
    const codigo = resultado?.code || "SERVER_ERROR";
    if (codigo === "AUTH_REQUIRED") paAcessoLimparSessao();
    const erro = new Error(resultado?.error || "Não foi possível liberar o material.");
    erro.codigo = codigo;
    throw erro;
  }
  return resultado.material;
}

/* ------------------------------------------------------------------ */
/* Indexação                                                           */
/* ------------------------------------------------------------------ */

/**
 * Aplica noindex,nofollow a ESTA visualização.
 *
 * É complemento, não proteção: o material já não é servido sem autorização,
 * e o robots.txt bloqueia o endereço. Não se aplica noindex à página inteira
 * porque `material.html` serve todos os materiais públicos — desindexá-la
 * removeria a Biblioteca Viva do buscador.
 */
function paAcessoAplicarNoindex() {
  let meta = document.head.querySelector('meta[name="robots"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "robots");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", "noindex, nofollow");
}

/* ------------------------------------------------------------------ */
/* Interface do portão                                                 */
/* ------------------------------------------------------------------ */

function paAcessoMontarPortao(detalhe, mensagem) {
  detalhe.setAttribute("aria-busy", "false");
  detalhe.innerHTML = `
    <div class="material-loading">
      <p class="eyebrow">Acesso restrito</p>
      <h1>Documento interno do Projeto Anônimo</h1>
      <p>Este material é de uso interno e exige uma conta Google autorizada.
         Entre para continuar.</p>
      <div id="pa-acesso-google" style="margin-top:1.5rem"></div>
      <p id="pa-acesso-estado" role="status" aria-live="polite"
         style="margin-top:1rem;color:#58716e"></p>
    </div>`;

  const estado = detalhe.querySelector("#pa-acesso-estado");
  if (mensagem) estado.textContent = mensagem;
  return estado;
}

function paAcessoCarregarGsi() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (window.__paAcessoGsi) return window.__paAcessoGsi;

  window.__paAcessoGsi = new Promise((resolver, rejeitar) => {
    const script = document.createElement("script");
    script.src = PA_ACESSO_RESTRITO.origemGsi;
    script.async = true;
    script.defer = true;
    script.onload = () => resolver();
    script.onerror = () => rejeitar(new Error("Não foi possível carregar o acesso Google."));
    document.head.appendChild(script);
  });
  return window.__paAcessoGsi;
}

/* ------------------------------------------------------------------ */
/* Entrada                                                             */
/* ------------------------------------------------------------------ */

/**
 * Libera o material restrito.
 *
 * @param {string} slug  slug do material
 * @param {(material: object) => void} aoAutorizar  renderiza o material
 */
async function paAcessoExigir(slug, aoAutorizar) {
  const detalhe = document.querySelector("#material-detalhe");
  if (!detalhe) return;

  const erro = document.querySelector("#material-erro");
  if (erro) erro.hidden = true;

  paAcessoAplicarNoindex();

  /*
   * Credencial presente mas inválida ou expirada é descartada aqui, e não
   * deixada para trás: sessão morta no sessionStorage faria a página tentar
   * usá-la de novo em cada visita.
   */
  if (paAcessoCredencial() && !paAcessoCredencialValida(paAcessoCredencial())) {
    paAcessoLimparSessao();
  }

  /*
   * Já existe credencial válida nesta aba? Tenta direto, sem mostrar o portão.
   *
   * A mensagem é decidida aqui e o portão é sempre montado em seguida — assim
   * quem foi recusado continua vendo o botão e pode entrar com outra conta,
   * em vez de ficar preso numa tela sem saída.
   */
  let mensagem = "";

  if (paAcessoCredencialValida(paAcessoCredencial())) {
    try {
      const material = await paAcessoBuscarMaterial(slug);
      aoAutorizar(material);
      return;
    } catch (falha) {
      if (falha.codigo === "FORBIDDEN") {
        // A credencial é boa, mas a conta não está na lista: descartá-la é o
        // que permite tentar outra conta sem recarregar a página.
        paAcessoLimparSessao();
        mensagem = "Esta conta Google não tem acesso a materiais internos. Entre com outra conta.";
      } else if (falha.codigo !== "AUTH_REQUIRED") {
        mensagem = "Não foi possível falar com o servidor. Tente novamente.";
      }
    }
  }

  const estado = paAcessoMontarPortao(detalhe, mensagem);

  try {
    await paAcessoCarregarGsi();
  } catch (falha) {
    estado.textContent = falha.message;
    return;
  }

  if (!window.google?.accounts?.id) {
    estado.textContent = "Não foi possível carregar o acesso Google. Verifique a conexão.";
    return;
  }

  google.accounts.id.initialize({
    client_id: PA_ACESSO_RESTRITO.googleClientId,
    auto_select: false,
    cancel_on_tap_outside: true,
    callback: async (resposta) => {
      estado.textContent = "Verificando autorização...";
      try {
        paAcessoSalvarSessao(resposta.credential);
        const material = await paAcessoBuscarMaterial(slug);
        aoAutorizar(material);
      } catch (falha) {
        paAcessoLimparSessao();
        estado.textContent =
          falha.codigo === "FORBIDDEN"
            ? "Esta conta Google não tem acesso a materiais internos."
            : falha.message;
      }
    },
  });

  google.accounts.id.renderButton(detalhe.querySelector("#pa-acesso-google"), {
    theme: "outline",
    size: "large",
    shape: "pill",
    text: "signin_with",
  });
}

/** Encerra a sessão desta aba. Exposto para uso e verificação. */
function paAcessoSair() {
  paAcessoLimparSessao();
  location.reload();
}

window.PAAcessoRestrito = Object.freeze({
  exigir: paAcessoExigir,
  sair: paAcessoSair,
  credencialValida: () => paAcessoCredencialValida(paAcessoCredencial()),
  buscar: paAcessoBuscarMaterial,
});
