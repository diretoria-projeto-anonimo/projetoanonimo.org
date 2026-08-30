# Framework de Comunicação v2 — registro de implementação e validação

**Data:** 30/08/2026
**Estado:** PILOTO 01 VALIDADO EM PRODUÇÃO · PILOTO 02 IMPLEMENTADO LOCALMENTE
**Pilotos:** Biblioteca Viva v3.1 — Google Workspace para OSCs e Checklist de Diagnóstico Digital para OSCs
**Registros:** BV-3.1-001 e BV-3.1-002

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

## Piloto 02 — implementação local controlada

O material `BV-3.1-002 — Checklist de Diagnóstico Digital para OSCs` foi implementado localmente na branch `feature/bv31-pilot-02-checklist`, a partir de `origin/main` no commit `af7dc1b37a186f589583fdfcb0388b68f1a8e049`.

O corte local inclui:

- promessa, metadados SEO, jornada e conteúdo editorial v3.1;
- cinco dimensões e 25 itens observáveis;
- quatro respostas por item: Sim, Parcial, Não e Não se aplica;
- interação sem formulário, pontuação, envio, armazenamento ou persistência;
- CTA primário para o próprio checklist e progressão interna para o Diagnóstico Organizacional;
- novos campos editoriais para SEO e CTAs;
- cache de assets atualizado para `v=1.7`;
- testes de contrato, renderer, privacidade e homologação local.

A capa v2 sem rostos foi gerada com OpenAI, homologada e integrada localmente em formatos PNG e WebP. A imagem representa cinco dimensões e três prioridades sem texto legível, PII, marcas ou interfaces de terceiros. Esta implementação não inclui push, PR, merge, alteração do catálogo externo, implantação do Apps Script ou publicação.

## Próximo gate

O commit local deste corte está autorizado. Integração externa, push, PR, merge e publicação continuam dependentes de autorizações próprias.

