create table public.apisports_request_budget (
  day date not null, endpoint text not null, calls integer not null default 0 check(calls between 0 and 80),
  remaining integer check(remaining between 0 and 100), primary key(day,endpoint)
);
alter table public.apisports_request_budget enable row level security;
revoke all on public.apisports_request_budget from public,anon,authenticated;
grant all on public.apisports_request_budget to service_role;
create function public.reserve_apisports_request(endpoint_name text) returns boolean
language plpgsql security definer set search_path='' as $$
declare reserved integer;
begin
  if endpoint_name not in ('basketball','handball','hockey','nfl','rugby','mma') then
    raise exception 'Endpoint not allowlisted';
  end if;
  insert into public.apisports_request_budget(day,endpoint,calls)
  values((now() at time zone 'UTC')::date,endpoint_name,1)
  on conflict(day,endpoint) do update set calls=public.apisports_request_budget.calls+1,
    remaining=case when public.apisports_request_budget.remaining is null then null else public.apisports_request_budget.remaining-1 end
  where public.apisports_request_budget.calls<80 and (public.apisports_request_budget.remaining is null or public.apisports_request_budget.remaining>20)
  returning calls into reserved;
  return reserved is not null;
end; $$;
revoke all on function public.reserve_apisports_request(text) from public,anon,authenticated;
grant execute on function public.reserve_apisports_request(text) to service_role;
-- Conservatively include this session's diagnostics in today's budget.
insert into public.apisports_request_budget(day,endpoint,calls)
select (now() at time zone 'UTC')::date,endpoint,case when endpoint='mma' then 9 else 2 end
from unnest(array['basketball','handball','hockey','nfl','rugby','mma']) endpoint;

alter table public.maintenance_hydration_requests drop constraint maintenance_hydration_requests_worker_check;
alter table public.maintenance_hydration_requests add constraint maintenance_hydration_requests_worker_check
check(worker in ('provider-hydrate','provider-hydrate-openf1','provider-hydrate-pandascore','provider-hydrate-players','provider-hydrate-broadcasts','ics-feed-ingest','provider-probe-apisports','provider-hydrate-apisports'));
do $$ declare definition text; begin
  definition:=pg_get_functiondef('private.enqueue_hydration(text,jsonb)'::regprocedure);
  definition:=replace(definition,'''provider-probe-apisports'')','''provider-probe-apisports'',''provider-hydrate-apisports'')');
  definition:=replace(definition,'when ''provider-hydrate-pandascore'' then 4','when ''provider-hydrate-pandascore'' then 4 when ''provider-hydrate-apisports'' then 6');
  execute definition;
end; $$;
