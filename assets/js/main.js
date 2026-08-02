const API_BIBLIOTECA =
  "https://script.google.com/macros/s/AKfycbzhh37NeK7hAaglGCilFvCME6pxgC7V_EdR5ct3wkmJEpywh50mq3i-xgnP1lQlqQ9PTA/exec";

const state = {
  items: [],
  filtered: [],
  projects: [],
  filteredProjects: [],
  solutions: [],
  filteredSolutions: [],
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
  solucoesList: "solucoes-lista",
  solucoesEmpty: "solucoes-vazio",
  solucoesContador: "solucoes-contador",
  solucoesStatus: "solucoes-status",
  solucoesSearch: "solucoes-search",
  solucoesCategoria: "solucoes-categoria",
};

const moduleCache = {};
const modulePromises = {};

function getField(item, ...keys) {
  if (!item || typeof item !== "object") return undefined;
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(item, key) && item[key] != null) {
      return item[key];
    }
  }
  return undefined;
}

function isValidUrl(value) {
  if (!value || typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }
  return true;
}

function getSafeUrl(value) {
  const trimmed = String(value || "").trim();
  return isValidUrl(trimmed) ? escapeHTML(trimmed) : "#";
}

function normalizeModuleItem(rawItem) {
  const item = rawItem || {};
  return {
    titulo: String(getField(item, "titulo", "título") || "").trim(),
    area: String(getField(item, "area", "área") || "").trim(),
    publico: String(getField(item, "publico", "público") || "").trim(),
    resumo: String(getField(item, "resumo", "descricao", "descrição") || "").trim(),
    categoria: String(getField(item, "categoria") || "").trim(),
    cta: String(getField(item, "cta") || "").trim(),
    url: String(getField(item, "url", "paginaUrl") || "").trim(),
    imagem: String(getField(item, "imagem", "imagemUrl") || "").trim(),
    atualizacao: String(getField(item, "atualizacao", "dataDeAtualizacao") || "").trim(),
  };
}

