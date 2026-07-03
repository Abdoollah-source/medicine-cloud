# Tasks: Project Foundation & File Structure

**Input**: Design documents from `specs/001-project-foundation/`

**Prerequisites**: plan.md (required), spec.md (required), data-model.md (required), quickstart.md

**Organization**: Tasks are grouped by phase and user story. All tasks target the live repository root (not `specs/`).

---

## Phase 1: Directory Scaffold

**Purpose**: Create every folder required by Constitution §10.1 so subsequent tasks have valid write targets.

- [x] T001 [P] Create `src/css/templates/` directory (and parent `src/css/`) if not present
- [x] T002 [P] Create `src/js/` directory if not present
- [x] T003 [P] Create `src/pages/` directory if not present
- [x] T004 [P] Create `src/functions/` directory if not present
- [x] T005 [P] Create `dev/` directory if not present

---

## Phase 2: Environment & Version Control

**Purpose**: Lock down secrets, establish `.gitignore`, and initialise the git repository.

- [x] T006 [P] [US3] Initialise git repository (`git init`) if `.git/` directory does not already exist
- [x] T007 [P] [US3] Write `.gitignore` — must exclude `.env`, `node_modules/`, `.DS_Store`, `*.log`
- [x] T008 [P] [US3] Write `.env.example` — four empty placeholder lines: `SUPABASE_URL=`, `SUPABASE_ANON_KEY=`, `SUPABASE_SERVICE_ROLE_KEY=`, `CLOUDFLARE_WORKER_URL=`
- [x] T009 [US3] Write `.env` — identical placeholders to `.env.example` (never committed; excluded by `.gitignore`)

---

## Phase 3: User Story 1 — Directory Layout (Priority: P1)

**Goal**: Prove that every expected directory exists and is addressable.

**Independent Test**: Run `Get-ChildItem src -Recurse -Directory` in PowerShell and confirm `css`, `css/templates`, `js`, `pages`, and `functions` all appear.

### Implementation for User Story 1

- [x] T010 [P] [US1] Verify `src/css/templates/` exists (created in Phase 1)
- [x] T011 [P] [US1] Verify `src/js/` exists
- [x] T012 [P] [US1] Verify `src/pages/` exists
- [x] T013 [P] [US1] Verify `src/functions/` exists

---

## Phase 4: User Story 2 — Skeleton Stubs (Priority: P1)

**Goal**: Create all stub source files so the app shell loads in a browser with zero console errors.

**Independent Test**: Open `src/index.html` in Chrome; confirm console prints `Medicine Cloud: app.js loaded` and no errors appear.

### CSS Stubs

- [x] T014 [P] [US2] Write `src/css/base.css` — empty stub with comment `/* SPEC-0 will populate this file */`
- [x] T015 [P] [US2] Write `src/css/templates/classic.css` — empty stub with comment `/* Template override stub — SPEC-0 will populate */`

### JS Module Stubs

- [x] T016 [P] [US2] Write `src/js/app.js` — ES module stub that logs `Medicine Cloud: app.js loaded` on import
- [x] T017 [P] [US2] Write `src/js/auth.js` — ES module stub exporting a named `auth` object placeholder
- [x] T018 [P] [US2] Write `src/js/notes.js` — ES module stub exporting a named `notes` object placeholder
- [x] T019 [P] [US2] Write `src/js/renderer.js` — ES module stub exporting `processMediaTags()` and `escapeHtml()` (FR-004)
- [x] T020 [P] [US2] Write `src/js/export.js` — ES module stub exporting a named `exportNote` function placeholder
- [x] T021 [P] [US2] Write `src/js/pdf.js` — ES module stub exporting a named `requestPdf` function placeholder
- [x] T022 [P] [US2] Write `src/js/templates.js` — ES module stub exporting a named `loadTemplate` function placeholder
- [x] T023 [P] [US2] Write `src/functions/pdf-export.js` — Cloudflare Worker stub: `export default { fetch() { return new Response('pdf-export stub') } }`

### HTML Pages

- [x] T024 [P] [US2] Write `src/index.html` — HTML5 shell with `<link>` to `css/base.css`, `<script type="module" src="js/app.js">`, and `<div id="app">` (FR-002)
- [x] T025 [P] [US2] Write `src/pages/login.html` — minimal HTML5 stub, title "Login — Medicine Cloud"
- [x] T026 [P] [US2] Write `src/pages/dashboard.html` — minimal HTML5 stub, title "Dashboard — Medicine Cloud"
- [x] T027 [P] [US2] Write `src/pages/editor.html` — minimal HTML5 stub, title "Editor — Medicine Cloud"
- [x] T028 [P] [US2] Write `src/pages/note.html` — minimal HTML5 stub, title "Note — Medicine Cloud"
- [x] T029 [P] [US2] Write `src/pages/settings.html` — minimal HTML5 stub, title "Settings — Medicine Cloud"

---

## Phase 5: User Story 3 — Configuration & SETUP.md (Priority: P1)

**Goal**: Ship the developer setup guide and validate `.env` is correctly excluded from version control.

**Independent Test**: Run `git status` and confirm `.env` is not tracked. Open `dev/SETUP.md` and verify all five required sections are present.

### Implementation for User Story 3

- [x] T030 [US3] Write `dev/SETUP.md` — full human-readable guide with exactly these five sections:
  1. **Supabase project creation** (create project, retrieve URL + keys)
  2. **Google OAuth setup in Supabase** (enable provider, add redirect URIs)
  3. **`.env` configuration** (copy `.env.example`, fill credentials)
  4. **Cloudflare Pages connection** (link repo, set build/publish dir, add env vars)
  5. **Keep-alive / cold-start** (schedule cron to prevent function sleep)

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Manual validation, git status check, and cross-file consistency audit.

- [x] T031 Open `src/index.html` in a browser and verify zero console errors and the `app.js` boot log message (SC-002)
- [x] T032 Run `git status` and confirm `.env` is excluded (SC-003)
- [x] T033 Verify all 17 files listed in `data-model.md` exist in the correct paths (SC-001)
- [x] T034 Audit all stub JS files for valid ES module syntax (no parse errors when imported)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Directories)**: No dependencies — start immediately; all tasks [P] parallel
- **Phase 2 (Environment)**: No dependencies — run concurrently with Phase 1
- **Phase 3 (Directory Verification)**: Depends on Phase 1 completion
- **Phase 4 (Skeleton Stubs)**: Depends on Phase 1 completion; all stub writes [P] parallel
- **Phase 5 (SETUP.md)**: Depends on Phase 2 (git init) and Phase 1 (dev/ directory)
- **Phase 6 (Polish)**: Depends on all prior phases

### Parallel Opportunities

- All T001–T005 (directory creation) can run in parallel
- All T006–T009 (environment files) can run in parallel
- All T014–T029 (stub file writes) can run in parallel once directories exist
- T031 and T032 can run in parallel during validation

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 (Directories) + Phase 2 (Environment) simultaneously
2. Complete Phase 4 (Stub Files) — all [P] parallel
3. Complete Phase 5 (SETUP.md)
4. **STOP and VALIDATE**: Run browser + git status checks (Phase 6)

---

## Convergence

> If `/speckit-converge` identifies gaps after implementation, append remediation tasks here as a Phase 7 block.
