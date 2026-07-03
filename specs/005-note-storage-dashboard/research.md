# Research: Note Storage & Dashboard (Supabase CRUD)

**Branch**: `005-note-storage-dashboard` | **Date**: 2026-07-03

## Summary

This document describes the database design, CRUD module strategies, visual states, and scheduling configurations.

---

## Decision 1: Database Schema, Trigger, and RLS

- **Decision**: Define the `notes` table schema exactly per Constitution §2.5. Write policy expressions that validate ownership via `auth.uid() = user_id`. Create a PostgreSQL trigger updating the `updated_at` timestamp before row updates.
- **Rationale**: Direct database-level checks ensure user data is private even if client-side logic fails or is bypassed. A database-level timestamp trigger guarantees audit consistency.
- **Trigger Definition**:
  ```sql
  CREATE OR REPLACE FUNCTION trigger_set_timestamp()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();
  ```

---

## Decision 2: notes.js Interface Design

- **Decision**: Standardise all exported CRUD methods in `notes.js` to return objects structured as `{ data, error }`, wrapping the Supabase queries. Always filter queries by active session ownership constraints.
- **Rationale**: Consistent error return wrappers match the Supabase SDK syntax and simplify client-side integration and error rendering in page controllers.
- **Redirection Filter on Note Page**: If `note.html` tries to fetch a note that has a non-null `deleted_at` timestamp, the query returns empty results due to the SELECT policy. The client handles this by redirecting or rendering an error box.

---

## Decision 3: Soft-Delete Modal & Visual Elements

- **Decision**: Implement confirmation modals directly in the DOM using structural divs: `.modal-overlay` (fixed position, background mask) and `.modal` (brutalist card, elevated shadow, no border radius).
- **Rationale**: Standard browser alerts (`window.confirm`) violate Constitution §8.7 styling rules. Custom CSS elements styled with the design system ensure full visual cohesion.

---

## Decision 4: GitHub Actions keep-alive workflow

- **Decision**: Define the workflow at `.github/workflows/keep-alive.yml`. Use a standard Ubuntu image and execute a scheduled HTTP GET request using curl to hit the Supabase REST endpoint: `${{ secrets.SUPABASE_URL }}/rest/v1/` with the header `apikey: ${{ secrets.SUPABASE_ANON_KEY }}`.
- **Rationale**: Restoring a paused database causes 10+ second delays for users. Ping frequencies under 7 days keep instances warm. Scheduling every 4 days at noon UTC handles this without cost.
