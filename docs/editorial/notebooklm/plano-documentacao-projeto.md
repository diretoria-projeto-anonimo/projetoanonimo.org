# PA-DOC-001 — PLANO DE DOCUMENTAÇÃO DO PROJETO ANÔNIMO

**Código PA:** `PA-DOC-001` — **ratificado em 2026-09-10**
**Versão:** 1.0
**Status:** Aprovado — repositório canônico definido em 2026-09-10
**Classificação:** 🟡 Interno
**Dono:** Diretoria do Projeto Anônimo
**Revisão prevista:** 2026-12-09 (90 dias)
**Substitui:** —
**Fundamento da aprovação:** registro em §15 (Decisões ratificadas)
**Data:** 10 de setembro de 2026
**Aplica-se a:** todo documento do Centro de Operações (Drive) e dos repositórios do site
**Autoridade sobre:** convenção de nomes, estrutura de pastas, ciclo de status, modelo de documento e mapa de fonte única
**Subordinado a:** Manual de Marca `PA-BRD-001`, Guia Oficial de Redes Sociais `PA-SOC-001` e Inventário de Perfis e Canais `PA-COM-005`

---

## 1. Objetivo

Tornar a documentação do projeto **auditável, rastreável e sem duplicidade**. Hoje o acervo é rico — 40 arquivos em `03_CONTEUDO`, 12 kits editoriais, 8 artigos de blog, materiais da Biblioteca Viva, um repositório de campanha e um pacote de anúncio — mas não há um documento que diga **qual arquivo é a verdade** sobre cada assunto. Este plano resolve isso.

**Três princípios:**

1. **Fonte única (SSoT)** — para cada assunto existe **um** documento que manda. Os outros apontam para ele.
2. **Evidência antes de afirmação** — documento sem fonte rastreável é rascunho, não é documento.
3. **Um assunto, um dono** — todo documento tem responsável nomeado e data de revisão.

---

## 2. Diagnóstico atual (achados reais do acervo)

| # | Achado | Risco | Encaminhamento |
| :-- | :--- | :--- | :--- |
| 1 | Quatro cópias quase idênticas do site e da documentação convivem: `projetoanonimo.org-canonico`, `-brand-system-v1`, `-framework-cliente0-v1`, `-gtm-global-v1` | Divergência silenciosa: dois documentos dizendo coisas diferentes sobre o mesmo assunto | ✅ **DECIDIDO em 2026-09-10** (§15.2): `projetoanonimo.org-gtm-global-v1` é o repositório canônico; os outros três receberam `00-STATUS-DESTE-REPOSITORIO.md` na raiz declarando arquivo histórico |
| 2 | `docs/editorial/notebooklm/` existe duplicado em três repositórios | O caderno-mestre pode ser editado na cópia errada | ✅ **DECIDIDO em 2026-09-10** (§15.2): a versão vigente é a do repositório canônico; as cópias nos repositórios arquivados não devem mais ser editadas |
| 3 | Pasta `99_DUPLICADOS_PARA_REVISAO` em duas áreas de conteúdo | Conteúdo ambíguo podendo voltar para produção | Prazo de triagem: aprovar, corrigir ou excluir — não pode permanecer indefinidamente |
| 4 | `PA-SOC-001-P05` e kits das Sprints 02, 04 e 05 estão em "Rascunho — depende de aprovação" enquanto circulam como material | Publicação de conteúdo não aprovado | O status precisa ser visível **no arquivo publicado**, não só no índice |
| 5 | Campos `[PREENCHER]` e `[VALIDAR]` abertos em `PA-COM-005` e `PA-CRM-001` | Ausência de responsável formal por canal e por base de leads | Fechar no ciclo de aprovação da Sprint A1 |
| 6 | Chave de identificação de contato divergente (`PA-000001` vs `CT-0001`) | Duas bases de dados incompatíveis | Decisão da diretoria registrada em ata e aplicada em `PA-CRM-001` |
| 7 | Não existe documento de **estratégia** versionado no acervo local (a estratégia vive em Docs do Drive e no caderno-mestre) | A estratégia não é auditável nem versionável | Criar `PA-EST-001` a partir da Sprint A1 |
| 8 | Não existe registro de tratamento de dados nem base legal documentada | Risco de LGPD e de resposta a titular | Criar `PA-LGPD-001` (ver §9) |
| 9 | **Os quatro repositórios contêm `CNAME: projetoanonimo.org`**, e três declaram a mesma versão `1.3.0 RC` | Dois repositórios podem publicar no mesmo domínio e sobrescrever o site oficial | Marcar os arquivados (§15.2) e **desativar o GitHub Pages ou remover o `CNAME`** dos três, deixando só o canônico publicar |

