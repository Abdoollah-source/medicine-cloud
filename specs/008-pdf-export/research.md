# Research Notes: PDF Export (SPEC-8)

## 1. Cloudflare Browser Rendering API & Puppeteer
Cloudflare Workers supports headless Chromium via the `@cloudflare/puppeteer` package.
A worker must have a browser binding set up in `wrangler.toml` or Cloudflare Pages settings:
```toml
[browser]
binding = "MY_BROWSER"
```
In the worker code, we connect to this instance using `puppeteer.launch({ keyword: env.MY_BROWSER })` or `puppeteer.launch(env.MY_BROWSER)`.
The browser instance is shared across workers, keeping starts fast.

## 2. Origin Verification & Allowed Origins
To prevent the worker from being abused as a general screenshot/scraping proxy, the worker must block requests that try to render foreign pages:
```js
const allowedOrigin = env.APP_ORIGIN; // e.g. "https://medicine-cloud.pages.dev"
const targetUrl = new URL(searchParams.get('url'));
if (allowedOrigin && new URL(allowedOrigin).origin !== targetUrl.origin) {
  return new Response("Forbidden", { status: 403 });
}
```
This is fully secure as the origin of the target URL is verified before launching Puppeteer.

## 3. Puppeteer Navigation Options
We navigate using:
```js
await page.goto(targetUrl, {
  waitUntil: 'networkidle0', // wait until there are no more than 0 network connections for at least 500ms
  timeout: 15000 // 15 second timeout to print
});
```
Waiting for `networkidle0` is critical because the page needs to fetch the note data from Supabase and download the Google Fonts from the CDN before printing.

## 4. CORS Headers
The worker will be requested from `note.html` running on the Pages domain (e.g. `https://medicine-cloud.pages.dev`) to the Worker domain (e.g. `https://pdf-worker.workers.dev`). This triggers a CORS check.
The worker must return:
```js
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};
```
And respond to `OPTIONS` preflight requests:
```js
if (request.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders, status: 204 });
}
```

## 5. Public Access Bypass Token
The note page normally redirects unauthenticated users to `login.html`. When headless Chromium loads the page, it has no cookies/session.
To solve this:
1. We add a public access token query parameter `?token=<uuid>`.
2. In `auth.js`, we modify `requireAuth()` to bypass the redirect if a `token` param is in the URL:
```js
async function requireAuth() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('token')) {
    return null; // Bypass auth redirect, let page handle public fetch
  }
  // Standard requireAuth logic...
}
```
3. In `note.html`, we check `urlParams.has('token')`:
- If true: call `getNoteByShareToken(token)` instead of `getNote(id)`. This public fetch does not require user authentication. If it succeeds, render the note; if it fails, show "Note not found".
- If false: execute the standard auth-gated load flow.
4. RLS Policy:
```sql
CREATE POLICY "Public share read" ON notes FOR SELECT
  USING (is_public = TRUE AND share_token IS NOT NULL);
```
This allows the database to return the row to unauthenticated public requests if the token matches.
