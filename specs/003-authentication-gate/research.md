# Research: Authentication & Access Gate

**Branch**: `003-authentication-gate` | **Date**: 2026-07-03

## Summary

This document captures the design decisions and architecture for implementing invite-only authentication via Google Sign-In and a Supabase PostgreSQL database gate.

---

## Decision 1: Database Gate Architecture (allowed_users Table)

- **Decision**: Create an `allowed_users` table in Supabase where the primary key is `email` (TEXT). Enable Row-Level Security (RLS) and define a policy allowing authenticated users to select only rows where the email matches `auth.email()`.
- **Rationale**: Storing the allowlist in a database table allows administrators to add or remove access instantly without redeploying the frontend. RLS is critical: without it, any authenticated user could query the entire allowlist, exposing all invited emails. With `USING (auth.email() = email)`, querying `select email from allowed_users where email = <my_email>` returns 1 row if invited, and 0 rows if uninvited or if querying someone else's email.
- **Alternatives Considered**:
  - *Hardcoded allowlist in JS*: Rejected. Modifying access would require a code change, commit, and redeployment.
  - *Edge worker validation*: Rejected. Unnecessary complexity and potential cost; direct database query with client-side RLS is simple and secure.

---

## Decision 2: Access Gate Flow & Early Session Termination

- **Decision**: Immediately after a user signs in via Google, or when a session is loaded from persistence, the system queries the `allowed_users` table. If the query returns 0 rows:
  1. The client immediately invokes `supabase.auth.signOut()`.
  2. The router cancels any redirection to the dashboard.
  3. The login page displays an error message: "Access not granted. Please sign in with an invited email."
- **Rationale**: Supabase Auth handles third-party OAuth, which allows any Google user to create an account in the Supabase Auth system. Supabase has no built-in provider-level allowlist. Therefore, the gate check must happen immediately post-login in client application logic, using a quick database query. Calling `signOut()` immediately ensures their session token is invalidated on the server and cleared from client storage.

---

## Decision 3: Client-Side Credentials Substitution

- **Decision**: Inject Supabase credentials into the app by replacing placeholders `__MC_SUPABASE_URL__` and `__MC_SUPABASE_ANON_KEY__` at build time in Cloudflare Pages. These are attached to the global window object in the page template (e.g. `window.MC_SUPABASE_URL`).
- **Rationale**: Since Medicine Cloud has no server process, the client must initialise the Supabase client directly. Standard `.env` variables cannot be read at runtime. Build-time injection allows local `.env` variables to be used for local development while Cloudflare environment variables are substituted for production builds.

---

## Decision 4: Auth-Aware Redirect Router

- **Decision**: In each protected page (`dashboard.html`, `editor.html`, etc.), add a blocking `<script type="module">` at the top of the `<head>` tag. This script calls `requireAuth()`, which checks for a valid session and queries the allowlist. If validation fails, it sets `window.location.href = 'login.html'` before the DOM or body content starts rendering.
- **Rationale**: Placing the redirect logic in a blocking module script at the top of the page prevents "content flashing" (where unauthenticated users briefly see dashboard widgets before being redirected).
