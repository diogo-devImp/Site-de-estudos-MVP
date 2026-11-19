# Change: add-subjects-table

## Why
Standardize the `subjects` specification in English (`snake_case`) for EduTrack AI while aligning with the existing Firebase Firestore setup (`projetoAcad`, collection `disciplinas` and `usuarios`) and user-scoped data isolation.

## What Changes
- Define the `subjects` schema (`id`, `name`, `teacher`, `hours`, `user_id`) and map its correspondence to existing Firebase Firestore fields (`nome`, `professor`, `cargaHoraria`, and user/student scoping such as `ra_aluno` / authenticated user ID).
- Document user-scoped access and filtering rules for `subjects`.

## Impact
- Aligns the OpenSpec proposal with the live Firebase Firestore project without altering existing production data in `disciplinas` or `usuarios`.
- Ensures queries and access rules scope records to the authenticated user.