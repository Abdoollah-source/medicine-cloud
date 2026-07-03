# Medicine Cloud — Specs Registry

> This file is the single source of truth for all work to be done on Medicine Cloud.
> Specs are processed **in the order they appear here**, one at a time, through the mandatory
> development loop defined in **Constitution Article 9**.
>
> **Status legend:**
> - `BACKLOG`  — not yet started; awaiting its turn in the queue
> - `APPROVED` — reviewed, constitution-checked, cleared for building
> - `IN PROGRESS` — currently being built
> - `DONE`    — built, verified, all acceptance criteria pass
> - `BLOCKED` — cannot be completed; user notified; awaiting decision
> - `CANCELLED` — explicitly cancelled by the project owner with reason documented

---

## How to Read a Spec

Each spec contains:
- **Goal** — what this spec achieves and why it matters
- **Scope** — exactly what is in scope (and what is explicitly out)
- **Components** — every file, function, UI element, and database object that must be created or modified
- **Acceptance Criteria** — the exact tests that must pass for the spec to be marked DONE
- **Dependencies** — which specs must be DONE before this one can start
- **Verification Checklist** — structured checklist used during the VERIFY step of the loop

---
---

## SPEC-0 — Design System CSS (Neo-Brutalist Foundation)

**Status:** `BACKLOG`
**Priority:** P0 — Must be done before any page with visible UI is built
**Dependencies:** SPEC-1 DONE

---

### Goal
Implement the application's complete CSS design system — the one source of truth that every page
and component pulls from. The design language is defined in **`design-tamplete.html`** and
codified in **Constitution §8.7**. After this spec, all subsequent specs that build UI simply
use these CSS classes and variables; they never define their own colors, shadows, or border styles.

### Scope
**In scope:**
- The three canonical CSS custom properties (cream, ink, coral)
- The hard-shadow card pattern — exact 7-layer resting and 11-layer hover definitions
- Button styles (primary, secondary, danger variants \u2014 all brutalist)
- Typography scale (size tokens, weight, letter-spacing)
- Form elements (text inputs, textareas, selects) — same border/shadow treatment as cards
- Grid and layout utilities used across pages
- The `app-header` component CSS (brand bar, nav links, sign-out button)
- Inline SVG icon sizing conventions
- Focus-visible outline style (must be visible and on-brand)
- `@media (prefers-reduced-motion: reduce)` suppression
- Mobile responsive breakpoints (360px, 768px, 1280px)
- RTL-safe layout (no `left`/`right` absolute values without logical property fallback)
- A standalone visual test page `src/pages/design-test.html` that renders every component

**Out of scope:**
- Note content styles (those live in `base.css` from SPEC-1 and the renderer; they are exempt
  from the neo-brutalist rules per Constitution §8.7 Exceptions)
- Template switching logic (SPEC-4)
- Any JavaScript — this spec is CSS only

---

### Components

#### Update `src/css/base.css` — Add the design system layer

Add the following sections AFTER the existing token block (`:root`, light/dark theme variables)
that was copied from `medicine-cloud-note(claude).html` in SPEC-1.

**Section 1 — Neo-Brutalist Design Tokens**
```css
/* ============================================================
   NEO-BRUTALIST DESIGN SYSTEM
   Source of truth: design-tamplete.html + Constitution §8.7
   ============================================================ */
:root {
  /* Palette — three values only, no additions without constitution amendment */
  --cream:  #f4e9d8;
  --ink:    #111111;
  --coral:  #ff6f59;

  /* Typography scale */
  --font-ui: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-ui-ar: "Cairo", system-ui, sans-serif;
  --text-xs:   0.72rem;
  --text-sm:   0.85rem;
  --text-base: 1rem;
  --text-lg:   1.15rem;
  --text-xl:   1.4rem;
  --text-2xl:  1.8rem;
  --tracking-normal: 0.03em;
  --tracking-wide:   0.08em;
  --tracking-wider:  0.14em;

  /* Hard shadow — resting (7 layers) */
  --shadow-card:
    1px 1px  0 var(--ink),
    2px 2px  0 var(--ink),
    3px 3px  0 var(--ink),
    4px 4px  0 var(--ink),
    5px 5px  0 var(--ink),
    6px 6px  0 var(--ink),
    7px 7px  0 var(--ink);

  /* Hard shadow — hovered (11 layers, coral accent) */
  --shadow-card-hover:
    1px 1px  0 var(--ink),
    2px 2px  0 var(--ink),
    3px 3px  0 var(--ink),
    4px 4px  0 var(--ink),
    5px 5px  0 var(--ink),
    6px 6px  0 var(--ink),
    7px 7px  0 var(--ink),
    8px 8px  0 var(--ink),
    9px 9px  0 var(--ink),
    10px 10px 0 var(--ink),
    11px 11px 0 var(--coral);

  /* Hard shadow — small (4 layers, for buttons) */
  --shadow-sm:
    1px 1px 0 var(--ink),
    2px 2px 0 var(--ink),
    3px 3px 0 var(--ink),
    4px 4px 0 var(--ink);

  /* Hard shadow — small hovered (6 layers, coral accent) */
  --shadow-sm-hover:
    1px 1px 0 var(--ink),
    2px 2px 0 var(--ink),
    3px 3px 0 var(--ink),
    4px 4px 0 var(--ink),
    5px 5px 0 var(--ink),
    6px 6px 0 var(--coral);

  /* Transition — always fast and snappy */
  --transition-snap: transform 0.15s ease, box-shadow 0.15s ease;

  /* Border — single canonical border style */
  --border: 2.5px solid var(--ink);
}
```

**Section 2 — Reset & Base**
```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  min-height: 100vh;
  background: var(--cream);
  color: var(--ink);
  font-family: var(--font-ui);
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

/* RTL font stack */
html[dir="rtl"], html[dir="rtl"] body { font-family: var(--font-ui-ar); }

/* Page padding */
.page-wrap {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem;
}
@media (max-width: 768px) { .page-wrap { padding: 1.25rem; } }
```

**Section 3 — Card (the signature component)**
```css
/* ---- Card ---- */
.card {
  background: var(--cream);
  border: var(--border);
  border-radius: 0;
  box-shadow: var(--shadow-card);
  transition: var(--transition-snap);
  cursor: pointer;
}
.card:hover {
  transform: translate(-4px, -4px);
  box-shadow: var(--shadow-card-hover);
}
.card:active {
  transform: translate(2px, 2px);
  box-shadow:
    1px 1px 0 var(--ink),
    2px 2px 0 var(--ink),
    3px 3px 0 var(--ink);
}

/* Card content padding (apply to inner wrapper, not the card itself) */
.card-body { padding: 2rem 1.5rem; }
.card-body-sm { padding: 1.25rem 1rem; }

/* Card with icon layout (used in feature/empty-state cards) */
.card-icon-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
}

/* Icon inside a hoverable card changes stroke to coral */
.card:hover .icon-stroke { stroke: var(--coral); }
```

