# PA-AUD-002 — CATÁLOGO DE FONTES EXTERNAS DE REFERÊNCIA

**Código PA:** `PA-AUD-002` — **ratificado em 2026-09-10**
**Versão:** 1.0
**Status:** Homologado — pronto para uso; a aprovação institucional do conteúdo segue o fluxo normal
**Classificação:** 🟡 Interno
**Dono:** Coordenação de Comunicação
**Revisão prevista:** 2026-12-09 (90 dias)
**Substitui:** —
**Função:** ser a **lista autorizada** de fontes externas do notebook auditor. O auditor só pode citar o que está aqui — ou marca `VALIDAÇÃO NECESSÁRIA`.
**Regra de manutenção:** revisar a cada 90 dias; toda fonte anual deve ser rebatizada com o ano da edição vigente.
**Fontes:** `PA-AUD-001` (prompt-mestre do auditor), `caderno-mestre.md` (fontes externas primárias já aprovadas no projeto).
**Repositório canônico:** `projetoanonimo.org-gtm-global-v1`
**Última verificação de URLs:** 2026-09-10
**Data:** 10 de setembro de 2026

### Legenda de verificação

| Marca | Significado |
| :-- | :--- |
| ✅ **Verificado** | URL aberta ou devolvida por busca na sessão de montagem deste catálogo |
| ◐ **Herdado** | já consta como fonte aprovada em documento do projeto (`caderno-mestre.md`) |
| ⚠️ **A confirmar** | endereço canônico conhecido; conferir antes de carregar no notebook |

---

## Camada 5 — Normativo, jurídico e de governança (precedência máxima)

Sustentam afirmações jurídicas, de segurança, de dados e de IA. São a única camada autorizada a dizer "a lei exige", "a norma recomenda".

| Fonte | O que sustenta | Uso no Projeto Anônimo | Ver. |
| :--- | :--- | :--- | :-- |
| ANPD — Guia de segurança da informação para agentes de tratamento de pequeno porte | Medidas técnicas e administrativas mínimas para ATPP | Pilar 2 (segurança) e Pilar 5 (soberania); base dos kits `PA-SOC-001-P02/P04` | ◐ |
| ANPD — Resolução CD/ANPD nº 2/2022 | Enquadramento e obrigações do agente de pequeno porte | Limite jurídico de toda promessa sobre LGPD | ◐ |
| ANPD — portal de guias, checklists e materiais educativos | Documentos orientativos oficiais | Pilar 3 (IA responsável) e conteúdo de privacidade | ⚠️ `gov.br/anpd` |
| Lei 13.709/2018 (LGPD) | Texto legal | Fundamento de qualquer menção a dado pessoal | ⚠️ `planalto.gov.br` |
| Lei 13.019/2014 (MROSC) | Regime das parcerias com o poder público | Pilar 6 e conteúdo de editais (`PA-SOC-005-P03`) | ⚠️ `planalto.gov.br` |
| NIST — Cybersecurity Framework 2.0 | Estrutura de gestão de risco cibernético | Pilar 2; referência de maturidade | ◐ |
| NIST — SP 800-34 Rev. 1 (Contingency Planning Guide) | Continuidade e plano de contingência | Sustenta backup e teste de restauração (`PA-SOC-001-P04`) | ◐ |
| NIST — AI Risk Management Framework (+ perfil de IA generativa) | Governança e risco de IA | Pilar 3 (IA responsável) | ⚠️ `nist.gov/itl/ai-risk-management-framework` |
| CIS Controls v8 | Linhas de base priorizadas de segurança | Alternativa prática ao NIST para equipe pequena | ⚠️ `cisecurity.org/controls` |
| ISO/IEC 27001:2022 | Sistema de gestão de segurança da informação | Vocabulário de governança; **nunca** afirmar certificação | ⚠️ `iso.org/standard/27001` |
| ISO/IEC 42001:2023 | Sistema de gestão de IA | Vocabulário de governança de IA para OSCs | ✅ `iso.org/standard/81230` |
| UNESCO — Recomendação sobre a Ética da Inteligência Artificial | Marco ético internacional | Pilar 3; ancoragem de "IA responsável" | ⚠️ `unesco.org` |
| OCDE — Princípios de IA | Marco de política pública | Comparação internacional | ⚠️ `oecd.org` |
| MCTI / gov.br — Plano Brasileiro de Inteligência Artificial (PBIA) | Política nacional de IA | Contexto e oportunidade de posicionamento | ✅ `gov.br/mcti/.../plano-brasileiro-de-inteligencia-artificial` |
| W3C — WCAG 2.2 | Critérios de acessibilidade | Sustenta a exigência de Alt Text e legenda do `PA-SOC-001` | ⚠️ `w3.org/TR/WCAG22/` |
| OCDE — Integrity Review of Brazil 2025 (frentes de OSC e integridade) | Integridade, transparência e governança do terceiro setor brasileiro | Pilar 6; conteúdo institucional e de transparência | ✅ `oecd.org` (publicações 2025/10) |

