# Change: Add PATCH endpoints for subjects and tasks

## Why
The CRUD contract of the course uses `PATCH /subjects/{id}` for updates. The API only offers `PUT`, which
forces the client to resend every field. While reviewing the endpoints for ownership checks, `PUT
/disciplinas/{id}` was also found to return HTTP 500 instead of 403/404, because the broad exception
handler swallowed the `HTTPException`.

## What Changes
- Add `PATCH /disciplinas/{id}` and `PATCH /tarefas/{id}`: only the editable fields sent are updated.
- Both require the JWT, and the record MUST belong to the authenticated RA (403 otherwise, 404 if missing).
- Protected fields (`id`, `ra_aluno`, `dataConclusao`) are ignored if sent by the client.
- `PATCH /tarefas/{id}` keeps `dataConclusao` server-controlled when `status` changes.
- A request without any editable field returns HTTP 422.
- Fix `PUT /disciplinas/{id}` so 403 and 404 are no longer converted to 500.
- `PUT` endpoints are kept, so the existing frontend keeps working.

## Impact
- Capability: `partial-updates` (new)
- Code: `main.py`, `utils.py` (`extrair_campos_permitidos`), `tests/test_partial_updates.py`
- Not breaking.
