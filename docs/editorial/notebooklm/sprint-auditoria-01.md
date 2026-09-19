# PA-AUD-003 — SPRINT DE AVALIAÇÃO ESTRATÉGICA E DE MARKETING (SPRINT A1)

**Código PA:** `PA-AUD-003` — **ratificado em 2026-09-10**
**Versão:** 1.0
**Status:** Homologado — aguarda decisão da diretoria sobre a data de início
**Classificação:** 🟡 Interno
**Dono:** Diretoria do Projeto Anônimo
**Revisão prevista:** ao encerramento da sprint
**Substitui:** —
**Fontes:** `PA-AUD-001`, `PA-AUD-002`, acervo de `03_CONTEUDO`, site público, canais oficiais.
**Repositório canônico:** `projetoanonimo.org-gtm-global-v1`
**Data:** 10 de setembro de 2026

**Duração:** 10 dias úteis (2 semanas)
**Objetivo:** submeter toda a estratégia e o conteúdo de marketing em circulação ao auditor (Gemini Notebook) e sair da sprint com **um plano estratégico corrigido, priorizado e documentado** — não com uma coleção de opiniões.
**Papéis:** Auditor (Gemini Notebook) · Produção editorial (corrige e implementa) · Diretoria (decide e aprova)
**Pré-requisito:** `prompt-auditor-estrategia-marketing.md` carregado e calibrado (Anexo B) + `fontes-externas-referencia.md` carregado

---

## 1. Regra da sprint

> **Nada entra em produção nova durante a Sprint A1 sem antes ser auditado.** O que já está publicado não é retirado — é auditado, classificado e corrigido por ordem de risco.

## 2. Escopo — o que entra na auditoria

| # | Frente | Material-fonte no acervo | Protocolo |
| :-- | :--- | :--- | :-- |
| F1 | Posicionamento e proposta de valor | `sobre.html`, `index.html`, caderno-mestre editorial | **P1** |
| F2 | Público, segmentação e priorização | caderno-mestre (públicos e problemas), `PA-COM-005`, `PA-CRM-001` (base de leads) | **P2** |
| F3 | Oferta, funil e hierarquia de conversão | `solucoes.html`, `diagnostico-organizacional.html`, `biblioteca.html`, `blog.html` | **P3** |
| F4 | Rigor factual de todo o acervo editorial | 12 kits `PA-SOC-*`, 8 artigos do blog, materiais `BV-3.1-*`, `pauta-sprint-01` | **P4** |
| F5 | Red team do posicionamento e da oferta | F1 + F3 consolidados | **P5** |
| F6 | Canais, formatos e cadência | `PA-SOC-001`, `PA-COM-005`, `assets/social/**` (campanha-01, observatório, v2, v3) | **P6** |
| F7 | SEO, descoberta e Biblioteca Viva | `sitemap.xml`, `robots.txt`, 8 artigos do blog, `biblioteca.html` | **P7** |
| F8 | Mensuração e dados | UTMs dos kits e do `PA-VID-009`, métricas anônimas do CMS, `PA-CRM-001` | **P8** |
| F9 | Risco jurídico, de dados e reputacional | `privacidade.html`, `termos.html`, `captura-diagnostico.html`, peças com imagem de pessoa | **P9** |
| F10 | Cenário e atualidade | todo o acervo contra Camada 2 / 3 / 4 das fontes externas | **P10** |
| F11 | Campanha paga em curso | `PA-VID-009` (roteiro, pack, agenda, copys, UTMs, planilha de acompanhamento) | **P6 + P8 + P4** |
| F12 | Podcast e derivados | `PA-POD-001` (Kit Temporada 1, 7 episódios, metadados YouTube, Reels 55s, Meta Planner) | **P6 + P11** |
| F13 | Sustentabilidade editorial | volume planejado × capacidade real da equipe | **P11** |

## 3. Definition of Ready (antes de abrir a sprint)

