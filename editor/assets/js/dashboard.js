"use strict";

const dashboardElements = {
  publicados: document.getElementById("total-publicados"),
  revisao: document.getElementById("total-revisao"),
  rascunhos: document.getElementById("total-rascunhos"),
  total: document.getElementById("total-materiais"),
  visualizacoes: document.getElementById("total-visualizacoes"),
  downloads: document.getElementById("total-downloads"),
  ultimaAtividade: document.getElementById("ultima-atividade"),
  lista: document.getElementById("materiais-recentes"),
  filtroStatus: document.getElementById("filtro-status"),
};

let materiaisEditoriais = [];
let metricasEditoriais = {
  totals: {},
  byReference: {},
  latestAt: "",
};

document.addEventListener("DOMContentLoaded", carregarDashboard);
dashboardElements.filtroStatus?.addEventListener("change", renderizarDashboard);

async function carregarDashboard() {
  mensagemDashboard("Carregando conteúdos editoriais...");
  try {
    const [resultado, metricas] = await Promise.all([
      window.paAuth.api({ action: "listEditorial" }),
      window.paAuth.api({ action: "getMetricsSummary" }),
    ]);
    materiaisEditoriais = Array.isArray(resultado.items) ? resultado.items : [];
    metricasEditoriais = metricas || metricasEditoriais;
    atualizarIndicadores(materiaisEditoriais);
    renderizarDashboard();
  } catch (error) {
    mensagemDashboard(error.message, true);
  }
}

function renderizarDashboard() {
  const filtro = normalizarDashboard(dashboardElements.filtroStatus?.value);
  const materiais = filtro
    ? materiaisEditoriais.filter((item) => normalizarDashboard(item.status) === filtro)
    : materiaisEditoriais;

  if (!materiais.length) {
    mensagemDashboard("Nenhum material encontrado para este filtro.");
    return;
  }

  dashboardElements.lista.className = "editor-material-list";
  dashboardElements.lista.innerHTML = materiais.map((item) => {
    const titulo = escaparDashboard(item.titulo || "Sem título");
    const categoria = escaparDashboard(item.categoria || "Sem categoria");
    const formato = escaparDashboard(item.formato || "");
    const status = item.status || "Rascunho";
    const slug = String(item.slug || "").trim();
    const metricas = metricasEditoriais.byReference?.[slug] || {};
    const editUrl = `novo-material.html?slug=${encodeURIComponent(slug)}`;
    const viewUrl = `../biblioteca/material.html?slug=${encodeURIComponent(slug)}`;

    return `
      <article class="editor-material-item">
        <div>
          <h3>${titulo}</h3>
          <p>${categoria}${formato ? ` • ${formato}` : ""}</p>
          <p class="editor-metric-summary">
            ${numeroDashboard(metricas.visualizacao)} visualizações •
            ${numeroDashboard(metricas.download)} downloads
          </p>
        </div>
        <div class="editor-material-actions">
          <span class="editor-status ${classeStatusDashboard(status)}">
            ${escaparDashboard(status)}
          </span>
          ${slug ? `<a href="${editUrl}">Editar</a>` : "<span>Sem slug</span>"}
          ${slug && normalizarDashboard(status) === "publicado"
            ? `<a href="${viewUrl}" target="_blank" rel="noopener">Visualizar</a>`
            : ""}
        </div>
      </article>`;
  }).join("");
}

function atualizarIndicadores(materiais) {
  let publicados = 0;
  let revisao = 0;
  let rascunhos = 0;
  materiais.forEach((item) => {
    const status = normalizarDashboard(item.status);
    if (status === "publicado") publicados += 1;
    else if (["em revisao", "revisao", "aprovado"].includes(status)) revisao += 1;
    else if (status !== "arquivado") rascunhos += 1;
  });
  dashboardElements.publicados.textContent = publicados;
  dashboardElements.revisao.textContent = revisao;
  dashboardElements.rascunhos.textContent = rascunhos;
  dashboardElements.total.textContent = materiais.length;
  dashboardElements.visualizacoes.textContent =
    numeroDashboard(metricasEditoriais.totals?.visualizacao);
  dashboardElements.downloads.textContent =
    numeroDashboard(metricasEditoriais.totals?.download);
  dashboardElements.ultimaAtividade.textContent =
    formatarDataDashboard(metricasEditoriais.latestAt);
}

function mensagemDashboard(texto, erro = false) {
  dashboardElements.lista.className = erro
    ? "editor-empty-state editor-message-error"
    : "editor-empty-state";
  dashboardElements.lista.textContent = texto;
}

function normalizarDashboard(valor) {
  return String(valor || "").normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
}

function classeStatusDashboard(status) {
  const valor = normalizarDashboard(status);
  if (valor === "publicado") return "is-published";
  if (["em revisao", "revisao", "aprovado"].includes(valor)) return "is-review";
  return "is-draft";
}

function escaparDashboard(valor) {
  return String(valor || "")
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function numeroDashboard(valor) {
  return new Intl.NumberFormat("pt-BR").format(Number(valor) || 0);
}

function formatarDataDashboard(valor) {
  if (!valor) return "Sem atividade";
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return "Sem atividade";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(data);
}
