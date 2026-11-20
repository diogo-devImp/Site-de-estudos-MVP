## ADDED Requirements

### Requirement: Progress percentage as JSON
The script SHALL compute `percentage = completed / total * 100`, rounded to one decimal place, and
print a JSON object containing the key `percentage`.

#### Scenario: Partial progress
- **WHEN** the script receives completed=3 and total=4
- **THEN** it prints JSON with `percentage` equal to 75.0

#### Scenario: Input through arguments or standard input
- **WHEN** the values are given as `--completed`/`--total` or as a JSON object on standard input
- **THEN** the script produces the same result for both forms

### Requirement: Division by zero handling
The script MUST NOT fail when the total number of tasks is zero.

#### Scenario: Subject without tasks
- **WHEN** the script receives completed=0 and total=0
- **THEN** it prints JSON with `percentage` equal to 0 and exits with code 0

### Requirement: Input validation
The script SHALL reject invalid input with a JSON error message and a non-zero exit code.

#### Scenario: More completed than total
- **WHEN** the script receives completed=5 and total=2
- **THEN** it prints JSON with an `error` message and `percentage` equal to 0 and exits with code 1

#### Scenario: Negative or non-numeric values
- **WHEN** a value is negative, fractional or not a number
- **THEN** it prints JSON with an `error` message and exits with code 1
