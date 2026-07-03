# Feature Specification: Design System CSS (Neo-Brutalist Foundation)

**Feature Branch**: `000-design-system`

**Created**: 2026-07-02

**Status**: Approved

**Input**: User description: "SPEC-0 — Design System CSS (Neo-Brutalist Foundation)"

## User Scenarios & Testing

### User Story 1 - Neo-Brutalist Card Elements (Priority: P1)

Users see cards with physical "paper thickness" depth that react dynamically when hovered or clicked.

**Why this priority**: Cards are the primary container element for notes, tools, and actions on the dashboard and settings page.

**Independent Test**: Open `src/pages/design-test.html`, hover over the test cards, and click them. Verify they shift position and change shadow sizes precisely.

**Acceptance Scenarios**:

1. **Given** the page renders, **When** a card is in its resting state, **Then** it has a `2.5px solid #111111` border, `0px` border-radius, and a solid 7-layer black hard shadow block (no blur).
2. **Given** a card is resting, **When** hovered by the mouse, **Then** the card moves by `translate(-4px, -4px)`, the shadow extends to 11 layers, and the final 11th layer turns `#ff6f59` (coral).
3. **Given** a card is hovered, **When** active (mouse pressed down), **Then** the card presses down by `translate(2px, 2px)` and the shadow shrinks to 3 layers.

---

### User Story 2 - Brutalist Interactive Buttons (Priority: P1)

Users interact with buttons that feel tactile, responsive, and follow the flat neo-brutalist theme.

**Why this priority**: Buttons trigger all major actions (Save, Delete, Sign-In, Export, Share, etc.).

**Independent Test**: Tab through or hover over all buttons in `src/pages/design-test.html`. Verify colors, borders, and translation shifts.

**Acceptance Scenarios**:

1. **Given** a standard button (`.btn`), **When** resting, **Then** it has a `2.5px solid #111111` border, `0px` border-radius, and a 4-layer hard shadow.
2. **Given** any button, **When** hovered, **Then** it translates by `translate(-2px, -2px)` and the 6th shadow layer turns `#ff6f59` (coral).
3. **Given** a primary button (`.btn-primary`), **When** rendered, **Then** it has a solid `#111111` background and `#f4e9d8` (cream) text.
4. **Given** a danger button (`.btn-danger`), **When** rendered, **Then** it has a `#ff6f59` (coral) border and text, and a coral shadow on hover.

---

### User Story 3 - Brutalist Form Controls & Typography (Priority: P2)

Users type into inputs and textareas that use consistent borders, colors, and clean system typography.

**Why this priority**: Required for pasting JSON notes in the editor and changing settings.

**Independent Test**: Focus on input fields and textareas in `src/pages/design-test.html`. Verify translation shifts and the focus outline.

**Acceptance Scenarios**:

1. **Given** a form input (`.input`) or textarea (`.textarea`), **When** resting, **Then** it has a `2.5px solid #111111` border, `0px` border-radius, and a 4-layer hard shadow.
2. **Given** an input or textarea, **When** focused, **Then** it translates by `translate(-2px, -2px)` and shows a 6-layer shadow with coral at the edge.
3. **Given** keyboard focus on any form element, **When** focused, **Then** a `2.5px solid #ff6f59` (coral) outline-offset ring appears.

---

### User Story 4 - App Layouts & Accessibility (Priority: P2)

The application supports clean page layouts, navigation headers, RTL text support, and respects user accessibility settings.

**Why this priority**: Ensures overall app consistency, responsiveness, RTL Arabic support, and accessibility.

**Independent Test**: Resize the browser viewport on `src/pages/design-test.html` and switch simulated text direction to RTL.

**Acceptance Scenarios**:

1. **Given** a page layout, **When** the screen width is resized below `768px`, **Then** the page margins reduce and grids stack into a single column.
2. **Given** the app header (`.app-header`), **When** rendered, **Then** it spans full width, has a bottom border of `2.5px solid #111111`, and arranges navigation links nicely.
3. **Given** the page has `dir="rtl"`, **When** rendered, **Then** all layout alignments mirror correctly without overlapping elements.
4. **Given** user has `prefers-reduced-motion: reduce` set, **When** interacting with cards/buttons, **Then** all transition animations are disabled and position changes happen instantly.

---

### Edge Cases

- **Small Viewports (320px - 360px)**: Content must stay within borders and not overflow the viewport boundary.
- **Mixed Directions (Arabic/English)**: System UI chrome uses LTR layout by default but switches font stack and text alignment to RTL for Arabic locales.
- **Long Text in Cards/Buttons**: Labels must truncate or wrap cleanly without breaking the hard-shadow boundaries.

## Requirements

### Functional Requirements

- **FR-001**: System MUST define the canonical color palette CSS variables (`--cream: #f4e9d8`, `--ink: #111111`, `--coral: #ff6f59`).
- **FR-002**: System MUST define a solid 7-layer resting shadow and 11-layer hover shadow for cards.
- **FR-003**: System MUST define a solid 4-layer resting shadow and 6-layer hover shadow for buttons and form elements.
- **FR-004**: System MUST style cards (`.card`) with zero border-radius, 2.5px border, and hard shadows.
- **FR-005**: System MUST style buttons (`.btn`, `.btn-primary`, `.btn-danger`, `.btn-lg`, `.btn-sm`) with zero border-radius, 2.5px border, and hard shadows.
- **FR-006**: System MUST style inputs, textareas, and selects with focus-visible translation and shadow lift.
- **FR-007**: System MUST provide the `.app-header` and `.nav-link` styling.
- **FR-008**: System MUST style modal overlays (`.modal-overlay`) and dialog boxes (`.modal`).
- **FR-009**: System MUST support logical layout properties to ensure RTL compatibility.
- **FR-010**: System MUST suppress transitions when `@media (prefers-reduced-motion: reduce)` is active.

### Key Entities

- **`base.css`**: The core stylesheet containing all resets, variables, and utility classes.
- **`design-test.html`**: The visual test page containing all UI elements for verification.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Page background is exactly `#f4e9d8` (cream).
- **SC-002**: Card resting state has a solid 7-layer hard shadow block, and hover translates card up-left by (-4px, -4px) and extends shadow to 11 layers with coral.
- **SC-003**: All UI elements (cards, buttons, inputs, modals) have exactly `border-radius: 0` and 2.5px solid `#111111` borders.
- **SC-004**: All shadow layers have blur radius = 0 (completely hard-edged).
- **SC-005**: Keyboard tab navigation displays a visible, high-contrast coral outline on focused elements.
- **SC-006**: Suppresses transitions instantly when reduced motion is enabled.

## Assumptions

- **A-001**: The note content area (`.note-content`) is exempt from the neo-brutalist styling rules and retains its own custom styling.
- **A-002**: No external icon libraries or JS libraries will be loaded for the design system.