**Section 4 — Buttons**
```css
/* ---- Buttons ---- */
/* Base button — inherits the brutalist card style */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: var(--cream);
  border: var(--border);
  border-radius: 0;
  box-shadow: var(--shadow-sm);
  color: var(--ink);
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  font-weight: 600;
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  padding: 0.65rem 1.25rem;
  cursor: pointer;
  transition: var(--transition-snap);
  text-decoration: none;
  white-space: nowrap;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: var(--shadow-sm-hover);
}
.btn:active {
  transform: translate(2px, 2px);
  box-shadow:
    1px 1px 0 var(--ink),
    2px 2px 0 var(--ink);
}

/* Primary button — filled ink background */
.btn-primary {
  background: var(--ink);
  color: var(--cream);
}
.btn-primary:hover { color: var(--cream); }

/* Danger button — coral accent on border and text */
.btn-danger {
  border-color: var(--coral);
  color: var(--coral);
}
.btn-danger:hover {
  box-shadow:
    1px 1px 0 var(--coral),
    2px 2px 0 var(--coral),
    3px 3px 0 var(--coral),
    4px 4px 0 var(--coral),
    5px 5px 0 var(--coral),
    6px 6px 0 var(--coral);
}

/* Large button variant */
.btn-lg { font-size: var(--text-base); padding: 0.85rem 1.75rem; }

/* Small button variant */
.btn-sm {
  font-size: var(--text-xs);
  padding: 0.4rem 0.85rem;
  box-shadow:
    1px 1px 0 var(--ink),
    2px 2px 0 var(--ink),
    3px 3px 0 var(--ink);
}
.btn-sm:hover {
  transform: translate(-1px, -1px);
  box-shadow:
    1px 1px 0 var(--ink),
    2px 2px 0 var(--ink),
    3px 3px 0 var(--ink),
    4px 4px 0 var(--coral);
}
```

**Section 5 — Form Elements**
```css
/* ---- Form Elements ---- */
/* Inputs, textareas, and selects use the same brutalist border */
.input, .textarea, .select {
  width: 100%;
  background: var(--cream);
  border: var(--border);
  border-radius: 0;
  color: var(--ink);
  font-family: var(--font-ui);
  font-size: var(--text-base);
  padding: 0.65rem 0.85rem;
  outline: none;
  box-shadow: var(--shadow-sm);
  transition: var(--transition-snap);
  appearance: none;
  -webkit-appearance: none;
}
.input:focus, .textarea:focus, .select:focus {
  transform: translate(-2px, -2px);
  box-shadow: var(--shadow-sm-hover);
}
.textarea { resize: vertical; min-height: 200px; line-height: 1.6; }

/* Label */
.label {
  display: block;
  font-size: var(--text-sm);
  font-weight: 600;
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

/* Form group spacing */
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
```

**Section 6 — App Header**
```css
/* ---- App Header ---- */
.app-header {
  width: 100%;
  border-bottom: var(--border);
  background: var(--cream);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  gap: 1rem;
  flex-wrap: wrap;
}
@media (max-width: 768px) { .app-header { padding: 0.85rem 1.25rem; } }

.app-brand {
  font-size: var(--text-lg);
  font-weight: 700;
  letter-spacing: var(--tracking-normal);
  color: var(--ink);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.app-brand:hover { color: var(--coral); }

.app-nav {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

/* Nav link — no shadow, just border on hover */
.nav-link {
  font-size: var(--text-sm);
  font-weight: 600;
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--ink);
  text-decoration: none;
  padding: 0.35rem 0.75rem;
  border: 2.5px solid transparent;
  transition: border-color 0.12s ease, color 0.12s ease;
}
.nav-link:hover, .nav-link.active {
  border-color: var(--ink);
}
.nav-link.active { color: var(--coral); border-color: var(--coral); }
```

**Section 7 — Typography Utilities**
```css
/* ---- Typography ---- */
.text-xs  { font-size: var(--text-xs);  }
.text-sm  { font-size: var(--text-sm);  }
.text-base{ font-size: var(--text-base);}
.text-lg  { font-size: var(--text-lg);  }
.text-xl  { font-size: var(--text-xl);  }
.text-2xl { font-size: var(--text-2xl); }

.font-bold   { font-weight: 700; }
.font-medium { font-weight: 600; }

.tracking-normal { letter-spacing: var(--tracking-normal); }
.tracking-wide   { letter-spacing: var(--tracking-wide);   }
.tracking-wider  { letter-spacing: var(--tracking-wider);  }

.uppercase { text-transform: uppercase; }

/* Page title (used at top of each page) */
.page-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--ink);
  margin-bottom: 2rem;
}

/* Section label (small uppercase label above a section) */
.section-label {
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  color: var(--ink);
  opacity: 0.55;
  margin-bottom: 0.75rem;
}
```

**Section 8 — SVG Icon Conventions**
```css
/* ---- SVG Icons ---- */
/* All inline SVGs must carry these base classes */
.icon {
  flex-shrink: 0;
  stroke: var(--ink);
  stroke-width: 2.5;
  fill: none;
  stroke-linejoin: round;
  stroke-linecap: round;
}
.icon-sm  { width: 18px;  height: 18px;  }
.icon-md  { width: 24px;  height: 24px;  }
.icon-lg  { width: 40px;  height: 40px;  }
.icon-xl  { width: 70px;  height: 70px;  }

/* Stroke color variants */
.icon-coral { stroke: var(--coral); }
```

**Section 9 — Modals & Overlays**
```css
/* ---- Modal / Dialog ---- */
.modal-overlay {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(17, 17, 17, 0.55);
  display: flex; align-items: center; justify-content: center;
  padding: 1.5rem;
}
.modal {
  background: var(--cream);
  border: var(--border);
  border-radius: 0;
  box-shadow: var(--shadow-card);
  padding: 2rem;
  max-width: 480px;
  width: 100%;
}
.modal-title {
  font-size: var(--text-xl);
  font-weight: 700;
  margin-bottom: 1rem;
}
.modal-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.75rem;
  justify-content: flex-end;
  flex-wrap: wrap;
}
```

**Section 10 — Status Tags / Pills**
```css
/* ---- Status Tags ---- */
/* Used on the dashboard for spec status labels */
.tag {
  display: inline-block;
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  padding: 0.2rem 0.6rem;
  border: 2px solid var(--ink);
  border-radius: 0;
  background: var(--cream);
  color: var(--ink);
}
.tag-coral { border-color: var(--coral); color: var(--coral); }
```

**Section 11 — Layout Grid**
```css
/* ---- Grids ---- */
/* Note card grid (dashboard) */
.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}
@media (max-width: 600px) { .notes-grid { grid-template-columns: 1fr; gap: 1.4rem; } }

/* Two-column editor layout */
.editor-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
}
@media (max-width: 768px) { .editor-layout { grid-template-columns: 1fr; } }
```

