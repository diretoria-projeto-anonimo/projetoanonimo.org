# PA-LIB-006 — COMO APLICAR O CONTRATO DA API DA BIBLIOTECA VIVA

**Versão:** 1 · **Data:** 10/09/2026 · **Status:** **APLICADO — contrato v1.0.0 no ar** · **Risco:** baixo (aditivo, com rollback)
**Pré-requisito:** acesso de edição ao projeto Apps Script da API pública (documentado em `PA-LIB-004 — Apps Script da API Biblioteca Viva`).

> ✅ **Atualização de 19/09/2026:** o contrato v1.0.0 **está implantado** no endpoint institucional
> (`AKfycbykS5oF…/exec`) e passa todos os itens do checklist da §3. A fonte do script agora está
> versionada em `apps-script/public-api/` — o `Code.gs` versionado reproduz, linha a linha
> (ignorando o cabeçalho), o que está em produção. As seções abaixo permanecem como registro do
> procedimento, do checklist de verificação e do plano de rollback.

---

## 1. O que muda

| Antes (produção) | Depois (contrato v1.0.0) |
| --- | --- |
| Lista com as 43 colunas cruas da planilha | Item normalizado (`titulo`, `slug`, `categoria`, `tempoLeitura`, `urlCapa`…) |
| Sem `count` / `totalPublished` | `count` + `totalPublished` no envelope |
| Filtros `categoria`/`formato`/`destaque`/`busca`/`status` ignorados | Todos funcionais |
| Detalhe sem `conteudoMarkdown` | Detalhe completo (markdown, sumário, anexos, próximo passo) |
| Erros só com texto, HTTP 200 | Erros com `code` estável (`NOT_FOUND`, `MODULE_NOT_FOUND`…) |
| Rascunhos podem ser expostos | Apenas `Publicado` é exposto |
| `URL do formulário` com `ouid` (ID da conta Google) | URLs higienizadas |
| Duas requisições por página de material | Uma requisição |

Compatibilidade: **o site atual continua funcionando sem alteração** — o frontend faz casamento de chave normalizada e aceita os dois formatos. Por isso a ordem de implantação é livre.

---

## 2. Procedimento (passo a passo)

### Etapa A — Aplicar a API (10 min)
1. Abra o projeto Apps Script da API pública da Biblioteca Viva.
2. **Backup:** copie o conteúdo atual (`Code.gs`) para um arquivo local, nomeando `PA-LIB-004_Code-ANTES-da-v1.0.0_2026-09-10.gs`.
3. Substitua o conteúdo de `Code.gs` pelo arquivo `PA-LIB-006_Code-API-Biblioteca-Viva_v1.gs` (este pacote).
4. Confirme que as Script Properties continuam existindo: `SPREADSHEET_ID` (opcional), `SHEET_NAME` (padrão `Biblioteca`).
5. **Implantar → Gerenciar implantações → Editar → Versão: Nova versão** (não crie uma implantação nova: mantenha a mesma URL `/exec`).
6. Rode a verificação da §3.

### Etapa B — Frontend (opcional, recomendado, 5 min)
Ordem segura: **frontend primeiro** (aceita os dois formatos) ou depois da API — funciona nos dois sentidos.
1. Publique `biblioteca-contract.js` em `assets/js/` (do pacote `PA-LIB-006_frontend-patch/`).
2. Aplique as alterações de `main.js` e `material.js` (mesma pasta do pacote) e adicione no HTML:
   `<script src="assets/js/biblioteca-contract.js?v=1.0.0"></script>` **antes** de `main.js`.
3. Resultado: contador “N materiais encontrados • 4 disponíveis” usando `totalPublished`, e 1 requisição por material.

### Etapa C — Rollback (se necessário)
1. Restaure o backup da Etapa A no `Code.gs` e implante uma nova versão.
2. O frontend novo continua compatível com a API antiga — **não é preciso reverter o site**.

---

## 3. Checklist de verificação após implantar

Substitua `<EXEC>` pela URL `/exec` do projeto:

| # | Requisição | Esperado |
| --- | --- | --- |
| 1 | `<EXEC>?module=biblioteca` | `schemaVersion":"1.0.0"`, `count:4`, `totalPublished:4`, itens **sem** markdown |
| 2 | `<EXEC>?module=biblioteca&slug=ia-para-organizacoes-sociais` | `item` com `conteudoMarkdown` e `totalPublished:4` |
| 3 | `<EXEC>?module=biblioteca&slug=nao-existe` | `ok:false`, `code:"NOT_FOUND"` |
| 4 | `<EXEC>?module=naoexiste` | `ok:false`, `code:"MODULE_NOT_FOUND"` |
| 5 | `<EXEC>?module=biblioteca&destaque=true` | `count:3` (PA-LIB-001, 002, 003) |
| 6 | `<EXEC>?module=biblioteca&busca=Google` | 1 item (PA-LIB-002) |
| 7 | `<EXEC>?module=biblioteca&categoria=Inteligencia%20Artificial` | 1 item (PA-LIB-001) |
| 8 | `<EXEC>?module=biblioteca&busca=Organiza%C3%A7%C3%A3o` | 3 itens (acentos) |
| 9 | Nenhuma resposta contém `ouid` | higienização ativa |

Verificação automatizada (roda contra o endpoint publicado, somente leitura):
```powershell
# a partir de sandbox/PA-LIB-AUDIT
powershell -ExecutionPolicy Bypass -File sondar_endpoint.ps1   # regrava evidence/ e o resumo
```
Os 12 casos em `evidence/_resumo.txt` devem passar a mostrar `count`/`totalPublished` e filtros eficazes.

---

## 4. Pendências conhecidas

| # | Pendência | Observação |
| --- | --- | --- |
| 1 | A fonte do script público **não está no repositório** (só no Google Doc `PA-LIB-004`) | depois de aplicar, versionar o `.gs` no repositório para auditoria |
| 2 | Colisão de códigos: `PA-LIB-004` é o **doc do Apps Script** no Drive, mas `PA-LIB-004` também é o **material “Plano de 30 Dias”** no catálogo | decidir um padrão (sugestão: `PA-LIB-DOC-00X` para documentação técnica) |
| 3 | Rascunhos na planilha | com o contrato aplicado eles deixam de ser expostos automaticamente |
