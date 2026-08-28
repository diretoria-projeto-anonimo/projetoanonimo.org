# Roteiro de homologação — Sprint C0.1 / Cliente 0

## Objetivo

Validar o fluxo completo do framework editorial em ambiente isolado, usando
somente dados sintéticos. Este roteiro não autoriza deploy, publicação pública,
uso de dados reais nem contato com clientes.

## Gate de entrada

Antes de iniciar, confirme e registre:

- [ ] planilha exclusiva de homologação;
- [ ] pastas exclusivas no Drive para capas, anexos, publicados e revisão;
- [ ] implantação de teste do Apps Script, separada da produção;
- [ ] conta Google de teste presente em `ALLOWED_EDITOR_EMAILS`;
- [ ] `GOOGLE_CLIENT_ID` e URL `/exec` pertencentes ao ambiente de teste;
- [ ] execução de `diagnosticarConfiguracao` com `"ok": true` e sem faltantes;
- [ ] nenhum dado pessoal real nos arquivos, formulários ou planilhas de teste.

Se qualquer condição falhar, interrompa a homologação.

## Massa de dados sintética

Use identificadores claramente fictícios:

- título: `Material Cliente 0 — Teste Sintético`;
- slug: `cliente-0-teste-sintetico`;
- autor: `Equipe de Homologação`;
- resumo: `Registro sintético criado exclusivamente para validar o framework.`;
- arquivo, capa e anexo: documentos sem nomes, imagens, e-mails ou dados reais.

## Casos de teste

| ID | Fluxo | Resultado esperado | Evidência mínima |
|---|---|---|---|
| C0-01 | Login permitido | Dashboard abre para a conta autorizada | captura sem e-mail visível |
| C0-02 | Login não permitido | Acesso editorial é negado | mensagem de bloqueio |
| C0-03 | Criar rascunho | Registro sintético recebe status de rascunho | ID/slug e horário |
| C0-04 | Reabrir e editar | Resumo alterado persiste após nova leitura | antes/depois sem PII |
| C0-05 | Upload de capa | URL e prévia da capa sintética ficam disponíveis | nome técnico do arquivo |
| C0-06 | Upload de PDF/anexo | Arquivos aparecem no registro correto | IDs técnicos, sem link privado público |
| C0-07 | Publicar no ambiente de teste | Material passa a ser retornado pela API de teste | resposta sanitizada |
| C0-08 | Biblioteca Viva | Busca, filtros, ordenação e carregar mais funcionam | captura da interface |
| C0-09 | Métrica pública | Evento válido incrementa o resumo agregado | tipo, material e horário |
| C0-10 | Abuso de métrica | Evento inválido ou repetido é rejeitado/limitado | resposta sanitizada |
| C0-11 | Arquivar | Material deixa a listagem pública de teste | estado antes/depois |
| C0-12 | Sair | Sessão é encerrada e página protegida exige novo login | captura do redirecionamento |

## Registro de evidências

O ensaio automatizado local está registrado em
`EVIDENCIAS-HOMOLOGACAO-LOCAL.md`. Ele valida os contratos com serviços Google
simulados, mas não substitui a execução deste quadro em uma implantação externa
de teste.

| Caso | Data/hora | Executor | Resultado | Evidência | Observação |
|---|---|---|---|---|---|
| C0-01 |  |  | Pendente |  |  |
| C0-02 |  |  | Pendente |  |  |
| C0-03 |  |  | Pendente |  |  |
| C0-04 |  |  | Pendente |  |  |
| C0-05 |  |  | Pendente |  |  |
| C0-06 |  |  | Pendente |  |  |
| C0-07 |  |  | Pendente |  |  |
| C0-08 |  |  | Pendente |  |  |
| C0-09 |  |  | Pendente |  |  |
| C0-10 |  |  | Pendente |  |  |
| C0-11 |  |  | Pendente |  |  |
| C0-12 |  |  | Pendente |  |  |

## Limpeza e retorno seguro

1. Arquive ou remova somente os registros sintéticos identificados neste roteiro.
2. Remova somente os arquivos sintéticos das pastas exclusivas de homologação.
3. Preserve os registros técnicos necessários para auditoria, sem PII.
4. Não reutilize credenciais, URLs ou IDs do ambiente de teste em produção.
5. Registre falhas como pendências; não contorne autenticação ou validações.

## Gate de saída

A Sprint C0.1 pode ser considerada tecnicamente homologada somente quando os
12 casos estiverem aprovados e as evidências tiverem sido revisadas por uma
pessoa responsável. O uso com cliente real permanece bloqueado até aprovação
jurídica, operacional e de proteção de dados.
