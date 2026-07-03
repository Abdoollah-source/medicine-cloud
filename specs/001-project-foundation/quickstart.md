# Quickstart Validation Guide: Project Foundation & File Structure

This guide documents how to manually run and verify the directory tree and ES modules.

## Prerequisites

- Modern Web Browser (Google Chrome, Apple Safari, or Mozilla Firefox)
- Local HTTP server (or open the file directly via `file://` scheme)

## Run Validation Scenario

### 1. Bootstrapping HTML Shell
- **Action**: Open `src/index.html` in your web browser.
- **Verification**: Right-click the page, select "Inspect", and go to the "Console" tab.
- **Expected Outcome**: You must see the output:
  ```text
  Medicine Cloud: app.js loaded
  ```
  with zero Javascript errors or warnings.

### 2. Git Status Verification
- **Action**: Open your terminal in the workspace root and run:
  ```bash
  git status
  ```
- **Verification**: Check the list of untracked files.
- **Expected Outcome**: `.env` must NOT be listed under untracked files, confirming it is ignored. `.env.example` and `.gitignore` must be tracked.

### 3. Setup File Verification
- **Action**: Open `dev/SETUP.md` in your editor.
- **Verification**: Check that it has detailed sections for:
  - Supabase Project Setup
  - Google OAuth Credentials configuration
  - Environment variables (`.env`)
  - Cloudflare Pages deployment steps
  - GitHub Actions keep-alive workflows
