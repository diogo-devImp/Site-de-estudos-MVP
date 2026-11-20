## 1. Backend
- [x] 1.1 Add `extrair_campos_permitidos` and the editable field lists in `utils.py`
- [x] 1.2 Add `PATCH /disciplinas/{id}` with ownership check
- [x] 1.3 Add `PATCH /tarefas/{id}` keeping `dataConclusao` server-controlled
- [x] 1.4 Fix `PUT /disciplinas/{id}` so 403/404 are not turned into 500

## 2. Tests
- [x] 2.1 Unit tests for the editable-fields helper (`tests/test_partial_updates.py`)

## 3. Wrap-up
- [ ] 3.1 Test in `/docs` with two different users (the second one must get 403)
- [ ] 3.2 Take a screenshot of `/docs` showing the endpoints and of the 403 test
- [ ] 3.3 Run `openspec validate add-partial-update-endpoints --strict`
- [ ] 3.4 Run `openspec archive add-partial-update-endpoints --yes`
