# Quickstart & Validation Guide: Note Renderer (Core Engine)

**Branch**: `002-note-renderer` | **Spec**: [spec.md](./spec.md) | **Data Model**: [data-model.md](./data-model.md)

## Prerequisites

- SPEC-0 complete: `src/css/base.css` and `src/css/templates/classic.css` exist and contain
  the design system.
- SPEC-1 complete: `src/pages/` directory and `src/js/renderer.js` stub exist.
- A modern Chromium-based browser (Chrome 120+ recommended).
- No local server required — the test page is opened directly as a `file://` URL.

---

## Scenario 1: Full Note Render (SC-001)

**Goal**: Confirm the complete ABG note renders correctly with RTL direction, metadata pill,
YouTube embed, Telegram embed, and all five term link colours.

**Steps**:

1. Open `src/pages/renderer-test.html` directly in Chrome (drag and drop, or `Ctrl+O`).
2. Open Chrome DevTools → Console tab.

**Expected Results**:

| Check | Expected |
|---|---|
| Title | "Protein Structure, Function & ABG Analysis" visible in heading |
| Direction | Content area has `dir="rtl"`; Arabic characters display right-to-left |
| Metadata pill | "Unit 1" pill visible in the meta bar |
| YouTube embed | `<iframe>` with `youtube-nocookie.com` src visible |
| "Watch on YouTube" | Link below YouTube embed is present |
| Telegram embed | `<iframe>` with `t.me/athir_m1/208?embed=1` src visible |
| "View on Telegram" | Link below Telegram embed is present |
| Term link colours | Five distinct colours visible: microbe (green), protein (blue), pathology (red), anatomy (orange), pharma (purple) |
| Raw placeholders | `[[YT:...]]` and `[[TG_POST:...]]` strings absent from DOM |
| Console errors | Zero errors in DevTools Console |

---

## Scenario 2: XSS Injection Blocked (SC-002)

**Goal**: Confirm `sanitiseContent()` strips `<script>` and `onerror` attributes.

**Steps**:

1. Open `src/pages/renderer-test.html` in Chrome.
2. Open DevTools → Console.
3. Run:

```javascript
import('./js/renderer.js').then(m => {
  m.renderNote({
    title: 'XSS Test',
    lang: 'en',
    content: '<script>alert("xss")<\/script><strong>Safe text</strong>'
  }, document.getElementById('app'));
});
```

4. Inspect the DOM in DevTools → Elements.

**Expected Results**:

| Check | Expected |
|---|---|
| Alert dialog | Does NOT fire |
| DOM `<script>` | Zero `<script>` elements inside `#note-content` |
| `<strong>Safe text</strong>` | Survives sanitisation intact |

---

## Scenario 3: All 7 Media Placeholder Types (SC-003)

**Goal**: Confirm all seven placeholder types expand to their expected output.

**Steps**:

1. Open DevTools → Console on `renderer-test.html`.
2. Run:

```javascript
import('./js/renderer.js').then(m => {
  const testContent = `
    [[YT:dQw4w9WgXcQ|Test YouTube]]
    [[TG_POST:athir_m1/1|Test TG Post]]
    [[TG_AUDIO:https://t.me/athir_m1/voice.ogg|Test TG Audio]]
    [[AUDIO:https://example.com/audio.mp3|Test Audio]]
    [[TG_IMAGE:https://t.me/athir_m1/photo.jpg|Test TG Image]]
    [[IMAGE:https://example.com/image.jpg|Test Image]]
    [[VIDEO:https://example.com/video.mp4|Test Video]]
  `;
  m.renderNote({ title:'Media Test', lang:'en', content: testContent },
    document.getElementById('app'));
});
```

3. Inspect DevTools → Elements → `#note-content`.

**Expected Results**:

| Placeholder | Expected DOM element |
|---|---|
| `[[YT:...]]` | `<iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ">` |
| `[[TG_POST:...]]` | `<iframe src="https://t.me/athir_m1/1?embed=1">` |
| `[[TG_AUDIO:...]]` | Link card with "Listen on Telegram" text, no `<audio>` element |
| `[[AUDIO:...]]` | `<audio controls>` element |
| `[[TG_IMAGE:...]]` | Link card with "View image on Telegram" text, no `<img>` element |
| `[[IMAGE:...]]` | `<img>` element with correct src |
| `[[VIDEO:...]]` | `<video controls>` element |
| Raw tags | None of the `[[...]]` strings present in DOM |

---

## Scenario 4: Error State on Null Note (SC-004)

**Goal**: Confirm graceful error box renders when `renderNote()` receives null.

**Steps**:

1. Open DevTools → Console on `renderer-test.html`.
2. Run:

```javascript
import('./js/renderer.js').then(m => {
  m.renderNote(null, document.getElementById('app'));
});
```

**Expected Results**:

| Check | Expected |
|---|---|
| Error box | A `.error-box` div visible on screen with error message |
| Console exception | Zero uncaught exceptions in Console |
| Blank screen | Does NOT appear (error box fills the container) |

---

## Scenario 5: Theme Toggle Persistence (SC-005)

**Goal**: Confirm light/dark toggle works and persists in `localStorage`.

**Steps**:

1. Load `renderer-test.html` in Chrome.
2. Click the theme toggle button.
3. Observe page visually switches theme.
4. Open DevTools → Application → Local Storage → the `file://` origin.
5. Confirm `mc-theme` key exists with either `"light"` or `"dark"` value.
6. Reload the page (`F5`).
7. Confirm the page loads in the same theme as before reload.

---

## Scenario 6: Mobile Viewport (WCAG / §8.2)

**Goal**: Confirm the rendered note is usable at 360px width.

**Steps**:

1. Open DevTools → Toggle Device Toolbar → set width to 360.
2. Load `renderer-test.html`.
3. Confirm no horizontal scrollbar, no clipped text, and embeds scale to fit viewport.

---

## Scenario 7: Reduced Motion (§8.5)

**Goal**: Confirm transitions respect `prefers-reduced-motion`.

**Steps**:

1. In DevTools → Rendering → Emulate CSS media feature `prefers-reduced-motion: reduce`.
2. Reload `renderer-test.html`.
3. Interact with the theme toggle — confirm no animated transition occurs.
