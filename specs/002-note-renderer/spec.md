# Feature Specification: Note Renderer (Core Engine)

**Feature Branch**: `002-note-renderer`

**Created**: 2026-07-03

**Status**: Approved

**Input**: User description: "SPEC-2 — Note Renderer (Core Engine)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Render a Full Medical Note (Priority: P1)

A developer or student opens `renderer-test.html` directly in the browser. The page loads the
hardcoded ABG note JSON and immediately renders the complete note — title, metadata pills, RTL
Arabic direction, all media embeds, and all styled term links — without any network calls beyond
Google Fonts. This is the primary proof of the renderer's correctness.

**Why this priority**: Every subsequent feature (dashboard, editor, export) depends on the renderer
being able to turn a note JSON object into a readable, correctly formatted page. Nothing else can
be validated without this working first.

**Independent Test**: Open `src/pages/renderer-test.html` in Chrome with no local server. The note
title "Protein Structure, Function & ABG Analysis" must appear, RTL direction must be active,
and all media embeds must be visible with zero console errors.

**Acceptance Scenarios**:

1. **Given** `renderer-test.html` is opened in a browser, **When** the page finishes loading,
   **Then** the note title "Protein Structure, Function & ABG Analysis" is visible in the heading.
2. **Given** the ABG note has `lang: "ar"`, **When** rendered, **Then** the content container has
   `dir="rtl"` and the Arabic font stack is visually applied.
3. **Given** the note has `unit: "Unit 1"`, **When** rendered, **Then** a metadata pill labelled
   "Unit 1" appears in the meta bar.
4. **Given** the note has a `[[YT:hok2hyED9go|...]]` placeholder, **When** rendered, **Then** a
   responsive YouTube `<iframe>` embed appears and the raw `[[YT:...]]` string is absent from the DOM.
5. **Given** the note has a `[[TG_POST:athir_m1/208]]` placeholder, **When** rendered, **Then** a
   Telegram post `<iframe>` embed appears and a "View on Telegram" link is present.

---

### User Story 2 - Sanitise Untrusted HTML Content (Priority: P1)

Before any note HTML is injected into the DOM, the renderer runs it through an allowlist-based
sanitiser. Forbidden tags and attributes are stripped; safe tags and their permitted attributes
survive intact. The sanitiser runs before media placeholders are expanded, so the iframes produced
by `processMediaTags()` are never passed through it.

**Why this priority**: Content injection into `innerHTML` is the primary XSS vector. Without
sanitisation, a malicious note (crafted or compromised) could execute arbitrary JavaScript in the
user's browser. This is a security critical requirement, not an enhancement.

**Independent Test**: Inject `<script>alert(1)</script>` into `note.content` and confirm the alert
does not fire. Inject `<img onerror="alert(2)" src="x">` and confirm no alert fires. Confirm a
valid `<strong>` tag survives sanitisation intact.

**Acceptance Scenarios**:

1. **Given** `note.content` contains `<script>alert(1)</script>`, **When** `sanitiseContent()` is
   called, **Then** the script element is removed from the rendered DOM and the alert does not fire.
2. **Given** `note.content` contains `<img onerror="alert(2)" src="x">`, **When** rendered,
   **Then** no `<img>` element appears in the DOM.
3. **Given** `note.content` contains `<strong>Important</strong>`, **When** sanitised, **Then**
   the `<strong>` element with its text survives intact.
4. **Given** `note.content` contains an `<a>` with `href="https://en.wikipedia.org/wiki/Albumin"`,
   **When** sanitised, **Then** the anchor, its href, and its `class="term-protein"` attribute survive.
5. **Given** `note.content` contains `<a href="javascript:alert(1)">`, **When** sanitised,
   **Then** the href attribute is removed (href does not start with the allowed Wikipedia prefix).

---

### User Story 3 - Expand All Seven Media Placeholder Types (Priority: P1)

The renderer recognises all seven media placeholder tag formats defined in Constitution §3.4 and
converts each into appropriate, accessible HTML markup. Any unrecognised placeholder is left as
plain text and is never invisible.

