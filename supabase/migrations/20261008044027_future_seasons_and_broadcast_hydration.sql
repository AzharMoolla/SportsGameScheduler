alter table public.provider_targets add column next_season text, add column next_season_synced_at timestamptz;
update public.provider_targets set next_season=case when current_season='2026' then '2027' when current_season='2026-2027' then '2027-2028' end where provider_key='thesportsdb' and is_active;
alter table public.broadcasts add column source_key text, add column source_url text, add column last_checked_at timestamptz;
alter table public.maintenance_hydration_requests drop constraint maintenance_hydration_requests_worker_check;
alter table public.maintenance_hydration_requests add constraint maintenance_hydration_requests_worker_check check(worker in ('provider-hydrate','provider-hydrate-openf1','provider-hydrate-pandascore','provider-hydrate-players','provider-hydrate-broadcasts','ics-feed-ingest'));
create or replace function private.enqueue_hydration(worker_name text, worker_payload jsonb default '{}'::jsonb)
returns bigint language plpgsql security definer set search_path = '' as $$
declare ticket uuid; request_id bigint; daily_cap integer;
begin
  if worker_name not in ('provider-hydrate','provider-hydrate-openf1','provider-hydrate-pandascore','provider-hydrate-players','provider-hydrate-broadcasts','ics-feed-ingest') then
    raise exception 'Worker not allowlisted';
  end if;
  perform pg_advisory_xact_lock(1082026);
  -- Shared SportsDB allowance: at most 12 x 20 event calls + 2 x 10 roster calls / UTC day.
  daily_cap := case worker_name when 'provider-hydrate' then 12 when 'provider-hydrate-pandascore' then 4 else 2 end;
  if (select count(*) from public.maintenance_hydration_requests
      where worker=worker_name and created_at >= date_trunc('day',now() at time zone 'UTC') at time zone 'UTC') >= daily_cap then
    raise exception 'Daily hydration batch budget exhausted';
  end if;
  -- Avoid overlapping provider calls, including requests not yet claimed.
  if exists (select 1 from public.maintenance_hydration_requests where status in ('queued','running') and created_at > now()-interval '160 seconds') then
    raise exception 'A hydration batch is already running';
  end if;
  delete from public.maintenance_hydration_requests where created_at < now()-interval '14 days';
  insert into public.maintenance_hydration_requests(worker,payload) values(worker_name,worker_payload) returning id into ticket;
  select net.http_post(
    url := 'https://bgbkqxdsjnbsizwkslsr.supabase.co/functions/v1/hydration-dispatch',
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body := jsonb_build_object('ticket',ticket),
    timeout_milliseconds := 140000
  ) into request_id;
  return request_id;
end;
$$;
revoke all on function private.enqueue_hydration(text,jsonb) from public,anon,authenticated;
grant execute on function private.enqueue_hydration(text,jsonb) to service_role;


