# API-Sports connection and bounded hydration — 2026-10-08

The server-side APISPORTS_KEY works on all 12 subscribed hosts. Each status response reports an active Free plan with a separate 100-request daily limit. No key or account identity is exposed to the frontend or operational reports.

The quota does not grant unrestricted current-season schedules. Current-season probes for Football, Baseball, Formula 1 and Volleyball returned HTTP 200 with a plan error allowing seasons 2022–2024. They are not scheduled for repeated denied requests. AFL returned no games on today's date. The separate NBA endpoint returned eight games, but the general basketball endpoint also covers NBA; using both would spend quota on duplicate coverage.

MMA rejected dates outside yesterday/today/tomorrow and returned no fights inside the permitted 2026-10-07 through 2026-10-09 window. This plan cannot supply distant fight cards or fighters' older results. MMA source records are staged when available; canonical fight-card grouping and bout order still require a nonempty response to verify. No bout order, fight time or fighter history is invented. This worker does not enable fan notifications or prove that live timing works.

The first permitted-date import fetched 811 records: 775 new public events, 35 records linked to existing events, and one American-football record retained as source evidence because required fields were missing. It updated 14 existing events. New events by sport: basketball 291, hockey 305, handball 150, American football 9, rugby 20. At verification, 477 of the new events were still upcoming. These are near-term additions, not full-season coverage.

The replay created zero events. A database JSONB key-order difference initially caused unnecessary result writes; value comparison now prevents that, and a cached replay made zero updates before the final result-field schema correction. Final results use the existing home_score/away_score/home_team/away_team schema. The shared normalizer has a cross-layer test proving imported scores render correctly, including a zero score.

## Recurring work and safeguards

- `hydrate-apisports-near-term`: 00:57, 06:57, 12:57 and 18:57 UTC (Toronto currently 20:57 previous day, 02:57, 08:57 and 14:57). Each batch queries yesterday/today/tomorrow for basketball, handball, hockey, American football, rugby and MMA. Normally 72 HTTP calls/day total, 12 per endpoint; 100 seconds maximum batch work plus bounded network timeouts.
- The service-only reservation RPC atomically reserves before sending a request, caps recorded calls at 80 per endpoint per UTC day, and stops when the provider-reported remaining quota reaches 20. Reservations are not refunded on failures. Initial diagnostics were conservatively counted. The dispatcher permits at most eight API-Sports batches/day, including manual/cached work. The shared dispatcher prevents overlapping hydration jobs.
- Matching requires a stable provider identity, or a unique same-sport, same-league, same-normalized-title event within ten minutes. Ambiguous matches remain staged. Manual/private/custom events are excluded. A truncated candidate window stops rather than inserting duplicates.
- Provider identities are namespaced by endpoint. New data uses canonical sports. Finished events cannot regress to scheduled/live from a delayed snapshot. Results preserve zero scores; unknown scores remain unknown. Logos are not imported without media-rights review.
- Source provenance links are stored in event_external_ids and provider_event_sources. Normal 90-day event cleanup and saved/calendar protections apply because the provider key is `apisports`. Daily source cleanup only removes old unlinked evidence; quota rows are retained 30 days.
- JWT and service-role checks protect the worker. Anonymous and authenticated users cannot reserve quota or access its ledger. The diagnostic worker remains manual, with its existing two-batch daily cap.

Verification: live ingestion, duplicate query (zero exact duplicate sport/league/title/time groups), replay with zero new events, 810 source identity links, 306 readable score records, quota boundary/headroom rollback checks, Deno checks and four normalizer tests; 123 frontend unit tests, lint, TypeScript and desktop/mobile event-result browser checks passed. No paid upgrades or additional providers were connected. Longer-season, baseball and volleyball gaps remain; broader MMA history needs a plan/source with historical and future access.

## 2026-10-09 correction: baseball date queries

The original season probe was too broad a basis for excluding baseball. Full-season 2026 queries are denied, but today's and tomorrow's date queries returned 15 and 16 games. The existing near-term worker now includes baseball, with the same atomic quota and headroom. First batch imported 34 records from yesterday/today/tomorrow, 24 still upcoming. Four ordinary batches use 12 calls/day per endpoint, 84 calls across seven endpoints. Nine MMA records for October 10 are staged; canonical card grouping/history still needs verification. See [release evidence](../releases/2026-10-09.md).
