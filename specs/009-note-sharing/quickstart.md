# Quickstart & Verification: Note Sharing (SPEC-9)

## 1. Setup & Environment
Ensure your local dev server is running:
`npx -y serve src -l 4000`

Ensure you have at least one note owned by your authenticated user in Supabase.

---

## Scenario 1 — Generate a Public Share Link

**URL**: `http://localhost:4000/pages/note.html?id=<note-id>`

1. Open note reader page for a note you own.
2. Locate the **Note Sharing** panel at the bottom of the page.
3. Verify it shows status "Private" and a "Generate Share Link" button.
4. Click "Generate Share Link".
5. Verify the UI updates:
   - Status tag changes to "Public" (with green `.tag` styling if configured).
   - A read-only text input field displays the URL: `http://localhost:4000/pages/note.html?share=<uuid>`.
   - "Copy Link" and "Revoke Sharing" buttons are visible.
6. Click "Copy Link".
7. Verify the button text changes to "Copied!" for 2 seconds, and the URL is copied to your clipboard.

---

## Scenario 2 — Unauthenticated Public View

1. Copy the share URL generated in Scenario 1.
2. Open a new Incognito browser window (where you are not logged in).
3. Navigate to the copied URL.
4. Verify:
   - The note content, title, and styling load correctly.
   - You are NOT redirected to `login.html`.
   - The "Sign Out" button is hidden.
   - The settings gear or edit icons are hidden.
   - The **Note Sharing** panel is completely hidden from view.

---

## Scenario 3 — Revoke Note Sharing

1. Return to the owner's view of the note (`note.html?id=<note-id>`).
2. Click "Revoke Sharing" in the share panel.
3. Verify the panel reverts to showing "Private" and the "Generate Share Link" button.
4. Open the Incognito window and reload the share URL (`note.html?share=<uuid>`).
5. Verify the page displays a clean, brutalist error box: "Note not found or no longer shared".
6. Verify the note content is NOT rendered.

---

## Scenario 4 — Cross-User Private Isolation

1. Log in as a different user (User B), or use another authenticated session.
2. Navigate directly to the owner URL of User A's private note:
   `http://localhost:4000/pages/note.html?id=<User A's private note-id>`
3. Verify the database and page block access, displaying "Note not found or access denied".