---

## 3. Arquitetura de pastas — Centro de Operações

Estrutura proposta, compatível com o que já existe (`03_CONTEUDO`, `04_BIBLIOTECA_VIVA`, `07_AUTOMACOES_E_IA`, `08_CANVA_E_MIDIA`):

```
Projeto Anônimo - Centro de Operações
├── 00_INSTITUICAO            → estatuto, atas, CNPJ, certidões, transparência
├── 01_GOVERNANCA_E_ESTRATEGIA → PA-EST-*, PA-GOV-*, PA-DOC-001, PA-AUD-*
├── 02_ADMINISTRATIVO          → financeiro, contratos, prestação de contas
├── 03_CONTEUDO                → PA-SOC-*, PA-POD-*, PA-VID-*, PA-EDT-*, PA-CAN-*, PA-BRD-*
├── 04_BIBLIOTECA_VIVA         → PA-LIB-* (catálogo, arquitetura, API, materiais publicados)
├── 05_COMUNICACAO_E_CANAIS    → PA-COM-*, PA-WAB-*, PA-CRM-*
├── 06_PROJETOS_E_PARCERIAS    → projeto por projeto, editais, relatórios
├── 07_AUTOMACOES_E_IA         → Apps Script, automações, prompts de IA, PA-EDT-004
├── 08_CANVA_E_MIDIA           → arte, vídeo, áudio, banco de imagens
├── 09_LGPD_E_SEGURANCA        → PA-LGPD-*, políticas de dados, registro de tratamento
└── 99_ARQUIVO                 → versões substituídas, com aviso de status no topo
```

**Regra de migração:** nenhuma pasta nova é criada sem que este documento seja atualizado. Pasta sem documento-classificado em `PA-IDX-001` é considerada órfã.

---

## 4. Taxonomia de códigos

**Formato:** `PA-AAA-NNN`
`AAA` = área (3 letras) · `NNN` = número sequencial de três dígitos, único dentro da área, **nunca reutilizado**.

| Área | Significado | Exemplos no acervo |
| :--- | :--- | :--- |
| `BRD` | Marca e design system | `PA-BRD-001` |
| `CAN` | Produção gráfica (Canva) | `PA-CAN-001` |
| `COM` | Comunicação, canais e mensagens | `PA-COM-001`, `PA-COM-005` |
| `CRM` | Base de contatos e leads | `PA-CRM-001` |
| `EDT` | Editorial, publicação e ferramentas | `PA-EDT-003`, `PA-EDT-004` |
| `LIB` | Biblioteca Viva | `PA-LIB-002`, `PA-LIB-003` |
| `OP` | Operação e rotinas | `PA-OP-001` |
| `POD` | Podcast | `PA-POD-001` |
| `SOC` | Redes sociais / kits editoriais | `PA-SOC-001`, `PA-SOC-005-P03` |
| `VID` | Vídeo e campanhas audiovisuais | `PA-VID-009` |
| `WAB` | WhatsApp Business | `PA-WAB-001` |
| `WEB` | Site e arquitetura web | `PA-WEB-002` |
| **`EST`** | **Estratégia** *(área ratificada em 2026-09-10)* | `PA-EST-001` — Plano Estratégico (a criar) |
| **`AUD`** | **Auditoria e avaliação** *(área ratificada em 2026-09-10)* | `PA-AUD-001`, `PA-AUD-002`, `PA-AUD-003` (existem) · `PA-AUD-004` (a criar) |
| **`DOC`** | **Documentação e governança documental** *(área ratificada em 2026-09-10)* | `PA-DOC-001` — este plano |
| **`GOV`** | **Governança, alçadas e responsáveis** *(área ratificada em 2026-09-10)* | `PA-GOV-001` (a criar) |
| **`LGPD`** | **Proteção de dados** *(área ratificada em 2026-09-10)* | `PA-LGPD-001` (a criar) |
| **`PAUTA`** | Pauta editorial | `PA-PAUTA-008`, `PA-PAUTA-010` |

