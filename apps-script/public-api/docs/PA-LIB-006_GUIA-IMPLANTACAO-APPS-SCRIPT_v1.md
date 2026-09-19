# PA-LIB-006 — GUIA DE IMPLANTAÇÃO NO APPS SCRIPT (passo a passo)

**Objetivo:** publicar o contrato v1.0.0 da API pública da Biblioteca Viva **mantendo a mesma URL `/exec`** que o site já usa.
**Tempo estimado:** 20–25 minutos · **Risco:** baixo (aditivo e reversível) · **Janela sugerida:** horário de baixo tráfego
**Arquivo a aplicar:** `apps-script/public-api/Code.gs` (arquivo gerado — 714 linhas)

> ✅ **Atualização de 19/09/2026:** a implantação **já foi feita**. O endpoint que o site usa hoje é
> `AKfycbykS5oF…/exec` (contrato v1.0.0, verificado item a item). O ID citado na §0 abaixo
> (`AKfycbzhh37…`) é de uma geração anterior e **não** é o endereço atual do site — use-o apenas
> como referência histórica ao localizar o projeto no `script.google.com`.

---

## 0. Identificar o projeto certo (não erre aqui)

O site consulta esta URL (em `assets/js/main.js` e `assets/js/material.js`):

```
https://script.google.com/macros/s/AKfycbzhh37NeK7hAaglGCilFvCME6pxgC7V_EdR5ct3wkmJEpywh50mq3i-xgnP1lQlqQ9PTA/exec
                                    └────────────── ID DA IMPLANTAÇÃO ──────────────┘
```