**Vedações desta camada:** nunca dizer que o projeto aplica, certifica ou garante ISO, NIST, ANPD ou conformidade. Nunca tratar guia orientativo como lei.

---

## Camada 2 — Dados do setor (base obrigatória de qualquer estatística sobre OSCs)

**Regra:** toda frase do tipo "as organizações sociais…", "a maioria das OSCs…" precisa vir daqui. Sem isso, o auditor marca `NÃO SUSTENTADA`.

| Fonte | O que sustenta | Uso no Projeto Anônimo | Ver. |
| :--- | :--- | :--- | :-- |
| **TIC Organizações Sem Fins Lucrativos 2025** — Cetic.br / NIC.br / CGI.br | Adoção de tecnologia, presença digital, LGPD e IA nas OSCs brasileiras (1.306 organizações; coleta CATI jun–nov/2025; base Cempre/IBGE 2022) | **Fonte primária do projeto.** Sustenta dor, urgência e dimensionamento do mercado | ✅ `cetic.br/pt/pesquisa/osfil/analises/` |
| FASFIL 2023 — IBGE, *Fundações Privadas e Associações sem Fins Lucrativos no Brasil* | Tamanho, distribuição regional e emprego no setor | Dimensionar mercado e regionalizar a comunicação | ✅ `anda.ibge.gov.br` (notícia FASFIL 2023) |
| Mapa das Organizações da Sociedade Civil — IPEA | Base pública de OSCs, parcerias e recursos federais | Prospecção qualificada e conteúdo sobre editais | ⚠️ `mapaosc.ipea.gov.br` |
| Pesquisa Doação Brasil — IDIS (com GIFE / GrantLab) | Comportamento do doador individual brasileiro | Sustenta a camada de captação e advocacia | ✅ `idis.org.br` · ✅ `grantlab.gife.org.br` |

### Dados confirmados na TIC OSFIL 2025 (usar com citação obrigatória)

Estes números são a espinha dorsal da argumentação do projeto. **Citar sempre** como *TIC Organizações Sem Fins Lucrativos 2025 (Cetic.br/NIC.br)*:

| Indicador | Valor |
| :--- | :--- |
| OSCs que usam IA generativa | **1 em cada 3** — geração de texto 27%, imagens/vídeo 20%, código 10% |
| Adoção por área | Religião 45% · Educação e pesquisa 42% · Saúde e assistência social 31% · Cultura e recreação 20% |
| Armazenamento de arquivos em nuvem (2022 → 2025) | 21% → **39%** |
| E-mail em nuvem | 19% → **36%** |
| Software de escritório (nuvem) | 11% → **32%** |
| Celulares institucionais | 35% → **52%** · Tablets 11% → 29% · celular pessoal ainda predominante **67%** |
| Internet utilizada nos últimos 12 meses | **90%** · Wi-Fi próprio **80%** · Wi-Fi gratuito ao público 38% → **60%** |
| Doações via PIX (medido pela 1ª vez) | **66%** |
| Doações pela internet (site, redes, financiamento coletivo) | **29%** |
| OSCs com website | **46%** |
| OSCs com perfil em rede social | **80%** — Instagram/TikTok/Flickr **70%** (era 48% em 2022) · WhatsApp/Telegram 66% · Facebook 65% · YouTube/Vimeo 45% · **LinkedIn 20%** (era 9% em 2022) |
| Área/pessoa responsável por LGPD | 29% → **52%** |
| Política de privacidade visível no site | 49% → **69%** · canal para titulares 48% → 68% · política de segurança divulgada 44% → 67% |
| **Treinamento interno em privacidade e proteção de dados** | **apenas 31%** |
| **Custeio de cursos externos** | **apenas 18%** |