**Kits editoriais:** `PA-SOC-0SS-PPP` (SS = sprint, PPP = pauta). Mantido.
**Utensílio:** `PA-<ÁREA>-<NNN>_<Título-Com-Hifens>_v<N>.md` · Pasta: `PA-<ÁREA>-<NNN> — Título`.

---

## 5. Modelo obrigatório de documento

Todo documento novo começa com este cabeçalho, nesta ordem:

```markdown
# PA-XXX-NNN — TÍTULO DO DOCUMENTO

**Código PA:** `PA-XXX-NNN`
**Versão:** 1
**Status:** Rascunho | Em revisão | Homologado | Aprovado | Publicado | Arquivado
**Classificação:** 🟢 Público | 🟡 Interno | 🔒 Confidencial
**Dono:** [nome ou função]
**Revisão prevista:** AAAA-MM-DD
**Fontes:** [documentos e fontes externas que sustentam este documento]
**Substitui:** [código anterior, se houver]
**Data:** DD de Mês de AAAA
```

**Regras:** documento sem `Dono` e sem `Revisão prevista` é rascunho. Documento que contradiz outro documento precisa registrar a contradição no campo `Fontes` até ser resolvida.

---

## 6. Ciclo de vida e status

| Status | Significado | Quem move |
| :--- | :--- | :--- |
| **Rascunho** | Em construção; não pode ser publicado nem citado como verdade | Autor |
| **Em revisão** | Auditoria de rigor e de evidência em curso | Auditor + produção |
| **Homologado** | Correto e pronto, aguardando decisão institucional | Produção |
| **Aprovado** | Decisão institucional tomada | **Diretoria** |
| **Publicado** | Em circulação pública | Produção |
| **Arquivado** | Substituído; mantido por histórico, com aviso no topo | Produção |

**Regra dura:** material com status `Rascunho` **não** pode ser publicado, agendado ou citado em peça pública. Quando publicado por exceção, o motivo vai em ata.

---

## 7. Mapa de fonte única (SSoT)

| Assunto | Documento que manda | Documentos subordinados |
| :--- | :--- | :--- |
| Identidade visual e paleta | `PA-BRD-001` | kits, site, capas |
| Tom de voz e públicos | `caderno-mestre.md` | `PA-SOC-001`, kits, blog |
| Formatos e canais sociais | `PA-SOC-001` | kits, campanhas |
| Hierarquia de CTA e oferta | `PA-EST-004` *(a criar)* | kits, site, campanhas |
| Posicionamento e mensagem central | `PA-EST-002` *(a criar)* | `sobre.html`, `solucoes.html` |
| Estratégia geral e prioridades | `PA-EST-001` *(a criar)* | todos os planos |
| Canais, URLs e responsáveis | `PA-COM-005` | `PA-SOC-001`, kits |
| Base de contatos | `PA-CRM-001` | campanhas, CRM |
| Publicação multicanal | `PA-EDT-003` | kits, `PA-POD-001`, `PA-VID-009` |
| Métricas e UTMs | `PA-EST-006` *(a criar)* | kits, campanhas, CMS |
| Regras de evidência e citação | `PA-EDT-005` *(a criar)* | auditoria, editorial |
| Proteção de dados e base legal | `PA-LGPD-001` *(a criar)* | site, captura, CRM |
| Documentação e convenções | `PA-DOC-001` (este) | todos |

---

## 8. Índice mestre e registro

Criar `PA-IDX-001 — Índice Mestre do Centro de Operações` com uma linha por documento:

| Código | Título | Versão | Status | Dono | Última revisão | Próxima revisão | Local |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |

**Regra:** documento que não está no índice não existe oficialmente. O índice é atualizado no mesmo dia em que um documento muda de status.

---

## 9. Documentos a criar (gaps priorizados)

