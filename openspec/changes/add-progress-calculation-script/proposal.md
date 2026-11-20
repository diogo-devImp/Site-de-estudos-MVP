# Change: Add standalone progress calculation script

## Why
The course requires a Python script (`scripts/calculate_progress.py`) that computes the completion
percentage (completed / total) and returns JSON. The backend already weights progress by workload in
`metrics.py`, but there is no small, reusable script that any client or job can call with two numbers.

## What Changes
- Add `scripts/calculate_progress.py` (standard library only) exposing `calculate_progress(completed, total)`.
- The script returns JSON with the key `percentage` and handles division by zero (total 0 gives 0).
- Invalid input (negative, non-numeric, completed greater than total) returns a JSON error and exit code 1.
- Add unit tests in `tests/test_calculate_progress.py`.

## Impact
- Capability: `progress-script` (new)
- Code: `scripts/calculate_progress.py`, `scripts/__init__.py`, `tests/test_calculate_progress.py`
- No endpoint, database or frontend change. Not breaking.
