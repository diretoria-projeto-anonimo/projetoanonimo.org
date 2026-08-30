"use strict";

const localMaterialConfig =
  typeof window !== "undefined" ? window.PA_BIBLIOTECA_CONFIG : null;

const MATERIAL_API_URL =
  (typeof localMaterialConfig?.apiUrl === "string" &&
    localMaterialConfig.apiUrl.trim()) ||
  "https://script.google.com/macros/s/AKfycbzhh37NeK7hAaglGCilFvCME6pxgC7V_EdR5ct3wkmJEpywh50mq3i-xgnP1lQlqQ9PTA/exec";
const MATERIAL_METRICS_API_URL =
  (typeof localMaterialConfig?.metricsApiUrl === "string" &&
    localMaterialConfig.metricsApiUrl.trim()) ||
  "https://script.google.com/macros/s/AKfycby_YNT0D5RXUyR0snSUvOzmVji6CjVhKjzK0IZdaXxOyo_KQAkO1z5T2cXzXEDoZEI/exec";

const MATERIAL_EDITORIAL_DEFAULTS = Object.freeze({
  "ia-para-organizacoes-sociais": {
    urlCapa: "../assets/img/library/ia-organizacoes-sociais-v1.webp",
  },
  "google-workspace-para-oscs": {
    territorio: "Organização Digital",
    urlCapa: "../assets/img/library/google-workspace-oscs-v2.webp",
    altCapa:
      "Mãos de uma equipe colaborando com computadores, cadernos e documentos organizados.",
    creditoCapa:
      "Imagem ilustrativa gerada por IA com OpenAI, sob direção editorial do Projeto Anônimo.",
    proximoSlug: "checklist-diagnostico-digital",
    tituloProximoPasso: "Agora observe sua organização como um todo",
    resumoProximoPasso:
      "O Checklist de Diagnóstico Digital ajuda a identificar outros pontos de atenção em processos, segurança, dados e canais.",
    ctaProximoPasso: "Fazer o checklist",
  },
  "checklist-diagnostico-digital": {
    urlCapa: "../assets/img/library/checklist-diagnostico-digital-v2.webp",
    altCapa:
      "Checklist impresso com cinco dimensões abstratas e três prioridades marcadas, ao lado de materiais de trabalho, visto de cima.",
    creditoCapa:
      "Imagem ilustrativa gerada por IA com OpenAI, sob direção editorial do Projeto Anônimo.",
  },
});

document.addEventListener("DOMContentLoaded", () => {
  iniciarPaginaMaterial().catch((error) => {
    console.error("Erro ao iniciar página de material:", error);
    mostrarErroMaterial(
      "Ocorreu um erro ao carregar o material. Tente novamente mais tarde."
    );
  });
});

async function iniciarPaginaMaterial() {
  const detalhe = document.querySelector("#material-detalhe");

  if (!detalhe) {
    return;
  }

  atualizarAno();

  const parametros = new URLSearchParams(window.location.search);
  const slug = String(parametros.get("slug") || "").trim();

  if (!slug) {
    mostrarErroMaterial(
      "O endereço não informou qual material deve ser exibido."
    );
    return;
  }

  try {
    const material = await buscarMaterial(slug);

    if (!material) {
      mostrarErroMaterial("Material não encontrado ou ainda não publicado.");
      return;
    }

    renderizarMaterial(material);
    atualizarSeo(material, slug);
    registrarVisualizacao(material);
    await carregarRelacionados(material);
  } catch (error) {
    console.error("Erro ao buscar material:", error);

    mostrarErroMaterial(
      "Não foi possível consultar a Biblioteca Viva neste momento."
    );
  }
}

async function buscarMaterial(slug) {
  const url = new URL(MATERIAL_API_URL);

  url.searchParams.set("module", "biblioteca");
  url.searchParams.set("slug", slug);

  const resposta = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!resposta.ok) {
    throw new Error(`Resposta HTTP ${resposta.status}`);
  }

  const dados = await resposta.json();

  if (dados.ok === false) {
    return null;
  }

  if (dados.item && typeof dados.item === "object") {
    const completo = await buscarMaterialCompletoNaLista(slug);
    return completo ? { ...completo, ...dados.item } : dados.item;
  }

  /*
   * Compatibilidade temporária:
   * caso a API ainda devolva items em vez de item.
   */
  if (Array.isArray(dados.items)) {
    return (
      dados.items.find(
        (item) => normalizarTexto(item.slug) === normalizarTexto(slug)
      ) || null
    );
  }

  return null;
}