**Why this priority**: Medical notes extensively embed YouTube explanations, Telegram posts,
images, and audio recordings. If placeholders are not expanded, the study material is incomplete
and unusable.

**Independent Test**: Add one of each of the seven placeholder types to the test note JSON. Load
`renderer-test.html` and confirm each type renders its intended output (iframe, audio player, image,
or link card) and the raw tag string is gone from the DOM.

**Acceptance Scenarios**:

1. **Given** `[[YT:VIDEO_ID|Caption]]`, **When** rendered, **Then** a responsive `<iframe>` for
   `https://www.youtube-nocookie.com/embed/VIDEO_ID` appears, wrapped with a "Watch on YouTube" link.
2. **Given** `[[TG_POST:channel/id]]`, **When** rendered, **Then** a Telegram embed `<iframe>` for
   `https://t.me/channel/id?embed=1` appears, with a "View on Telegram" fallback link.
3. **Given** `[[TG_AUDIO:url|Caption]]`, **When** rendered, **Then** a card with a "Listen on Telegram" link appears (no inline audio player).
4. **Given** `[[AUDIO:url]]`, **When** rendered, **Then** a native HTML `<audio controls>` element appears.
5. **Given** `[[TG_IMAGE:url|Caption]]`, **When** rendered, **Then** a card with a "View image on Telegram" link appears.
6. **Given** `[[IMAGE:url]]`, **When** rendered, **Then** an `<img>` element appears.
7. **Given** `[[VIDEO:url]]`, **When** rendered, **Then** a native HTML `<video controls>` element appears.

---

### User Story 4 - Display Error State for Invalid Note Input (Priority: P2)

When the note passed to `renderNote()` is null, undefined, or missing the required `content` field,
the renderer displays a user-friendly error box inside the container element instead of crashing
or leaving a blank screen.

**Why this priority**: Robust error handling prevents blank screens that confuse users and hides
crashes that are hard to diagnose. Graceful degradation matters for a production app.

**Independent Test**: Call `renderNote(null, document.getElementById('app'))`. Confirm an
error box with a human-readable message appears. Confirm no uncaught JavaScript exception is thrown.

**Acceptance Scenarios**:

1. **Given** `renderNote(null, containerEl)` is called, **When** executed, **Then** a visible error
   box appears inside `containerEl` and the browser console shows no uncaught exception.
2. **Given** `renderNote({}, containerEl)` is called (note object missing `content`), **When**
   executed, **Then** the same error box appears.

---

## Edge Cases

- **Empty content string**: `note.content = ""` → renderer runs sanitiser and `processMediaTags()` on
  empty string, produces an empty `#note-content` div. No crash. No error box.
- **Malformed placeholder**: `[[YT:]]` (no video ID) → left as literal text, not converted to an
  iframe. Never silently dropped.
- **Deeply nested forbidden tags**: `<p><script>x</script></p>` → sanitiser removes `<script>`,
  preserves `<p>`, keeps the text node `x`.
- **Missing optional metadata fields**: `note.subject`, `note.unit`, `note.date` absent → meta bar
  renders with zero pills; no blank pill placeholders left in DOM.
- **Ampersands in placeholder URLs**: `&amp;` in a YouTube URL is decoded to `&` before inserting
  into the iframe src.
- **`alt` field present**: `note.alt` is present → this spec does not render it (SPEC-4 is
  responsible for the language toggle). The renderer ignores `note.alt` in this spec.

## Requirements

### Functional Requirements

- **FR-001**: `renderNote(note, containerEl)` MUST be exported from `src/js/renderer.js`.
- **FR-002**: `sanitiseContent(htmlContent)` MUST be exported from `src/js/renderer.js`.
- **FR-003**: `processMediaTags(htmlContent)` MUST be exported from `src/js/renderer.js`.
- **FR-004**: `sanitiseContent()` MUST use an allowlist-based approach: walk every DOM element, remove
  any element whose tag is not in the allowed set, remove any attribute whose name is not permitted
  for that element. Forbidden elements' text content is preserved in a plain text node.
