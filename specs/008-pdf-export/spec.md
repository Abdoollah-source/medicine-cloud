# Feature Specification: PDF Export (Serverless)

**Feature Branch**: `008-pdf-export`

**Created**: 2026-07-03

**Status**: Approved

**Input**: User description: "SPEC-8 — PDF Export (Serverless)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Click "Export as PDF" and Download PDF (Priority: P1)

A user reading a note clicks "Export as PDF" in the header controls on the note reader page. The button immediately transitions to a loading state: it shows an inline brutalist spinner and the text changes to "Generating PDF...". After a few seconds, the browser downloads a pixel-perfect, high-quality A4 PDF of the note. The loading state disappears and the button returns to its normal state.

**Why this priority**: Core workflow. The primary value of the feature is allowing the user to download their note as a PDF directly from the UI.

**Independent Test**:
1. Open a note on `note.html`.
2. Click "Export as PDF".
3. Verify that the button switches to "Generating PDF..." with a simple border spinner.
4. Verify that within a few seconds, a PDF file is downloaded.
5. Verify that the button reverts to its original state.

**Acceptance Scenarios**:

1. **Given** a user is viewing a fully rendered note, **When** they click "Export as PDF", **Then** the button changes to a disabled loading state showing "Generating PDF..." and a brutalist inline spinner.
2. **Given** the PDF generation completes successfully, **When** the download is ready, **Then** the browser initiates a file download and the button returns to its active state.
3. **Given** the PDF generation fails (e.g. serverless timeout or network error), **When** the request completes, **Then** the loading state is cleared, the button re-enables, and a visible `.error-state` alert is shown to the user.

---

### User Story 2 — High-Fidelity PDF Layout (Priority: P1)

The downloaded PDF is visually identical to the on-screen note representation. It has no cut-off text, no shifted elements, and respects the currently active template (Classic or Academic Dark). The document has appropriate margins and is formatted for A4 print.

**Why this priority**: Essential requirement. High layout fidelity is mandated by Constitution §6.2. Screenshot-based canvas PDFs are banned because they ruin layout, meaning serverless Chromium printing is required.

**Independent Test**:
1. Open a note with long tables, images, and a dark template.
2. Export the note as a PDF.
3. Open the PDF and compare it side-by-side with the screen.
4. Verify there are no overlapping texts, table columns are not cropped, and the dark background is printed.

**Acceptance Scenarios**:

1. **Given** a note with multiple pages of text and tables, **When** printed to PDF, **Then** page breaks occur cleanly between block elements without splitting lines of text in half.
2. **Given** a note with an active dark template (e.g. Academic Dark), **When** printed to PDF, **Then** the background colors and text contrasts of the template are fully preserved.

---

### User Story 3 — Allowed Origin Protection (Priority: P1)

The PDF generation endpoint is locked to only process URLs originating from the allowed application host. If a request is made with a target URL from a foreign or unapproved domain, the system rejects it with a 403 Forbidden status code.

**Why this priority**: Security requirement. Prevents open-proxy exploitation of the headless browser service, which could incur massive compute costs.

**Independent Test**:
1. Access the PDF export endpoint directly via curl or browser with `?url=https://google.com`.
2. Verify the endpoint returns a `403 Forbidden` error.

**Acceptance Scenarios**:

1. **Given** a request to the PDF export endpoint with `?url=https://unapproved-domain.com/pages/note.html`, **When** evaluated, **Then** the worker rejects the request with HTTP `403 Forbidden` and does not launch the headless browser.
2. **Given** a request with a URL from the allowed origin (e.g. `https://medicine-cloud.pages.dev/pages/note.html`), **When** evaluated, **Then** the request is allowed and the PDF is generated.

---

### User Story 4 — Consistent Filename Format (Priority: P1)

The downloaded PDF file follows the standard slugified naming convention `medicine-cloud-<slug>-<YYYY-MM-DD>.pdf`, mirroring the HTML export format.

**Why this priority**: Usability constraint. A consistent naming structure makes exported documents predictable and searchable.

**Independent Test**:
1. Export a note titled "Acid-Base Disorders".
2. Verify the downloaded filename is `medicine-cloud-acid-base-disorders-<today's-date>.pdf`.

**Acceptance Scenarios**:

1. **Given** a note with title `"Acid-Base Disorders"`, **When** exported to PDF, **Then** the browser downloads the file with the slugified title and current date.

