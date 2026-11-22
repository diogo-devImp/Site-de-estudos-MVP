## Context
Firestore não faz agregações complexas e a regra de negócio precisa ser testável. A especificação
quer a lógica "em Python guiada por OpenSpec".

## Goals / Non-Goals
- Goals: previsão honesta baseada em dados reais; lógica testável sem Firestore; sem quebrar o front.
- Non-Goals: tempo estimado vs. real, insights de IA, relatório PDF e notificações (changes futuras);
  migração de tarefas antigas; Xano/FlutterFlow.

## Decisions
- **Funções puras em `metrics.py`.** `main.py` só busca no Firestore e chama `calcular_metricas`.
  Alternativa descartada: manter o cálculo inline na rota (impossível testar sem Firebase).
- **Velocidade = tarefas concluídas nos últimos 14 dias ÷ 14.** Janela fixa em constante
  (`JANELA_VELOCIDADE_DIAS`). Dias = `ceil(pendentes ÷ velocidade)` em aritmética inteira.
  Alternativa descartada: média desde a primeira conclusão (reage devagar a mudanças de ritmo).
- **Velocidade por disciplina usa só o histórico da própria disciplina.** Usar a velocidade global
  para uma disciplina seria incorreto (o ritmo é dividido entre disciplinas).
- **Sem histórico → `status: "sem_historico"` e `data_prevista: null`.** Nunca inventar uma data.
  Previsão acima de 365 dias → `muito_distante`, também sem data.
- **`dataConclusao` é definida só no servidor** e o valor enviado pelo cliente é ignorado. Reabrir
  a tarefa (volta a `Pendente`) zera o campo. Editar uma tarefa já concluída preserva a data original.
- **Tarefas concluídas antes desta change ficam sem `dataConclusao`** e não contam na velocidade
  (em vez de receber "hoje" e distorcer a previsão).
- **Compatibilidade:** campos existentes de `/metricas` permanecem (inclusive `previsao` em texto);
  novos campos são aditivos.

## Risks / Trade-offs
- Em poucos dias de uso a previsão é instável (poucos pontos). Mitigação: mostrar `sem_historico`
  quando não há conclusões na janela e exibir a data como estimativa.
- Datas usam o relógio do servidor (`date.today()`); se o servidor estiver em UTC, a virada do dia
  pode divergir do horário de Brasília por algumas horas.
- Leitura de todas as tarefas do aluno a cada chamada: aceitável para o volume esperado
  (dezenas/centenas por aluno); revisitar se passar disso.

## Open Questions
- Disciplina sem nenhuma tarefa conta como 0% no progresso global (comportamento atual, mantido).
  Excluí-la do cálculo seria mais justo? Decisão do aluno.
