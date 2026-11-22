## ADDED Requirements

### Requirement: Search subjects by name or overdue tasks
The system SHALL return the subjects whose name matches `q` (ignoring case and accents) OR, when
`atrasadas=true`, that have at least one pending task whose `dataPrevista` is before today.

#### Scenario: Name only
- **WHEN** the student searches `q=algebra`
- **THEN** the subject "Álgebra Linear" is returned with `motivos` equal to ["nome"]

#### Scenario: Overdue only
- **WHEN** the student searches with `atrasadas=true` and no `q`
- **THEN** only subjects with overdue pending tasks are returned, the one with most overdue tasks first

#### Scenario: Name OR overdue
- **WHEN** the student searches `q=banco` and `atrasadas=true`
- **THEN** subjects matching the name and subjects with overdue tasks are both returned

#### Scenario: No parameters
- **WHEN** neither `q` nor `atrasadas` is given
- **THEN** all subjects of the student are returned

### Requirement: What counts as overdue
A task SHALL be overdue only if it is pending and its `dataPrevista` is a valid date before today.

#### Scenario: Completed, due-today or undated tasks
- **WHEN** a task is completed, due today, or has no valid `dataPrevista`
- **THEN** it is not counted as overdue

### Requirement: Relevance ordering
The system SHALL order results by name match quality (exact, starts with, contains), then by number of
overdue tasks.

#### Scenario: Exact name first
- **WHEN** the student searches `q=banco de dados` and "Banco de Dados" and "Banco de Dados Avançado" exist
- **THEN** "Banco de Dados" is listed first

### Requirement: Data isolation
The system MUST return only subjects and tasks of the authenticated student.

#### Scenario: Another student's RA
- **WHEN** the RA in the path differs from the RA in the token
- **THEN** the system responds with HTTP 403