> **Leitura estratégica para o auditor:** a lacuna entre *adoção* (nuvem, IA, PIX, redes) e *capacitação* (31% / 18%) é o argumento mais forte e mais defensável do Projeto Anônimo para a oferta de formação e consultoria. O auditor deve exigir que toda peça de conversão use esse contraste — e nunca o substitua por número inventado.

---

## Camada 3 — Benchmarks de marketing, captação e desempenho

Servem para dar **régua**: o que é normal, bom e ruim em e-mail, redes, anúncios e site no terceiro setor.

| Fonte | O que sustenta | Uso no Projeto Anônimo | Ver. |
| :--- | :--- | :--- | :-- |
| **M+R Benchmarks 2026** (edição vigente) | Receita online, e-mail, mensagens móveis, anúncios, redes sociais e influenciadores, desempenho de site, mala direta | Régua de desempenho das campanhas; seções úteis: `/social-media-influencers/`, `/email-messaging/`, `/advertising/`, `/website-performance/`, `/the-big-story/` | ✅ `mrbenchmarks.com` |
| CAF — World Giving Index (edição vigente) | Doação, voluntariado e ajuda a estranhos por país | Contexto comparativo do Brasil; cautela na transposição | ✅ `cafonline.org` |
| GivingTuesday — relatórios de doação e comportamento | Generosidade e campanhas de doação | Calendário de campanha; comparação internacional | ⚠️ `givingtuesday.org` |
| Edelman Trust Barometer 2026 | Confiança em instituições, mídia e IA | Sustenta tom e limites de discurso sobre IA e sobre instituições | ✅ `edelman.com` |
| Google Search Central / Central de Ajuda de Busca | Regras oficiais de conteúdo útil, indexação e IA na busca | Sustenta a estratégia de SEO e da Biblioteca Viva | ⚠️ `developers.google.com/search` |
| Think with Google | Comportamento de busca e intenção de consumo | Priorização de pauta por intenção real de busca | ⚠️ `thinkwithgoogle.com` |
| Meta Business / Instagram para Empresas (materiais oficiais) | Formatos, especificações e boas práticas de plataforma | Sustenta `PA-SOC-001` §5 (formatos por canal) | ⚠️ `business.facebook.com` / `creators.instagram.com` |
| LinkedIn Marketing (materiais oficiais) | Alcance institucional B2B e formato de artigos | Sustenta a versão institucional de legenda do `PA-SOC-001` | ⚠️ `business.linkedin.com` |

---

## Camada 4 — Tendências e cenário (janela de 12 meses · revisar a cada 90 dias)

**Regra dura:** tendência **nunca** é prova de resultado do Projeto Anônimo. O auditor deve marcar `TENDÊNCIA NÃO TRANSFERÍVEL` quando eu tentar usar tendência como evidência.

