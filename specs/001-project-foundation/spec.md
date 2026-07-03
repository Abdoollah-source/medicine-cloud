# Feature Specification: Project Foundation & File Structure

**Feature Branch**: `001-project-foundation`

**Created**: 2026-07-02

**Status**: Approved

**Input**: User description: "SPEC-1 — Project Foundation & File Structure"

## User Scenarios & Testing

### User Story 1 - Setting Up Directory Layout (Priority: P1)

Developers and tools see a predictable, clean directory layout that conforms to the project constitution.

**Why this priority**: Must be completed first so future features have target files and folders to write to.

**Independent Test**: Verify that the directories under `src/`, `src/functions/`, and `dev/` exist.

**Acceptance Scenarios**:

1. **Given** the repository root, **When** scanning folders, **Then** `src/`, `src/css/`, `src/css/templates/`, `src/js/`, `src/pages/`, and `src/functions/` all exist.

---

### User Story 2 - Create Initial Skeleton Stubs (Priority: P1)

The application has basic skeleton stubs for logic modules and HTML templates to boot cleanly without console errors.

**Why this priority**: Essential to bootstrap the app shell and confirm ES modules are loaded correctly.

**Independent Test**: Load `src/index.html` in Chrome and verify the console log output.

**Acceptance Scenarios**:

1. **Given** the stub files, **When** opening `src/index.html` in the browser, **Then** `src/js/app.js` runs and prints "Medicine Cloud: app.js loaded" to the console.
2. **Given** `src/js/renderer.js`, **When** imported by other modules, **Then** the exported functions `processMediaTags()` and `escapeHtml()` are callable.

---

### User Story 3 - Set Up Local Environment & Configuration (Priority: P1)

The local workspace has correct configuration templates and environment files.

**Why this priority**: Ensures that developers can easily copy env credentials without checking sensitive keys into git.

**Independent Test**: Verify `.gitignore` rules, `.env.example` existence, and check git status.

**Acceptance Scenarios**:

1. **Given** the workspace, **When** checking git status, **Then** `.env` is untracked and excluded by `.gitignore`.
2. **Given** `dev/SETUP.md`, **When** reading the file, **Then** it contains sections for Supabase project creation, Google OAuth, `.env` setup, Cloudflare Pages, and keep-alive actions.

---

## Edge Cases

- **Existing Git Directory**: If a git repository already exists, `git init` must not fail or corrupt existing commits.
- **Empty Stubs**: Skeleton scripts must be valid JavaScript syntax so they do not cause parse errors when imported.

## Requirements

### Functional Requirements

- **FR-001**: System MUST create the directories `src/css/templates/`, `src/js/`, `src/pages/`, `src/functions/`, and `dev/`.
- **FR-002**: System MUST write `src/index.html` with an empty app mount point and a module script tag for `js/app.js`.
- **FR-003**: System MUST write initial ES module stubs for `auth.js`, `notes.js`, `renderer.js`, `export.js`, `pdf.js`, and `templates.js`.
- **FR-004**: System MUST export `processMediaTags()` and `escapeHtml()` from `renderer.js`.
- **FR-005**: System MUST initialize a git repository if one is not present.
- **FR-006**: System MUST create `.gitignore` containing `.env`, `node_modules/`, `.DS_Store`, and `*.log`.
- **FR-007**: System MUST write `dev/SETUP.md` with full setup instructions.
- **FR-008**: System MUST write `.env.example` with empty Supabase URL and key placeholders.
- **FR-009**: System MUST create a `.env` file containing the same placeholders.

### Key Entities

- **`SETUP.md`**: Guide for project setup.
- **`index.html`**: The application bootstrap shell.

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% of the files listed in Constitution §10.1 exist in the correct directories.
- **SC-002**: Opening `src/index.html` causes zero javascript console errors.
- **SC-003**: `.env` is ignored by git status (confirmed untracked).

## Assumptions

- **A-001**: The project will be built as a single repository, client-side static web application.
