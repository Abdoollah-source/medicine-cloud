# Medicine Cloud — Development Setup Guide

## Supabase Project Creation

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New project**.
3. Enter a name (e.g. `medicine-cloud`).
4. Set a secure database password and save it.
5. Choose a region close to your users.
6. Click **Create new project**.
7. Once created, go to **Project Settings → API** to find:
   - `Project URL` (the Supabase URL)
   - `anon public` key
   - `service_role` key (keep secret — never use in frontend code)

## Google OAuth Setup in Supabase

1. In your Supabase project dashboard, go to **Authentication → Providers**.
2. Click **Google**.
3. Enable the provider.
4. Go to the [Google Cloud Console](https://console.cloud.google.com), select your project (or create one).
5. Under **APIs & Services → Credentials**, create an OAuth 2.0 Client ID (Web application).
6. Add the authorised redirect URI: `https://<your-project>.supabase.co/auth/v1/callback`
7. Copy the **Client ID** and **Client Secret** into the Supabase Google provider fields.
8. Save the configuration.

## `.env` Configuration

1. Copy `.env.example` to `.env`:
   ```
   cp .env.example .env
   ```
2. Fill in the values:
   ```
   SUPABASE_URL=https://<your-project>.supabase.co
   SUPABASE_ANON_KEY=<your-anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
   CLOUDFLARE_WORKER_URL=https://<your-worker>.<your-name>.workers.dev
   ```
3. **Never commit `.env`** — it is already excluded by `.gitignore`.

## Cloudflare Pages Connection

1. Go to [Cloudflare Pages](https://pages.cloudflare.com).
2. Click **Create a project → Connect to Git**.
3. Authorise access to your repository.
4. Set:
   - **Build command**: (leave empty — static site, no build step)
   - **Build output directory**: `/`
   - **Root directory**: (leave as is)
5. Under **Environment variables**, add the same four variables from `.env`.
6. Deploy. The site will be available at `<project-name>.pages.dev`.

## Database Schema Provisioning

### `notes` Table

Run the following SQL in the Supabase SQL editor to create the notes table, enable RLS, and create policies:

```sql
-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create notes table
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

-- Owner read active notes (excludes soft-deleted)
CREATE POLICY "Owner read active" ON notes FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Owner read trash notes (only soft-deleted)
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

-- Public share read (anonymous users can read shared notes with a valid token)
CREATE POLICY "Public share read" ON notes FOR SELECT
  USING (is_public = TRUE AND share_token IS NOT NULL);

-- Create updated_at trigger
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON notes
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();
```

## Keep-Alive / Cold-Start Prevention

Supabase free-tier projects pause after approximately one week of inactivity. To prevent this:

1. The workflow file `.github/workflows/keep-alive.yml` is already created in the repository (see below).
2. In your GitHub repository, add the following repository secrets:
   - `SUPABASE_URL` — your Supabase project URL
   - `SUPABASE_ANON_KEY` — your Supabase anonymous API key
3. The workflow pings the Supabase API every 4 days at noon UTC, keeping the project active.
4. To test, go to **GitHub → Actions → Keep Supabase Alive → Run workflow** (manual dispatch).
