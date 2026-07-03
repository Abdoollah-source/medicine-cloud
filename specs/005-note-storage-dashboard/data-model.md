# Data Model: Note Storage & Dashboard (Supabase CRUD)

This document contains the table schema, SQL initialization script, and JS CRUD contracts.

## Database Entities

### `notes` Table Schema

| Column | PostgreSQL Type | Key | Defaults / Rules |
|---|---|---|---|
| `id` | `uuid` | Primary Key | `gen_random_uuid()` |
| `user_id` | `uuid` | Foreign Key | References `auth.users.id` |
| `title` | `text` | - | Non-null |
| `lang` | `text` | - | `"en" \| "ar"` |
| `subject` | `text` | - | Nullable |
| `unit` | `text` | - | Nullable |
| `date` | `text` | - | Nullable |
| `content` | `text` | - | Non-null HTML content |
| `alt` | `jsonb` | - | Nullable alt lang translation object |
| `template_id`| `text` | - | Defaults to `'classic'` |
| `is_public` | `boolean` | - | Defaults to `false` |
| `share_token`| `uuid` | - | Nullable |
| `deleted_at` | `timestamptz` | - | Nullable (used for soft-delete) |
| `created_at` | `timestamptz` | - | `now()` |
| `updated_at` | `timestamptz` | - | `now()` |

#### SQL Definitions
```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  title TEXT NOT NULL,
  lang TEXT NOT NULL CHECK (lang IN ('en', 'ar')),
  subject TEXT,
  unit TEXT,
  date TEXT,
  content TEXT NOT NULL,
  alt JSONB,
  template_id TEXT DEFAULT 'classic',
  is_public BOOLEAN DEFAULT false,
  share_token UUID DEFAULT NULL,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Owner read active notes
CREATE POLICY "Owner read active" ON notes FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Owner read trash notes
CREATE POLICY "Owner read trash" ON notes FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NOT NULL);

-- Owner insert
CREATE POLICY "Owner insert" ON notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Owner update
CREATE POLICY "Owner update" ON notes FOR UPDATE
  USING (auth.uid() = user_id);

-- Owner hard delete
CREATE POLICY "Owner hard delete" ON notes FOR DELETE
  USING (auth.uid() = user_id);
```

---

## JS Interface Contracts (`notes.js`)

The notes module located at `src/js/notes.js` exports the following methods:

### 1. `createNote(noteJson)`
- **Signature**: `async (noteJson: object) -> { data, error }`
- **Description**: Inserts a new note. `user_id` is automatically set by the database or auth session.

### 2. `getNote(id)`
- **Signature**: `async (id: string) -> { data, error }`
- **Description**: Fetches a single active (non-deleted) note by ID.

### 3. `listNotes()`
- **Signature**: `async () -> { data, error }`
- **Description**: Returns all non-deleted notes owned by the current user, ordered by `created_at DESC`.

### 4. `listTrash()`
- **Signature**: `async () -> { data, error }`
- **Description**: Returns all soft-deleted notes owned by the current user, ordered by `deleted_at DESC`.

### 5. `updateNote(id, patch)`
- **Signature**: `async (id: string, patch: object) -> { data, error }`
- **Description**: Updates note fields matching the provided patch.

### 6. `softDeleteNote(id)`
- **Signature**: `async (id: string) -> { data, error }`
- **Description**: Sets `deleted_at = now()` on the target note row.

### 7. `restoreNote(id)`
- **Signature**: `async (id: string) -> { data, error }`
- **Description**: Sets `deleted_at = null` on the target note row.

### 8. `hardDeleteNote(id)`
- **Signature**: `async (id: string) -> { data, error }`
- **Description**: Permanently erases the database row matching the note ID.
