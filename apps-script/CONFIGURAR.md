# Configuração do backend editorial

Esta pasta substitui o backend editorial anterior. A API pública da Biblioteca
Viva pode continuar no endereço atual.

## 1. Preparar o Google Cloud

1. No projeto Google Cloud associado ao Apps Script, configure a tela de
   consentimento OAuth.
2. Crie uma credencial **ID do cliente OAuth 2.0** do tipo **Aplicativo da Web**.
3. Em Origens JavaScript autorizadas, inclua:
   - `http://127.0.0.1:8765` durante a homologação local;
   - `https://projetoanonimo.org` para produção.
4. Copie o Client ID.

## 2. Configurar o Apps Script

Copie `Code.gs` e `appsscript.json` para o projeto Apps Script editorial.
Em **Configurações do projeto > Propriedades do script**, crie:

| Propriedade | Valor |
|---|---|
| `GOOGLE_CLIENT_ID` | Client ID criado no passo anterior |
| `ALLOWED_EDITOR_EMAILS` | E-mails autorizados, separados por vírgula |
| `SPREADSHEET_ID` | ID da planilha da Biblioteca Viva |
| `SHEET_NAME` | Nome da aba; padrão sugerido: `Biblioteca` |
| `METRICS_SHEET_NAME` | Opcional; nome da aba de métricas. Padrão: `Metricas` |
| `BIBLIOTECA_PASTA_CAPAS` | ID da pasta do Drive para capas |
| `BIBLIOTECA_PASTA_ANEXOS` | ID da pasta do Drive para anexos |
| `BIBLIOTECA_PASTA_PUBLICADOS` | ID da pasta do Drive para PDFs publicados |
| `BIBLIOTECA_PASTA_REVISAO` | ID da pasta do Drive para PDFs em revisão |

Implante como **Aplicativo da Web**, executando como o proprietário. O acesso
externo pode ser “Qualquer pessoa”, pois todas as ações editoriais exigem e
validam uma credencial Google e uma lista de e-mails.

A ação pública `recordMetric` aceita somente eventos predefinidos de materiais
publicados. Ela não recebe nem persiste nome, e-mail ou identificador de sessão.
A aba de métricas é criada automaticamente no primeiro evento válido.

## 3. Conectar a interface

Em `editor/assets/js/config.js`:

1. substitua `googleClientId` pelo mesmo `GOOGLE_CLIENT_ID`;
2. ajuste `apiUrl` para a URL `/exec` da nova implantação.

No Windows, você também pode clicar duas vezes em `CONFIGURAR-EDITOR.cmd` e
colar os dois valores. O assistente valida o formato antes de alterar o arquivo.

Uma nova versão da implantação deve ser criada sempre que `Code.gs` mudar.

Antes de implantar, execute `diagnosticarConfiguracao` no editor do Apps Script.
O registro da execução deve mostrar `"ok": true`.

## 4. Homologação mínima

1. Entre com um e-mail permitido.
2. Confira se o painel inclui publicados, rascunhos e conteúdos em revisão.
3. Abra um rascunho, altere o resumo e salve.
4. Reabra o registro e confirme a persistência.
5. Publique e confira o material na Biblioteca Viva.
6. Saia e confirme que o painel redireciona ao login.
7. Abra um material publicado e confirme que a visualização aparece no painel.