- [ ] Notebook criado com Camada 1 e Camada 5 carregadas e calibradas.
- [ ] Camada 2 (TIC OSFIL 2025, FASFIL 2023) carregada.
- [ ] Camadas 3 e 4 carregadas (`M+R Benchmarks 2026`, `DataReportal Digital 2026`, `Hootsuite 2026`, `Edelman 2026`).
- [ ] Acesso ao acervo: `03_CONTEUDO`, site público, canais sociais e painel de métricas.
- [ ] Diretoria designada como quem aprova, com janela de resposta definida.

## 4. Backlog da sprint

| ID | Item | Protocolo | Saída esperada | Critério de aceite |
| :--- | :--- | :--- | :--- | :--- |
| A1-01 | Auditoria de posicionamento | P1 | Parecer + frase de posicionamento testada | Distinção clara contra consultoria genérica e contra "ONG de TI" |
| A1-02 | Auditoria de ICP | P2 | Mapa de 3 segmentos priorizados com evidência de tamanho | Cada segmento ancorado na TIC OSFIL 2025 |
| A1-03 | Auditoria de funil e oferta | P3 | Diagrama de funil com fricções e saltos | Cada CTA decorre do problema da peça anterior |
| A1-04 | Auditoria de afirmações do acervo | P4 | Matriz `afirmação × evidência × status` de todo o acervo | 100% das afirmações técnicas/numéricas classificadas |
| A1-05 | Red team do posicionamento | P5 | 7 ataques plausíveis + resposta institucional | Pelo menos 3 ataques sem resposta pronta hoje |
| A1-06 | Auditoria de canais e formatos | P6 | Tabela canal × público × formato × frequência | Nenhum canal sem responsável e sem formato definido |
| A1-07 | Auditoria de SEO e Biblioteca Viva | P7 | Mapa de intenção de busca + correções de título/estrutura | Cada artigo mapeado a uma intenção real |
| A1-08 | Auditoria de mensuração | P8 | Lista de métricas possíveis hoje × necessárias | Toda campanha com UTM, hipótese e critério de sucesso |
| A1-09 | Auditoria de risco jurídico e de dados | P9 | Registro de riscos com mitigação e responsável | Zero peça com PII ou imagem de menor sem autorização documentada |
| A1-10 | Auditoria de atualidade | P10 | Lista do que ficou defasado nos últimos 12 meses | Toda pauta de 2023/2024 remarcada ou aposentada |
| A1-11 | Auditoria da campanha `PA-VID-009` | P4+P6+P8 | Parecer + plano de correção da campanha | Veredito com nota e gate explícitos |
| A1-12 | Auditoria do podcast e derivados | P6+P11 | Parecer + ajuste de cadência | Capacidade real compatível com o volume |
| A1-13 | Painel consolidado | — | Nota por frente, 10 dimensões, ranking de risco | Reproduzível e rastreável a cada parecer |
| A1-14 | **Plano Estratégico Corrigido v2** | — | Documento único, auditado, com decisões pendentes marcadas | Passou por P3 e P5 sem gate abaixo de 3 |

## 5. Cronograma — 10 dias úteis

### Fase 1 — Auditoria (D1 a D5)

| Dia | Manhã | Tarde | Entrega do dia |
| :--- | :--- | :--- | :--- |
| **D1** | Calibração do notebook (Anexo B do prompt-mestre) | A1-01 e A1-02 | Pareceres de posicionamento e ICP |
| **D2** | A1-03 (funil e oferta) | A1-04 parte 1 (kits `PA-SOC-*`) | Parecer de funil + matriz parcial |
| **D3** | A1-04 parte 2 (blog, Biblioteca Viva, `BV-3.1-*`) | A1-07 (SEO e descoberta) | Matriz completa + mapa de busca |
| **D4** | A1-09 (risco jurídico/dados) | A1-08 (mensuração e UTMs) | Registro de riscos + lista de métricas |
| **D5** | A1-11 (`PA-VID-009`) | A1-05 (red team) | Parecer de campanha + 7 ataques |

