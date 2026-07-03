# Data Model: HTML Export (SPEC-7)

## Entities

### ExportableNote (browser-side, constructed at export time)

A subset of the full Supabase note row, containing only fields that `renderNote()` consumes.
Constructed by `buildExportableNote(note)` inside `export.js`.

| Field | Type | Source |
|---|---|---|
| `title` | string | note row |
| `lang` | `"en"` \| `"ar"` | note row |
| `content` | string | note row |
| `alt` | object \| omitted | note row (included only if truthy) |
| `subject` | string \| omitted | note row (included only if truthy) |
| `unit` | string \| omitted | note row (included only if truthy) |
| `date` | string \| omitted | note row (included only if truthy) |
| `template_id` | string | note row (default: `'classic'`) |

**Excluded**: `id`, `user_id`, `created_at`, `updated_at`, `deleted_at`, `share_token`, `is_public`

### TitleSlug

Derived value used for the filename.

```
TitleSlug = makeSlug(note.title)
  → toLowerCase
  → spaces → hyphens
  → strip non-[a-z0-9-]
  → collapse consecutive hyphens
  → trim leading/trailing hyphens
  → slice(0, 80)
  → fallback to 'note' if empty
```

### ExportFilename

```
ExportFilename = 'medicine-cloud-' + TitleSlug + '-' + YYYY-MM-DD + '.html'
```

`YYYY-MM-DD` is the local date at the moment of export (`new Date().toISOString().slice(0, 10)`).

### ExportedHTMLDocument

The final string passed to `new Blob(...)`. Sections in order:

1. `<!DOCTYPE html>` + `<html lang dir>`
2. `<head>` with: charset, viewport, title, meta description
3. Google Fonts `<link>` tags (three lines, hardcoded)
4. `<style>` block: base.css text + template CSS text (concatenated, separated by comment)
5. `</head>`
6. `<body>` with: `.grain`, `.corner` × 4, `.plate` containing:
   - `.top-row`: brand eyebrow, `.top-controls` (template selector hidden, lang toggle conditional, theme toggle — Sign Out button omitted)
   - `.main-block`: `.rule-top`, `.identity` block, `.ekg-rule`, `.note-container` (with `#note-title`, `#note-meta-bar`, `#note-content`)
   - `.channel-row`
   - `.bottom-row`
7. `<script id="note-data" type="application/json">` with `JSON.stringify(exportableNote, null, 2)`
8. `<script>` — renderer IIFE (window.MC.renderNote etc.)
9. `<script>` — hydration IIFE (theme + lang toggle + initial render call)
10. `</body></html>`

## Function Signatures

```js
// Main export function — called from note.html
async function exportHTML(note, templateId)

// Helpers (module-private, not exported)
function buildExportableNote(note)      // → ExportableNote object
function makeSlug(title)                // → TitleSlug string
function makeFilename(slug)             // → ExportFilename string
async function fetchCss(templateId)     // → { baseCss, templateCss } or throws
function buildDocument(exportNote, baseCss, templateCss, templateId) // → html string
function triggerDownload(html, filename) // → void (side-effect)

// Exported public API
export { exportHTML };
```

## State in note.html (additions)

| Variable / Element | Purpose |
|---|---|
| `#btnExportHtml` | The export button; disabled until note renders |
| `window.__MC_NOTE__` | Module-level variable set after `renderNote()` succeeds, holds the raw note object for export |
| `window.__MC_TEMPLATE__` | Current active template ID, set after `loadTemplate()` runs |
