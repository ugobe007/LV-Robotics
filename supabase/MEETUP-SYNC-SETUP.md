# Meetup → Supabase Calendar Sync

Automatically pulls events from your Meetup group into the site's Supabase
`events` table on a schedule. The homepage already reads that table, so synced
events appear on the site with no further changes.

```
Meetup GraphQL  ──(refresh token)──>  Edge Function "meetup-sync"  ──>  Supabase events  ──>  Homepage
                                          (runs every 6 hours via cron)
```

## Files
- `supabase/meetup-sync-schema.sql` — adds `meetup_event_id`, `source`, `synced_at` to `events`.
- `supabase/functions/meetup-sync/index.ts` — the sync function.
- `supabase/schedule-meetup-sync.sql` — schedules it every 6 hours.
- `scripts/meetup-oauth.mjs` — one-time helper to get a refresh token.

---

## One-time setup

### 1. Create a Meetup OAuth client
- Go to https://www.meetup.com/api/oauth/list/ → **Create new client**.
- Set **Redirect URI** to exactly: `http://localhost:8910/callback`
- Copy the **Client ID** and **Client Secret** into `config/secrets.env`:
  ```
  MEETUP_CLIENT_ID=...
  MEETUP_CLIENT_SECRET=...
  MEETUP_PRONETWORK_URLNAME=...   # your Meetup Pro network urlname
  ```

### 2. Get a refresh token
```bash
node scripts/meetup-oauth.mjs
```
Approve in the browser; the **refresh token** prints in the terminal. Paste it
into `config/secrets.env` as `MEETUP_REFRESH_TOKEN`.

### 3. Apply the DB schema
Run `supabase/meetup-sync-schema.sql` in the Supabase SQL Editor.

### 4. Set the function's secrets
```bash
supabase link --project-ref ubanpswucfkdvixityoe   # once
supabase secrets set \
  MEETUP_CLIENT_ID="..." \
  MEETUP_CLIENT_SECRET="..." \
  MEETUP_REFRESH_TOKEN="..." \
  MEETUP_PRONETWORK_URLNAME="..." \
  MEETUP_GROUP_URLNAME="las-vegas-robotics-meetup" \
  SYNC_PAST="false"
```
(`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically.)

### 5. Deploy the function
```bash
supabase functions deploy meetup-sync
```

### 6. Test it (no DB writes)
```bash
curl -s "https://ubanpswucfkdvixityoe.supabase.co/functions/v1/meetup-sync?test=1" \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" | jq
```
You should see `fetched` > 0 and a `mappedSample`. If GraphQL field names error,
the message tells you which field — adjust `EVENTS_QUERY` in `index.ts`
(introspection is enabled on the Meetup API).

### 7. Run for real, then schedule
```bash
curl -s "https://ubanpswucfkdvixityoe.supabase.co/functions/v1/meetup-sync" \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" | jq
```
Then run `supabase/schedule-meetup-sync.sql` (or use Dashboard → Cron).

---

## Notes
- **Deduplication:** synced rows have `source='meetup'` and a unique
  `meetup_event_id`. If you previously hand-entered an upcoming event that also
  exists on Meetup, you may see it twice. Remove the manual duplicate, or delete
  all manual upcoming events and let the sync own the calendar:
  ```sql
  DELETE FROM events WHERE source = 'manual' AND start_date > now();
  ```
- **Past events:** set `SYNC_PAST=true` to also import past events.
- **Rate limits:** Meetup allows 500 points / 60s; a 6-hour cadence is far under.
- **Security:** the Meetup refresh token and service_role key live only as
  Supabase secrets / in `config/secrets.env` (git-ignored) — never in client code.
