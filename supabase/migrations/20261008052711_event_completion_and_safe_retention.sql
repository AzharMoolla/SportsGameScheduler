alter table public.events add column completed_at timestamptz;

-- Historical records must not all reappear as newly completed on migration day.
update public.events set completed_at=least(now(),starts_at+interval '6 hours')
where status='finished' and starts_at is not null;

create or replace function private.stamp_event_completion() returns trigger
language plpgsql set search_path='' as $$
begin
  if new.status='finished' then
    if TG_OP='INSERT' then
      new.completed_at := coalesce(new.completed_at,least(now(),new.starts_at+interval '6 hours'),now());
    elsif old.status is distinct from 'finished' then
      new.completed_at := now();
    else
      new.completed_at := coalesce(old.completed_at,new.completed_at,now());
    end if;
  else
    new.completed_at := null;
  end if;
  return new;
end;
$$;
revoke all on function private.stamp_event_completion() from public,anon,authenticated;
create trigger stamp_event_completion before insert or update on public.events
for each row execute function private.stamp_event_completion();
create index events_recent_completed_idx on public.events(completed_at) where status='finished';

create or replace function public.cleanup_past_events(retention interval default interval '90 days')
returns integer language plpgsql security definer set search_path='' as $$
declare deleted_count integer;
begin
  if retention < interval '90 days' or retention is null then
    raise exception 'Event retention must be at least 90 days';
  end if;
  with candidates as (
    select e.id from public.events e
    where e.visibility='public' and e.custom_league_id is null
      and e.provider_key in ('thesportsdb','pandascore','openf1','apisports','apisports_f1','ics')
      and e.starts_at < now()-retention
      and (e.completed_at is null or e.completed_at < now()-retention)
      and e.status <> 'live'
      and (e.status <> 'postponed' or e.starts_at < now()-interval '365 days')
      and not exists(select 1 from public.user_follows f where f.target_type='event' and f.target_id=e.id)
      and not exists(select 1 from public.calendar_feeds f where f.is_active
        and coalesce(f.filters->'eventIds','[]'::jsonb) @> jsonb_build_array(e.id::text))
      and not exists(select 1 from public.bracket_slots b where b.event_id=e.id or b.source_event_id=e.id)
      and not exists(select 1 from public.event_sessions s where s.parent_event_id=e.id or s.child_event_id=e.id)
    order by e.starts_at limit 1000
  )
  delete from public.events e using candidates c where e.id=c.id;
  get diagnostics deleted_count=row_count;
  return deleted_count;
end;
$$;
revoke all on function public.cleanup_past_events(interval) from public,anon,authenticated;
grant execute on function public.cleanup_past_events(interval) to service_role;
select cron.schedule('cleanup-past-events','47 6 * * *', $$select public.cleanup_past_events();$$);
notify pgrst, 'reload schema';
