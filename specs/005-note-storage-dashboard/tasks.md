# Tasks: Note Storage & Dashboard (Supabase CRUD)

**Input**: Design documents from `specs/005-note-storage-dashboard/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database provisioning documentation and workflows.

- [X] T001 Append SQL initialization scripts for `notes` table, RLS policies, and timestamp triggers to `dev/SETUP.md`
- [X] T002 Create the GitHub Actions scheduled cron keep-alive workflow file at `.github/workflows/keep-alive.yml`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: API persistence database wrappers.

- [X] T003 Implement `createNote`, `getNote`, `listNotes`, and `listTrash` API database queries returning wrapper structures in `src/js/notes.js`
- [X] T004 Implement `updateNote`, `softDeleteNote`, `restoreNote`, and `hardDeleteNote` API database queries returning wrapper structures in `src/js/notes.js`

---

## Phase 3: User Story 1 - View Notes Grid on Dashboard (Priority: P1)

**Goal**: Load, fetch, and render the user's active notes in a responsive card grid, showing empty states if empty.

**Independent Test**: Load `dashboard.html` with zero notes (confirm empty state displays), then insert note manually in DB (confirm card appears).

### Implementation for User Story 1

- [X] T005 [P] [US1] Inject credentials script placeholders and import blocking auth route check in `src/pages/dashboard.html`
- [X] T006 [P] [US1] Implement CSS-only loading spinner element and toggle visibility rules in `src/pages/dashboard.html`
- [X] T007 [P] [US1] Implement Empty State container structure (flask SVG, text labels, and New Note button link) in `src/pages/dashboard.html`
- [X] T008 [US1] Implement active grid view and render notes cards styled with neo-brutalist cards (`.card` + `.card-body`), clamp rules, tags, and dates on load in `src/pages/dashboard.html`

---

## Phase 4: User Story 2 - Soft-Delete Note and View in Trash (Priority: P1)

**Goal**: Users can delete notes via option modals and inspect them in trash views.

**Independent Test**: Click Delete in menu, confirm modal overlays, check Trash view and verify deleted note displays.

### Implementation for User Story 2

- [X] T009 [P] [US2] Implement Card options menu dropdown UI (⋯) container and option links on note cards in `src/pages/dashboard.html`
- [X] T010 [US2] Implement soft-delete confirmation modal element (`.modal-overlay` + `.modal`) and wire click handlers to trigger database updates in `src/pages/dashboard.html`
- [X] T011 [US2] Implement toggleable Trash view sub-grid layout listing soft-deleted notes with deletion timestamps in `src/pages/dashboard.html`

---

## Phase 5: User Story 3 - Restore Soft-Deleted Note (Priority: P1)

**Goal**: Revert soft-delete status of note in trash and return it to active dashboard list.

**Independent Test**: Click Restore in Trash view, verify note returns to dashboard active list.

### Implementation for User Story 3

- [X] T012 [US3] Implement and bind the Restore click action handler on trash note cards to update `deleted_at = null` and refresh views in `src/pages/dashboard.html`

---

## Phase 6: User Story 4 - Hard-Delete Note with Double Confirmation (Priority: P1)

**Goal**: Permanently delete note from database after confirming second verification overlay.

**Independent Test**: Click Permanently Erase in trash, verify secondary modal displays, click confirm, verify row is gone from DB.

### Implementation for User Story 4

- [X] T013 [US4] Implement secondary erase confirmation modal warning overlay for permanent purges in `src/pages/dashboard.html`
- [X] T014 [US4] Bind the Eerily-confirm erase button action to call `hardDeleteNote()` API and refresh trash view in `src/pages/dashboard.html`

---

## Phase 7: User Story 5 - Cross-User Isolation (Priority: P1)

**Goal**: Enforce database level security segregation restricting note queries.

**Independent Test**: Attempt cross-user note queries in DB console session and verify empty results are returned.

### Implementation for User Story 5

- [X] T015 [US5] Verify that the Supabase query SELECT instructions filter records automatically by the current user session ID in `src/js/notes.js`

---

## Phase 8: User Story 6 - Supabase Free Tier Keep-Alive (Priority: P2)

**Goal**: Ensure database instance stays warm using scheduled cron task.

**Independent Test**: Run keep-alive GHA dispatch manually in actions panel and verify successful code 200 execution.

### Implementation for User Story 6

- [X] T016 [US6] Setup keep-alive GHA secrets parameters and test manual action dispatch runs in GitHub panel for `.github/workflows/keep-alive.yml`

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, responsiveness, and performance validation.

- [X] T017 Validate responsive grid layouts down to mobile breakpoint viewports of 360px on `src/pages/dashboard.html`
- [X] T018 Execute all CRUD validation scenarios 1-6 in `quickstart.md` and confirm zero console errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Concurrent with Phase 2.
- **Foundational (Phase 2)**: API logic stubs block UI controllers.
- **User Story 1 (View Grid)**: Blocks User Story 2, 3, 4.
- **User Story 2 (Soft Delete)**: Requires User Story 1.
- **User Story 3 (Restore)**: Requires User Story 2.
- **User Story 4 (Hard Delete)**: Requires User Story 2.
- **User Story 5 (Isolation)**: Requires User Story 1.
- **User Story 6 (Keep-Alive)**: Independent setup.
- **Polish (Phase 9)**: Executed after all other tasks are complete.

### Parallel Opportunities

- Creation of workflow file (T002) and documentation (T001) can run in parallel.
- Spinner (T006) and Empty State (T007) layouts can run in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 & 2 Only)

1. Provision database table and RLS settings (Phase 1)
2. Setup notes CRUD module handlers (Phase 2)
3. Load active notes grid dashboard (Phase 3)
4. Implement soft-delete modals and trash toggle (Phase 4)
5. **STOP and VALIDATE**: Verify active grid and soft deletes are working.
