# PA-WEB-002 — Auditoria de Conformidade e Mapa de Implementação

**Código do ativo:** PA-WEB-002
**Versão da proposta:** v0.2
**Data da auditoria:** 2026-09-03
**Status:** PROPOSTA REVISADA — AGUARDANDO APROVAÇÃO HUMANA
**Escopo:** reconciliar a documentação do site com as rotas, CTAs e metadados
existentes no workspace canônico, sem publicar ou alterar documentos do Drive.
**Ambiente da evidência:** `C:\Users\Martins-note\Documents\PA\projetoanonimo.org-canonico`
**Backup pré-edição:** `D:\Projetos\PA\backup-pa-web-002-20260903-142903`

## A. Matriz final

| Ativo/documento | Evidência exata | Resultado da auditoria | Decisão nesta proposta |
| --- | --- | --- | --- |
| PA-WEB-002 v0.2 — esta proposta | Este arquivo, no workspace canônico | Documento de reconciliação documental; não aprovado para produção | Aguardar aprovação humana |
| PA-WEB-002 — Texto Mestre do Site | [Documento no Drive](https://drive.google.com/a/projetoanonimo.org/open?id=1RbvGPOrkzoPGjwJqPs2_VXKMHWu7alxZo7pmnaVX0M8) | Íntegro, SEO parcial e não truncado | Alinhamento local preparado; oficializar/publicar somente após aprovação |
| PA-WEB-002 — Conteúdo Completo do Website v0.1.0 | [Documento no Drive](https://drive.google.com/a/projetoanonimo.org/open?id=1Av0IhKWnrq-LeN5Zs0VQz5Jdv-eWEcSMvOWYPkNZ_IA) | Histórico útil, mas declara Squarespace e não representa a infraestrutura física atual | Não arquivar nem renomear nesta etapa |
| PA-COM-001 — Mensagens de Lançamento e Relacionamento | [Documento no Drive](https://drive.google.com/a/projetoanonimo.org/open?id=15uDJyRb9Yls0pXe8HvZztpzuI0CKaeQdJkWnQoZBAsM) | Confirmado; código compartilhado com o plano de estratégia | Manter intacto |
| PA-COM-001 — Estratégia de Comunicação | [Documento no Drive](https://drive.google.com/a/projetoanonimo.org/open?id=1TWlY-ZOmphSMlTU3FQrPqNl5c9CGr7KifuVrz_-YLkw) | Confirmado; escopo distinto das mensagens | Manter intacto |
| Site estático atual | Arquivos HTML, CSS e JavaScript no workspace | Presença local confirmada | Não confundir com publicação confirmada em GitHub Pages |
| Biblioteca Viva | `biblioteca.html` + `assets/js/main.js` | Carregamento dinâmico confirmado: `fetch` da API, cache local, modo offline e carregamento progressivo por “carregar mais” | Preservar implementação existente |

Os quatro documentos do Drive acima são as referências exatas utilizadas nesta
reconciliação. Nenhum deles foi editado, renomeado, movido, arquivado ou
publicado.

## B. Mapa de rotas físicas

As rotas abaixo foram conferidas como arquivos locais. A existência local não é,
por si só, prova de que a mesma versão esteja publicada no GitHub Pages.

| Rota pública pretendida | Arquivo físico | Situação local | Observação |
| --- | --- | --- | --- |
| `/` | `index.html` | Confirmado | Página inicial |
| `/sobre.html` | `sobre.html` | Confirmado | Quem somos e princípios |
| `/projetos.html` | `projetos.html` | Confirmado | Portfólio |
| `/solucoes.html` | `solucoes.html` | Confirmado | Eixos e soluções |
| `/biblioteca.html` | `biblioteca.html` | Confirmado | Acervo carregado dinamicamente |
| `/biblioteca/material.html` | `biblioteca/material.html` | Confirmado | Detalhe de material |
| `/blog.html` | `blog.html` | Confirmado | Índice editorial |
| `/blog/…` | Arquivos em `blog/` | Confirmado para os arquivos existentes | Artigos e rascunhos possuem níveis diferentes de prontidão |
| `/podcast.html` | `podcast.html` | Confirmado | Hub Vozes da Soberania Digital |
| `/diagnostico-organizacional.html` | `diagnostico-organizacional.html` | Confirmado | Fluxo próprio de diagnóstico e consentimento |
| `/captura-diagnostico.html` | `captura-diagnostico.html` | Confirmado | Landing page de interesse |
| `/contato.html` | `contato.html` | Confirmado | Formulário oficial de contato |
| `/transparencia.html` | `transparencia.html` | Confirmado | Governança e documentos |
| `/privacidade.html` | `privacidade.html` | Confirmado | Política de privacidade |
| `/termos.html` | `termos.html` | Confirmado | Termos de uso |
| `/404.html` | `404.html` | Confirmado | Fallback de rota |

O `sitemap.xml` foi corrigido localmente para listar `podcast.html` (em vez de
`/podcast`) e passou a incluir `captura-diagnostico.html`. Isso apenas prepara o
arquivo para uma futura publicação; não houve deploy.

## C. CTAs implementados

| Página | Texto do CTA | Destino atual | Evidência/estado |
| --- | --- | --- | --- |
| `index.html` | Conheça os projetos | `projetos.html` | Implementado |
| `index.html` | Explore a Biblioteca Viva | `biblioteca.html` | Implementado |
| `index.html` | Demonstrar interesse | `https://forms.gle/RLKBMdGUwDKMPmWy9` | Implementado; formulário oficial |
| `index.html` | Fale com a equipe | `contato.html` | Implementado |
| `biblioteca.html` | Fale com a equipe | `contato.html` | Implementado |
| `contato.html` | Abrir formulário oficial | `https://forms.gle/RLKBMdGUwDKMPmWy9` | Implementado; formulário oficial |
| `captura-diagnostico.html` | Demonstrar interesse | `https://forms.gle/RLKBMdGUwDKMPmWy9` | Implementado; formulário oficial |
| `podcast.html` | Conhecer o Diagnóstico Organizacional | `diagnostico-organizacional.html?utm_source=site&utm_medium=podcast_hub&utm_campaign=bottom_cta` | Implementado; CTA neutro e rastreável |
| `podcast.html` | Diagnóstico / Fazer Diagnóstico | `diagnostico-organizacional.html` | Implementado nos cabeçalhos e cartões |
| `diagnostico-organizacional.html` | Fazer meu diagnóstico | `#form-diagnostico` | Implementado como fluxo próprio da página; não substituído pelo formulário externo |

O formulário oficial usado nos CTAs de interesse é exatamente:
`https://forms.gle/RLKBMdGUwDKMPmWy9`.

## D. CTAs documentados, mas não implementados

Os rótulos abaixo aparecem como intenção, proposta ou referência nos materiais
editoriais, mas não foram encontrados como CTAs ativos nas páginas auditadas:

| CTA/documentação | Classificação | Próxima decisão necessária |
| --- | --- | --- |
| “Quero acompanhar” | Proposta futura | Definir canal, consentimento e rotina antes de implementar |
| “INICIAR DIAGNÓSTICO GRATUITO” | Promessa comercial pendente | Confirmar modelo comercial e escopo; não usar como promessa ativa |
| “Acesse os conteúdos” | Documentado, sem implementação canônica | Mapear para Biblioteca ou Blog após aprovação editorial |
| “Baixe o material” | Documentado, sem implementação canônica | Associar a um ativo público específico e testar o destino |
| “Receba novidades” | Documentado, sem implementação canônica | Definir base, consentimento e mecanismo de descadastro |
| Links de episódios do Podcast | Pendente | Informar URLs oficiais de cada episódio antes de alterar cartões |
| Spotify e Apple Podcasts | Pendente | Substituir os domínios genéricos pelos links reais do programa |
| YouTube do Podcast | Parcialmente disponível | O canal está linkado; falta confirmar a playlist/programa oficial |

O CTA antigo do rodapé do `podcast.html` que usava “INICIAR DIAGNÓSTICO
GRATUITO” foi trocado localmente por “Conhecer o Diagnóstico Organizacional”. A
classificação de promessa pendente continua registrada porque o compromisso
comercial não foi validado pela governança.

## E. Inconsistências técnicas

1. **Podcast e rota histórica:** a versão anterior do `podcast.html` apontava o
   CTA para `/diagnostico` com uma promessa de gratuidade. A rota física válida é
   `diagnostico-organizacional.html`; a referência antiga foi corrigida no
   workspace e não permanece no CTA atual. O registro histórico é mantido aqui
   para auditoria.
2. **Sitemap:** o `sitemap.xml` listava `https://projetoanonimo.org/podcast`,
   embora o arquivo físico seja `podcast.html`. A entrada foi ajustada
   localmente. A URL pública só estará confirmada após uma publicação futura e
   um teste externo.
3. **Plataforma declarada:** o documento histórico PA-WEB-002 Conteúdo Completo
   declara Squarespace, mas a evidência física atual é um site estático em HTML,
   CSS e JavaScript, preparado para GitHub Pages.
4. **Presença local versus publicação:** “arquivo encontrado no workspace” é
   evidência de presença local. Não equivale a commit, push, publicação ou
   disponibilidade da mesma versão no GitHub Pages.
5. **Biblioteca dinâmica:** `biblioteca.html` não é uma lista puramente estática.
   `assets/js/main.js` confirma `fetch` da API, cache em `localStorage`, fallback
   offline e paginação progressiva. Qualquer alteração editorial precisa
   preservar esses contratos.
6. **Formulários:** os três CTAs de interesse usam o formulário oficial curto.
   A página `diagnostico-organizacional.html` mantém um fluxo próprio com
   consentimento e scripts de diagnóstico; não foi redirecionada sem uma decisão
   explícita sobre o impacto no CRM e na governança.
7. **Identificador PA-COM-001:** mensagens e estratégia continuam distintos,
   embora compartilhem o código no Drive. Esta proposta não renomeia nenhum
   ativo e não cria o código PA-SOC.
8. **SEO parcial de origem:** o Texto Mestre do Site foi classificado como
   íntegro, SEO parcial e não truncado. A normalização aplicada às páginas
   públicas não transforma o documento do Drive em uma versão aprovada nem
   elimina a necessidade de revisão editorial.

## F. Proposta PA-WEB-002 v0.2

### F.1. Fonte de verdade e escopo

Esta proposta usa os quatro documentos do Drive listados na matriz A e a leitura
dos arquivos físicos do workspace canônico. Ela cobre rotas públicas, CTAs,
metadados básicos de SEO, o hub do Podcast e a relação com o formulário oficial.
Seu status é **PROPOSTA REVISADA — AGUARDANDO APROVAÇÃO HUMANA**; não está em
produção e não deve ser tratada como documento normativo aprovado.

### F.2. Metadados SEO aplicados localmente

| Arquivo | `<title>` local | Meta description local |
| --- | --- | --- |
| `index.html` | Projeto Anônimo \| Tecnologia, IA, Robótica e Transformação Digital | Soluções abertas em inteligência artificial, cultura maker, robótica educacional e transformação digital para organizações da sociedade civil e comunidades. |
| `sobre.html` | Sobre o Projeto Anônimo \| Tecnologia com Propósito | Conheça a missão, os princípios e a forma de atuação do Projeto Anônimo em educação tecnológica, inovação social e transformação digital. |
| `projetos.html` | Projetos e Portfólio \| Projeto Anônimo | Conheça projetos de robótica, inteligência artificial, cultura maker e transformação digital para escolas, organizações e comunidades. |
| `solucoes.html` | Soluções e Eixos Formativos \| Projeto Anônimo | Soluções em inteligência artificial, robótica, Google Workspace, formação e transformação digital construídas a partir da realidade de cada organização. |
| `biblioteca.html` | Conteúdos e Biblioteca Viva \| Projeto Anônimo | Guias, checklists, modelos e materiais abertos sobre inteligência artificial, educação tecnológica, segurança digital e transformação social. |
| `blog.html` | Blog de Inovação Aberta \| Projeto Anônimo | Artigos e guias práticos sobre tecnologia social, governança digital, oportunidades, educação e transformação para organizações e comunidades. |
| `podcast.html` | Podcast Vozes da Soberania Digital \| Projeto Anônimo | Ouça o podcast do Projeto Anônimo: debates práticos sobre inteligência artificial responsável, automação ética, governança no Google Workspace e editais no terceiro setor. |
| `contato.html` | Contato Institucional \| Projeto Anônimo | Fale com o Projeto Anônimo, solicite informações, proponha parcerias e conheça o formulário oficial de contato. |
| `captura-diagnostico.html` | Diagnóstico Digital Preliminar \| Projeto Anônimo | Conheça o Diagnóstico Digital Preliminar para identificar gargalos e orientar prioridades de transformação digital em organizações sociais. |
| `diagnostico-organizacional.html` | Diagnóstico Organizacional Inteligente — Projeto Anônimo | Identifique gargalos, prioridades e oportunidades em processos, produtividade, IA e capacidade institucional. |
| `privacidade.html` | Política de Privacidade \| Projeto Anônimo | Conheça as diretrizes de privacidade e proteção de dados do Projeto Anônimo. |
| `termos.html` | Termos de Uso \| Projeto Anônimo | Consulte os termos de uso do site e as condições gerais de participação do Projeto Anônimo. |
| `transparencia.html` | Transparência e Governança \| Projeto Anônimo | Acesse informações públicas sobre governança, documentação, projetos e evolução do Projeto Anônimo. |

Os campos Open Graph das páginas que já os possuíam foram alinhados aos títulos
e descrições acima. Nenhuma alteração foi feita em scripts `.gs`, no CRM ou em
formulários.

### F.3. Decisões editoriais incorporadas

- O Podcast permanece como página dedicada em `podcast.html`.
- O CTA de conversão do Podcast leva a
  `diagnostico-organizacional.html`, que é a rota escolhida para o diagnóstico.
- A expressão de gratuidade não é usada como CTA ativo.
- CTAs de interesse institucionais apontam para o formulário oficial curto.
- A Biblioteca Viva conserva carregamento por API, cache local e carregamento
  progressivo.
- Os arquivos do Drive continuam somente como referências; esta proposta não
  os modifica.

## G. Alterações futuras condicionadas à aprovação humana

1. Receber e validar os links reais do programa no YouTube, Spotify e Apple
   Podcasts, além das URLs de cada episódio; somente então completar os cartões
   do `podcast.html`.
2. Confirmar se o fluxo próprio de `diagnostico-organizacional.html` deve
   continuar separado do formulário oficial ou ser substituído; qualquer escolha
   exige revisão de consentimento, CRM e testes de ponta a ponta.
3. Revisar e, se aprovado, normalizar metadados SEO dos artigos em `blog/` e do
   detalhe `biblioteca/material.html`, preservando os arquivos de rascunho e o
   conteúdo editorial já existente.
4. Homologar as rotas externas (`podcast.html`,
   `captura-diagnostico.html` e o formulário) em ambiente publicado, pois a
   verificação local não comprova disponibilidade pública.
5. Registrar a separação lógica de escopo entre PA-COM-001 Estratégia e PA-COM-001
   Mensagens na governança do Drive, sem renomear os arquivos nesta etapa.
6. Reexecutar testes de contrato, validação de links, `git diff --check` e
   revisão humana antes de qualquer commit, push, pull request, merge ou deploy.
7. Qualquer publicação no GitHub Pages, alteração no Drive, formulário, CRM,
   automação ou campanha requer autorização específica posterior.

**Controle de mudança desta proposta:** somente alterações locais no workspace
canônico foram preparadas; não houve commit, push, pull request, merge, deploy,
edição no Drive, alteração de formulário ou alteração no CRM.
