create unique index if not exists idx_events_meetup_event_id
on public.events(meetup_event_id)
where meetup_event_id is not null;
