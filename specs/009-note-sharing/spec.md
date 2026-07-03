# Feature Specification: Note Sharing

**Feature Branch**: `009-note-sharing`

**Created**: 2026-07-03

**Status**: Approved

**Input**: User description: "SPEC-9 — Note Sharing"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Generate a Public Share Link (Priority: P1)

An authenticated user is viewing one of their notes on the note reader page (`note.html?id=<id>`). They see a "Share Note" control in the page body or header. Since the note is currently private, the control shows a "Private" badge and a "Generate Share Link" button. When the user clicks the button, the system calls `enableSharing()`, updates the note's status to public, generates a UUID share token, and displays a share panel inside a `.card`. The panel contains a read-only text input containing the copyable share URL (format: `note.html?share=<UUID>`), a "Copy Link" button, and a "Revoke Sharing" button.

**Why this priority**: Core workflow. Allows users to create shareable links for their notes.

**Independent Test**:
1. Open an owned note on `note.html?id=<id>`.
2. Locate the share control panel.
3. Click "Generate Share Link".
4. Verify the UI updates to show a "Public" status badge and a copyable share URL field.
5. Verify the URL contains the `?share=` parameter followed by a UUID, and does not expose the internal note ID.

**Acceptance Scenarios**:

1. **Given** a private note, **When** loading the reader page, **Then** the share panel displays a "Private" badge and a "Generate Share Link" button.
2. **Given** a user clicks "Generate Share Link", **When** the database updates successfully, **Then** the share panel displays a "Public" badge, a read-only text field with the share link, a "Copy Link" button, and a "Revoke Sharing" button.
3. **Given** a public note, **When** loading the reader page, **Then** the share panel immediately displays the active share link and options.

---

### User Story 2 — Unauthenticated Public Reading (Priority: P1)

A third party receives a note share link (format: `note.html?share=<UUID>`). When they load this URL in a browser where they are not logged in, the system bypasses the normal authentication redirect, queries the note by its share token, and renders the note content. The viewer sees the note with full styling and templates, but cannot see any edit buttons, settings links, dashboard navigation, or the owner's share panel controls.

**Why this priority**: Essential requirement. The main purpose of generating a share link is to allow external unauthenticated reading.

**Independent Test**:
1. Copy the share URL generated in User Story 1.
2. Open a new private/incognito window (or log out).
3. Navigate to the share URL.
4. Verify the note renders correctly and no authentication check redirects the user.
5. Verify that no dashboard navigation, sign-out button, or share configuration controls are visible.

**Acceptance Scenarios**:

1. **Given** a valid share URL `note.html?share=<UUID>`, **When** accessed by an unauthenticated user, **Then** the note is fetched and rendered on screen.
2. **Given** a public note view, **When** rendered, **Then** all owner-only UI elements (such as settings controls, delete buttons, and the share panel) are hidden.

---

### User Story 3 — Revoke Note Sharing (Priority: P1)

An owner decided to stop sharing a public note. They open the note's reader page, locate the share panel, and click "Revoke Sharing". The system calls `revokeSharing()`, sets the note's status back to private (`is_public = false`, `share_token = null`), and reverts the share panel UI to the "Private" state. Any external user attempting to load the old share link receives a "Note not found or no longer shared" error message.

**Why this priority**: Critical security control. Users must be able to withdraw public access to their study materials at any time.

**Independent Test**:
1. Open the owner's view of a public note.
2. Click "Revoke Sharing".
3. Verify the share control reverts to showing "Private" and "Generate Share Link".
4. Try to access the old share URL in an incognito window.
5. Verify the page displays a "Note not found or no longer shared" error.

**Acceptance Scenarios**:

1. **Given** a public note, **When** the owner clicks "Revoke Sharing" and confirms the action, **Then** the database fields are updated and the UI displays the private/inactive state.
2. **Given** a revoked share link, **When** accessed by any user, **Then** the system returns a clear error message instead of rendering the note.

---

