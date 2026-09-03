---
id: draft-politica-de-backup-v1
titulo: Política de Backup Institucional
slug: politica-de-backup
categoria: Governança
formato: Política
resumo: Diretrizes e procedimentos para a cópia de segurança, retenção e restauração de dados críticos da organização, garantindo a continuidade e a soberania digital.
publico: Administradores de TI, Gestores, Equipe
nivel: Estratégico
tempoLeitura: 10
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
palavrasChave: backup, segurança, governança, continuidade, soberania digital
data: 2026-08-14
ultimaRevisao: 2026-08-14
---

# Política de Backup Institucional

> **Aviso:** Este documento é um modelo de referência e não substitui orientação jurídica ou técnica especializada. A organização que o utiliza é inteiramente responsável pela gestão, segurança e conformidade de seus próprios dados.

## 1. Objetivo

Esta política estabelece as diretrizes para a criação, armazenamento e gerenciamento de cópias de segurança (backups) dos dados institucionais. O objetivo é garantir a capacidade de recuperar informações críticas em caso de falha de sistema, erro humano, corrupção de dados ou incidentes de segurança, assegurando a continuidade das operações e a soberania sobre nossos ativos digitais.

## 2. Escopo

Esta política se aplica a todos os dados considerados ativos institucionais críticos, incluindo, mas não se limitando a:

- Documentos de projetos e relatórios.
- Registros financeiros e contábeis.
- Bases de dados de contatos (beneficiários, parceiros, doadores).
- Documentos estratégicos e de governança.
- Conteúdo da Biblioteca Viva e do site institucional.

Os dados estão primariamente armazenados em plataformas como Google Workspace (Drive, Gmail, etc.) e outras ferramentas SaaS.

## 3. Estratégia de Backup (Regra 3-2-1)

Adotamos uma abordagem baseada na regra 3-2-1 para garantir a resiliência dos dados:

- **3 Cópias:** Manteremos três cópias de todos os dados críticos: o dado original (produção) e duas cópias de backup.
- **2 Mídias Diferentes:** As cópias serão armazenadas em pelo menos dois tipos de mídia ou locais distintos. Por exemplo, o dado de produção no Google Drive e o backup em um serviço de armazenamento em nuvem de outro fornecedor.
- **1 Cópia Off-site:** Pelo menos uma cópia de backup será mantida em um local geograficamente separado do ambiente de produção.

## 4. Procedimentos e Frequência

### a. Backup Automatizado

Deve ser implementada uma solução de backup automatizada para os dados críticos armazenados no Google Workspace.
- **Frequência:** Backups diários para dados de alta criticidade.
- **Ferramentas:** Utilização de serviços de terceiros especializados em backup para Google Workspace ou scripts customizados que exportem os dados para um local seguro.

### b. Backup Manual e Arquivamento

- **Google Takeout:** Pode ser usado para backups pontuais ou completos antes de grandes migrações.
- **Arquivamento de Projetos:** Ao final de um projeto, seus dados devem ser consolidados e movidos para uma área de "Arquivo Morto", conforme o plano de organização digital. Esta área também deve ser incluída na rotina de backup.

## 5. Retenção de Dados

- **Backups Diários:** Retidos por, no mínimo, 30 dias.
- **Backups Mensais:** Retidos por, no mínimo, 12 meses.
- **Arquivos de Longo Prazo:** Dados com valor histórico ou legal devem ser mantidos em um arquivo permanente, com retenção definida pela política de gestão documental.

## 6. Testes de Restauração

Um backup só é útil se a restauração funcionar.
- **Frequência:** Testes de restauração devem ser realizados trimestralmente.
- **Procedimento:** O teste consiste em restaurar uma amostra de arquivos ou um conjunto de dados específico para um local temporário, validando sua integridade e acessibilidade. Os resultados devem ser documentados.

## 7. Segurança dos Backups

- **Criptografia:** Todos os backups devem ser criptografados tanto em trânsito quanto em repouso.
- **Controle de Acesso:** O acesso aos dados de backup deve ser restrito a pessoal autorizado (ex: Administrador de TI), seguindo o princípio do menor privilégio.

## 8. Papéis e Responsabilidades

O **Administrador de TI** ou o **Gestor de Tecnologia** é responsável por implementar, monitorar e manter a rotina de backup, bem como executar os testes de restauração e gerenciar o acesso aos dados de backup.