async function buscarMaterialCompletoNaLista(slug) {
  try {
    const url = new URL(MATERIAL_API_URL);
    url.searchParams.set("module", "biblioteca");

    const resposta = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
      },
    });

    if (!resposta.ok) {
      return null;
    }

    const dados = await resposta.json();
    const items = Array.isArray(dados.items) ? dados.items : [];

    return (
      items.find(
        (item) =>
          normalizarTexto(obterCampo(item, ["slug"])) === normalizarTexto(slug)
      ) || null
    );
  } catch {
    return null;
  }
}

function renderizarMaterial(material) {
  const detalhe = document.querySelector("#material-detalhe");

  if (!detalhe) {
    return;
  }

  const titulo = obterCampo(material, ["titulo", "título"]) || "Material";
  const slugMaterial = obterCampo(material, ["slug"]);
  const configuracaoEditorial =
    MATERIAL_EDITORIAL_DEFAULTS[slugMaterial] || {};

  const resumo =
    obterCampo(material, ["resumo", "descricao", "descrição"]) ||
    "Material da Biblioteca Viva.";

  const categoria = obterCampo(material, ["categoria"]);
  const territorio =
    obterCampo(material, ["territorio", "território"]) ||
    configuracaoEditorial.territorio ||
    categoria;
  const formato = obterCampo(material, ["formato"]);
  const publico = obterCampo(material, ["publico", "público"]);
  const nivel = obterCampo(material, ["nivel", "nível"]);
  const etapaJornada = obterCampo(material, [
    "etapaJornada",
    "etapa da jornada",
  ]);

  const tempoLeitura = obterCampo(material, [
    "tempoDeLeitura",
    "tempo de leitura",
    "tempoLeitura",
  ]);

  const autor = obterCampo(material, ["autor"]);
  const versao = obterCampo(material, ["versao", "versão"]);
  const data = obterCampo(material, ["data"]);

  const ultimaRevisao = obterCampo(material, [
    "ultimaRevisao",
    "última revisão",
  ]);

  const licenca = obterCampo(material, ["licenca", "licença"]);

  const palavrasChave = obterCampo(material, [
    "palavrasChave",
    "palavras-chave",
  ]);

  const urlArquivo = validarUrl(
    obterCampo(material, ["urlDoArquivo", "urlArquivo"])
  );

  const urlFormulario = validarUrl(
    obterCampo(material, ["urlDoFormulario", "urlFormulario"])
  );

  const urlCapa =
    validarUrl(obterCampo(material, ["urlDaCapa", "urlCapa"])) ||
    configuracaoEditorial.urlCapa ||
    "";
const urlPdf = validarUrl(
  obterCampo(material, ["urlDoPdf", "urlPdf", "url do pdf"])
);

const urlVideo = validarUrl(
  obterCampo(material, [
    "urlDoVideo",
    "urlVideo",
    "url do vídeo",
  ])
);
const textoCta =
  obterCampo(material, ["cta"]) ||
  "Acessar material";
const ctaDestino = validarUrl(
  obterCampo(material, ["ctaDestino", "destino do cta"])
);

const botoesMaterial = [];

const urlAnexos = validarUrl(
  obterCampo(material, [
    "urlDeAnexos",
    "urlAnexos",
    "url de anexos",
  ])
);

const tipoMidia = obterCampo(material, [
  "tipoDeMidia",
  "tipoMidia",
  "tipo de mídia",
]);

const legendaMidia = obterCampo(material, [
  "legendaDaMidia",
  "legendaMidia",
  "legenda da mídia",
]);

const creditoMidia = obterCampo(material, [
  "creditoDaMidia",
  "creditoMidia",
  "crédito da mídia",
]);
const creditoCapa =
  obterCampo(material, [
    "creditoDaCapa",
    "creditoCapa",
    "crédito da capa",
  ]) ||
  configuracaoEditorial.creditoCapa ||
  creditoMidia;
  const textoAlternativo =
    obterCampo(material, [
      "altCapa",
      "textoAlternativoDaCapa",
      "altDaCapa",
      "texto alternativo da capa",
    ]) ||
    configuracaoEditorial.altCapa ||
    `Capa do material ${titulo}`;

if (urlVideo) {
  botoesMaterial.push(`
    <a
      class="material-button material-button-secondary"
      href="${escaparAtributo(urlVideo)}"
      target="_blank"
      rel="noopener"
    >
      Assistir ao vídeo
    </a>
  `);
}

if (urlFormulario) {
  botoesMaterial.push(`
    <a
      class="material-button material-button-outline"
      href="${escaparAtributo(urlFormulario)}"
      target="_blank"
      rel="noopener"
    >
      ${escaparHtml(textoCta)}
      </a>
  `);
}

const botoesHtml = botoesMaterial.length
  ? `
      <div class="material-actions">
        ${botoesMaterial.join("")}
      </div>
    `
  : "";

const videoId = extrairYoutubeId(urlVideo);

const videoHtml = videoId
  ? `
      <section class="material-media">
        <div class="material-video">
          <iframe
            src="https://www.youtube-nocookie.com/embed/${escaparAtributo(videoId)}"
            title="${escaparAtributo(legendaMidia || titulo)}"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>

        ${
          legendaMidia || creditoMidia
            ? `
                <p class="material-media-caption">
                  ${legendaMidia ? escaparHtml(legendaMidia) : ""}
                  ${
                    creditoMidia
                      ? `<span> Crédito: ${escaparHtml(creditoMidia)}</span>`
                      : ""
                  }
                </p>
              `
            : ""
        }
      </section>
    `
  : "";

  const metadados = [
    criarMetadado("Categoria", categoria),
    criarMetadado("Formato", formato),
    criarMetadado("Público", publico),
    criarMetadado("Nível", nivel),
    criarMetadado("Tempo de leitura", tempoLeitura),
    criarMetadado("Etapa da jornada", etapaJornada),
    criarMetadado("Autor", autor),
    criarMetadado("Versão", versao),
    criarMetadado("Data", formatarData(data)),
    criarMetadado("Última revisão", formatarData(ultimaRevisao)),
    criarMetadado("Licença", licenca),
  ]
    .filter(Boolean)
    .join("");

  const capaHtml = urlCapa
    ? `
      <figure class="material-cover">
        <img
          src="${escaparAtributo(urlCapa)}"
          alt="${escaparAtributo(textoAlternativo)}"
          loading="lazy"
        >
        ${
          creditoCapa
            ? `<figcaption class="material-cover-caption">${escaparHtml(
                creditoCapa
              )}</figcaption>`
            : ""
        }
      </figure>
    `
    : "";

  const palavrasHtml = palavrasChave
    ? `
      <div class="material-keywords">
        <h2>Palavras-chave</h2>
        <p>${escaparHtml(palavrasChave)}</p>
      </div>
    `
    : "";
const conteudoMarkdown = obterCampo(material, [
  "conteudoMarkdown",
  "conteúdo markdown",
  "conteudo markdown",
]);
const checklistOrientado = slugMaterial === "checklist-diagnostico-digital";
const ancoraConteudo = ctaDestino.startsWith("#")
  ? ctaDestino.slice(1)
  : "";

const conteudoHtml = conteudoMarkdown
  ? `
    <section
      class="material-article${checklistOrientado ? " material-article-checklist" : ""}"
      ${ancoraConteudo ? `id="${escaparAtributo(ancoraConteudo)}"` : ""}
    >
      ${markdownSeguroParaHtml(conteudoMarkdown, {
        modoChecklist: checklistOrientado,
      })}
    </section>
  `
  : "";

const ctaHeroHtml = ctaDestino
  ? `
      <div class="material-actions material-actions-hero">
        ${criarLinkBotao({
          url: ctaDestino,
          texto: textoCta,
          classe: "button button-primary",
          tipoMetrica: "clique",
          material,
        })}
      </div>
    `
  : "";

  const proximoSlug =
    obterCampo(material, ["proximoSlug", "próximo slug"]) ||
    configuracaoEditorial.proximoSlug ||
    "";
  const tituloProximoPasso =
    obterCampo(material, [
      "tituloProximoPasso",
      "título próximo passo",
    ]) ||
    configuracaoEditorial.tituloProximoPasso ||
    "";
  const resumoProximoPasso =
    obterCampo(material, [
      "resumoProximoPasso",
      "resumo próximo passo",
    ]) ||
    configuracaoEditorial.resumoProximoPasso ||
    "";
  const ctaProximoPasso =
    obterCampo(material, ["ctaProximoPasso", "cta próximo passo"]) ||
    configuracaoEditorial.ctaProximoPasso ||
    "Continuar aprendendo";
  const urlProximoPasso =
    validarUrl(obterCampo(material, ["urlProximoPasso"])) ||
    (proximoSlug
      ? `material.html?slug=${encodeURIComponent(proximoSlug)}`
      : "");

  const proximoPassoHtml = tituloProximoPasso && urlProximoPasso
    ? `
      <section class="material-next-step" aria-labelledby="proximo-passo-titulo">
        <p class="eyebrow">PRÓXIMO PASSO</p>
        <h2 id="proximo-passo-titulo">${escaparHtml(tituloProximoPasso)}</h2>
        ${
          resumoProximoPasso
            ? `<p>${escaparHtml(resumoProximoPasso)}</p>`
            : ""
        }
        ${criarLinkBotao({
          url: urlProximoPasso,
          texto: ctaProximoPasso,
          classe: "button button-primary",
          tipoMetrica: "clique",
          material,
        })}
      </section>
    `
    : "";

  const botaoPrincipal = urlArquivo
    ? criarLinkBotao({
        url: urlArquivo,
        texto: textoCta,
        classe: "button button-primary",
        tipoMetrica: tipoMetricaPrincipal(formato),
        material,
      })
    : "";

  const botaoFormulario = urlFormulario
    ? criarLinkBotao({
        url: urlFormulario,
        texto: "Solicitar ou receber material",
        classe: "button button-secondary",
        tipoMetrica: "formulario",
        material,
      })
    : "";
const metadadosHtml = metadados
  ? '<dl class="material-metadata">' + metadados + '</dl>'
  : "";

  detalhe.innerHTML = `
    <article class="material-content">
      ${capaHtml}

      <div class="material-body">
        <div class="material-tags">
          ${
            territorio
              ? `<span class="tag">${escaparHtml(territorio)}</span>`
              : ""
          }

          ${
            formato
              ? `<span class="tag">${escaparHtml(formato)}</span>`
              : ""
          }
        </div>

        <p class="eyebrow">BIBLIOTECA VIVA</p>

        <h1>${escaparHtml(titulo)}</h1>

        <p class="material-summary">
          ${escaparHtml(resumo)}
        </p>
        ${ctaHeroHtml}
        ${botoesHtml}
        ${videoHtml}
        ${metadadosHtml}
        ${palavrasHtml}
        ${conteudoHtml}
        ${proximoPassoHtml}

        <div class="material-actions">
          ${botaoPrincipal}
          ${botaoFormulario}

          <button
            id="compartilhar-material"
            class="button button-secondary"
            type="button"
          >
            Compartilhar
          </button>

          <a
            class="button button-link"
            href="../biblioteca.html"
          >
            Voltar à Biblioteca Viva
          </a>
        </div>

        <p
          id="mensagem-compartilhamento"
          class="share-message"
          aria-live="polite"
        ></p>
      </div>
    </article>
  `;

  detalhe.setAttribute("aria-busy", "false");

  configurarFallbackDeCapa(detalhe, textoAlternativo);
  configurarCompartilhamento(material);
}