### User Story 4 — Cross-User Private Isolation (Priority: P1)

If User B attempts to access User A's private note by guessing or copying the internal note ID (`note.html?id=<uuid>`), the database RLS policies and application routing block the request, showing a "Note not found or access denied" error.

**Why this priority**: High-importance security rule. No user can view another user's private note.

**Independent Test**:
1. Log in as User B.
2. Enter the URL of User A's private note: `note.html?id=<User A's note-id>`.
3. Verify that the system displays an error and does not render User A's note content.

**Acceptance Scenarios**:

1. **Given** User A's private note, **When** User B queries the note by ID, **Then** the database SELECT query returns empty or permission denied.

---

## Edge Cases

- **Note is Soft-Deleted**: If a note is marked as soft-deleted (`deleted_at` is not null), it must not be accessible via its share link, even if `is_public` is true.
- **Copy to Clipboard Fails**: If the browser's clipboard API is blocked or fails, the "Copy Link" button must fall back to selecting the text in the read-only input field so the user can copy it manually.
- **Multiple Public Link Generation**: If a user generates a share link multiple times, the system should reuse the existing `share_token` rather than creating a new one each time, unless the link was previously revoked.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST implement `enableSharing(id)` in `src/js/notes.js` to update a note's database record to `is_public = true` and generate a `share_token` (UUID).
- **FR-002**: System MUST implement `revokeSharing(id)` in `src/js/notes.js` to update the note's record to `is_public = false` and `share_token = null`.
- **FR-003**: System MUST implement `getNoteByShareToken(token)` in `src/js/notes.js` to fetch public notes without user authentication.
- **FR-004**: System MUST apply the RLS policy: `CREATE POLICY "Public share read" ON notes FOR SELECT USING (is_public = TRUE AND share_token IS NOT NULL);` to allow public SELECT operations.
- **FR-005**: The note reader page (`src/pages/note.html`) MUST handle two entry routes:
  - `?id=<id>`: Authenticated owner mode. Requires `requireAuth()`.
  - `?share=<token>`: Public mode. Bypasses `requireAuth()`.
- **FR-006**: In public mode (`?share=<token>`), the system MUST query the note using `getNoteByShareToken(token)`.
- **FR-007**: If the note is not found or is soft-deleted, the system MUST render a clear "Note not found or no longer shared" error box.
- **FR-008**: The share panel on `note.html` MUST use the `.card` and `.card-body` padding styles from the design system.
- **FR-009**: The share URL text field MUST use the `.input` class, be read-only, and select its full text upon click/focus.
- **FR-010**: All buttons inside the share panel MUST use the `.btn`, `.btn-sm`, or `.btn-danger` classes.
- **FR-011**: The "Copy Link" button MUST copy the share URL to the clipboard using `navigator.clipboard.writeText` and temporarily change its text to "Copied!" for 2 seconds.
- **FR-012**: No rounded corners or blurred shadows are permitted in the share panel styling, adhering to Constitution §8.7.

### Key Entities

- **PublicNote**: A note with `is_public = true` and a valid UUID `share_token`.
- **SharePanel**: The user interface container rendered on `note.html` for configuring note sharing options.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: "Copy Link" button successfully copies the URL to the clipboard on 100% of modern browsers supporting the clipboard API.
- **SC-002**: Accessing a revoked share link returns a "Not found" error message in under 1 second.
- **SC-003**: 100% of unauthenticated note requests via `?share=<token>` load the note content without triggering a redirect to `login.html`.
- **SC-004**: Attempting to load another user's private note via `?id=<id>` fails with an error for 100% of unauthorized requests.
- **SC-005**: Changing sharing settings updates the database and reflects in the UI within 1.5 seconds.

## Assumptions

- **A-001**: Browser clipboard APIs are available; standard fallback selections are provided for older or restricted environments.
- **A-002**: Notes can be toggled between public and private states repeatedly without schema constraints.
- **A-003**: The share link exposes the note reader with the same default templates and renderer logic.
