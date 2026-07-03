# Implementation Plan: Note Sharing

**Branch**: `009-note-sharing` | **Date**: 2026-07-03 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/009-note-sharing/spec.md`

## Summary

Implement per-note public sharing via a UUID share token. Owners can generate and revoke public links directly on `note.html?id=<id>`. A brutalist share panel is added to the note reader, letting the owner copy the link or revoke sharing. Shared notes are readable by unauthenticated users via `note.html?share=<UUID>`, which bypasses the standard authentication checks.

## Technical Context

**Language/Version**: Vanilla ES2022 (no bundler, no transpiler)

**Primary Dependencies**:
- `src/js/notes.js` → extended with `enableSharing(id)`, `revokeSharing(id)`, and `getNoteByShareToken(token)`
- `src/js/auth.js` → extended to bypass `requireAuth()` if `?share=` is present in the URL
- Browser Clipboard API (`navigator.clipboard.writeText`)
- Supabase client (Row-Level Security select policy)

**Storage**: Supabase notes table (`is_public` and `share_token` columns)

**Testing**: 
- Manual verification of share link generation and revocation
- Incognito browser loading of `note.html?share=<UUID>`
- Verification that User B cannot read User A's private notes

**Target Platform**: Cloudflare Pages + Supabase

**Performance Goals**: Generate/revoke operations complete in < 1.5 seconds

**Constraints**:
- Share panel must be a `.card` container with `.card-body` padding
- Buttons must use `.btn`, `.btn-sm`, or `.btn-danger`
- Share URL field must use `.input` and be read-only (no rounded corners, no blur)

## Constitution Check

| Gate | Status | Notes |
|---|---|---|
| §1.3 Account Isolation | ✅ PASS | RLS SELECT policy checks `auth.uid() = user_id` for private notes; User B cannot read User A's note via `?id=` |
| §2.4 RLS | ✅ PASS | Enabled `Public share read` SELECT policy restricted to `is_public = TRUE AND share_token IS NOT NULL` |
| §7.2 Share Tokens | ✅ PASS | Share URLs use the safe UUID `share_token`; internal `id` is never exposed in the URL |
| §8.7 Neo-Brutalist | ✅ PASS | Panel uses `.card`, read-only `.input`, and `.btn` classes from `base.css` |

## Project Structure

### Documentation (this feature)

```text
specs/009-note-sharing/
├── plan.md           # This file
├── spec.md           # Feature specification
└── checklists/
    └── requirements.md # Quality checklist
```

### Source Code

```text
src/
├── js/
│   ├── auth.js       # MODIFY: bypass requireAuth() if URL contains ?share=
│   └── notes.js      # MODIFY: implement enableSharing(), revokeSharing(), getNoteByShareToken()
└── pages/
    └── note.html     # MODIFY: add share card, load script logic for ?share= mode
```

## Implementation Strategy

### 1. Database Sharing & RLS Setup
- Create the SELECT policy in Supabase:
  `CREATE POLICY "Public share read" ON notes FOR SELECT USING (is_public = TRUE AND share_token IS NOT NULL);`
- Write the sharing CRUD methods in `src/js/notes.js`:
  - `enableSharing(id)`: UPDATE `notes` set `is_public = true, share_token = crypto.randomUUID()` where `id = id`.
  - `revokeSharing(id)`: UPDATE `notes` set `is_public = false, share_token = null` where `id = id`.
  - `getNoteByShareToken(token)`: SELECT `notes` where `share_token = token and is_public = true`.

### 2. Dual Access Loading Routing
In `src/pages/note.html`'s startup module script:
- Check `new URLSearchParams(location.search).get('share')`.
- If `share` (token) is present:
  - Bypass `requireAuth()`.
  - Call `getNoteByShareToken(token)`.
  - If note is retrieved, render it. Disable/hide the edit options, settings panel, sign out buttons, and the share configuration controls.
  - If note is missing or soft-deleted, display a clean "Note not found or no longer shared" error box.
- If `id` is present instead:
  - Standard flow: await `requireAuth()`.
  - Call `getNote(id)`.
  - Verify the logged-in user is the owner (handled by Supabase RLS). If authorized, render note and render the **Share Panel**.

### 3. Share Panel Design (Owner View only)
- Render the panel inside `note.html` below the note content, using a `.card` wrapper.
- Structure:
  ```html
  <div id="share-panel" class="card" style="display: none; margin-top: 2rem;">
    <div class="card-body" style="width: 100%;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h3>Note Sharing</h3>
        <span id="share-status" class="tag">Private</span>
      </div>
      
      <!-- Private state controls -->
      <div id="share-private-state">
        <p style="margin-bottom: 1rem;">Share this note publicly with others using a secure link.</p>
        <button id="btnGenerateShare" class="btn btn-sm" type="button">Generate Share Link</button>
      </div>

      <!-- Public state controls -->
      <div id="share-public-state" style="display: none;">
        <p style="margin-bottom: 1rem;">Anyone with this link can view this note without logging in:</p>
        <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
          <input id="share-url" class="input" type="text" readonly style="flex: 1;" />
          <button id="btnCopyShare" class="btn btn-sm" type="button">Copy Link</button>
        </div>
        <button id="btnRevokeShare" class="btn btn-sm btn-danger" type="button">Revoke Sharing</button>
      </div>
    </div>
  </div>
  ```
- Wire the button handlers:
  - `btnGenerateShare` → calls `enableSharing()`, updates URL field, shows public controls, sets status badge to "Public" (`.tag` styling).
  - `btnCopyShare` → copies URL to clipboard using `navigator.clipboard.writeText`, changes text to "Copied!" for 2 seconds. Falls back to selecting text in the input box on failure.
  - `btnRevokeShare` → calls `revokeSharing()`, clears URL field, shows private controls, sets badge to "Private".

## Complexity Tracking

No violations or deviations from the constitution. The plan implements the direct database columns already defined in SPEC-5 and follows the same design principles as the rest of the application chrome.
