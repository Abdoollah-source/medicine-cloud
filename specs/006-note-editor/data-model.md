# Data Model: Note Editor (SPEC-6)

## Entities

### EditorDraft (browser-side, transient)

This is the in-memory representation of the note currently being edited. It is never persisted
to Supabase directly; it is always re-derived from the textarea value by `JSON.parse()`.

| Field | Type | Source |
|---|---|---|
| `title` | string | User-typed JSON |
| `lang` | `"en"` \| `"ar"` | User-typed JSON |
| `content` | string | User-typed JSON |
| `subject` | string \| undefined | User-typed JSON |
| `unit` | string \| undefined | User-typed JSON |
| `date` | string \| undefined | User-typed JSON |
| `alt` | object \| undefined | User-typed JSON |
| `template_id` | string | User-typed JSON or template selector |

### EditorPayload (sent to Supabase)

What `createNote()` / `updateNote()` receives:

```js
{
  title: string,       // required
  lang: "en"|"ar",     // required
  content: string,     // required
  subject?: string,
  unit?: string,
  date?: string,
  alt?: { title: string, lang: string, content: string },
  template_id: string  // defaults to 'classic'
}
```

DB-generated fields (`id`, `user_id`, `created_at`, etc.) are never sent by the editor.

### Note (from Supabase — Update Mode)

On `getNote(id)`, the full row is returned. The editor:
1. Picks only the editable fields (the `EditorDraft` fields above).
2. Serialises them to a pretty-printed JSON string (`JSON.stringify(draft, null, 2)`).
3. Sets `textarea.value = serialised`.
4. Stores `noteId` (the `id` from the row) in a local variable for the `updateNote(noteId, patch)` call.

## Validation State Machine

```
IDLE (empty textarea)
  ↓ user types/pastes
VALIDATING (debounce window)
  ↓ 300ms elapsed
  ↓ JSON.parse() succeeds
SCHEMA_CHECKING
  ↓ all required fields present
VALID   → save button enabled, green status bar, preview rendered
  ↓ JSON.parse() fails
INVALID → save button disabled, red status bar with parse error
  ↓ required field missing
SCHEMA_ERROR → save button disabled, red status bar with field error

IDLE (empty textarea)
  → save button disabled, status bar shows placeholder
```

## URL Parameter Contract

| Param | Value | Effect |
|---|---|---|
| `?id=<uuid>` | Valid note UUID | Update Mode: fetches note, pre-fills textarea |
| (none) | — | Create Mode: blank textarea |
| `?id=invalid` | Non-existent UUID | Error box shown, editor unusable |
