# Tasks: HTML Export

**Input**: Design documents from `/specs/007-html-export/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [quickstart.md](quickstart.md)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Exact file paths are included in every task description

---

## Phase 1: Setup

**Purpose**: Prepare the two files that will be modified — no functional logic yet.

- [X] T001 Confirm `src/js/export.js` exists (5-line stub) and clear it to an empty ES module with only `export { exportHTML };` so downstream imports don't break during development
- [X] T002 [P] Confirm `src/pages/note.html` `.top-controls` bar exists and identify the exact insertion point for the export button (after `#btnSignOut`)

**Checkpoint**: Both files open without errors; `note.html` loads normally with no regressions.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the two pure utility helpers that every other task depends on — slug generation and CSS fetching. These have no DOM side effects and can be verified in isolation.

- [X] T003 In `src/js/export.js`: implement `makeSlug(title)` — lowercase, spaces→hyphens, strip non-`[a-z0-9-]`, collapse consecutive hyphens, trim edges, `slice(0, 80)`, fallback to `'note'` if empty
- [X] T004 In `src/js/export.js`: implement `makeFilename(slug)` — returns `'medicine-cloud-' + slug + '-' + new Date().toISOString().slice(0, 10) + '.html'`
- [X] T005 In `src/js/export.js`: implement `fetchCss(templateId)` — derives `baseUrl` from `new URL('../css/', location.href).href`; calls `Promise.all([fetch(base + 'base.css'), fetch(base + 'templates/' + templateId + '.css')])`; on any non-ok response throws a descriptive `Error`; returns `{ baseCss, templateCss }` text strings

**Checkpoint**: Call `makeSlug('Acid-Base Disorders')` in the browser console → `'acid-base-disorders'`. Call `makeSlug('!@#$%')` → `'note'`. Call `makeFilename('test')` → `'medicine-cloud-test-2026-07-03.html'`.

---

## Phase 3: User Story 1 — Download a Self-Contained HTML File (Priority: P1) 🎯 MVP

**Goal**: Click "Export as HTML" → browser downloads a `.html` file that renders the note offline with full styling, correct fonts, and working lang/theme toggles.

**Independent Test**: Open a note, click "Export as HTML", open the downloaded file offline, verify full note rendering with zero console errors.

### Implementation

- [X] T006 [US1] In `src/js/export.js`: implement `buildExportableNote(note)` — picks only `title`, `lang`, `content`, `template_id` (plus `alt`, `subject`, `unit`, `date` if truthy) from the note object; strips all DB-only fields
- [X] T007 [US1] In `src/js/export.js`: define the renderer IIFE string constant `RENDERER_IIFE` — a self-contained IIFE version of `renderer.js` that attaches `renderNote`, `sanitiseContent`, `processMediaTags`, `escapeHtml` to `window.MC`
- [X] T008 [US1] In `src/js/export.js`: implement `buildHydrationScript(note)` — returns the hydration IIFE string: reads `#note-data` JSON, wires theme toggle (`applyTheme` / `prefersDark` / `localStorage`), wires lang toggle (conditional on `noteData.alt`, updates label), calls `window.MC.renderNote(noteData, noteContainer)` on DOMContentLoaded
- [X] T009 [US1] In `src/js/export.js`: implement `buildDocument(exportNote, baseCss, templateCss)` — assembles the full HTML string in order: DOCTYPE + `<html lang dir>`, `<head>` (charset, viewport, title, meta description, Google Fonts CDN link tags hardcoded, `<style>` with `baseCss + templateCss`), full `<body>` structure mirroring `note.html` (`.grain`, `.corner` ×4, `.plate` with `.top-row` / `.main-block` / `.bottom-row`) but with Sign Out button omitted and template selector hidden, `<script id="note-data">`, renderer IIFE `<script>`, hydration `<script>`
- [X] T010 [US1] In `src/js/export.js`: implement `triggerDownload(htmlString, filename)` — creates `Blob(['text/html; charset=utf-8'])`, `URL.createObjectURL`, appends a hidden `<a download>`, clicks it, removes it, calls `setTimeout(() => URL.revokeObjectURL(url), 10000)`
- [X] T011 [US1] In `src/js/export.js`: implement the public `async function exportHTML(note, templateId)` — calls `fetchCss(templateId)`, then `buildExportableNote`, `makeSlug`, `makeFilename`, `buildDocument`, `triggerDownload`; on any error re-throws with a descriptive message
- [X] T012 [US1] In `src/pages/note.html`: add `<button id="btnExportHtml" class="btn btn-sm" type="button" disabled aria-label="Export note as HTML file">Export as HTML</button>` inside `.top-controls`, after `#btnSignOut`
- [X] T013 [US1] In `src/pages/note.html` module script: import `exportHTML` from `../js/export.js`; after `renderNote` succeeds set `noteData` reference into a module-level variable; enable `#btnExportHtml`; wire its `click` event to call `exportHTML(noteData, getActiveTemplate())` with loading state (disable button, add `.success-state` class) and error state (re-enable, show `.error-state` message)

**Checkpoint**: `quickstart.md` Scenarios 1, 5, and 6 all pass. Zero console errors. Downloaded file renders offline.

---

## Phase 4: User Story 2 — Correct Filename Format (Priority: P1)

**Goal**: The downloaded file is always named `medicine-cloud-<slug>-<YYYY-MM-DD>.html` with correct slug transformation.

**Independent Test**: Export four notes (standard title, hyphenated title, Arabic+Latin mixed title, all-special-char title) and verify filenames match the expected patterns.

### Implementation

