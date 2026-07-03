# Implementation Plan: HTML Export

**Branch**: `007-html-export` | **Date**: 2026-07-03 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/007-html-export/spec.md`

## Summary

Add a browser-side HTML export capability to the Medicine Cloud note reader. When a user clicks
"Export as HTML" on `note.html`, the system fetches the current page's `base.css` and active
template CSS via `fetch()`, builds a fully self-contained HTML string (Google Fonts CDN links,
inlined CSS, inlined IIFE renderer + toggle logic, embedded note JSON), wraps it in a `Blob`,
and triggers a download via a synthetic anchor click — all without any server interaction.

The exported file must render identically to the live note page when opened in any browser,
including offline, and must not contain any Supabase credentials or auth logic.

## Technical Context

**Language/Version**: Vanilla ES2022 (no bundler, no transpiler) — consistent with all prior SPECs

**Primary Dependencies**:
- `src/js/renderer.js` → `renderNote`, `sanitiseContent`, `processMediaTags`, `escapeHtml` (all must be inlined in the export as an IIFE)
- `src/js/templates.js` → `getActiveTemplate()`, `TEMPLATES` (needed to resolve CSS path)
- `src/css/base.css` → fetched and inlined in `<style>`
- `src/css/templates/classic.css` or `academic-dark.css` → fetched and inlined in `<style>`
- Browser APIs: `fetch()`, `Blob`, `URL.createObjectURL()`, synthetic `<a>` click

**Storage**: N/A (browser-only; no Supabase write needed)

**Testing**: Manual browser QA via `quickstart.md` scenarios; cross-browser in Chrome, Firefox, Safari

**Target Platform**: Cloudflare Pages (static) — browser-only; no SSR

**Performance Goals**: Full export (CSS fetch + Blob creation + download trigger) completes in < 3 seconds on standard broadband

**Constraints**:
- No Supabase SDK, credentials, or `requireAuth()` in the exported file (FR-012)
- No server-side processing (§5.1, §5.2 prohibition on persistent server process)
- Client-side screenshot/canvas-based PDF explicitly prohibited (§6.2; out of scope here anyway)
- "Export as HTML" button must be `.btn` or `.btn-sm` (design constraint)

**Scale/Scope**: Single function `exportHTML(note, templateId)` in `src/js/export.js`; one button added to `note.html`

## Constitution Check

| Gate | Status | Notes |
|---|---|---|
| §5.1 Static Hosting | ✅ PASS | Pure browser-side Blob export; no server call |
| §5.4 Renderer Independence | ✅ PASS | Exported file has renderer JS inlined as IIFE; no runtime API calls |
| §6.1 HTML Export (Browser-Side) | ✅ PASS | Exactly what §6.1 mandates: CSS inlined, JSON embedded, renderer inlined, Blob URL download |
| §6.3 Template Fidelity | ✅ PASS | CSS for active template fetched and inlined at export time |
| §7.4 Secrets Handling | ✅ PASS | No Supabase URL/key included in exported file |
| §8.7 Neo-Brutalist | ✅ PASS | Button uses `.btn` class from `base.css`; no custom styles on button |

No violations. No complexity tracking required.

## Project Structure

### Documentation (this feature)

```text
specs/007-html-export/
├── plan.md           ← This file
├── spec.md           ← Feature spec
├── research.md       ← Phase 0 output
├── data-model.md     ← Phase 1 output
├── quickstart.md     ← Phase 1 output
└── tasks.md          ← Phase 2 output (/speckit-tasks)
```

### Source Code (additions only)

```text
src/
├── js/
│   └── export.js     ← MODIFY: replace 5-line stub with full exportHTML() implementation
└── pages/
    └── note.html     ← MODIFY: add "Export as HTML" button to .top-controls bar
