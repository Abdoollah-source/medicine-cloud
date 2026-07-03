# Tasks: PDF Export (Serverless)

**Input**: Design documents from `/specs/008-pdf-export/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [quickstart.md](quickstart.md)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Exact file paths are included in every task description

---

## Phase 1: Setup

**Purpose**: Prepare source files and verify environment definitions.

- [X] T001 Verify `src/functions/pdf-export.js` and `src/js/pdf.js` exist in workspace and can be loaded
- [X] T002 Add `CLOUDFLARE_WORKER_URL` placeholder or environment reference to `src/pages/note.html` head configuration block

**Checkpoint**: Setup complete, files verified.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the database sharing mechanisms, CRUD methods, and page-level authentication bypass so Chromium can access note content.

- [X] T003 [P] Add the public RLS SELECT policy to Supabase: `CREATE POLICY "Public share read" ON notes FOR SELECT USING (is_public = TRUE AND share_token IS NOT NULL);`
- [X] T004 In `src/js/notes.js`: implement `enableSharing(id)` to update `is_public = true` and generate a `share_token` (UUID) using `crypto.randomUUID()`
- [X] T005 In `src/js/notes.js`: implement `getNoteByShareToken(token)` to retrieve a note row by token without requiring owner session
- [X] T006 [P] In `src/js/auth.js`: update `requireAuth()` to return `null` immediately and bypass redirection if `window.location.search` contains a `token` parameter
- [X] T007 In `src/pages/note.html`: update DOM loading module to check if `token` query param is present; if so, fetch note via `getNoteByShareToken(token)` and disable/hide owner-only controls (Sign Out, Settings, template switcher, edit indicators)

**Checkpoint**: Bypassing auth via `note.html?token=<token>` works. Unauthenticated users can load a note if public and token is valid.

---

## Phase 3: User Story 1 — Cloudflare Worker (Priority: P1) 🎯 MVP

**Goal**: Build the serverless function that opens headless Chromium, visits the target URL, and prints it to PDF.

**Independent Test**: Fetch the worker URL directly with a valid query param and check if it outputs a PDF file.

### Implementation

- [X] T008 [US1] In `src/functions/pdf-export.js`: parse target `url` parameter from request query string
- [X] T009 [US1] In `src/functions/pdf-export.js`: fetch `APP_ORIGIN` env variable and reject any target URL whose origin does not match `APP_ORIGIN` with HTTP `403 Forbidden`
- [X] T010 [US1] In `src/functions/pdf-export.js`: intercept `OPTIONS` requests and return standard CORS access headers (`Access-Control-Allow-Origin: *`, allowed methods, headers)
- [X] T011 [US1] In `src/functions/pdf-export.js`: load `@cloudflare/puppeteer` and launch browser instance bound to `env.MY_BROWSER`
- [X] T012 [US1] In `src/functions/pdf-export.js`: navigate to target URL, waiting for `networkidle0` with a timeout of 10 seconds
- [X] T013 [US1] In `src/functions/pdf-export.js`: call `page.pdf()` specifying A4 format, custom margins (20mm top/bottom, 15mm left/right), and `printBackground: true`, then return the PDF binary stream with `Content-Type: application/pdf`

**Checkpoint**: Worker is fully functional and prints any same-origin URL passed in.

---

## Phase 4: User Story 2 — Client PDF Export Integration (Priority: P1)

**Goal**: Click export button → retrieve PDF binary from worker → download as file.

**Independent Test**: Click button, verify loading spinner changes, verify file downloads.

### Implementation

- [X] T014 [US2] In `src/js/pdf.js`: implement `requestPDFExport(note, templateId)` which calls `enableSharing(note.id)` if `share_token` is missing, constructs the public URL, fetches the worker binary, and prompts a local file download
- [X] T015 [US2] In `src/pages/note.html`: add "Export as PDF" button (`#btnExportPdf`) inside top-controls, styled using the `.btn` design system class
- [X] T016 [US2] In `src/pages/note.html`: add simple CSS border spinner rules for `.btn-spinner` in the style tag or template stylesheet
- [X] T017 [US2] In `src/pages/note.html`: wire `#btnExportPdf` click handler to enable loading spinner, call `requestPDFExport()`, and handle failure states with visible error elements

**Checkpoint**: PDF Export button works end-to-end. Click triggers worker, downloads PDF, manages loading text.

---

## Phase 5: User Story 3 — Origin and Safety Whitelisting (Priority: P1)

**Goal**: Confirm security controls prevent proxy misuse.

**Independent Test**: direct query to worker with a foreign origin returns 403.

### Implementation

- [X] T018 [US3] Verify worker returns `403 Forbidden` on foreign targets (Scenario 2 of quickstart)
- [X] T019 [US3] In `src/js/pdf.js`: implement filename generation `medicine-cloud-<slug>-<YYYY-MM-DD>.pdf` where slug is generated from note title (lowercase, no special characters, max 80 chars)

**Checkpoint**: Worker origin lock verified and filenames are correctly formatted.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Visual styling verification, timeout tuning, and clean error states.

- [X] T020 [P] Verify page margins and header controls match design tokens in exported PDF outputs
- [X] T021 [P] Ensure `@media (prefers-reduced-motion: reduce)` disables the spinner border animation in client CSS
- [X] T022 Run `quickstart.md` all 4 validation scenarios and confirm success

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Can start immediately.
- **Phase 2 (Foundational)**: Setup must be complete. RLS policies and `notes.js` methods are needed before worker public access can be tested.
- **Phase 3 (Worker — US1)**: Target bypass route must exist in note.html/auth.js (T006-T007) so Chromium can fetch page content successfully.
- **Phase 4 (Client — US2)**: Worker must be completed (Phase 3) to test client retrieval.
- **Phases 5 & 6 (Polish)**: Depend on client integration.

### Parallel Opportunities
- T003 (RLS policy) and T006 (auth bypass) can run in parallel.
- CSS spinner design (T016) can run concurrently with worker development.
- Phase 6 polish tasks (T020-T021) can run in parallel.
