# Change: Cálculo avançado de progresso com previsão de conclusão

## Why
A especificação de negócio (Feature 5) pede "progresso ponderado por carga horária" e "previsão de
conclusão baseada na velocidade atual". Hoje o endpoint `GET /metricas/{ra}` entrega o progresso
ponderado, mas a "previsão" é apenas a contagem de tarefas pendentes — não há velocidade, nem data
prevista, porque a tarefa não registra **quando** foi concluída. Além disso, o frontend não consome
`/metricas` (calcula o progresso no JS), contrariando a jornada do usuário: o dashboard deve mostrar o
progresso "calculado via Python".

## What Changes
- Tarefas passam a registrar `dataConclusao` (definida pelo servidor na transição para `Concluída`).
- Nova lógica pura em `metrics.py`: velocidade recente (janela de 14 dias), previsão de data de
  conclusão por disciplina e global, comparação da previsão com `dataFim` da disciplina.
- `GET /metricas/{ra}` passa a delegar para `metrics.calcular_metricas` e **adiciona** campos
  (`velocidade`, `previsao_global`, `previsao_conclusao`, `dentro_do_prazo`); campos existentes mantidos.
- Novo alerta `risco_prazo`; alertas de atraso passam a vir ordenados do mais atrasado ao menos.
- Dashboard ganha o card "Progresso Acadêmico" alimentado por `/metricas`; a tela de Disciplinas
  exibe a previsão por disciplina.
- `PUT /tarefas/{id}`: respostas 403/404 deixam de ser convertidas em 500 (bug que impedia testar o
  isolamento por usuário).

## Impact
- Capability nova: `progress-metrics`
- Código: `metrics.py`, `utils.py`, `main.py` (rotas de tarefas e métricas), `js/views/dashboardView.js`,
  `js/views/disciplinasView.js`
- Dados: novo campo opcional `dataConclusao` em `tarefas`. Tarefas já concluídas **não** são migradas
  (ficam sem data e não entram no cálculo de velocidade).
- Não é breaking: nenhum campo da resposta de `/metricas` foi removido ou renomeado.
