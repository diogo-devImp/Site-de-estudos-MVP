## 1. Script
- [x] 1.1 Create `scripts/calculate_progress.py` with `calculate_progress` and a CLI entry point
- [x] 1.2 Handle division by zero (total 0 returns percentage 0)
- [x] 1.3 Validate input and return a JSON error with exit code 1

## 2. Tests
- [x] 2.1 Unit tests for every scenario in the spec (`tests/test_calculate_progress.py`)

## 3. Wrap-up
- [ ] 3.1 Run `python scripts/calculate_progress.py --completed 3 --total 4` and take a screenshot
- [ ] 3.2 Run `openspec validate add-progress-calculation-script --strict`
- [ ] 3.3 Run `openspec archive add-progress-calculation-script --yes`
