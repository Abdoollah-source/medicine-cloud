# Feature Specification: Note Storage & Dashboard (Supabase CRUD)

**Feature Branch**: `005-note-storage-dashboard`

**Created**: 2026-07-03

**Status**: Approved

**Input**: User description: "SPEC-5 — Note Storage & Dashboard (Supabase CRUD)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Notes Grid on Dashboard (Priority: P1)

An authenticated user lands on the dashboard. The application displays a CSS loading spinner,
fetches the user's active (non-deleted) notes from Supabase, and renders them in a clean, responsive
neo-brutalist card grid. If the user has no notes, the dashboard displays a clear, centered empty state
with an inline SVG icon and a prominent "New Note" action.

**Why this priority**: Core landing screen experience. Users must be able to view their collection of notes before they can read, edit, or persist new ones.

**Independent Test**:
1. Log in with an allowed account.
2. If no notes exist, verify you see the "No notes yet" empty state.
3. Manually insert a row into the `notes` table in the Supabase database.
4. Refresh the dashboard. Confirm the note card appears in the grid, showing its title, category pills, and creation date.

**Acceptance Scenarios**:

1. **Given** no notes in the database, **When** loading the dashboard, **Then** the page displays the empty state block.
2. **Given** active notes exist, **When** loading the dashboard, **Then** a CSS grid layout renders cards for each note, displaying title, subject, unit, date, and creation timestamp.

---

### User Story 2 - Soft-Delete Note and View in Trash (Priority: P1)

A user hovers over a note card on the dashboard, clicks the option icon (⋯), and selects "Delete".
A neo-brutalist modal overlay asks for confirmation. Upon confirming, the card is immediately removed
from the main dashboard grid. The user can switch to the "Trash" view to see the deleted note, which now
displays the deletion date alongside restore and permanent erase actions.

**Why this priority**: Basic CRUD safety. Moving files to a recycle bin/trash protects users from losing data due to accidental clicks.

**Independent Test**:
1. Click the option menu on a note card and select "Delete".
2. Confirm the modal overlay appears. Click "Confirm".
3. Verify the card is removed from the dashboard grid.
4. Click the "Trash" toggle link in the header. Confirm the note card is visible in the trash list.

**Acceptance Scenarios**:

1. **Given** a note card, **When** clicking delete, **Then** a styled confirmation modal blocks layout interaction.
2. **Given** deletion is confirmed, **When** updating, **Then** the note's `deleted_at` field in Supabase is updated to the current timestamp and the note is removed from the main active query.

---

### User Story 3 - Restore Soft-Deleted Note (Priority: P1)

A user navigates to the "Trash" view, locates a note they accidentally deleted, and clicks the
"Restore" button. The note is removed from the trash list and immediately reappears in the main
dashboard grid.

**Why this priority**: Essential companion to soft-deletion. Restores accidentally deleted files.

**Independent Test**:
1. Open the "Trash" view.
2. Locate a deleted note and click "Restore".
3. Return to the main dashboard. Confirm the note card is visible in the active notes grid.

**Acceptance Scenarios**:

1. **Given** a note in trash, **When** clicking "Restore", **Then** the database updates `deleted_at` to `null` and the note returns to the active collection.

---

### User Story 4 - Hard-Delete Note with Double Confirmation (Priority: P1)

A user wants to permanently erase a sensitive note. In the "Trash" view, they click "Permanently erase".
A second confirmation modal displays. Upon confirming, the row is permanently purged from the
database.

**Why this priority**: Privacy and storage management. Users must have the ability to permanently erase data when desired.

**Independent Test**:
1. Open "Trash" view and click "Permanently erase".
2. Confirm a second modal appears. Click "Erase Permanently".
3. Check the database directly. Verify the row has been hard deleted (no longer exists in table).

**Acceptance Scenarios**:

1. **Given** a note in trash, **When** clicking permanent erase, **Then** the database row is deleted entirely.

---

### User Story 5 - Cross-User Isolation (Priority: P1)

Two separate users are logged in simultaneously on different browser profiles. User A creates,
edits, and views their notes. User B loads their dashboard. Neither user can see, query, or modify
the other's notes, even if they guess the private note ID.

**Why this priority**: Fundamental privacy constraint. Row-level security must protect user data segregation.

**Independent Test**:
1. Log in User A in Chrome, User B in Firefox.
2. Attempt to query User A's note ID from User B's console session.
3. Verify Supabase returns empty results or access denied.

