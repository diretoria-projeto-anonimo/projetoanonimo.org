const API_BIBLIOTECA =
  "https://script.google.com/macros/s/AKfycbzhh37NeK7hAaglGCilFvCME6pxgC7V_EdR5ct3wkmJEpywh50mq3i-xgnP1lQlqQ9PTA/exec";

const PROJETOS = [
  {
    titulo: "Robótica para Todos",
    area: "Educação tecnológica",
    publico: "Escolas e comunidades",
    resumo: "Aprenda a programar um robô brincando, com atividades acessíveis, práticas e progressivas.",
    cta: "Conhecer projeto",
    url: "contato.html",
  },
  {
    titulo: "IA para Todos",
    area: "Inteligência artificial",
    publico: "Educadores, OSCs e comunidades",
    resumo: "Formação prática, acessível e responsável para compreender e utilizar ferramentas de inteligência artificial.",
    cta: "Conhecer projeto",
    url: "contato.html",
  },
  {
    titulo: "Cultura Maker",
    area: "Cultura digital",
    publico: "Escolas, coletivos e comunidades",
    resumo: "Oficinas mão na massa para criar, experimentar, prototipar e resolver problemas de forma colaborativa.",
    cta: "Conhecer projeto",
    url: "contato.html",
  },
  {
    titulo: "Transformação Digital para OSCs",
    area: "Transformação digital",
    publico: "Organizações sociais",
    resumo: "Organização de processos, Google Workspace, formulários, CRM e automações para fortalecer a gestão.",
    cta: "Solicitar diagnóstico",
    url: "contato.html",
  },
  {
    titulo: "Mídia Solidária",
    area: "Comunicação",
    publico: "Cooperativas, redes e projetos sociais",
    resumo: "Comunicação e campanhas alinhadas à economia solidária, à cultura e ao impacto social.",
    cta: "Propor campanha",
    url: "contato.html",
  },
  {
    titulo: "Biblioteca Viva",
    area: "Conhecimento aberto",
    publico: "Educadores, organizações e comunidades",
    resumo: "Guias, modelos, checklists e recursos gratuitos para aprender, aplicar e compartilhar.",
    cta: "Explorar biblioteca",
    url: "biblioteca.html",
  },
];

const state = {
  items: [],
  filtered: [],
  projects: [],
  filteredProjects: [],
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
  projetosList: "projetos-lista",
  projetosEmpty: "projetos-vazio",
  projetosContador: "projetos-contador",
  projetosStatus: "projetos-status",
  projetosSearch: "projetos-search",
  projetosArea: "projetos-area",
  projetosPublico: "projetos-publico",
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

function buildProjectCard(project) {
  const title = escapeHTML(project.titulo || "Sem título");
  const area = escapeHTML(project.area || "Área não informada");
  const publico = escapeHTML(project.publico || "Público não informado");
  const resumo = escapeHTML(project.resumo || "Resumo não disponível.");
  const cta = escapeHTML(project.cta || "Conhecer projeto");
  const url = escapeHTML(project.url || "#");
  const targetAttrs = url !== "#" ? "target=\"_blank\" rel=\"noopener\"" : "";

  return `
    <article class="project-card">
      <div class="card-body">
        <div class="project-meta">
          <span class="badge">${area}</span>
          <span class="badge secondary">${publico}</span>
        </div>
        <h3>${title}</h3>
        <p class="summary">${resumo}</p>
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

function updateProjectStatus(message, isError = false) {
  const status = getElement(SELECTORS.projetosStatus);
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

function updateProjectCounter(count, total) {
  const counter = getElement(SELECTORS.projetosContador);
  if (!counter) return;
  const label = count === 1 ? "projeto disponível" : "projetos disponíveis";
  counter.textContent = `${count} ${label}` + (total ? ` • ${total} no total` : "");
}

function toggleEmptyMessage(show) {
  const emptyMessage = getElement(SELECTORS.empty);
  if (!emptyMessage) return;
  emptyMessage.classList.toggle("hidden", !show);
}

function toggleProjectEmpty(show) {
  const emptyMessage = getElement(SELECTORS.projetosEmpty);
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

function renderProjects(items) {
  const list = getElement(SELECTORS.projetosList);
  if (!list) return;

  if (!Array.isArray(items) || items.length === 0) {
    list.innerHTML = "";
    toggleProjectEmpty(true);
    updateProjectStatus("Nenhum projeto encontrado para os filtros aplicados.");
    updateProjectCounter(0, state.projects.length);
    return;
  }

  toggleProjectEmpty(false);
  updateProjectStatus("");
  updateProjectCounter(items.length, state.projects.length);
  list.innerHTML = items.map(buildProjectCard).join("");
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

function populateProjectFilters(items) {
  const areas = Array.from(
    new Set(items.map((item) => String(item.area || "").trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, "pt-BR"));
  const publicos = Array.from(
    new Set(items.map((item) => String(item.publico || "").trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, "pt-BR"));

  populateFilter(SELECTORS.projetosArea, areas, "Todas as áreas");
  populateFilter(SELECTORS.projetosPublico, publicos, "Todos os públicos");
}

function getSearchTerm() {
  const search = getElement(SELECTORS.search);
  return search ? String(search.value).trim().toLowerCase() : "";
}

function getSelectedValue(id) {
  const select = getElement(id);
  return select ? String(select.value).trim() : "";
}

function getProjectSearchTerm() {
  const search = getElement(SELECTORS.projetosSearch);
  return search ? String(search.value).trim().toLowerCase() : "";
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

function filterProjects() {
  const query = getProjectSearchTerm();
  const area = getSelectedValue(SELECTORS.projetosArea);
  const publico = getSelectedValue(SELECTORS.projetosPublico);

  const filtered = state.projects.filter((item) => {
    const title = String(item.titulo || "").toLowerCase();
    const summary = String(item.resumo || "").toLowerCase();
    const areaText = String(item.area || "").toLowerCase();
    const publicoText = String(item.publico || "").toLowerCase();

    const matchesQuery =
      !query ||
      title.includes(query) ||
      summary.includes(query) ||
      areaText.includes(query) ||
      publicoText.includes(query);

    const matchesArea = !area || areaText === area.toLowerCase();
    const matchesPublico = !publico || publicoText === publico.toLowerCase();

    return matchesQuery && matchesArea && matchesPublico;
  });

  state.filteredProjects = filtered;
  renderProjects(filtered);
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

function attachProjectFilters() {
  const search = getElement(SELECTORS.projetosSearch);
  const area = getElement(SELECTORS.projetosArea);
  const publico = getElement(SELECTORS.projetosPublico);

  if (search) {
    search.addEventListener("input", filterProjects);
  }
  if (area) {
    area.addEventListener("change", filterProjects);
  }
  if (publico) {
    publico.addEventListener("change", filterProjects);
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

function initializeProjectPage() {
  const list = getElement(SELECTORS.projetosList);
  if (!list) return;

  state.projects = [...PROJETOS];
  state.filteredProjects = [...state.projects];

  populateProjectFilters(state.projects);
  renderProjects(state.projects);
  attachProjectFilters();
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
  if (getElement(SELECTORS.projetosList)) {
    initializeProjectPage();
  }
});
