# API pública da Biblioteca Viva — PA-LIB-006

Fonte canônica do **projeto Apps Script da API pública** consumida pelo site
(`biblioteca.html` e `biblioteca/material.html`). Este diretório existe porque a
fonte do script público não estava versionada no repositório — pendência já
registrada no documento `docs/PA-LIB-006_COMO-APLICAR_v1.md`.

## Os três Apps Scripts do ecossistema

| Papel | Onde está a fonte | Endpoint |
|---|---|---|
| **API pública** (este diretório) | `public-api/Code.gs` (gerado de `src/`) | `AKfycbykS5oF…/exec` — institucional, **no ar com o contrato v1.0.0** |
| **Backend editorial** (painel `editor/`) | `apps-script/Code.gs` (editado à mão) | `AKfycby_YNT0…/exec` — configuração em `apps-script/CONFIGURAR.md` |
| API pública anterior (obsoleta) | não versionada | `AKfycbyvDGxt…/exec` — **HTTP 404**, desativada |

Os dois primeiros são projetos **distintos**: a API pública não expõe ações
editoriais (`doPost`, `saveMaterial_`, `recordEditor_`, métricas). Não substitua
um pelo outro.

## Estrutura

```
public-api/
├── Code.gs                     # GERADO — não editar à mão
├── build-api-gs.cjs            # gera o Code.gs a partir de src/
├── src/
│   ├── biblioteca-contract.js  # implementação de referência do contrato (PA-LIB-006)
│   └── wrapper.gs              # doGet, roteamento por ?module=biblioteca e erros
└── docs/
    ├── PA-LIB-006_COMO-APLICAR_v1.md
    └── PA-LIB-006_GUIA-IMPLANTACAO-APPS-SCRIPT_v1.md
```

## Fluxo de alteração

1. Edite `src/biblioteca-contract.js` ou `src/wrapper.gs`.
2. Gere o arquivo:
   ```powershell
   node apps-script/public-api/build-api-gs.cjs
   ```
3. Rode `node tests/biblioteca-contrato-sync.test.cjs` (garante que a versão do
   contrato do backend e a do frontend continuam iguais).
4. Publique no Apps Script (manual, sob aprovação):
   - `clasp push` no projeto da API pública, ou colar o `Code.gs` no editor;
   - **Implantar → Gerenciar implantações → Editar → Nova versão**, mantendo a
     **mesma URL `/exec`**.
5. Verifique com o checklist de `docs/PA-LIB-006_COMO-APLICAR_v1.md` (§3).

## Contrato (resumo)

Envelope: `{ ok, schemaVersion: "1.0.0", count, totalPublished, items[] }` — detalhe
em `{ item: { …, conteudoMarkdown } }`. Erros trazem `code` estável
(`NOT_FOUND`, `MODULE_NOT_FOUND`, `CONFIG_ERROR`). Apenas itens `Publicado` são
expostos; URLs de formulário são higienizadas (sem `ouid`); nenhum dado pessoal
é devolvido.

## Rollback

Restaure a versão anterior do `Code.gs` e publique uma **nova versão** da mesma
implantação. O frontend aceita tanto o contrato quanto o formato legado, então não
é necessário reverter o site.

> **Nota (19/09/2026) — implantação legada `AKfycbzhh37…`:** ela ainda responde HTTP 200
> com o formato antigo, mas **não pertence à conta institucional**. Foram consultadas as
> implantações dos 12 projetos Apps Script visíveis à conta
> (`script.googleapis.com/v1/projects/{scriptId}/deployments`) e ela não está em nenhum:
> é a API "v5", hospedada por uma **conta externa** — o mesmo motivo que levou à
> substituição pelo endpoint institucional. Portanto **não é possível desativá-la daqui**;
> a mitigação aplicada é garantir que nada institucional aponte para ela (nenhum arquivo do
> site, do backend editorial ou das automações a referencia hoje). Para encerrá-la seria
> preciso solicitar ao responsável por aquela conta.

> **Nota (19/09/2026) — implantações ativas deste projeto:** `AKfycbykS5oF…` (versionada,
> "PA-LIB-006 v1.0.0 - contrato único", usada pelo site) e `AKfycbzfqkx…` (`@HEAD`, de
> teste). Ambas pertencem ao projeto `PA-LIB-006_Code-API-Biblioteca-Viva_v1`.