---

## Edge Cases

- **Exporting a Bilingual Note**: The PDF must render the language that was active on screen when the user clicked export. Since the PDF worker loads a URL, the client must pass the exact URL representing the current view state (including language parameters if applicable, e.g., `&lang=ar` or `&lang=en`).
- **Headless Browser Timeout**: If Puppeteer fails to render or load the page within 15 seconds, the worker must abort and return a clean HTTP 504 Gateway Timeout error, rather than hanging indefinitely.
- **Unauthenticated PDF Rendering**: Since `note.html` is auth-gated, the headless browser won't have the user's session cookie/localStorage. To render the note, the worker must access the note reader using a secure, temporary share link, or the client must fetch the PDF using a public-facing share token route (`note.html?token=<share-token>`) so the worker can load it without requiring a Google login.
  - *Assumption*: The note must have a public share URL or a bypass token to allow the headless browser to access the rendered HTML without credentials. Let's design it so the export request passes the note's share token, or uses a public read-only link, or we pass the document HTML directly. Wait! Constitution §7.2 says: "Public share URLs use the `share_token` UUID." Thus, `note.html?token=<share-token>` is the standard way to view a note publicly. The client can ensure a `share_token` exists (or generate one) and pass the token/public URL to the PDF worker.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an "Export as PDF" button in the note reader header controls, using the `.btn` CSS class.
- **FR-002**: The export button MUST display a brutalist animated inline spinner (using CSS border animation in `var(--ink)`) and change text to "Generating PDF..." when active.
- **FR-003**: System MUST implement a serverless function/worker at `src/functions/pdf-export.js` that integrates with Cloudflare Browser Rendering (`@cloudflare/puppeteer`).
- **FR-004**: The serverless worker MUST parse the `?url=` parameter and validate it against the `APP_ORIGIN` environment variable.
- **FR-005**: If the target URL origin does not match `APP_ORIGIN`, the worker MUST return HTTP `403 Forbidden`.
- **FR-006**: The worker MUST launch a Puppeteer browser instance, navigate to the target URL, and wait until network connections are idle (`networkidle0`).
- **FR-007**: The worker MUST print the page to PDF using A4 format, custom margins (20mm top/bottom, 15mm left/right), and `printBackground: true`.
- **FR-008**: The worker MUST return the PDF binary stream with `Content-Type: application/pdf`.
- **FR-009**: The client-side logic in `src/js/pdf.js` MUST call `requestPDFExport(noteUrl)` to trigger the worker fetch, construct a Blob, and prompt a file download.
- **FR-010**: The downloaded PDF filename MUST use the format `medicine-cloud-<slug>-<date>.pdf`.
- **FR-011**: The system MUST NOT use `html2canvas`, `jsPDF`, or any other client-side canvas-based libraries to build the PDF.
- **FR-012**: The client MUST ensure a note has a valid public `share_token` before exporting, and pass the tokenized public URL (`note.html?token=<token>`) to the worker so the headless browser can render it without authentication.

### Key Entities

- **PDFExportRequest**: Object containing the target public note URL, the active template ID, and the active language code.
- **ServerlessPDFResponse**: The binary PDF stream returned from the serverless worker.
- **AllowedOrigins**: The allowlist of domains fetched from environment variables.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Clicking "Export as PDF" successfully initiates a PDF download in under 10 seconds.
- **SC-002**: 100% of exported PDFs match the visual appearance of the active screen layout (including fonts, colors, and styling rules).
- **SC-003**: The download is blocked and returns a 403 Forbidden code for 100% of non-allowed target domains.
- **SC-004**: The page triggers zero console errors during or after the export process.
- **SC-005**: The A4 print layout maintains a print resolution that allows high-fidelity zoom without text pixelation.

## Assumptions

- **A-001**: The Cloudflare Worker has the Browser Rendering API enabled (free/paid tier) and can load `@cloudflare/puppeteer`.
- **A-002**: Notes can be accessed publicly via a `share_token` (as defined in SPEC-5 and Constitution §7.2) to let the headless browser view them.
- **A-003**: The serverless runtime allows at least 15 seconds of execution limit to complete the browser boot, navigation, and PDF printing.
- **A-004**: Client-side network requests to the PDF worker do not hit CORS issues (handled by worker CORS headers or routing rules).