**Como confirmar:** abra o projeto em [script.google.com](https://script.google.com) → **Implantar → Gerenciar implantações** → deve existir uma implantação com **exatamente esse ID** (`AKfycbzhh37NeK7hAaglGCilFvCME6pxgC7V_EdR5ct3wkmJEpywh50mq3i-xgnP1lQlqQ9PTA`).

> ⚠️ **Não é o projeto do editor/CMS.** Aquele tem `doPost`, `GOOGLE_CLIENT_ID`, pastas de upload e outro `/exec` (definido em `editor/assets/js/config.js`). Mexer nele quebra o painel editorial.
> Referência do que existe hoje: Google Doc **`PA-LIB-004 — Apps Script da API Biblioteca Viva`** (pasta `04_BIBLIOTECA_VIVA`).

**Conta:** entre com a conta **proprietária** do projeto (a mesma da opção "Executar como" da implantação).

---

## 1. Backup (obrigatório · 2 min)

1. No editor: **Arquivo → Fazer uma cópia** → nome `API Biblioteca Viva — BACKUP 2026-09-10`.
2. Alternativa/conjunta: copie o conteúdo atual do(s) arquivo(s) `.gs` para um arquivo local chamado
   `PA-LIB-004_Code-ANTES-da-v1.0.0_2026-09-10.gs`.
3. Anote o **número da versão em uso**: **Implantar → Gerenciar implantações** → coluna "Versão". É o alvo do rollback (§7).

---

## 2. Conferir as propriedades do script (3 min)

**Configurações do projeto (ícone ⚙) → Propriedades do script:**

| Propriedade | Valor esperado | Observação |
| --- | --- | --- |
| `SPREADSHEET_ID` | `1kamRM5lR5hES3dZukEqqVsDMHCVirXV5uSuOuB2R8_Q` (Catálogo Mestre da Biblioteca Viva) | Se o projeto for vinculado à planilha e você preferir "planilha ativa", pode ficar vazio — o recomendado é explícito |
| `SHEET_NAME` | nome exato da aba do catálogo (padrão `Biblioteca`) | Confira o nome real da aba no Catálogo Mestre |

- **Não apague** outras propriedades existentes (`GOOGLE_CLIENT_ID`, pastas etc.) caso estejam no mesmo projeto.
- A conta que executa precisa ter **acesso de edição** na planilha (o Web App roda como "eu").

---

## 3. Aplicar o código (5 min)

1. Abra o arquivo que hoje contém a API (normalmente `Code.gs`).
2. **Ctrl+A** → apague → cole **todo** o conteúdo de `PA-LIB-006_Code-API-Biblioteca-Viva_v1.gs`.
3. **Ctrl+S** para salvar.

> ⚠️ **Regra de ouro: exatamente um `doGet` no projeto.** Se preferir criar um arquivo novo (ex.: `Contrato.gs`), **delete o arquivo antigo** antes de implantar — dois `doGet` quebram a implantação.

- O arquivo é **autossuficiente** (não depende de funções antigas do projeto).
- Nomes das funções antigas (`json_`, `sheet_`, `canonicalKey_`) **não colidem** com os novos (`bvJsonOut_`, `bvCatalogSheet_`, `canonicalKey`) — podem coexistir.
- Não renomeie `doGet` nem `testarCatalogoBiblioteca`.
- **Não** versione segredos no código: o token/ID ficam em Propriedades do script / secret manager.

---

## 4. Autorizar e validar no próprio editor (3 min)

1. No seletor de funções (barra superior), escolha **`testarCatalogoBiblioteca`** → **Executar**.
2. Na primeira execução aparece o pedido de permissão:
   **Revisar permissões → escolha a conta → Avançado → "Acessar … (não seguro)" → Permitir**
   (é o aviso padrão de projeto interno do Workspace; nenhum dado sai do domínio).
3. Leia o **Registro de execução**. Resultado esperado:

```json
{
  "ok": true,
  "schemaVersion": "1.0.0",
  "spreadsheetId": "1kamRM5lR5hES3dZukEqqVsDMHCVirXV5uSuOuB2R8_Q",
  "sheetName": "Biblioteca",
  "linhas": 4,
  "totalLinhasCatalogo": 4,
  "publicados": 4,
  "count": 4,
  "primeiros": ["PA-LIB-001 · ia-para-organizacoes-sociais", "PA-LIB-002 · google-workspace-para-oscs", "…"],
  "slugsDuplicados": [],
  "detalheOk": true,
  "detalheTemMarkdown": true,
  "proximoPasso": "Tudo certo: implante uma NOVA VERSÃO na implantação existente (mesma URL /exec)."
}
```

Se vier `ok:false`, resolva antes de implantar (§8).

---

## 5. Implantar a nova versão — mantendo a MESMA URL (2 min)

1. **Implantar → Gerenciar implantações**.
2. Na implantação cujo ID é `AKfycbzhh37NeK7hAaglGCilFvCME6pxgC7V_EdR5ct3wkmJEpywh50mq3i-xgnP1lQlqQ9PTA`, clique no **lápis (Editar)**.
3. **Versão:** `Nova versão`
   **Descrição:** `PA-LIB-006 v1.0.0 — contrato único (count, filtros, detalhe completo)`
4. **Executar como:** `eu (sua conta)`
   **Quem tem acesso:** `Qualquer pessoa` ← sem isso o site não consegue ler (ele consulta sem login).
5. **Implantar**.

> ⚠️ **Não use "Nova implantação"** — isso gera **outra URL** e exigiria alterar o site. Editar a implantação existente preserva a URL.

---

## 6. Verificar o resultado (5 min)

**a) No navegador** (substitua `…` pela URL `/exec`):

| # | URL | Esperado |
| --- | --- | --- |
| 1 | `…?module=biblioteca` | `"schemaVersion":"1.0.0"`, `"count":4`, `"totalPublished":4`, itens **sem** `conteudoMarkdown` |
| 2 | `…?module=biblioteca&slug=ia-para-organizacoes-sociais` | `"item"` com `conteudoMarkdown` |
| 3 | `…?module=biblioteca&destaque=true` | `count:3` |
| 4 | `…?module=biblioteca&busca=Google` | 1 item (PA-LIB-002) |
| 5 | `…?module=biblioteca&categoria=Inteligencia%20Artificial` | 1 item (PA-LIB-001) |
| 6 | `…?module=biblioteca&busca=Organiza%C3%A7%C3%A3o` | 3 itens (acentos) |
| 7 | `…?module=biblioteca&slug=nao-existe` | `ok:false`, `"code":"NOT_FOUND"` |
| 8 | `…?module=naoexiste` | `ok:false`, `"code":"MODULE_NOT_FOUND"` |
| 9 | qualquer resposta | **não** conter `ouid` |

