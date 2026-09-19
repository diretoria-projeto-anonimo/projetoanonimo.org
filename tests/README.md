# Testes da candidata editorial

Execute na raiz do pacote:

node tests\inbound-funnel.test.cjs
node tests\inbound-e2e.test.cjs
node tests\inbound-preview.test.cjs
```powershell
node tests\apps-script.test.cjs
node tests\frontend-contract.test.cjs
node tests\biblioteca-sprint-2.1.test.cjs
node tests\material-renderer.test.cjs
node tests\checklist-pilot.test.cjs
node tests\cliente0-homologacao.test.cjs
node tests\diagnostico-campanha-01.test.cjs
```

O primeiro executa `Code.gs` com serviços Google simulados e cobre:

- autenticação aceita, expirada/inválida e e-mail não permitido;
- listagem editorial e isolamento da API pública;
- abertura, atualização e criação de materiais;
- preservação de arquivos numa atualização parcial;
- conflito de slug e upload.
- registro público restrito, limitação de duplicidade e rejeição de métricas
  inválidas ou associadas a rascunhos;
- agregação autenticada das métricas para o Dashboard.

O segundo confirma o contrato da interface: scripts de autenticação, proteção
das páginas, ações do dashboard e modo de edição do formulário.

Os demais cobrem os contratos de Biblioteca (sprint 2.1), renderer da página de
material, piloto 02 (checklist de diagnóstico digital), os 12 casos do roteiro
do Cliente 0 (homologação local com massa sintética) e os contratos da Campanha
01 (sete etapas, IDs únicos, ordem dos scripts, atribuição, separação de
respostas e consentimentos, arrays via `FormData.getAll`, idempotência, retry
com o mesmo `event_id`, bloqueio de política pendente, filtro de PII e presença
do vídeo oficial).

Além dos testes automatizados, a interface foi homologada no navegador com uma
API local simulada: listou publicado e rascunho, reabriu o rascunho, preencheu
o formulário, alterou o resumo/status, salvou e atualizou os indicadores.

## Testes do funil inbound

Os três últimos arquivos cobrem o caminho
`Blog / Podcast / Biblioteca -> CTA -> Diagnóstico Organizacional`.

`inbound-funnel.test.cjs` verifica, sem rede:

- GTM presente exatamente uma vez, sem ID conflitante, em todas as páginas públicas;
- consentimento padrão negado, declarado antes do carregamento do GTM;
- ordem das dependências `config.js` -> `attribution.js` -> `inbound.js` nas páginas de entrada;
- captura dos cinco campos UTM, preservação até o Diagnóstico e atualização apenas
  por parâmetro explícito, com `first_seen_at` e `referrer` originais mantidos;
- ausência de PII no armazenamento de atribuição e no `dataLayer`;
- contrato dos eventos do funil, incluindo idempotência de `diagnostic_submit` e
  filtro de PII do módulo de tracking;
- rota canônica `diagnostico-organizacional.html` em todos os CTAs.

`inbound-e2e.test.cjs` executa os módulos reais sobre um DOM mínimo e um `fetch`
substituído: entrada no Blog com UTM, clique até a etapa 7, envio sintético e
quatro cenários (aceite, envio duplicado, falha de transporte, recusa do servidor
e rejeição por validação). Comprova que a campanha de origem chega ao payload e
que nenhum dado pessoal alcança o `dataLayer`. Nenhuma requisição real é feita.

`inbound-preview.test.cjs` sobe um servidor estático em `127.0.0.1` e confirma
por HTTP real que cada página pública responde 200 em `pt-BR`, que o GTM servido
aparece uma única vez e que todo script, folha de estilo e destino de CTA local
resolve sem rota quebrada.

Estes testes **não** substituem verificação em navegador: layout, foco visível,
navegação por teclado e o comportamento do GTM em runtime permanecem pendentes de
homologação humana.