| Fonte | O que sustenta | Uso no Projeto Anônimo | Ver. |
| :--- | :--- | :--- | :-- |
| **DataReportal — Digital 2026** (relatório anual + atualização de meio de ano) | Penetração de internet, uso de rede social, tempo de uso, formatos | Contexto de canal por país e por plataforma | ✅ `datareportal.com/reports/digital-2026-mid-year-global-update-report` |
| **Hootsuite — Social Media Trends 2026** | Direção de mercado: conteúdo humano, employee advocacy, IA no fluxo de conteúdo | Ajuste de pauta e de formato; prioriza o que o setor já adotou | ✅ `hootsuite.com/research/social-trends` |
| **TikTok — relatório anual de tendências (What's Next)** | Previsões de comportamento e formato na plataforma | Pilar 6 (educação/cultura); adaptação de Reels e Shorts | ⚠️ TikTok Newsroom (edição 2026 já publicada) |
| **Stanford HAI — AI Index Report 2026** | Estado da IA: capacidade, adoção, custo, regulação, opinião pública | Pilar 3; sustenta "IA responsável" com dado, não com opinião | ⚠️ `hai.stanford.edu/ai-index` |
| Sprout Social Index (edição vigente) | Comportamento de audiência e de social listening | Complemento de tendência social | ⚠️ `sproutsocial.com/insights` |
| We Are Social / Meltwater (via DataReportal) | Séries históricas de uso social | Série temporal para comparar | ✅ (via DataReportal) |

---

## Mapa pergunta → fonte (usar antes de escrever qualquer parecer)

| A pergunta que o material tenta responder | Fonte autorizada |
| :--- | :--- |
| Quantas OSCs têm site, redes, nuvem? | TIC OSFIL 2025 (Camada 2) |
| Quantas usam IA generativa? | TIC OSFIL 2025 |
| Existe capacitação no setor? | TIC OSFIL 2025 (31% / 18%) |
| Como as OSCs recebem doação hoje? | TIC OSFIL 2025 (PIX 66% · online 29%) + IDIS PDB |
| A LGPD se aplica a OSC pequena? Como? | ANPD (guia ATPP) + Resolução CD/ANPD nº 2/2022 + texto legal |
| Qual o mínimo de segurança/continuidade? | NIST CSF 2.0 + NIST SP 800-34 + CIS Controls + ANPD |
| Como governar IA sem inventar? | NIST AI RMF + ISO/IEC 42001 + UNESCO + OCDE + PBIA |
| Qual desempenho é "normal" em e-mail, redes, anúncio? | M+R Benchmarks 2026 |
| Estamos atrasados ou adiantados no cenário digital? | DataReportal Digital 2026 |
| O que mudou de tendência no último ano? | Hootsuite 2026 + TikTok + Meta/LinkedIn oficiais |
| Confiança do público em IA e instituições? | Edelman Trust Barometer 2026 + AI Index 2026 |
| Acessibilidade: o que é exigível? | WCAG 2.2 + `PA-SOC-001` §7 |
| Transparência e integridade do terceiro setor? | OCDE Integrity Review of Brazil 2025 + `transparencia.html` |

---

## Fontes proibidas como fonte principal

Nunca sustentam afirmação no parecer; podem, no máximo, aparecer como `SINAL FRACO — NÃO USAR EM PUBLICAÇÃO`:

- post comercial, landing page de agência, "10 melhores ferramentas";
- blog sem autoria identificável ou sem data;
- conteúdo gerado por IA sem revisão humana declarada;
- fórum, grupo de WhatsApp/Telegram, comentário de rede social;
- agregadores de estatística que não citam a fonte primária;
- Wikipedia e congêneres;
- estudo de caso de terceiro apresentado como resultado do Projeto Anônimo;
- números "de mercado" sem edição, ano e metodologia.

## Precedência em caso de conflito

1. Lei e ato normativo (Camada 5) vencem tudo.
2. Dados primários brasileiros (Camada 2) vencem benchmark internacional para afirmação sobre OSCs brasileiras.
3. Benchmark do terceiro setor (Camada 3) vence tendência de plataforma para afirmação de desempenho.
4. Tendência (Camada 4) vence apenas para afirmação sobre **formato** e **cenário**, nunca sobre **resultado**.
5. Documento interno aprovado vence rascunho interno; e **nenhum documento interno vence lei ou dado primário**.

## Rotina de manutenção

| Periodicidade | Ação | Responsável |
| :--- | :--- | :--- |
| 90 dias | Revisar Camada 4 e rebatizar edições anuais | Coordenação de comunicação |
| Semestral | Conferir links quebrados e mudanças de URL oficial | Produção editorial |
| Anual | Atualizar Camada 2 e 3 com as novas edições e registrar a data | Diretoria |
| A cada parecer | Registrar qual edição foi usada | Auditor (no próprio parecer) |
