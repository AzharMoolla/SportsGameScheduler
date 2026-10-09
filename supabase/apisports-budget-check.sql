begin;
-- Service-only quotas cannot be called from a browser session.
select not has_function_privilege('anon','public.reserve_apisports_request(text)','EXECUTE') as anon_denied,
  not has_function_privilege('authenticated','public.reserve_apisports_request(text)','EXECUTE') as authenticated_denied;
do $$ declare allowed boolean; begin
  insert into public.apisports_request_budget(day,endpoint,calls,remaining)
  values((now() at time zone 'UTC')::date,'mma',79,22)
  on conflict(day,endpoint) do update set calls=79,remaining=22;
  select public.reserve_apisports_request('mma') into allowed;
  if not allowed then raise exception 'Final budgeted request should be allowed'; end if;
  select public.reserve_apisports_request('mma') into allowed;
  if allowed then raise exception 'Request above cap was allowed'; end if;
  update public.apisports_request_budget set calls=10,remaining=20
  where day=(now() at time zone 'UTC')::date and endpoint='mma';
  select public.reserve_apisports_request('mma') into allowed;
  if allowed then raise exception 'External-use headroom was not protected'; end if;
end; $$;
rollback;
