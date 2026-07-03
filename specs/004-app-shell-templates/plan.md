# Implementation Plan: App Shell & Classic Template (Visual Foundation)

**Branch**: `004-app-shell-templates` | **Date**: 2026-07-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-app-shell-templates/spec.md`

## Summary

Implement the visual app shell including the shared header navigation bar, a persistent dark/light theme toggle, bilingual note content translation switching, and visual template swapping. Provide stylesheets for the Classic theme (extracted from reference file) and a new Academic Dark high-contrast theme. Wire up the controls on `note.html` using `templates.js` modules.

## Technical Context

**Language/Version**: HTML5, CSS3, Vanilla ES6 JavaScript

**Primary Dependencies**: None (base.css design tokens)

**Storage**: `localStorage` (`mc-theme` and `mc-template` keys)

**Testing**: Visual viewport inspections (360px), keyboard tab index audits, prefers-reduced-motion media testing

**Target Platform**: Desktop and mobile web browsers

**Project Type**: Application layout UI and theme engine

**Performance Goals**: Stylesheet swapping completes in <50ms without visual page stutter

**Constraints**: Content container exempt from neo-brutalist chrome rules (§8.7); UI controls must conform; zero rounded corners.

**Scale/Scope**: 2 templates, 1 template loader module, 1 page template update, shared headers on all pages

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Google Auth / Session Only**: N/A for visual layouts (protected page check is imported).
- **Row-Level Security**: N/A.
- **Allowed Note Content HTML**: ✅ SATISFIED — Note reader body uses the allowed element set from §3.2.
- **Bilingual Alt Note Block (§3.1)**: ✅ SATISFIED — Swapping content swaps target fields with `note.alt` if present.
- **Template System (§4.1)**: ✅ SATISFIED — Switching templates swaps CSS variable definitions without modifying note data.
- **Theme Variables (§4.3)**: ✅ SATISFIED — `classic.css` and `academic-dark.css` define all required custom variables.
- **Zero-Cost Constraint**: ✅ SATISFIED — No paid systems required.
- **Mobile-First Responsive (§8.2)**: ✅ SATISFIED — Header and controls are mobile responsive down to 360px.
- **Bidirectional Text (§8.3)**: ✅ SATISFIED — Swapping to Arabic swaps document direction attribute to RTL.
- **Reduced Motion (§8.5)**: ✅ SATISFIED — Keyframe animations (e.g. EKG line) are disabled when prefers-reduced-motion is active.
- **Design Language (§8.7)**: ✅ SATISFIED — UI chrome (navigation, select lists, buttons) conforms to neo-brutalist borders and shadow rules. Note content styling remains identical to reference files.

## Project Structure

### Documentation (this feature)

```text
specs/004-app-shell-templates/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0: design choices and rationale
├── data-model.md        # Phase 1: database schema and JS interfaces
├── quickstart.md        # Phase 1: verification scenarios
└── checklists/
    └── requirements.md  # Spec quality checklist — 15/15 PASS
```

### Source Code (repository root)

```text
MC-WEB_APP/
├── src/
│   ├── css/
│   │   ├── base.css             [MODIFY] — add shared app layout classes, EKG animation, and core chrome styles
│   │   └── templates/
│   │       ├── classic.css       [MODIFY] — configure light and dark classic visual tokens verbatim
│   │       └── academic-dark.css [NEW] — configure dark high-contrast cyan tokens with zero grain
│   ├── js/
│   │   └── templates.js         [MODIFY] — implement loadTemplate and getActiveTemplate exports
│   └── pages/
│       └── note.html            [MODIFY] — implement full note reader layout, headers, and UI toggles
```

**Structure Decision**: Add templates under `src/css/templates/` and update `templates.js` in `src/js/` as defined in SPEC-1 scaffold. Update `note.html` with full layout structure.

## Complexity Tracking

*No violations of the Constitution. Zero complexity deviations.*
