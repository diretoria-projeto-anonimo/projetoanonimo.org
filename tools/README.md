# tools

Scripts de apoio ao repositório. Nenhum deles roda em produção: são usados
localmente (e o teste correspondente garante que o resultado está versionado).

## `gerar-cards-estaticos.cjs`

Gera os cards de **Projetos** e **Soluções** como HTML estático a partir de
`assets/data/site-content.json`, além das opções dos filtros e do contador.

```bash
node tools/gerar-cards-estaticos.cjs            # grava projetos.html e solucoes.html
node tools/gerar-cards-estaticos.cjs --conferir # só compara (útil antes de commitar)
```

Por que existe: o conteúdo precisa estar no HTML para funcionar sem JavaScript
(SEO e leitores de tela). O JavaScript apenas **filtra** os cards que já estão na
página.

Regra de manutenção:

1. edite `assets/data/site-content.json`;
2. rode `node tools/gerar-cards-estaticos.cjs`;
3. rode `node --test tests/*.test.cjs`.

O teste `tests/cards-estaticos.test.cjs` compara o HTML gerado com o arquivo do
repositório e **falha** se os dois saírem de sincronia, apontando o comando acima.

Os cards são escritos entre os marcadores `<!-- cards-projetos:inicio -->` /
`<!-- cards-projetos:fim -->` (e equivalentes para soluções e opções de filtro),
então o restante de cada página continua editável à mão.
