"use strict";

/**
 * Gera os cards de Projetos e Soluções como HTML estático.
 *
 * O conteúdo vive em `assets/data/site-content.json`; este script escreve os
 * cards, as opções dos filtros e o contador direto nas páginas, para que o
 * conteúdo exista sem depender de JavaScript (SEO e leitores sem JS).
 *
 * O JavaScript continua lendo os cards já presentes no HTML para filtrar.
 * O teste `tests/cards-estaticos.test.cjs` falha se o HTML e o JSON saírem de
 * sincronia — rode este script sempre que o JSON mudar.
 *
 * Uso:
 *   node tools/gerar-cards-estaticos.cjs            # grava as páginas
 *   node tools/gerar-cards-estaticos.cjs --conferir # só compara, sem gravar
 */

const fs = require("node:fs");
const path = require("node:path");

const RAIZ = path.join(__dirname, "..");
const FONTE = path.join(RAIZ, "assets", "data", "site-content.json");

const CAPAS_SOLUCOES = Object.freeze({
  "Google Workspace para OSCs": "assets/img/solutions/google-workspace-oscs-v1.webp",
  "CRM e Automação": "assets/img/solutions/crm-automacao-v1.webp",
  "Comunicação para Projetos Culturais":
    "assets/img/solutions/comunicacao-projetos-culturais-v1.webp",
  "IA para Organizações": "assets/img/solutions/ia-organizacoes-v1.webp",
  "Cultura Maker e Robótica": "assets/img/solutions/cultura-maker-robotica-v1.webp",
  "Biblioteca Viva": "assets/img/solutions/biblioteca-viva-v1.webp",
});

