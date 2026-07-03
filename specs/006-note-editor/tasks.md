# Tasks: Note Editor (JSON Paste, Preview, Save)

**Input**: Design documents from `/specs/006-note-editor/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [quickstart.md](quickstart.md)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Exact file paths are included in every task description

---

## Phase 1: Setup

**Purpose**: Confirm that the base infrastructure needed by the editor already exists, and create the two new source files.

- [X] T001 Create `src/js/editor.js` as an ES module with placeholder exports (`initEditor`)
- [X] T002 [P] Verify `src/css/base.css` contains `.textarea` class; add `.editor-layout` grid class and `.editor-footer` sticky footer class if missing

**Checkpoint**: Both files exist and `editor.html` can import from them without a module resolution error.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Wire the existing auth guard and shared header into `editor.html` so the page is protected and has consistent chrome before any feature logic is added.

- [X] T003 Replace the 22-line stub `src/pages/editor.html` with the full page skeleton: `<head>` with Supabase CDN, `MC_SUPABASE_URL`/`MC_SUPABASE_ANON_KEY` placeholders, `requireAuth()` blocking script, `base.css` link, Google Fonts link, `<title>Note Editor — Medicine Cloud</title>`, and an empty `<body>` with the shared `.app-header` (brand + nav + theme toggle)
- [X] T004 Add the `.editor-layout` two-column grid to `editor.html` `<body>`: left panel (`.editor-panel`) containing the textarea + controls, right panel (`.preview-panel`) containing the preview container with `#note-title`, `#note-meta-bar`, `#note-content` child elements
- [X] T005 Add the sticky `.editor-footer` bar to `editor.html` with a "Save Note" `<button id="saveBtn">` (`.btn .btn-primary`, disabled by default) and a "Clear" `<button id="clearBtn">` (`.btn`)
- [X] T006 Add `<script type="module" src="../js/editor.js"></script>` at the bottom of `editor.html` `<body>`

**Checkpoint**: Open `editor.html` in a browser. It redirects to login if not authenticated. Once signed in, the page shows the two-column layout, the shared header, and the sticky footer — even though no logic runs yet.

---

## Phase 3: User Story 1 — Live JSON Preview (Priority: P1) 🎯 MVP

**Goal**: Paste JSON → debounced parse → renderNote() called → preview panel updates within 300ms; invalid JSON → red error in status bar.

**Independent Test**: Open `editor.html`, paste the minimal valid JSON from quickstart.md Scenario 1, verify preview renders the title; then corrupt the JSON and verify the red error appears.

### Implementation

- [X] T007 [US1] In `src/js/editor.js`: implement `validateSchema(parsed)` — returns `null` on success, or an error string for each missing required field (`title`, `lang`, `content`)
- [X] T008 [US1] In `src/js/editor.js`: implement the debounced `onJsonChange()` function — `clearTimeout`/`setTimeout(300ms)` → `JSON.parse()` → `validateSchema()` → call `renderNote(parsed, previewContainer)` on success or show error on failure
- [X] T009 [US1] In `src/js/editor.js`: wire the `input` event listener on `<textarea id="jsonInput">` to the debounced handler
- [X] T010 [US1] In `src/pages/editor.html`: add the `<textarea id="jsonInput" class="textarea">` inside `.editor-panel`, with a `<div id="statusBar">` status bar element styled via `.error-state` / `.success-state` classes
- [X] T011 [US1] In `src/pages/editor.html` `<head>`: add the template selector `<select id="templateSelect">` populated from `TEMPLATES`; add an `import { loadTemplate, getActiveTemplate, TEMPLATES } from '../js/templates.js'` in `editor.js` and wire the `change` event to call `loadTemplate()` + re-render preview with current valid JSON

**Checkpoint**: `quickstart.md` Scenario 1 steps 4-6 and Scenario 2 all pass.

---

## Phase 4: User Story 2 — Save New Note (Priority: P1)

**Goal**: Click "Save Note" → `createNote()` called → browser navigates to `note.html?id=<new-id>`.

**Independent Test**: Paste valid JSON, click "Save Note", confirm navigation to note reader, check Supabase for the new row.

### Implementation