### Fase 2 — Correção e priorização (D6 a D8)

| Dia | Manhã | Tarde | Entrega do dia |
| :--- | :--- | :--- | :--- |
| **D6** | A1-06 (canais e formatos) | A1-12 (podcast) | Dois pareceres |
| **D7** | A1-10 (atualidade e tendências) | Consolidação A1-13 | Painel consolidado com ranking de risco |
| **D8** | Priorização: `impacto × esforço × risco` | Redação do plano de correção | Plano de correção em ordem de execução |

### Fase 3 — Aprovação e documentação (D9 a D10)

| Dia | Manhã | Tarde | Entrega do dia |
| :--- | :--- | :--- | :--- |
| **D9** | A1-14 — redação do **Plano Estratégico Corrigido v2** | Reauditoria rápida do v2 (P3) | Plano v2 aprovado tecnicamente pelo auditor |
| **D10** | Ata de decisão com a diretoria | Registro documental e arquivamento | Sprint encerrada com decisões registradas |

## 6. Entregáveis da sprint

1. **13 pareceres** no formato padrão do auditor (10 seções + LISTAGEM COMPLETA).
2. **1 painel consolidado** — nota por frente nas 10 dimensões e ranking de risco.
3. **1 plano de correção priorizado** — `correção × impacto × esforço × risco × ordem × responsável`.
4. **1 Plano Estratégico Corrigido v2** — posicionamento, ICP, oferta, canais, calendário, mensuração.
5. **1 ata de decisão** — o que a diretoria aprovou, rejeitou e adiou, com responsável e prazo.
6. **1 registro de dívida editorial** — o que já está publicado e precisa de correção retroativa.

## 7. Critérios de aceite da sprint

- Nenhum parecer sem a LISTAGEM COMPLETA e sem veredito explícito.
- Nenhuma afirmação técnica, jurídica ou numérica sem fonte rastreável.
- Nenhum gate (D1, D2, D7) abaixo de 3 no Plano v2.
- Toda recomendação com responsável nomeado e prazo.
- Toda correção retroativa registrada, mesmo que não executada na sprint.
- Capacidade editorial declarada por escrito (quem produz o quê, por semana).

## 8. Fora do escopo

- Execução das correções de conteúdo (entra na Sprint Editorial seguinte).
- Publicação, agendamento ou alteração de campanha ativa.
- Contratação de ferramenta, mídia paga ou banco de imagens.
- Revisão jurídica formal de Privacidade e Termos (permanece pendência própria).
- Criação de números, casos ou depoimentos para completar lacunas de evidência.

## 9. Métricas da própria sprint

| Métrica | Meta |
| :--- | :--- |
| Frentes auditadas | 13 de 13 |
| Afirmações classificadas na matriz | 100% das afirmações técnicas/numéricas do acervo |
| Correções priorizadas com responsável | 100% |
| Correções executadas dentro da sprint | 0 (a sprint audita, não executa) |
| Decisões pendentes de humano com prazo | 100% |
| Divergências entre auditor e produção resolvidas por fonte | 100% |

## 10. Riscos da sprint

| Risco | Mitigação |
| :--- | :--- |
| Parecer virar opinião criativa sem evidência | Gate D1 obrigatório; matriz de afirmações em todo parecer |
| Acervo grande demais para 10 dias | Auditar por amostra declarada: 100% dos kits publicados + 100% dos artigos do site + campanha ativa; resto por amostra |
| Auditor "concordar com tudo" | P5 (red team) obrigatório em F1 e F3; teste de calibração nº 2 antes de começar |
| Corrigir sem capacidade de execução | Plano de correção só aceita item com responsável e janela definidos |
| Decisão parada na diretoria | Janela de resposta formal; item sem decisão entra no registro como pendência datada |
