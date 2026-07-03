# Feature Specification: App Shell & Classic Template (Visual Foundation)

**Feature Branch**: `004-app-shell-templates`

**Created**: 2026-07-03

**Status**: Approved

**Input**: User description: "SPEC-4 — App Shell & Classic Template (Visual Foundation)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Note with Classic Template (Priority: P1)

An authenticated user opens `note.html` to study a note. The page loads the "Classic" template,
displaying the content with visual elements from the original reference design — including paper
color styling, corner markings, EKG line animation, custom font choices (Fraunces, Quicksand, Cairo),
and the grain texture overlay. The UI chrome surrounding the note follows the neo-brutalist base.css
design tokens.

**Why this priority**: Essential visual foundation of the reader experience. The app shell is the primary interface for note consumption.

**Independent Test**:
1. Open `src/pages/note.html` in browser.
2. Confirm the page mounts the default "classic" theme.
3. Verify fonts, corners, EKG animated borders, and link categories are visually identical to the reference file.

**Acceptance Scenarios**:

1. **Given** the note reader, **When** loading the classic template, **Then** all CSS variables for paper, ink, and fonts align with reference values.
2. **Given** the note body container, **When** rendered, **Then** the custom fonts Cairo (Arabic) and Literata/Quicksand (Latin) apply to the content.

---

### User Story 2 - Toggle Dark and Light Modes (Priority: P1)

A user clicks the theme toggle button in the header. The app immediately shifts color schemes
between light and dark modes (for templates that support both), updating colors for borders, text,
and backgrounds. The user's preference is saved locally and restored on subsequent page loads.

**Why this priority**: User comfort and accessibility. Standard option for reading interfaces.

**Independent Test**:
1. Open `note.html` and click the theme toggle button.
2. Observe the page background transitions.
3. Refresh the page and confirm the toggled mode remains active.

**Acceptance Scenarios**:

1. **Given** a user choice, **When** clicking the theme toggle, **Then** the page toggles the active theme class (`.light` or `.dark`) on the `html` element.
2. **Given** a selected theme preference, **When** restarting or refreshing, **Then** the system loads the saved theme key (`mc-theme`) from `localStorage`.

---

### User Story 3 - Switch Visual Templates (Priority: P1)

A student wants a clean, dark interface and selects the "Academic Dark" template from the switcher
control. The page immediately switches style definitions by loading `academic-dark.css` instead of
`classic.css`. The note content (text, tables, structure) remains exactly the same, but the background,
borders, highlights, and link colors change to high-contrast dark tones with electric blue accents
and no grain texture.

**Why this priority**: Customisation. Allows users to switch styling skins without affecting data structure.

**Independent Test**:
1. Open `note.html` and locate the template selector.
2. Select "Academic Dark".
3. Verify the color palette updates to dark blue/grey, grain opacity drops to 0, and terms use high-contrast cyan/green/red.
4. Switch back to "Classic" and verify original look is restored.

**Acceptance Scenarios**:

1. **Given** the template selector, **When** choosing "Academic Dark", **Then** the active template stylesheet is swapped to `academic-dark.css`.
2. **Given** the "Academic Dark" template is active, **When** checking CSS variables, **Then** `--grain-opacity` is set to `0` and accents are electric blue.

---

### User Story 4 - Note Language Toggle (Priority: P1)

A bilingual user opens a note that contains an alternative language translation. They click the
language toggle button in the header. The renderer swaps the active content and title from primary
(e.g., Arabic) to alternative (e.g., English) and updates the document text direction immediately.
If the note does not have an alternative translation, the language toggle is disabled.

**Why this priority**: Crucial for bilingual study. Allows immediate swapping between source Arabic and target English translations.

**Independent Test**:
1. Open a note with an `alt` field populated.
2. Verify the language toggle is active and shows the alternate language code (e.g., "EN").
3. Click the toggle. Confirm text switches language and direction (RTL ↔ LTR) instantly.

**Acceptance Scenarios**:

1. **Given** a note with `note.alt` defined, **When** loading the page, **Then** the language toggle button is enabled.
2. **Given** the language toggle is clicked, **When** swapping states, **Then** `renderNote` is re-called with the alternate content block and document direction is updated.

---

### User Story 5 - Shared App Header & Navigation (Priority: P2)

