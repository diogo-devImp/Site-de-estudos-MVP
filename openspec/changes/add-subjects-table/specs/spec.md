# subjects Specification

## Purpose
Define the `subjects` schema and user-scoping rules for EduTrack AI backed by Firebase Firestore.

## ADDED Requirements

### Requirement: Define subjects schema and user scoping
The system SHALL define `subjects` with `id` (auto/document ID), `name` (text/string, mapped from `nome`), `teacher` (text/string, mapped from `professor`), `hours` (int/number, mapped from `cargaHoraria`), and `user_id` (authenticated user identifier / student scope).

#### Scenario: Read or create subject records scoped to authenticated user
- **WHEN** a subject record with `name`, `teacher`, `hours`, and `user_id` is queried or created in Firebase Firestore
- **THEN** the system scopes access to the authenticated user's records rather than exposing all users' data