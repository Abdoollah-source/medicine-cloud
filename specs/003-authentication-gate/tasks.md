# Tasks: Authentication & Access Gate

**Input**: Design documents from `specs/003-authentication-gate/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database schema initialization.

- [X] T001 Configure `allowed_users` table in Supabase database with Row-Level Security (RLS) and "Self-read only" select policy

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Client configuration and global state management.

- [X] T002 Implement global Supabase client initialization in `src/js/auth.js` reading from `window.MC_SUPABASE_URL` and `window.MC_SUPABASE_ANON_KEY`

---

## Phase 3: User Story 1 - Google Sign-In with Allowed Account (Priority: P1)

**Goal**: Users on the allowlist can sign in via Google and land on the dashboard.

**Independent Test**: Add email to database, click Sign In on `login.html`, authenticate via Google, and verify auto-navigation to `dashboard.html`.

### Implementation for User Story 1

- [X] T003 [P] [US1] Implement `signInWithGoogle` using Supabase `signInWithOAuth` provider in `src/js/auth.js`
- [X] T004 [P] [US1] Implement case-insensitive email query in `checkAllowlist` in `src/js/auth.js`
- [X] T005 [US1] Implement active session verification and redirection handling in `initAuth` in `src/js/auth.js`
- [X] T006 [US1] Wire the Google sign-in click listener and load-time credentials placeholders script block in `src/pages/login.html`
- [X] T007 [US1] Apply Neo-Brutalist styling to the sign-in button (rectangular `.btn` and class `.btn-primary` with stacked shadow) on `src/pages/login.html`

---

## Phase 4: User Story 2 - Gatekeep Non-Allowed Account (Priority: P1)

**Goal**: Block uninvited Google accounts from accessing the dashboard, redirect to login, and show error.

**Independent Test**: Attempt login with uninvited email, confirm redirection back to `login.html`, and verify presence of rejection message.

### Implementation for User Story 2

- [X] T008 [P] [US2] Implement early session termination (`supabase.auth.signOut()`) and redirection to login page inside `checkAllowlist` when user is uninvited in `src/js/auth.js`
- [X] T009 [US2] Style and append the hidden validation error container `id="auth-error"` with class `error-state` on `src/pages/login.html`

---

## Phase 5: User Story 3 - Session Persistence & Auto-Login (Priority: P1)

**Goal**: Allow signed-in users to reload protected pages or the login page without re-authenticating.

**Independent Test**: Refresh `dashboard.html` and confirm session is recovered with zero redirects.

### Implementation for User Story 3

- [X] T010 [P] [US3] Implement silent allowlist validation check on page boot within `initAuth` in `src/js/auth.js`
- [X] T011 [US3] Implement client-side `signOut` method in `src/js/auth.js` to clear stored sessions and redirect to login page

---

## Phase 6: User Story 4 - Protected Page Routing Redirects (Priority: P1)

**Goal**: Prevent unauthenticated page load leaks by intercepting route requests before layouts paint.

**Independent Test**: Try navigating to `dashboard.html` while signed out and verify immediate redirect to `login.html`.

### Implementation for User Story 4

- [X] T012 [P] [US4] Inject credentials placeholder script block and call blocking `requireAuth` route guard in `<head>` of `src/pages/dashboard.html`
- [X] T013 [P] [US4] Inject credentials placeholder script block and call blocking `requireAuth` route guard in `<head>` of `src/pages/editor.html`
- [X] T014 [P] [US4] Inject credentials placeholder script block and call blocking `requireAuth` route guard in `<head>` of `src/pages/note.html`
- [X] T015 [P] [US4] Inject credentials placeholder script block and call blocking `requireAuth` route guard in `<head>` of `src/pages/settings.html`

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Verification, security audits, and code cleanup.

- [X] T016 Audit all source files to verify zero hardcoded credentials exist
- [X] T017 Verify unauthenticated page redirects complete under 150ms and trigger zero visual layout flashes
- [X] T018 Execute all validation scenarios in `quickstart.md` and confirm zero console errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can be run concurrently with Phase 2.
- **Foundational (Phase 2)**: Core client config blocks all implementation.
- **User Story 1 (Google Login)**: Blocks User Story 2, 3, and 4.
- **User Story 2 (Gatekeep)**: Requires User Story 1 to be fully functioning.
- **User Story 3 (Session)**: Requires User Story 1.
- **User Story 4 (Protected Routing)**: Requires User Story 1 and 3.
- **Polish (Phase 7)**: Executed after all other tasks are complete.

### Parallel Opportunities

- Database setup (T001) and JS client setup (T002) can run in parallel.
- All Phase 6 routing guard updates (T012–T015) can run in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 & 2 Only)

1. Set up the Database Table (Phase 1)
2. Implement Client Login and Redirect (Phase 2 & 3)
3. Implement Gatekeeper Rejection Check (Phase 4)
4. **STOP and VALIDATE**: Verify allowed users can log in, and blocked users are correctly kicked out.
