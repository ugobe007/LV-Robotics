-- ==============================================================
-- LV Robotics — Schedule the meetup-sync Edge Function (every 6 hours)
-- Run in the Supabase SQL Editor AFTER the function is deployed.
--
-- Easiest alternative: Dashboard -> Integrations -> Cron -> "Create job"
-- -> type "Supabase Edge Function" -> pick meetup-sync. (No SQL needed.)
--
-- This SQL version uses pg_cron + pg_net. Replace the two placeholders.
-- ==============================================================

-- Enable required extensions (no-op if already enabled).
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove any previous job with this name so this script is idempotent.
SELECT cron.unschedule('meetup-sync')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'meetup-sync');

-- Schedule: every 6 hours, on the hour.
SELECT cron.schedule(
  'meetup-sync',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url    := 'https://ubanpswucfkdvixityoe.supabase.co/functions/v1/meetup-sync',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      -- Replace with your project's service_role key:
      'Authorization', 'Bearer <SERVICE_ROLE_KEY>'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- ==============================================================
-- Verify
-- ==============================================================

-- Inspect the scheduled job:
SELECT jobid, jobname, schedule, active FROM cron.job WHERE jobname = 'meetup-sync';

-- Confirm the stored command has a REAL key (Bearer eyJ...), not the placeholder:
SELECT command FROM cron.job WHERE jobname = 'meetup-sync';

-- Trigger one run immediately (replace the key), then re-check run details below:
-- SELECT net.http_post(
--   url     := 'https://ubanpswucfkdvixityoe.supabase.co/functions/v1/meetup-sync',
--   headers := jsonb_build_object(
--     'Content-Type', 'application/json',
--     'Authorization', 'Bearer <SERVICE_ROLE_KEY>'
--   ),
--   body := '{}'::jsonb
-- );

-- Check the most recent runs ('succeeded' = healthy):
SELECT status, return_message, start_time
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'meetup-sync')
ORDER BY start_time DESC
LIMIT 5;