function escapeHTML(valor) {
  return String(valor === null || valor === undefined ? "" : valor)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function campo(item, ...chaves) {
  for (const chave of chaves) {
    if (item && Object.prototype.hasOwnProperty.call(item, chave) && item[chave] != null) {
      return item[chave];
    }
  }
  return undefined;
}

function texto(valor) {
  return String(valor === null || valor === undefined ? "" : valor).trim();
}

function capaDaSolucao(item) {
  const configurada = texto(campo(item, "imagem", "Imagem"));
  if (configurada && /^https?:\/\//i.test(configurada)) return configurada;
  if (configurada && !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(configurada)) return escapeHTML(configurada);
  return CAPAS_SOLUCOES[texto(campo(item, "titulo", "Título"))] || "";
}

/** Cartão de projeto, no mesmo markup que o JavaScript produzia. */
function cardProjeto(item) {
  const titulo = texto(campo(item, "titulo", "Título")) || "Sem título";
  const area = texto(campo(item, "area", "Área")) || "Área não informada";
  const publico = texto(campo(item, "publico", "Público")) || "Público não informado";
  const resumo = texto(campo(item, "resumo", "Resumo")) || "Resumo não disponível.";
  const cta = texto(campo(item, "cta", "CTA")) || "Conhecer projeto";
  const url = texto(campo(item, "url", "URL"));

  const atributos = [
    `data-titulo="${escapeHTML(titulo)}"`,
    `data-area="${escapeHTML(area)}"`,
    `data-publico="${escapeHTML(publico)}"`,
    `data-resumo="${escapeHTML(resumo)}"`,
  ].join(" ");

  const link = url
    ? `\n              <a class="btn secondary card-cta" href="${escapeHTML(url)}"${
        /^https?:\/\//i.test(url) ? ' target="_blank" rel="noopener"' : ""
      }>${escapeHTML(cta)}</a>`
    : "";

  return `          <article class="project-card" ${atributos}>
            <div class="card-body">
              <div class="project-meta">
                <span class="badge">${escapeHTML(area)}</span>
                <span class="badge secondary">${escapeHTML(publico)}</span>
              </div>
              <h3>${escapeHTML(titulo)}</h3>
              <p class="summary">${escapeHTML(resumo)}</p>${link}
            </div>
          </article>`;
}

/** Cartão de solução, com a capa oficial. */
function cardSolucao(item) {
  const titulo = texto(campo(item, "titulo", "Título")) || "Sem título";
  const categoria = texto(campo(item, "categoria", "Categoria")) || "Categoria não informada";
  const publico = texto(campo(item, "publico", "Público")) || "Público não informado";
  const resumo = texto(campo(item, "resumo", "Resumo")) || "Resumo não disponível.";
  const cta = texto(campo(item, "cta", "CTA")) || "Conhecer solução";
  const url = texto(campo(item, "url", "URL"));
  const capa = capaDaSolucao(item);

  const atributos = [
    `data-titulo="${escapeHTML(titulo)}"`,
    `data-categoria="${escapeHTML(categoria)}"`,
    `data-publico="${escapeHTML(publico)}"`,
    `data-resumo="${escapeHTML(resumo)}"`,
  ].join(" ");

  const imagem = capa
    ? `
            <div class="cover solution-cover">
              <img src="${capa}" alt="${escapeHTML(
        `Ilustração da solução ${titulo}`
      )}" width="1200" height="800" loading="lazy" decoding="async">
            </div>`
    : "";

  const link = url
    ? `\n              <a class="btn secondary card-cta" href="${escapeHTML(url)}"${
        /^https?:\/\//i.test(url) ? ' target="_blank" rel="noopener"' : ""
      }>${escapeHTML(cta)}</a>`
    : "";

  return `          <article class="project-card solution-card" ${atributos}>${imagem}
            <div class="card-body">
              <div class="project-meta">
                <span class="badge">${escapeHTML(categoria)}</span>
                <span class="badge secondary">${escapeHTML(publico)}</span>
              </div>
              <h3>${escapeHTML(titulo)}</h3>
              <p class="summary">${escapeHTML(resumo)}</p>${link}
            </div>
          </article>`;
}

function valoresUnicos(itens, chaves) {
  return Array.from(
    new Set(itens.map((item) => texto(campo(item, ...chaves))).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function opcoes(valores, rotuloVazio) {
  return [`                <option value="">${rotuloVazio}</option>`]
    .concat(
      valores.map(
        (valor) => `                <option value="${escapeHTML(valor)}">${escapeHTML(valor)}</option>`
      )
    )
    .join("\n");
}

function contador(quantidade, singular, plural) {
  return `${quantidade} ${quantidade === 1 ? singular : plural} • ${quantidade} no total`;
}

function blocos(conteudo) {
  const projetos = conteudo.projetos.items;
  const solucoes = conteudo.solucoes.items;

  return {
    "projetos.html": {
      "cards-projetos": projetos.map(cardProjeto).join("\n"),
      "opcoes-projetos-area": opcoes(
        valoresUnicos(projetos, ["area", "Área"]),
        "Todas as áreas"
      ),
      "opcoes-projetos-publico": opcoes(
        valoresUnicos(projetos, ["publico", "Público"]),
        "Todos os públicos"
      ),
    },
    "solucoes.html": {
      "cards-solucoes": solucoes.map(cardSolucao).join("\n"),
      "opcoes-solucoes-categoria": opcoes(
        valoresUnicos(solucoes, ["categoria", "Categoria"]),
        "Todas as categorias"
      ),
    },
  };
}

function contadores(conteudo) {
  return {
    "projetos.html": {
      "projetos-contador": contador(conteudo.projetos.items.length, "projeto disponível", "projetos disponíveis"),
    },
    "solucoes.html": {
      "solucoes-contador": contador(conteudo.solucoes.items.length, "solução disponível", "soluções disponíveis"),
    },
  };
}

/** Substitui o trecho entre `<!-- nome:inicio -->` e `<!-- nome:fim -->`. */
function aplicarBloco(html, nome, corpo) {
  const inicio = `<!-- ${nome}:inicio -->`;
  const fim = `<!-- ${nome}:fim -->`;
  const i = html.indexOf(inicio);
  const f = html.indexOf(fim);
  if (i < 0 || f < 0 || f < i) throw new Error(`marcadores ausentes: ${nome}`);

  const eol = html.includes(inicio + "\r\n") ? "\r\n" : "\n";
  const bloco = corpo.replace(/\n/g, eol);

  return html.slice(0, i + inicio.length) + eol + bloco + eol + html.slice(f);
}

function aplicarContador(html, id, valor) {
  const padrao = new RegExp(`(<p id="${id}"[^>]*>)[\\s\\S]*?(</p>)`);
  if (!padrao.test(html)) throw new Error(`contador não encontrado: ${id}`);
  return html.replace(padrao, `$1${valor}$2`);
}

function gerar() {
  const conteudo = JSON.parse(fs.readFileSync(FONTE, "utf8"));
  const porPagina = blocos(conteudo);
  const contadoresPorPagina = contadores(conteudo);
  const resultado = {};

  for (const pagina of Object.keys(porPagina)) {
    const caminho = path.join(RAIZ, pagina);
    let html = fs.readFileSync(caminho, "utf8");
    for (const [nome, corpo] of Object.entries(porPagina[pagina])) {
      html = aplicarBloco(html, nome, corpo);
    }
    for (const [id, valor] of Object.entries(contadoresPorPagina[pagina])) {
      html = aplicarContador(html, id, valor);
    }
    resultado[pagina] = html;
  }

  return resultado;
}

function principal() {
  const conferir = process.argv.includes("--conferir");
  const gerado = gerar();
  let divergentes = 0;

  for (const [pagina, html] of Object.entries(gerado)) {
    const caminho = path.join(RAIZ, pagina);
    const atual = fs.readFileSync(caminho, "utf8");
    if (atual === html) {
      console.log(`${pagina}: em sincronia`);
      continue;
    }
    divergentes += 1;
    if (conferir) {
      console.log(`${pagina}: DIVERGENTE do site-content.json`);
    } else {
      fs.writeFileSync(caminho, html, "utf8");
      console.log(`${pagina}: atualizado`);
    }
  }

  if (conferir && divergentes > 0) {
    console.error("\nRode: node tools/gerar-cards-estaticos.cjs");
    process.exit(1);
  }
}

module.exports = {
  CAPAS_SOLUCOES,
  cardProjeto,
  cardSolucao,
  contador,
  escapeHTML,
  gerar,
  opcoes,
  valoresUnicos,
};

if (require.main === module) principal();
