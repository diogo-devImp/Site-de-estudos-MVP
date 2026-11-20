# Change: Add bottom navigation bar and icon assets

## Why
The interface must have Home, Subjects and Tasks pages reachable through a navigation bar, and the icons
must be kept as assets in the repository. The pages already exist, but only a side menu is available,
which is hard to use on phones.

## What Changes
- Add a bottom navigation bar with Home, Disciplinas and Tarefas, visible only on small screens.
- Add the icons `home.svg`, `subjects.svg` and `tasks.svg` under `assets/icons/`.
- Create `assets/images/` for future images.

## Impact
- Capability: `app-navigation` (new)
- Code: `js/app.js`, `css/carbon-theme.css`, `assets/`
- The side menu is unchanged on large screens. Not breaking.