**Section 12 — Focus & Accessibility**
```css
/* ---- Focus ---- */
/* Visible focus ring — on-brand, not the browser default */
:focus-visible {
  outline: 2.5px solid var(--coral);
  outline-offset: 3px;
}
/* Remove default outlines — we handle them with :focus-visible */
:focus:not(:focus-visible) { outline: none; }
```

**Section 13 — Reduced Motion**
```css
/* ---- Reduced Motion ---- */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
```

**Section 14 — Error & Status States**
```css
/* ---- Error / Status States ---- */
.error-state {
  border: var(--border);
  border-color: var(--coral);
  background: var(--cream);
  box-shadow:
    1px 1px 0 var(--coral),
    2px 2px 0 var(--coral),
    3px 3px 0 var(--coral);
  padding: 1.25rem 1rem;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--coral);
}
.success-state {
  border: var(--border);
  background: var(--cream);
  box-shadow: var(--shadow-sm);
  padding: 1.25rem 1rem;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--ink);
}
```

#### `src/pages/design-test.html` — Visual test page

A standalone page (not in production navigation, used only for verification) that renders:
- A row of three `.card` elements with different icon sizes to verify the shadow and hover effect
- All button variants: `.btn`, `.btn-primary`, `.btn-danger`, `.btn-lg`, `.btn-sm`
- Form elements: `.input`, `.textarea`, `.select` with `.label`
- A `.modal` (displayed inline, not as an overlay) with `.modal-title` and `.modal-actions`
- Status `.tag` elements
- The `.app-header` component
- A `.notes-grid` with three placeholder note cards
- All icon size classes with a sample SVG (stroke-only cube from `design-tamplete.html`)

Every element on this page must be built **exclusively from the CSS classes defined above** — no
ad-hoc inline styles, no additional colors, no border-radius, no blurred shadows.

---

### Acceptance Criteria

1. Open `src/pages/design-test.html` in Chrome.
2. **Background** is exactly `#f4e9d8` (cream). Verify with the browser color picker.
3. **Card resting state:** border is `2.5px solid #111111`, no border-radius, hard 7-layer shadow
   visible as a solid ink offset block.
4. **Card hover state:** card visibly lifts (translate up-left), shadow extends to 11 layers,
   the 11th layer is `#ff6f59` (coral). Verify color with the browser color picker.
5. **Card active (click-hold):** card presses down (translate down-right), shadow shrinks.
6. **`.btn` resting:** same border/shadow treatment, 4-layer shadow.
7. **`.btn:hover`:** lifts `-2px, -2px`, 6th shadow layer is coral.
8. **`.btn-primary`:** ink background, cream text.
9. **`.btn-danger`:** coral border and text; coral shadow on hover.
10. **`.input:focus`:** lifts with the coral-accent shadow (no border color change, just the lift).
11. **`.modal`:** ink border, cream background, hard shadow — no rounded corners.
12. **No element on the page has `border-radius` > 0** — confirm with DevTools "Computed" panel.
13. **No element has a blurred `box-shadow`** (blur radius = 0 on all shadow layers) — confirm
    in DevTools Computed panel.
14. **Focus test:** tab through all interactive elements — coral outline appears on each, no
    browser-default blue ring visible.
15. **Reduced motion test:** enable `prefers-reduced-motion` in Chrome DevTools → hover a card →
    the transform happens instantly with no easing animation.
16. **RTL test:** add `dir="rtl"` to `<html>` → layout mirrors correctly; no elements overlap.
17. Zero JavaScript console errors.

### Verification Checklist
- [ ] Background color `#f4e9d8` confirmed with color picker
- [ ] Card border: 2.5px solid `#111111`, no border-radius
- [ ] 7-layer hard shadow visible on resting card
- [ ] Hover: card lifts, 11-layer shadow, coral on layer 11
- [ ] Active: card presses in, shadow shrinks
- [ ] `.btn` shadow and hover
- [ ] `.btn-primary` fill
- [ ] `.btn-danger` coral styling
- [ ] Input focus lift
- [ ] Modal correct styling
- [ ] No border-radius anywhere (DevTools check)
- [ ] No blurred shadows (DevTools check)
- [ ] Focus: coral outline on tab
- [ ] Reduced motion: instant transitions
- [ ] RTL layout check
- [ ] Zero console errors

---
---

## SPEC-1 — Project Foundation & File Structure

**Status:** `BACKLOG`
**Priority:** P0 — Must be first; everything else depends on this
**Dependencies:** None

---

### Goal
Establish the physical file structure of the project exactly as described in Constitution §10.1,
initialise a git repository, set up the `.env` / `.gitignore` / `.env.example` files, and create
the empty skeleton files that future specs will fill in. This spec produces no visible UI but is
the non-negotiable foundation everything else builds on.

### Scope
**In scope:**
- Create the full directory tree under `MC-WEB_APP/src/` and `MC-WEB_APP/src/functions/`
- Create empty (or minimal stub) versions of every file listed in Constitution §10.1
- Initialise a git repository (if one does not already exist)
- Create `.gitignore`, `.env`, `.env.example`
- Write the `dev/SETUP.md` file: a human-readable guide covering Supabase project creation,
  Google OAuth setup in Supabase, and Cloudflare Pages connection steps

**Out of scope:**
- Any actual functionality (login, rendering, saving — those are later specs)
- Any CSS or visual design beyond an empty file with a comment header
- Deployment (that happens after the core features are built)

### Components

**`src/index.html`** — App shell. Contains: HTML5 boilerplate, Google Fonts preconnect links,
links to `css/base.css` and `css/templates/classic.css`, an empty `<div id="app">`, and
`<script src="js/app.js" type="module">`. No visible content yet.

**`src/css/base.css`** — Exact copy of the `:root{}`, `html[data-theme="light"]{}`, and
`html[data-theme="dark"]{}` blocks from `medicine-cloud-note(claude).html` (all CSS custom
properties). Plus the `*{ box-sizing:border-box; }` reset and `html,body` base styles.

**`src/css/templates/classic.css`** — Stub with header comment only.

**`src/js/app.js`** — Stub with `console.log('Medicine Cloud: app.js loaded')`.

**`src/js/auth.js`** — Stub with empty exported `initAuth()` function.

**`src/js/notes.js`** — Stubs: `createNote()`, `getNote()`, `listNotes()`, `updateNote()`,
`softDeleteNote()`.

**`src/js/renderer.js`** — Contains: exact copy of `processMediaTags(htmlContent)` and
`escapeHtml(str)` from the original HTML file, both exported. Empty `renderNote(note, targetEl)`
stub. A top comment explaining the module's purpose.

**`src/js/export.js`** — Stubs: `exportHTML(note, templateId)`, `exportPDF(noteUrl)`.

**`src/js/pdf.js`** — Stub: `requestPDFExport(noteUrl)`.

**`src/js/templates.js`** — Contains: `export const TEMPLATES = { classic: '...' }`. Stubs:
`loadTemplate(templateId)`, `getActiveTemplate()`.

**`src/pages/login.html`** — Boilerplate + h1 "Medicine Cloud" + placeholder sign-in button (unwired).

**`src/pages/dashboard.html`** — Boilerplate + h1 "My Notes" placeholder.

