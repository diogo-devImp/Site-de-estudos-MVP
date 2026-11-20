## ADDED Requirements

### Requirement: PDF with progress data
The system SHALL generate a PDF containing the student's name, RA, global progress, task totals,
a per-subject table (workload, completed/total, progress, overdue tasks, forecast) and the alerts.

#### Scenario: Student with subjects and tasks
- **WHEN** the student requests a report
- **THEN** a valid PDF is produced with one row per subject

#### Scenario: Student without data
- **WHEN** the student has no subjects or tasks
- **THEN** a valid PDF is produced stating that no subject is registered

#### Scenario: Special characters
- **WHEN** a subject name contains accents, symbols or markup characters
- **THEN** the PDF is still generated and the text is shown literally

### Requirement: Download link
The system SHALL return a download link after generating the report, and the download SHALL be sent as
an attachment.

#### Scenario: Generate and download
- **WHEN** the student calls `POST /relatorios/{ra}/gerar` and then opens the returned link
- **THEN** the browser downloads a file named `relatorio_<ra>_<date>_<time>.pdf`

### Requirement: Report access control
The system MUST allow a student to download only their own reports, and MUST reject unsafe file names.

#### Scenario: Another student's report
- **WHEN** the file name belongs to a different RA
- **THEN** the system responds with HTTP 404 or 403

#### Scenario: Path traversal attempt
- **WHEN** the file name contains `..` or a path separator
- **THEN** the system responds with HTTP 404 and reads no file
