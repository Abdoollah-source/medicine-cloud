# Research Notes: Note Editor (SPEC-6)

## Dependencies — Confirmed Exports

### renderer.js
- `renderNote(note, containerEl)` — writes title, metaBar pills, and sanitised content into three
  child elements (`#note-title`, `#note-meta-bar`, `#note-content`) of the given container.
  **Important**: It also sets `document.documentElement.lang`, `.dir`, and `document.title`, which
  means the preview container needs those three named child elements to render correctly.

### notes.js
- `createNote(noteJson)` → `{ data, error }` — inserts a new row; `data` contains the full
  returned row including the generated `id`.
- `getNote(id)` → `{ data, error }` — fetches a single row by UUID.
- `updateNote(id, patch)` → `{ data, error }` — updates the row.

### templates.js
- `loadTemplate(templateId)` — replaces/inserts `<link id="mc-template-link">` in `<head>`.
- `getActiveTemplate()` — reads `mc-template` from `localStorage`, falls back to `'classic'`.
- `TEMPLATES` object: `{ classic, 'academic-dark' }`.

### auth.js
- `requireAuth()` — called in `<head>` as a blocking top-level await; redirects to login if not
  authenticated; returns session on success.

## Schema Validation Rules

From Constitution §3.1 and spec FR-003:

| Field | Required | Valid Values |
|---|---|---|
| `title` | Yes | non-empty string |
| `lang` | Yes | exactly `"en"` or `"ar"` |
| `content` | Yes | string (may be empty string per renderer) |
| `subject` | No | string or omitted |
| `unit` | No | string or omitted |
| `date` | No | string or omitted |
| `alt` | No | object with `title`, `lang`, `content` |
| `template_id` | No | one of `TEMPLATES` keys; defaults to `'classic'` |

Extra top-level keys beyond the known set are ignored (not blocked) per spec edge case rules.

## DB-Only Fields (Strip on Pre-fill)

`id`, `user_id`, `created_at`, `updated_at`, `deleted_at`, `share_token`, `is_public`

## CSS Classes Already in base.css

Confirmed present from SPEC-0:
- `.btn`, `.btn-primary`, `.btn-danger` — buttons
- `.card`, `.card-body` — panels
- `.textarea` — textarea with hard shadow on focus
- `.error-state`, `.success-state` — status bar colors
- `.modal`, `.modal-overlay`, `.modal-actions` — modals
- `.tag` — status pills
- `.app-header` — shared header

Need to verify/add: `.editor-layout`, `.editor-footer` (sticky footer)

## Decisions

| # | Decision | Rationale |
|---|---|---|
| 1 | Logic in `editor.js` module (not inline) | Keeps editor.html clean; consistent with dashboard pattern |
| 2 | Debounce 300ms on `input` event | Prevents blocking the browser on large JSON pastes; meets SC-001 |
| 3 | `?id=` for update mode | Simple, no additional storage needed; auth-gated so not a public enumeration risk (§7.5 concern mitigated) |
| 4 | No external drag-and-drop library | Out of scope per spec |
| 5 | Preview renders in an iframe-less div | Same-origin content only; `sanitiseContent()` provides security |
| 6 | Strip DB-only fields before textarea pre-fill | Users should see only editable fields |
| 7 | `confirm()` for Clear | Simplest possible protection; spec says browser-native confirm is acceptable |