**`src/pages/editor.html`** — Boilerplate + h1 "Paste JSON" + placeholder textarea.

**`src/pages/note.html`** — Boilerplate + `<div id="note-container"><p>Loading...</p></div>`.

**`src/pages/settings.html`** — Boilerplate + h1 "Settings" placeholder.

**`src/functions/pdf-export.js`** — Cloudflare Worker stub returning 501.

**`.env.example`** — Contains `SUPABASE_URL=` and `SUPABASE_ANON_KEY=` (empty).

**`.env`** — Same as `.env.example` with a "do not commit" comment (unfilled).

**`.gitignore`** — Contains: `.env`, `node_modules/`, `.DS_Store`, `*.log`.

**`dev/SETUP.md`** — Step-by-step guide covering: Supabase project creation, Google OAuth setup,
copying credentials to `.env`, Cloudflare Pages connection, and GitHub Actions keep-alive setup.

### Acceptance Criteria

1. The directory tree matches Constitution §10.1 exactly (all directories and files exist).
2. `src/index.html` opens in a browser without console errors.
3. `src/js/app.js` is loaded and `console.log('Medicine Cloud: app.js loaded')` appears in console.
4. `processMediaTags()` and `escapeHtml()` in `renderer.js` are exported and callable.
5. `.gitignore` prevents `.env` from being tracked by git.
6. `.env.example` is committed to git with no real secrets.
7. `dev/SETUP.md` exists with all five sections.
8. A git commit `[SPEC-1] Project foundation & file structure` exists.

### Verification Checklist
- [ ] `src/` tree: `index.html`, `css/`, `js/`, `pages/`, `functions/` all present
- [ ] `src/css/`: `base.css`, `templates/classic.css`
- [ ] `src/js/`: `app.js`, `auth.js`, `notes.js`, `renderer.js`, `export.js`, `pdf.js`, `templates.js`
- [ ] `src/pages/`: `login.html`, `dashboard.html`, `editor.html`, `note.html`, `settings.html`
- [ ] `src/functions/`: `pdf-export.js`
- [ ] `.env`, `.env.example`, `.gitignore`, `dev/SETUP.md` all exist
- [ ] Open `src/index.html` in Chrome → no errors → console.log visible
- [ ] `git status` shows `.env` as untracked (gitignored)
- [ ] `git log` shows `[SPEC-1]` commit

---
---

## SPEC-2 — Note Renderer (Core Engine)

**Status:** `BACKLOG`
**Priority:** P0 — The renderer is the core of the entire app; everything visual depends on it
**Dependencies:** SPEC-1 DONE

---

### Goal
Build the complete, production-ready note renderer: a JavaScript module (`renderer.js`) that takes
a note JSON object and a target DOM element, renders the note's `content` HTML (with all media
placeholders expanded and all term links preserved), applies correct text direction, and displays
the note title, language, and metadata pills. This is a faithful, modular port of the rendering
logic from `medicine-cloud-note(claude).html`.

### Scope
**In scope:**
- Complete `renderNote(note, containerEl)` in `renderer.js`
- Complete `sanitiseContent(htmlContent)` using an allowlist-based sanitiser (DOMParser + walk)
- A self-contained test page `src/pages/renderer-test.html` with the hardcoded ABG note JSON
- All seven media placeholder types expanding correctly

**Out of scope:**
- Fetching from Supabase (SPEC-5), language toggle button (SPEC-4), theme toggle (SPEC-4),
  user authentication (SPEC-3)

### Components

#### `sanitiseContent(htmlContent)` — New exported function in `renderer.js`
- Parses the HTML string with `DOMParser`, walks every element recursively.
- Allowed elements: `P`, `H2`, `H3`, `UL`, `OL`, `LI`, `STRONG`, `EM`, `TABLE`, `TR`, `TH`,
  `TD`, `SUP`, `SUB`, `A`
- Allowed attributes for `A` only: `href` (must start with `https://en.wikipedia.org/wiki/`),
  `class` (must be one of the five term classes), `target` (must be `"_blank"`),
  `rel` (must be `"noopener noreferrer"`). No other elements have attributes.
- Forbidden elements are replaced with their text content (not removed entirely, to preserve text).
- Forbidden attributes are removed.
- Sanitiser runs BEFORE `processMediaTags()`. The iframes/divs produced by `processMediaTags()`
  are trusted output and are never passed through the sanitiser.

#### `renderNote(note, containerEl)` — Complete implementation
1. Validate: if `note` falsy or `note.content` missing, render `<div class="error-box">...` and return.
2. Determine direction: `const isRTL = note.lang === 'ar'`
3. Set `document.documentElement` lang and dir attributes. Set `document.title`.
4. Find `#note-title` in `containerEl` → set textContent, dir attribute, `note-title` class.
5. Find `#note-meta-bar` → clear it, create `<span class="note-pill">` for each of
   `note.subject`, `note.unit`, `note.date` if they exist.
6. Process content: `sanitiseContent(note.content || '')` then `processMediaTags(result)`.
7. Find `#note-content` → set `innerHTML`, set `dir` attribute.

#### `src/pages/renderer-test.html` — Standalone test page
- Loads `base.css`, `templates/classic.css`, imports `renderer.js` as ES module.
- Hardcodes the full ABG note JSON (copied from `medicine-cloud-note(claude).html` script tag).
- Calls `renderNote(testNote, document.getElementById('app'))` on `DOMContentLoaded`.
- Has a working theme toggle (inline JS, same as original).
- Must render visually identically to opening `medicine-cloud-note(claude).html` directly.

### Acceptance Criteria

1. Open `renderer-test.html` in browser — note title "Protein Structure, Function & ABG Analysis" visible.
2. Note renders RTL with Arabic fonts.
3. Unit "Unit 1" metadata pill visible.
4. YouTube embed `[[YT:hok2hyED9go|...]]` → embedded iframe + "Watch on YouTube" link.
5. Telegram post `[[TG_POST:athir_m1/208]]` → embedded iframe + "View on Telegram" link.
6. All five term link colors visible and each opens Wikipedia in new tab.
7. Acid-base disorders table renders correctly with headers.
8. Theme toggle works (light/dark).
9. Zero JavaScript console errors.
10. Raw `[[YT:...]]` and `[[TG_POST:...]]` strings not visible in DOM.
11. Injecting `<script>alert(1)</script>` into `note.content` → alert does NOT fire.

### Verification Checklist
- [ ] Title visible
- [ ] RTL Arabic fonts
- [ ] Metadata pill
- [ ] YouTube iframe
- [ ] Telegram iframe
- [ ] All 5 term link colors
- [ ] Table renders
- [ ] Theme toggle
- [ ] Zero console errors
- [ ] Raw placeholders gone from DOM
- [ ] XSS injection blocked

---
---

## SPEC-3 — Authentication & Access Gate

**Status:** `BACKLOG`
**Priority:** P0
**Dependencies:** SPEC-0 DONE, SPEC-1 DONE, SPEC-2 DONE

