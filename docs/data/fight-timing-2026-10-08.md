# Fight timing — 2026-10-08

The fixed 30-minute-per-bout estimate has been replaced with a format/history/live-timing model on event pages and expanded sport-page details. This is a first working implementation, not a reliable live-data service for every card.

## Available behavior

- Uses known bout order, scheduled rounds, MMA/boxing round length, between-round breaks and configurable walkout/announcement turnaround.
- Reads the latest three public completed bouts per fighter through an invoker-security RPC. Duration, rounds fought and decision outcomes inform a duration fraction. Sparse history is blended with a conservative format prior; no history is invented.
- Displays uncertainty windows, the basis of the estimate and the number of usable results. An explicit provider-confirmed start remains anchored. Actual bout start/end timestamps can reanchor subsequent windows after stoppages or delays. Cancellation removes the bout's allotted duration.
- Main-card segment timing and the main event are distinguished when the source supplies segment information. Headliner-only/title-inferred data cannot reveal the missing undercard; those rows show timing unavailable instead of pretending the headliner starts at the card's official opening time.
- An open, visible combat-event page refreshes database details every 30 seconds. This is database refresh, not a promise that an upstream provider supplies data every 30 seconds. Polling stops after the overall event is finished.
- Users can opt into individual fight alerts on that device. In-page messages and, if the browser grants permission, browser notifications report an estimated ten-minute lead, a shift of at least 15 minutes, reported live status or cancellation. These work only while the panel is mounted; background email/push is not enabled. Estimates are labelled estimates.

## Data contract / remaining dependencies

Normalized bout metadata can contain `actual_start_at`, `actual_end_at`, `round_seconds`, `turnaround_minutes`, `card_segment`, `is_main_card`, `main_event`, `start_time_confirmed` and `completeness`. `est_start_window` is a forecast unless explicitly marked confirmed. Completed bout results can provide `duration_seconds`, `rounds_fought`, `finish_round` and `method`. These fields must come from attributable provider/official data, not guessed backfills.

Current database coverage contains 34 mostly title-inferred headliners and no usable completed-bout histories. The estimator is tested with controlled data but will deliberately show unavailable timing on incomplete real cards. The next API-Sports connection should be checked for MMA card coverage, complete bout order, rounds, recent results, actual duration, update latency and free-plan season limitations. Store the direct API-Sports key as `APISPORTS_KEY` in Supabase Edge Function secrets. No key was copied into client code and no new subscription was purchased.

Reliable background “your fight is next” alerts require a verified live-data adapter, server-side bout subscriptions/deduplication, delivery credentials and opt-in delivery testing. Existing notification delivery remains disabled; the new foreground selector is not presented as background delivery. Predictions also require calibration against actual completed cards before asserting accuracy.

Verification: 122 unit tests pass, including history influence, confirmed starts, early-finish adjustment, missing-card behavior and invalid durations. Desktop/mobile browser tests cover history-based estimates, explicit alert opt-in/persistence and a confirmed finish moving the next window. Rollback-only SQL tests confirm latest-three history selection and exclusion of private/older fights for anonymous readers. Full public frontend publication remains outside this task.
