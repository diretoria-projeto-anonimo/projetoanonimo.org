"use strict";

/* =========================================================
   ELEMENTOS E ESTADO DO EDITOR
========================================================= */

const formulario = document.getElementById("material-form");

const statusFormulario =
  document.getElementById("form-status");

const statusUpload =
  document.getElementById("upload-status");

const parametros =
  new URLSearchParams(window.location.search);

const slugEdicao = parametros.get("slug");
const modoEdicao = Boolean(slugEdicao);

const campoTitulo =
  formulario?.elements.namedItem("titulo");

const campoSlug =
  formulario?.elements.namedItem("slug");

const campoUrlCapa =
  formulario?.elements.namedItem("urlCapa");

const campoUrlArquivo =
  formulario?.elements.namedItem("urlArquivo");

const inputCapa =
  document.getElementById("arquivo-capa");

const inputPdf =
  document.getElementById("arquivo-pdf");

const inputAnexos =
  document.getElementById("arquivos-anexos");

let acaoSelecionada = "rascunho";
let materialAtual = null;

/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  iniciarFormulario
);

async function iniciarFormulario() {
  if (!formulario) {
    console.error(
      'Formulário com id "material-form" não encontrado.'
    );
    return;
  }

  configurarEventos();
  if (!modoEdicao) {
    configurarModoCriacao();
    return;
  }

  configurarModoEdicao();
  await carregarMaterial();
}

/* =========================================================
   CONFIGURAÇÃO DE EVENTOS
========================================================= */

function configurarEventos() {
  formulario.addEventListener(
    "submit",
    salvarMaterial
  );

  formulario
    .querySelectorAll('button[type="submit"]')
    .forEach((botao) => {
      botao.addEventListener("click", () => {
        acaoSelecionada =
          botao.value || "rascunho";
      });
    });

  campoTitulo?.addEventListener("input", () => {
    if (!campoSlug?.dataset.editadoManualmente) {
      campoSlug.value =
        gerarSlug(campoTitulo.value);
    }
  });

  campoSlug?.addEventListener("input", () => {
    campoSlug.dataset.editadoManualmente =
      campoSlug.value ? "true" : "";
  });
}

/* =========================================================
   MODOS DE CRIAÇÃO E EDIÇÃO
========================================================= */

function configurarModoCriacao() {
  document.title =
    "Novo material | PA Editorial CMS";

  const tituloPagina =
    document.querySelector("h1");

  if (tituloPagina) {
    tituloPagina.textContent =
      "Novo material";
  }
}

function configurarModoEdicao() {
  document.title =
    "Editar material | PA Editorial CMS";

  const tituloPagina =
    document.querySelector("h1");

  if (tituloPagina) {
    tituloPagina.textContent =
      "Editar material";
  }

  const botaoRascunho =
    formulario.querySelector(
      'button[value="rascunho"]'
    );

  if (botaoRascunho) {
    botaoRascunho.textContent =
      "Salvar alterações";
  }
}

/* =========================================================
   CARREGAR MATERIAL PARA EDIÇÃO
========================================================= */

async function carregarMaterial() {
  definirEstado(
    "Carregando material...",
    false,
    true
  );

  try {
    const resultado = await chamarApi({
      action: "getMaterial",
      slug: slugEdicao,
    });

    materialAtual =
      resultado.material || resultado;

    preencherFormulario(materialAtual);

    definirEstado(
      "Material carregado.",
      false,
      false
    );
  } catch (erro) {
    console.error(
      "Erro ao carregar material:",
      erro
    );

    definirEstado(
      erro.message ||
        "Não foi possível carregar o material.",
      true,
      false
    );
  }
}

/* =========================================================
   PREENCHER FORMULÁRIO
========================================================= */