- [X] T014 [US2] Verify `makeSlug` handles all four edge cases from `quickstart.md` Scenario 2:
  - `'Acid-Base Disorders'` → `'acid-base-disorders'`
  - `'ABG Analysis — Part 1'` → `'abg-analysis-part-1'`
  - `'تشخيص ABG'` → `'abg'`
  - `'!@#$%'` → `'note'` (fallback)
  - Fix any cases that fail
- [X] T015 [US2] In `buildDocument()` in `src/js/export.js`: ensure `<title>` is `note.title + ' — Medicine Cloud'` (properly HTML-escaped) and `<html lang>` matches `note.lang`, `<html dir>` is `'rtl'` for Arabic, `'ltr'` for English

**Checkpoint**: `quickstart.md` Scenario 2 all four filename assertions pass.

---

## Phase 5: User Story 3 — Works Across Chrome, Firefox, and Safari (Priority: P2)

**Goal**: The Blob + anchor-click download mechanism triggers a file download in all three browsers without error.

**Independent Test**: Open the note reader in Chrome, Firefox, and Safari; click "Export as HTML" in each; verify download starts with zero console errors.

### Implementation

- [X] T016 [US3] In `src/js/export.js` `triggerDownload()`: ensure the anchor element is appended to `document.body` before `.click()` (required for Firefox compatibility) and removed immediately after (Safari timing requirement)
- [X] T017 [US3] In `src/pages/note.html`: verify the `type="module"` script that imports `exportHTML` does not block the page in Safari due to top-level await ordering — move the `exportHTML` import to be after the `requireAuth` await resolves if needed

**Checkpoint**: `quickstart.md` Scenario 7 passes in all three browsers.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, template fidelity, bilingual toggle, and final QA.

- [X] T018 [P] In `buildDocument()` in `src/js/export.js`: verify template fidelity — the `<style>` block has `/* === base.css === */` and `/* === {templateId}.css === */` separator comments; confirm Academic Dark dark-slate tokens appear in the inlined CSS when that template is active
- [X] T019 [P] In `buildHydrationScript()` in `src/js/export.js`: verify bilingual toggle — lang toggle button is hidden (`style.display = 'none'`) when `noteData.alt` is absent; shown and functional when present (`quickstart.md` Scenario 4)
- [X] T020 [P] In `src/pages/note.html`: add `aria-busy="false"` to `#btnExportHtml`; set `aria-busy="true"` during export fetch; restore after completion (§8.4 accessibility)
- [X] T021 [P] In `buildDocument()` in `src/js/export.js`: add `<meta name="description" content="{note.title} — Medicine Cloud study note">` to the exported file `<head>` (§SEO)
- [X] T022 Run `quickstart.md` all 7 scenarios; fix any failures found
- [X] T023 [P] Verify the export button is styled with the neo-brutalist `.btn` hard-shadow treatment from `base.css` on the live `note.html` page (no custom inline styles added)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately. T001 and T002 are parallel.
- **Phase 2 (Foundational)**: Depends on Phase 1. T003, T004, T005 are parallel (different helpers, same file — write sequentially).
- **Phase 3 (US1 — P1)**: Depends on Phase 2. Must complete before US2 (T014 depends on `makeSlug` from T003). Tasks T006–T010 can be written in sequence within the same file; T012 and T013 are in `note.html` and can be done in parallel with T006–T011.
- **Phase 4 (US2 — P1)**: Depends on T003 (makeSlug) and T011 (exportHTML wired). Can proceed after Phase 3.
- **Phase 5 (US3 — P2)**: Depends on Phase 3 complete (download mechanism exists). T016 and T017 are parallel.
- **Phase 6 (Polish)**: Depends on all P1 phases complete. All tasks marked [P] can run concurrently.

### Story Completion Order

```
Phase 1 → Phase 2 → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3)
                                                              ↓
                                                       Phase 6 (Polish)
```

### Parallel Opportunities

- T001 and T002 (Phase 1 — different files)
- T003, T004, T005 (Phase 2 — same file, sequential writes but logically independent)
- T012 (`note.html`) can be written in parallel with T006–T011 (`export.js`)
- T016 and T017 (Phase 5)
- T018, T019, T020, T021, T023 (Phase 6 — all marked [P])

---

## Implementation Strategy

### MVP Scope (Phases 1–3)

Complete Phases 1, 2, and 3 (T001–T013). This delivers:
- Working "Export as HTML" button on `note.html`
- Self-contained offline-capable downloaded file
- Error handling for CSS fetch failures
- Button disabled until note renders

Stop and validate with `quickstart.md` Scenarios 1, 5, and 6 before continuing.

### Incremental Delivery

1. **MVP** (Phases 1–3): T001–T013 — core export works end-to-end.
2. **Filename polish** (Phase 4): T014–T015 — verify all slug edge cases.
3. **Cross-browser** (Phase 5): T016–T017 — Firefox/Safari compatibility.
4. **Polish** (Phase 6): T018–T023 — a11y, template fidelity, bilingual, SEO.

---

## Notes

- `RENDERER_IIFE` (T007) is the most critical and largest task — it is a verbatim port of `src/js/renderer.js` converted from ES module to IIFE form. Take care to test it independently before wiring into `buildDocument`.
- The exported file must **not** contain the Supabase CDN `<script>` tag, `window.MC_SUPABASE_URL`, `window.MC_SUPABASE_ANON_KEY`, or any call to `requireAuth` — these are app-only concerns.
- The template selector `<select>` in the exported file's `.top-controls` should be hidden (`display:none`) since the template is already baked into the inlined CSS.
- Task IDs map directly to `quickstart.md` scenarios for traceability: T011-T013 → Scenario 1; T014-T015 → Scenario 2; T018 → Scenario 3; T019 → Scenario 4; T016-T017 → Scenario 7.
