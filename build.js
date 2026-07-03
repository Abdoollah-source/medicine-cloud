#!/usr/bin/env node
/**
 * build.js — Cloudflare Pages build script
 *
 * Copies src/ → dist/ and substitutes __PLACEHOLDER__ tokens with
 * values from environment variables injected by Cloudflare Pages.
 *
 * Environment variables consumed:
 *   MC_SUPABASE_URL          → __MC_SUPABASE_URL__
 *   MC_SUPABASE_ANON_KEY     → __MC_SUPABASE_ANON_KEY__
 *   CLOUDFLARE_WORKER_URL    → __CLOUDFLARE_WORKER_URL__
 */

const fs   = require('fs');
const path = require('path');

const SRC  = path.join(__dirname, 'src');
const DIST = path.join(__dirname, 'dist');

const REPLACEMENTS = {
  '__MC_SUPABASE_URL__':       process.env.MC_SUPABASE_URL       || '',
  '__MC_SUPABASE_ANON_KEY__':  process.env.MC_SUPABASE_ANON_KEY  || '',
  '__CLOUDFLARE_WORKER_URL__': process.env.CLOUDFLARE_WORKER_URL || '',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath  = path.join(src,  entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.html', '.js', '.css'].includes(ext)) {
        let content = fs.readFileSync(srcPath, 'utf8');
        for (const [token, value] of Object.entries(REPLACEMENTS)) {
          content = content.replaceAll(token, value);
        }
        fs.writeFileSync(destPath, content, 'utf8');
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

console.log('Building Medicine Cloud…');

// Warn about missing vars — the build still succeeds but the site won't work.
for (const [token, value] of Object.entries(REPLACEMENTS)) {
  if (!value) {
    console.warn(`  WARNING: no value for ${token} — it will be empty in output`);
  }
}

if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true });
copyDir(SRC, DIST);

console.log(`Done — output in dist/`);
