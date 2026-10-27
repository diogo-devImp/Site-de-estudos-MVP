## 1. Lógica de filtros (Python)
- [x] 1.1 `filters.py` com `filtrar_tarefas` e `filtrar_disciplinas` (texto sem acento, status, datas)
- [x] 1.2 `FiltroInvalido` para status/datas inválidos e intervalo invertido
- [x] 1.3 Testes unitários cobrindo todos os cenários da spec (`tests/test_filters.py`)

## 2. API
- [x] 2.1 Query params em `GET /tarefas/{ra}`
- [x] 2.2 Query params em `GET /disciplinas/{ra}`
- [x] 2.3 `FiltroInvalido` → HTTP 422
- [ ] 2.4 Verificar manualmente no `/docs` (ex.: `/tarefas/{ra}?status=concluida&q=algebra`)

## 3. Documentação
- [x] 3.1 Documentar os parâmetros no README

## 4. Fechamento
- [ ] 4.1 `openspec validate add-task-subject-search-filters --strict` (CLI oficial; estrutura já checada por script equivalente)
- [x] 4.2 Arquivar a change (feito manualmente em 2026-10-25, seguindo o fluxo do `openspec archive`)
