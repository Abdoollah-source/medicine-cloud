# Data Model & Interfaces: Note Sharing (SPEC-9)

## 1. Schema Extensions & Policies

### Database SELECT Policy
Enables unauthenticated clients to read note data if marked public and assigned a token:
```sql
CREATE POLICY "Public share read" ON notes FOR SELECT
  USING (is_public = TRUE AND share_token IS NOT NULL);
```

## 2. API Interface Signatures (`notes.js`)

```js
// Sets is_public = true and generates UUID share_token
async function enableSharing(id) // -> { data: Note, error: Error|null }

// Sets is_public = false and share_token = null
async function revokeSharing(id) // -> { data: Note, error: Error|null }

// Selects public note row matching share_token (no auth required)
async function getNoteByShareToken(token) // -> { data: Note, error: Error|null }
```

## 3. URL Parameter Routing Rules

| URL | Parameters | Authentication | Action |
|---|---|---|---|
| `note.html?id=<uuid>` | Owner ID query | **Enforced** (`requireAuth`) | Fetches note via `getNote(id)`, renders content, displays share configuration panel |
| `note.html?share=<uuid>` | Public token query | **Bypassed** | Fetches note via `getNoteByShareToken(token)`, renders content, hides all owner controls |
