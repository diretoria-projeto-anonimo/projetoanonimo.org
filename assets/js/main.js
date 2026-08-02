const API_BIBLIOTECA =
  "https://script.google.com/macros/s/AKfycbzhh37NeK7hAaglGCilFvCME6pxgC7V_EdR5ct3wkmJEpywh50mq3i-xgnP1lQlqQ9PTA/exec";

const state = {
  items: [],
  filtered: [],
};

const SELECTORS = {
  list: "biblioteca-lista",
  empty: "biblioteca-vazio",
  contador: "resultado-contador",
  status: "biblioteca-status",
  search: "search-input",
  category: "categoria-select",
  format: "formato-select",
  homeList: "home-biblioteca",
  homeStatus: "home-biblioteca-status",
};

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getFetchUrl(item) {
  return escapeHTML(item.paginaUrl || item.arquivoUrl || item.formularioUrl || "#");
}

function buildCard(item) {
  const title = escapeHTML(item.titulo || "Sem título");
  const summary = escapeHTML(item.resumo || "Resumo não disponível.");
  const category = escapeHTML(item.categoria || "Material");
  const format = escapeHTML(item.formato || "Formato não informado");
  const level = escapeHTML(item.nivel || "Nível não informado");
  const time = escapeHTML(item.tempoLeitura || "");
  const version = escapeHTML(item.versao || "");
  const cta = escapeHTML(item.cta || "Acessar material");
  const url = getFetchUrl(item);
  const hasUrl = url !== "#";
  const coverUrl = item.capaUrl ? escapeHTML(item.capaUrl) : "";
  const coverStyle = coverUrl ? `style="background-image:url('${coverUrl}')"` : "";
  const targetAttrs = hasUrl ? "target=\"_blank\" rel=\"noopener\"" : "";

  return `
    <article class="card">
      <div class="cover" ${coverStyle}>
        ${coverUrl ? "" : '<div class="cover-fallback">Biblioteca Viva</div>'}
      </div>
      <div class="card-body">
        <span class="tag">${category}</span>
        <h3>${title}</h3>
        <p class="summary">${summary}</p>
        <div class="meta">
          <span><strong>Formato:</strong> ${format}</span>
          <span><strong>Nível:</strong> ${level}</span>
          ${time ? `<span><strong>Tempo:</strong> ${time}</span>` : ""}
          ${version ? `<span><strong>Versão:</strong> ${version}</span>` : ""}
        </div>
        <a class="btn secondary card-cta" href="${url}" ${targetAttrs}>${cta}</a>
      </div>
    </article>
  `;
}

function getElement(id) {
  return document.getElementById(id);
}

function updateStatus(message, isError = false) {
  const status = getElement(SELECTORS.status);
  if (!status) return;
  status.textContent = message;
  status.classList.toggle("error", isError);
}

function updateHomeStatus(message, isError = false) {
  const status = getElement(SELECTORS.homeStatus);
  if (!status) return;
  status.textContent = message;
  status.classList.toggle("error", isError);
}

function updateCounter(count, total) {
  const counter = getElement(SELECTORS.contador);
  if (!counter) return;
  const label = count === 1 ? "material encontrado" : "materiais encontrados";
  counter.textContent = `${count} ${label}` + (total ? ` • ${total} disponível${total === 1 ? "" : "s"}` : "");
}

function toggleEmptyMessage(show) {
  const emptyMessage = getElement(SELECTORS.empty);
  if (!emptyMessage) return;
  emptyMessage.classList.toggle("hidden", !show);
}

function renderList(items) {
  const list = getElement(SELECTORS.list);
  if (!list) return;

  if (!Array.isArray(items) || items.length === 0) {
    list.innerHTML = "";
    toggleEmptyMessage(true);
    updateStatus("Nenhum resultado encontrado para sua pesquisa.");
    updateCounter(0, state.items.length);
    return;
  }

  toggleEmptyMessage(false);
  updateStatus("");
  updateCounter(items.length, state.items.length);
  list.innerHTML = items.map(buildCard).join("");
}

function renderHomeLibrary(items) {
  const homeList = getElement(SELECTORS.homeList);
  if (!homeList) return;

  const highlights = Array.isArray(items) ? items.slice(0, 3) : [];
  if (highlights.length === 0) {
    homeList.innerHTML = "";
    updateHomeStatus("Nenhum material disponível na Biblioteca Viva.");
    return;
  }

  homeList.innerHTML = highlights.map(buildCard).join("");
  updateHomeStatus(`${highlights.length} ${highlights.length === 1 ? "material selecionado" : "materiais selecionados"}`);
}

