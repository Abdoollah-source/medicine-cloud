# Research: Note Renderer (Core Engine)

**Branch**: `002-note-renderer` | **Date**: 2026-07-03

## Summary

All technical decisions for SPEC-2 are fully determined by the project constitution (§3.2–§3.5, §5.4,
§7.3) and the reference implementation in `medicine-cloud-note(claude).html`. No external research
is required; this document records the decisions extracted from those two sources.

---

## Decision 1: Sanitiser Strategy — DOMParser Allowlist Walk

**Decision**: Use `DOMParser` to parse the content string into a detached document, walk every
element node recursively, remove forbidden elements (preserving their text content as a text node),
and strip forbidden attributes from permitted elements. Serialize back to a string with
`element.innerHTML` of a wrapper div.

**Rationale**: DOMParser is available in all target browsers (Chrome, Firefox, Safari, Edge current
versions). It creates a completely detached DOM tree, so no injected `<script>` or `<img onerror>`
can execute during parsing. Walking the live tree and mutating it in a depth-first post-order
traversal is safe because child processing happens before parent removal.

**Alternatives Considered**:
- **Regex-based stripping**: Rejected. Regex cannot reliably parse HTML — nested tags and attribute
  permutations produce edge cases that defeat simple patterns. A parser is required.
- **DOMPurify library**: Rejected. Constitution §8.1 bans heavy frameworks. DOMPurify is a
  well-regarded library (~10kB min+gzip) but is unnecessary when the allowlist is small and
  well-defined. Our custom walker is ~30 lines for this specific allowlist.
- **Sanitizer API (native)**: Rejected for now. `window.Sanitizer` is not yet baseline across all
  target browsers (Firefox partial, Safari behind flag as of 2025). DOMParser walk is universally
  available.

---

## Decision 2: Allowlist Tag Set — Matches Constitution §3.2 Exactly

**Decision**: Allowed tags: `P, H2, H3, UL, OL, LI, STRONG, EM, TABLE, TR, TH, TD, SUP, SUB, A`.
All other tags (including `SCRIPT`, `STYLE`, `IFRAME`, `IMG`, `FORM`, `INPUT`, `DIV`, `SPAN`) are
forbidden. Forbidden elements are replaced by their text content (a text node), not silently dropped.

**Rationale**: Constitution §3.2 is the authoritative source. Text preservation on forbidden tags
prevents data loss when, for example, a note contains `<span>text</span>` — the word "text" must
not disappear, only the wrapper tag is removed.

**Attributes allowed per element**:
- All elements except `<a>`: zero attributes permitted
- `<a>` only: `href` (must start with `https://en.wikipedia.org/wiki/`), `class` (must be one of
  the five term classes), `target` (must equal `"_blank"`), `rel` (must equal `"noopener noreferrer"`)

---

## Decision 3: Sanitiser Runs BEFORE processMediaTags()

**Decision**: Call order is `sanitiseContent(raw) → processMediaTags(sanitised)`. The iframe and
div markup produced by `processMediaTags()` is trusted renderer output and must never be passed
through the sanitiser.

**Rationale**: If `processMediaTags()` ran first, the iframes it produces would immediately be
stripped by the sanitiser (iframes are in the forbidden set). Sanitiser must act on user-supplied
HTML; renderer-produced HTML is not user-supplied.

---

## Decision 4: YouTube — Privacy-Enhanced Domain

**Decision**: All YouTube iframes use `https://www.youtube-nocookie.com/embed/VIDEO_ID`.

**Rationale**: FR-008 in SPEC-2 mandates this. The privacy-enhanced domain does not set third-party
cookies until the user plays the video, reducing tracking exposure for users.

**Alternatives Considered**: Standard `youtube.com/embed/` — rejected per FR-008.

---

## Decision 5: Media Expansion — Seven Regex Replacements, Sequential

**Decision**: `processMediaTags()` applies seven `String.prototype.replace()` calls with named
capture groups, in this order: YT → TG_POST → TG_AUDIO → AUDIO → TG_IMAGE → IMAGE → VIDEO.
Each call is independent; order is not significant for correctness but is documented for consistency
with the reference implementation.

**Rationale**: The reference implementation in `medicine-cloud-note(claude).html` uses exactly
this sequential replacement pattern. All seven regex patterns were confirmed present in the reference.
Regex patterns use the form `/\[\[TYPE:([^\]|]+)(?:\|([^\]]+))?\]\]/g` — group 1 captures the
ID/URL, group 2 captures the optional caption.

---

## Decision 6: TG_AUDIO and TG_IMAGE — Link Card, Not Embed

**Decision**: `TG_AUDIO` and `TG_IMAGE` render as a styled link card with a text label and a
Telegram URL, not as an inline player or `<img>` tag.

**Rationale**: Telegram-hosted audio and images cannot be hotlinked reliably (Telegram's CDN URLs
expire or require auth). The reference implementation uses link cards for both. This matches the
reference behavior and avoids broken media.

---

## Decision 7: renderNote() DOM Targets — ID-Based Selectors

**Decision**: `renderNote(note, containerEl)` uses `containerEl.querySelector('#note-title')`,
`containerEl.querySelector('#note-meta-bar')`, and `containerEl.querySelector('#note-content')` to
locate sub-elements. It does not assume a global document structure.

**Rationale**: Scoping to `containerEl` makes the renderer reusable across any page that provides
the required skeleton (useful for SPEC-4 dual-language and SPEC-7 HTML export). Global
`document.getElementById()` would couple the renderer to a fixed page layout.

---

## Decision 8: Test Page — Hardcoded ABG JSON, Inline Theme Toggle

**Decision**: `src/pages/renderer-test.html` hardcodes the full ABG note JSON in a `<script>` tag,
imports `renderer.js` as an ES module, and implements the light/dark toggle with a short inline
`<script>` that reads/writes `localStorage['mc-theme']`.

**Rationale**: The test page must be openable directly as a file (`file://` protocol), with zero
build step. ES module imports work on `file://` in Chrome when modules are same-origin. The
localStorage key `mc-theme` is defined by Constitution §4.5.

---

## Decision 9: Error Box — Inline HTML Injection

**Decision**: On invalid note input, `renderNote()` sets `containerEl.innerHTML` to a
`<div class="error-box">` containing a human-readable message. No exception is thrown; the error is
displayed and the function returns.

**Rationale**: Constitution §8.6 mandates explicit error states. Throwing an exception would leave
the UI blank and produce an uncaught error in the console, violating §8.6's "silent failures are
unacceptable" clause.

---

## Decision 10: Note Content Fonts — Renderer-Side, Not Base.css

**Decision**: The Google Fonts `<link>` tags for Quicksand, Literata, and Cairo are loaded in
`renderer-test.html` (and in future: `note.html`), not in `base.css`. The `.note-content` area
uses these fonts via CSS already defined in the template CSS files (SPEC-0/classic.css).

**Rationale**: Constitution §8.7 explicitly states: "Note content retains the fonts from the note
renderer (Quicksand, Literata, Cairo)... these are content fonts, not UI chrome fonts." They do not
belong in the UI chrome stylesheet.
