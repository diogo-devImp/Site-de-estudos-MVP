## 1. PDF generation (Python)
- [x] 1.1 Add `reports.py` with `gerar_relatorio_pdf`, `nome_arquivo_relatorio`, `nome_arquivo_valido`
- [x] 1.2 Limit table rows and alerts to keep generation fast
- [x] 1.3 Unit tests (`tests/test_reports.py`)

## 2. API
- [x] 2.1 Add `POST /relatorios/{ra}/gerar` returning the download link
- [x] 2.2 Add authenticated `GET /relatorios/{ra}/download/{arquivo}` as attachment
- [x] 2.3 Add `reportlab` to `requirements.txt` and `reports/` to `.gitignore`

## 3. Frontend
- [x] 3.1 Add `relatoriosService.js` and the download button in the dashboard

## 4. Wrap-up
- [ ] 4.1 Run the real flow (login, create tasks, click the button) and keep the generated PDF
- [ ] 4.2 Run `openspec validate add-pdf-progress-report --strict`
- [ ] 4.3 Run `openspec archive add-pdf-progress-report --yes`
