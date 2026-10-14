-- Manual, replayable snapshot import. No API key, provider requests or cron.
-- Fill the snapshot marker below with the reviewed factual JSON.
begin;
do $import$
declare
  snapshot jsonb := $snapshot$__CITO_SNAPSHOT__$snapshot$::jsonb;
  card jsonb; bout jsonb; fighter jsonb; current_event record;
  competitor_id uuid; red_id uuid; blue_id uuid; bout_id uuid; existing_count integer;
  bout_metadata jsonb;
begin
  if jsonb_array_length(snapshot->'cards') <> 6 then raise exception 'Expected six reviewed cards'; end if;
  for card in select value from jsonb_array_elements(snapshot->'cards') loop
    select e.* into strict current_event from public.events e join public.leagues l on l.id=e.league_id
      where e.id=(card->>'event_id')::uuid and e.visibility='public' and e.custom_league_id is null
        and l.name='UFC' and e.status='scheduled' for update of e;
    if abs(extract(epoch from (current_event.starts_at-(card->>'main_card_starts_at')::timestamptz)))>172800
      then raise exception 'Schedule match exceeds reviewed window'; end if;
    update public.events set starts_at=(card->>'main_card_starts_at')::timestamptz,
      timezone=coalesce(nullif(card->>'timezone',''),timezone),last_checked_at=(snapshot->>'fetched_at')::timestamptz,
      metadata=metadata || jsonb_build_object('cito',jsonb_build_object('id',card->>'source_id','slug',card->>'slug',
        'source_url',card->>'source_url','checked_at',snapshot->>'fetched_at','main_card_starts_at',card->>'main_card_starts_at',
        'venue',card->>'venue','announced_bouts',jsonb_array_length(card->'bouts'),'running_order_confirmed',false),
        'schedule_time_kind','main_card','discipline','mma'),
      version=version+case when starts_at is distinct from (card->>'main_card_starts_at')::timestamptz then 1 else 0 end,
      updated_at=case when starts_at is distinct from (card->>'main_card_starts_at')::timestamptz then now() else updated_at end
      where id=current_event.id;
    insert into public.event_external_ids(event_id,provider_key,external_id,source_confidence,match_confidence,last_seen_at,metadata)
      values(current_event.id,'cito',card->>'source_id','provider',100,(snapshot->>'fetched_at')::timestamptz,
        jsonb_build_object('slug',card->>'slug','source_url',card->>'source_url','match_basis','reviewed_card_and_headliners'))
      on conflict(provider_key,external_id) do update set last_seen_at=excluded.last_seen_at,metadata=excluded.metadata
        where event_external_ids.event_id=excluded.event_id;
    for bout in select value from jsonb_array_elements(card->'bouts') loop
      red_id:=null; blue_id:=null;
      for fighter in select value from jsonb_array_elements(bout->'fighters') loop
        competitor_id:=null;
        if fighter->>'existing_id' is not null then
          select id into strict competitor_id from public.competitors where id=(fighter->>'existing_id')::uuid
            and sport_id=current_event.sport_id and kind='person';
        else
          select count(*) into existing_count from public.competitors where sport_id=current_event.sport_id
            and kind='person' and (theme->>'cito_fighter_id'=fighter->>'source_id' or
              (provider_key='cito' and provider_competitor_id=fighter->>'source_id') or lower(name)=lower(fighter->>'name'));
          if existing_count>1 then raise exception 'Ambiguous fighter identity: %',fighter->>'name'; end if;
          select id into competitor_id from public.competitors where sport_id=current_event.sport_id
            and kind='person' and (theme->>'cito_fighter_id'=fighter->>'source_id' or
              (provider_key='cito' and provider_competitor_id=fighter->>'source_id') or lower(name)=lower(fighter->>'name'));
        end if;
        if competitor_id is null then
          insert into public.competitors(sport_id,league_id,kind,name,country,provider_key,provider_competitor_id,theme)
            values(current_event.sport_id,current_event.league_id,'person',fighter->>'name',fighter->>'country','cito',fighter->>'source_id',
              jsonb_build_object('cito_fighter_id',fighter->>'source_id','cito_slug',fighter->>'slug')) returning id into competitor_id;
        else
          update public.competitors set name=fighter->>'name',theme=coalesce(theme,'{}') ||
            jsonb_build_object('cito_fighter_id',fighter->>'source_id','cito_slug',fighter->>'slug') where id=competitor_id;
        end if;
        insert into public.event_competitors(event_id,competitor_id,role) values(current_event.id,competitor_id,'participant')
          on conflict on constraint event_competitors_event_id_competitor_id_key do nothing;
        if fighter->>'corner'='red' then red_id:=competitor_id;
        elsif fighter->>'corner'='blue' then blue_id:=competitor_id;
        else raise exception 'Unknown corner'; end if;
      end loop;
      if red_id is null or blue_id is null or red_id=blue_id then raise exception 'Incomplete bout'; end if;
      bout_metadata:=jsonb_build_object('source','cito','cito_bout_id',bout->>'source_id','source_url',card->>'source_url'||'/bouts',
        'checked_at',snapshot->>'fetched_at','provider_display_order',bout->'display_order','provider_card_section',bout->>'card_section',
        'provider_card_position',bout->>'card_position','running_order_confirmed',false,'completeness','announced_card_partial',
        'main_event',bout->>'existing_bout_id' is not null);
      bout_id:=null;
      if bout->>'existing_bout_id' is not null then bout_id:=(bout->>'existing_bout_id')::uuid;
      else select id into bout_id from public.event_bouts where event_id=current_event.id and
        (metadata->>'cito_bout_id'=bout->>'source_id' or
          (red_corner_competitor_id in(red_id,blue_id) and blue_corner_competitor_id in(red_id,blue_id))) limit 1;
      end if;
      if bout_id is null then
        insert into public.event_bouts(event_id,red_corner_competitor_id,blue_corner_competitor_id,bout_order,scheduled_rounds,status,metadata)
          values(current_event.id,red_id,blue_id,null,null,bout->>'status',bout_metadata);
      else
        update public.event_bouts set red_corner_competitor_id=red_id,blue_corner_competitor_id=blue_id,
          bout_order=null,status=bout->>'status',metadata=(metadata-'source'-'completeness')||bout_metadata,updated_at=now()
          where id=bout_id and event_id=current_event.id and status not in ('finished','live');
        if not found then raise exception 'Existing bout changed during import'; end if;
      end if;
    end loop;
    insert into public.provider_event_sources(event_id,provider_key,external_id,sport_key,normalized_title,starts_at,status,
      source_confidence,match_confidence,raw_payload,metadata,last_seen_at)
      values(current_event.id,'cito',card->>'source_id','combat_sports',lower(current_event.title),
        (card->>'main_card_starts_at')::timestamptz,'scheduled','provider',100,card,
        jsonb_build_object('source_url',card->>'source_url','batch','manual-2026-10-14'),(snapshot->>'fetched_at')::timestamptz)
      on conflict(provider_key,external_id) do update set raw_payload=excluded.raw_payload,last_seen_at=excluded.last_seen_at,
        starts_at=excluded.starts_at,metadata=excluded.metadata where provider_event_sources.event_id=excluded.event_id;
  end loop;
end $import$;
commit;
