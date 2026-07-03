# Tasks: App Shell & Classic Template (Visual Foundation)

**Input**: Design documents from `specs/004-app-shell-templates/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verification of style references.

- [X] T001 Verify Google Fonts link tags are configured in reader pages for Cairo, Quicksand, Literata, and Fraunces

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Stylesheets and logic module initialisations.

- [X] T002 Implement template swapper logic (`loadTemplate` and `getActiveTemplate`) in `src/js/templates.js`
- [X] T003 Populate shared layout classes (`.plate`, `.corner`, `.rule-top` EKG line keyframes, `.bottom-row`) and prefers-reduced-motion media query overrides in `src/css/base.css`
- [X] T004 Implement light and dark classic visual variables and content selectors verbatim in `src/css/templates/classic.css`
- [X] T005 [P] Create and implement the high-contrast dark variables and term styles in `src/css/templates/academic-dark.css`

---

## Phase 3: User Story 1 - View Note with Classic Template (Priority: P1)

**Goal**: Renders the complete note styled with corners, EKG animated dividers, and Cairo/Quicksand fonts.

**Independent Test**: Load `note.html` and verify the note displays visual layout identical to reference file.

### Implementation for User Story 1

- [X] T006 [P] [US1] Inject credentials script placeholders and import blocking auth route check in `src/pages/note.html`
- [X] T007 [US1] Load default classic stylesheet link tag, EKG animated borders, corner elements, and default note container in `src/pages/note.html`
- [X] T008 [US1] Embed mock ABG note data block and render content using `renderNote()` on page load in `src/pages/note.html`

---

## Phase 4: User Story 2 - Toggle Dark and Light Modes (Priority: P1)

**Goal**: Allow shifting background and border colors via the header theme toggle.

**Independent Test**: Click theme toggle and verify background changes. Refresh page and verify choice persists.

### Implementation for User Story 2

- [X] T009 [P] [US2] Implement light/dark CSS variables mapping scopes (`html.light`/`html.dark`) in `src/css/templates/classic.css`
- [X] T010 [US2] Wire header theme toggle click listener to switch html classes and store preferences in `localStorage['mc-theme']` in `src/pages/note.html`

---

## Phase 5: User Story 3 - Switch Visual Templates (Priority: P1)

**Goal**: Swap visual themes dynamically between Classic and Academic Dark via dropdown change.

**Independent Test**: Select Academic Dark from dropdown, verify background updates to slate blue and grain disappears. Select Classic to revert.

### Implementation for User Story 3

- [X] T011 [US3] Integrate templates swapper dropdown menu (`#template-switcher`) and bind change listener to `loadTemplate()` in `src/pages/note.html`
- [X] T012 [US3] Implement load-time template retrieval (`getActiveTemplate()`) to set active dropdown and load CSS path in `src/pages/note.html`

---

## Phase 6: User Story 4 - Note Language Toggle (Priority: P1)

**Goal**: Swap content and layout direction on notes containing alternate translations.

**Independent Test**: Click language toggle button, verify text changes to Arabic/English and layout flips direction.

### Implementation for User Story 4

- [X] T013 [P] [US4] Implement conditional logic to hide or disable the language toggle button if the note lacks alt translation in `src/pages/note.html`
- [X] T014 [US4] Bind language toggle click listener to toggle language state and re-render note content using `renderNote()` on `src/pages/note.html`

---

## Phase 7: User Story 5 - Shared App Header & Navigation (Priority: P2)

**Goal**: Display consistent header navigation links, logo, and sign-out button across the app shell.

**Independent Test**: Verify brand title, dashboard link, and sign-out buttons are present and responsive.

### Implementation for User Story 5

- [X] T015 [P] [US5] Implement app header controls layout container (`.app-header`, navigation links, toggles) on `src/pages/note.html`
- [X] T016 [US5] Wire header sign-out button click listener to call `signOut()` from auth module on `src/pages/note.html`

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, responsiveness, and performance validation.

- [X] T017 Validate responsive stacking and check layout width down to 360px on `src/pages/note.html`
- [X] T018 Validate keyboard focus rings and tab order visibility across all app header controls on `src/pages/note.html`
- [X] T019 Execute all verification scenarios 1-4 from `quickstart.md` in browser and confirm zero console errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Concurrent with Phase 2.
- **Foundational (Phase 2)**: All tasks block user stories.
- **User Story 1 (View Note)**: Blocks User Story 2, 3, 4, 5.
- **User Story 2 (Theme Toggling)**: Requires User Story 1.
- **User Story 3 (Template Selector)**: Requires User Story 1.
- **User Story 4 (Language Switch)**: Requires User Story 1.
- **User Story 5 (App Header)**: Requires User Story 1.
- **Polish (Phase 8)**: Executed after all other tasks are complete.

### Parallel Opportunities

- Creation of `academic-dark.css` (T005) can run in parallel with basic setup.
- Router guards setup (T006) can run in parallel with visual styling scaffolding.
- Tasks T009 (theme CSS scopes) and T013 (lang toggle visibility) can run in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Setup variables and template swapper functions (Phase 2)
2. Load default note styling layout (Phase 3)
3. **STOP and VALIDATE**: Verify `note.html` displays mock note in classic style.
