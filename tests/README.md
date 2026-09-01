# Testes da candidata editorial

Execute na raiz do pacote:

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
