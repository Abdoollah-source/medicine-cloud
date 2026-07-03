# Tasks: Note Sharing

**Input**: Design documents from `/specs/009-note-sharing/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [quickstart.md](quickstart.md)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Exact file paths are included in every task description

---

## Phase 1: Setup

**Purpose**: Confirm file structure and plan details.

- [X] T001 Confirm `src/js/notes.js`, `src/js/auth.js`, and `src/pages/note.html` are available for edit

**Checkpoint**: Setup complete.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish database sharing configurations and sharing CRUD endpoints.

- [X] T002 [P] Create RLS SELECT policy: `CREATE POLICY "Public share read" ON notes FOR SELECT USING (is_public = TRUE AND share_token IS NOT NULL);`
- [X] T003 In `src/js/notes.js`: implement `enableSharing(id)` to update `is_public = true` and generate a `share_token` (UUID) using `crypto.randomUUID()`
- [X] T004 In `src/js/notes.js`: implement `revokeSharing(id)` to update `is_public = false` and `share_token = null`
- [X] T005 In `src/js/notes.js`: implement `getNoteByShareToken(token)` to select a note matching `share_token` where `is_public = true`
- [X] T006 [P] In `src/js/auth.js`: update `requireAuth()` to bypass redirect checks and return `null` if the URL contains a `share` parameter
- [X] T007 In `src/pages/note.html`: update initialization routing to distinguish `?id=` (authenticated) and `?share=` (public) modes, and fetch public notes via `getNoteByShareToken(token)`

**Checkpoint**: Foundational routes and CRUD methods written. Public notes can be fetched by token without active login sessions.

---

## Phase 3: User Story 1 — Generate Public Share Link (Priority: P1) 🎯 MVP

**Goal**: Owner can click "Generate Share Link" → generates token, displays copyable URL in read-only input.

**Independent Test**: Load note with `?id=<id>`, click "Generate Share Link", check if share panel shows URL `note.html?share=<uuid>`.

### Implementation

- [X] T008 [US1] In `src/pages/note.html`: add the share panel HTML template (`#share-panel`) below the note container, using a `.card` class wrapper
- [X] T009 [US1] In `src/pages/note.html`: add CSS styles for the share panel cards, status tags (`.tag`), and input controls, enforcing zero rounded corners and no blur
- [X] T010 [US1] In `src/pages/note.html` module script: import `enableSharing` from `../js/notes.js`
- [X] T011 [US1] In `src/pages/note.html`: implement `renderSharePanel(note)` helper to toggle visible controls based on `note.is_public` (Private badge and Generate button vs Public badge, read-only URL input, Copy, and Revoke buttons)
- [X] T012 [US1] In `src/pages/note.html`: bind click listener to `#btnGenerateShare` to invoke `enableSharing()`, update local note state, and re-render the share panel
- [X] T013 [US1] In `src/pages/note.html`: bind click listener to `#btnCopyShare` to copy `#share-url` value to the clipboard, switching button text to "Copied!" for 2 seconds

**Checkpoint**: Owners can generate and copy share links from `note.html`.

---

## Phase 4: User Story 2 — Unauthenticated Public Reading (Priority: P1)

**Goal**: Visitors can view public notes via `?share=<UUID>` with owner elements hidden.

**Independent Test**: Load share URL in Incognito window. Verify note renders and owner controls/sign out buttons are hidden.

### Implementation

- [X] T014 [US2] In `src/pages/note.html` initialization script: if `share` parameter is present, fetch the note via `getNoteByShareToken(token)`
- [X] T015 [US2] In `src/pages/note.html`: if loaded in public mode, hide the settings cog, edit icons, dashboard back links, sign out buttons, and the share panel itself
- [X] T016 [US2] In `src/pages/note.html`: on note fetch error (e.g. note not public or wrong token), render the "Note not found or no longer shared" error box

**Checkpoint**: External users can read notes via share links. Owner chrome is hidden.

---

## Phase 5: User Story 3 & 4 — Revoke Note Sharing & Isolation (Priority: P1)

**Goal**: Revoke link → invalidates link. Accessing other user's private note → blocks and errors.

**Independent Test**: Revoke link, reload in Incognito window, verify error box.

### Implementation

- [X] T017 [US3] In `src/pages/note.html` module script: import `revokeSharing` from `../js/notes.js`
- [X] T018 [US3] In `src/pages/note.html`: bind click listener to `#btnRevokeShare` to invoke `revokeSharing()`, update local note state, and re-render the share panel
- [X] T019 [US4] Verify database RLS ownership policies prevent User B from selecting User A's note via `?id=` (already covered by owner select RLS)

**Checkpoint**: Share links can be revoked successfully, blocking subsequent public fetches.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Styling constraints, clipboard fallbacks, and scenario QA.

- [X] T020 [P] In `src/pages/note.html` copy link handler: implement manual highlight-selection fallback if clipboard API fails
- [X] T021 [P] Ensure the share panel styling does not violate any design tokens (border `2.5px solid var(--ink)`, no border-radius)
- [ ] T022 Run `quickstart.md` all 4 validation scenarios and confirm success

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Can start immediately.
- **Phase 2 (Foundational)**: Setup must be complete.
- **Phase 3 (Generate Share Link — US1)**: Foundational database methods must exist.
- **Phase 4 (Public Reading — US2)**: Route bypass and token fetching must exist.
- **Phase 5 (Revocation — US3)**: Depends on Phase 3 and Phase 4.
- **Phase 6 (Polish)**: Depends on all functional phases.

### Parallel Opportunities
- T002 (RLS policy) and T006 (auth bypass) can run in parallel.
- Card styling additions (T009) can run concurrently with CRUD endpoint updates.
- Clipboard fallbacks (T020) can run in parallel with visual checks (T021).
