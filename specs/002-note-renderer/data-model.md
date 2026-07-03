# Data Model: Note Renderer (Core Engine)

## Primary Entities

### NoteObject (Input)

The note JSON object consumed by `renderNote()`. Schema defined by Constitution §2.5 and §3.1.

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | `string` | Yes | Displayed in `#note-title` |
| `lang` | `"en" \| "ar"` | Yes | Controls `dir` on `<html>`, content, and title elements |
| `subject` | `string` | No | Renders as a metadata pill if present |
| `unit` | `string` | No | Renders as a metadata pill if present |
| `date` | `string` | No | Renders as a metadata pill if present |
| `content` | `string` | Yes | Raw HTML string; runs through sanitiseContent → processMediaTags |
| `alt` | `object` | No | Bilingual alt object — ignored by this spec (SPEC-4) |
| `template_id` | `string` | No | Ignored by renderer; applied by template loader (SPEC-4) |

**Validation rule**: If `note` is falsy or `note.content` is `undefined`/`null`, the renderer
renders an error box and returns. An empty string `""` for `content` is valid (produces an empty
content area).

---

### MediaPlaceholder (Inline in content)

Seven placeholder tag types that `processMediaTags()` expands. All follow the pattern
`[[TYPE:VALUE]]` or `[[TYPE:VALUE|Caption]]`.

| Tag Format | Capture Groups | Output Element |
|---|---|---|
| `[[YT:VIDEO_ID\|Caption]]` | videoId, caption (optional) | `<div class="media-embed yt-embed">` containing `<iframe>` + "Watch on YouTube" link |
| `[[TG_POST:channel/post_id\|Caption]]` | postPath, caption (optional) | `<div class="media-embed tg-embed">` containing `<iframe>` + "View on Telegram" link |
| `[[TG_AUDIO:url\|Caption]]` | url, caption (optional) | `<div class="media-card tg-audio-card">` containing a "Listen on Telegram" link |
| `[[AUDIO:url\|Caption]]` | url, caption (optional) | `<div class="media-embed">` containing `<audio controls>` |
| `[[TG_IMAGE:url\|Caption]]` | url, caption (optional) | `<div class="media-card tg-image-card">` containing a "View image on Telegram" link |
| `[[IMAGE:url\|Caption]]` | url, caption (optional) | `<figure class="media-image">` containing `<img>` + optional `<figcaption>` |
| `[[VIDEO:url\|Caption]]` | url, caption (optional) | `<div class="media-embed">` containing `<video controls>` |

**Regex pattern (all types)**: `/\[\[TYPE:([^\]|]+)(?:\|([^\]]+))?\]\]/g`

---

### SanitisedContent (Intermediate)

The string produced by `sanitiseContent(htmlContent)` and consumed by `processMediaTags()`.

- All forbidden tags replaced with their text content
- All non-permitted attributes stripped from permitted tags
- `<a>` elements: href validated against `https://en.wikipedia.org/wiki/` prefix

---

## Exported Module Interface

### `renderer.js` Exports

| Export | Signature | Description |
|---|---|---|
| `sanitiseContent` | `(htmlContent: string) → string` | Allowlist-based HTML sanitiser. Returns safe HTML string. |
| `processMediaTags` | `(htmlContent: string) → string` | Expands all 7 media placeholder types. Returns HTML string. |
| `renderNote` | `(note: object, containerEl: Element) → void` | Orchestrator. Validates, sanitises, expands, and injects into DOM. |

---

## DOM Target Schema

The host page (`renderer-test.html`, future `note.html`) must provide this element structure inside
the container element passed to `renderNote()`:

```html
<div id="app">
  <h1 id="note-title"></h1>
  <div id="note-meta-bar"></div>
  <div id="note-content"></div>
</div>
```

| Element ID | Set by renderNote() | Value |
|---|---|---|
| `#note-title` | `textContent`, `dir` attribute | `note.title`, `"rtl"` if `note.lang === "ar"`, else `"ltr"` |
| `#note-meta-bar` | Cleared, then `<span class="note-pill">` appended per field | One pill each for `note.subject`, `note.unit`, `note.date` (if present) |
| `#note-content` | `innerHTML`, `dir` attribute | Sanitised + media-expanded content string |

---

## Term Link Classes (Constitution §3.3)

| CSS Class | Category |
|---|---|
| `term-microbe` | Organisms, bacteria, viruses, fungi, parasites |
| `term-protein` | Proteins, enzymes, receptors, biomolecules |
| `term-pathology` | Diseases, syndromes, pathological processes |
| `term-anatomy` | Anatomical structures, organs, tissues |
| `term-pharma` | Drugs, medications, drug classes |

Permitted on `<a>` elements only, as the `class` attribute. Any other class value is stripped
by the sanitiser.

---

## Document-Level Side Effects

`renderNote()` sets these properties on the `document` object:

| Property | Value |
|---|---|
| `document.documentElement.lang` | `note.lang` (`"en"` or `"ar"`) |
| `document.documentElement.dir` | `"rtl"` if `note.lang === "ar"`, else `"ltr"` |
| `document.title` | `note.title` (browser tab title) |

---

## Error State

When `note` is falsy or `note.content` is absent, `renderNote()` sets:

```html
containerEl.innerHTML = '<div class="error-box">
  <strong>Note could not be rendered.</strong>
  <p>The note data is missing or incomplete. Please reload the page or contact support.</p>
</div>'
```

The function then returns immediately. No exception is thrown.