| Prioridade | Código | Documento | Por que existe | Origem |
| :-- | :--- | :--- | :--- | :--- |
| **P1** | `PA-EST-001` | Plano Estratégico (v2) | Hoje a estratégia não é versionada nem auditável | Sprint A1, item A1-14 |
| **P1** | `PA-IDX-001` | Índice Mestre | Sem índice não há SSoT | Este plano, §8 |
| **P1** | `PA-LGPD-001` | Registro de tratamento, base legal e retenção | Exigência prática de LGPD; hoje só existe página pública | Achado nº 8 |
| **P2** | `PA-EST-002` | Posicionamento e mensagem central | Consolida `sobre`, caderno-mestre e `solucoes` | Sprint A1, A1-01 |
| **P2** | `PA-EST-003` | Público, segmentação e priorização | Evita comunicar para "todo mundo" | Sprint A1, A1-02 |
| **P2** | `PA-EST-004` | Arquitetura de oferta e funil | Explicita o caminho do diagnóstico à formação | Sprint A1, A1-03 |
| **P2** | `PA-EST-006` | Plano de mensuração, KPIs e padrão de UTM | Padroniza `utm_campaign` (hoje há dois padrões) | Sprint A1, A1-08 |
| **P2** | `PA-AUD-004` | Registro de pareceres e dívida editorial | Rastreia o que foi auditado e o que falta corrigir | Sprint A1 |
| **P3** | `PA-EST-005` | Plano de canais e cadência | Volume compatível com capacidade real | Sprint A1, A1-06/A1-12 |
| **P3** | `PA-GOV-001` | Matriz de responsáveis e alçadas | Hoje espalhada em `PA-COM-005` §5 | Achado nº 5 |
| **P3** | `PA-EDT-005` | Guia de evidências e citação | Liga auditoria e produção editorial | `caderno-mestre` §Regras de evidência |
| **P3** | `PA-COM-006` | Manual de crise e resposta reputacional | Não existe resposta pronta para incidente | `PA-AUD-002` §Riscos |
| **P4** | `PA-GOV-002` | Política de retenção e arquivamento | Evita acúmulo e perda de histórico | Política 3-2-1 + LGPD |

---

## 10. Ligação com o auditor

Cada documento novo passa a ter três campos que o auditor usa diretamente:

- **`Fontes`** → o auditor confere se a afirmação está nelas.
- **`Status`** → o auditor só aprova publicação de `Aprovado` ou `Publicado`.
- **`Revisão prevista`** → vencida há mais de 90 dias, o auditor marca `DOCUMENTO VENCIDO` no parecer.

**Fluxo completo:**

> Produção escreve → documento entra no índice → auditor avalia (protocolo `P4`/`P9`) → produção corrige → diretoria aprova → produção publica → índice atualizado → dívida editorial registrada em `PA-AUD-004`.

---

## 11. Classificação e acesso

| Classificação | Conteúdo | Onde pode ficar |
| :--- | :--- | :--- |
| 🟢 **Público** | Site, blog, Biblioteca Viva, materiais educativos, kits publicados | Repositório do site + Drive |
| 🟡 **Interno** | Planos, calendários, kits em rascunho, relatórios de sprint | Drive, acesso por grupo institucional |
| 🔒 **Confidencial** | Inventário de canais, acessos, dados de contatos, contratos, atas | Drive restrito à diretoria; **nunca** em repositório público |

**Regra absoluta:** nenhum documento, em nenhuma classificação, contém senha, token, chave de API ou credencial. Custódia fica no gestor de senhas (`PA-COM-005` §4).

---

## 12. Manutenção, backup e continuidade

| Rotina | Periodicidade | Responsável |
| :--- | :--- | :--- |
| Revisar documentos com `Revisão prevista` vencida | Mensal | Produção editorial |
| Atualizar `PA-IDX-001` | A cada mudança de status | Produção |
| Revisar Camada 4 das fontes externas (tendências) | 90 dias | Coordenação de comunicação |
| Revisar canais, responsáveis e custódia | Trimestral | Diretoria |
| Backup em 3-2-1 das pastas `01`, `03`, `04`, `09` | Semanal | Responsável de TI |
| Teste de restauração | Trimestral | Responsável de TI |
| Auditoria de documentação (protocolo `P4` no acervo) | Semestral | Auditor |

---

## 13. Critérios de aceite da documentação

- [ ] Todo documento tem código, dono, status, classificação e revisão prevista.
- [ ] Todo assunto do §7 tem exatamente um documento mandante.
- [ ] Todo documento está em `PA-IDX-001`.
- [ ] Nenhuma pasta órfã fora da estrutura do §3.
- [x] Achados nº 1 e 2 resolvidos em 2026-09-10 (§15.2).
- [ ] Achado nº 3 (`99_DUPLICADOS_PARA_REVISAO`) triado com prazo declarado.
- [ ] Achado nº 9 resolvido: apenas o repositório canônico publica em `projetoanonimo.org`.
- [ ] Nenhuma credencial em documento.
- [ ] Nenhum material `Rascunho` publicado ou citado.
- [ ] Toda afirmação técnica, jurídica ou numérica com fonte rastreável.

