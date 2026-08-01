# Site Projeto Anônimo — GitHub Pages

## Publicação
1. Crie um repositório no GitHub.
2. Envie todo o conteúdo deste pacote para a raiz.
3. Acesse Settings → Pages.
4. Escolha Deploy from a branch.
5. Selecione main e /root.
6. Salve.

## Domínio
Em Settings → Pages → Custom domain, use:
www.projetoanonimo.org

O arquivo CNAME já está configurado.

## Google Forms
No arquivo contato.html, substitua:
SUBSTITUA_PELO_LINK_DO_GOOGLE_FORMS
pelo link público do formulário.

## Logo
O site usa o monograma PA como reserva. Coloque a logo oficial em:
assets/img/logo.svg
e substitua os elementos:
<span class="mark">PA</span>
pela tag de imagem.

## Redes sociais
Substitua os links href="#" no rodapé.

## Teste local
python -m http.server 8000
Depois abra http://localhost:8000
