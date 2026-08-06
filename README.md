# Projeto Anônimo — Site v1

Site estático preparado para GitHub Pages, integrado ao CMS e à Biblioteca Viva por Google Apps Script.

## Executar localmente

```powershell
python -m http.server 8765
```

Acesse `http://127.0.0.1:8765/`.

## Áreas principais

- Site institucional
- Projetos e soluções
- Biblioteca Viva
- Página individual de material
- Painel editorial

## Publicação

1. Faça backup da versão publicada.
2. Publique o conteúdo deste pacote na raiz do repositório.
3. Confirme o domínio registrado em `CNAME`.
4. Verifique Home, Biblioteca, material individual e formulário de contato.
5. Teste o editor com uma conta Google presente na lista de editores.

## Segurança editorial

O diretório `/editor/` não deve ser indexado. A segurança das operações de leitura, atualização e upload depende da validação da credencial Google e do e-mail no Apps Script; ocultar a interface não substitui a autenticação do backend.

## Escopo editorial desta versão

- Consulta de publicados, rascunhos, revisão, preparação e arquivados.
- Criação de material como rascunho ou publicado.
- Reabertura e atualização de materiais existentes.
- Upload de capa, PDF e anexos.
- Autenticação Google com lista explícita de editores.
- Métricas anônimas de visualização, clique, download, formulário e
  compartilhamento.
- Indicadores agregados e desempenho por material no Dashboard.

O backend está em `/apps-script/`. A implantação editorial 1.1 foi configurada
e homologada; `/apps-script/CONFIGURAR.md` permanece como referência de
manutenção. O Client ID e a URL `/exec` ativos ficam centralizados em
`/editor/assets/js/config.js`.

## Revisões externas pendentes

- Revisão jurídica de Privacidade e Termos.
- Confirmação dos canais sociais e de contato.
- Teste final de gravação e upload após configurar OAuth e implantar o backend.