---

## 14. Anti-padrões (o que não fazer)

1. Criar documento novo para resolver dúvida que pertence a documento existente.
2. Copiar um documento para editá-lo "na cópia" — viola a fonte única.
3. Deixar `[PREENCHER]` indefinidamente sem dono e sem prazo.
4. Publicar material em `Rascunho` "só para testar".
5. Guardar planilha de trabalho fora do índice e tratá-la como verdade.
6. Renomear arquivo sem atualizar as referências nos kits, no índice e nas UTMs.
7. Registrar decisão apenas em conversa, sem ata nem documento.
8. Duplicar um repositório inteiro em vez de versionar o existente.

---

## 15. Decisões ratificadas

### 15.1 Ratificação de códigos e áreas — 2026-09-10

| Código | Documento | Status | Local |
| :--- | :--- | :--- | :--- |
| `PA-AUD-001` | Prompt-mestre do Auditor de Estratégia e Marketing | Homologado | `docs/editorial/notebooklm/prompt-auditor-estrategia-marketing.md` |
| `PA-AUD-002` | Catálogo de Fontes Externas de Referência | Homologado | `docs/editorial/notebooklm/fontes-externas-referencia.md` |
| `PA-AUD-003` | Sprint de Avaliação Estratégica e de Marketing (Sprint A1) | Homologado | `docs/editorial/notebooklm/sprint-auditoria-01.md` |
| `PA-DOC-001` | Plano de Documentação do Projeto Anônimo | Aprovado | `docs/editorial/notebooklm/plano-documentacao-projeto.md` |

**Áreas incorporadas à taxonomia do §4:** `EST`, `AUD`, `DOC`, `GOV`, `LGPD`.
Nenhum código é reutilizado; a numeração segue a partir do último número usado em cada área.

### 15.2 Repositório canônico — 2026-09-10

**Decisão:** `projetoanonimo.org-gtm-global-v1` é o **repositório canônico vigente** do Projeto Anônimo.

**Consequências já aplicadas:**

- `projetoanonimo.org-canonico`, `projetoanonimo.org-brand-system-v1` e `projetoanonimo.org-framework-cliente0-v1` receberam `00-STATUS-DESTE-REPOSITORIO.md` na raiz, declarando status de arquivo histórico e apontando para o canônico.
- O `README.md` do repositório canônico passou a declarar-se canônico no topo.
- A documentação editorial vigente é a de `projetoanonimo.org-gtm-global-v1/docs/editorial/notebooklm/`.

**Regras decorrentes:**

1. Toda edição nova acontece no canônico.
2. Nada é criado ou alterado nos repositórios arquivados.
3. Divergência entre canônico e arquivado resolve-se **sempre** a favor do canônico.
4. Os repositórios arquivados não entram no `PA-IDX-001` como fonte; entram apenas como registro histórico.

**Pendências abertas (exigem decisão separada):**

| # | Pendência | Risco se não resolvida | Responsável |
| :-- | :--- | :--- | :--- |
| 1 | Desativar o GitHub Pages **ou** remover o `CNAME` dos três repositórios arquivados | Um repositório arquivado pode sobrescrever `projetoanonimo.org` | Diretoria / TI |
| 2 | Decidir entre congelar ou excluir os três arquivados | Acúmulo de cópias divergentes e de histórico enganoso | Diretoria |
| 3 | Conferir qual publicação está de fato ativa hoje no GitHub Pages | Não se sabe a origem real do site em produção | TI |
| 4 | Registrar estas decisões na ata da diretoria | Decisão sem ata viola o §14, item 7, deste plano | Diretoria |

### 15.3 Próximas decisões esperadas

1. Data de início da Sprint A1 (`PA-AUD-003`).
2. Dono **nomeado** (pessoa, não função) para `PA-AUD-001`, `PA-AUD-002` e `PA-DOC-001`.
3. Criação de `PA-IDX-001` — Índice Mestre do Centro de Operações.
4. Criação de `PA-LGPD-001` — Registro de tratamento, base legal e retenção.
5. Definição do padrão único de `utm_campaign` (hoje há dois padrões em uso no acervo: `sprint01_pautaNN` e `PA-VID-009_v1`).
