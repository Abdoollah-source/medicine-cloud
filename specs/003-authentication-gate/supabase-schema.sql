-- Authentication & Access Gate: Database Schema
-- Run this SQL in the Supabase SQL Editor to set up the allowed_users table.

CREATE TABLE IF NOT EXISTS allowed_users (
  email TEXT PRIMARY KEY
);

ALTER TABLE allowed_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Self-read only" ON allowed_users;
CREATE POLICY "Self-read only" ON allowed_users
  FOR SELECT
  USING (auth.email() = email);