function configurarFallbackDeCapa(detalhe, textoAlternativo) {
  const capa = detalhe.querySelector(".material-cover");
  const imagem = capa?.querySelector("img");
  if (!capa || !imagem) return;

  const mostrarFallback = () => {
    if (!capa.querySelector("img")) return;
    capa.innerHTML = `
      <div class="cover material-cover-fallback" role="img" aria-label="${escaparAtributo(
        textoAlternativo
      )}">
        <span class="cover-fallback">Biblioteca Viva</span>
      </div>
    `;
  };

  imagem.addEventListener("error", mostrarFallback, { once: true });
  if (imagem.complete && imagem.naturalWidth === 0) {
    mostrarFallback();
  }
}

function criarMetadado(rotulo, valor) {
  if (!valor) {
    return "";
  }

  return `
    <div class="material-metadata-item">
      <dt>${escaparHtml(rotulo)}</dt>
      <dd>${escaparHtml(valor)}</dd>
    </div>
  `;
}

function criarLinkBotao({
  url,
  texto,
  classe,
  tipoMetrica,
  material,
}) {
  const externo = /^https?:\/\//i.test(url);

  return `
    <a
      class="${escaparAtributo(classe)}"
      href="${escaparAtributo(url)}"
      ${externo ? 'target="_blank" rel="noopener"' : ""}
      data-metrica-tipo="${escaparAtributo(tipoMetrica)}"
      data-metrica-id="${escaparAtributo(
        obterCampo(material, ["metricaId", "id"]) || ""
      )}"
      data-metrica-referencia="${escaparAtributo(
        obterCampo(material, ["slug"]) || ""
      )}"
    >
      ${escaparHtml(texto)}
    </a>
  `;
}

