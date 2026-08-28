# Evidências da homologação local — Sprint C0.1 / Cliente 0

## Identificação

- Data e hora: 2026-08-28 00:26:31 -03:00
- Branch: `feature/framework-cliente0-v1`
- Commit-base: `03e16a3`
- Ambiente: simulador local isolado, sem conexão com produção
- Massa: exclusivamente sintética
- Executor: suíte automatizada `tests/cliente0-homologacao.test.cjs`

## Resultado

| Caso | Resultado local | Evidência sanitizada |
|---|---|---|
| C0-01 | APROVADO_LOCAL | Credencial sintética autorizada aceita |
| C0-02 | APROVADO_LOCAL | Credencial externa sintética bloqueada com `FORBIDDEN` |
| C0-03 | APROVADO_LOCAL | Rascunho `cliente-0-teste-sintetico` criado |
| C0-04 | APROVADO_LOCAL | Resumo sintético persistiu após reabertura |
| C0-05 | APROVADO_LOCAL | Capa sintética direcionada ao destino `CAPAS` |
| C0-06 | APROVADO_LOCAL | PDF direcionado a `REVISAO`; anexo direcionado a `ANEXOS` |
| C0-07 | APROVADO_LOCAL | Material sintético publicado e retornado pela API simulada |
| C0-08 | APROVADO_LOCAL | Navegador local: 6 itens iniciais, 8 após carregar mais, ordenação Z–A e zero erro de console |
| C0-09 | APROVADO_LOCAL | Visualização aceita sem persistir identificador de sessão |
| C0-10 | APROVADO_LOCAL | Repetição limitada e tipo inválido rejeitado |
| C0-11 | APROVADO_LOCAL | Material arquivado e removido da listagem pública simulada |
| C0-12 | APROVADO_LOCAL | Sessão removida e redirecionamento ao login confirmado |

Resultado agregado: **12/12 casos aprovados na camada local simulada**.

Evidência visual do C0-08:
`evidencia-c0-08-biblioteca-local.png` (1440 × 2757 px; SHA-256
`74B54406475FA08125875AD95F15A34D557FEFFECC01C4F706A36C0848BC9B73`).

## Limites da evidência

Esta execução não comprova:

- autenticação real pelo Google Identity Services;
- permissões reais da planilha e das pastas do Google Drive;
- upload físico e compartilhamento de arquivos no Drive;
- implantação real do Apps Script e resposta de uma URL `/exec` de teste;
- comportamento em navegadores e dispositivos reais;
- autorização para uso de dados de cliente.

Esses pontos permanecem como **PENDENTE_EXTERNO** e exigem ambiente Google de
homologação separado, além de autorização específica para criar/configurar e
implantar esse ambiente.

## Reprodução

Na raiz do worktree isolado, execute:

```powershell
node tests\cliente0-homologacao.test.cjs
```

O processo deve terminar com `12/12 casos locais aprovados` e código de saída
zero.