**b) Pelo script (recomendado, automatiza os 9 casos):**
```powershell
cd C:\Users\Martins-note\Documents\PA\sandbox\PA-LIB-AUDIT
powershell -ExecutionPolicy Bypass -File sondar_endpoint.ps1
# abra evidence\_resumo.txt: count/totalPublished presentes e filtros eficazes
```

**c) No site:** abrir `biblioteca.html` (lista com 4 materiais) e `biblioteca/material.html?slug=ia-para-organizacoes-sociais` (conteúdo completo).
Se parecer antigo: **janela anônima** (o site guarda cache local de 24 h em `localStorage`, chave `PA_BIBLIOTECA_CACHE_V1`).

---

## 7. Rollback (1 min)

1. **Implantar → Gerenciar implantações → Editar → Versão: (a anterior) → Implantar.** A URL não muda e o efeito é imediato.
2. Se o código também precisar voltar: cole o backup da §1 e implante uma nova versão.
3. O frontend novo é compatível com a API antiga — **não** é necessário reverter o site.

---

## 8. Problemas comuns

| Sintoma | Causa provável | Ação |
| --- | --- | --- |
| `CONFIG_ERROR` / "Planilha não configurada" | `SPREADSHEET_ID` ausente e projeto não vinculado | preencher a propriedade (§2) |
| "Aba não encontrada: X" | `SHEET_NAME` diferente do nome real | corrigir a propriedade |
| `publicados: 0` | coluna `Status` sem o valor `Publicado` | conferir a coluna Status no catálogo |
| Implantação falha / erro de função duplicada | dois `doGet` no projeto | manter apenas um (§3) |
| Site: "Biblioteca temporariamente indisponível" | Web App sem acesso "Qualquer pessoa" | revisar a configuração da implantação |
| Lista continua antiga no site | cache local de 24 h | janela anônima |
| Página de material sem texto | API antiga + frontend sem patch | publicar o patch do frontend (§9) |
| Resposta com `count` mas site sem contador | frontend sem patch | idem (§9) |

---

## 9. Frontend (opcional, recomendado)

Ordem **livre** (o frontend novo aceita o formato antigo e vice-versa):

1. Publicar `PA-LIB-006_frontend-patch_biblioteca-contract.js` como `assets/js/biblioteca-contract.js`.
2. Aplicar `PA-LIB-006_frontend-patch_main.js` e `…_material.js` (as alterações estão comentadas no arquivo; os arquivos entregues são cópias completas de referência).
3. No HTML, antes de `main.js`:
   `<script src="assets/js/biblioteca-contract.js?v=1.0.0"></script>`
4. Ganhos: contador "N materiais encontrados • 4 disponíveis" (usa `totalPublished`), **1 requisição** por página de material (antes eram 2), validação explícita (slug duplicado, campos obrigatórios, PII).
5. Rollback do frontend: remover o `<script>` novo e restaurar `main.js`/`material.js` anteriores.

---

## 10. Depois de implantar (governança)

- [ ] Versionar o `.gs` aplicado no repositório, em `apps-script/` (hoje a fonte só existe no Google Doc `PA-LIB-004`).
- [ ] Registrar versão + data no índice de entregas e atualizar a doc `PA-LIB-004`.
- [ ] Confirmar que materiais com status diferente de `Publicado` **não** aparecem na resposta pública.
- [ ] Arquivar as evidências (§11) na pasta do projeto.
- [ ] Revisar a permissão "Qualquer pessoa" e as propriedades do script (revisão periódica).

---

## 11. Evidências a arquivar

1. `testarCatalogoBiblioteca` com `ok:true` (JSON do Registro de execução).
2. `evidence/_resumo.txt` gerado por `sondar_endpoint.ps1` (12 casos).
3. Uma captura da página `biblioteca.html` e de uma página de material.
4. Número da versão implantada, data/hora e responsável.