async function carregarRelacionados(materialAtual) {
  const secao = document.querySelector("#materiais-relacionados");
  const lista = document.querySelector("#materiais-relacionados-lista");

  if (!secao || !lista) {
    return;
  }

  try {
    const url = new URL(MATERIAL_API_URL);
    url.searchParams.set("module", "biblioteca");

    const resposta = await fetch(url.toString());

    if (!resposta.ok) {
      return;
    }

    const dados = await resposta.json();

    if (!dados.ok || !Array.isArray(dados.items)) {
      return;
    }

    const slugAtual = normalizarTexto(
      obterCampo(materialAtual, ["slug"])
    );

    const categoriaAtual = normalizarTexto(
      obterCampo(materialAtual, ["categoria"])
    );

    const relacionados = dados.items
      .filter((item) => {
        const slugItem = normalizarTexto(
          obterCampo(item, ["slug"])
        );

        return slugItem && slugItem !== slugAtual;
      })
      .sort((a, b) => {
        const categoriaA = normalizarTexto(
          obterCampo(a, ["categoria"])
        );

        const categoriaB = normalizarTexto(
          obterCampo(b, ["categoria"])
        );

        const mesmaCategoriaA =
          categoriaA === categoriaAtual ? 1 : 0;

        const mesmaCategoriaB =
          categoriaB === categoriaAtual ? 1 : 0;

        return mesmaCategoriaB - mesmaCategoriaA;
      })
      .slice(0, 3);

    if (relacionados.length === 0) {
      return;
    }

    lista.innerHTML = relacionados
      .map(criarCardRelacionado)
      .join("");

    secao.hidden = false;
  } catch (error) {
    console.warn("Não foi possível carregar relacionados:", error);
  }
}

