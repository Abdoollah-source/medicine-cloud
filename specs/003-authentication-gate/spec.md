# Feature Specification: Authentication & Access Gate

**Feature Branch**: `003-authentication-gate`

**Created**: 2026-07-03

**Status**: Approved

**Input**: User description: "SPEC-3 — Authentication & Access Gate"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Google Sign-In with Allowed Account (Priority: P1)

An invited student or collaborator visits the login page, clicks the Google Sign-In button, completes the Google OAuth flow, and is automatically redirected to the dashboard. The system confirms their email is present in the allowlist and creates a persistent session.

**Why this priority**: Core path for authorized users to enter the application. Without this, no user can view or edit notes.

**Independent Test**:
1. Open the application.
2. Verify you are on `login.html`.
3. Click the Google sign-in button.
4. Sign in with an account present in the `allowed_users` table.
5. Verify you are automatically redirected to `dashboard.html`.

**Acceptance Scenarios**:

1. **Given** the login page, **When** an allowed user clicks "Sign In with Google", **Then** the Google OAuth consent flow opens.
2. **Given** a successful Google Auth return, **When** the session is established and the email is matched in `allowed_users`, **Then** the user is redirected to `dashboard.html`.

---

### User Story 2 - Gatekeep Non-Allowed Account (Priority: P1)

An uninvited user attempts to log in using their Google account. The OAuth flow completes, but the access gate checks the allowlist database, finds no matching email, immediately signs the user out, redirects them back to the login page, and displays a prominent rejection error.

**Why this priority**: Security critical. Medicine Cloud is invite-only; uninvited access must be strictly blocked to prevent unauthorized data exposure or database abuse.

**Independent Test**:
1. Sign in with a Google account NOT present in `allowed_users`.
2. Confirm you are signed out and returned to `login.html`.
3. Verify an error message "Access not granted" or similar is visible.

**Acceptance Scenarios**:

1. **Given** a successful Google Auth return, **When** the email is NOT found in the `allowed_users` table, **Then** the system immediately calls sign-out to clear the session.
2. **Given** an uninvited user sign-out, **When** returned to `login.html`, **Then** the page displays a styling-compliant error message.

---

### User Story 3 - Session Persistence & Auto-Login (Priority: P1)

A user who has previously signed in opens the dashboard or editor. The application detects the existing active session, verifies the user is still in the allowlist, and permits immediate access without requiring another manual sign-in.

**Why this priority**: User experience. Forcing users to log in on every single visit or page refresh creates severe friction.

**Independent Test**:
1. Log in with an allowed account.
2. Refresh the dashboard page.
3. Verify the dashboard content remains accessible and you are not redirected back to the login page.

**Acceptance Scenarios**:

1. **Given** an existing valid session in storage, **When** loading any page, **Then** the system validates the session silently.
2. **Given** a validated persistent session, **When** loading the application root, **Then** the user is auto-navigated to the dashboard.

---

### User Story 4 - Protected Page Routing Redirects (Priority: P1)

An unauthenticated or logged-out user tries to access a protected page (like `dashboard.html`, `editor.html`, `settings.html`, or `note.html`) by typing the URL directly. The application intercepts the request on load, detects the lack of a valid session, and immediately redirects the browser to `login.html`.

**Why this priority**: Access control. Protected pages must never leak layout shells, navigation, or note stubs to unauthenticated visitors.

**Independent Test**:
1. Open a new private browser window.
2. Navigate directly to `dashboard.html` or `editor.html`.
3. Verify the browser instantly redirects to `login.html` before showing any app shell.

**Acceptance Scenarios**:

1. **Given** no active session, **When** a visitor loads a protected HTML page, **Then** the script intercepts the load and redirects the browser to `login.html`.

---

## Edge Cases

- **Email Casing Differences**: The allowlist search must be case-insensitive (e.g. `User@Example.com` must match `user@example.com` in the allowlist).
- **Google Auth Denial**: If the user cancels the Google OAuth consent screen, the system must handle the error gracefully, returning to the login page and showing a user-friendly message rather than breaking.
- **Revoked Invites**: If an active user session exists but their email is removed from `allowed_users`, their next action or page refresh must trigger the allowlist check, sign them out, and block access.
- **Database/Network Down**: If the Supabase client cannot verify the allowlist due to a network failure, the application must fail-closed (deny access, show error) to protect privacy.

## Requirements

### Functional Requirements

- **FR-001**: System MUST initialise the database client using environment variables substituted at build time.
- **FR-002**: System MUST check user email against the `allowed_users` table immediately upon authentication or session retrieval.
- **FR-003**: System MUST execute the access gate check case-insensitively.
- **FR-004**: If the allowlist check fails, the system MUST call sign-out immediately, redirect to `login.html`, and display an error.
- **FR-005**: All app-shell views (`dashboard.html`, `editor.html`, `note.html`, `settings.html`) MUST run a blocking check on load and redirect unauthenticated users to `login.html`.
- **FR-006**: The login page MUST show a styling-compliant error message container (`id="auth-error"`) with class `error-state`.
- **FR-007**: The Google sign-in button MUST follow the neo-brutalist styling rules (§8.7): a rectangular `.btn` with class `.btn-primary` (ink fill), `0px` border-radius, and a stacked hard shadow. Standard rounded/branded Google login widgets are prohibited.
- **FR-008**: The login page page background MUST be `var(--cream)`.
- **FR-009**: The database table `allowed_users` MUST have Row-Level Security (RLS) enabled, restricting select access to the authenticated user's own email.

### Key Entities

- **`allowed_users` Table**: The database allowlist. Primary key is the email address.
- **Auth Session**: The active client-side login session.
- **Protected View**: Any HTML view representing authenticated app functionality.

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% of unauthenticated attempts to load protected pages trigger a redirect to `login.html` in under 150ms.
- **SC-002**: 100% of uninvited Google logins are successfully signed out and blocked from dashboard redirection.
- **SC-003**: The Google sign-in button conforms visually to Constitution §8.7 (zero border-radius, 2.5px ink border, 7-layer stacked shadow).
- **SC-004**: Row-Level Security (RLS) is active on the `allowed_users` table in the database.
- **SC-005**: Zero hardcoded API keys or database URLs exist in the version-controlled JavaScript files.

## Assumptions

- **A-001**: Supabase instance is active and Google OAuth is enabled.
- **A-002**: Cloudflare Pages replaces `__MC_SUPABASE_URL__` and `__MC_SUPABASE_ANON_KEY__` placeholders correctly at build time.
- **A-003**: The browser supports localStorage for session state persistence.
