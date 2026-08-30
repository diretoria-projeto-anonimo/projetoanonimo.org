# BV-3.1-003 — registro de implementação local controlada

**Data:** 30/08/2026
**Estado:** IMPLEMENTADO E HOMOLOGADO LOCALMENTE — NÃO PUBLICADO
**Branch:** `feature/bv31-pilot-03-ia-oscs`
**Material:** IA para Organizações Sociais

## Escopo implementado

- conteúdo editorial v3.1 orientado a um primeiro experimento de baixo risco;
- promessa, SEO, público, jornada e metadados preparados para o catálogo;
- CTA primário `Começar pelo uso responsável` apontando para `#como-usar`;
- remoção do formulário como pedágio na configuração proposta;
- limites explícitos sobre PII, informações confidenciais, revisão e decisão humana;
- próximo passo para `Google Workspace para OSCs` na mesma aba;
- fallback editorial para território, jornada, CTA, capa e progressão;
- cache do renderer atualizado para `v=2.0` e catálogo para `main.js?v=1.7`;
- teste específico de conteúdo, privacidade, capa e contrato de progressão.

## Capa v2

A capa foi gerada com OpenAI a partir da direção visual dos materiais anteriores. A composição mostra uma mesa de trabalho vista de cima, mãos sem identificação, documentos sem texto legível, telas desfocadas e uma rede abstrata de informações.

Não há rostos, pessoas identificáveis, PII, marcas, interfaces reconhecíveis, robôs, texto incorporado ou marca-d'água.

- PNG mestre: 1536 × 1024 px, 2.249.203 bytes, SHA-256 `FBBB341780F35C1BDDA96B7B34239EF6DAA6513E89DEDBBD17000702D6344412`;
- WebP: 1200 × 800 px, 117.060 bytes, SHA-256 `32EB5C47A51089488E875D94A80A7AEF9B1DE29069E381D43D04750CD6A79313`;
- crédito: `Imagem ilustrativa gerada por IA com OpenAI, sob direção editorial do Projeto Anônimo.`

## Evidências automatizadas

- oito arquivos de teste executados e aprovados;
- homologação Cliente 0: 12 de 12 casos locais aprovados;
- sintaxe de `material.js` e `main.js` aprovada;
- `git diff --check` sem erros de integridade;
- teste `ia-pilot.test.cjs` confirma conteúdo delimitado, sete itens de uso responsável, ausência de formulário/radios e presença dos dois formatos da capa.

## Evidências no navegador local

Com API exclusivamente sintética:

- título e versão `3.1-piloto` renderizados;
- capa v2 e crédito exibidos;
- CTA hero presente e apontando para `#como-usar`;
- CTA de progressão presente e apontando para `google-workspace-para-oscs`;
- conteúdo completo e checklist de uso responsável renderizados;
- nenhum formulário, CTA antigo de solicitação ou grupo de rádio presente.

## Limites deste gate

Nenhuma escrita foi realizada no catálogo mestre ou Apps Script. Não houve push, PR, merge ou publicação. A página pública continua na versão 1.0 até que os gates externos sejam autorizados e executados.

## Próximo gate de alta autorização

1. push da branch e criação do PR;
2. integração dos campos preparados no catálogo/Apps Script;
3. merge e publicação;
4. validação do slug público após a publicação.