function preencherFormulario(material) {
  const campos = {
    id: ["id"],

    titulo: ["titulo"],
    slug: ["slug"],
    categoria: ["categoria"],
    formato: ["formato"],
    resumo: ["resumo"],
    publico: ["publico"],
    nivel: ["nivel"],

    tempoLeitura: [
      "tempodeleitura",
      "tempoLeitura",
    ],

    versao: ["versao"],
    autor: ["autor"],
    licenca: ["licenca"],

    urlArquivo: [
      "urlarquivo",
      "urldoarquivo",
      "urlArquivo",
    ],

    urlCapa: [
      "urlcapa",
      "urldacapa",
      "urlCapa",
    ],
    altCapa: ["altcapa", "altCapa"],
    creditoCapa: ["creditocapa", "creditoCapa"],

    urlVideo: [
      "urlvideo",
      "urldovideo",
      "urlVideo",
    ],

    urlFormulario: [
      "urlformulario",
      "urldoformulario",
      "urlFormulario",
    ],

    cta: ["cta"],
    ctaDestino: ["ctadestino", "ctaDestino"],
    territorio: ["territorio"],
    etapaJornada: ["etapajornada", "etapaJornada"],
    proximoSlug: ["proximoslug", "proximoSlug"],
    urlProximoPasso: ["urlproximopasso", "urlProximoPasso"],
    tituloProximoPasso: [
      "tituloproximopasso",
      "tituloProximoPasso",
    ],
    resumoProximoPasso: [
      "resumoproximopasso",
      "resumoProximoPasso",
    ],
    ctaProximoPasso: [
      "ctaproximopasso",
      "ctaProximoPasso",
    ],
    tituloSeo: ["tituloseo", "tituloSeo"],
    descricaoSeo: ["descricaoseo", "descricaoSeo"],
    destaque: ["destaque"],
    status: ["status"],

    palavrasChave: [
      "palavraschave",
      "palavrasChave",
    ],

    conteudoMarkdown: [
      "conteudomarkdown",
      "conteudoMarkdown",
    ],
  };

  Object.entries(campos).forEach(
    ([nomeCampo, chavesPossiveis]) => {
      const campo =
        formulario.elements.namedItem(nomeCampo);

      if (!campo) {
        return;
      }

      const valor =
        encontrarPrimeiroValor(
          material,
          chavesPossiveis
        );

      if (
        valor !== undefined &&
        valor !== null
      ) {
        campo.value = valor;
      }
    }
  );

  if (campoSlug) {
    campoSlug.dataset.editadoManualmente =
      campoSlug.value ? "true" : "";
  }

}

function encontrarPrimeiroValor(
  objeto,
  chaves
) {
  for (const chave of chaves) {
    if (
      Object.prototype.hasOwnProperty.call(
        objeto,
        chave
      )
    ) {
      return objeto[chave];
    }
  }

  return undefined;
}

/* =========================================================
   SALVAR OU ATUALIZAR MATERIAL
========================================================= */

async function salvarMaterial(evento) {
  evento.preventDefault();

  const botaoAtivo =
    document.activeElement;

  if (botaoAtivo?.value) {
    acaoSelecionada = botaoAtivo.value;
  }

  const dadosFormulario =
    new FormData(formulario);

  const material =
    Object.fromEntries(
      dadosFormulario.entries()
    );

  material.action = modoEdicao
    ? "updateMaterial"
    : "createMaterial";

  if (modoEdicao) {
    material.slugOriginal =
      slugEdicao;

    material.id =
      material.id ||
      materialAtual?.id ||
      "";
  }

  if (acaoSelecionada === "publicar") {
    material.status = "Publicado";
  } else if (!material.status) {
    material.status = "Rascunho";
  }

  material.slug =
    material.slug ||
    gerarSlug(material.titulo);

  material.data =
    material.data ||
    dataAtual();

  material.ultimaRevisao =
    dataAtual();

  definirEstado(
    modoEdicao
      ? "Salvando alterações..."
      : "Preparando material...",
    false,
    true
  );

  try {
    await processarUploads(material);

    definirUploadStatus(
      modoEdicao
        ? "Atualizando material..."
        : "Salvando material..."
    );

    const resultado =
      await chamarApi(material);

    definirUploadStatus(
      "Operação concluída."
    );

    definirEstado(
      modoEdicao
        ? `Material atualizado com sucesso: ${
            resultado.id ||
            material.id ||
            material.slug
          }.`
        : `Material salvo com sucesso: ${
            resultado.id ||
            material.slug
          } — ${
            resultado.status ||
            material.status
          }.`,
      false,
      false
    );

    window.setTimeout(() => {
      window.location.href =
        "dashboard.html";
    }, 1500);
  } catch (erro) {
    console.error(
      "Erro ao salvar material:",
      erro
    );

    definirUploadStatus("");

    definirEstado(
      erro.message ||
        "Não foi possível salvar o material.",
      true,
      false
    );
  }
}

