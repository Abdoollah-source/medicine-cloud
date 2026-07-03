# Data Model: Project Foundation & File Structure

This document outlines the file layout schema established by this specification.

## Core Folders

- **`dev/`**: Contains developer guides, specifications, and plans.
- **`src/`**: The complete production source code directory.
- **`src/css/`**: Styling stylesheets.
- **`src/js/`**: Application logic modules.
- **`src/pages/`**: Single-page templates.
- **`src/functions/`**: Edge functions / Workers.

## Core File Schema

| Path | Purpose | Format |
|---|---|---|
| `src/index.html` | Application shell and bootstrapper | HTML5 |
| `src/css/base.css` | CSS tokens, resets, base styles | CSS3 |
| `src/css/templates/classic.css` | Classic theme overrides | CSS3 |
| `src/js/app.js` | Routing and bootstrap logic | ES6 JavaScript |
| `src/js/auth.js` | Supabase Auth API wrapper module | ES6 JavaScript |
| `src/js/notes.js` | Supabase CRUD operations module | ES6 JavaScript |
| `src/js/renderer.js` | HTML note rendering engine module | ES6 JavaScript |
| `src/js/export.js` | HTML page generation module | ES6 JavaScript |
| `src/js/pdf.js` | PDF trigger client module | ES6 JavaScript |
| `src/js/templates.js` | CSS theme loader module | ES6 JavaScript |
| `src/pages/login.html` | Unauthenticated portal view | HTML5 |
| `src/pages/dashboard.html` | Authenticated note grid view | HTML5 |
| `src/pages/editor.html` | Note creation and edit view | HTML5 |
| `src/pages/note.html` | Core note reader view | HTML5 |
| `src/pages/settings.html` | User configurations view | HTML5 |
| `src/functions/pdf-export.js` | Cloudflare Worker edge function stub | Serverless JS |
| `.env.example` | Environment configurations template | Plaintext |
| `.gitignore` | Version control exclusion list | Plaintext |
| `dev/SETUP.md` | Human-readable manual setup guide | Markdown |
