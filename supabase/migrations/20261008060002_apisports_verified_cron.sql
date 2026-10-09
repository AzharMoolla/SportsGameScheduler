-- Four bounded batches/day: 3 dates x 6 endpoints = 72 API requests total,
-- normally 12/day per endpoint. Atomic reservations also protect manual runs.
-- JWT-protected worker is reached through single-use service-only dispatch tickets.
do $$ declare definition text; begin
  definition:=pg_get_functiondef('private.enqueue_hydration(text,jsonb)'::regprocedure);
  definition:=replace(definition,'when ''provider-hydrate-apisports'' then 6','when ''provider-hydrate-apisports'' then 8');
  execute definition;
end; $$;
select cron.schedule('hydrate-apisports-near-term','57 0,6,12,18 * * *',
  $$select private.enqueue_hydration('provider-hydrate-apisports');$$);
select cron.schedule('apisports-source-retention','37 7 * * *',$job$
  delete from public.apisports_request_budget where day < (now() at time zone 'UTC')::date-30;
  delete from public.provider_event_sources s where s.provider_key='apisports' and s.event_id is null
    and s.starts_at < now()-interval '30 days'
    and not exists(select 1 from public.event_external_ids x where x.provider_key=s.provider_key and x.external_id=s.external_id);
$job$);