Every application page displays a consistent neo-brutalist header containing the brand identifier,
navigation links, theme toggle, and sign-out controls. The layout is responsive, stacking nicely
on small viewport screens.

**Why this priority**: Visual cohesion and navigation structure across the entire application.

**Independent Test**:
1. Load `note.html`, `dashboard.html`, and `editor.html`.
2. Confirm the header renders identically, navigation links are active, and the sign-out button triggers session termination.

**Acceptance Scenarios**:

1. **Given** the app header, **When** viewed on mobile, **Then** controls layout stacks cleanly without overlapping.
2. **Given** the sign-out button is clicked, **When** clicked, **Then** the auth session is cleared and redirect occurs.

---

## Edge Cases

- **Academic Dark and Theme Toggling**: The "Academic Dark" template is dark-only. If active, clicking the theme toggle should either do nothing (theme stays dark) or the control is disabled.
- **Missing `alt` Translations**: If `note.alt` is absent or null, the language toggle button must be hidden or disabled to prevent blank renders.
- **Cached Invalid Template ID**: If `localStorage` holds an invalid or missing template key, the application must default to loading `classic.css`.
- **Keyboard Traps**: The template switcher and dropdown menus must be reachable via `Tab` key and operable using the space/enter keys.

## Requirements

### Functional Requirements

- **FR-001**: System MUST export `loadTemplate(templateId)` and `getActiveTemplate()` from `src/js/templates.js`.
- **FR-002**: `loadTemplate()` MUST dynamically swap the stylesheet link with `id="mc-template-link"` and persist selection in `localStorage` under `mc-template`.
- **FR-003**: The Classic template CSS (`src/css/templates/classic.css`) MUST contain the exact variable token definitions and typography styles from the reference file for both light and dark modes.
- **FR-004**: The Academic Dark template CSS (`src/css/templates/academic-dark.css`) MUST be dark-only and configure `--paper` to `#0d1117`, `--grain-opacity` to `0`, and `--gold` to electric blue `#58a6ff`.
- **FR-005**: `note.html` MUST contain the shared header layout: brand title, link back to dashboard, theme toggle, language toggle, and template dropdown selector.
- **FR-006**: The app header elements MUST follow the Neo-Brutalist CSS styling rules (black 2.5px borders, no rounded corners, cream backgrounds).
- **FR-007**: The language toggle on `note.html` MUST remain disabled/hidden unless `note.alt` is present.
- **FR-008**: The language toggle MUST trigger a re-render of the note body using `renderNote()` on `note.alt` content, switching text direction and title appropriately.
- **FR-009**: The theme toggle button MUST set/retrieve preferences in `localStorage` using key `mc-theme`.
- **FR-010**: All UI animations (including EKG line) MUST be suppressed under media query `@media (prefers-reduced-motion: reduce)`.
- **FR-011**: The page layout MUST scale down cleanly to a minimum width of `360px` without horizontal scrollbars.
- **FR-012**: All interactive controls MUST be keyboard navigable with visible outline-offset focus indicators.
- **FR-013**: The template switcher MUST default to getActiveTemplate() value on page load.
- **FR-014**: The note reader page MUST call `requireAuth()` to block unauthenticated access.
- **FR-015**: The sign-out button in the header MUST trigger `signOut()` from the auth module.

### Key Entities

- **`classic.css`**: The default visual skin.
- **`academic-dark.css`**: Dark high-contrast visual skin.
- **`templates.js`**: Swapper utility.
- **Bilingual Alt Note Block**: Optional secondary note structure.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Switching templates updates the stylesheet source path within 50ms of user action.
- **SC-002**: `note.html` renders the EKG animation, corner marks, and specific fonts, visually matching the reference layout.
- **SC-003**: 100% of animated CSS transforms are disabled when `prefers-reduced-motion` is active.
- **SC-004**: No layout clipping or text overlap occurs at `360px` device viewport width.
- **SC-005**: All clickable elements are targetable via Tab navigation and indicate focus with visible outline rings.
- **SC-006**: The theme preference survives browser session closure and tab refreshes.

## Assumptions

- **A-001**: SPEC-0 (base.css) and SPEC-2 (renderer.js) are completed and functional.
- **A-002**: The reference fonts (Cairo, Quicksand, Literata, Fraunces) are loaded via CDN or system fallbacks.
- **A-003**: The note object loaded in `note.html` is either mock or fetched note data.
- **A-004**: The browser supports localStorage storage APIs.
