-- UTC; staggered to avoid overlapping outbound calls. Data jobs only, no fan notifications.
select cron.schedule('hydrate-current-schedules','5 */4 * * *', $job$select private.enqueue_hydration('provider-hydrate');$job$);
select cron.schedule('hydrate-published-future-seasons','35 1,9,17 * * *', $job$select private.enqueue_hydration('provider-hydrate','{"future":true}'::jsonb);$job$);
select cron.schedule('hydrate-individual-rosters','17 2 * * *', $job$select private.enqueue_hydration('provider-hydrate-players');$job$);
select cron.schedule('hydrate-event-tv-listings','27 3 * * *', $job$select private.enqueue_hydration('provider-hydrate-broadcasts');$job$);
select cron.schedule('hydrate-f1-sessions','47 4 * * *', $job$select private.enqueue_hydration('provider-hydrate-openf1');$job$);
select cron.schedule('hydrate-esports-matches','17 6,18 * * *', $job$select private.enqueue_hydration('provider-hydrate-pandascore');$job$);
select cron.schedule('review-calendar-feed-candidates','47 5 * * 1', $job$select private.enqueue_hydration('ics-feed-ingest','{"dryRun":true,"limit":4}'::jsonb);$job$);
-- Keep operational rows bounded without deleting public schedules or user data.
select cron.schedule('hydration-log-retention','47 7 * * *', $job$
  delete from public.provider_sync_runs where finished_at < now()-interval '30 days';
  delete from cron.job_run_details where end_time < now()-interval '14 days';
$job$);