- **FR-005**: The allowed element set for sanitisation MUST match Constitution §3.2 exactly: `P, H2, H3,
  UL, OL, LI, STRONG, EM, TABLE, TR, TH, TD, SUP, SUB, A`.
- **FR-006**: The allowed attributes for `<a>` MUST be: `href` (must start with
  `https://en.wikipedia.org/wiki/`), `class` (must be one of the five term classes), `target`
  (must equal `"_blank"`), `rel` (must equal `"noopener noreferrer"`). All other attributes on
  all other elements MUST be stripped.
- **FR-007**: `processMediaTags()` MUST expand all seven placeholder types defined in Constitution §3.4.
- **FR-008**: YouTube embeds MUST use the privacy-enhanced domain `https://www.youtube-nocookie.com/embed/`.
- **FR-009**: `renderNote()` MUST validate the note object; if `note` is falsy or `note.content` is
  absent, it MUST inject a visible error box with a human-readable message and return early.
- **FR-010**: `renderNote()` MUST set `document.documentElement.lang` and `document.documentElement.dir`
  based on `note.lang`.
- **FR-011**: `renderNote()` MUST populate `#note-title` with `note.title` and set `dir` on it.
- **FR-012**: `renderNote()` MUST clear `#note-meta-bar` and create a `<span class="note-pill">` for each
  of `note.subject`, `note.unit`, `note.date` that is present.
- **FR-013**: `renderNote()` MUST set `innerHTML` of `#note-content` to the sanitised and
  media-expanded content, then set its `dir` attribute.
- **FR-014**: The test page `src/pages/renderer-test.html` MUST embed the complete ABG note JSON
  and call `renderNote()` on page load.
- **FR-015**: The test page MUST include a working light/dark theme toggle that reads/writes
  `localStorage` under the key `mc-theme`.

### Key Entities

- **`renderNote(note, containerEl)`**: Primary export. Orchestrates validation, direction, title,
  meta pills, sanitisation, media expansion, and DOM injection.
- **`sanitiseContent(htmlContent)`**: Security-critical export. Allowlist-based HTML sanitiser.
  Returns a sanitised HTML string.
- **`processMediaTags(htmlContent)`**: Media expansion export. Converts all seven placeholder
  types into embed HTML. Returns a processed HTML string.
- **Note JSON object**: The canonical data input, conforming to Constitution §2.5 and §3.1.
- **ABG Test Note**: The complete hardcoded JSON from `medicine-cloud-note(claude).html`, used
  exclusively in `renderer-test.html`.

## Success Criteria

### Measurable Outcomes

- **SC-001**: `renderer-test.html` displays the note title, RTL direction, at least one metadata
  pill, one YouTube embed, one Telegram embed, and all five term link colours — all in a single
  browser load with zero console errors.
- **SC-002**: Injecting `<script>alert(1)</script>` into `note.content` produces zero DOM `<script>`
  elements and no JavaScript alert dialog.
- **SC-003**: All seven media placeholder types produce their expected HTML output when tested with
  one example each.
- **SC-004**: Calling `renderNote(null, el)` produces a visible error box and zero uncaught
  JavaScript exceptions.
- **SC-005**: The theme toggle switches the page between light and dark states and the chosen state
  survives a page reload (persisted in `localStorage`).

## Assumptions

- **A-001**: `medicine-cloud-note(claude).html` is the authoritative reference for the ABG note JSON,
  the visual design of the rendered note, and the exact placeholder-to-HTML expansion logic.
- **A-002**: `DOMParser` is available in all target browsers (Chrome, Firefox, Safari, Edge — all
  current versions). A polyfill is not required.
- **A-003**: SPEC-1 is complete; `src/js/renderer.js` exists as a stub and `src/pages/` directory
  is present.
- **A-004**: SPEC-0 is complete; `src/css/base.css` and `src/css/templates/classic.css` contain
  the design system. The note renderer uses those stylesheets.
- **A-005**: The `alt` bilingual field in the note JSON is ignored by this spec. Language toggling
  is delegated to SPEC-4.
