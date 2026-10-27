# search-filters Specification

## Purpose
Permitir busca e filtros no backend sobre as tarefas e disciplinas do próprio aluno (texto sem distinção de acentos, status, disciplina e intervalo de datas), com validação dos parâmetros e compatibilidade com chamadas sem filtro.

## Requirements
### Requirement: Filtros de tarefas
O sistema SHALL permitir filtrar `GET /tarefas/{ra_aluno}` por texto (`q`, em título e descrição),
`status`, `disciplina_id` e intervalo de `dataPrevista` (`data_inicio`, `data_fim`, inclusivos),
combinando os filtros informados com E lógico. A busca de texto SHALL ignorar maiúsculas e acentos, e
`status` SHALL aceitar `Pendente`, `Concluída` (com ou sem acento/caixa) ou `todos`.

#### Scenario: Busca sem acento
- **WHEN** o aluno busca `q=algebra` e existe a tarefa "Lista de Álgebra"
- **THEN** a tarefa é retornada

#### Scenario: Filtro por status com variação de escrita
- **WHEN** o aluno filtra por `status=concluida`
- **THEN** somente tarefas `Concluída` são retornadas

#### Scenario: Intervalo de datas inclusivo
- **WHEN** o aluno filtra de 2026-03-10 a 2026-03-20
- **THEN** tarefas previstas exatamente em 10/03 e 20/03 são retornadas

#### Scenario: Tarefa sem data prevista
- **WHEN** há filtro de data e a tarefa não possui `dataPrevista` válida
- **THEN** a tarefa não é retornada

#### Scenario: Filtros combinados
- **WHEN** o aluno informa `status=Pendente` e `disciplina_id` de uma disciplina
- **THEN** são retornadas apenas tarefas pendentes dessa disciplina

### Requirement: Busca e filtro de disciplinas
O sistema SHALL permitir filtrar `GET /disciplinas/{ra_aluno}` por texto (`q`, em nome, professor e
descrição, sem distinguir maiúsculas/acentos) e por período (`data_inicio`, `data_fim`), retornando as
disciplinas vigentes em algum momento do intervalo. Disciplina sem `dataInicio` ou `dataFim` SHALL ser
tratada como intervalo aberto naquele lado.

#### Scenario: Busca por professor
- **WHEN** o aluno busca `q=joao` e existe a disciplina do professor "João"
- **THEN** a disciplina é retornada

#### Scenario: Disciplinas vigentes no período
- **WHEN** o aluno filtra de 2026-05-01 a 2026-05-31
- **THEN** são retornadas as disciplinas cujo período intersecta maio de 2026, incluindo as sem datas

### Requirement: Validação dos parâmetros de filtro
O sistema SHALL responder HTTP 422 com mensagem em português quando `status` não for reconhecido,
quando uma data não estiver no formato AAAA-MM-DD ou quando `data_inicio` for posterior a `data_fim`.

#### Scenario: Status desconhecido
- **WHEN** o cliente envia `status=atrasada`
- **THEN** a resposta é HTTP 422

#### Scenario: Data em formato inválido
- **WHEN** o cliente envia `data_inicio=10/03/2026`
- **THEN** a resposta é HTTP 422

#### Scenario: Intervalo invertido
- **WHEN** `data_inicio` é posterior a `data_fim`
- **THEN** a resposta é HTTP 422

### Requirement: Compatibilidade e isolamento nas listagens
Sem nenhum parâmetro de filtro, as listagens de tarefas e disciplinas SHALL retornar todos os
registros do aluno na mesma ordem de antes. As listagens SHALL continuar exigindo JWT e retornando
HTTP 403 para RA diferente do token; filtros SHALL ser aplicados somente sobre os dados do próprio aluno.

#### Scenario: Chamada sem parâmetros
- **WHEN** o cliente chama `GET /tarefas/{ra}` sem query params
- **THEN** recebe todas as tarefas do aluno

#### Scenario: Filtro não vaza dados de outro aluno
- **WHEN** o aluno aplica qualquer filtro
- **THEN** o resultado contém apenas registros do seu próprio RA
