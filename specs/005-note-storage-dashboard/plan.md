# Implementation Plan: Note Storage & Dashboard (Supabase CRUD)

**Branch**: `005-note-storage-dashboard` | **Date**: 2026-07-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/005-note-storage-dashboard/spec.md`

## Summary

Implement note CRUD persistence operations in the Supabase database. Define the `notes` table schema and Row-Level Security (RLS) policies. Create a database trigger to automate `updated_at` column timestamp adjustments. Write the `notes.js` client logic module wrapping the Supabase database queries. Build the full `dashboard.html` interface covering loading states, empty states, CSS cards grid, soft-delete confirmation modals, trash view toggling, and hard-delete operations. Set up the scheduled GitHub Actions keep-alive workflow.

## Technical Context

**Language/Version**: HTML5, CSS3, SQL (PostgreSQL), YAML (GitHub Actions)

**Primary Dependencies**: `@supabase/supabase-js` CDN library

**Storage**: Supabase database (`notes` table)

**Testing**: Local browser checks against dashboard states, console logging verification, RLS access assertions, manual GitHub Action trigger testing

**Target Platform**: Cloudflare Pages, Supabase Database engine, GitHub Actions runtime

**Project Type**: Database client module and dashboard controller page

**Performance Goals**: CRUD operations complete in <300ms; keep-alive script fires every 4 days

**Constraints**: Strict Row-Level Security checks; styling must follow neo-brutalist buttons, cards, and modal rules (§8.7) with zero rounded corners or blurred shadows; zero-cost operations.

**Scale/Scope**: 1 database table, 1 trigger, 1 logic module, 1 page update, 1 GHA workflow file

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Supabase Database Schema (§2.5)**: ✅ SATISFIED — Schema includes all canonical note fields.
- **Row-Level Security (§2.4)**: ✅ SATISFIED — Notes table is secured via RLS policies checking user ownership.
- **Soft Delete (§2.3)**: ✅ SATISFIED — Delete triggers soft-delete (`deleted_at` timestamp), hard-delete is restricted to second confirmation in trash.
- **Zero-Cost Constraint (§5.3)**: ✅ SATISFIED — Supabase and GHA actions fit under free tier caps.
- **Keep-Alive Job (§2.2)**: ✅ SATISFIED — Scheduled workflow triggers curl every 4 days to keep project warm.
- **Design Language (§8.7)**: ✅ SATISFIED — Grid note cards use `.card`, buttons use `.btn` and `.btn-primary`/`.btn-danger`, modals use `.modal` and `.modal-overlay`. No rounded corners or drop shadows are used.

## Project Structure

### Documentation (this feature)

```text
specs/005-note-storage-dashboard/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0: design choices and rationale
├── data-model.md        # Phase 1: database schema and JS interfaces
├── quickstart.md        # Phase 1: verification scenarios
└── checklists/
    └── requirements.md  # Spec quality checklist — 15/15 PASS
```

### Source Code (repository root)

```text
MC-WEB_APP/
├── .github/
│   └── workflows/
│       └── keep-alive.yml       [NEW] — scheduled cron to ping database API
├── dev/
│   └── SETUP.md                 [MODIFY] — add schema SQL, RLS commands, and keep-alive setup instructions
├── src/
│   ├── js/
│   │   └── notes.js             [MODIFY] — implement database CRUD methods
│   └── pages/
│       └── dashboard.html       [MODIFY] — implement grid, states, modals, and trash toggle controllers
```

**Structure Decision**: In-place edits on files scaffolded in SPEC-1. Create the new GHA folder and file path `.github/workflows/keep-alive.yml`.

## Complexity Tracking

*No violations of the Constitution. Zero complexity deviations.*
