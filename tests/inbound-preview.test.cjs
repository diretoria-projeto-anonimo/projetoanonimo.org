"use strict";

/**
 * Preview local do funil inbound.
 *
 * Sobe um servidor estático em 127.0.0.1 (porta efêmera) sobre o próprio
 * checkout e comprova, por HTTP real:
 *  1. cada página pública responde 200 com HTML válido em pt-BR;
 *  2. o GTM aparece uma única vez no HTML efetivamente servido;
 *  3. todo script, folha de estilo e destino de CTA local responde 200;
 *  4. a rota canônica do Diagnóstico é alcançável a partir de Blog, Podcast
 *     e Biblioteca.
 *
 * Este teste não substitui verificação em navegador: ele não avalia layout,
 * foco visível, navegação por teclado nem o comportamento do GTM em runtime.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const root = path.join(__dirname, "..");
const GTM_ID = "GTM-KTMXHMZL";
const DIAGNOSTIC_ROUTE = "diagnostico-organizacional.html";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".xml": "application/xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".m4a": "audio/mp4",
  ".mp4": "video/mp4",
};

function listPages() {
  const found = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === ".git" || entry.name === "node_modules") continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // `editor/` exige autenticação e não integra o funil inbound.
        if (entry.name === "editor") continue;
        walk(full);
      } else if (entry.name.endsWith(".html")) {
        found.push(path.relative(root, full).split(path.sep).join("/"));
      }
    }
  };
  walk(root);
  return found.filter((page) => !page.startsWith("tests/")).sort();
}

function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((request, response) => {
      const requested = decodeURIComponent((request.url || "/").split("?")[0]);
      const relative = requested === "/" ? "index.html" : requested.replace(/^\/+/, "");
      const target = path.resolve(root, relative);

      if (!target.startsWith(path.resolve(root))) {
        response.writeHead(403).end("forbidden");
        return;
      }

      fs.readFile(target, (error, data) => {
        if (error) {
          response.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end("not found");
          return;
        }
        response.writeHead(200, { "content-type": MIME[path.extname(target).toLowerCase()] || "application/octet-stream" });
        response.end(data);
      });
    });
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

function localReferences(html) {
  const refs = new Set();
  // O lookbehind evita casar atributos derivados como `data-config-href`.
  for (const match of html.matchAll(/(?<![-\w])(?:src|href)="([^"]+)"/g)) {
    const value = match[1];
    if (/^(https?:|mailto:|tel:|data:|#|javascript:)/i.test(value)) continue;
    const clean = value.split("#")[0].split("?")[0];
    if (clean) refs.add(clean);
  }
  return [...refs];
}

function toServerPath(pageFile, reference) {
  let resolved;
  if (reference.startsWith("/")) {
    resolved = reference.replace(/^\/+/, "");
  } else {
    const dir = path.posix.dirname(pageFile);
    resolved = path.posix.join(dir === "." ? "" : dir, reference);
  }
  resolved = path.posix.normalize(resolved);
  if (resolved === "." || resolved === "" || resolved.endsWith("/")) {
    return `${resolved === "." ? "" : resolved}index.html`;
  }
  return resolved;
}

(async () => {
  const server = await startServer();
  const { port } = server.address();
  const origin = `http://127.0.0.1:${port}`;

  const pages = listPages();
  assert.ok(pages.length >= 20, `o checkout deve expor as páginas públicas (encontradas: ${pages.length})`);

  const checkedResources = new Set();

  try {
    for (const page of pages) {
      const response = await fetch(`${origin}/${page}`);
      assert.equal(response.status, 200, `${page}: deve responder 200 no preview local`);
      assert.match(response.headers.get("content-type") || "", /text\/html/, `${page}: deve ser servido como HTML`);

      const html = await response.text();
      assert.ok(html.length > 400, `${page}: o HTML servido não pode estar vazio`);
      assert.match(html, /<html[^>]*lang="pt-BR"/i, `${page}: o idioma declarado deve ser pt-BR`);

      const loaderCount = (html.match(/googletagmanager\.com\/gtm\.js/g) || []).length;
      assert.equal(loaderCount, 1, `${page}: o GTM servido deve ser carregado exatamente uma vez`);
      assert.equal((html.match(new RegExp(GTM_ID, "g")) || []).length, 2, `${page}: o GTM servido deve manter script + noscript`);

      // Todo recurso local referenciado precisa resolver sem rota quebrada.
      for (const reference of localReferences(html)) {
        const serverPath = toServerPath(page, reference);
        if (checkedResources.has(serverPath)) continue;
        checkedResources.add(serverPath);

        const asset = await fetch(`${origin}/${serverPath}`);
        assert.equal(asset.status, 200, `${page}: recurso referenciado não encontrado -> ${serverPath}`);
      }
    }

    // O CTA do funil precisa chegar à rota canônica a partir das três páginas de conteúdo.
    for (const page of ["blog.html", "podcast.html", "biblioteca.html"]) {
      const html = await (await fetch(`${origin}/${page}`)).text();
      assert.ok(html.includes(DIAGNOSTIC_ROUTE), `${page}: deve existir CTA para ${DIAGNOSTIC_ROUTE}`);
      assert.ok(!/href="[^"]*\/diagnostico"/.test(html), `${page}: a rota curta /diagnostico não pode ser usada`);
    }

    const podcast = await (await fetch(`${origin}/podcast.html`)).text();
    assert.match(
      podcast,
      /data-cta-position="podcast_hub_bottom"[^>]*href="diagnostico-organizacional\.html\?pa_cta_position=podcast_hub_bottom"/,
      "o CTA inferior do Podcast deve aplicar a opção C sem UTM artificial",
    );

    // Os cinco módulos do funil precisam ser servidos com conteúdo não vazio.
    for (const module of [
      "assets/js/diagnostico/config.js",
      "assets/js/diagnostico/consent.js",
      "assets/js/diagnostico/attribution.js",
      "assets/js/diagnostico/tracking.js",
      "assets/js/diagnostico/inbound.js",
      "assets/js/diagnostico/form.js",
      "assets/css/diagnostico-organizacional.css",
    ]) {
      const response = await fetch(`${origin}/${module}`);
      assert.equal(response.status, 200, `${module}: deve ser servido com status válido`);
      const body = await response.text();
      assert.ok(body.length > 100, `${module}: o conteúdo servido não pode estar vazio`);
    }

    const diagnostic = await (await fetch(`${origin}/${DIAGNOSTIC_ROUTE}`)).text();
    assert.match(diagnostic, /id="diag-form"/, "a rota canônica deve conter o formulário do Diagnóstico");
    assert.match(diagnostic, /id="consent-banner"/, "a rota canônica deve conter o banner de consentimento");
    assert.match(diagnostic, /data-step="7"/, "a rota canônica deve manter as sete etapas");

    console.log(`inbound-preview.test.cjs: ${pages.length} páginas e ${checkedResources.size} recursos verificados localmente`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