- [X] T012 [US2] In `src/js/editor.js`: implement `buildPayload(parsed, templateId)` — extracts only the editable fields from the parsed draft and adds `template_id`
- [X] T013 [US2] In `src/js/editor.js`: implement `handleSave()` — checks `isUpdateMode`; in Create Mode calls `createNote(buildPayload(...))`, shows a loading state on the button, handles error (`.error-state` in status bar), on success navigates to `note.html?id=<data.id>`
- [X] T014 [US2] In `src/js/editor.js`: wire the `click` event on `#saveBtn` to `handleSave()`; ensure button is enabled only when `currentValidNote !== null`
- [X] T015 [US2] In `src/js/editor.js`: implement `updateSaveButtonState()` — disables/enables `#saveBtn` and updates its `aria-disabled` attribute based on validation state
- [X] T016 [US2] Import `createNote` from `../js/notes.js` in `editor.js`

**Checkpoint**: `quickstart.md` Scenario 1 steps 7-10 pass. Note visible in Supabase. Zero console errors.

---

## Phase 5: User Story 3 — Update Existing Note (Priority: P1)

**Goal**: `editor.html?id=<uuid>` → fetch note → pre-fill textarea → preview renders → "Update Note" button → `updateNote()` called.

**Independent Test**: Navigate to `editor.html?id=<id>` of a known note, verify pre-fill, modify title, click "Update Note", confirm change in note reader.

### Implementation

- [X] T017 [US3] In `src/js/editor.js`: implement `detectMode()` — reads `URLSearchParams.get('id')`; returns `{ isUpdate: bool, noteId: string|null }`
- [X] T018 [US3] In `src/js/editor.js`: implement `loadNoteForEdit(id)` — calls `getNote(id)`, on error shows `.error-box` in preview panel and returns; on success strips DB-only fields (`id`, `user_id`, `created_at`, `updated_at`, `deleted_at`, `share_token`, `is_public`), sets `textarea.value = JSON.stringify(draft, null, 2)`, and calls `onJsonChange()` immediately (bypassing debounce) to trigger initial render
- [X] T019 [US3] In `src/js/editor.js`: in `initEditor()`, call `detectMode()`, then call `loadNoteForEdit()` if `isUpdate` is true; set `#saveBtn` inner text to "Update Note"
- [X] T020 [US3] In `src/js/editor.js`: in `handleSave()`, call `updateNote(noteId, buildPayload(...))` when `isUpdateMode` is true; navigate to `note.html?id=<noteId>` on success
- [X] T021 [US3] Import `getNote`, `updateNote` from `../js/notes.js` in `editor.js`

**Checkpoint**: `quickstart.md` Scenarios 3 and 7 pass.

---

## Phase 6: User Story 4 — Template Selector Updates Preview (Priority: P1)

**Goal**: Changing the template selector immediately re-renders the preview with the new template CSS.

**Independent Test**: Paste valid JSON, switch to "Academic Dark", confirm preview background changes.

### Implementation

- [X] T022 [US4] In `src/js/editor.js`: implement `initTemplateSelector()` — populates `#templateSelect` `<option>` elements from `TEMPLATES`; sets initial value to `getActiveTemplate()`; calls `loadTemplate(getActiveTemplate())` on startup
- [X] T023 [US4] In `src/js/editor.js`: wire `templateSelect` `change` event — call `loadTemplate(value)`, then if `currentValidNote !== null` call `renderNote(currentValidNote, previewContainer)` to re-render with new tokens

**Checkpoint**: `quickstart.md` Scenario 4 passes.

---

## Phase 7: User Story 5 — Mobile Layout & Sticky Footer (Priority: P2)

**Goal**: Below 768px, editor collapses to single column; sticky footer always visible.

**Independent Test**: DevTools 360px viewport, verify stacked layout and visible footer.

### Implementation

