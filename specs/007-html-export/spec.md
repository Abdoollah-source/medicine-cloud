# Feature Specification: HTML Export

**Feature Branch**: `007-html-export`

**Created**: 2026-07-03

**Status**: Approved

**Input**: User description: "SPEC-7 — HTML Export"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Download a Self-Contained HTML File (Priority: P1)

A user is reading a note on the note reader page. They click "Export as HTML" in the header
controls. The browser immediately begins downloading a `.html` file. When the user opens that file
in any browser — even with no internet connection — the note renders with full styling, correct
fonts, and all visual polish, identical to what they saw on screen.

**Why this priority**: The core value of the feature. Everything else (filename, cross-browser,
offline correctness) is a sub-requirement of this single user journey.

**Independent Test**:
1. Open any note on `note.html`.
2. Click "Export as HTML".
3. Save the downloaded file to the desktop.
4. Disconnect from the internet.
5. Open the file in a browser.
6. Verify the note title, content, pills, and styling all render correctly.

**Acceptance Scenarios**:

1. **Given** a user is on the note reader page, **When** they click "Export as HTML", **Then** the browser downloads a `.html` file without navigating away from the page.
2. **Given** the downloaded `.html` file, **When** opened in a browser with no internet, **Then** the note renders with full styling — fonts loaded from Google Fonts CDN (requires one-time internet access), all CSS applied, and note content visible.
3. **Given** the note has a specific template active (e.g., Academic Dark), **When** the file is opened, **Then** it renders in that same template.
4. **Given** the note has an `alt` (bilingual) version, **When** the file is opened, **Then** the language-toggle button is functional and switches between primary and alternate language content.

---

### User Story 2 — Correct Filename Format (Priority: P1)

The downloaded file has a predictable, human-readable filename in the format
`medicine-cloud-<title-slug>-<YYYY-MM-DD>.html`. The title slug is derived by converting the note
title to lowercase, replacing spaces with hyphens, and removing all non-alphanumeric characters.

**Why this priority**: A consistent, descriptive filename makes the exported files easy to find
and organise on the user's filesystem.

**Independent Test**:
1. Export a note with title "Acid-Base Disorders".
2. Verify the downloaded filename is `medicine-cloud-acid-base-disorders-<today's date>.html`.

**Acceptance Scenarios**:

1. **Given** a note with title `"Acid-Base Disorders"` exported on `2026-07-03`, **When** the download starts, **Then** the filename is `medicine-cloud-acid-base-disorders-2026-07-03.html`.
2. **Given** a note with Arabic title `"تشخيص ABG"` exported today, **When** the download starts, **Then** the filename is `medicine-cloud-abg-<date>.html` (non-ASCII stripped, remaining alphanumeric slugified).
3. **Given** a note with title that produces an empty slug (e.g., all special characters), **When** the download starts, **Then** the filename falls back to `medicine-cloud-note-<date>.html`.

---

### User Story 3 — Works Across Chrome, Firefox, and Safari (Priority: P2)

The export button triggers a file download in all three major desktop browsers without any
browser-specific workarounds visible to the user.

**Why this priority**: Users may use any major browser. A download that only works in Chrome
would be a significant regression.

**Independent Test**:
1. Open the note reader in Chrome, Firefox, and Safari.
2. Click "Export as HTML" in each.
3. Verify a `.html` file downloads in all three.

**Acceptance Scenarios**:

1. **Given** the note reader is open in Chrome, **When** clicking "Export as HTML", **Then** a file download starts.
2. **Given** the note reader is open in Firefox, **When** clicking "Export as HTML", **Then** a file download starts.
3. **Given** the note reader is open in Safari, **When** clicking "Export as HTML", **Then** a file download starts.

---

## Edge Cases

- **Note with no `alt` field**: The language-toggle button in the exported file should be hidden (same as on the live page).
- **Very long note title**: The slug must be truncated to avoid filesystem path-length errors. Maximum slug length: 80 characters.
- **Note with missing optional fields** (`subject`, `unit`, `date`): The meta-pill bar is simply empty; the file must not throw any errors.
- **CSS fetch failure**: If `fetch()` cannot retrieve `base.css` or the template CSS at export time, the export is aborted and an `.error-state` message is shown to the user. The download must not silently produce a broken file.
- **Export triggered while note is still loading**: The "Export as HTML" button must be disabled until the note has been successfully rendered.

