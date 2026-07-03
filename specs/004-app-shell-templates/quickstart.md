# Quickstart & Validation Guide: App Shell & Classic Template (Visual Foundation)

**Branch**: `004-app-shell-templates` | **Spec**: [spec.md](./spec.md) | **Data Model**: [data-model.md](./data-model.md)

## Prerequisites

- SPEC-0, SPEC-1, SPEC-2, and SPEC-3 are completed.
- A modern browser with console logging enabled.

---

## Scenario 1: Verify Classic Styling (SC-002)

**Goal**: Prove the default note displays exact reference features (corners, EKG).

**Steps**:
1. Open `src/pages/note.html` directly in the browser.
2. Confirm the page displays the stub ABG note layout.
3. Inspect borders and corners.

**Expected Outcome**:
- You see corner markings (`.corner`) around the note container.
- An animated EKG dividing line is visible under the header.
- Text uses the custom Cairo / Literata font combinations.

---

## Scenario 2: Theme Switching & Persistence (SC-006)

**Goal**: Prove that switching light/dark modes updates values and persists on reload.

**Steps**:
1. Open `note.html`.
2. Click the theme toggle button. Confirm background flips instantly.
3. Reload page using `F5`.
4. Inspect `html` tag classes and local storage keys.

**Expected Outcome**:
- `html` tag has class `light` or `dark` matching active visual mode.
- Local storage key `mc-theme` has corresponding value.
- Reload retains selected mode.

---

## Scenario 3: Template Selector Swapping (SC-001)

**Goal**: Verify switching between templates updates active stylesheets.

**Steps**:
1. Open `note.html` and locate the template switcher dropdown.
2. Select "Academic Dark".
3. Verify background changes to deep dark grey, highlight color becomes cyan, and grain texture fades out.
4. Select "Classic". Verify original styled view returns.

**Expected Outcome**:
- Swapping template changes the href of `link#mc-template-link`.
- Layout update completes in under 50ms without blank page flashes.

---

## Scenario 4: Note Language Toggle (FR-008)

**Goal**: Verify bilingual notes swap content and direction.

**Steps**:
1. Open `note.html`.
2. Click the language toggle button.
3. Observe document changes text contents and layout direction.

**Expected Outcome**:
- RTL changes to LTR (or vice versa).
- Header label changes text (e.g. from EN to AR).
- RenderNote correctly updates content.
