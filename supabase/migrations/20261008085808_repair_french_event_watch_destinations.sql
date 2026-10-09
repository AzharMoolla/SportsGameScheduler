-- Public broadcaster directory entry, not an account or paid connection.
insert into public.watch_providers(key,name,regions,sports,direct_url,is_active,notes)
values('ligue1_plus','Ligue 1+',array['FR'],array['soccer'],'https://ligue1.com/en/offres-ligue1plus',true,
  'Official destination verified 2026-10-08; event availability comes from country-specific TV listings, not this directory entry.')
on conflict(key) do update set name=excluded.name,regions=excluded.regions,sports=excluded.sports,direct_url=excluded.direct_url,is_active=true;

-- Reconcile verified stored listings without spending another upstream API call.
with channels as (
  select b.*,case
    when b.channel ~* '^Ligue 1\+ [0-9]+ FR$' then 'ligue1_plus'
    when b.channel ~* '^BeIn Sports (HD|Max) [0-9]+( France)?$' then 'bein_sports'
    when b.channel ~* '^Canal\+( Sport)? France$' then 'canal_plus'
  end provider from public.broadcasts b
  where b.country='FR' and b.source_key='thesportsdb' and b.last_checked_at>now()-interval '48 hours'
), destinations as (
  select distinct on(c.event_id,c.provider) c.event_id,c.provider,c.channel,p.direct_url,e.starts_at,c.last_checked_at
  from channels c join public.watch_providers p on p.key=c.provider and p.is_active
  join public.events e on e.id=c.event_id and e.visibility='public'
  where e.starts_at>=date_trunc('day',now()) and p.direct_url like 'https://%'
  order by c.event_id,c.provider,c.channel
)
insert into public.watch_links(rule_key,provider_key,label,event_id,country_codes,sport_keys,link_kind,url,source_confidence,priority,is_active,ends_at,notes)
select 'tv:'||event_id::text||':FR:'||provider,provider,channel,event_id,array['FR'],array[]::text[],
  'official',direct_url,'provider',1,true,date_trunc('day',starts_at)+interval '2 days',
  'Event-specific TheSportsDB TV listing; canonical French territory repaired 2026-10-08. Subscription and blackout restrictions remain provider-controlled.'
from destinations
on conflict(rule_key) do update set label=excluded.label,url=excluded.url,country_codes=excluded.country_codes,is_active=true,ends_at=excluded.ends_at,notes=excluded.notes;
