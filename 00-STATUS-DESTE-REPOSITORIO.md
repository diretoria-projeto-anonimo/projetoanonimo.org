# Status deste repositório

**Este é o repositório canônico do site e da documentação pública do Projeto Anônimo.**

- **GitHub:** `diretoria-projeto-anonimo/projetoanonimo.org` (branch padrão `main`)
- **Publicação:** GitHub Pages a partir de `main`, com `CNAME` = `projetoanonimo.org`
- **Verificado em 19/09/2026:** o repositório não está arquivado; a publicação está ativa e
  serve o domínio oficial.

## Pastas locais

As pastas `projetoanonimo.org-*` no disco (`-canonico`, `-gtm-global-v1`, `-brand-system-v1`,
`-framework-cliente0-v1`) são **checkouts do mesmo repositório remoto** — todas apontam para
`https://github.com/diretoria-projeto-anonimo/projetoanonimo.org.git`. Não existem repositórios
distintos com esses nomes no GitHub.

Recomendação de trabalho: usar uma pasta por vez, sempre com a `main` atualizada
(`git fetch && git pull --ff-only`), e abrir pull request para qualquer alteração.

## Correção do aviso anterior

Até 19/09/2026 existia aqui um aviso afirmando que este repositório estava **arquivado desde
10/09/2026** e que o repositório canônico seria `projetoanonimo.org-gtm-global-v1`.
Essa informação estava **incorreta**:

1. `projetoanonimo.org-gtm-global-v1` **não existe** como repositório no GitHub (HTTP 404);
2. existe **um único** repositório (`projetoanonimo.org`), com Pages ativo a partir de `main`;
3. a publicação do domínio oficial vem dele — foi por ele que as atualizações de 19/09/2026
   (páginas do podcast, artigos do blog, sitemap e scripts) chegaram ao ar.

Qualquer decisão de arquivamento ou de consolidação de repositórios deve ser registrada no
próprio repositório (documento versionado), e não apenas em arquivos soltos na pasta local.
