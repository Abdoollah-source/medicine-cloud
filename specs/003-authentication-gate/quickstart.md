# Quickstart & Validation Guide: Authentication & Access Gate

**Branch**: `003-authentication-gate` | **Spec**: [spec.md](./spec.md) | **Data Model**: [data-model.md](./data-model.md)

## Prerequisites

- Active Supabase project with Google Provider enabled in Auth settings.
- The `allowed_users` table created in Supabase with RLS and the "Self-read only" policy.
- Local `.env` file populated with `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

---

## Scenario 1: Verify Direct Protected Page Intercept (SC-001)

**Goal**: Prove that an unauthenticated browser is blocked from viewing dashboard content and redirected to `login.html`.

**Steps**:
1. Open a new Incognito/Private browser window.
2. Navigate directly to `src/pages/dashboard.html` using the `file://` protocol or local web server.
3. Observe if the browser immediately redirects to `src/pages/login.html`.

**Expected Outcome**:
- The redirect happens before dashboard content displays (no app shell visible).
- Browser address bar shows `login.html`.

---

## Scenario 2: Google Sign-in with Allowed User (SC-002)

**Goal**: Prove that an invited Google account can log in and view the dashboard.

**Steps**:
1. Insert your test Google account email into the `allowed_users` table:
   ```sql
   INSERT INTO allowed_users (email) VALUES ('your-test-email@gmail.com');
   ```
2. Open `src/pages/login.html` in the browser.
3. Click the "Sign In with Google" button.
4. Complete the Google account selection and consent flow.

**Expected Outcome**:
- Browser redirects to Google, then returns.
- Upon returning, you are automatically redirected to `dashboard.html`.
- No error is displayed.

---

## Scenario 3: Google Sign-in with Blocked User (SC-002)

**Goal**: Prove that an uninvited user is signed out and blocked from access.

**Steps**:
1. Remove your test Google account email from the `allowed_users` table:
   ```sql
   DELETE FROM allowed_users WHERE email = 'your-test-email@gmail.com';
   ```
2. Open `src/pages/login.html` in the browser.
3. Click "Sign In with Google" and sign in with the test email.

**Expected Outcome**:
- The application signs out the user immediately.
- The browser is redirected back to `login.html` (or remains on it).
- A red error box or text displaying "Access not granted" appears on the login page.
- Direct navigation to `dashboard.html` results in a redirect to `login.html`.

---

## Scenario 4: Session Persistence (SC-003)

**Goal**: Prove that refresh preserves auth state.

**Steps**:
1. Re-add email to `allowed_users` and log in successfully.
2. Navigate to `dashboard.html`.
3. Press `F5` / Refresh.

**Expected Outcome**:
- You remain on `dashboard.html` without redirects or errors.
- Session remains active.
