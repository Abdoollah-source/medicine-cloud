# Implementation Plan: Note Editor (JSON Paste, Preview, Save)

**Branch**: `006-note-editor` | **Date**: 2026-07-03 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/006-note-editor/spec.md`

## Summary

Build the full note editor page (`src/pages/editor.html`) that lets authenticated users paste
AI-generated note JSON, see a live preview powered by the existing `renderNote()` function, select
a visual template, and save (or update) the note to Supabase via the existing `createNote()` /
`updateNote()` functions. Supports both "New Note" and "Edit Note" modes via the `?id=` URL
parameter. All UI chrome strictly follows the neo-brutalist design system (§8.7).

## Technical Context

**Language/Version**: Vanilla HTML5, ES Modules (no transpiler, no bundler step required)

**Primary Dependencies**:
- `src/js/auth.js` → `requireAuth()`, `getClient()`
- `src/js/notes.js` → `createNote()`, `getNote()`, `updateNote()`
- `src/js/renderer.js` → `renderNote()`
- `src/js/templates.js` → `loadTemplate()`, `getActiveTemplate()`, `TEMPLATES`
- `src/css/base.css` → design system tokens and component classes
- Supabase JS SDK (CDN, already in every page)

**Storage**: Supabase PostgreSQL (notes table) — already set up in SPEC-5

**Testing**: Manual browser QA following `quickstart.md` scenarios

**Target Platform**: Cloudflare Pages (static) — browser-only; no SSR

**Performance Goals**: JSON parse + render cycle ≤ 300ms (debounced); first paint < 2s on 4G

**Constraints**: No rounded corners, no blur, no gradients. All UI chrome uses `base.css` design
tokens. Note content area (.note-content div) exempt from neo-brutalist chrome rules.

**Scale/Scope**: Single-page feature. ~1 HTML file, ~1 JS feature module (editor.js, optional),
additions to editor.html only.

## Constitution Check

| Gate | Status | Notes |
|---|---|---|
| §1.1 Invite-Only | ✅ PASS | `requireAuth()` blocks unauthenticated access in `<head>` |
| §2.4 RLS | ✅ PASS | `createNote` / `updateNote` in notes.js rely on Supabase RLS; no bypasses |
| §3.1 JSON Schema | ✅ PASS | Editor validates `title`, `lang`, `content` before enabling Save |
| §4.1 Template Purity | ✅ PASS | Template switch calls `loadTemplate()`; never mutates stored JSON |
| §5.1 Static Hosting | ✅ PASS | editor.html is a static file; all logic is browser JS |
| §7.3 Sanitisation | ✅ PASS | Preview renders through `renderNote()` which calls `sanitiseContent()` |
| §7.5 No IDs in URLs | ⚠️ NOTE | Update mode uses `?id=` — this is the internal note ID. Acceptable for editor only since it is an authenticated-only page, never a shareable link. Share URLs use share_token (separate feature). |
| §8.2 Mobile-First | ✅ PASS | `.editor-layout` grid collapses below 768px; sticky footer always visible |
| §8.7 Neo-Brutalist | ✅ PASS | Textarea → `.textarea` class; buttons → `.btn .btn-primary`; no rounded corners; 7-layer hard shadow |

## Project Structure

### Documentation (this feature)

```text
specs/006-note-editor/
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
├── pages/
│   └── editor.html   ← MODIFY: implement full editor page (was 22-line stub)
├── js/
│   └── editor.js     ← NEW: editor page logic (validation, debounce, mode detection, save)
└── css/
    └── base.css      ← MODIFY (possibly): add .editor-layout and .sticky-footer classes
                         if not already present in base.css
```

## Implementation Strategy

### Two-column layout with `.editor-layout`

The spec mandates a `.editor-layout` CSS Grid class. The grid is:
- **Desktop (≥768px)**: `grid-template-columns: 1fr 1fr` — left: input panel, right: preview panel
- **Mobile (<768px)**: `grid-template-columns: 1fr` — stacked, preview below textarea

Both panels are wrapped in cards (`.card`) to get the hard-shadow treatment.

### Debounced validation + rendering

```
textarea input event
  → clearTimeout(debounceTimer)
  → debounceTimer = setTimeout(onJsonChange, 300)
    → try JSON.parse(value)
    → if ok: validateSchema(parsed) → if ok: renderNote(parsed, previewContainer) + showSuccess()
    → if fail: showError(message)
```

### Mode detection

On `DOMContentLoaded`:
1. Parse `new URLSearchParams(location.search).get('id')`
2. If `id` is truthy → **Update Mode**: call `getNote(id)`, reconstruct editor JSON, pre-fill textarea, trigger initial render, set button label to "Update Note"
3. If `id` is falsy → **Create Mode**: empty textarea, button label "Save Note"

### DB-only fields excluded on pre-fill

When reconstructing JSON from a fetched note object, strip:
`id`, `user_id`, `created_at`, `updated_at`, `deleted_at`, `share_token`, `is_public`

### Save flow

1. Validate JSON + schema (same as debounce path)
2. If **Create Mode**: `createNote({ title, lang, subject, unit, date, content, alt, template_id })`
3. If **Update Mode**: `updateNote(noteId, patch)`
4. On success: navigate to `note.html?id=<returnedId>`
5. On error: show `.error-state` in status bar

### Template selector

A `<select id="templateSelect">` populated from `TEMPLATES` object. On change: `loadTemplate(value)`.
Re-render preview with current valid JSON (if any). Selected value stored via `loadTemplate()`'s
`localStorage` write.

### Sticky footer

A `<footer class="editor-footer">` fixed to bottom of viewport, containing:
- "Save Note" / "Update Note" `.btn .btn-primary` button (disabled when invalid/empty)
- "Clear" `.btn` button (confirm before clearing)

## Complexity Tracking

No constitution violations. No new complexity introduced beyond existing patterns.