function criarCardRelacionado(item) {
  const titulo =
    obterCampo(item, ["titulo", "título"]) || "Material";

  const resumo = obterCampo(item, ["resumo"]);
  const categoria = obterCampo(item, ["categoria"]);
  const formato = obterCampo(item, ["formato"]);
  const slug = obterCampo(item, ["slug"]);
  const capa = obterCapaMaterial(item);
  const textoAlternativo =
    obterCampo(item, ["altCapa", "textoAlternativoDaCapa"]) ||
    `Ilustração do material ${titulo}`;

  const href = slug
    ? `material.html?slug=${encodeURIComponent(slug)}`
    : "../biblioteca.html";

  return `
    <a
      class="biblioteca-card biblioteca-card-link"
      href="${escaparAtributo(href)}"
      aria-label="Explorar material: ${escaparAtributo(titulo)}"
    >
      ${
        capa
          ? `<div class="related-material-cover"><img src="${escaparAtributo(
              capa
            )}" alt="${escaparAtributo(
              textoAlternativo
            )}" loading="lazy" decoding="async"></div>`
          : ""
      }
      <div class="biblioteca-card-content">
        <div class="material-tags">
          ${
            categoria
              ? `<span class="tag">${escaparHtml(categoria)}</span>`
              : ""
          }

          ${
            formato
              ? `<span class="tag">${escaparHtml(formato)}</span>`
              : ""
          }
        </div>

        <h3>${escaparHtml(titulo)}</h3>

        ${
          resumo
            ? `<p>${escaparHtml(resumo)}</p>`
            : ""
        }

        <span class="related-material-cta" aria-hidden="true">
          Explorar material →
        </span>
      </div>
    </a>
  `;
}

function obterCapaMaterial(material) {
  const configurada = validarUrl(
    obterCampo(material, ["urlDaCapa", "urlCapa"])
  );

  if (configurada) {
    return configurada;
  }

  const slug = obterCampo(material, ["slug"]);
  return MATERIAL_EDITORIAL_DEFAULTS[slug]?.urlCapa || "";
}

function mostrarErroMaterial(mensagem) {
  const detalhe = document.querySelector("#material-detalhe");
  const erro = document.querySelector("#material-erro");
  const texto = document.querySelector("#material-erro-mensagem");

  if (detalhe) {
    detalhe.hidden = true;
    detalhe.setAttribute("aria-busy", "false");
  }

  if (texto) {
    texto.textContent = mensagem;
  }

  if (erro) {
    erro.hidden = false;
  }
}

function atualizarSeo(material, slug) {
  const titulo =
    obterCampo(material, ["tituloSeo", "titulo", "título"]) ||
    "Material";

  const descricao =
    obterCampo(material, [
      "descricaoSeo",
      "resumo",
      "descricao",
      "descrição",
    ]) || "Material da Biblioteca Viva do Projeto Anônimo.";

  const urlCanonica =
    `https://projetoanonimo.org/biblioteca/material.html` +
    `?slug=${encodeURIComponent(slug)}`;

  const urlCapa = validarUrl(
    obterCampo(material, ["urlDaCapa", "urlCapa"])
  );

  document.title = normalizarTexto(titulo).includes("projeto anonimo")
    ? titulo
    : `${titulo} | Biblioteca Viva — Projeto Anônimo`;

  definirMeta('meta[name="description"]', descricao);
  definirMeta('meta[property="og:title"]', titulo);
  definirMeta('meta[property="og:description"]', descricao);
  definirMeta('meta[property="og:url"]', urlCanonica);
  definirMeta('meta[name="twitter:title"]', titulo);
  definirMeta('meta[name="twitter:description"]', descricao);

  if (urlCapa) {
    definirMeta('meta[property="og:image"]', urlCapa);
    definirMeta('meta[name="twitter:image"]', urlCapa);
  }

  const canonical = document.querySelector('link[rel="canonical"]');

  if (canonical) {
    canonical.setAttribute("href", urlCanonica);
  }
}

