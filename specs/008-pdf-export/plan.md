# Implementation Plan: PDF Export (Serverless)

**Branch**: `008-pdf-export` | **Date**: 2026-07-03 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/008-pdf-export/spec.md`

## Summary

Implement a pixel-perfect PDF export capability using a Cloudflare Worker running headless Chromium (Cloudflare Browser Rendering) to print the note page. To render protected notes, the client ensures a note has a valid public `share_token` (and `is_public = true`) and passes the tokenized public URL (`note.html?token=<token>`) to the worker, allowing headless Chromium to fetch the note content bypass-authenticated. The client-side logic in `pdf.js` fetches the PDF binary from the worker, manages loading spinner states on the "Export as PDF" button, and triggers a local download.

## Technical Context

**Language/Version**: 
- Client: Vanilla ES2022
- Cloudflare Worker: ES Modules (Wrangler bundle format)

**Primary Dependencies**:
- `@cloudflare/puppeteer` — Cloudflare Browser Rendering library in the Worker
- `src/js/notes.js` — Supabase CRUD module, extended with `enableSharing` and `getNoteByShareToken`
- `src/js/auth.js` — Extended to bypass authentication when a `token` param is present in the URL

**Storage**: Supabase notes table (updates to `is_public` and `share_token` fields)

**Testing**: 
- Direct API testing of the Cloudflare Worker with valid/invalid origins
- Manual QA of "Export as PDF" flow on `note.html`
- Visual comparison of output PDF against the active design templates

**Target Platform**: Cloudflare Pages + Cloudflare Workers (Browser Rendering API enabled)

**Performance Goals**: PDF generation and download start within 10 seconds of clicking the button

**Constraints**:
- Absolute prohibition on `html2canvas` / `jsPDF` or client-side rendering hacks
- Worker MUST validate origin of the target URL against the allowed `APP_ORIGIN` env variable
- Brutalist inline border spinner in `var(--ink)` color for loading state

## Constitution Check

| Gate | Status | Notes |
|---|---|---|
| §2.4 RLS | ✅ PASS | Added `Public share read` SELECT policy for notes with `is_public = true AND share_token IS NOT NULL` |
| §5.2 PDF Export (Serverless Only) | ✅ PASS | Headless Chromium print-to-PDF run exclusively on Cloudflare Workers; no client screenshot code used |
| §7.2 Share Tokens | ✅ PASS | Headless Chromium bypasses auth via `share_token` URL param, preventing internal ID exposure |
| §7.4 Secrets Handling | ✅ PASS | No Supabase credentials or service keys in the worker or client PDF code |
| §8.7 Neo-Brutalist styling | ✅ PASS | Loading spinner is a pure CSS border animation in `var(--ink)` |

## Project Structure

### Documentation (this feature)

```text
specs/008-pdf-export/
├── plan.md           # This file
├── spec.md           # Feature specification
└── checklists/
    └── requirements.md # Quality checklist
```

### Source Code

```text
src/
├── functions/
│   └── pdf-export.js # Cloudflare Worker using puppeteer
├── js/
│   ├── auth.js       # MODIFY: bypass requireAuth() if URL contains ?token=
│   ├── notes.js      # MODIFY: implement enableSharing() and getNoteByShareToken()
│   └── pdf.js        # MODIFY: requestPDFExport() implementation
└── pages/
    └── note.html     # MODIFY: add "Export as PDF" button, loading spinner, export wiring
```

## Implementation Strategy

### 1. Database Sharing & RLS Setup
To make notes accessible to headless Chromium, we need sharing support:
- Add a SELECT policy to the notes table in Supabase:
  `CREATE POLICY "Public share read" ON notes FOR SELECT USING (is_public = TRUE AND share_token IS NOT NULL);`
- Add two functions to `src/js/notes.js`:
  - `enableSharing(id)`: updates `is_public = true` and generates a UUID for `share_token`
  - `getNoteByShareToken(token)`: selects the note matching `share_token` (no auth required)

### 2. Authentication Bypass in `note.html`
- In `src/js/auth.js`, update `requireAuth()`: if the query string contains `token`, return a dummy session or skip authentication check (returning `null` without redirecting) so `note.html` does not redirect to `login.html`.
- In `src/pages/note.html`:
  - Check for `token` URL param.
  - If present: fetch note via `getNoteByShareToken(token)` directly. Disable all edit/owner UI elements (such as settings, delete buttons, and sign out).
  - If absent: continue with standard `requireAuth()` and `getNote(id)`.

### 3. Serverless Cloudflare Worker (`pdf-export.js`)
- Read target `url` parameter.
- Parse `APP_ORIGIN` env variable. Verify target origin matches `APP_ORIGIN`. Return `403 Forbidden` on mismatch.
- Support `OPTIONS` preflight requests by returning CORS headers (`Access-Control-Allow-Origin: *`).
- Launch `@cloudflare/puppeteer` browser instance bound to `env.MY_BROWSER`.
- Open page, navigate, wait for `networkidle0`.
- Print to A4 PDF with custom margins and `printBackground: true`.
- Return binary response with `Content-Type: application/pdf`.

### 4. Client-side PDF Export Logic (`pdf.js` & `note.html`)
- In `src/js/pdf.js`, implement `requestPDFExport(note, templateId)`:
  - If the note doesn't have a `share_token`, call `enableSharing(note.id)` to set `is_public = true` and retrieve the token.
  - Construct the public URL: `location.origin + '/pages/note.html?token=' + shareToken + '&template=' + templateId`.
  - Fetch `CLOUDFLARE_WORKER_URL + '?url=' + encodeURIComponent(publicUrl)`.
  - Create a Blob from the response binary, and download it as `medicine-cloud-<slug>-<date>.pdf`.
- In `note.html`:
  - Add the "Export as PDF" button.
  - Style the button and add a hidden loading state:
    ```html
    <button id="btnExportPdf" class="btn" type="button" disabled>
      <span class="btn-text">Export as PDF</span>
      <span class="btn-spinner" style="display:none;"></span>
    </button>
    ```
  - Style the spinner in CSS:
    ```css
    .btn-spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid var(--ink);
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-left: 8px;
      vertical-align: middle;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    ```
  - Bind click handler: show spinner, change text to "Generating PDF...", invoke `requestPDFExport`, download, hide spinner, restore text. Show `.error-state` box on failure.

## Complexity Tracking

No violations or deviations from the constitution. The solution implements the minimum required database schema access rules and leverages standard Cloudflare Worker features.