**Acceptance Scenarios**:

1. **Given** separate active accounts, **When** querying notes, **Then** the system filters rows at the database level using RLS policy `auth.uid() = user_id`.

---

### User Story 6 - Supabase Free Tier Keep-Alive (Priority: P2)

To prevent the Supabase database instance from being paused due to free-tier inactivity, a scheduled
workflow executes in the background. Every 4 days, it pings the database API anon endpoint.

**Why this priority**: Infrastructure stability. Free-tier databases sleep after inactivity, which would cause user-facing errors on subsequent logins.

**Independent Test**:
1. Open GitHub Actions tab.
2. Manually trigger the "keep-alive" workflow.
3. Confirm the job completes successfully and logs a status 200 HTTP code.

**Acceptance Scenarios**:

1. **Given** a scheduled chron, **When** triggered, **Then** the keep-alive task makes a curl request to the database URL with the anonymous key.

---

## Edge Cases

- **Direct URL access to deleted note**: A user attempts to load `note.html?id=DELETED_ID`. The renderer must detect that the note is soft-deleted, block rendering, and show a "Note not found" error box.
- **Empty Trash**: When the user opens the Trash view and no notes are deleted, it must display "Trash is empty."
- **Network Interruptions**: If database calls fail during soft-delete or restore, the UI must display a toast or modal error state and recover the visual card layout rather than leaving a broken grid.
- **Database trigger update**: Any updates to note metadata or content must automatically refresh the database `updated_at` field via trigger.

## Requirements

### Functional Requirements

- **FR-001**: Database MUST contain a `notes` table matching the schema in Constitution §2.5.
- **FR-002**: Database MUST define Row-Level Security (RLS) policies enforcing owner-restricted operations (`auth.uid() = user_id`).
- **FR-003**: Database MUST define a trigger that automatically updates the `updated_at` column on UPDATE.
- **FR-004**: `notes.js` MUST export `createNote`, `getNote`, `listNotes`, `listTrash`, `updateNote`, `softDeleteNote`, `restoreNote`, and `hardDeleteNote`.
- **FR-005**: All CRUD functions in `notes.js` MUST enforce owner validation matching the current active auth session.
- **FR-006**: `dashboard.html` MUST display a CSS-only loading spinner during data fetch operations.
- **FR-007**: `dashboard.html` MUST render a responsive CSS grid of cards for active notes, displaying title, pills, and date.
- **FR-008**: Hovering over note cards MUST trigger a translateY animation and box shadow lift.
- **FR-009**: Note card click MUST route the browser to `note.html?id=UUID`.
- **FR-010**: Note card options menu MUST trigger a modal overlay for delete confirmations.
- **FR-011**: `dashboard.html` MUST support a toggleable Trash view listing soft-deleted notes with Restore and Permanently Erase actions.
- **FR-012**: Permanently Erase actions MUST require a double confirmation check before executing.
- **FR-013**: The dashboard UI MUST scale down to a minimum device viewport of `360px`.
- **FR-014**: The workflow file `.github/workflows/keep-alive.yml` MUST be scheduled on cron `'0 12 */4 * *'` to ping the Supabase anon endpoint.
- **FR-015**: Instructions for provisioning the database schema, RLS, and keep-alive secrets MUST be documented in `dev/SETUP.md`.

### Key Entities

- **`notes` table**: Primary storage table.
- **Dashboard Grid**: UI layout displaying active notes.
- **Trash view**: Sub-layout displaying soft-deleted notes.
- **Soft-delete Modal**: UI verification popups.
- **Keep-alive workflow**: GitHub actions scheduler.

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% of user data operations check owner identity via database RLS.
- **SC-002**: Empty states, grids, and trash layouts adapt to `360px` screens without layout breakages.
- **SC-003**: The keep-alive workflow pings the API every 4 days at noon UTC.
- **SC-004**: Restoring a note from trash completes database updates and refreshes dashboard state in under 300ms.
- **SC-005**: No external libraries are used for the loading spinner or layouts.
- **SC-006**: Opening a soft-deleted note via direct URL path returns a "Note not found" error box.
- **SC-007**: Changing any note value automatically updates the database `updated_at` column timestamp.

## Assumptions

- **A-001**: Supabase client initialization (SPEC-3/auth.js) is complete and active.
- **A-002**: Local environment variables are configured.
- **A-003**: The user's browser supports ES modules and standard CSS features (grid, clamp).
- **A-004**: Database connection is active.
