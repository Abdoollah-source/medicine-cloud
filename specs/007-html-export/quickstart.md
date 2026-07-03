# Quickstart: HTML Export (SPEC-7)

## Prerequisites

1. SPEC-5 note storage is working — you must have at least one note in Supabase to export.
2. SPEC-4 note reader (`note.html`) is working — you can view a note.
3. Run the dev server: `npx -y serve src -l 4000`

---

## Scenario 1 — Export a Note and Verify Offline Rendering (Happy Path)

**URL**: `http://localhost:4000/pages/note.html?id=<any-note-id>`

1. Sign in and navigate to a note on the reader page.
2. The note renders: title, content, meta pills visible.
3. The "Export as HTML" button in the header controls is **enabled**.
4. Click "Export as HTML".
5. Verify the button briefly shows a loading/progress indicator (`.success-state` styling).
6. The browser downloads a file named `medicine-cloud-<slug>-<YYYY-MM-DD>.html`.
7. **Disconnect from the internet**.
8. Open the downloaded `.html` file in a browser.
9. Verify:
   - Note title renders correctly.
   - Note content renders with proper fonts (Quicksand/Literata or Cairo).
   - Meta pills (subject, unit, date) display if present.
   - Term links are coloured (green microbe, blue protein, etc.).
   - No console errors.

**Expected**: ✅ Full rendering, zero errors, offline.

---

## Scenario 2 — Filename Format Validation

1. Create a note with title `"Acid-Base Disorders"`.
2. Export it today (e.g., 2026-07-03).
3. Verify the downloaded filename is exactly: `medicine-cloud-acid-base-disorders-2026-07-03.html`

Also test:
- Note title `"ABG Analysis — Part 1"`: expect `medicine-cloud-abg-analysis-part-1-<date>.html`
- Note title with Arabic + Latin mix `"تشخيص ABG"`: expect `medicine-cloud-abg-<date>.html` (non-ASCII stripped)
- Note title with only special characters `"!@#$%"`: expect `medicine-cloud-note-<date>.html` (empty-slug fallback)

---

## Scenario 3 — Template Fidelity

1. Open note reader with the "Academic Dark" template active.
2. Click "Export as HTML".
3. Open the downloaded file.
4. Verify the background is dark, terminal-style typography is applied (Academic Dark tokens).
5. Repeat with "Classic" template.

**Expected**: The exported file visually matches whatever template was active at export time.

---

## Scenario 4 — Bilingual Note (Alt Toggle)

1. Export a note that has an `alt` field (bilingual note).
2. Open the downloaded file.
3. Verify the language toggle button is visible.
4. Click it — the note switches to the alternate language.
5. Click again — switches back.

Also test with a note that has **no** `alt` field:
- Language toggle must be **hidden** in the exported file.

---

## Scenario 5 — CSS Fetch Failure

*(Manual simulation — block CSS network requests with browser DevTools)*

1. Open note reader.
2. Open DevTools → Network → Block requests matching `base.css`.
3. Click "Export as HTML".
4. Verify a visible `.error-state` message appears (e.g., "Export failed: could not load styles").
5. Verify **no file download occurs**.
6. Verify the export button re-enables after the error.

---

## Scenario 6 — Export Button Disabled Until Note Renders

1. Open `note.html?id=<id>` in a slow-network environment (DevTools throttle to "Slow 3G").
2. During the note loading phase, verify the "Export as HTML" button is **disabled**.
3. Once the note renders, verify the button becomes enabled.

---

## Scenario 7 — Cross-Browser Download

1. Open note reader in Chrome → click "Export as HTML" → verify download starts. ✅
2. Open note reader in Firefox → click "Export as HTML" → verify download starts. ✅
3. Open note reader in Safari → click "Export as HTML" → verify download starts. ✅

Zero console errors in all three.