- [X] T024 [US5] In `src/css/base.css` (or `<style>` in `editor.html`): add `.editor-layout` CSS — `display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;` on desktop; `@media (max-width: 767px) { .editor-layout { grid-template-columns: 1fr; } }` for mobile collapse
- [X] T025 [US5] In `src/css/base.css` (or `<style>` in `editor.html`): add `.editor-footer` CSS — `position: fixed; bottom: 0; left: 0; right: 0; z-index: 100; background: var(--cream); border-top: 2.5px solid var(--ink); padding: 0.75rem 1.5rem; display: flex; gap: 1rem; justify-content: flex-end;`; add `padding-bottom: 5rem` to `.editor-layout` so footer doesn't obscure content
- [X] T026 [US5] In `src/js/editor.js`: implement `handleClear()` — if textarea non-empty, call `confirm("Clear all content? This cannot be undone.")`, on "OK" reset `textarea.value`, clear `currentValidNote`, call `renderNote` with empty state (or clear preview manually), reset status bar

**Checkpoint**: `quickstart.md` Scenarios 5 and 6 pass.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final accessibility, SEO, reduced-motion, and validation polish.

- [X] T027 [P] Add `<meta name="description">` and correct `<title>` to `editor.html` (§8.1 SEO)
- [X] T028 [P] Add visible `focus` indicators on `#jsonInput` and `#saveBtn` (§8.4 WCAG 2.1 AA)
- [X] T029 [P] Wrap all `editor.js` async operations (`handleSave`, `loadNoteForEdit`) in try/catch with explicit `.error-state` error messages (§8.6)
- [X] T030 [P] Add `@media (prefers-reduced-motion: reduce)` override to disable the save button loading animation (§8.5)
- [X] T031 Run `quickstart.md` all 7 scenarios; fix any failures
- [X] T032 [P] Verify zero console errors on all happy path flows (SC-006)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately. T001 and T002 are parallel.
- **Phase 2 (Foundational)**: Depends on Phase 1. Must complete before any user story work.
- **Phases 3–6 (US1–US4, all P1)**: All depend on Phase 2 completion. US1 (Phase 3) must be done before US2 (Phase 4) because `currentValidNote` and the render pipeline must exist before the save handler can use them. US3 (Phase 5) depends on US2 (`handleSave` must exist). US4 (Phase 6) can run in parallel with US2/US3 since it only touches the template selector wiring.
- **Phase 7 (US5, P2)**: Can start after Phase 2 (layout is CSS-only + clear handler).
- **Phase 8 (Polish)**: Depends on all P1 stories complete.

### Story Completion Order

```
Phase 1 → Phase 2 → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3)
                ↘ Phase 6 (US4, parallel with US2/US3)
                ↘ Phase 7 (US5, parallel)
                                      → Phase 8 (Polish)
```

### Parallel Opportunities

- T001 and T002 (Phase 1)
- T022 and T023 (US4) can run in parallel with T017-T021 (US3)
- T024 and T025 (US5 layout/CSS) can run in parallel with all P1 story work
- All Phase 8 tasks marked [P] can run concurrently

---

## Implementation Strategy

### MVP Scope (Phase 1 → Phase 3)

Complete Phases 1, 2, and 3 only (T001–T011). This delivers:
- Authenticated, styled editor page
- Live JSON preview with validation errors

Stop and validate with quickstart.md Scenarios 1 and 2 before continuing.

### Incremental Delivery

1. **MVP** (Phases 1–3): Live preview — fully usable to preview notes without saving.
2. **Add Save** (Phase 4): T012–T016 — completes the create flow.
3. **Add Edit** (Phase 5): T017–T021 — enables updating existing notes.
4. **Add Template** (Phase 6): T022–T023 — template selector live in preview.
5. **Add Mobile** (Phase 7): T024–T026 — responsive layout + clear.
6. **Polish** (Phase 8): T027–T032 — accessibility, SEO, error handling.

---

## Notes

- `currentValidNote` is the module-level variable in `editor.js` holding the last successfully parsed and schema-validated note object. It is `null` when textarea is empty or invalid.
- `isUpdateMode` is a module-level boolean set once by `detectMode()` on page load.
- `renderNote()` modifies `document.documentElement.lang` and `.dir` — this is fine since the editor preview mirrors what the note reader would show.
- The preview container inside `.preview-panel` must contain `#note-title`, `#note-meta-bar`, and `#note-content` as direct or descendant elements, since `renderNote()` uses `containerEl.querySelector()` to find them.
