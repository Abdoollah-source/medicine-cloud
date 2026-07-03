# Feature Specification: Note Editor (JSON Paste, Preview, Save)

**Feature Branch**: `006-note-editor`

**Created**: 2026-07-03

**Status**: Approved

**Input**: User description: "SPEC-6 — Note Editor (JSON Paste, Preview, Save)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Paste JSON and See Live Preview (Priority: P1)

A user pastes AI-generated note JSON into the editor textarea. As they type or paste, the system
parses the JSON in real time. When the JSON is structurally valid and passes schema checks, the
right-side preview panel immediately updates to show the fully rendered note — same fonts, layout,
and media embeds as the standalone note reader. If the JSON is invalid, a descriptive error message
appears in the status bar; the preview remains unchanged from its last valid state.

**Why this priority**: Core editing workflow. The paste-and-preview loop is the primary value proposition of the editor.

**Independent Test**:
1. Open `editor.html`.
2. Paste the full ABG note JSON into the textarea.
3. Verify the live preview panel renders the note title, Arabic direction, pills, and YouTube embed.
4. Delete the closing brace to create invalid JSON. Verify the status bar shows a red error with the parse message.

**Acceptance Scenarios**:

1. **Given** a valid JSON string is pasted, **When** the textarea value changes, **Then** the preview panel re-renders the note within 300ms.
2. **Given** invalid JSON (parse error), **When** the value changes, **Then** the status bar shows a red `.error-state` message describing the exact parse failure.
3. **Given** JSON that passes `JSON.parse()` but fails schema checks, **When** validated, **Then** the status bar shows a specific field-level error (e.g., "Missing required field: title").

---

### User Story 2 - Save New Note to Supabase (Priority: P1)

A user pastes valid note JSON, confirms the preview looks correct, and clicks "Save Note". The
system calls `createNote()`, stores the note in the database, and navigates the browser to
`note.html?id=<new-uuid>`.

**Why this priority**: Core write operation. Without saving, the editor has no value.

**Independent Test**:
1. Paste valid note JSON into the editor.
2. Click "Save Note". Verify navigation to `note.html?id=<id>`.
3. Check Supabase database for the new row.

**Acceptance Scenarios**:

1. **Given** valid JSON, **When** clicking "Save Note", **Then** the note is stored in Supabase and the browser navigates to the note reader page.
2. **Given** invalid or empty JSON, **When** the save button is rendered, **Then** it is visually disabled and non-interactive.

---

### User Story 3 - Update Existing Note (Priority: P1)

A user opens the editor in "Update Mode" by navigating to `editor.html?id=<note-id>`. The system
fetches the existing note from Supabase, reconstructs the editable JSON (excluding database-only
metadata fields), and pre-fills the textarea. The preview renders immediately. The save button
label changes to "Update Note". On submit, `updateNote()` is called instead of `createNote()`.

**Why this priority**: Essential for correcting errors or adding new content to existing notes.

**Independent Test**:
1. Navigate to `editor.html?id=<existing-note-id>`.
2. Verify textarea is pre-filled with the note JSON.
3. Verify the preview renders the existing note.
4. Modify the title, click "Update Note". Verify the change is reflected in `note.html?id=<id>`.

**Acceptance Scenarios**:

1. **Given** a valid `?id=` URL parameter, **When** loading, **Then** the textarea is pre-filled with the note's JSON fields (excluding `id`, `user_id`, `created_at`, `updated_at`, `deleted_at`, `share_token`, `is_public`).
2. **Given** update mode, **When** the button is rendered, **Then** its label reads "Update Note" instead of "Save Note".
3. **Given** clicking "Update Note" with valid changes, **When** submitting, **Then** `updateNote()` is called and on success the browser navigates to `note.html?id=<id>`.

---

### User Story 4 - Template Selector Updates Preview (Priority: P1)

A user selects a different visual template from the dropdown above the preview panel. The preview
panel immediately re-renders using the newly selected template's CSS variables, without requiring
a save or page reload. The selected template is stored in the draft JSON.

**Why this priority**: Allows users to see how their note will look in different visual styles before saving.

**Independent Test**:
1. Open `editor.html` with valid JSON pasted.
2. Switch template from "Classic" to "Academic Dark" in the dropdown.
3. Verify the preview panel background shifts to dark slate, term link colors shift to high-contrast.

**Acceptance Scenarios**:

1. **Given** valid JSON and a visible preview, **When** changing the template selector, **Then** `loadTemplate()` is called and the preview re-renders with the new CSS variables.

