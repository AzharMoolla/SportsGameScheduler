-- Repair this hydrator's CLDR alias collision. Channel identity confirms Serbia;
-- historical Yugoslav listings without that evidence are deliberately untouched.
update public.broadcasts b set country='FR'
where b.source_key='thesportsdb' and b.country='FX'
  and not exists(select 1 from public.broadcasts canonical where canonical.event_id=b.event_id and canonical.channel=b.channel and canonical.country='FR');
update public.broadcasts b set country='RS'
where b.source_key='thesportsdb' and b.country='YU' and (b.channel ~ ' RS$' or b.channel ilike '%Serbia%')
  and not exists(select 1 from public.broadcasts canonical where canonical.event_id=b.event_id and canonical.channel=b.channel and canonical.country='RS');
