
begin;
do $test$
declare
  user_a uuid := gen_random_uuid();
  user_b uuid := gen_random_uuid();
  league_a uuid := gen_random_uuid();
  league_b uuid := gen_random_uuid();
  token_a text := gen_random_uuid()::text;
  result jsonb;
  changed integer;
begin
  insert into auth.users(id,email) values
    (user_a,user_a::text||'@restore-test.invalid'),
    (user_b,user_b::text||'@restore-test.invalid');
  insert into public.profiles(user_id,display_name) values(user_a,'Owner A'),(user_b,'Owner B');
  insert into public.custom_leagues(id,owner_user_id,name,timezone,public_token,payload,include_notes_in_share)
    values (league_a,user_a,'Test A','UTC',token_a,'{"events":[{"id":"e1","title":"Test","notes":"private-note"}]}'::jsonb,false),
           (league_b,user_b,'Test B','UTC',gen_random_uuid()::text,'{}'::jsonb,false);
  perform set_config('request.jwt.claim.sub',user_a::text,true);
  perform set_config('request.jwt.claims',json_build_object('sub',user_a,'role','authenticated')::text,true);
  set local role authenticated;
  if (select count(*) from public.profiles) <> 1 then raise exception 'Profile ownership isolation failed'; end if;
  if (select count(*) from public.custom_leagues) <> 1 then raise exception 'League membership isolation failed'; end if;
  update public.profiles set display_name='Unauthorized change' where user_id=user_b;
  get diagnostics changed = row_count;
  if changed <> 0 then raise exception 'Cross-user profile update allowed'; end if;
  reset role;
  perform set_config('request.jwt.claim.sub','',true);
  perform set_config('request.jwt.claims','{"role":"anon"}',true);
  set local role anon;
  if (select count(*) from public.profiles) <> 0 then raise exception 'Anonymous profile exposure'; end if;
  if (select count(*) from public.custom_leagues) <> 0 then raise exception 'Anonymous league table exposure'; end if;
  select payload into result from public.get_shared_league(token_a);
  if result is null or result::text like '%private-note%' then raise exception 'Private share notes exposed'; end if;
  if exists(select 1 from public.get_shared_league('invalid-token')) then raise exception 'Invalid share token accepted'; end if;
  reset role;
  update public.custom_leagues set share_enabled=false where id=league_a;
  set local role anon;
  if exists(select 1 from public.get_shared_league(token_a)) then raise exception 'Revoked share still works'; end if;
  reset role;
  if has_function_privilege('anon','public.admin_overview()','execute')
     or has_function_privilege('authenticated','public.cleanup_past_events(interval)','execute')
     or has_table_privilege('anon','public.provider_targets','select')
  then raise exception 'Internal operations exposed'; end if;
end
$test$;
rollback;
select 'PASS: owner isolation, cross-user write rejection, anonymous privacy, note redaction, invalid/revoked shares, restricted maintenance access; test data rolled back' as result;