> **Design Constraint:** The login page is the first thing users see. It MUST follow the
> neo-brutalist design system (Constitution §8.7). The sign-in button → `.btn-primary` (ink fill).
> The error message → `.error-state`. No rounded corners. The login page background is
> `var(--cream)`. The Google sign-in button must be a brutalist `.btn .btn-primary`, not a
> standard Google-branded rounded button.

---

### Goal
Implement the full authentication flow: Google Sign-In via Supabase Auth, an allowlist-based
access gate that rejects uninvited users, session persistence, sign-out, and the auth-aware
router that redirects unauthenticated users to the login page.

### Scope
**In scope:**
- Supabase client initialisation using env variables
- Google OAuth sign-in button on the login page (wired and functional)
- `allowed_users` table in Supabase (`email TEXT PRIMARY KEY`) with RLS (self-read only)
- Allowlist check: after Google sign-in, if user's email is not in `allowed_users`, sign out
  and show rejection message
- Session persistence across page refreshes
- Sign-out button (stub, unstyled; will be styled in SPEC-4)
- Auth-aware routing: unauthenticated access to any page → redirect to `login.html`

**Out of scope:**
- Magic-link email fallback (SPEC-10), UI styling (SPEC-4), note functionality

### Components

#### Supabase: `allowed_users` table
```sql
CREATE TABLE allowed_users (email TEXT PRIMARY KEY);
ALTER TABLE allowed_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Self-read only" ON allowed_users FOR SELECT
  USING (auth.email() = email);
```
Enable Google OAuth in Supabase Auth dashboard. Add redirect URLs for the app domain and localhost.

#### `src/js/auth.js` — Complete implementation

The Supabase client is created using `window.MC_SUPABASE_URL` and `window.MC_SUPABASE_ANON_KEY`
(injected as global variables into each page's HTML via Cloudflare Pages environment variable
substitution, using the `__MC_SUPABASE_URL__` and `__MC_SUPABASE_ANON_KEY__` placeholder pattern
replaced at build time). Document this approach in a comment in `auth.js`.

Exported functions:
- **`initAuth()`** — Gets current session; if exists, checks allowlist. Listens for
  `onAuthStateChange`: on `SIGNED_IN`, check allowlist → redirect to dashboard; on `SIGNED_OUT`,
  redirect to login.
- **`signInWithGoogle()`** — Calls `supabase.auth.signInWithOAuth({ provider: 'google' })`.
- **`signOut()`** — Calls `supabase.auth.signOut()`, redirects to `login.html`.
- **`checkAllowlist(session)`** — Queries `allowed_users` for the session's email. If not found:
  call `signOut()` and show rejection message. Returns `true` if allowed.
- **`requireAuth()`** — Gets session; if none, redirect to login. If session, check allowlist.
  Returns session if allowed.
- **`showAuthError(message)`** — Sets `document.getElementById('auth-error').textContent = message`.

#### `src/pages/login.html` — Wire sign-in button
Add: Google sign-in button (`id="googleSignInBtn"`), hidden error paragraph (`id="auth-error"`),
a module script that imports `initAuth` and `signInWithGoogle` and wires the button.
Page redirects to `dashboard.html` automatically if session already exists.

#### Protected pages (`dashboard.html`, `editor.html`, `note.html`, `settings.html`)
Each gets a module script that calls `requireAuth()` immediately on load. Unauthenticated users
are redirected before any content renders.

### Acceptance Criteria

1. Clicking sign-in button opens Google OAuth consent screen.
2. Allowed Google account → redirected to `dashboard.html`.
3. Non-allowed Google account → signed out immediately + "You don't have access" error on login page.
4. Refresh `dashboard.html` while logged in → stays logged in.
5. Navigate to `dashboard.html` while logged out → redirected to `login.html`.
6. Sign-out → redirected to `login.html`.
7. `allowed_users` table has RLS enabled (confirmed in Supabase dashboard).
8. No hardcoded credentials in any JS file (manual code review).

### Verification Checklist
- [ ] Google consent screen opens
- [ ] Allowed user → dashboard
- [ ] Non-allowed user → rejection message
- [ ] Session persists on refresh
- [ ] Unauthenticated → redirect to login
- [ ] Sign-out works
- [ ] RLS confirmed
- [ ] No hardcoded credentials

---
---

## SPEC-4 — App Shell & Classic Template (Visual Foundation)

**Status:** `BACKLOG`
**Priority:** P1
**Dependencies:** SPEC-0 DONE, SPEC-1 DONE, SPEC-2 DONE, SPEC-3 DONE

> **Design Constraint:** All UI chrome built in this spec (header, buttons, template selector,
> controls) MUST use the CSS classes and variables defined in SPEC-0 (`base.css` design system).
> Constitution §8.7 applies in full. The note content area (`.note-content`) is exempt and retains
> its own typography from `medicine-cloud-note(claude).html`.

---

### Goal
Build the full visual shell of the application — the app header, navigation, light/dark theme
toggle, template switcher, and the complete "classic" template CSS. The note content area
must render identically to `medicine-cloud-note(claude).html`; the UI chrome around it follows
the neo-brutalist design system from `design-tamplete.html`. Also introduce the `academic-dark`
second template.

### Scope
**In scope:**
- Shared app header (`.app-header` component from SPEC-0) across all pages: brand name, nav
  links (`.nav-link`), theme toggle button (`.btn`), sign-out button (`.btn`)
- Light/dark theme toggle (persisted in `localStorage` under key `mc-theme`)
- Complete `classic.css` template (all token values from the original file)
- `academic-dark.css` — dark-only, high-contrast, electric blue accent, no grain
- `templates.js` complete implementation (`loadTemplate`, `getActiveTemplate`)
- `note.html` fully styled with a stub hardcoded note (ABG note); the note content area visually
  matches the original file; the UI chrome follows the design system
- Template switcher control on `note.html` (a `.btn`-styled `<select>` or segmented control)
- Language toggle button (`.btn`)

**Out of scope:**
- Editor (SPEC-6), dashboard (SPEC-5), export (SPEC-7/8)


### Components

#### `src/css/base.css` — Expand with all shared structural CSS
Add from the original file: `.plate`, `.corner`, `.top-row`, `.brand-eyebrow`, `.top-controls`,
`.lang-toggle`, `.theme-toggle`, `.main-block`, `.rule-top`, `.identity`, `.seal-btn`,
`.note-container`, `.note-title`, `.note-meta-bar`, `.note-pill`, `.note-content`, all heading/
paragraph/list/table styles inside `.note-content`, all five term link styles, all media embed
styles (`.media-embed`, `.iframe-container`, `.tg-post-container`, `.media-btn`, `.btn-yt`,
`.btn-tg`), `.channel-row`, `.channel-link`, `.bottom-row`, `.error-box`, all `@keyframes`,
all `@media` queries (mobile, reduced-motion), and RTL adjustments.

