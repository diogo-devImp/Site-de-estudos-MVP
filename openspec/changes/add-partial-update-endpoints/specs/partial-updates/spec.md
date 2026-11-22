## ADDED Requirements

### Requirement: Partial update of subjects and tasks
The system SHALL provide `PATCH /disciplinas/{id}` and `PATCH /tarefas/{id}` that update only the
editable fields present in the request body.

#### Scenario: Update only the status of a task
- **WHEN** the owner sends `PATCH /tarefas/{id}` with `{"status": "Concluída"}`
- **THEN** only the status changes and `dataConclusao` is set by the server

#### Scenario: Protected fields are ignored
- **WHEN** the body contains `ra_aluno`, `id` or `dataConclusao`
- **THEN** those values are not written

#### Scenario: Empty update
- **WHEN** the body contains no editable field
- **THEN** the system responds with HTTP 422

### Requirement: Ownership enforcement
The system MUST allow a user to change only their own records.

#### Scenario: Another student's record
- **WHEN** a user sends PATCH, PUT or DELETE for a record whose `ra_aluno` differs from the token's RA
- **THEN** the system responds with HTTP 403 and changes nothing

#### Scenario: Missing record
- **WHEN** the id does not exist
- **THEN** the system responds with HTTP 404 (not 500)

#### Scenario: Missing token
- **WHEN** the request has no Bearer token
- **THEN** the system responds with HTTP 401
