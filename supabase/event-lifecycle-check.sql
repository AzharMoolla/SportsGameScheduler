-- Rollback-only verification. No real events/accounts are retained or deleted.
begin;
do $test$
declare
  owner_id uuid := gen_random_uuid();
  sport uuid := (select id from public.sports limit 1);
  ordinary uuid := gen_random_uuid();
  saved uuid := gen_random_uuid();
  calendar_pick uuid := gen_random_uuid();
  underway uuid := gen_random_uuid();
  recent uuid := gen_random_uuid();
  private_event uuid := gen_random_uuid();
  manual_event uuid := gen_random_uuid();
  completion timestamptz;
begin
  insert into auth.users(id,email) values(owner_id,owner_id::text||'@lifecycle-test.invalid');
  insert into public.events(id,sport_id,provider_key,provider_event_id,title,status,starts_at,visibility,kind) values
    (ordinary,sport,'thesportsdb',ordinary::text,'Retention test','finished',now()-interval '100 days','public','match'),
    (saved,sport,'thesportsdb',saved::text,'Saved retention test','finished',now()-interval '100 days','public','match'),
    (calendar_pick,sport,'thesportsdb',calendar_pick::text,'Calendar retention test','finished',now()-interval '100 days','public','match'),
    (underway,sport,'thesportsdb',underway::text,'Live retention test','live',now()-interval '100 days','public','match'),
    (recent,sport,'thesportsdb',recent::text,'Completion test','live',now()-interval '4 hours','public','match'),
    (private_event,sport,'thesportsdb',private_event::text,'Private retention test','finished',now()-interval '100 days','private','match'),
    (manual_event,sport,'manual',manual_event::text,'Manual retention test','finished',now()-interval '100 days','public','match');
  insert into public.user_follows(user_id,target_type,target_id,intent) values(owner_id,'event',saved,'watch');
  insert into public.calendar_feeds(user_id,name,token,filters,is_active,timezone)
    values(owner_id,'Retention test',gen_random_uuid()::text,jsonb_build_object('eventIds',jsonb_build_array(calendar_pick::text)),true,'UTC');
  update public.events set status='finished' where id=recent;
  select completed_at into completion from public.events where id=recent;
  if completion is null or completion < now()-interval '1 minute' then raise exception 'Completion transition not stamped'; end if;
  update public.events set metadata='{"result":{"home_score":0,"away_score":2}}' where id=recent;
  if (select completed_at from public.events where id=recent) is distinct from completion then raise exception 'Score correction restarted visibility window'; end if;
  perform public.cleanup_past_events();
  if exists(select 1 from public.events where id=ordinary) then raise exception 'Expired unreferenced event not deleted'; end if;
  if (select count(*) from public.events where id=any(array[saved,calendar_pick,underway,recent,private_event,manual_event])) <> 6 then
    raise exception 'Protected event deleted';
  end if;
  if has_function_privilege('anon','public.cleanup_past_events(interval)','execute') or
     has_function_privilege('authenticated','public.cleanup_past_events(interval)','execute') then raise exception 'Cleanup publicly executable'; end if;
end;
$test$;
rollback;
select 'Completion, correction, retention and reference protection checks passed' as verification;
