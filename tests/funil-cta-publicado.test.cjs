"use strict";

/**
 * Todo item publicado precisa ter por onde o visitante seguir.
 *
 * Caso real (corrigido em 24/09/2026): seis itens publicados na Biblioteca Viva
 * (PA-OBS-010 a 013, PA-CON-002 e PA-LIB-007) não tinham NENHUM botão na página do
 * material. A página abria com capa e ficha e terminava ali — porta fechada.
 *
 * A causa: a página monta os botões a partir de três colunas do Catálogo Mestre, e
 * só delas (`assets/js/material.js`):
 *
 *   urlArquivo                            -> botão principal de download
 *   urlFormulario                         -> botão "Solicitar ou receber material"
 *   tituloProximoPasso + urlProximoPasso  -> seção "PRÓXIMO PASSO"
 *   (o próximo passo também aceita o fallback de `proximoSlug`, via material.html?slug=)
 *
 * `urlPagina` NÃO é renderizada na página do material — foi o que criou a ilusão de
 * que o item estava ligado ao Diagnóstico quando não estava.
 *
 * A estratégia de comunicação do projeto: o material é solicitado pelo formulário, o
 * lead é captado e o material é enviado por e-mail; o Diagnóstico Organizacional é o
 * fim do funil. Logo, `urlArquivo` vazio é legítimo — o que não pode é a página ficar
 * sem nenhum caminho.
 *
 * Este teste lê a API pública (o CI tem rede). Se a API devolver outra coisa que não
 * JSON, tenta de novo antes de falhar.
 */

const assert = require("node:assert/strict");
const test = require("node:test");

const API =
  "https://script.google.com/macros/s/AKfycbykS5oFk8rz2AMxyrnDK7-HilYbk_j5nNgUw_cZu8M_-cX4gF1gTtS2n0W700BKL4Jqsw/exec";

const MINIMO_ITENS = 10;

async function buscarJson(url, tentativas = 5) {
  let ultimo = "";
  for (let i = 1; i <= tentativas; i++) {
    const resposta = await fetch(url);
    const texto = (await resposta.text()).trim();
    if (texto.startsWith("{")) return JSON.parse(texto);
    ultimo = `http ${resposta.status}, ${texto.length} bytes`;
    if (i < tentativas) await new Promise((r) => setTimeout(r, 3000 * i));
  }
  throw new Error(`a API da Biblioteca Viva não devolveu JSON (${ultimo})`);
}

const preenchido = (v) => v !== undefined && v !== null && String(v).trim() !== "";

// espelha o validarUrl() de material.js: aceita https, caminho da raiz, ./ ../ e #ancora
function urlAceita(valor) {
  const texto = String(valor).trim();
  if (/^#[A-Za-z][A-Za-z0-9_-]*$/.test(texto)) return true;
  if (texto.startsWith("/") || texto.startsWith("./") || texto.startsWith("../")) return true;
  try {
    return ["http:", "https:"].includes(new URL(texto).protocol);
  } catch {
    return false;
  }
}

// espelha material.js: quais botões a página realmente consegue montar
function caminhos(item) {
  const lista = [];
  if (preenchido(item.urlArquivo)) lista.push("baixar (urlArquivo)");
  if (preenchido(item.urlFormulario)) lista.push("solicitar (urlFormulario)");
  const temTitulo = preenchido(item.tituloProximoPasso);
  const temDestino = preenchido(item.urlProximoPasso) || preenchido(item.proximoSlug);
  if (temTitulo && temDestino) lista.push("próximo passo");
  return lista;
}

test("a regra pegou o caso real (item sem nenhum campo de CTA)", () => {
  // o caso que originou este teste: PA-OBS-010..013, PA-CON-002 e PA-LIB-007
  // estavam publicados com urlArquivo, urlFormulario e próximo passo todos vazios
  const vazio = { id: "PA-XXX-000", urlArquivo: "", urlFormulario: "", tituloProximoPasso: "", urlProximoPasso: "", proximoSlug: "" };
  assert.deepEqual(caminhos(vazio), [], "um item com todos os campos de CTA vazios precisa dar zero caminhos");

  // e os dois formatos que a página aceita
  assert.deepEqual(
    caminhos({ urlArquivo: "", urlFormulario: "https://docs.google.com/forms/d/e/X/viewform", tituloProximoPasso: "", urlProximoPasso: "", proximoSlug: "" }),
    ["solicitar (urlFormulario)"]
  );
  assert.deepEqual(
    caminhos({ urlArquivo: "", urlFormulario: "", tituloProximoPasso: "Diagnóstico", urlProximoPasso: "", proximoSlug: "checklist-diagnostico-digital" }),
    ["próximo passo"],
    "o próximo passo precisa funcionar pelo fallback de proximoSlug"
  );
});

test("todo item publicado tem ao menos um caminho para o visitante", async () => {
  const catalogo = await buscarJson(`${API}?module=biblioteca`);
  assert.ok(
    Array.isArray(catalogo.items),
    "a API não devolveu a lista de itens em `items` — contrato mudou?"
  );
  assert.ok(
    catalogo.items.length >= MINIMO_ITENS,
    `esperado ao menos ${MINIMO_ITENS} itens publicados, a API devolveu ${catalogo.items.length}`
  );

  const problemas = [];
  const resumo = [];

  // os detalhes em paralelo: em série o teste passava de 100 s por causa do vaivém com a API
  const detalhes = await Promise.all(
    catalogo.items.map((r) =>
      buscarJson(`${API}?module=biblioteca&slug=${encodeURIComponent(r.slug)}`)
    )
  );

  for (let indice = 0; indice < catalogo.items.length; indice++) {
    const detalhe = detalhes[indice];
    const item = detalhe.item || detalhe;
    const id = item.id || catalogo.items[indice].id;
    const lista = caminhos(item);

    if (lista.length === 0) {
      problemas.push(
        `${id}: publicado sem nenhum caminho — urlArquivo, urlFormulario e ` +
          `tituloProximoPasso+urlProximoPasso/proximoSlug estão todos vazios`
      );
    }

    // título de próximo passo sem destino: a seção não renderiza e o título fica órfão
    if (preenchido(item.tituloProximoPasso) && !preenchido(item.urlProximoPasso) && !preenchido(item.proximoSlug)) {
      problemas.push(`${id}: tem "tituloProximoPasso" mas nenhum destino (urlProximoPasso nem proximoSlug)`);
    }

    // CTA de próximo passo sem o par título+destino
    if (preenchido(item.ctaProximoPasso) && !preenchido(item.tituloProximoPasso)) {
      problemas.push(`${id}: tem "ctaProximoPasso" mas não tem "tituloProximoPasso" — o botão não é montado`);
    }

    for (const campo of ["urlArquivo", "urlFormulario", "urlProximoPasso", "urlPagina"]) {
      const valor = String(item[campo] || "").trim();
      if (!valor) continue;
      if (!urlAceita(valor)) {
        problemas.push(`${id}: "${campo}" não é endereço que a página aceita — ${valor.slice(0, 60)}`);
      } else if (/^http:\/\//.test(valor)) {
        problemas.push(`${id}: "${campo}" está em http:// (sem TLS) — ${valor.slice(0, 60)}`);
      }
    }

    resumo.push(`${id} (${lista.join(" + ") || "NENHUM"})`);
  }

  assert.deepEqual(
    problemas,
    [],
    `item publicado sem caminho para o visitante:\n  ${problemas.join("\n  ")}`
  );

  console.log(
    `funil-cta-publicado.test.cjs: ${catalogo.items.length} itens publicados, todos com caminho\n  ${resumo.join("\n  ")}`
  );
});