## Requirements

### Functional Requirements

- **FR-001**: System MUST expose an `exportHTML(note, templateId)` function in `src/js/export.js` that generates and triggers a browser download of a self-contained HTML file.
- **FR-002**: System MUST fetch `src/css/base.css` and the active template CSS file at export time and inline their contents in a `<style>` block in the generated HTML.
- **FR-003**: The generated HTML MUST include the Google Fonts CDN `<link>` tags (for Fraunces, Literata, Quicksand, Cairo) so fonts load on first open.
- **FR-004**: The generated HTML MUST contain the note data in a `<script id="note-data" type="application/json">` tag so the embedded renderer can hydrate from it.
- **FR-005**: The generated HTML MUST include the renderer logic (equivalent to `renderer.js`) and the language-toggle/theme-toggle logic inlined as non-module `<script>` tags (IIFE format) so the file works without a module bundler or server.
- **FR-006**: The generated HTML MUST include the full visual body structure from `note.html`: `.grain`, `.corner` overlays, `.plate`, `.top-row`, `.main-block` with identity block, EKG rule, note container, and channel row.
- **FR-007**: System MUST generate the filename using the pattern `medicine-cloud-<slug>-<YYYY-MM-DD>.html` where `<slug>` is the note title lowercased, spaces replaced with hyphens, non-alphanumeric characters removed.
- **FR-008**: Slug MUST be capped at 80 characters; if the resulting slug is empty, fall back to `note`.
- **FR-009**: System MUST create a `Blob` of type `text/html` and trigger download via a temporary object URL and synthetic anchor click.
- **FR-010**: The "Export as HTML" button on `note.html` MUST use the `.btn` or `.btn-sm` CSS class from the design system and be disabled until the note is rendered.
- **FR-011**: If CSS fetching fails, the export MUST be aborted and a visible `.error-state` message shown to the user; no broken file shall be downloaded.
- **FR-012**: The exported file MUST NOT contain any reference to Supabase credentials, `requireAuth()`, or any app-only auth logic — it is a read-only, standalone document.

### Key Entities

- **ExportedNote**: A subset of the note object — `title`, `lang`, `content`, `alt`, `subject`, `unit`, `date`, `template_id`. DB-only fields excluded.
- **TitleSlug**: The filename-safe, lowercased, hyphenated version of the note title, capped at 80 characters.
- **ExportedHTMLDocument**: The generated self-contained HTML string — all CSS inlined, all JS inlined as IIFEs, note data embedded in a JSON script tag.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Clicking "Export as HTML" triggers a file download in under 3 seconds on a standard connection (CSS fetch + Blob creation).
- **SC-002**: The downloaded `.html` file opens and renders the note correctly when the device has no internet connection (assuming fonts were previously cached by Google Fonts CDN).
- **SC-003**: The filename of the downloaded file matches the pattern `medicine-cloud-<slug>-<YYYY-MM-DD>.html` in 100% of export attempts.
- **SC-004**: The export completes with zero console errors on Chrome, Firefox, and Safari.
- **SC-005**: A note with Arabic title produces a valid, non-empty filename (ASCII-only slug or falls back to `note`).
- **SC-006**: A CSS fetch failure surfaces as a visible error message and does not produce a downloadable file.

## Assumptions

- **A-001**: The user's browser supports `Blob`, `URL.createObjectURL()`, and programmatic anchor-click download — all modern browsers since 2013.
- **A-002**: Google Fonts CDN is available when the exported file is first opened; subsequent offline opens rely on browser font cache.
- **A-003**: `src/css/base.css` and template CSS files are served from the same origin as the page, making them fetchable without CORS issues.
- **A-004**: PDF export is out of scope for this feature (SPEC-8).
- **A-005**: Server-side processing is prohibited; the entire export must happen in the browser.
- **A-006**: The Supabase SDK and `requireAuth()` are NOT included in the exported file — the exported file is a permanently public, standalone document once saved.
