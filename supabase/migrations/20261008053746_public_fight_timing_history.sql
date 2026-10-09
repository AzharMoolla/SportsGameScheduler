-- Invoker security preserves public-event RLS; only the most recent three
-- completed bouts per requested fighter are returned, with at most 40 fighters.
create or replace function public.fight_timing_history(fighter_ids uuid[])
returns table(fighter_id uuid,scheduled_rounds integer,result jsonb,metadata jsonb,starts_at timestamptz)
language sql stable security invoker set search_path='' as $$
  select fighter_id,scheduled_rounds,result,metadata,starts_at from (
    select corner.fighter_id,b.scheduled_rounds,b.result,b.metadata,e.starts_at,
      row_number() over(partition by corner.fighter_id order by e.starts_at desc,b.id) rank
    from public.event_bouts b join public.events e on e.id=b.event_id
    cross join lateral(values(b.red_corner_competitor_id),(b.blue_corner_competitor_id)) corner(fighter_id)
    where cardinality(fighter_ids)<=40 and corner.fighter_id=any(fighter_ids)
      and e.visibility='public' and b.status='finished' and e.starts_at<now()
  ) ranked where rank<=3;
$$;
revoke all on function public.fight_timing_history(uuid[]) from public;
grant execute on function public.fight_timing_history(uuid[]) to anon,authenticated,service_role;
notify pgrst,'reload schema';
