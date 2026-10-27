## 1. Modelo de dados
- [x] 1.1 Registrar `dataConclusao` (AAAA-MM-DD) ao criar/atualizar tarefa, ignorando valor do cliente
- [x] 1.2 Limpar `dataConclusao` ao reabrir; preservar ao editar tarefa já concluída

## 2. Lógica de métricas (Python)
- [x] 2.1 Criar `utils.py` (normalização de texto e parse de datas)
- [x] 2.2 Criar `metrics.py` com `extrair_horas`, `prever_conclusao`, `calcular_metricas`
- [x] 2.3 Alerta `risco_prazo` e ordenação dos alertas de atraso
- [x] 2.4 Testes unitários cobrindo todos os cenários da spec (`tests/test_metrics.py`)

## 3. API
- [x] 3.1 `GET /metricas/{ra}` delega para `calcular_metricas` (campos antigos preservados)
- [x] 3.2 `PUT /tarefas/{id}` mantém 403/404 em vez de 500
- [ ] 3.3 Verificar manualmente no `/docs` com Firestore real (login → criar tarefas → concluir → `/metricas`)

## 4. Frontend
- [x] 4.1 Card "Progresso Acadêmico" no dashboard consumindo `/metricas`
- [x] 4.2 Previsão por disciplina na tela de Disciplinas (falha de `/metricas` não bloqueia a tela)
- [ ] 4.3 Verificar visualmente no navegador (card do dashboard e previsão em Disciplinas)

## 5. Fechamento
- [ ] 5.1 `openspec validate add-advanced-progress-forecast --strict` (CLI oficial; estrutura já checada por script equivalente)
- [x] 5.2 Arquivar a change (feito manualmente em 2026-10-25, seguindo o fluxo do `openspec archive`)
