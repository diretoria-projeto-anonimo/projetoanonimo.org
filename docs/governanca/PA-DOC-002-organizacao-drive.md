# PA-DOC-002 — Organização do Drive: árvore canônica, colisão PA-COM-001 e arquivo

**Data:** 19/09/2026 · **Status:** proposta pronta para execução (aguardando execução no Drive)
**Origem:** item G.5 da reconciliação `PA-WEB-002 v0.2` — *"registrar a separação lógica de escopo
entre PA-COM-001 Estratégia e PA-COM-001 Mensagens na governança do Drive"*.
**Evidência:** leitura direta das duas árvores via Drive API (conta `diretoria@projetoanonimo.org`).

---

## 1. Diagnóstico: existem duas árvores de Drive

| Árvore | ID raiz | Conteúdo | Situação |
|---|---|---|---|
| **`Projeto Anônimo - Centro de Operações`** | `1-mpswvYcVe5TdrhlIPhFRdpvbZ3BFXhi` | pastas `00_GOVERNANCA` … `10_TRANSPARENCIA_E_FINANCEIRO` | **canônica operacional**: 28 códigos `PA-*` ativos, espelha o repositório e a pasta local `03_CONTEUDO` |
| **`FRAMEWORK_PA`** | `1w8rE7whI0PmYUII9UKJCLCBoxup2-6R0` | `00_HUB`, `01_FOUNDATION`, …, `13_PROJECTS`, `90_TEMPLATES`, `98_SHARED`, `99_ARCHIVE` | estrutura paralela, criada em julho/2026; documentos em `v0.1.0`; já tem `99_ARCHIVE`, `99_DUPLICATE_DELETE_PENDING` e `99_TMP_DELETE_PENDING` |

**Decisão:** a árvore **canônica é `Projeto Anônimo - Centro de Operações`**. O `FRAMEWORK_PA` passa
a ser tratado como **acervo histórico**: nada novo é criado lá; o que ainda tiver valor é movido para
a canônica e o resto é arquivado.

## 2. A colisão de código (causa do item G.5)

`PA-COM-001` está em **dois ativos diferentes**:

| Documento | Onde está | Escopo real |
|---|---|---|
| `PA-COM-001_Estrategia_de_Comunicacao_v0.1.0` | `FRAMEWORK_PA/11_COMMUNICATION/02_ESTRATEGIA` | **estratégia** de comunicação |
| `PA-COM-001 — Mensagens de Lançamento e Relacionamento` | `…/03_CONTEUDO` (canônica) | **mensagens** de lançamento e relacionamento |

Na árvore canônica a família já está numerada: `PA-COM-002` (bios), `003` (FAQ), `004` (matriz de CTAs) e `005` (inventário de perfis).

**Resolução:** a **estratégia** recebe o próximo código livre da família — **`PA-COM-006`** — e é
movida para a canônica, junto das demais. As **mensagens mantêm `PA-COM-001`** (é a referência já
citada nos documentos de reconciliação).

> Escopo registrado: `PA-COM-001` = Mensagens de Lançamento e Relacionamento ·
> `PA-COM-006` = Estratégia de Comunicação. Ambos são ativos distintos, na mesma pasta.

## 3. Triage do acervo `FRAMEWORK_PA/11_COMMUNICATION`

### 3.1 Mover para a árvore canônica (1 item)

| Documento | ID | Ação |
|---|---|---|
| `PA-COM-001_Estrategia_de_Comunicacao_v0.1.0` | `1TWlY-ZOmphSMlTU3FQrPqNl5c9CGr7KifuVrz_-YLkw` | renomear para **`PA-COM-006 — Estratégia de Comunicação (v0.1.0)`** e mover para `03_CONTEUDO` (`1MICL8r1df0uCGINB5dhvBZdI05l7CaIN`) |

### 3.2 Arquivar em `FRAMEWORK_PA/99_ARCHIVE/04_VERSOES_ANTERIORES` (`1Nq0Lydrr_ZZu4XJ6Ckthe6qq77twV69x`)

Duplicados ou versões superadas por documento mais novo na canônica:

| Documento | ID | Por que arquivar |
|---|---|---|
| `PA-WEB-002_Conteudo_Completo_do_Website_v0.1.0` | `1Av0IhKWnrq-LeN5Zs0VQz5Jdv-eWEcSMvOWYPkNZ_IA` | declara Squarespace; superado por `PA-WEB-002 — Texto Mestre do Site` (`1RbvGPOrkzoPGjwJqPs2_VXKMHWu7alxZo7pmnaVX0M8`) |
| `PA-WEB-001_Blueprint_do_Website_v0.1.0` | `1Y3MvHA4GvvtM3ikT9Rs58D2yYbFlTJkqyPfsU6OgU9o` | duplicado: forma atual é `PA-WEB-001 — Arquitetura, Conteúdo e SEO do Site` na canônica |
| `PA-SOC-001_Guia_Oficial_das_Redes_Sociais_v0.1.0` | `1SA7Ii1a6DzBvqB-HopWUcfHpA9FTQovB9tETfW1XoOw` | duplicado: `PA-SOC-001` ativo está na canônica |
| `PA-CAL-001_Calendario_Editorial_30_Dias_v0.1.0` | `1F7k25UxnG3OW_jI6z_So_BG5LYPQ2-u2YJXRUQ5u_1M` | superado por `PA-EDT-001 — Calendário Editorial 90 Dias` |
| `PA-MKT-001_Plano_de_Lancamento_03-08-2026_v0.1.0` | `1ACOTzSyyK0c8qsvvKBWRjWPVwfbp1DlwQ5VKy4R5Q64` | superado por `PA-LAN-001 — Plano de Lançamento Público` |
| `PA-CON-001_Kit_de_Conteudo_do_Lancamento_v0.1.0` | `1sXnrHfx2JSUJkL47jcbQys710GPcEcnGcKmCPfkppOc` | numeração antiga; forma atual é `PA-CON-002` |
| `PA-LIB-001_Biblioteca_Viva_Catalogo_e_Governanca_v…` | `15KpK3fkrrWrpL8sLFb02i4h1VAozHAZvskS0Rf_-FUg` | catálogo/governança em versão antiga; hoje o tema é `04_BIBLIOTECA_VIVA` + ativos `PA-LIB-003/006` |

### 3.3 Arquivar (documentos do framework antigo, sem equivalente ativo)

| Documento | ID | Observação |
|---|---|---|
| `PA-WEB-006 — Arquitetura Oficial do Framework Web` | `1qHTLSh_2_X1VUFdh-2mYp5TzYitwSPGJ7vm3aNPGwKo` | descreve o próprio framework paralelo |
| `PA-SIT-001_Conteudo_da_Pagina_Inicial_v0.1.0` | `13YyGC1D78Oc_cvUQUZmAKC7dyn5F_CCVHCjp2DiRnn4` | conteúdo preliminar da home; hoje o site tem `PA-WEB-004/005` |
| `PA-PUB-001_Implantacao_Publica_v0.1.0` | `1mOQ4UHJMYyN4JqviCrwenI2l11EyHBnjhx0wP5KcZCI` | implantação já executada e documentada no repositório |

**Regra de nomenclatura no arquivo:** acrescentar o sufixo `_ARQUIVADO-2026-09-19` ao nome.
Nada é **excluído** nesta etapa: exclusão definitiva exige decisão nominal da diretoria.

### 3.4 Permanece no `FRAMEWORK_PA` (estrutura, não documentos)

`11_COMMUNICATION/{01_MARCA, 03_REDES_SOCIAIS, 04_CAMPANHAS, 05_IMPRENSA, 06_CALENDARIO_EDITORIAL, 07_BIBLIOTECA_VIVA}` (subpastas do catálogo), `99_ARCHIVE`, `99_DUPLICATE_DELETE_PENDING` (vazia, fica como caixa de entrada de duplicados) e `README_11_COMMUNICATION`.

## 4. Execução

> **Limite técnico verificado:** o agente não tem permissão de escrita no Drive. As credenciais
> disponíveis hoje têm `drive.metadata.readonly` + `drive.file` (somente leitura de metadados e
> arquivos criados pelo próprio app). Por isso a execução é **manual** (Opção A) ou por **Apps Script
> na conta da instituição** (Opção B).

### Opção A — manual no Drive (≈10 min)
1. Abra a pasta `FRAMEWORK_PA/11_COMMUNICATION/02_ESTRATEGIA`, renomeie
   `PA-COM-001_Estrategia_de_Comunicacao_v0.1.0` para
   `PA-COM-006 — Estratégia de Comunicação (v0.1.0)` e **mova** para `03_CONTEUDO` da árvore canônica.
2. Abra `99_ARCHIVE/04_VERSOES_ANTERIORES` em outra aba.
3. Para cada item das tabelas §3.2 e §3.3: renomeie com o sufixo `_ARQUIVADO-2026-09-19` e mova para essa pasta.
4. Marque a execução neste documento (PR de atualização) e, se quiser, esvazie
   `99_TMP_DELETE_PENDING` após conferência.

### Opção B — Apps Script (dry-run primeiro)
Crie um script em <https://script.google.com> (conta `diretoria@projetoanonimo.org`), cole o bloco
abaixo, rode **com `DRY_RUN = true`**, confira o log e só então mude para `false`:

```javascript
/** PA-DOC-002 — organização do Drive. Rode primeiro com DRY_RUN = true. */
var DRY_RUN = true;

var CANONICO_CONTEUDO = '1MICL8r1df0uCGINB5dhvBZdI05l7CaIN';            // …/03_CONTEUDO
var ARCHIVE = '1Nq0Lydrr_ZZu4XJ6Ckthe6qq77twV69x';                      // FRAMEWORK_PA/99_ARCHIVE/04_VERSOES_ANTERIORES
var SUFIXO = '_ARQUIVADO-2026-09-19';

var ACOES = [
  { id: '1TWlY-ZOmphSMlTU3FQrPqNl5c9CGr7KifuVrz_-YLkw', nome: 'PA-COM-006 — Estratégia de Comunicação (v0.1.0)', destino: CANONICO_CONTEUDO, motivo: 'resolve a colisão PA-COM-001' },
  { id: '1Av0IhKWnrq-LeN5Zs0VQz5Jdv-eWEcSMvOWYPkNZ_IA', nome: 'PA-WEB-002_Conteudo_Completo_do_Website_v0.1.0' + SUFIXO, destino: ARCHIVE, motivo: 'superado pelo Texto Mestre' },
  { id: '1Y3MvHA4GvvtM3ikT9Rs58D2yYbFlTJkqyPfsU6OgU9o', nome: 'PA-WEB-001_Blueprint_do_Website_v0.1.0' + SUFIXO, destino: ARCHIVE, motivo: 'duplicado' },
  { id: '1SA7Ii1a6DzBvqB-HopWUcfHpA9FTQovB9tETfW1XoOw', nome: 'PA-SOC-001_Guia_Oficial_das_Redes_Sociais_v0.1.0' + SUFIXO, destino: ARCHIVE, motivo: 'duplicado' },
  { id: '1F7k25UxnG3OW_jI6z_So_BG5LYPQ2-u2YJXRUQ5u_1M', nome: 'PA-CAL-001_Calendario_Editorial_30_Dias_v0.1.0' + SUFIXO, destino: ARCHIVE, motivo: 'superado por PA-EDT-001' },
  { id: '1ACOTzSyyK0c8qsvvKBWRjWPVwfbp1DlwQ5VKy4R5Q64', nome: 'PA-MKT-001_Plano_de_Lancamento_03-08-2026_v0.1.0' + SUFIXO, destino: ARCHIVE, motivo: 'superado por PA-LAN-001' },
  { id: '1sXnrHfx2JSUJkL47jcbQys710GPcEcnGcKmCPfkppOc', nome: 'PA-CON-001_Kit_de_Conteudo_do_Lancamento_v0.1.0' + SUFIXO, destino: ARCHIVE, motivo: 'numeração antiga (hoje PA-CON-002)' },
  { id: '15KpK3fkrrWrpL8sLFb02i4h1VAozHAZvskS0Rf_-FUg', nome: 'PA-LIB-001_Biblioteca_Viva_Catalogo_e_Governanca_v0.1.0' + SUFIXO, destino: ARCHIVE, motivo: 'versão antiga do tema Biblioteca Viva' },
  { id: '1qHTLSh_2_X1VUFdh-2mYp5TzYitwSPGJ7vm3aNPGwKo', nome: 'PA-WEB-006 — Arquitetura Oficial do Framework Web' + SUFIXO, destino: ARCHIVE, motivo: 'documento do framework paralelo' },
  { id: '13YyGC1D78Oc_cvUQUZmAKC7dyn5F_CCVHCjp2DiRnn4', nome: 'PA-SIT-001_Conteudo_da_Pagina_Inicial_v0.1.0' + SUFIXO, destino: ARCHIVE, motivo: 'preliminar; site atual é PA-WEB-004/005' },
  { id: '1mOQ4UHJMYyN4JqviCrwenI2l11EyHBnjhx0wP5KcZCI', nome: 'PA-PUB-001_Implantacao_Publica_v0.1.0' + SUFIXO, destino: ARCHIVE, motivo: 'implantação concluída' }
];

function organizarDrivePA() {
  ACOES.forEach(function (a) {
    var arquivo = DriveApp.getFileById(a.id);
    Logger.log((DRY_RUN ? '[DRY-RUN] ' : '[EXECUTADO] ') + arquivo.getName() +
      '  ->  ' + a.nome + '   (pasta destino: ' + a.destino + ')  // ' + a.motivo);
    if (!DRY_RUN) {
      arquivo.setName(a.nome);
      arquivo.moveTo(DriveApp.getFolderById(a.destino));
    }
  });
  Logger.log(DRY_RUN ? 'Nada foi alterado (DRY_RUN = true).' : 'Concluído.');
}
```

## 5. O que fica registrado por este documento

1. A árvore canônica do Drive e a função do `FRAMEWORK_PA` (acervo histórico).
2. A separação de escopo de `PA-COM-001` × `PA-COM-006` — pendência **G.5** da reconciliação `PA-WEB-002 v0.2`.
3. A política de arquivo (`99_ARCHIVE/04_VERSOES_ANTERIORES`, sufixo `_ARQUIVADO-AAAA-MM-DD`, sem exclusão automática).
4. As ações exatas, com IDs, para execução manual ou por Apps Script.

**Pendente após a execução:** marcar este documento como *executado* (data e responsável) e, se a
diretoria decidir, remover definitivamente o conteúdo de `99_DUPLICATE_DELETE_PENDING`.
