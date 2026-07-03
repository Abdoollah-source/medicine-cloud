# Data Model: Authentication & Access Gate

This document outlines the data schema and interfaces for the authentication gate.

## Primary Entities

### `allowed_users` Table (Database)

Holds the list of email addresses permitted to access the application.

| Field | SQL Type | Key | Constraints |
|---|---|---|---|
| `email` | `text` | Primary Key | Lowercase, non-empty, unique |

#### SQL Definition
```sql
CREATE TABLE allowed_users (
  email TEXT PRIMARY KEY
);

-- Enable RLS
ALTER TABLE allowed_users ENABLE ROW LEVEL SECURITY;

-- Policy: Only allow users to read their own email record
CREATE POLICY "Self-read only" ON allowed_users FOR SELECT
  USING (auth.email() = email);
```

---

## JS Interface Contracts (`auth.js`)

The auth module located at `src/js/auth.js` exports the following methods:

### 1. `initAuth()`
- **Signature**: `async () -> void`
- **Description**: Initialises the authentication state. Fetches the active session from Supabase. If signed in, validates the user against the allowlist. Sets up listeners for subsequent auth state changes.

### 2. `signInWithGoogle()`
- **Signature**: `async () -> void`
- **Description**: Triggers the OAuth 2.0 flow using Supabase `signInWithOAuth` with the `google` provider.

### 3. `signOut()`
- **Signature**: `async () -> void`
- **Description**: Invalidates the active session, clears client-side credentials, and redirects the user to `login.html`.

### 4. `checkAllowlist(session)`
- **Signature**: `async (session: object) -> boolean`
- **Description**: Performs a case-insensitive lookup of `session.user.email` in the `allowed_users` table. If uninvited, terminates the session and returns `false`.

### 5. `requireAuth()`
- **Signature**: `async () -> object`
- **Description**: Used by protected pages. Retrieves the session, checks the allowlist. If unauthenticated or uninvited, redirects to `login.html`. Returns the active session object if allowed.

### 6. `showAuthError(message)`
- **Signature**: `(message: string) -> void`
- **Description**: Populates the error element `document.getElementById('auth-error')` and toggles its visibility.
