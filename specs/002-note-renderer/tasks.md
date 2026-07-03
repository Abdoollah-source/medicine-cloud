# Tasks: Note Renderer (Core Engine)

**Input**: Design documents from `specs/002-note-renderer/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure.

- [X] T001 Verify project directory layout for SPEC-2 and ensure stubs are present

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core logic module stubs and host HTML template.

- [X] T002 Implement basic ES module shell in `src/js/renderer.js` exporting empty `renderNote`, `sanitiseContent`, and `processMediaTags` functions
- [X] T003 Setup `src/pages/renderer-test.html` scaffolding, loading `src/css/base.css`, `src/css/templates/classic.css`, and Google Fonts link tags (Quicksand, Literata, Cairo)

---

## Phase 3: User Story 1 - Render a Full Medical Note (Priority: P1)

**Goal**: Render note title, language, document direction, and metadata pills without error.

**Independent Test**: Load `src/pages/renderer-test.html` and verify note title "Protein Structure, Function & ABG Analysis", metadata pill "Unit 1", and RTL Arabic rendering are active.

### Implementation for User Story 1

- [X] T004 [P] [US1] Implement `renderNote` basic input validation and early return error box rendering in `src/js/renderer.js`
- [X] T005 [P] [US1] Implement document-level side effects (updating document.title, documentElement lang, and documentElement dir) in `src/js/renderer.js`
- [X] T006 [P] [US1] Implement metadata pill generation logic for `#note-meta-bar` (subject, unit, date) in `src/js/renderer.js`
- [X] T007 [US1] Embed canonical ABG note JSON into `src/pages/renderer-test.html` and invoke `renderNote` on `DOMContentLoaded`
- [X] T008 [US1] Implement the inline light/dark theme toggle in `src/pages/renderer-test.html` with `localStorage` persistence

---

## Phase 4: User Story 2 - Sanitise Untrusted HTML Content (Priority: P1)

**Goal**: Prevent XSS by filtering note HTML content through a strict allowlist sanitiser using `DOMParser`.

**Independent Test**: Inject `<script>` or `<img onerror>` inside content in `src/pages/renderer-test.html` and verify they are stripped without execution.

### Implementation for User Story 2

- [X] T009 [P] [US2] Implement DOMParser recursive allowlist tag and attribute walker in `src/js/renderer.js` (allowed tags: P, H2, H3, UL, OL, LI, STRONG, EM, TABLE, TR, TH, TD, SUP, SUB, A; A attributes: href, class, target, rel)
- [X] T010 [US2] Integrate `sanitiseContent` into `renderNote` in `src/js/renderer.js` to sanitise raw content before DOM insertion

---

## Phase 5: User Story 3 - Expand All Seven Media Placeholder Types (Priority: P1)

**Goal**: Convert all 7 placeholder tags (`[[YT:...]]`, `[[TG_POST:...]]`, etc.) into responsive embeds or styled link cards.

**Independent Test**: Verify all 7 placeholder types render correctly on `src/pages/renderer-test.html` and no raw `[[...]]` strings remain in the DOM.

### Implementation for User Story 3

- [X] T011 [P] [US3] Implement YouTube, Telegram Post, and Telegram Audio media replacement regex patterns in `src/js/renderer.js`
- [X] T012 [P] [US3] Implement native audio, Telegram image, native image, and native video media replacement regex patterns in `src/js/renderer.js`
- [X] T013 [US3] Integrate `processMediaTags` into `renderNote` in `src/js/renderer.js` to expand placeholders on the sanitised content string
- [X] T014 [US3] Add all seven placeholder types to the test note JSON in `src/pages/renderer-test.html` for verification

---

## Phase 6: User Story 4 - Display Error State for Invalid Note Input (Priority: P2)

**Goal**: Gracefully render an error box if null note or missing content is passed to `renderNote()`.

**Independent Test**: Run `renderNote(null, el)` in console and verify `.error-box` container displays a friendly message with zero exceptions.

### Implementation for User Story 4

- [X] T015 [US4] Implement standard visual error block markup injection inside `renderNote` when validations fail in `src/js/renderer.js`

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validate mobile viewports, accessibility, transitions, and run the quickstart scenarios.

- [X] T016 Validate mobile viewport rendering (360px minimum width) on `src/pages/renderer-test.html`
- [X] T017 Validate theme toggle transitions and prefers-reduced-motion settings in `src/pages/renderer-test.html`
- [X] T018 Run the complete `quickstart.md` validation scenarios 1-7 in the browser and verify zero console errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories.
- **User Stories (Phases 3–6)**: All depend on Foundational phase completion.
  - User Story 1 (Full Render) blocks Story 2 (Sanitisation) and Story 3 (Media tags) because they require a working render loop.
  - User Story 4 (Error Handling) can run in parallel with or after Story 1.
- **Polish (Phase 7)**: Depends on all user stories being complete.

### Parallel Opportunities

- All Phase 3 setup/logic tasks marked [P] can run in parallel.
- Task T009 [US2] (sanitiser) and T011/T012 [US3] (media parser) can be implemented in parallel once Phase 3 is completed.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Verify `renderer-test.html` loads note title, direction, and metadata.