#### `src/css/templates/classic.css` — Full classic template
All token values for light and dark modes, copied verbatim from the original file's CSS variables:
- Light: `--paper:#eef0f4`, `--ink:#4c4f69`, `--gold:#a8791c` etc.
- Dark: `--paper:#0a0d13`, `--ink:#e7e2d3`, `--gold:#c9a23e` etc.
- All font family variables (Fraunces, Quicksand, Literata, Cairo, Noto Naskh Arabic)

#### `src/css/templates/academic-dark.css` — New dark template
A high-contrast dark-only theme:
- `--paper: #0d1117`, `--paper-2: #161b22`
- `--ink: #e6edf3`, `--ink-soft: #8b949e`, `--ink-faint: #484f58`
- `--gold: #58a6ff`, `--gold-bright: #79c0ff` (electric blue accent)
- `--grain-opacity: 0` (no grain)
- Distinct term colors: microbe `#3fb950` (green), protein `#79c0ff` (cyan), pathology `#f85149`
  (red), anatomy `#d29922` (amber), pharma `#bc8cff` (violet)
- This template always uses dark mode; document this in the file header.

#### `src/js/templates.js` — Complete implementation
```js
export const TEMPLATES = {
  classic: 'css/templates/classic.css',
  'academic-dark': 'css/templates/academic-dark.css'
}

export function loadTemplate(templateId) {
  const existing = document.getElementById('mc-template-link')
  if (existing) existing.remove()
  const link = document.createElement('link')
  link.id = 'mc-template-link'
  link.rel = 'stylesheet'
  link.href = TEMPLATES[templateId] || TEMPLATES.classic
  document.head.appendChild(link)
  localStorage.setItem('mc-template', templateId)
}

export function getActiveTemplate() {
  return localStorage.getItem('mc-template') || 'classic'
}
```

#### `src/pages/note.html` — Complete note reader
Structure: app header (brand, theme toggle, template selector, lang toggle, back link) + EKG rule
+ note-container (title, meta-bar, content) + channel row + bottom row.
On load: `requireAuth()`, use hardcoded ABG note stub, `renderNote(note, container)`.
Theme toggle: wired, working, persisted in `localStorage`.
Language toggle: switches between `note` and `note.alt` if alt exists (use `renderNote` again).
Template selector: `<select>` or tab; `loadTemplate()` on change; initialise from `getActiveTemplate()`.

### Acceptance Criteria

1. Open `note.html` (authenticated) → stub ABG note renders, visually identical to original file
   (fonts, colors, grain texture, corner marks, EKG animation all present).
2. Theme toggle: switching light/dark works and persists on refresh.
3. Template switcher: switching to `academic-dark` → visible color palette change; content unchanged.
   Switching back to `classic` restores original look.
4. Language toggle label shows "AR" when note is Arabic.
5. Page fully readable at 360 px width.
6. `prefers-reduced-motion: reduce` → all CSS animations suppressed.
7. Keyboard navigation: all controls reachable with Tab, visible focus rings present.
8. Zero JavaScript console errors.

### Verification Checklist
- [ ] Visual match to original file
- [ ] Theme toggle + persistence
- [ ] Template switcher (classic ↔ academic-dark)
- [ ] Language toggle label
- [ ] 360px mobile layout
- [ ] Reduced motion
- [ ] Keyboard navigation
- [ ] Zero console errors

---
---

## SPEC-5 — Note Storage & Dashboard (Supabase CRUD)

**Status:** `BACKLOG`
**Priority:** P1
**Dependencies:** SPEC-0 DONE, SPEC-3 DONE, SPEC-4 DONE

> **Design Constraint:** All UI on the dashboard MUST use the design system from SPEC-0.
> Note cards → use `.card` + `.card-body` classes. Buttons → `.btn`, `.btn-primary`, `.btn-danger`.
> Delete confirmation modal → `.modal` + `.modal-overlay` + `.modal-actions`. Status labels →
> `.tag`. No inline colors, no rounded corners, no blurred shadows anywhere on this page.

---

### Goal
Implement full note persistence in Supabase and build the dashboard: a card grid of the user's
notes with soft-delete, trash view, and restore. RLS ensures each user sees only their own notes.

### Scope
**In scope:**
- The `notes` table in Supabase (full schema from Constitution §2.5) with RLS policies
- `updated_at` trigger in Supabase
- Full implementation of all functions in `notes.js`
- Dashboard page: card grid, empty state, loading state, error state
- Soft-delete confirmation modal
- Trash view with restore and hard-delete
- GitHub Actions keep-alive workflow (`.github/workflows/keep-alive.yml`)

**Out of scope:**
- Note editor/JSON paste (SPEC-6), sharing (SPEC-9), export (SPEC-7/8)

### Components

#### Supabase: `notes` table
Full schema per Constitution §2.5. RLS policies:
- Owner SELECT (non-deleted): `auth.uid() = user_id AND deleted_at IS NULL`
- Owner SELECT (trash/deleted): `auth.uid() = user_id AND deleted_at IS NOT NULL`
- Owner INSERT: `auth.uid() = user_id`
- Owner UPDATE: `auth.uid() = user_id`
- Owner DELETE (hard): `auth.uid() = user_id`

`updated_at` trigger: updates `updated_at = NOW()` before every UPDATE.

#### `src/js/notes.js` — Complete implementation
All functions are async and return `{ data, error }`:
- **`createNote(noteJson)`** — INSERT with `user_id` from current auth session
- **`getNote(id)`** — SELECT by `id` where `user_id` matches and `deleted_at IS NULL`
- **`listNotes()`** — SELECT all non-deleted notes for current user, ORDER BY `created_at DESC`
- **`listTrash()`** — SELECT all deleted notes for current user, ORDER BY `deleted_at DESC`
- **`updateNote(id, patch)`** — UPDATE a partial note object by `id` + `user_id` check
- **`softDeleteNote(id)`** — UPDATE set `deleted_at = NOW()` by `id` + `user_id`
- **`restoreNote(id)`** — UPDATE set `deleted_at = NULL` by `id` + `user_id`
- **`hardDeleteNote(id)`** — DELETE row by `id` + `user_id` (called only from trash after double-confirm)

#### `src/pages/dashboard.html` — Complete dashboard

Three states in one page:

**Loading state:** CSS spinner (border-radius + border animation, no external library).

**Empty state:** Inline SVG icon (flask or note), text "No notes yet.", prominent "New Note" button.

**Populated state:**
- CSS grid: 1 column on mobile, 2–3 columns on desktop (auto-fill with min 280px)
- Each card: title (2-line clamp), subject/unit/date pills, template color dot, created date
- Card hover: `translateY(-3px)` + box-shadow lift
- Card click → `note.html?id=<id>`
- Three-dot menu (⋯) on hover → "Edit" (→ `editor.html?id=<id>`), "Delete" (confirmation modal)

**Soft-delete modal:** "Are you sure you want to move this note to trash?" with Confirm/Cancel.

**Trash view:** toggled via "Trash" header link. Shows deleted notes list with:
- Title, deletion date, "Restore" button, "Permanently erase" button
- "Permanently erase" requires a second confirmation dialog before calling `hardDeleteNote()`

