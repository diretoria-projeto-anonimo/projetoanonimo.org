---
id: draft-checklist-seguranca-workspace-v1
titulo: "Checklist de Segurança Básica para Google Workspace em OSCs"
slug: checklist-seguranca-workspace
categoria: Gestão Digital
formato: Checklist
resumo: Uma lista de verificação com cinco pontos essenciais para proteger contas, arquivos e dados de uma organização que utiliza o Google Workspace.
publico: Administradores de TI, gestores de OSCs
nivel: Operacional
tempoLeitura: 5 min
versao: 1.0
autor: Projeto Anônimo
licenca: CC BY-NC-SA 4.0
urlArquivo:
urlCapa:
urlVideo:
urlFormulario:
cta:
destaque: false
status: Rascunho
palavrasChave: segurança, Google Workspace, checklist, proteção de dados, 2FA
data: 2026-08-14
ultimaRevisao: 2026-08-14
---

# Checklist de Segurança Básica para Google Workspace

A segurança digital não depende apenas de ferramentas complexas, mas de práticas consistentes. Este checklist cobre cinco áreas fundamentais para reduzir riscos e fortalecer a proteção de dados no ambiente Google Workspace. A segurança absoluta não existe, mas estas ações elevam significativamente o nível de proteção.

## 1. Verificação em Duas Etapas (2SV/MFA)

A verificação em duas etapas é a camada de proteção mais importante contra acesso não autorizado a contas.

- [ ] **Exigir 2SV para todos os usuários:** Configure no painel do administrador a obrigatoriedade da verificação em duas etapas para todas as contas da organização, especialmente as de administradores e lideranças.
- [ ] **Orientar sobre métodos seguros:** Incentive o uso de aplicativos autenticadores (como Google Authenticator ou similar) ou chaves de segurança físicas (YubiKey) em vez de SMS, que é mais vulnerável.

## 2. Permissões de Compartilhamento

O compartilhamento excessivamente permissivo de arquivos e pastas é uma das principais causas de vazamento de dados.

- [ ] **Revisar configurações padrão do Drive:** No painel do administrador, defina a configuração padrão de compartilhamento de links como "Restrito", exigindo que o acesso seja concedido explicitamente.
- [ ] **Limitar compartilhamento externo:** Avalie a possibilidade de bloquear o compartilhamento de arquivos com pessoas de fora da organização, exceto para unidades organizacionais específicas que necessitem dessa função.

## 3. Aplicativos de Terceiros

Aplicativos conectados à conta Google podem ter acesso amplo a e-mails, contatos e arquivos.

- [ ] **Auditar aplicativos conectados:** Oriente os usuários a revisarem periodicamente a página https://myaccount.google.com/permissions e removerem aplicativos desconhecidos ou que não são mais utilizados.
- [ ] **Controlar a instalação:** Utilize a seção "Controle de acesso a apps" no painel do administrador para restringir quais aplicativos de terceiros podem ser autorizados pelos usuários.

## 4. Proteção de Documentos Críticos

Dados sensíveis, como informações financeiras, dados pessoais de beneficiários ou documentos estratégicos, exigem uma camada extra de cuidado.

- [ ] **Utilizar Drives Compartilhados:** Armazene documentos críticos em Drives Compartilhados (Shared Drives) em vez de no "Meu Drive" de um usuário específico. Isso garante que os arquivos permaneçam com a organização mesmo que a conta do criador seja removida.
- [ ] **Refinar permissões de acesso:** Dentro de um Drive Compartilhado, conceda permissões de "Leitor" por padrão e eleve para "Comentador" ou "Colaborador" apenas quando necessário.

## 5. Rotina Mensal de Revisão

A segurança é um processo, não um projeto com início e fim.

- [ ] **Agendar uma revisão de segurança:** Defina um lembrete mensal para que o administrador revise os relatórios de segurança no painel do Google Workspace, verificando alertas, atividades de login suspeitas e padrões de compartilhamento de dados.