# Tasks: Design System CSS (Neo-Brutalist Foundation)

**Input**: Design documents from `specs/000-design-system/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup

**Purpose**: Project initialization and basic structure.

- [x] T001 Create source directories (`src/css/`, `src/pages/`) and verify files exist

---

## Phase 2: Foundational

**Purpose**: Core CSS tokens and variables initialization.

- [x] T002 Implement browser CSS reset and html/body resets in `src/css/base.css`
- [x] T003 Configure CSS design tokens (colors, font family, typography scale, shadows, transitions) in `src/css/base.css`

---

## Phase 3: User Story 1 - Neo-Brutalist Card Elements (Priority: P1)

**Goal**: Implement the neo-brutalist card styling and interactive states.

**Independent Test**: Open `src/pages/design-test.html`, hover over the card component, and hold click to verify hover/active transition behavior.

### Implementation for User Story 1

- [x] T004 [P] [US1] Define card selectors (`.card`, `.card-body`, `.card-body-sm`, `.card-icon-layout`) and resting shadow in `src/css/base.css`
- [x] T005 [US1] Define card hover transition and 11-layer shadow (including coral accent) in `src/css/base.css`
- [x] T006 [US1] Define card active (click-hold) translation and shadow shrinking in `src/css/base.css`
- [x] T007 [US1] Add test card elements with SVG icons in `src/pages/design-test.html`

---

## Phase 4: User Story 2 - Brutalist Interactive Buttons (Priority: P1)

**Goal**: Implement brutalist button styles, active/hover transitions, and color/size modifiers.

**Independent Test**: Hover and click all button variants in `src/pages/design-test.html`. Confirm hover lift, coral accent shadow, and active press-down translation.

### Implementation for User Story 2

- [x] T008 [P] [US2] Define base button class (`.btn`) and resting 4-layer shadow in `src/css/base.css`
- [x] T009 [US2] Define button hover translation and 6-layer shadow (including coral accent) in `src/css/base.css`
- [x] T010 [US2] Define button active pressed state in `src/css/base.css`
- [x] T011 [P] [US2] Define primary (`.btn-primary`) and danger (`.btn-danger`) button class modifiers in `src/css/base.css`
- [x] T012 [P] [US2] Define button size modifiers (`.btn-lg`, `.btn-sm`) in `src/css/base.css`
- [x] T013 [US2] Add button components (base, primary, danger, lg, sm) to `src/pages/design-test.html`

---

## Phase 5: User Story 3 - Brutalist Form Controls & Typography (Priority: P2)

**Goal**: Implement brutalist form inputs, textareas, selects, and outline-offset focus rings.

**Independent Test**: Focus on input elements in `src/pages/design-test.html`. Confirm translation shift, coral shadow lift, and high-contrast outline ring.

### Implementation for User Story 3

- [x] T014 [P] [US3] Define form inputs (`.input`, `.textarea`, `.select`, `.label`, `.form-group`) in `src/css/base.css`
- [x] T015 [US3] Define input focus translation and shadow lift in `src/css/base.css`
- [x] T016 [P] [US3] Define visible focus ring selector (`:focus-visible`) in `src/css/base.css`
- [x] T017 [US3] Add form inputs to `src/pages/design-test.html`

---

## Phase 6: User Story 4 - App Layouts & Accessibility (Priority: P2)

**Goal**: Implement responsive layout utilities, logical properties, the navigation header, SVG icons, and reduced motion settings.

**Independent Test**: Resize screen below 768px to test responsive stack. Inspect `<html>` with `dir="rtl"` to test alignment mirroring. Emulate `prefers-reduced-motion` in DevTools to check transition suppression.

### Implementation for User Story 4

- [x] T018 [P] [US4] Define grid layout classes (`.notes-grid`, `.editor-layout`) and responsive viewport media queries in `src/css/base.css`
- [x] T019 [P] [US4] Define header classes (`.app-header`, `.app-brand`, `.app-nav`, `.nav-link`) in `src/css/base.css`
- [x] T020 [P] [US4] Define inline SVG icon size classes (`.icon`, `.icon-sm`, `.icon-md`, `.icon-lg`, `.icon-xl`) in `src/css/base.css`
- [x] T021 [P] [US4] Implement prefers-reduced-motion media query to suppress transitions in `src/css/base.css`
- [x] T022 [US4] Add header, responsive grid, modal markup (`.modal-overlay`, `.modal`, `.modal-title`, `.modal-actions`), and SVG icons to `src/pages/design-test.html`

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Manual validation, logical property audit, and code cleanup.

- [x] T023 Verify all test components against `specs/000-design-system/quickstart.md` manually in browser
- [x] T024 Verify logical layout property mirroring under `dir="rtl"` on `src/pages/design-test.html`
- [x] T025 Audit `src/css/base.css` for trailing spaces and clean format

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User Story 1 (Cards) and User Story 2 (Buttons) can proceed in parallel
  - User Story 3 (Forms) and User Story 4 (Layouts) can proceed after Story 1 & 2 completion
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### Parallel Opportunities

- Setup tasks marked [P] can run in parallel
- Foundational tasks marked [P] can run in parallel
- Task T004 [US1] and T008 [US2] can run in parallel
- Task T011 [US2] and T014 [US3] can run in parallel
- Task T018 [US4], T019 [US4], and T020 [US4] can run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 & 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Cards)
4. Complete Phase 4: User Story 2 (Buttons)
5. **STOP and VALIDATE**: Verify cards and buttons on `src/pages/design-test.html`

---

## Phase 8: Convergence

**Purpose**: Remediate gaps identified between specification/constitution and implemented code.

- [x] T026 Add `<link rel="stylesheet" href="../css/base.css">` to `src/pages/design-test.html` so test page actually uses design system classes per plan: test page (missing — CRITICAL)
- [x] T027 Rewrite all card and button shadow offsets to diagonal `Xpx Xpx 0` format (e.g. `1px 1px 0 var(--ink)`) per Constitution §8.7 (contradicts — HIGH)
- [x] T028 Replace transition variable with specific-property transitions (`transform 0.15s ease, box-shadow 0.15s ease`) per Constitution §8.7; keep 0.15s max per 0.2s animation limit (contradicts — HIGH)
- [x] T029 Add `background: var(--cream)` to `.card` selector per Constitution §8.7 (missing — HIGH)
- [x] T030 Change `.btn` background from `transparent` to `var(--cream)` per Constitution §8.7 (contradicts — HIGH)
- [x] T031 Add `:focus`/`:focus-visible` shadow lift rules for `.input`, `.textarea`, `.select` per FR-006, US3/AC2 (partial — HIGH)
- [x] T032 Change `.card:active` shadow from 2 layers to 3 layers per US1/AC3 (partial — MEDIUM)
- [x] T033 Apply logical properties (`margin-inline`, `padding-inline`, `inset-inline-start/end`) throughout layout replacing physical `left`/`right` per FR-009, US4/AC3, Constitution §8.3 (partial — MEDIUM)
- [x] T034 Add `letter-spacing: 0.03em` to `.btn` per Constitution §8.7 (missing — MEDIUM)
- [x] T035 Replace inline SVG `fill="currentColor"` attribute with `stroke="var(--ink)" fill="none" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"` per Constitution §8.7 (contradicts — MEDIUM)
- [x] T036 Add `overflow-wrap: break-word`/`word-break` to cards and buttons, and add 320px minimum viewport safety per spec Edge Cases (partial — LOW)
- [x] T037 Review unrequested CSS (`--font-mono`, `--shadow-resting`, `--shadow-hover`, `.mb-auto`, `.mt-auto`, `.py-auto`, `.px-auto`) and either document in data-model.md or remove per Constitution §9.2 scope discipline (unrequested — LOW)
- [x] T038 Re-run convergence after completing Phase 8 tasks to verify all gaps closed