---

### User Story 5 - Mobile Stacked Layout and Sticky Footer (Priority: P2)

On screens narrower than 768px, the two-column editor layout (textarea left, preview right) collapses
into a single vertical column: textarea on top, preview below. A sticky footer bar at the bottom
of the viewport always keeps the "Save Note" and "Clear" buttons accessible.

**Why this priority**: Mobile usability. Users should be able to paste and save on any device.

**Independent Test**:
1. Open DevTools and resize to 360px width.
2. Confirm textarea stacks above the preview panel.
3. Confirm the footer with Save/Clear buttons is visible and does not scroll away.

**Acceptance Scenarios**:

1. **Given** a 360px viewport, **When** the editor is open, **Then** the two-column grid collapses to a single column.
2. **Given** any screen size, **When** the page is scrolled, **Then** the footer bar with save/clear buttons remains fixed at the bottom of the viewport.

---

## Edge Cases

- **Empty Textarea on Load**: No preview renders. Status bar shows placeholder text. Save is disabled.
- **JSON With Unknown Fields**: Extra top-level keys beyond the schema are ignored (not blocked) to allow flexibility.
- **Very Long Content Strings**: Extremely long `content` values must not lock the browser UI. The `textarea` value changes are debounced by 300ms before triggering re-parse and re-render.
- **Update Mode — Note Not Found**: If `getNote(id)` returns no data (deleted or invalid ID), the editor shows an `.error-box` and does not pre-fill the textarea.
- **Clear Confirmation**: Clicking "Clear" on a non-empty textarea must show a browser-native confirm dialog before wiping the textarea content.

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide a resizable `<textarea id="jsonInput">` styled with the `.textarea` CSS class.
- **FR-002**: System MUST parse the textarea value as JSON on every `input` event, debounced by 300ms.
- **FR-003**: System MUST display specific schema error messages when required fields (`title`, `lang`, `content`) are missing or invalid.
- **FR-004**: System MUST call `renderNote()` to update the right-panel preview on every valid JSON parse.
- **FR-005**: The "Save Note" button MUST be disabled when the textarea is empty or when JSON is invalid.
- **FR-006**: System MUST call `createNote()` on save and navigate to `note.html?id=<returned-id>`.
- **FR-007**: System MUST detect `?id=` URL parameter on page load and enter Update Mode.
- **FR-008**: In Update Mode, system MUST call `getNote(id)` and pre-fill the textarea with the reconstructed note JSON (excluding database-only fields: `id`, `user_id`, `created_at`, `updated_at`, `deleted_at`, `share_token`, `is_public`).
- **FR-009**: In Update Mode, the button MUST read "Update Note" and call `updateNote()` instead of `createNote()`.
- **FR-010**: The template selector MUST call `loadTemplate()` on change and re-render the preview.
- **FR-011**: The "Clear" button MUST confirm before wiping the textarea.
- **FR-012**: The layout MUST use the `.editor-layout` grid class — two columns on desktop, single column on mobile (below 768px).
- **FR-013**: A sticky footer bar MUST contain the Save and Clear buttons at all viewport sizes.
- **FR-014**: System MUST call `requireAuth()` to block unauthenticated page access.

### Key Entities

- **JSON Input Block**: The editable text content representing a note in structured format.
- **Live Preview Panel**: The visual render output of the current valid JSON.
- **Status Bar**: Visual indicator of JSON validity and specific validation errors.
- **Note Schema**: The required field structure: `title`, `lang`, `content`. Optional: `subject`, `unit`, `date`, `alt`, `template_id`.

## Success Criteria

### Measurable Outcomes

- **SC-001**: The preview panel re-renders within 300ms of a valid JSON change (debounce-aware).
- **SC-002**: All three schema-level field errors produce distinct, human-readable messages in the status bar.
- **SC-003**: Saving a new note navigates to the correct note URL with the returned database ID.
- **SC-004**: Loading `editor.html?id=<id>` pre-fills the textarea within one network round-trip.
- **SC-005**: The sticky footer remains visible at all scroll positions on a 360px viewport.
- **SC-006**: Zero console errors on any of the happy path flows.

## Assumptions

- **A-001**: SPEC-2 `renderNote()` and SPEC-4 `loadTemplate()` are exported and functional.
- **A-002**: SPEC-5 `createNote()`, `getNote()`, and `updateNote()` are exported and functional.
- **A-003**: SPEC-3 `requireAuth()` is exported and functional.
- **A-004**: The `editor.html` page structure follows the SPEC-1 scaffold.
