# Quickstart & Validation Guide: Note Storage & Dashboard (Supabase CRUD)

**Branch**: `005-note-storage-dashboard` | **Spec**: [spec.md](./spec.md) | **Data Model**: [data-model.md](./data-model.md)

## Prerequisites

- SPEC-3 (Authentication) is completed.
- Supabase project is active, database tables and triggers provisioned.
- Local environment variables substituted.

---

## Scenario 1: Initial Empty State (SC-002)

**Goal**: Confirm dashboard shows empty state for a new user with zero notes.

**Steps**:
1. Log in with a clean authorized user profile.
2. Navigate to `dashboard.html`.
3. Check the interface.

**Expected Outcome**:
- A loading spinner displays briefly.
- The interface updates to display a clean centered empty state: flask/note SVG, text "No notes yet.", and a prominent "New Note" action.

---

## Scenario 2: Card Rendering from DB (SC-002)

**Goal**: Confirm notes inserted in the database appear as cards.

**Steps**:
1. Run this query in Supabase SQL editor:
   ```sql
   INSERT INTO notes (title, lang, subject, unit, date, content)
   VALUES ('Arterial Blood Gas Study', 'en', 'Biochemistry', 'Unit 1', '2026-07-03', '<p>Test Note</p>');
   ```
2. Reload `dashboard.html`.

**Expected Outcome**:
- A card displays in the grid.
- Displays: "Arterial Blood Gas Study", "Biochemistry", "Unit 1", "2026-07-03".
- Hovering over the card shifts the card up by 3px with a shadow lift.

---

## Scenario 3: Soft-Delete & Trash Verification (SC-004)

**Goal**: Verify deleting a card moves it to trash.

**Steps**:
1. On the dashboard card, click options (⋯) and click "Delete".
2. Confirm the modal overlay appears. Click "Confirm".
3. Check active grid. Click "Trash" link.

**Expected Outcome**:
- Card is removed from active grid.
- Toggling "Trash" view shows the deleted card.
- Database checks verify `deleted_at` is set to timestamp.

---

## Scenario 4: Note Restoration (SC-004)

**Goal**: Verify notes can be restored from trash.

**Steps**:
1. In "Trash" view, locate the note and click "Restore".
2. Verify trash updates and toggle back to main view.

**Expected Outcome**:
- Card disappears from trash view.
- Card returns to active dashboard grid.
- Database check shows `deleted_at` is null.

---

## Scenario 5: Hard-Delete Verification (SC-004)

**Goal**: Verify hard deletes purge rows.

**Steps**:
1. Move the card to trash again.
2. In trash view, click "Permanently erase".
3. Confirm confirmation check modal appears. Click "Erase Permanently".
4. Query table directly.

**Expected Outcome**:
- Card disappears from trash.
- Database returns 0 rows (hard deleted).

---

## Scenario 6: Keep-Alive Script Validation (SC-003)

**Goal**: Verify Keep-Alive script runs.

**Steps**:
1. Open `.github/workflows/keep-alive.yml`.
2. Confirm triggers are scheduled on cron `'0 12 */4 * *'`.
