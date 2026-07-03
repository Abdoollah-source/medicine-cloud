# Implementation Plan: Design System CSS (Neo-Brutalist Foundation)

**Branch**: `000-design-system` | **Date**: 2026-07-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/000-design-system/spec.md`

## Summary

Implement a unified neo-brutalist CSS design system in `src/css/base.css` following the style template defined in `design-tamplete.html`. This serves as the single source of truth for the entire application's UI chrome (buttons, cards, inputs, app header, navigation, and modal forms). The implementation uses standard CSS custom properties, logical properties for RTL/LTR layouts, media queries for responsive styling, and accessibility adjustments. A visual test page `src/pages/design-test.html` will be built to verify all components and states.

## Technical Context

**Language/Version**: HTML5, CSS3

**Primary Dependencies**: None (Google Fonts: Quicksand, Literata, Cairo, Noto Naskh Arabic loaded from CDN for typography)

**Storage**: `localStorage` (used in test page to persist theme selection under key `mc-theme`)

**Testing**: Manual visual testing + Chrome DevTools validation of dimensions, colors, and shadows

**Target Platform**: Desktop & Mobile browsers (Chrome, Safari, Firefox, Edge)

**Project Type**: Frontend static CSS architecture

**Performance Goals**: CSS payload size < 50KB, zero layout shift (CLS = 0) on text rendering

**Constraints**: Exactly 3 brand colors, 0px border-radius, hard shadows only (no blur), system font stack for UI chrome, logical layout rules for RTL compatibility

**Scale/Scope**: 1 CSS stylesheet (`src/css/base.css`), 1 verification test page (`src/pages/design-test.html`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Google Auth / Session Only**: N/A for this design system feature.
- **Supabase Database Schema**: N/A.
- **Row-Level Security**: N/A.
- **Allowed Note Content HTML**: N/A (note content rendering is managed by SPEC-2/renderer).
- **Template overrides**: CSS overrides for display and body fonts must remain intact.
- **Zero-Cost Constraint**: Fully satisfied (static CSS files hosted on Cloudflare Pages).
- **Headless Chrome PDF Export**: N/A.
- **Security private-by-default**: N/A.
- **Mobile-First Responsive**: Satisfied (mobile breakpoint at 768px, page padding decreases, grid stacks to 1 column).
- **Bidirectional Text (RTL)**: Satisfied (uses logical properties, Arabic system font stacks, and flex/grid safe alignments).
- **Accessibility WCAG 2.1 AA**: Satisfied (visible focus outline set to `2.5px solid var(--coral)` on `:focus-visible`).
- **Reduced Motion**: Satisfied (transition durations forced to `0.001ms` under media query).
- **Design System System Rules**: Fully satisfied. Strict 3-color palette, 2.5px solid ink border, 0px border-radius, zero blur on shadows. Hover translates are (-4px, -4px) for cards, (-2px, -2px) for buttons/inputs, with coral final layer offsets.

## Project Structure

### Documentation (this feature)

```text
specs/000-design-system/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0: design choices and rationale
├── data-model.md        # Phase 1: CSS token and class reference
├── quickstart.md        # Phase 1: manual test verification guide
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
src/
├── css/
│   └── base.css         # Target stylesheet (will contain the design system classes)
└── pages/
    └── design-test.html # Visual test page
```

**Structure Decision**: Single project layout, matching the structure in Constitution §10.1.

## Complexity Tracking

*No violations of the Constitution. Zero complexity deviations.*
