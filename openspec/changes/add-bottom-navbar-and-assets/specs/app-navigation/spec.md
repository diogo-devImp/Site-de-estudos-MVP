## ADDED Requirements

### Requirement: Bottom navigation bar
The system SHALL show a bottom navigation bar with Home, Disciplinas and Tarefas on screens up to 768px wide.

#### Scenario: Navigate between pages
- **WHEN** the user taps an item of the bar
- **THEN** the corresponding page is shown and the item is marked as active

#### Scenario: Large screens
- **WHEN** the screen is wider than 768px
- **THEN** the bottom bar is hidden and the side menu is used

### Requirement: Icon assets in the repository
The system SHALL keep the navigation icons as SVG files under `assets/icons/`.

#### Scenario: Icons available
- **WHEN** the repository is cloned
- **THEN** `home.svg`, `subjects.svg` and `tasks.svg` exist under `assets/icons/`
