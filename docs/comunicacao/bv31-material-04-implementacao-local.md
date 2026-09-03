# BV-3.1-004 — registro de implementação controlada

**Data:** 30/08/2026
**Estado:** IMPLEMENTADO E HOMOLOGADO LOCALMENTE — NÃO PUBLICADO
**Branch:** `feature/bv31-pilot-04-plano-30-dias`
**Material:** Plano de 30 Dias para Organização Digital

## Escopo implementado

- promessa orientada a organizar uma área-piloto sem interromper o trabalho;
- quatro semanas com exatamente 16 ações e entregáveis verificáveis;
- limites contra exclusão em massa, compartilhamento de senhas, uso de PII e mudanças irreversíveis;
- CTA principal `Montar o plano de 30 dias` apontando para `#preparar`;
- próximo passo para o Checklist de Diagnóstico Digital já publicado;
- ausência de formulário, pontuação, envio ou persistência;
- fallback editorial para território, jornada, CTA, capa e progressão;
- cache do renderer atualizado para `material.js?v=2.1` e catálogo para `main.js?v=1.8`;
- teste específico de conteúdo, privacidade, capa e contrato de progressão.

## Capa v2

A capa foi gerada com OpenAI a partir do sistema visual dos materiais anteriores. A composição apresenta quatro zonas semanais conectadas e um calendário abstrato com 30 marcações em uma mesa de trabalho.

Não há rostos, pessoas, mãos, partes do corpo, texto legível, números, PII, marcas, interfaces reconhecíveis ou marca-d'água.

- PNG mestre: 1536 × 1024 px, 2.341.577 bytes, SHA-256 `AFEEE12A7D0CD42C791779E249110A2B51C98E65C2728CDB1C2A4BAC852C7EAB`;
- WebP: 1200 × 800 px, 71.638 bytes, SHA-256 `2AE6806152374256F227F7195A40A6AC8449CA1F1E320746CF8E76E89DB5B2C6`;
- crédito: `Imagem ilustrativa gerada por IA com OpenAI, sob direção editorial do Projeto Anônimo.`

## Evidências automatizadas

- onze arquivos de teste executados e aprovados;
- homologação Cliente 0: 12 de 12 casos locais aprovados;
- sintaxe de `material.js` e `main.js` aprovada;
- `git diff --check` sem erros de integridade;
- `plano-30-dias-pilot.test.cjs` confirma quatro semanas, 16 ações, limites, CTA, progressão e os dois formatos da capa.

## Evidências no navegador local

Com API exclusivamente sintética:

- título, promessa, versão e metadados v3.1 renderizados;
- capa WebP e crédito exibidos;
- CTA inicial apontando para `#preparar`;
- progressão apontando para `checklist-diagnostico-digital`;
- quatro semanas e 16 ações renderizadas;
- nenhum formulário, grupo de rádio, alerta ou erro de console presente.

## Limites deste gate

O catálogo poderá receber somente um registro em estado `Rascunho`, sem limpeza do cache público. Não haverá merge, ativação pública ou publicação antes da verificação final do usuário.

## Gate final

1. verificação final do PR e do registro em rascunho;
2. merge autorizado;
3. alteração do status para `Publicado` e preenchimento da URL pública da capa;
4. limpeza do cache e validação do slug público.
