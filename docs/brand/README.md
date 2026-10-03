# Identidade de marca no site

Referência normativa: PA-BRD-001, seções 1 a 8. Organização das diretrizes em 03/10/2026; não é nova homologação de identidade.

## Fonte única e arquivos

- `identidade-de-marca.html`: página pública com manifesto, assinatura, paleta, usos e downloads.
- `assets/brand/brand-manifest.json`: dados estruturados da marca; não há garantia de leitura pelo Canva.
- `assets/css/brand-tokens.css`: sete cores canônicas com prefixo `--pa-`; não modifica o CSS global.
- `assets/brand/*.svg`: nove vetores preexistentes reutilizados sem qualquer alteração.

O link de acesso está no rodapé da Home e a rota está no sitemap. A página tem retorno à Home e ao Contato. A URL canônica prevista para a implantação é `https://projetoanonimo.org/identidade-de-marca.html`; incluí-la no código não comprova que já esteja publicada.

## Regras essenciais

- Nome: **Projeto Anônimo**.
- Assinatura: **TECNOLOGIA · AUTONOMIA · IMPACTO SOCIAL**.
- Símbolo: quatro camadas isométricas vazadas; usar o original, sem reconstrução por IA.
- Paleta principal: `#111B18`, `#0D4D44`, `#D3EBD9`, `#F2FAF4`.
- Apoios: `#E7F4EA`, `#9BC8AB`, `#C1DDC8`.
- Wordmark: IBM Plex Sans SemiBold em curvas. **A tipografia editorial definitiva continua pendente de homologação.**
- Não distorcer, girar, alterar camadas, preencher vazados ou adicionar efeitos ao logo. Usar a versão adequada ao fundo e manter respiro.
- 96 px de margem para feed 1080×1350 e 1080×1080; isso não é margem global de páginas web.
- Stories: confirmar a área segura na plataforma de destino; não estender automaticamente a regra de feed.
- Texto: alvo documental de contraste 7:1. Composições devem ser verificadas individualmente; as cores não garantem acessibilidade em qualquer combinação.
- Materiais visuais informativos precisam de texto alternativo. Imagens decorativas podem ter `alt=""`.
- Paleta azul-marinho é legada. Esta mudança não migra o restante do site nem autoriza recolorir materiais antigos.

## Tipografia

O PA-BRD-001 registra candidatos, não uma combinação editorial aprovada: Inter ou Space Grotesk nos títulos, Roboto ou Montserrat no corpo, Inter em metadados. Limite de duas famílias por peça. O guia não instala fontes novas nem altera a fonte global do site.

## Compatibilidade

O novo HTML mantém o contêiner GTM-KTMXHMZL e o consentimento padrão negado, como as páginas institucionais existentes. Não adiciona formulários, não altera CRM/Apps Script, não cria novos destinos de campanha e não modifica o fluxo de diagnóstico.

O HTML público não contém relatórios de exportação, instruções de implantação, estado local da sessão ou links de documentos internos. A fonte normativa é identificada pelo código PA-BRD-001.

## Conferência e publicação

1. Executar `node --test tests/brand-identity.test.cjs` e a suíte configurada em `.github/workflows/pr-checks.yml`.
2. Revisar a página em computador e celular, downloads SVG/JSON/CSS, retorno ao site e link no rodapé da Home.
3. Revisar e aprovar a PR. Merge e implantação são etapas separadas, não executadas pela preparação da PR.
4. Após a implantação autorizada, testar a URL pública e os downloads. Só então informar essa URL ao Canva.
5. Conferir o kit sugerido: logos, cores, fontes e assinatura. Importação automática não homologa fontes, não autoriza produção/publicação e não garante sincronização.
