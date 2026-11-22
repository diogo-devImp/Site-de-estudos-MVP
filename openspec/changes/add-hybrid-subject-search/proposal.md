# Change: Add hybrid subject search (name OR overdue tasks)

## Why
The course asks for a search that combines the database with Python logic to filter subjects by name or
by overdue tasks. The current filters only match text or dates and cannot answer "which subjects have
late tasks?".

## What Changes
- Add `GET /disciplinas/{ra}/busca` with the optional parameters `q` and `atrasadas`.
- A subject is returned when its name matches `q` OR (with `atrasadas=true`) it has overdue pending tasks.
- Without parameters, all subjects are returned.
- Each result includes `tarefas_atrasadas`, `motivos` and `relevancia`, ordered by relevance and then by
  number of overdue tasks.
- The logic lives in `filters.py` as pure functions (`buscar_disciplinas`, `tarefas_atrasadas`).

## Impact
- Capability: `hybrid-search` (new)
- Code: `filters.py`, `main.py`, `tests/test_hybrid_search.py`
- Requires JWT; the RA comes from the token. Frontend unchanged. Not breaking.
