# Change: Add PDF progress report

## Why
Students need a shareable document with their academic progress. The data already exists in
`GET /metricas/{ra}`; it only needs to be rendered as a PDF with a Python library.

## What Changes
- Add `reports.py` that renders the metrics as a PDF with `reportlab` (summary, table per subject, alerts).
- Add `POST /relatorios/{ra}/gerar`, which creates the file and returns a download link.
- Add `GET /relatorios/{ra}/download/{arquivo}`, which sends the file with `Content-Disposition: attachment`.
- Add a "download PDF" button to the dashboard.
- Add `reportlab` to `requirements.txt` and `reports/` to `.gitignore`.

## Impact
- Capability: `pdf-report` (new)
- Code: `reports.py`, `main.py`, `requirements.txt`, `.gitignore`, `js/services/relatoriosService.js`,
  `js/views/dashboardView.js`, `tests/test_reports.py`
- Requires JWT. Reports are not served from a public folder. Not breaking.
