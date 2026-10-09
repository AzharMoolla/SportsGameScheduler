alter table public.maintenance_hydration_requests drop constraint maintenance_hydration_requests_worker_check;
alter table public.maintenance_hydration_requests add constraint maintenance_hydration_requests_worker_check
check(worker in ('provider-hydrate','provider-hydrate-openf1','provider-hydrate-pandascore','provider-hydrate-players','provider-hydrate-broadcasts','ics-feed-ingest','provider-probe-apisports'));
do $$ declare definition text; begin
  definition:=pg_get_functiondef('private.enqueue_hydration(text,jsonb)'::regprocedure);
  definition:=replace(definition,'''ics-feed-ingest'')','''ics-feed-ingest'',''provider-probe-apisports'')');
  execute definition;
end; $$;
