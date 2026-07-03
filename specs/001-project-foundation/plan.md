# Implementation Plan: Project Foundation & File Structure

**Branch**: `001-project-foundation` | **Date**: 2026-07-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-project-foundation/spec.md`

## Summary

Establish the physical directory tree, configuration files, and skeleton stub source files for the Medicine Cloud web application exactly matching Constitution §10.1. Set up Git, write environment template files, and document setup steps in `dev/SETUP.md`. This is a non-visual foundation spec that ensures all ES module stubs load and resolve without console errors.

## Technical Context

**Language/Version**: HTML5, Vanilla ES6 JavaScript, Cloudflare Worker (JavaScript/Wrangler)

**Primary Dependencies**: None (Google Fonts CDN)

**Storage**: None (database environment placeholders only)

**Testing**: Browser console logs, git status, git log checks

**Target Platform**: Local filesystem, Git, Web Browser

**Project Type**: Static web application directory scaffold

**Performance Goals**: Shell bootstrap load time < 100ms

**Constraints**: Exact directory tree layout from Constitution §10.1, logical ES module structure, secure git exclusion for environment secrets

**Scale/Scope**: 17 stub files and directories

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Google Auth / Session Only**: N/A for scaffolding (placeholder files only).
- **Supabase Database Schema**: N/A (schema design documented in SETUP.md).
- **Row-Level Security**: N/A.
- **Allowed Note Content HTML**: N/A.
- **Template overrides**: Initialized in `base.css` and template stubs.
- **Zero-Cost Constraint**: Fully satisfied (setup instructions cover Cloudflare Pages free tier).
- **Headless Chrome PDF Export**: N/A (Cloudflare Worker stub only).
- **Security private-by-default**: N/A.
- **Mobile-First Responsive**: N/A.
- **Bidirectional Text (RTL)**: N/A.
- **Accessibility WCAG 2.1 AA**: N/A.
- **Reduced Motion**: N/A.
- **Design System System Rules**: N/A.
- **Code Quality structure**: Satisfied. Directory tree matches Constitution §10.1 layout.

## Project Structure

### Documentation (this feature)

```text
specs/001-project-foundation/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0: design choices and rationale
├── data-model.md        # Phase 1: file layout structure schema
├── quickstart.md        # Phase 1: validation and run guide
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
MC-WEB_APP/
├── dev/
│   └── SETUP.md
├── src/
│   ├── index.html
│   ├── css/
│   │   ├── base.css
│   │   └── templates/
│   │       └── classic.css
│   ├── js/
│   │   ├── app.js
│   │   ├── auth.js
│   │   ├── notes.js
│   │   ├── renderer.js
│   │   ├── export.js
│   │   ├── pdf.js
│   │   └── templates.js
│   ├── pages/
│   │   ├── login.html
│   │   ├── dashboard.html
│   │   ├── editor.html
│   │   ├── note.html
│   │   └── settings.html
│   └── functions/
│       └── pdf-export.js
├── .env
├── .env.example
└── .gitignore
```

**Structure Decision**: Single project layout, matching the structure in Constitution §10.1.

## Complexity Tracking

*No violations of the Constitution. Zero complexity deviations.*
