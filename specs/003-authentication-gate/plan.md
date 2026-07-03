# Implementation Plan: Authentication & Access Gate

**Branch**: `003-authentication-gate` | **Date**: 2026-07-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-authentication-gate/spec.md`

## Summary

Implement the user sign-in authentication flow using Supabase Auth (Google OAuth 2.0 provider). Secure the application using a client-side gate checking the `allowed_users` table in Supabase. Build blocking router guards on all protected pages to redirect unauthenticated or uninvited users to `login.html`.

## Technical Context

**Language/Version**: HTML5, Vanilla ES6 JavaScript

**Primary Dependencies**: `@supabase/supabase-js` CDN library

**Storage**: Supabase database (`allowed_users` table)

**Testing**: Local browser testing against mock database states, DevTools Console checks, network call verification

**Target Platform**: Cloudflare Pages, browser environments

**Project Type**: Client-side authentication gate and page router

**Performance Goals**: Auth state checks resolve in <150ms on page load; redirect happens before first layout paint

**Constraints**: Row-Level Security (RLS) must be enabled; Google sign-in button must conform to Neo-Brutalist styling (§8.7); zero hardcoded secret credentials.

**Scale/Scope**: 1 table in database, 1 auth logic module, 1 template login page, router integrations on 5 protected pages

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Google Auth / Session Only (§1.2)**: ✅ SATISFIED — Google Sign-In is the sole sign-in method.
- **Invite-Only (§1.1)**: ✅ SATISFIED — Access is gated using the database allowlist check.
- **Row-Level Security (§2.4)**: ✅ SATISFIED — Table `allowed_users` is protected by RLS policy.
- **Zero-Cost Constraint (§5.3)**: ✅ SATISFIED — Supabase Auth and database operations fall under free tier limits.
- **No Sensitive Data in URLs (§7.5)**: ✅ SATISFIED — Client auth tokens are parsed from OAuth hash in client memory, not loaded in visible application URLs.
- **Design Language (§8.7)**: ✅ SATISFIED — Login page uses a brutalist `.btn-primary` sign-in button, `var(--cream)` background, and `.error-state` style. No rounded corners are used.

## Project Structure

### Documentation (this feature)

```text
specs/003-authentication-gate/
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
├── src/
│   ├── js/
│   │   └── auth.js              [MODIFY] — implement login, sign-out, allowlist check, and route checks
│   ├── pages/
│   │   ├── login.html           [MODIFY] — wire sign-in button, error container, and inline auth script
│   │   ├── dashboard.html       [MODIFY] — integrate auth route check script
│   │   ├── editor.html          [MODIFY] — integrate auth route check script
│   │   ├── note.html            [MODIFY] — integrate auth route check script
│   │   └── settings.html        [MODIFY] — integrate auth route check script
```

**Structure Decision**: Files will be modified in-place matching the scaffolding established in SPEC-1. `auth.js` acts as the single source of truth for auth logic. Each protected page imports `auth.js` at the top of its `<head>` tag.

## Complexity Tracking

*No violations of the Constitution. Zero complexity deviations.*
