# Research Notes: Note Sharing (SPEC-9)

## 1. Database Schema Check & Columns
The database schema provisioned in SPEC-5 and detailed in `dev/SETUP.md` already contains the necessary columns for note sharing:
- `is_public` (`boolean`, defaults to `false`)
- `share_token` (`uuid`, defaults to `null`)

No database migrations are needed to add columns; we only need to add the SELECT policy.

## 2. Row-Level Security Policy for Sharing
To allow public, unauthenticated reads of shared notes, we must define the following SELECT policy:
```sql
CREATE POLICY "Public share read" ON notes FOR SELECT
  USING (is_public = TRUE AND share_token IS NOT NULL);
```
With this policy in place, when the Supabase JS client queries the database without an active session (e.g. from an incognito window), the database will permit fetching the row if both conditions are met. All write operations (INSERT, UPDATE, DELETE) remain gated by the ownership policies (`auth.uid() = user_id`), ensuring only the owner can modify the sharing state.

## 3. ES Module Client Sharing Operations
We add three functions to `src/js/notes.js` using the standard Supabase JS client pattern:

```js
async function enableSharing(id) {
  const client = await getClient();
  if (!client) return { data: null, error: new Error('Supabase client not available') };
  try {
    const token = crypto.randomUUID();
    const { data, error } = await client
      .from('notes')
      .update({ is_public: true, share_token: token })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  } catch (e) {
    return { data: null, error: e };
  }
}

async function revokeSharing(id) {
  const client = await getClient();
  if (!client) return { data: null, error: new Error('Supabase client not available') };
  try {
    const { data, error } = await client
      .from('notes')
      .update({ is_public: false, share_token: null })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  } catch (e) {
    return { data: null, error: e };
  }
}

async function getNoteByShareToken(token) {
  const client = await getClient();
  if (!client) return { data: null, error: new Error('Supabase client not available') };
  try {
    const { data, error } = await client
      .from('notes')
      .select('*')
      .eq('share_token', token)
      .eq('is_public', true)
      .single();
    return { data, error };
  } catch (e) {
    return { data: null, error: e };
  }
}
```

## 4. Clipboard API & Fallback
To copy the share URL to the clipboard, we use:
```js
navigator.clipboard.writeText(url)
  .then(() => {
    // Show "Copied!" feedback
  })
  .catch(err => {
    // Fallback: select text inside the input field so user can copy manually
    const input = document.getElementById('share-url');
    input.focus();
    input.select();
  });
```
This is fully standard and works across all target browsers (Chrome, Firefox, Safari).

## 5. Bypassing Auth Gate in note.html
To prevent unauthenticated users with a share link from being redirected to `login.html`, we check for the `share` URL parameter in `auth.js` before executing the redirect check:
```js
async function requireAuth() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('share')) {
    return null; // Bypass redirect
  }
  // Standard requireAuth logic...
}
```
This guarantees a clean user flow for external viewers.
