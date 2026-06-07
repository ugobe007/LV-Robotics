# Credentials & Environment Config

Single source of truth for every API key, secret, and environment variable
this project uses.

## Files

| File | Committed? | Purpose |
|------|-----------|---------|
| `secrets.env` | **No** (git-ignored) | Real values. Your quick-access reference. |
| `credentials.template.env` | Yes | Empty template with the same structure. |
| `README.md` | Yes | This document. |

First-time setup on a new machine:

```bash
cp config/credentials.template.env config/secrets.env
# then fill in the real values
```

## Important: this is a static site

The site is plain HTML/JS served by nginx with **no build step**, so nothing
reads `secrets.env` at runtime. `secrets.env` is purely a convenient,
git-ignored vault for humans and for local admin/migration scripts.

The values the **live site** actually uses are hardcoded in the client files
listed below. If you rotate a key that the site uses, you must update those
files and redeploy.

## Credential reference

### Supabase (current project: `ubanpswucfkdvixityoe`)

- **Project URL** and **anon key** — the anon key is *public by design*. It is
  safe to expose in browser code; access is controlled by Row Level Security.
  Used by the live site in:
  - `js/main.js`
  - `js/membership.js`
  - `admin.html`
  - `event.html`
- **service_role key** — *secret*, full database access, bypasses RLS.
  **Not used by the site.** Only for local admin/migration scripts.

### ReadyForRobots API

- No key. Requests are proxied same-origin through nginx (`/rfr-api/` →
  `https://ready-2-robot.fly.dev/api/`) to avoid CORS. Config lives in
  `nginx.conf` and `js/main.js` (`RFR_API_BASE`).

## Rotating keys

**service_role key** (recommended after any exposure):
1. Supabase Dashboard → project → Settings → API → roll `service_role`.
2. Paste the new value into `config/secrets.env`.
3. **No code change, no redeploy** — the site never uses it.

**anon key** (optional; it's public):
1. Roll it in the Supabase dashboard.
2. Update it in the four files listed above.
3. Bump the `?v=` cache version on `js/main.js` / `js/membership.js` and redeploy.

## Rules

- Never commit `config/secrets.env` (it is git-ignored).
- Never put a `service_role` key in any file under `js/` or any `.html`.
- Treat anything pasted into chat/logs as compromised — rotate it.