function definirMeta(seletor, valor) {
  let elemento = document.querySelector(seletor);

  if (!elemento) {
    elemento = document.createElement("meta");

    if (seletor.includes("property=")) {
      const propriedade = seletor.match(/property="([^"]+)"/)?.[1];

      if (propriedade) {
        elemento.setAttribute("property", propriedade);
      }
    } else {
      const nome = seletor.match(/name="([^"]+)"/)?.[1];

      if (nome) {
        elemento.setAttribute("name", nome);
      }
    }

    document.head.appendChild(elemento);
  }

  elemento.setAttribute("content", String(valor));
}

function configurarCompartilhamento(material) {
  const botao = document.querySelector("#compartilhar-material");
  const mensagem = document.querySelector(
    "#mensagem-compartilhamento"
  );

  if (!botao) {
    return;
  }

  botao.addEventListener("click", async () => {
    const titulo =
      obterCampo(material, ["titulo", "título"]) ||
      "Material da Biblioteca Viva";

    try {
      if (navigator.share) {
        await navigator.share({
          title: titulo,
          text: obterCampo(material, ["resumo"]) || "",
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);

        if (mensagem) {
          mensagem.textContent =
            "Link copiado para a área de transferência.";
        }
      }

      registrarMetrica({
        material,
        tipo: "compartilhamento",
      });
    } catch (error) {
      if (error.name !== "AbortError") {
        console.warn("Falha ao compartilhar:", error);
      }
    }
  });

  document
    .querySelectorAll("[data-metrica-tipo]")
    .forEach((link) => {
      link.addEventListener("click", () => {
        registrarMetrica({
          material,
          tipo: link.dataset.metricaTipo || "clique",
        });
      });
    });
}

function registrarVisualizacao(material) {
  const slug = obterCampo(material, ["slug"]) || "";
  const chave = `pa-visualizacao-${slug}`;

  if (sessionStorage.getItem(chave)) {
    return;
  }

  sessionStorage.setItem(chave, "1");

  registrarMetrica({
    material,
    tipo: "visualizacao",
  });
}

async function registrarMetrica({ material, tipo }) {
  const tiposPermitidos = new Set([
    "visualizacao",
    "clique",
    "download",
    "formulario",
    "compartilhamento",
  ]);

  if (!tiposPermitidos.has(tipo)) {
    return;
  }

  const payload = {
    action: "recordMetric",
    metricId:
      obterCampo(material, ["metricaId", "id"]) || "",
    type: tipo,
    origin: "biblioteca-individual",
    url: window.location.href,
    reference: obterCampo(material, ["slug"]) || "",
    session: obterSessaoAnonima(),
    device:
      window.matchMedia("(max-width: 767px)").matches
        ? "mobile"
        : "desktop",
    version: "1.2.0",
  };

  try {
    await fetch(MATERIAL_METRICS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch (error) {
    console.warn("Métrica não registrada:", error);
  }
}

function obterSessaoAnonima() {
  const chave = "pa-session-id";
  let sessao = sessionStorage.getItem(chave);

  if (!sessao) {
    sessao =
      typeof crypto?.randomUUID === "function"
        ? crypto.randomUUID()
        : `session-${Date.now()}-${Math.random()
            .toString(16)
            .slice(2)}`;

    sessionStorage.setItem(chave, sessao);
  }

  return sessao;
}

function tipoMetricaPrincipal(formato) {
  const formatoNormalizado = normalizarTexto(formato);

  const formatosDeArquivo = [
    "guia",
    "checklist",
    "ebook",
    "e-book",
    "template",
    "planilha",
    "pdf",
  ];

  return formatosDeArquivo.some((termo) =>
    formatoNormalizado.includes(termo)
  )
    ? "download"
    : "clique";
}

function obterCampo(objeto, nomes) {
  if (!objeto || typeof objeto !== "object") {
    return "";
  }

  for (const nome of nomes) {
    if (
      Object.prototype.hasOwnProperty.call(objeto, nome) &&
      objeto[nome] !== null &&
      objeto[nome] !== undefined
    ) {
      const valor = String(objeto[nome]).trim();

      if (valor) {
        return valor;
      }
    }
  }

  const nomesNormalizados = nomes.map(normalizarNomeCampo);

  for (const [chave, valorOriginal] of Object.entries(objeto)) {
    if (
      nomesNormalizados.includes(normalizarNomeCampo(chave)) &&
      valorOriginal !== null &&
      valorOriginal !== undefined
    ) {
      const valor = String(valorOriginal).trim();

      if (valor) {
        return valor;
      }
    }
  }

  return "";
}

function normalizarNomeCampo(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function validarUrl(valor) {
  const texto = String(valor || "").trim();

  if (!texto) {
    return "";
  }

  if (/^#[A-Za-z][A-Za-z0-9_-]*$/.test(texto)) {
    return texto;
  }

  if (
    texto.startsWith("/") ||
    texto.startsWith("./") ||
    texto.startsWith("../")
  ) {
    return texto;
  }

  try {
    const url = new URL(texto);

    return ["http:", "https:"].includes(url.protocol)
      ? url.toString()
      : "";
  } catch {
    return "";
  }
}

function formatarData(valor) {
  if (!valor) {
    return "";
  }

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return String(valor);
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(data);
}

function normalizarTexto(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function escaparHtml(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escaparAtributo(valor) {
  return escaparHtml(valor);
}

function atualizarAno() {
  const ano = document.querySelector("#current-year");

  if (ano) {
    ano.textContent = String(new Date().getFullYear());
  }
}

function criarGrupoRespostaChecklist(texto, indice) {
  const nome = `checklist-resposta-${indice}`;
  const opcoes = [
    ["sim", "Sim"],
    ["parcial", "Parcial"],
    ["nao", "Não"],
    ["nao-se-aplica", "Não se aplica"],
  ];
  const respostas = opcoes
    .map(
      ([valor, rotulo]) => `
        <label class="diagnostic-checklist-option">
          <input
            type="radio"
            name="${nome}"
            value="${valor}"
            autocomplete="off"
          >
          <span>${rotulo}</span>
        </label>
      `
    )
    .join("");

  return `
    <fieldset class="diagnostic-checklist-item">
      <legend>${formatarInlineSeguro(texto)}</legend>
      <div class="diagnostic-checklist-options">
        ${respostas}
      </div>
    </fieldset>
  `;
}

function markdownSeguroParaHtml(markdown, opcoes = {}) {
  const linhas = String(markdown || "").split(/\r?\n/);
  const partes = [];
  let listaAberta = "";
  let citacaoAberta = false;
  let codigoAberto = false;
  let indiceChecklist = 0;

  function fecharLista() {
    if (listaAberta) {
      partes.push(`</${listaAberta}>`);
      listaAberta = "";
    }
  }

  function fecharCitacao() {
    if (citacaoAberta) {
      partes.push("</blockquote>");
      citacaoAberta = false;
    }
  }

  for (const linhaOriginal of linhas) {
    const linha = linhaOriginal.trim();

    if (linha.startsWith("```")) {
      fecharLista();
      fecharCitacao();

      if (codigoAberto) {
        partes.push("</code></pre>");
        codigoAberto = false;
      } else {
        partes.push("<pre><code>");
        codigoAberto = true;
      }
      continue;
    }

    if (codigoAberto) {
      partes.push(`${escaparHtml(linhaOriginal)}\n`);
      continue;
    }

    if (!linha) {
      fecharLista();
      fecharCitacao();
      continue;
    }

    if (linha.startsWith(">")) {
      fecharLista();
      const conteudoCitacao = linha.replace(/^>\s?/, "");

      if (!citacaoAberta) {
        const tipo = normalizarTexto(conteudoCitacao);
        const modificador = tipo.includes("atencao")
          ? " editorial-callout-attention"
          : tipo.includes("na pratica")
            ? " editorial-callout-practice"
            : tipo.includes("pergunte")
              ? " editorial-callout-question"
              : tipo.includes("modelo")
                ? " editorial-callout-model"
                : "";
        partes.push(`<blockquote class="editorial-callout${modificador}">`);
        citacaoAberta = true;
      }

      if (conteudoCitacao) {
        partes.push(`<p>${formatarInlineSeguro(conteudoCitacao)}</p>`);
      }
      continue;
    }

    fecharCitacao();

    if (linha.startsWith("#### ")) {
      fecharLista();
      partes.push(
        `<h4>${formatarInlineSeguro(linha.slice(5))}</h4>`
      );
      continue;
    }

    if (linha.startsWith("### ")) {
      fecharLista();
      partes.push(
        `<h3>${formatarInlineSeguro(linha.slice(4))}</h3>`
      );
      continue;
    }

    if (linha.startsWith("## ")) {
      fecharLista();
      partes.push(
        `<h2>${formatarInlineSeguro(linha.slice(3))}</h2>`
      );
      continue;
    }

    if (linha.startsWith("# ")) {
      fecharLista();
      partes.push(
        `<h2>${formatarInlineSeguro(linha.slice(2))}</h2>`
      );
      continue;
    }

    const itemChecklist = linha.match(/^-\s+\[\s\]\s+(.+)$/);

    if (opcoes.modoChecklist && itemChecklist) {
      fecharLista();
      indiceChecklist += 1;
      partes.push(
        criarGrupoRespostaChecklist(itemChecklist[1], indiceChecklist)
      );
      continue;
    }

    const itemNaoOrdenado = linha.match(/^-\s+(.+)$/);
    const itemOrdenado = linha.match(/^\d+\.\s+(.+)$/);

    if (itemNaoOrdenado || itemOrdenado) {
      const tipoLista = itemOrdenado ? "ol" : "ul";
      if (listaAberta !== tipoLista) {
        fecharLista();
        partes.push(`<${tipoLista}>`);
        listaAberta = tipoLista;
      }

      partes.push(
        `<li>${formatarInlineSeguro(
          (itemOrdenado || itemNaoOrdenado)[1]
        )}</li>`
      );
      continue;
    }

    fecharLista();

    partes.push(
      `<p>${formatarInlineSeguro(linha)}</p>`
    );
  }

  fecharLista();
  fecharCitacao();

  if (codigoAberto) {
    partes.push("</code></pre>");
  }

  return partes.join("");
}

function formatarInlineSeguro(texto) {
  return escaparHtml(texto)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}
function extrairYoutubeId(valor) {
  const texto = String(valor || "").trim();

  if (!texto) {
    return "";
  }

  try {
    const url = new URL(texto);

    if (url.hostname.includes("youtu.be")) {
      return url.pathname.replace("/", "").trim();
    }

    if (url.hostname.includes("youtube.com")) {
      if (url.pathname.startsWith("/embed/")) {
        return url.pathname.split("/embed/")[1]?.split("/")[0] || "";
      }

      return url.searchParams.get("v") || "";
    }
  } catch {
    return "";
  }

  return "";
}

