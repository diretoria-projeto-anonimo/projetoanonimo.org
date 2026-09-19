# NotebookLM / Gemini Notebook — Editorial e Auditoria v1

Este diretório organiza o uso do Gemini Notebook (NotebookLM) em **dois papéis**: roteirista editorial e **auditor de estratégia e marketing** do Projeto Anônimo.

## Objetivo

Transformar conhecimento técnico confiável em conteúdos úteis para organizações sociais, fortalecendo autoridade, tráfego qualificado e procura por diagnóstico, formação e consultoria.

## Papéis

- **NotebookLM/Gemini — caderno-mestre:** pesquisa fundamentada, estrutura, roteiro e primeira versão.
- **NotebookLM/Gemini — auditor:** avaliação adversarial de estratégia e de marketing, verificação de evidência, red team e priorização.
- **Codex:** revisão crítica, SEO, conversão, consistência editorial e integração técnica.
- **Diretoria do Projeto Anônimo:** posicionamento institucional, aprovação e publicação.

> **Dois notebooks, dois papéis.** O *roteirista* produz; o *auditor* contesta. Nenhum dos dois se autoaprova. A decisão é sempre humana.

## Fluxo obrigatório

1. Carregar no notebook apenas fontes aprovadas.
2. Gerar primeiro o mapa de evidências e só depois o roteiro.
3. Marcar afirmações sem fonte como `VALIDAÇÃO NECESSÁRIA`.
4. Produzir o artigo e seus derivados sem inventar números, casos ou resultados.
5. Revisar tecnicamente e editorialmente fora do NotebookLM.
6. Publicar somente após aprovação explícita.

## Arquivos

### Caderno-mestre (produção editorial)

- `caderno-mestre.md`: contexto, público, voz, oferta e fontes.
- `prompts-roteirista.md`: comandos reutilizáveis para o NotebookLM/Gemini.
- `pauta-sprint-01.md`: sequência de conteúdos, conversão e critérios de aceite.
- `revisao-mapa-01.md`: exemplo de revisão de mapa de evidências.

### Auditor de Estratégia e Marketing (fonte avaliadora)

Códigos ratificados em **2026-09-10** (registro em `PA-DOC-001` §15).

- **`PA-AUD-001`** — `prompt-auditor-estrategia-marketing.md`: **prompt-mestre** a colar no Gemini Notebook, rubrica de 10 dimensões, gates de veto, protocolos `P1`–`P12`, formato obrigatório de parecer e calibração.
- **`PA-AUD-002`** — `fontes-externas-referencia.md`: lista autorizada de fontes externas (normativo, dados do setor, benchmarks, tendências), mapa pergunta → fonte e regras de precedência.
- **`PA-AUD-003`** — `sprint-auditoria-01.md`: sprint de 10 dias que audita 13 frentes da estratégia e do marketing e entrega o Plano Estratégico Corrigido v2.
- **`PA-DOC-001`** — `plano-documentacao-projeto.md`: convenção de nomes, arquitetura de pastas, ciclo de status, mapa de fonte única, documentos a criar e registro de decisões.

> **Repositório canônico:** `projetoanonimo.org-gtm-global-v1`. Este diretório é a versão vigente da documentação editorial; as cópias nos repositórios arquivados não devem ser editadas.

Os quatro rascunhos em `../drafts/` permanecem como fontes de trabalho e não devem ser tratados como fatos confirmados sem revisão.
