## 1. Search logic (Python)
- [x] 1.1 Add `tarefas_atrasadas` to `filters.py`
- [x] 1.2 Add `buscar_disciplinas` with name OR overdue logic, relevance and ordering
- [x] 1.3 Unit tests for every scenario (`tests/test_hybrid_search.py`)

## 2. API
- [x] 2.1 Add `GET /disciplinas/{ra}/busca` (JWT, ownership check)

## 3. Wrap-up
- [ ] 3.1 Test `/disciplinas/{ra}/busca?q=banco&atrasadas=true` in `/docs` and take a screenshot
- [ ] 3.2 Run `openspec validate add-hybrid-subject-search --strict`
- [ ] 3.3 Run `openspec archive add-hybrid-subject-search --yes`
