# Framework de Comunicação v2 — registro de implementação e validação

**Data:** 30/08/2026
**Estado:** PILOTOS 01 E 02 VALIDADOS EM PRODUÇÃO · MATERIAL 03 IMPLEMENTADO E HOMOLOGADO LOCALMENTE
**Materiais:** Biblioteca Viva v3.1 — Google Workspace para OSCs, Checklist de Diagnóstico Digital para OSCs e IA para Organizações Sociais
**Registros:** BV-3.1-001, BV-3.1-002 e BV-3.1-003

## Direção aprovada

A comunicação segue a jornada:

> descobrir → compreender → aplicar → avaliar → priorizar → transformar → compartilhar

A Biblioteca Viva funciona como experiência de aprendizagem e aplicação, não apenas como catálogo. O piloto reposiciona “Google Workspace para OSCs” como guia de organização institucional usando ferramentas digitais.

## Corte implementado e publicado

- cards inteiros clicáveis, com foco visível e destino interno na mesma aba;
- capa sem rostos, PII ou marca de terceiros;
- crédito e texto alternativo da capa;
- conteúdo editorial completo e metadados v3.1;
- território Organização Digital e etapa compreender → aplicar;
- bloco contextual de próximo passo para o Checklist de Diagnóstico Digital;
- callouts editoriais, subtítulos de quarto nível, blocos de código e código inline em Markdown seguro;
- data editorial preservada como data de calendário, sem deslocamento por fuso horário;
- campos editoriais de território, jornada, capa e progressão no catálogo mestre;
- contrato de métricas `1.2.0` preservado;
- testes de contrato e renderização correspondentes.

## Evidências de validação

- catálogo público: `https://projetoanonimo.org/biblioteca.html`;
- material público: `https://projetoanonimo.org/biblioteca/material.html?slug=google-workspace-para-oscs`;
- catálogo mestre: `PA-LIB-002 — Catálogo Mestre da Biblioteca Viva`, registro `PA-LIB-002`;
- merge de implementação do Framework v2: `996c3929b9efcb12259578cdec94e03d92d00220`;
- capa, resumo, público, nível, tempo, versão, CTA, conteúdo e próximo passo verificados no ambiente público;
- correção final de renderização e data coberta por teste automatizado e validação visual antes da publicação.

## Crédito da capa do piloto

> Imagem ilustrativa gerada por IA com OpenAI, sob direção editorial do Projeto Anônimo.

## Encerramento do piloto 01

O registro `BV-3.1-001` está **IMPLEMENTADO, PUBLICADO E VALIDADO**. A manutenção editorial e a observação contínua de métricas permanecem atividades operacionais, não pendências de encerramento.

## Encerramento do piloto 02

O material `BV-3.1-002 — Checklist de Diagnóstico Digital para OSCs` está **IMPLEMENTADO, PUBLICADO E VALIDADO**.

O corte local inclui:

- promessa, metadados SEO, jornada e conteúdo editorial v3.1;
- cinco dimensões e 25 itens observáveis;
- quatro respostas por item: Sim, Parcial, Não e Não se aplica;
- interação sem formulário, pontuação, envio, armazenamento ou persistência;
- CTA primário para o próprio checklist e progressão interna para o Diagnóstico Organizacional;
- novos campos editoriais para SEO e CTAs;
- cache do renderer atualizado para `v=1.9`;
- testes de contrato, renderer e privacidade aprovados;
- registro `PA-LIB-003` publicado no catálogo mestre;
- Apps Script editorial implantado na versão 7;
- GitHub Pages `#55` concluído com sucesso;
- slug público validado com 25 grupos, 100 opções, capa v2 e progressão para o Diagnóstico Organizacional.

A capa v2 sem rostos foi gerada com OpenAI e integrada em formatos PNG e WebP. A imagem representa cinco dimensões e três prioridades sem texto legível, PII, marcas ou interfaces de terceiros.

## Material 03 — IA para Organizações Sociais

O próximo material da trilha é `BV-3.1-003 — IA para Organizações Sociais`. A versão pública atual ainda está em `1.0`, usa solicitação externa como CTA principal e não aplica integralmente promessa, limites, progressão e componentes do padrão v3.1.

A especificação e a implementação local estão registradas em `docs/editorial/drafts/ia-para-organizacoes-sociais-v3.1.md` e `docs/comunicacao/bv31-material-03-implementacao-local.md`. O material passa a abrir a trilha:

> IA para Organizações Sociais → Google Workspace para OSCs → Checklist de Diagnóstico Digital → Diagnóstico Organizacional

## Próximo gate

O pacote local de `BV-3.1-003` está pronto. O próximo gate exige autorização externa para push/PR e, separadamente, integração no catálogo/Apps Script, merge, publicação e validação pública.

