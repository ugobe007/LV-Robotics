-- Atomic click counter for event registration links.
create or replace function public.increment_event_click_count(event_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.events
  set click_count = coalesce(click_count, 0) + 1
  where id = event_id and status = 'published';
end;
$$;

revoke all on function public.increment_event_click_count(uuid) from public;
grant execute on function public.increment_event_click_count(uuid) to anon;
grant execute on function public.increment_event_click_count(uuid) to authenticated;