async function fetchModulo(moduleName) {
  const moduleKey = String(moduleName || "").trim();
  if (!moduleKey) {
    throw new Error("Nome do módulo inválido");
  }

  if (moduleCache[moduleKey]) {
    return moduleCache[moduleKey];
  }

  if (modulePromises[moduleKey]) {
    return modulePromises[moduleKey];
  }

  const params = new URLSearchParams({ module: moduleKey });
  const url = `${API_BIBLIOTECA}?${params.toString()}`;

  const promise = (async () => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Falha na resposta da API para o módulo ${moduleKey}`);
    }

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error("Resposta da API inválida ou não é JSON");
    }

    if (!data || !data.ok || !Array.isArray(data.items)) {
      throw new Error("Dados da API inválidos");
    }

    const items = data.items.map(normalizeModuleItem);
    const result = { ...data, items };
    moduleCache[moduleKey] = result;
    return result;
  })();

  modulePromises[moduleKey] = promise;
  try {
    return await promise;
  } finally {
    delete modulePromises[moduleKey];
  }
}

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
  const url = getSafeUrl(project.url || "#");
  const hasUrl = url !== "#";
  const targetAttrs = hasUrl ? "target=\"_blank\" rel=\"noopener\"" : "";

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

function buildSolutionCard(solution) {
  const title = escapeHTML(solution.titulo || "Sem título");
  const categoria = escapeHTML(solution.categoria || "Categoria não informada");
  const publico = escapeHTML(solution.publico || "Público não informado");
  const resumo = escapeHTML(solution.resumo || "Resumo não disponível.");
  const cta = escapeHTML(solution.cta || "Conhecer solução");
  const url = getSafeUrl(solution.url || "#");
  const imagem = escapeHTML(solution.imagem || "");
  const hasUrl = url !== "#";
  const targetAttrs = hasUrl ? "target=\"_blank\" rel=\"noopener\"" : "";
  const coverStyle = imagem ? `style="background-image:url('${imagem}')"` : "";

  return `
    <article class="project-card">
      <div class="cover" ${coverStyle}>
        ${imagem ? "" : '<div class="cover-fallback">Solução</div>'}
      </div>
      <div class="card-body">
        <div class="project-meta">
          <span class="badge">${categoria}</span>
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

function updateSolutionStatus(message, isError = false) {
  const status = getElement(SELECTORS.solucoesStatus);
  if (!status) return;
  status.textContent = message;
  status.classList.toggle("error", isError);
}

function updateSolutionCounter(count, total) {
  const counter = getElement(SELECTORS.solucoesContador);
  if (!counter) return;
  const label = count === 1 ? "solução disponível" : "soluções disponíveis";
  counter.textContent = `${count} ${label}` + (total ? ` • ${total} no total` : "");
}

function toggleSolutionEmpty(show) {
  const emptyMessage = getElement(SELECTORS.solucoesEmpty);
  if (!emptyMessage) return;
  emptyMessage.classList.toggle("hidden", !show);
}

function renderSolutions(items) {
  const list = getElement(SELECTORS.solucoesList);
  if (!list) return;

  if (!Array.isArray(items) || items.length === 0) {
    list.innerHTML = "";
    toggleSolutionEmpty(true);
    updateSolutionStatus("Nenhuma solução encontrada para os filtros aplicados.");
    updateSolutionCounter(0, state.solutions.length);
    return;
  }

  toggleSolutionEmpty(false);
  updateSolutionStatus("");
  updateSolutionCounter(items.length, state.solutions.length);
  list.innerHTML = items.map(buildSolutionCard).join("");
}

function populateSolutionFilters(items) {
  const categories = Array.from(
    new Set(items.map((item) => String(item.categoria || "").trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, "pt-BR"));

  populateFilter(SELECTORS.solucoesCategoria, categories, "Todas as categorias");
}

function getSolutionSearchTerm() {
  const search = getElement(SELECTORS.solucoesSearch);
  return search ? String(search.value).trim().toLowerCase() : "";
}

function filterSolutions() {
  const query = getSolutionSearchTerm();
  const category = getSelectedValue(SELECTORS.solucoesCategoria);

  const filtered = state.solutions.filter((item) => {
    const title = String(item.titulo || "").toLowerCase();
    const summary = String(item.resumo || "").toLowerCase();
    const categoryText = String(item.categoria || "").toLowerCase();
    const publicoText = String(item.publico || "").toLowerCase();

    const matchesQuery =
      !query ||
      title.includes(query) ||
      summary.includes(query) ||
      categoryText.includes(query) ||
      publicoText.includes(query);

    const matchesCategory = !category || categoryText === category.toLowerCase();
    return matchesQuery && matchesCategory;
  });

  state.filteredSolutions = filtered;
  renderSolutions(filtered);
}

function attachSolutionFilters() {
  const search = getElement(SELECTORS.solucoesSearch);
  const category = getElement(SELECTORS.solucoesCategoria);

  if (search) {
    search.addEventListener("input", filterSolutions);
  }
  if (category) {
    category.addEventListener("change", filterSolutions);
  }
}

function initializeProjectPage() {
  const list = getElement(SELECTORS.projetosList);
  const status = getElement(SELECTORS.projetosStatus);
  if (!list) return;

  list.innerHTML = "";
  updateProjectStatus("Carregando projetos...");
  toggleProjectEmpty(false);

  fetchModulo("projetos")
    .then((data) => {
      state.projects = data.items;
      state.filteredProjects = [...state.projects];

      populateProjectFilters(state.projects);
      renderProjects(state.projects);
      attachProjectFilters();
    })
    .catch((error) => {
      console.error(error);
      list.innerHTML = "";
      updateProjectStatus("Não foi possível carregar os projetos agora. Tente novamente mais tarde.", true);
      updateProjectCounter(0, 0);
      toggleProjectEmpty(true);
    });
}

function initializeSolutionPage() {
  const list = getElement(SELECTORS.solucoesList);
  if (!list) return;

  list.innerHTML = "";
  updateSolutionStatus("Carregando soluções...");
  toggleSolutionEmpty(false);

  fetchModulo("solucoes")
    .then((data) => {
      state.solutions = data.items;
      state.filteredSolutions = [...state.solutions];

      populateSolutionFilters(state.solutions);
      renderSolutions(state.solutions);
      attachSolutionFilters();
    })
    .catch((error) => {
      console.error(error);
      list.innerHTML = "";
      updateSolutionStatus("Não foi possível carregar as soluções agora. Tente novamente mais tarde.", true);
      updateSolutionCounter(0, 0);
      toggleSolutionEmpty(true);
    });
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
  if (getElement(SELECTORS.solucoesList)) {
    initializeSolutionPage();
  }
});