function populateFilter(selectId, values, label) {
  const select = getElement(selectId);
  if (!select) return;
  const options = ["", ...values].map((value) => {
    if (!value) {
      return `<option value="">${label}</option>`;
    }
    const escaped = escapeHTML(value);
    return `<option value="${escaped}">${escaped}</option>`;
  });
  select.innerHTML = options.join("");
}

function populateFilters(items) {
  const categories = Array.from(
    new Set(items.map((item) => String(item.categoria || "").trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, "pt-BR"));
  const formats = Array.from(
    new Set(items.map((item) => String(item.formato || "").trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, "pt-BR"));

  populateFilter(SELECTORS.category, categories, "Todas as categorias");
  populateFilter(SELECTORS.format, formats, "Todos os formatos");
}

function getSearchTerm() {
  const search = getElement(SELECTORS.search);
  return search ? String(search.value).trim().toLowerCase() : "";
}

function getSelectedValue(id) {
  const select = getElement(id);
  return select ? String(select.value).trim() : "";
}

function filterItems() {
  const query = getSearchTerm();
  const category = getSelectedValue(SELECTORS.category);
  const format = getSelectedValue(SELECTORS.format);

  const filtered = state.items.filter((item) => {
    const title = String(item.titulo || "").toLowerCase();
    const summary = String(item.resumo || "").toLowerCase();
    const categoryText = String(item.categoria || "").toLowerCase();
    const formatText = String(item.formato || "").toLowerCase();
    const keywords = Array.isArray(item.palavrasChave)
      ? item.palavrasChave.join(" ").toLowerCase()
      : "";

    const matchesQuery =
      !query ||
      title.includes(query) ||
      summary.includes(query) ||
      categoryText.includes(query) ||
      formatText.includes(query) ||
      keywords.includes(query);

    const matchesCategory = !category || categoryText === category.toLowerCase();
    const matchesFormat = !format || formatText === format.toLowerCase();

    return matchesQuery && matchesCategory && matchesFormat;
  });

  state.filtered = filtered;
  renderList(filtered);
}

function attachFilters() {
  const search = getElement(SELECTORS.search);
  const category = getElement(SELECTORS.category);
  const format = getElement(SELECTORS.format);

  if (search) {
    search.addEventListener("input", filterItems);
  }
  if (category) {
    category.addEventListener("change", filterItems);
  }
  if (format) {
    format.addEventListener("change", filterItems);
  }
}

function setLoadingState() {
  const list = getElement(SELECTORS.list);
  const homeList = getElement(SELECTORS.homeList);

  if (list) {
    list.innerHTML = "";
    toggleEmptyMessage(true);
    updateStatus("Carregando Biblioteca Viva...");
  }

  if (homeList) {
    homeList.innerHTML = "";
    updateHomeStatus("Carregando Biblioteca Viva...");
  }
}

async function carregarBiblioteca() {
  const list = getElement(SELECTORS.list);
  const homeList = getElement(SELECTORS.homeList);
  if (!list && !homeList) return;

  setLoadingState();

  try {
    const response = await fetch(API_BIBLIOTECA);
    if (!response.ok) {
      throw new Error("Falha na resposta da API");
    }

    const data = await response.json();
    if (!data.ok || !Array.isArray(data.items)) {
      throw new Error("Dados da API inválidos");
    }

    state.items = data.items;
    state.filtered = [...state.items];

    if (state.items.length === 0) {
      if (list) {
        updateStatus("A Biblioteca Viva ainda não possui materiais publicados.");
        updateCounter(0, 0);
      }
      if (homeList) {
        updateHomeStatus("A Biblioteca Viva ainda não possui materiais publicados.");
      }
      return;
    }

    if (list) {
      populateFilters(state.items);
      filterItems();
    }

    if (homeList) {
      renderHomeLibrary(state.items);
    }
  } catch (error) {
    console.error(error);
    if (list) {
      setLoadingState();
      updateStatus("Não foi possível carregar a Biblioteca Viva agora. Tente novamente mais tarde.", true);
    }
    if (homeList) {
      homeList.innerHTML = "";
      updateHomeStatus("Não foi possível carregar a Biblioteca Viva agora. Tente novamente mais tarde.", true);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  attachFilters();
  if (getElement(SELECTORS.list) || getElement(SELECTORS.homeList)) {
    carregarBiblioteca();
  }
});
