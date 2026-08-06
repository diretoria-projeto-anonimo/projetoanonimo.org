# Testes da candidata editorial

Execute na raiz do pacote:

```powershell
node tests\apps-script.test.cjs
node tests\frontend-contract.test.cjs
```

O primeiro teste executa `Code.gs` com serviços Google simulados e cobre:

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

Além dos testes automatizados, a interface foi homologada no navegador com uma
API local simulada: listou publicado e rascunho, reabriu o rascunho, preencheu
o formulário, alterou o resumo/status, salvou e atualizou os indicadores.