/* =========================================================
   UPLOADS
========================================================= */

async function processarUploads(material) {
  if (inputCapa?.files?.[0]) {
    definirUploadStatus(
      "Enviando imagem de capa..."
    );

    const resultadoCapa =
      await enviarArquivo(
        inputCapa.files[0],
        "capa",
        material.status
      );

    material.urlCapa =
      resultadoCapa.url;

    if (campoUrlCapa) {
      campoUrlCapa.value =
        resultadoCapa.url;
    }
  }

  if (inputPdf?.files?.[0]) {
    definirUploadStatus(
      "Enviando PDF principal..."
    );

    const resultadoPdf =
      await enviarArquivo(
        inputPdf.files[0],
        "pdf",
        material.status
      );

    material.urlArquivo =
      resultadoPdf.url;

    if (campoUrlArquivo) {
      campoUrlArquivo.value =
        resultadoPdf.url;
    }
  }

  if (inputAnexos?.files?.length) {
    const anexos = [];

    for (
      let indice = 0;
      indice < inputAnexos.files.length;
      indice += 1
    ) {
      const arquivo =
        inputAnexos.files[indice];

      definirUploadStatus(
        `Enviando anexo ${indice + 1} de ${
          inputAnexos.files.length
        }: ${arquivo.name}`
      );

      const resultadoAnexo =
        await enviarArquivo(
          arquivo,
          "anexo",
          material.status
        );

      anexos.push(resultadoAnexo);
    }

    material.anexos =
      JSON.stringify(anexos);
  } else if (
    modoEdicao &&
    materialAtual?.anexos !== undefined
  ) {
    material.anexos =
      materialAtual.anexos;
  }
}

async function enviarArquivo(
  arquivo,
  fileType,
  status
) {
  validarArquivo(
    arquivo,
    fileType
  );

  const base64 =
    await arquivoParaBase64(arquivo);

  return chamarApi({
    action: "uploadFile",
    fileName: arquivo.name,
    mimeType:
      arquivo.type ||
      "application/octet-stream",
    fileType,
    status,
    base64,
  });
}

function arquivoParaBase64(arquivo) {
  return new Promise(
    (resolve, reject) => {
      const leitor =
        new FileReader();

      leitor.onload = () => {
        const conteudo =
          String(leitor.result || "");

        const base64 =
          conteudo.includes(",")
            ? conteudo.split(",")[1]
            : conteudo;

        resolve(base64);
      };

      leitor.onerror = () => {
        reject(
          new Error(
            `Não foi possível ler ${arquivo.name}.`
          )
        );
      };

      leitor.readAsDataURL(arquivo);
    }
  );
}

function validarArquivo(
  arquivo,
  tipo
) {
  const limiteEmBytes =
    8 * 1024 * 1024;

  if (arquivo.size > limiteEmBytes) {
    throw new Error(
      `${arquivo.name} ultrapassa o limite temporário de 8 MB.`
    );
  }

  if (
    tipo === "capa" &&
    ![
      "image/jpeg",
      "image/png",
      "image/webp",
    ].includes(arquivo.type)
  ) {
    throw new Error(
      "A capa precisa estar em JPG, PNG ou WebP."
    );
  }

  if (
    tipo === "pdf" &&
    arquivo.type !==
      "application/pdf"
  ) {
    throw new Error(
      "O arquivo principal precisa ser um PDF."
    );
  }
}

/* =========================================================
   COMUNICAÇÃO COM A API
========================================================= */

async function chamarApi(payload) {
  return window.paAuth.api(payload);
}

/* =========================================================
   INTERFACE E UTILITÁRIOS
========================================================= */

function definirEstado(
  mensagem,
  erro = false,
  carregando = false
) {
  if (statusFormulario) {
    statusFormulario.textContent =
      mensagem;

    statusFormulario.classList.toggle(
      "is-error",
      erro
    );
  }

  formulario
    ?.querySelectorAll(
      "button, input, select, textarea"
    )
    .forEach((elemento) => {
      elemento.disabled =
        carregando;
    });
}

function definirUploadStatus(
  mensagem
) {
  if (statusUpload) {
    statusUpload.textContent =
      mensagem;
  }
}

function gerarSlug(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );
}

function dataAtual() {
  return new Date()
    .toISOString()
    .slice(0, 10);
}
