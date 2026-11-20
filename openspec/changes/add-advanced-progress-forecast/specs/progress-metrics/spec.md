## ADDED Requirements

### Requirement: Progresso ponderado por carga horária
O sistema SHALL calcular o progresso de cada disciplina como o percentual de tarefas concluídas e o
progresso global como a média desses percentuais ponderada pela carga horária de cada disciplina.
Carga horária ausente, inválida ou zero SHALL ser tratada como 60 horas.

#### Scenario: Pesos diferentes por carga horária
- **WHEN** a disciplina A (80 horas) está 100% concluída e a disciplina B (40 horas) está 0% concluída
- **THEN** o progresso global é 66,7%

#### Scenario: Aluno sem disciplinas
- **WHEN** o aluno não possui disciplinas
- **THEN** o progresso global é 0 e as listas de progresso e alertas são vazias

### Requirement: Registro da data de conclusão da tarefa
O sistema SHALL registrar `dataConclusao` (AAAA-MM-DD) quando uma tarefa passa a `Concluída`, SHALL
removê-la quando a tarefa volta a `Pendente`, e SHALL ignorar qualquer `dataConclusao` enviada pelo cliente.

#### Scenario: Conclusão de tarefa pendente
- **WHEN** o aluno altera o status de uma tarefa de `Pendente` para `Concluída`
- **THEN** `dataConclusao` recebe a data de hoje

#### Scenario: Reabertura de tarefa
- **WHEN** o aluno altera uma tarefa de `Concluída` para `Pendente`
- **THEN** `dataConclusao` é removida

#### Scenario: Edição de tarefa já concluída
- **WHEN** o aluno edita o título de uma tarefa que já está `Concluída`
- **THEN** `dataConclusao` original é preservada

#### Scenario: Valor enviado pelo cliente
- **WHEN** o cliente envia `dataConclusao` no corpo da requisição
- **THEN** o valor é descartado e o servidor aplica as regras acima

### Requirement: Previsão de conclusão por velocidade
O sistema SHALL estimar, por disciplina e globalmente, a data de conclusão das tarefas pendentes
mantendo o ritmo dos últimos 14 dias (tarefas concluídas ÷ 14), arredondando o número de dias para
cima. Quando não houver conclusões na janela, o sistema SHALL informar `sem_historico` sem data
prevista. Previsões acima de 365 dias SHALL ser informadas como `muito_distante`, sem data.

#### Scenario: Ritmo recente permite projetar
- **WHEN** 7 tarefas foram concluídas nos últimos 14 dias e restam 4 pendentes
- **THEN** a previsão é `prevista` em 8 dias, com a data correspondente

#### Scenario: Sem conclusões recentes
- **WHEN** há tarefas pendentes e nenhuma conclusão registrada nos últimos 14 dias
- **THEN** a previsão tem status `sem_historico` e `data_prevista` nula

#### Scenario: Conclusão antiga não conta
- **WHEN** a única tarefa concluída tem `dataConclusao` anterior à janela de 14 dias
- **THEN** ela não entra no cálculo da velocidade

#### Scenario: Tudo concluído
- **WHEN** não há tarefas pendentes e existe ao menos uma tarefa
- **THEN** a previsão tem status `concluida`

#### Scenario: Ritmo lento demais
- **WHEN** a projeção ultrapassa 365 dias
- **THEN** a previsão tem status `muito_distante` e `data_prevista` nula

### Requirement: Alertas de atraso e de risco de prazo
O sistema SHALL gerar alerta de atraso para cada tarefa não concluída com `dataPrevista` anterior a
hoje, ordenados do mais atrasado para o menos atrasado, e SHALL gerar alerta `risco_prazo` quando a
data prevista de conclusão de uma disciplina for posterior ao seu `dataFim`. A lista SHALL conter no
máximo 10 alertas.

#### Scenario: Tarefa atrasada
- **WHEN** uma tarefa pendente tinha data prevista há 14 dias
- **THEN** existe alerta do tipo `atraso` com `dias_atraso` igual a 14

#### Scenario: Tarefa concluída não gera atraso
- **WHEN** uma tarefa concluída tem `dataPrevista` no passado
- **THEN** nenhum alerta de atraso é gerado para ela

#### Scenario: Ritmo não cumpre o fim da disciplina
- **WHEN** a previsão de conclusão de uma disciplina é posterior ao seu `dataFim`
- **THEN** existe alerta `risco_prazo` e `dentro_do_prazo` é falso para a disciplina

#### Scenario: Limite de alertas
- **WHEN** existem mais de 10 condições de alerta
- **THEN** a resposta contém apenas 10, começando pelas mais atrasadas

### Requirement: Métricas restritas ao próprio aluno
O endpoint `GET /metricas/{ra_aluno}` SHALL exigir token JWT válido e SHALL retornar HTTP 403 quando
o RA do token for diferente de `ra_aluno`. Os campos já existentes da resposta SHALL ser preservados.

#### Scenario: Acesso a RA de outro aluno
- **WHEN** um aluno autenticado consulta `/metricas/{RA de outro aluno}`
- **THEN** a resposta é HTTP 403

#### Scenario: Compatibilidade da resposta
- **WHEN** o cliente consulta `/metricas/{ra}` com o próprio RA
- **THEN** a resposta contém `progresso_global`, `progresso_por_disciplina`, `resumo_tarefas` e `alertas`, além dos novos campos de previsão

### Requirement: Exibição das métricas no portal
O portal SHALL exibir no dashboard o progresso global, o progresso e a previsão por disciplina e os
principais alertas retornados por `/metricas`, e SHALL exibir a previsão por disciplina na tela de
Disciplinas. Falha na consulta de métricas SHALL NOT impedir o carregamento do restante da tela.

#### Scenario: Dashboard com dados
- **WHEN** o aluno com disciplinas e tarefas abre o dashboard
- **THEN** o card de progresso mostra o percentual global e uma linha por disciplina com sua previsão

#### Scenario: Métricas indisponíveis
- **WHEN** a chamada a `/metricas` falha
- **THEN** o restante do dashboard e a lista de disciplinas continuam funcionando
