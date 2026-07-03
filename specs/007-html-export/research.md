# Research Notes: HTML Export (SPEC-7)

## Key Design Decision: Renderer as IIFE String Constant

### Problem
`renderer.js` exports using ES module syntax. The exported standalone HTML file cannot rely on
a module bundler or server to resolve `import`/`export` statements. Options considered:

| Option | Description | Verdict |
|---|---|---|
| A | `fetch('renderer.js')` at export time → insert as IIFE | Requires URL resolution, fetch, and text transformation. Fragile if URL changes. |
| B | Build-time bundling (Rollup/Webpack) | Introduces a bundler dependency the project explicitly avoids (§8.1, vanilla JS first) |
| C | **Embed IIFE string constant in export.js** | Self-contained. No fetch needed. Renderer is stable post-SPEC-2. ✅ **CHOSEN** |

**Decision**: Option C — `export.js` contains the renderer logic as a hardcoded IIFE string.
When `renderer.js` changes, `export.js` must be manually kept in sync. This is acceptable given
that renderer changes are rare and breaking API changes are guarded by SPEC-2 tests.

## CSS Path Resolution

The CSS files live at `src/css/base.css` and `src/css/templates/{id}.css`. From the browser's
perspective when running `note.html` at `src/pages/note.html`, the relative paths are:
- `../css/base.css`
- `../css/templates/classic.css`

`exportHTML()` receives a `pageBaseUrl` parameter (or derives it from `location.href`) so it can
construct an absolute fetch URL that works on both `localhost` and the Cloudflare Pages production
domain.

```js
const base = new URL('../css/', location.href).href;
// → "https://example.pages.dev/css/" (or "http://localhost:4000/css/")
const baseCssUrl    = base + 'base.css';
const templateCssUrl = base + 'templates/' + templateId + '.css';
```

## Google Fonts CDN Links

The same four font families used in `note.html` must be present in the exported file:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,500;0,7..72,600;1,7..72,400&family=Quicksand:wght@400;500;600;700&family=Cairo:wght@400;500;600;700&display=swap" rel="stylesheet">
```

These are the exact same `<link>` tags already in `note.html` — hardcoded in `export.js`.

## Exportable Note Fields

Fields to include in `<script id="note-data">`:

| Include | Exclude |
|---|---|
| `title` | `id` |
| `lang` | `user_id` |
| `content` | `created_at` |
| `alt` (if present) | `updated_at` |
| `subject` (if present) | `deleted_at` |
| `unit` (if present) | `share_token` |
| `date` (if present) | `is_public` |
| `template_id` | — |

The exported note object contains only the fields that `renderNote()` consumes.

## Hydration Script Logic

The inline hydration IIFE in the exported file does exactly what `note.html`'s module script does,
but without ES modules or Supabase:

```js
(function() {
  var noteData = JSON.parse(document.getElementById('note-data').textContent.trim());
  var noteContainer = document.querySelector('.note-container');
  var showingAlt = false;

  // Theme
  function prefersDark() { return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; }
  function applyTheme(t) { document.documentElement.setAttribute('data-theme', t); try { localStorage.setItem('mc-theme', t); } catch(e){} }
  var savedTheme; try { savedTheme = localStorage.getItem('mc-theme'); } catch(e){}
  applyTheme(savedTheme || (prefersDark() ? 'dark' : 'light'));
  document.getElementById('themeToggle').addEventListener('click', function() {
    var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  });

  // Language toggle
  var langToggle = document.getElementById('langToggle');
  var langLabel  = document.getElementById('langToggleLabel');
  if (noteData.alt && noteData.alt.content) {
    langToggle.style.display = '';
    langLabel.textContent = noteData.lang === 'ar' ? 'EN' : 'AR';
    langToggle.addEventListener('click', function() {
      showingAlt = !showingAlt;
      var target = showingAlt ? noteData.alt : noteData;
      window.MC.renderNote(target, noteContainer);
      langLabel.textContent = showingAlt
        ? (noteData.lang === 'ar' ? 'AR' : 'EN')
        : (noteData.lang === 'ar' ? 'EN' : 'AR');
    });
  } else {
    langToggle.style.display = 'none';
  }

  // Initial render
  window.MC.renderNote(noteData, noteContainer);
})();
```

## Download Mechanism

```js
function triggerDownload(htmlString, filename) {
  const blob = new Blob([htmlString], { type: 'text/html; charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
```

`URL.revokeObjectURL` is called after 10 seconds to free memory; this is long enough for the
browser to initiate the download.

## Decisions Summary

| # | Decision | Rationale |
|---|---|---|
| 1 | Renderer as IIFE string constant in export.js | No fetch, no bundler, no URL fragility |
| 2 | CSS fetched at export time (not at page load) | Only pay fetch cost when user actually exports |
| 3 | Absolute URL derived from `location.href` | Works on any domain without hardcoding |
| 4 | Google Fonts links hardcoded string | Same links as note.html; stable font families |
| 5 | Slug max 80 chars, fallback `'note'` | Filesystem safety (FR-007, FR-008) |
| 6 | Button disabled during fetch, `.success-state` styling while loading | Design constraint + UX safety |
| 7 | `URL.revokeObjectURL` after 10s | Memory hygiene without risk of premature revocation |
| 8 | No Supabase SDK in exported file | §7.4 / FR-012 — exported file is a standalone document |
