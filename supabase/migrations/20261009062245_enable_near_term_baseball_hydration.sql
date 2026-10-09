-- Enable permitted near-term date queries, leaving full-season access restricted.
create or replace function public.reserve_apisports_request(endpoint_name text) returns boolean
language plpgsql security definer set search_path='' as $$
declare reserved integer;
begin
  if endpoint_name not in ('baseball','basketball','handball','hockey','nfl','rugby','mma') then
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
-- Include the two successful diagnostic calls conservatively in today's ledger.
insert into public.apisports_request_budget(day,endpoint,calls,remaining)
values((now() at time zone 'UTC')::date,'baseball',2,98)
on conflict(day,endpoint) do nothing;
