# Research: App Shell & Classic Template (Visual Foundation)

**Branch**: `004-app-shell-templates` | **Date**: 2026-07-03

## Summary

This document describes the visual structure implementation for the Medicine Cloud app shell and custom CSS templates.

---

## Decision 1: Stylesheet Dynamic Swapping

- **Decision**: Inject a `<link id="mc-template-link" rel="stylesheet" href="...">` element in the head of the document. The function `loadTemplate(templateId)` will fetch the CSS path from a configuration map, replace the existing link node, and store the key in `localStorage` under `mc-template`.
- **Rationale**: Swapping link tags causes the browser to reload only the specified stylesheet and rebuild the render tree with the new CSS custom property definitions. This updates layout properties without requiring page refreshes or JavaScript state updates.
- **Alternatives Considered**:
  - *Inline `<style>` blocks populated via JS*: Rejected. Makes code maintenance harder and creates flashing layout issues.
  - *Importing all templates in base.css*: Rejected. This would load unused styles and pollute the global namespace. Swapping external CSS is cleaner.

---

## Decision 2: Theme Persistence Strategy

- **Decision**: Toggle class names `.light` and `.dark` directly on the `document.documentElement` element (the `<html>` element). Save user settings using the localStorage key `mc-theme`.
- **Rationale**: Attaching the theme class at the `<html>` level allows all child elements (including inside the note container) to inherit values. Reading from `localStorage` on blocking page boot prevents screen flashes.

---

## Decision 3: Academic Dark Theme Specs

- **Decision**: Implement a high-contrast dark theme in `academic-dark.css` with active settings:
  - `--paper` set to GitHub-style dark grey `#0d1117`.
  - `--gold` / `--gold-bright` mapped to high-contrast cyan/electric blue `#58a6ff` / `#79c0ff`.
  - `--grain-opacity` set to `0` (suppresses the grain texture).
  - High contrast term link colors.
- **Rationale**: Provides a clean, modern dark reading interface for users who find the textured, warm classic template distracting or hard to read.

---

## Decision 4: Note Language Toggling

- **Decision**: Store the active language state (`primary` vs `alt`) in a page-level variable on `note.html`. If the user clicks the toggle, swap the active state, update the toggle button text, and re-call `renderNote()` passing the corresponding language block from the note object (either the root note fields or `note.alt` fields).
- **Rationale**: Swapping content and re-running the rendering pipeline ensures layout directions, fonts, and metadata align.
