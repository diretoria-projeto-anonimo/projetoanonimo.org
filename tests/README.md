# Testes da candidata editorial

Execute na raiz do pacote:

```powershell
node tests\apps-script.test.cjs
node tests\frontend-contract.test.cjs
node tests\biblioteca-sprint-2.1.test.cjs
node tests\material-renderer.test.cjs
node tests\checklist-pilot.test.cjs
node tests\cliente0-homologacao.test.cjs
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

O terceiro confirma os contratos da Sprint C0.1: ordenação, filtros persistentes,
carregamento progressivo, estados de carregamento/erro e manifesto reproduzível
do Apps Script.

O quarto confirma o contrato do renderer da página de material, incluindo
Markdown seguro, metadados e versões de cache.

O quinto valida o piloto 02 com o conteúdo editorial real: cinco dimensões,
25 itens, 100 opções acessíveis, grupos independentes, ausência de coleta ou
persistência e ativação restrita ao slug do Checklist de Diagnóstico Digital.

O sexto executa os 12 casos do roteiro do Cliente 0 com serviços Google
simulados e massa exclusivamente sintética. O resultado é uma homologação local;
ele não substitui a validação em uma implantação externa de teste.

Além dos testes automatizados, a interface foi homologada no navegador com uma
API local simulada: listou publicado e rascunho, reabriu o rascunho, preencheu
o formulário, alterou o resumo/status, salvou e atualizou os indicadores.
