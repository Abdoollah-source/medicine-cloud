# Implementation Plan: Note Renderer (Core Engine)

**Branch**: `002-note-renderer` | **Date**: 2026-07-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-note-renderer/spec.md`

## Summary

Implement the complete, production-ready note rendering engine as three exported functions in
`src/js/renderer.js`: `sanitiseContent()` (DOMParser allowlist-based HTML sanitiser),
`processMediaTags()` (seven regex-based media placeholder expanders), and `renderNote()` (the
orchestrator that validates input, sets document direction, populates the DOM, and injects sanitised
and expanded content). Ship a standalone `src/pages/renderer-test.html` that proves all acceptance
criteria with zero build steps — the page is opened directly in the browser.

## Technical Context

**Language/Version**: HTML5, Vanilla ES6 JavaScript (ES modules, no bundler)

**Primary Dependencies**: None (Google Fonts CDN for Quicksand, Literata, Cairo — content fonts only)

**Storage**: `localStorage` (key: `mc-theme`) for theme toggle persistence only

**Testing**: Manual browser validation against `src/pages/renderer-test.html` using Chrome DevTools;
validation scenarios documented in `quickstart.md`

**Target Platform**: Chromium-based browsers, Firefox, Safari (current versions); `file://` protocol

**Project Type**: Vanilla ES module library for a static web application

**Performance Goals**: Note render completes in under 100ms for a 50kB content string; no
perceptible lag between page load and note display

**Constraints**: No runtime API calls (Constitution §5.4); no third-party JS libraries; DOMParser
available in all target browsers; renderer must be importable inline for HTML export (SPEC-7)

**Scale/Scope**: 3 exported functions, 1 test page, ~200 lines of JS

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Google Auth / Session Only**: N/A — renderer is stateless and auth-free.
- **Supabase Database Schema**: N/A — renderer works entirely on an in-memory note object.
- **Row-Level Security**: N/A.
- **Allowed Note Content HTML (§3.2)**: ✅ SATISFIED — sanitiseContent() enforces exactly the
  §3.2 allowlist: P, H2, H3, UL, OL, LI, STRONG, EM, TABLE, TR, TH, TD, SUP, SUB, A.
- **Media Placeholder Tags (§3.4)**: ✅ SATISFIED — processMediaTags() expands all seven types
  defined in §3.4.
- **Content Sanitisation (§7.3)**: ✅ SATISFIED — sanitiseContent() runs before innerHTML injection,
  using allowlist walk as required.
- **Zero-Cost Constraint (§5.3)**: ✅ SATISFIED — no paid services used; Google Fonts CDN is free.
- **Headless Chrome PDF Export**: N/A for this spec.
- **Security private-by-default (§7.1)**: ✅ SATISFIED — renderer never touches auth or DB.
- **Mobile-First Responsive (§8.2)**: ✅ SATISFIED — test page validated at 360px (quickstart
  Scenario 6). Note content uses CSS logical properties and flexible units.
- **Bidirectional Text RTL (§8.3)**: ✅ SATISFIED — renderNote() sets `dir` on `<html>`,
  `#note-title`, and `#note-content` based on `note.lang`.
- **Accessibility WCAG 2.1 AA (§8.4)**: ✅ SATISFIED — iframes have `title` attributes; images
  have `alt` attributes; theme toggle has `aria-label`.
- **Reduced Motion (§8.5)**: ✅ SATISFIED — theme toggle transition is CSS-based and suppressed
  by `@media (prefers-reduced-motion: reduce)` in base.css.
- **Renderer Independence (§5.4)**: ✅ SATISFIED — renderer.js makes zero runtime API calls.
- **Design Language (§8.7)**: ✅ SATISFIED — test page uses base.css + classic.css; UI chrome
  (theme toggle button) follows neo-brutalist card/button rules. Note content fonts are
  content-area exceptions per §8.7.
- **Code Quality (§10.2)**: ✅ SATISFIED — non-obvious choices (sanitiser walk order, call order
  sanitise→expand, youtube-nocookie domain) get inline comments.

## Project Structure

### Documentation (this feature)

```text
specs/002-note-renderer/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0: 10 design decisions
├── data-model.md        # Phase 1: note object schema, 7 placeholder types, exports
├── quickstart.md        # Phase 1: 7 browser validation scenarios
└── checklists/
    └── requirements.md  # Spec quality checklist — 15/15 PASS
```

### Source Code (repository root)

```text
MC-WEB_APP/
└── src/
    ├── js/
    │   └── renderer.js          [MODIFY] — implement all three exports
    └── pages/
        └── renderer-test.html   [NEW] — standalone test/demo page
```

**Structure Decision**: Two files only. `renderer.js` is the pure logic module; it has no HTML or
CSS dependencies. `renderer-test.html` is the test harness — it loads base.css, classic.css, the
Google Fonts, and imports renderer.js as an ES module. No new directories are needed.

## Complexity Tracking

*No violations of the Constitution. Zero complexity deviations.*
