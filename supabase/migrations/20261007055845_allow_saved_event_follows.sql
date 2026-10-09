alter table public.user_follows drop constraint user_follows_target_type_check;
alter table public.user_follows add constraint user_follows_target_type_check check (target_type in ('sport','league','team','competitor','player','event','custom_league'));