```

## Implementation Strategy

### The IIFE Renderer Problem

`renderer.js` is written as an ES module (`export { renderNote, ... }`). The exported HTML file
cannot use `<script type="module">` (that would require a server or MIME-correct file serving),
so the renderer must be converted to an **IIFE** (Immediately Invoked Function Expression) that
attaches its exports to `window`:

```js
(function() {
  // ... full renderer.js body verbatim ...
  window.MC = window.MC || {};
  window.MC.renderNote = renderNote;
  window.MC.sanitiseContent = sanitiseContent;
  window.MC.processMediaTags = processMediaTags;
})();
```

This IIFE is a **string constant** embedded inside `export.js` — it is not dynamically read
from `renderer.js` at runtime (which would require a same-origin fetch and parsing). Instead,
`export.js` contains the renderer logic as a self-contained string that is spliced into the
generated HTML. This keeps the export purely client-side and avoids the complexity of fetching
the JS file itself.

**Decision**: Hardcode the renderer IIFE string in `export.js` rather than fetching `renderer.js`
via `fetch()`. Rationale: `renderer.js` is stable, well-tested (SPEC-2), and its content is
deterministic. Fetching it at runtime would add latency and require URL resolution logic.

### The Theme/Lang Toggle Logic

The exported file must support:
1. **Language toggle**: switch between primary `note` and `note.alt` if `alt` exists
2. **Theme toggle**: switch between light/dark using `data-theme` attribute
3. **Template**: already baked in via inlined CSS — no switch needed in exported file

Both toggles are wired as a short inline `<script>` (non-module, IIFE) that reads the embedded
JSON and calls `window.MC.renderNote`.

### CSS Fetch Strategy

```
fetchCSS(baseUrl, templateId)
  → Promise.all([
      fetch(baseUrl + '../css/base.css'),
      fetch(baseUrl + '../css/templates/' + templateId + '.css')
    ])
  → returns [baseCssText, templateCssText]
  → on any fetch error: throw with descriptive message → caller shows .error-state
```

`baseUrl` is derived from `location.href` to produce the correct same-origin path regardless of
the deployment URL.

### Slug Generation

```js
function makeSlug(title) {
  return (title || '')
    .toLowerCase()
    .replace(/\s+/g, '-')          // spaces → hyphens
    .replace(/[^a-z0-9-]/g, '')   // strip non-ASCII and special chars
    .replace(/-+/g, '-')           // collapse multiple hyphens
    .replace(/^-|-$/g, '')         // trim leading/trailing hyphens
    .slice(0, 80)                  // max 80 chars
    || 'note';                     // empty fallback
}
```

### Button State Management

- `#btnExportHtml` is disabled and `aria-busy="false"` on page load.
- After `renderNote()` is called successfully in `note.html`, the button is enabled.
- During export (CSS fetch in progress), the button shows `.success-state` styling (per design
  constraint) and is briefly disabled to prevent double-clicks.
- On export error, button re-enables and status message shown.

### Generated HTML Structure

```html
<!DOCTYPE html>
<html lang="{lang}" dir="{dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{note.title} — Medicine Cloud</title>
  <meta name="description" content="...">
  <!-- Google Fonts CDN links (same as note.html) -->
  <link rel="preconnect" ...>
  <link href="https://fonts.googleapis.com/css2?family=..." rel="stylesheet">
  <style>
    /* === base.css === */
    {baseCssText}
    /* === {templateId}.css === */
    {templateCssText}
  </style>
</head>
<body>
  <!-- Full note.html body structure verbatim (grain, corners, plate, etc.) -->
  <!-- Lang toggle visible only if note.alt exists -->
  <script id="note-data" type="application/json">
    {JSON.stringify(exportableNote, null, 2)}
  </script>
  <script>
    /* renderer IIFE */
    (function() { ... })();
  </script>
  <script>
    /* hydration + toggle IIFE */
    (function() {
      var noteData = JSON.parse(document.getElementById('note-data').textContent);
      var noteContainer = document.querySelector('.note-container');
      // theme toggle, lang toggle, initial render
    })();
  </script>
</body>
</html>
```
