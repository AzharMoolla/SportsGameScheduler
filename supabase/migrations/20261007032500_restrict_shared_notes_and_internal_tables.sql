
CREATE OR REPLACE FUNCTION public.get_shared_league(share_token text)
RETURNS TABLE(id uuid, name text, timezone text, location text, sport_key text, include_notes_in_share boolean, payload jsonb)
LANGUAGE sql SECURITY DEFINER SET search_path TO 'public'
AS $function$
 select l.id, l.name, l.timezone, l.location,
 coalesce((select s.key from public.sports s where s.id=l.sport_id),l.payload->>'sportKey','custom'),
 l.include_notes_in_share,
 case when l.include_notes_in_share then l.payload
 else jsonb_set(l.payload - 'notes', '{events}',
   coalesce((select jsonb_agg(item - 'notes' order by ord)
    from jsonb_array_elements(case when jsonb_typeof(l.payload->'events')='array' then l.payload->'events' else '[]'::jsonb end)
    with ordinality as events(item,ord)), '[]'::jsonb))
 end
 from public.custom_leagues l where l.public_token=share_token and l.share_enabled=true;
$function$;
revoke all on function public.get_shared_league(text) from PUBLIC;
grant execute on function public.get_shared_league(text) to anon,authenticated,service_role;
-- These tables intentionally have no browser RLS policies; keep them service-only.
revoke all on public.competition_instance_sources,public.competitor_aliases,
 public.event_external_ids,public.event_status_history,public.provider_event_sources,
 public.provider_sync_runs,public.provider_targets,public.source_providers,public.source_targets
 from anon,authenticated;

