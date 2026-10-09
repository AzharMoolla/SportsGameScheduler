begin;
update spotlight_events set label='Explore';
update spotlight_events set title='Soccer around the world',detail='Find club matches and international football in your time.' where title='FIFA World Cup 2026';
update spotlight_events set detail=case
when title='WNBA schedule tracking' then 'Find your teams and their next tip-off.'
when title='NHL and world hockey nights' then 'Find your next puck drop, from club hockey to international tournaments.'
when title='MLB and global baseball' then 'Follow baseball at home and around the world.'
when title='Cricket league windows' then 'Explore leagues, teams, and cricket calendars.'
when title='Rugby tournament path' then 'Find rugby leagues and international competitions.'
when title='Volleyball Nations League' then 'Explore international volleyball.'
when title='Cycling race calendars' then 'Explore road cycling and tour calendars.'
when title='Major golf weekend board' then 'Follow tournaments and plan your golf weekend.'
when title='Olympic sports capsule' then 'Discover Olympic sports and competition calendars.'
else detail end;
update competition_instances set is_active=false where official_name='FIFA World Cup 2026';
update competition_instances set label='Explore', detail=case
when official_name='UEFA Champions League' then 'Find European club football and follow your next match.'
when official_name='NHL preseason' then 'Find your team and the next puck drop.'
when official_name='MLB regular season' then 'Follow baseball and keep game times close.'
when official_name='Formula 1 race weekends' then 'Practice, sprint, qualifying, and race times for your weekend.'
when official_name='UFC and PFL fight cards' then 'Find upcoming fight cards and follow the headline bouts.'
else detail end;
commit;

