# Data Model & Interfaces: PDF Export (SPEC-8)

## 1. Entities

### PDFRequestPayload (Worker Input query params)
Parameters parsed from the request URL by the worker:

| Param | Type | Required | Description |
|---|---|---|---|
| `url` | string | Yes | The URL of the note page to print: `https://<origin>/pages/note.html?token=<token>&template=<id>` |

### PDFResponse (Worker Output)
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="note.pdf"`
- Body: Binary PDF stream

## 2. API Interface Contract (Worker & Client)

### Worker Endpoint: `GET /`
- **Request Headers**:
  - Optional origin header
- **Query Params**:
  - `url`: target note URL to render
- **Response**:
  - `200 OK`: returns raw binary PDF stream
  - `400 Bad Request`: missing or invalid parameters
  - `403 Forbidden`: target origin is not in the whitelist
  - `504 Gateway Timeout`: Puppeteer navigation or render timed out
  - `500 Internal Server Error`: Puppeteer or browser crash
- **CORS Support**:
  - `Access-Control-Allow-Origin: *`
  - `Access-Control-Allow-Methods: GET, OPTIONS`

## 3. Database Updates (Public RLS)

To let the database select public notes by token without a logged-in user session, we create:

### Database Policies:
```sql
-- Allow anonymous/public users to read a note if it's marked public and has a token
CREATE POLICY "Public share read" ON notes FOR SELECT
  USING (is_public = TRUE AND share_token IS NOT NULL);
```

### JS API Updates (`notes.js`):
- `enableSharing(id)` → updates note to `is_public = true`, `share_token = crypto.randomUUID()` and returns the updated note.
- `getNoteByShareToken(token)` → performs select query on `notes` table where `share_token = token` and `is_public = true`.

## 4. Client URL Structures

- **Authenticated Note View**: `note.html?id=<uuid>` (Requires auth session, internal ID)
- **Public Note View / Worker URL**: `note.html?token=<uuid>&template=<id>` (Bypasses auth redirect, safe token)
- **Worker Target Call**: `CLOUDFLARE_WORKER_URL + '?url=' + encodeURIComponent(Public Note View)`
