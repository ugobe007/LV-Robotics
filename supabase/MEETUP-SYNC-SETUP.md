# Meetup → Supabase Calendar Sync

Automatically pulls events from the Meetup group into the site's Supabase
`events` table on a schedule. The homepage already reads that table, so synced
events appear on the site with no further changes.

**No Meetup API/OAuth required.** This uses Meetup's *public iCal feed*, which
needs no client ID, no secret, and no app approval (Meetup rejected the OAuth
client, so we sidestep it entirely).

```
Meetup public .ics feed  ──>  Edge Function "meetup-sync"  ──>  Supabase events  ──>  Homepage
   (no auth needed)              (runs every 6 hours via cron)
```

Feed URL: `https://www.meetup.com/las-vegas-robotics-meetup/events/ical/`

## Files
- `supabase/meetup-sync-schema.sql` — adds `meetup_event_id`, `source`, `synced_at` to `events`.
- `supabase/functions/meetup-sync/index.ts` — the sync function (iCal parser + upsert).
- `supabase/schedule-meetup-sync.sql` — schedules it every 6 hours.

> `scripts/meetup-oauth.mjs` and the `MEETUP_CLIENT_*` / `MEETUP_REFRESH_TOKEN`
> secrets are **no longer needed** and can be ignored/deleted.

---

## Setup

### 1. Apply the DB schema (once)
Run `supabase/meetup-sync-schema.sql` in the Supabase SQL Editor.

### 2. Deploy the function
```bash
supabase link --project-ref ubanpswucfkdvixityoe   # once
supabase functions deploy meetup-sync
```
No secrets to set — `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected
automatically. (Optional: `supabase secrets set MEETUP_GROUP_URLNAME="las-vegas-robotics-meetup"`
to sync a different group; otherwise the default group is used.)

### 3. Test it (no DB writes)
```bash
curl -s "https://ubanpswucfkdvixityoe.supabase.co/functions/v1/meetup-sync?test=1" \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" | jq
```
Returns `fetched`, `mappable`, and a `sample`. When the group has **upcoming**
events posted, `fetched` > 0. If it's 0, the group simply has no upcoming events
right now — schedule one on Meetup and re-run.

### 4. Run for real, then schedule
```bash
curl -s "https://ubanpswucfkdvixityoe.supabase.co/functions/v1/meetup-sync" \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" | jq
```
Then run `supabase/schedule-meetup-sync.sql` (or use Dashboard → Cron).

---

## Notes
- **Upcoming only:** Meetup's iCal feed lists only *upcoming* events. The sync
  only upserts (never deletes), so past/manual events stay in the table.
- **Deduplication:** synced rows have `source='meetup'` and a unique
  `meetup_event_id`. If you hand-entered an upcoming event that's also on Meetup,
  remove the manual duplicate, or let the sync own the upcoming calendar:
  ```sql
  DELETE FROM events WHERE source = 'manual' AND start_date > now();
  ```
- **No photos:** the iCal feed has no event image, so `image_url` is null and the
  site falls back to its default event image. (Hand-edit a row's `image_url` if
  you want a custom hero for a specific event.)
- **Time zones:** the parser converts `TZID`/`Z` timestamps to UTC correctly.
- **Security:** only the service_role key is used, and only inside the Edge
  Function — never in client code.
