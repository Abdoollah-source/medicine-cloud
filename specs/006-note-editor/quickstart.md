# Quickstart: Note Editor (SPEC-6)

## Prerequisites

1. SPEC-3 auth is working (you can sign in via Google).
2. SPEC-5 dashboard is working (notes table exists in Supabase with RLS).
3. Run the dev server:
   ```
   npx -y serve src -l 4000
   ```
   or use the existing Vite/serve setup.

## Scenario 1 — Create Mode (Happy Path)

**URL**: `http://localhost:4000/pages/editor.html`

1. You are redirected to login if not signed in. Sign in and return.
2. The editor page loads with an **empty textarea** and an **empty preview panel**.
3. The "Save Note" button is **disabled**.
4. Paste the following minimal valid JSON into the textarea:
   ```json
   {
     "title": "Acid-Base Disorders",
     "lang": "en",
     "content": "<h2>Overview</h2><p>ABG interpretation requires...</p>"
   }
   ```
5. **Within 300ms** the preview panel shows "Acid-Base Disorders" as the title.
6. The status bar shows a green **Valid JSON** indicator.
7. The "Save Note" button becomes **enabled**.
8. Click "Save Note".
9. The page navigates to `note.html?id=<new-uuid>`.
10. The note is visible in the Supabase `notes` table.

**Expected**: ✅ No console errors. Note ID in URL. Note visible on dashboard.

---

## Scenario 2 — Validation Errors

1. Paste `{ "title": "Test" }` (missing `lang` and `content`).
2. The status bar shows a **red** error: `Missing required field: lang`.
3. The save button is disabled.
4. Paste `{ "lang": "en" }` (missing `title` and `content`).
5. The status bar shows: `Missing required field: title`.
6. Paste `not valid json`.
7. The status bar shows the raw JS `SyntaxError` parse message.

---

## Scenario 3 — Update Mode

**URL**: `http://localhost:4000/pages/editor.html?id=<existing-note-id>`

1. The textarea is pre-filled with the note's editable JSON fields.
2. The preview panel renders the existing note immediately.
3. The save button reads **"Update Note"**.
4. Change the title field value. Click "Update Note".
5. The page navigates to `note.html?id=<same-id>` showing the updated title.

---

## Scenario 4 — Template Switch

1. Open editor with valid JSON pasted.
2. Change the template selector from "Classic" to "Academic Dark".
3. The preview panel background changes to dark, terminal-style typography.
4. Click "Save Note". Open the resulting `note.html?id=...`.
5. The note renders in Academic Dark (the template_id is stored in the note).

---

## Scenario 5 — Mobile Layout (DevTools)

1. Open DevTools and set viewport to 360px wide.
2. Confirm the editor layout is **single-column**: textarea on top, preview below.
3. Scroll the page. Confirm the sticky footer (Save/Clear buttons) is always visible.

---

## Scenario 6 — Clear Confirmation

1. Paste any JSON into the textarea (textarea not empty).
2. Click "Clear".
3. A browser-native `confirm()` dialog appears.
4. Click "Cancel" → textarea content preserved.
5. Click "Clear" again → confirm "OK" → textarea wiped, preview cleared, status bar reset.

---

## Scenario 7 — Note Not Found (Update Mode)

**URL**: `http://localhost:4000/pages/editor.html?id=00000000-0000-0000-0000-000000000000`

1. The page loads.
2. An `.error-box` is displayed: "Note not found or you do not have access."
3. The textarea remains empty and the save button is disabled.