Header additions: "New Note" button, "Trash" toggle link, sign-out button.

#### `.github/workflows/keep-alive.yml`
Scheduled cron `'0 12 */4 * *'` (every 4 days at noon UTC) + `workflow_dispatch`.
Runs `curl` to ping `SUPABASE_URL/rest/v1/` with the anon key.
Uses GitHub Actions secrets: `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
Document in `dev/SETUP.md`.

### Acceptance Criteria

1. Dashboard shows empty state after sign-in (no notes).
2. Manually insert a note in Supabase → card appears on dashboard.
3. Click card → navigates to `note.html?id=<id>` and note renders.
4. Delete → confirmation modal → confirm → card disappears, note soft-deleted in Supabase.
5. Trash view shows the deleted note.
6. Restore → note reappears on main dashboard.
7. "Permanently erase" with double confirmation → row gone from Supabase.
8. User A's notes invisible to User B (tested with two browser profiles simultaneously).
9. Dashboard usable at 360 px width.
10. Zero console errors.

### Verification Checklist
- [ ] Empty state visible
- [ ] Card appears after manual Supabase insert
- [ ] Card click → note renders
- [ ] Soft delete + confirmation
- [ ] Trash view shows deleted note
- [ ] Restore works
- [ ] Hard delete with double confirmation
- [ ] Cross-user isolation (two browser profiles)
- [ ] 360px layout
- [ ] Zero console errors

---
---

## SPEC-6 — Note Editor (JSON Paste, Preview, Save)

**Status:** `BACKLOG`
**Priority:** P1
**Dependencies:** SPEC-0 DONE, SPEC-2 DONE, SPEC-5 DONE

> **Design Constraint:** Every element on the editor page MUST follow the SPEC-0 design system.
> The JSON textarea → `.textarea` class (gets the hard-shadow treatment on focus).
> Buttons → `.btn`, `.btn-primary`. Status bar → `.error-state` (coral) or `.success-state`.
> Two-column layout → `.editor-layout` grid class. No rounded corners, no blurred shadows.
> The live preview panel renders note content — the note content area itself is exempt from
> the neo-brutalist rules, but the panel's outer frame and header use the design system.

---

### Goal
Build the note editor page: users paste AI-generated JSON, see a live preview using the renderer,
select a template, and save to Supabase. Also supports update mode (editing an existing note).

### Scope
**In scope:**
- Large `<textarea>` for JSON input
- Real-time JSON validation with descriptive error messages (not just "valid/invalid")
- Live preview panel (re-renders on every valid JSON change)
- Template selector (updates preview in real time)
- "Save" button calling `createNote()` → redirect to `note.html?id=<id>`
- "Update" mode: `?id=<note-id>` in URL → pre-fills textarea, "Update Note" button calls `updateNote()`
- Two-column desktop layout (input left, preview right), stacked on mobile

**Out of scope:**
- AI extraction prompt integration, drag-and-drop upload, collaborative editing

### Components

#### `src/pages/editor.html` — Complete editor

**Left panel:**
- Label "Paste your note JSON here"
- Resizable `<textarea id="jsonInput">` styled with app font stack
- Status bar: "Valid JSON ✓" (green) or "Error: <message>" (red)

**Right panel:**
- Same `note-container` structure as `note.html`
- Renderer called on every valid JSON parse
- Template `<select>` above the preview

**Validation (in order):**
1. `JSON.parse()` — if fails, show parse error message
2. Schema check: `title` must be non-empty; `lang` must be `"en"` or `"ar"`; `content` must be non-empty
3. Show specific field errors: "Missing required field: title" etc.

**Footer bar (sticky on mobile):**
- "Save Note" button (disabled when JSON invalid or empty)
- "Clear" button (confirmation before clearing)

**Update mode:**
- Detect `?id=<note-id>` on page load
- Call `getNote(id)`, reconstruct JSON object (exclude DB-only fields)
- Pre-fill `textarea` with `JSON.stringify(noteJson, null, 2)`
- Pre-select current template
- Change button label to "Update Note"

### Acceptance Criteria

1. Pasting ABG note JSON → live preview renders instantly, matching original file appearance.
2. Invalid JSON → red border + error message + Save disabled.
3. Missing `title` field → schema error message shown.
4. Template selector → preview updates in real time.
5. Save → saved to Supabase → redirect to `note.html?id=<id>`.
6. `editor.html?id=<id>` → textarea pre-filled + "Update Note" button → updates in Supabase.
7. 360px layout: textarea stacks above preview, sticky footer accessible.
8. Zero console errors.

### Verification Checklist
- [ ] Live preview matches original
- [ ] Invalid JSON error
- [ ] Schema validation error
- [ ] Template switcher on preview
- [ ] Save and redirect
- [ ] Update mode
- [ ] Mobile layout
- [ ] Zero console errors

---
---

## SPEC-7 — HTML Export

**Status:** `BACKLOG`
**Priority:** P2
**Dependencies:** SPEC-0 DONE, SPEC-5 DONE, SPEC-4 DONE

> **Design Constraint:** The "Export as HTML" button on `note.html` MUST be a `.btn` or `.btn-sm`
> from the design system. The loading/progress state uses `.success-state` styling.

---

### Goal
Users click "Export as HTML" on the note reader page and download a fully self-contained `.html`
file that renders identically when opened in any browser, including offline.

### Scope
**In scope:**
- `exportHTML(note, templateId)` in `export.js`
- "Export as HTML" button on `note.html`
- The generated file works offline (no external deps except Google Fonts CDN)

**Out of scope:** PDF export (SPEC-8), server-side processing

### Components

#### `src/js/export.js` — `exportHTML(note, templateId)`
1. Fetch contents of `css/base.css` and the selected template CSS via `fetch()`.
2. Build a complete HTML string:
   - HTML5 boilerplate + Google Fonts link tags
   - Inline `<style>` with base.css + template CSS contents
   - Full page body (`.grain`, `.corner`, `.plate`, note-container structure) identical to original
   - `<script id="note-data" type="application/json">` with `JSON.stringify([note], null, 2)`
   - Renderer JS + theme/language toggle JS inlined as IIFE `<script>` tags (non-module format)
3. Create a `Blob('text/html')` → object URL → trigger download.
4. Filename: `medicine-cloud-<title-slug>-<YYYY-MM-DD>.html`
   (title slug: lowercase, spaces→hyphens, non-alphanumeric removed)

The generated file must be functionally identical to `medicine-cloud-note(claude).html` when
opened with the same note data.

#### `note.html` — Add "Export as HTML" button to header controls.

### Acceptance Criteria

1. Click "Export as HTML" → browser downloads a `.html` file.
2. Open downloaded file offline → note renders correctly with full styling.
3. Visual appearance matches on-screen note exactly (same template applied).
4. Works in Chrome, Firefox, and Safari.
5. Filename format: `medicine-cloud-<slug>-<date>.html`.
6. Zero console errors.

### Verification Checklist
- [ ] Download triggered
- [ ] Offline rendering
- [ ] Visual match
- [ ] Cross-browser (Chrome, Firefox, Safari)
- [ ] Filename format
- [ ] Zero console errors

---
---

## SPEC-8 — PDF Export (Serverless)

**Status:** `BACKLOG`
**Priority:** P2
**Dependencies:** SPEC-0 DONE, SPEC-7 DONE

> **Design Constraint:** The "Export as PDF" button on `note.html` MUST be a `.btn` from the
> design system. The loading state ("Generating PDF...") uses an inline spinner consistent with
> the brutalist aesthetic — a simple animated border-based spinner in `var(--ink)` color,
> no external spinner components.

---

### Goal
Pixel-perfect PDF export using a Cloudflare Worker that runs headless Chromium (Cloudflare Browser
Rendering) to print the note page. The only acceptable PDF generation method per Constitution §6.2.

### Scope
**In scope:**
- `src/functions/pdf-export.js` — Cloudflare Worker using `@cloudflare/puppeteer`
- `requestPDFExport(noteUrl)` in `pdf.js`
- "Export as PDF" button on `note.html` with loading state

**Out of scope:** Any client-side screenshot/canvas-based PDF generation (explicitly forbidden)

### Components

#### `src/functions/pdf-export.js` — Cloudflare Worker
Uses `@cloudflare/puppeteer` (Cloudflare Browser Rendering, free tier):
1. Parse `?url=` query param. Validate it matches an allowed origin (`APP_ORIGIN` env var).
2. Launch headless browser, navigate to the URL, wait for `networkidle0`.
3. Call `page.pdf({ format: 'A4', margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' }, printBackground: true })`.
4. Return PDF binary with `Content-Type: application/pdf` and `Content-Disposition: attachment`.
5. Reject requests from non-allowed origins with 403.

#### `src/js/pdf.js` — `requestPDFExport(noteUrl)`
Fetches the worker URL with the note URL as a query param. On success: creates a Blob URL and
triggers download. On error: throws with descriptive message.

#### `note.html` — "Export as PDF" button + loading spinner + error state.

### Acceptance Criteria

1. Click "Export as PDF" → loading spinner + "Generating PDF…" text appears.
2. PDF downloads after a few seconds.
3. PDF is visually identical to on-screen note — no text cut off, no layout shift, A4 format.
4. Worker rejects requests from non-allowed origins (returns 403).
5. Zero console errors on the page.
6. No canvas-based or html2canvas-based PDF code anywhere.

### Verification Checklist
- [ ] Loading state appears
- [ ] PDF downloads
- [ ] Visual fidelity (compare PDF to screenshot), A4 format
- [ ] Origin restriction (403 on foreign origin)
- [ ] Zero console errors
- [ ] No canvas PDF code

---
---

## SPEC-9 — Note Sharing

**Status:** `BACKLOG`
**Priority:** P2
**Dependencies:** SPEC-0 DONE, SPEC-5 DONE

> **Design Constraint:** The share panel (containing the share URL, copy button, revoke button)
> MUST be a `.card` with `.card-body` padding. All buttons inside it MUST use `.btn`, `.btn-sm`,
> or `.btn-danger`. The share URL text field → `.input` (read-only). No rounded corners anywhere.

---

### Goal
Per-note public sharing via a UUID share token. The owner generates/revokes share links.
Shared notes are readable by unauthenticated users. Internal note IDs are never in share URLs.

### Scope
**In scope:**
- "Share" button on `note.html` (owner only) → share panel
- `enableSharing(id)` → sets `is_public = true`, generates/stores `share_token`
- `revokeSharing(id)` → sets `is_public = false`, `share_token = null`
- `getNoteByShareToken(token)` — unauthenticated public query
- Share URL format: `note.html?share=<UUID>`
- `note.html` handles both `?id=<id>` (authenticated) and `?share=<token>` (public) modes
- "Copy link" button
- Supabase RLS policy for public share reads

**Out of scope:** Collaborative editing, password-protected shares, expiring links

### Components

#### Supabase: public share RLS policy
```sql
CREATE POLICY "Public share read" ON notes FOR SELECT
  USING (is_public = TRUE AND share_token IS NOT NULL);
```

#### `src/js/notes.js` — Add sharing functions
- **`enableSharing(id)`** — UPDATE `is_public = true`, `share_token = crypto.randomUUID()`.
  Returns share URL.
- **`revokeSharing(id)`** — UPDATE `is_public = false`, `share_token = null`.
- **`getNoteByShareToken(token)`** — SELECT where `share_token = token AND is_public = true`.

#### `note.html` — Dual access modes + share panel
- On load: detect `?id=<id>` vs `?share=<token>`. `?id` → `requireAuth()` → `getNote(id)`.
  `?share` → `getNoteByShareToken(token)` (no auth). If not found → "Note not found" error.
- Share panel (visible only to owner in `?id` mode):
  - Status badge: "Private" or "Public"
  - If public: copyable share URL field, "Copy Link" button, "Revoke Sharing" button
  - If private: "Generate Share Link" button

### Acceptance Criteria

1. "Generate Share Link" → URL format `note.html?share=<UUID>`.
2. Opening share URL in a different browser (not logged in) → note renders correctly.
3. Share URL does not contain the internal note `id`.
4. "Revoke Sharing" → old share URL returns "Note not found or no longer shared".
5. Note with `is_public = false` is not accessible via `?share=<old-token>`.
6. User B cannot access User A's private note via `?id=<id>`.
7. Zero console errors.

### Verification Checklist
- [ ] Share URL generated with UUID
- [ ] Public access without login
- [ ] No internal ID in URL
- [ ] Revoke invalidates old URL
- [ ] is_public=false blocks share token
- [ ] Cross-user private isolation
- [ ] Zero console errors

---
---

## Backlog — Future Specs (Not Yet Scheduled)

The items below are captured ideas. Each must be expanded into a full spec before building begins.

| ID | Title | Description |
|---|---|---|
| SPEC-10 | Magic-Link Email Fallback | Secondary sign-in using Supabase passwordless email magic-link, restricted to the allowlist |
| SPEC-11 | Settings Page | Default template preference, display name, account info, sign-out, invite-a-friend request |
| SPEC-12 | Note Search | Full-text search across title/subject/content using Supabase `tsvector` |
| SPEC-13 | Telegram Backup Mirror | Auto-send a copy of each saved note to a private Telegram channel via Supabase Edge Function |
| SPEC-14 | Sepia Template | Warm sepia/parchment light-only template for comfortable long-reading |
| SPEC-15 | Note Version History | Store up to 10 previous versions per note; allow owner to view and restore any version |
| SPEC-16 | PDF Print Styles | `@media print` CSS stylesheet for clean browser-native printing as a zero-cost PDF alternative |
| SPEC-17 | Bilingual Editor Preview | When note JSON has `alt`, editor preview shows toggle to compare main and alt versions side-by-side |

---

*Medicine Cloud — Specs Registry v1.0 — July 2026*
