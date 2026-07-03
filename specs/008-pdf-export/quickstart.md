# Quickstart & Verification: PDF Export (SPEC-8)

## 1. Setup & Environment
Ensure your `.env` contains:
```bash
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
CLOUDFLARE_WORKER_URL=http://localhost:8787  # or your deployed worker url
```

Ensure your Cloudflare Worker has `APP_ORIGIN` set to your local dev environment (e.g. `http://localhost:4000`) for local testing.

Run dev servers:
- Client dev server: `npx -y serve src -l 4000`
- Worker dev server: `npx wrangler dev src/functions/pdf-export.js --port 8787` (optional, if testing worker locally)

---

## Scenario 1 — Click "Export as PDF" and Verify Download (Happy Path)

**URL**: `http://localhost:4000/pages/note.html?id=<note-uuid>`

1. Open note reader page for a note you own.
2. The page loads. Verify the "Export as PDF" button is visible and enabled.
3. Click "Export as PDF".
4. Verify the button changes to "Generating PDF..." and shows a border-based spinning circle.
5. Wait up to 10 seconds.
6. Verify a PDF file downloads: `medicine-cloud-<slug>-<YYYY-MM-DD>.pdf`.
7. Verify the button reverts to "Export as PDF".
8. Open the PDF and verify the layout, typography, and colors match the screen.

---

## Scenario 2 — Worker Origin Restriction (Security)

1. Open a browser and visit the worker URL directly:
   `http://localhost:8787/?url=https://google.com` (or your deployed worker url)
2. Verify the browser page displays "Forbidden" and returns a HTTP `403 Forbidden` status code.
3. Visit the worker URL with a valid target:
   `http://localhost:8787/?url=http://localhost:4000/pages/note.html?token=1234`
4. Verify it returns a `500` or proceeds to render (meaning it didn't return 403 Forbidden).

---

## Scenario 3 — Public View Bypass (`note.html?token=<token>`)

1. Verify you can load a note publicly without authentication.
2. Log out of Medicine Cloud (or open an Incognito window).
3. Navigate to `http://localhost:4000/pages/note.html?token=<valid-share-token>` (retrieve a token from the Supabase notes table where `is_public` is true).
4. Verify:
   - The note renders correctly.
   - You are NOT redirected to `login.html`.
   - The Sign Out button, Settings links, and Dashboard nav links are hidden or disabled.
5. In the same Incognito window, try to access `http://localhost:4000/pages/note.html?id=<note-uuid>`.
6. Verify you are immediately redirected to `login.html` (auth is enforced).

---

## Scenario 4 — PDF Generation Failure (Error State)

1. Stop the worker server (or disconnect network access to the worker URL).
2. Go to the note reader page.
3. Click "Export as PDF".
4. Verify the spinner appears.
5. When the fetch fails, verify that:
   - The spinner disappears and button re-enables.
   - A red `.error-state` alert box appears at the top of the page indicating "Failed to generate PDF: [error message]".
