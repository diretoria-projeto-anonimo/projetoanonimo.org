"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const html = read("identidade-de-marca.html");
const manifest = JSON.parse(read("assets/brand/brand-manifest.json"));
const css = read("assets/css/brand-tokens.css");
const canonicalColors = ["#111B18", "#0D4D44", "#D3EBD9", "#F2FAF4", "#E7F4EA", "#9BC8AB", "#C1DDC8"];
const originalHashes = {
  "projeto-anonimo-symbol.svg": "d896382913f3f52b2b032ef6e423043934d7c6940baf44d07930cf932ddd14e8",
  "projeto-anonimo-logo-horizontal-on-light.svg": "21ce1413c6ee4bb98b4498e7f8d90b5d5046ef5757b6f5c9dd3387d8f475963f",
  "projeto-anonimo-logo-horizontal-on-dark.svg": "b0b14701178040f3de57e521c25106d465ccb48ea30e38d572881f7e4eb36103",
  "projeto-anonimo-logo-vertical.svg": "3b600ca0cc9dea12da3b62646f3d98908a317d8f1fd4ea458c0bdb7802bc81d4",
  "projeto-anonimo-icon-dark.svg": "78b6ae7b37310b1162f6f7888fcc5f98fefecfa8429e81e0dd1d3b10e362d3fe",
  "projeto-anonimo-icon-light.svg": "34dedebff42303bb68b44f6165b84f76e435b7abe2160be466dc6b4123a3d4a7",
  "projeto-anonimo-monochrome-dark.svg": "6c740c8b8474996f042e67a0fcbafa75798ce5a491f65d6931d2d487d16f9dac",
  "projeto-anonimo-monochrome-light.svg": "f51337b3e9d68ed9811e9e41d85cd49469292c3c8fb8b69947d264602511cc97",
  "projeto-anonimo-favicon.svg": "cb84d13418513229c2e548b94e5e03e69c7f67e77876f81ceaf132e2e1d56fec"
};

test("paleta canônica coincide entre manifesto, página e CSS", () => {
  const colors = [...manifest.colors.essential, ...manifest.colors.support];
  assert.deepEqual(colors.map(c => c.hex), canonicalColors);
  for (const color of colors) {
    assert.deepEqual(color.rgb, [1, 3, 5].map(i => parseInt(color.hex.slice(i, i + 2), 16)));
    assert.ok(html.includes(color.hex) && css.includes(color.hex));
  }
  const pageColors = [...new Set((html.match(/#[0-9a-f]{6}\b/gi) || []).map(s => s.toUpperCase()))];
  assert.deepEqual(pageColors.sort(), [...canonicalColors].sort());
  assert.doesNotMatch(css, /font-family|body\s*\{/i, "tokens não devem alterar fonte ou estilo global");
});

test("manifesto preserva referência, assinatura e decisões não homologadas", () => {
  assert.equal(manifest.source.code, "PA-BRD-001");
  assert.equal(manifest.name, "Projeto Anônimo");
  assert.equal(manifest.tagline, "TECNOLOGIA · AUTONOMIA · IMPACTO SOCIAL");
  assert.ok(html.includes(manifest.tagline));
  assert.equal(manifest.typography.wordmark.format, "vector_paths");
  assert.equal(manifest.typography.editorial.status, "PENDENTE_DE_HOMOLOGACAO");
  assert.equal(manifest.rules.socialMargins.pixels, 96);
  assert.deepEqual(manifest.rules.socialMargins.appliesTo, [[1080, 1350], [1080, 1080]]);
  assert.equal(manifest.rules.storySafeAreaPixels, null);
  assert.equal(manifest.rules.automaticPublishingOfPiecesAllowed, false);
  assert.equal(manifest.automation.canvaImportTested, false);
  assert.equal(manifest.automation.machineReadableManifestIsNotGuaranteedCanvaInput, true);
});

test("nove vetores existentes mantêm seus hashes e wordmarks em curvas", () => {
  assert.equal(manifest.assets.length, 9);
  for (const asset of manifest.assets) {
    const bytes = fs.readFileSync(path.join(root, "assets/brand", asset.file));
    assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"), originalHashes[asset.file], asset.file);
    assert.match(bytes.toString("utf8"), /<svg\b/);
    assert.doesNotMatch(bytes.toString("utf8"), /<text\b|<image\b/);
  }
});

test("referências locais, âncoras e textos alternativos são válidos", () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(ids.length, new Set(ids).size);
  for (const [, reference] of html.matchAll(/(?<![-\w])(?:src|href)="([^"]+)"/g)) {
    if (reference.startsWith("#")) assert.ok(ids.includes(reference.slice(1)), reference);
    else if (!/^https?:/.test(reference)) assert.ok(fs.existsSync(path.join(root, reference)), reference);
  }
  for (const [image] of html.matchAll(/<img\b[^>]*>/g)) assert.match(image, /\balt="[^"]+"/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /<html lang="pt-BR">/);
  assert.match(html, /:focus-visible/);
  assert.match(html, /prefers-reduced-motion/);
  assert.match(html, /@media\(max-width:760px\)/);
});

test("Home, sitemap e URL canônica apontam para o mesmo guia", () => {
  assert.match(read("index.html"), /href="identidade-de-marca\.html">Identidade de marca<\/a>/);
  assert.equal((read("sitemap.xml").match(/https:\/\/projetoanonimo\.org\/identidade-de-marca\.html/g) || []).length, 1);
  assert.match(html, /rel="canonical" href="https:\/\/projetoanonimo\.org\/identidade-de-marca\.html"/);
  assert.match(html, /href="index\.html"/);
  assert.doesNotMatch(html, /noindex|nofollow/i);
  assert.doesNotMatch(read("robots.txt"), /Disallow:\s*\/(?:identidade-de-marca|assets\/brand)/i);
});

test("página mantém GTM único com consentimento padrão negado", () => {
  assert.equal((html.match(/GTM-KTMXHMZL/g) || []).length, 2);
  assert.equal((html.match(/googletagmanager\.com\/gtm\.js/g) || []).length, 1);
  assert.equal((html.match(/googletagmanager\.com\/ns\.html/g) || []).length, 1);
  const consent = html.indexOf("gtag('consent', 'default'");
  assert.ok(consent >= 0 && consent < html.indexOf("googletagmanager.com/gtm.js"));
  for (const key of ["analytics_storage", "ad_storage", "ad_user_data", "ad_personalization"]) {
    assert.match(html, new RegExp(`'${key}'\\s*:\\s*'denied'`));
  }
  assert.doesNotMatch(html, /<form\b|apps-script|script\.google\.com/i);
});

test("página pública não expõe relatórios locais ou links de documentos internos", () => {
  assert.doesNotMatch(html, /docs\.google\.com|C:\\Users|Preparação local|Relatório de Exportação|kAHWfbz/i);
  assert.doesNotMatch(JSON.stringify(manifest), /docs\.google\.com|C:\\Users|PREPARADO_LOCALMENTE/i);
});

test("combinações textuais recomendadas atendem ao alvo documentado de 7:1", () => {
  const luminance = hex => {
    const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map(c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return .2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2];
  };
  for (const [a, b] of [["#111B18", "#F2FAF4"], ["#111B18", "#D3EBD9"], ["#0D4D44", "#F2FAF4"], ["#0D4D44", "#D3EBD9"], ["#0D4D44", "#E7F4EA"]]) {
    const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    assert.ok((high + .05) / (low + .05) >= 7, `${a} / ${b}`);
  }
});
