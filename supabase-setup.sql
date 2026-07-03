-- ==========================================
-- Medicine Cloud Supabase Database Schema
-- Run this script in the Supabase SQL Editor
-- ==========================================

-- 1. Create the allowed_users table
CREATE TABLE IF NOT EXISTS allowed_users (
  email TEXT PRIMARY KEY
);

-- Enable RLS for allowed_users
ALTER TABLE allowed_users ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to check their own email in the allowlist
DROP POLICY IF EXISTS "Self-read only" ON allowed_users;
CREATE POLICY "Self-read only" ON allowed_users
  FOR SELECT
  USING (auth.email() = email);

-- 2. Create the notes table
CREATE TABLE IF NOT EXISTS notes (
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

-- Enable RLS for notes
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Owner select policy (active notes)
DROP POLICY IF EXISTS "Owner read active" ON notes;
CREATE POLICY "Owner read active" ON notes FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Owner select policy (trash/soft-deleted notes)
DROP POLICY IF EXISTS "Owner read trash" ON notes;
CREATE POLICY "Owner read trash" ON notes FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NOT NULL);

-- Owner insert policy
DROP POLICY IF EXISTS "Owner insert" ON notes;
CREATE POLICY "Owner insert" ON notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Owner update policy
DROP POLICY IF EXISTS "Owner update" ON notes;
CREATE POLICY "Owner update" ON notes FOR UPDATE
  USING (auth.uid() = user_id);

-- Owner hard delete policy
DROP POLICY IF EXISTS "Owner hard delete" ON notes;
CREATE POLICY "Owner hard delete" ON notes FOR DELETE
  USING (auth.uid() = user_id);

-- Public sharing policy: Allow anybody to read a note if it is public and has a share token (SPEC-9)
DROP POLICY IF EXISTS "Public share read" ON notes;
CREATE POLICY "Public share read" ON notes FOR SELECT
  USING (is_public = TRUE AND share_token IS NOT NULL);

-- ==========================================
-- 3. INSERT YOUR EMAIL IN THIS TABLE SO YOU CAN LOG IN:
--
-- INSERT INTO allowed_users (email) VALUES ('your-google-email@gmail.com');
-- ==========================================
