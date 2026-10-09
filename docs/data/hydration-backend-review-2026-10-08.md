# Schedule hydration and backend review — 2026-10-08

Scope: live Supabase project `bgbkqxdsjnbsizwkslsr` in Canada Central and the local frontend. The user authorized expanded hydration, recurring batches, broadcast coverage and a backend review. No new paid subscription, outbound fan notification or full frontend publication was performed.

## Database result

Public fixtures increased from **2,426 to 9,012** (+6,586). Upcoming public fixtures increased from **1,262 to 7,231** (+5,969). Counts use `visibility = 'public'` and `starts_at >= now()` at approximately 05:00 UTC; other readiness scripts may include additional visibility states. Database size is approximately 31.2 MB. There are 2,691 competitors. No duplicate provider/event identity pairs or public fixtures missing title/sport were found.

The primary fault was stale season configuration: NBA, NHL and European football targets still referenced 2025/26. Current-season configuration is corrected, and separately tracked future-season probes no longer overwrite the current season. All 69 active SportsDB targets have fresh current cursors at review time. All 68 eligible future targets were checked; Rugby World Cup already uses 2027 and has no next-season probe.

| Sport | Upcoming public fixtures | Furthest published date in database |
| --- | ---: | --- |
| Soccer | 3,481 | 2027-05-30 |
| Basketball | 1,312 | 2027-04-05 |
| Hockey | 1,289 | 2027-04-11 |
| Handball | 285 | 2027-06-06 |
| Motorsport | 252 | 2027-12-12 |
| American football | 223 | 2027-02-14 |
| Esports | 158 | 2026-10-26 |
| Golf | 123 | 2027-11-14 |
| Rugby | 51 | 2027-10-17 |
| Combat sports | 25 | 2026-12-29 |
| Baseball | 12 | 2026-10-12 |
| Cycling | 11 | 2026-10-18 |
| Darts | 6 | 2026-10-18 |
| Snooker | 3 | 2026-10-20 |
| Tennis | 0 | No upcoming fixtures |
| Athletics | 0 | No upcoming fixtures |
| Cricket | 0 | No upcoming fixtures |
| Volleyball | 0 | No upcoming fixtures |
| Olympic sports | 0 | No detailed upcoming fixtures |
| Custom leagues | 0 | User-created data; not an ingestion feed |

Dates indicate the furthest available record, not complete coverage through that date. Some tournament records have dates without confirmed session times. Missing fixtures are not fabricated. The strict live-data gate still fails baseball (12 versus 100 required) and Olympic detailed fixtures (0 versus 1 required).

## Active timers and cost controls

Eight database cron jobs are enabled. These run server-side independently of the desktop app. Times below are UTC.

| Job | Cadence | Provider-call ceiling per batch |
| --- | --- | ---: |
| Current schedules | Every four hours at :05 | 20 |
| Published future seasons | 01:35, 09:35, 17:35 daily | 20 |
| Individual-player rosters | 02:17 daily | 10 |
| Next eight days of TV listings | 03:27 daily | 8 |
| OpenF1 sessions | 04:47 daily | 6 |
| PandaScore upcoming matches | 06:17, 18:17 daily | 5 |
| Calendar candidates, dry run | Mondays 05:47 | Four feeds |
| Operational log retention | 07:47 daily | No provider calls |

SportsDB requests are paced at least 2.1 seconds apart. Warm target TTL is six hours, full-season TTL is longer, and future-season TTL is seven days. The four-hour batch cadence is not a four-hour per-league SLA: 69 targets share a 20-call batch, and cold targets may require multiple calls. Oldest-target selection rotates coverage. Future-season batches return quickly when all targets are fresh.

Maximum ordinary daily HTTP provider calls are approximately 214, before TTL savings, retries or calendar probes. SportsDB accounts for at most 198 of those ordinary calls. The dispatcher also caps SportsDB schedule batches at 12 per UTC day, PandaScore at four, and other workers at two; this bounds manual catch-up plus cron. Initial catch-up used ten schedule batches, so later batches on the same UTC day may legitimately hit the daily cap. No paid infrastructure plan was enabled.

The dispatcher uses randomly generated, single-use tickets in a service-only RLS table, atomically claims them, expires unclaimed tickets after ten minutes, rejects overlap within the bounded execution window, and forwards server credentials internally. Cron contains no permanent credential. Worker budgets cannot be increased by an oversized request. SportsDB work stops near the function deadline and records rate-limit/budget stops. Completed sync logs are retained 30 days, dispatch/cron logs 14 days; event/account records are not deleted by these jobs.

A daily Codex heartbeat, `sports-data-coverage-and-source-review`, checks failures, coverage and source opportunities. It stays quiet on healthy unchanged runs and reports meaningful changes or required credentials. It does not duplicate the database jobs or subscribe to services.

## Sources checked and remaining coverage

Connected sources: TheSportsDB premium, PandaScore schedules and OpenF1. Full-season rather than next-20-only fetching supplied most of the expanded coverage. Existing individual rosters were refreshed. Provider keys remain server-side.

Four existing snooker/rugby calendar candidates parsed **847 total entries** in dry-run mode. These include past dates and are not 847 new upcoming events. They remain quarantined until redistribution/attribution and timestamp semantics are established.

Supplementary probes included World Athletics, TFRRS, OpenTrack, Cricsheet, Openfootball and Sportsdataverse. Successful HTTP responses do not establish future schedule coverage or permission to redistribute. TFRRS/Cricsheet primarily returned results/historical or identity data. The queried World Cup dataset contains finished 2026 matches. OpenTrack needs a documented connection/export arrangement. ATP's published 2027 calendar PDF could not be fetched reliably during this review; no placeholder dates were imported.

The MLB public endpoint exposed a large 2027 schedule, including TBD times, but **was not bulk-imported**. Its [copyright notice](https://gdx.mlb.com/components/copyright.txt) restricts bulk/non-individual reuse without permission. A licensed affordable provider or written permission is the appropriate route.

Suggested additional connections, prices checked 2026-10-08:

| Priority | Source | Cost / scope | Action needed |
| --- | --- | --- | --- |
| 1 | [API-Baseball](https://api-sports.io/sports/baseball) | Free 100 requests/day; monthly PRO displayed as 15.00, 7,500/day; MLB/NPB/KBO and other leagues | Server API-Sports key; confirm currency, current-season access and actual league/date coverage before choosing a plan |
| 2 | [Sportmonks Cricket](https://www.sportmonks.com/cricket-api/) | €29/month, 26 leagues, excluding VAT; 14-day trial | Server token and verify required competitions |
| 3 | [API Tennis](https://api-tennis.com/) | Starter $40/month, 8,000 requests/day, 14-day trial | Server token; inspect fixture horizon, ATP/WTA/ITF coverage and reuse terms |
| 4 | [football-data.org](https://www.football-data.org/pricing) | Free 12 competitions, 10 requests/minute; delayed results | Free server key; useful independent soccer schedule fallback |
| 5 | [API-Football](https://www.api-football.com/pricing) | Free 100/day with season restrictions; $19/month PRO | Optional wider soccer coverage; current connected soccer coverage makes this lower priority |

[API-Sports volleyball](https://api-sports.io/sports/volleyball) is another candidate for the existing missing volleyball coverage; confirm available seasons with a key before selecting a tier. [OpenLigaDB](https://github.com/OpenLigaDB/OpenLigaDB-Samples) can supplement German competitions, subject to dataset reuse/attribution verification. [Snooker.org](https://api.snooker.org/) states noncommercial free use; obtain appropriate permission before relying on it for a commercial product. No enterprise betting feed is required for these proposed steps.

## Where-to-watch result

Imported **1,342 channel listings for 202 existing events in 45 countries**, plus **59 event-specific provider destinations** where a known broadcaster could be matched. Unknown channel names remain plain listings rather than invented stream links. Listings have a source and last-checked timestamp; SportsDB listings older than 48 hours are hidden. Event provider links expire after their listing window. This is useful coverage but still a small portion of the 7,231 upcoming fixtures, and mostly within the next eight days.

Changes implemented locally:

- Registered-profile read/write now includes viewing country and region preferences. Real authenticated account persistence still needs end-to-end validation.
- Event details use the selected viewing country, including when it differs from home country/timezone. Channel country names are normalized to ISO codes; unrecognized territories are skipped.
- Event listings, league suggestions and general directories are differentiated. Missing coverage no longer substitutes an unrelated sport or country. HTTPS-only links reject embedded credentials and unsafe schemes.
- Fixed Sportsnet+, NOW Sports and Sky Italia destinations in code and database. Updated France Ligue 1+, US NBA, UEFA territory rules, NHL international territories and US UFC/Paramount+ routing using current official sources.
- Watch reads share a five-minute cache, batch 50 events per request and paginate results so a growing global listing inventory does not hide an event behind an arbitrary row limit. Unchanged hydrated event hashes avoid rewriting participants and bouts.

Destination audit: **111 checked, 107 reachable, zero confirmed 404/410 destinations**. Three destinations returned access-blocked responses and Showmax remained network-unverified; four require browser follow-up. A reachable provider page does not prove an event is carried, the subscription is sufficient or a blackout is absent. See [raw audit](watch-destination-audit-2026-10-08.json).

Country-level overseas viewing is supported where listings/catalog rules exist. Postcode-based local affiliates, cable-provider lineups, home-market/away-game blackouts, travel rights, subscription entitlements and last-minute programming changes are **not** fully modeled. Accurate local channel numbers require a territory-specific EPG/lineup feed and, where relevant, consented postcode/provider selection. These cannot be inferred reliably from timezone or team home/away designation alone.

Current official references: [NBA 2026/27 schedule and broadcast information](https://pr.nba.com/2026-27-nba-regular-season-schedule/), [UEFA territorial partners](https://www.uefa.com/uefachampionsleague/news/0253-0d82037aaedd-f371c464f919-1000--where-to-watch-the-champions-league-tv-broadcast-partners-streams/), [NHL watch guide](https://www.nhl.com/info/how-to-watch-and-stream-nhl-games), [Ligue 1+](https://ligue1.com/en/offres-ligue1plus), [UFC Paramount agreement](https://www.ufc.com/news/paramount-and-tko-announce-historic-ufc-media-rights-agreement), [MLB blackout explanation](https://support.mlb.com/s/article/MLB-TV-Game-Availability?language=en_US).

## Security, efficiency and logic verification

- All **41 public tables** have RLS. Maintenance tickets have no public policies/grants and are deliberately service-only.
- Anonymous calls to schedule, broadcast and calendar ingestion are rejected; a fabricated dispatcher ticket is rejected (HTTP 401). All maintenance workers verify JWT and service-role authority. The dispatcher deliberately uses ticket validation rather than public JWT authorization.
- Transactional ownership/share tests passed: cross-user writes rejected, anonymous profiles private, private leagues protected, share notes redacted, invalid/revoked share tokens rejected and internal RPC grants restricted.
- API-key values are redacted from SportsDB error strings before persisting or returning them.
- No security-advisor errors. Remaining findings: intentional deny-all internal-table INFO notices, a nonrelocatable `pg_net` extension in public, and the intentionally token-gated SECURITY DEFINER share RPC. Maintain share-token secrecy and redaction. These findings were not hidden or fixed by deleting functionality.
- Performance advisor reports unused-index INFO findings on this young database; no index was removed solely for low recent usage. Bulk unchanged-row freshness updates, roster/event batching, cache expiry, overlap protection and operational retention reduce unnecessary work.
- TypeScript and lint passed; **117 unit tests in 22 files** passed. Desktop and mobile browser tests passed for viewing-country overrides without US broadcaster fallback. Deno checks passed for all changed/new hydration workers and dispatcher.

This is a focused backend review, not a complete penetration test or public-launch certification. Full authenticated login/deletion, notification delivery, recovery drills and production UX checks remain incomplete. The Supabase free project does not provide the paid plans' automatic backups; schema/config snapshots alone are not a tested user-data recovery strategy. See [Supabase backups guidance](https://supabase.com/docs/guides/platform/backups).

Backend functions/migrations and timers are deployed. Frontend watch improvements are local and reviewable; the full site was not republished. Existing art and unrelated workspace changes were preserved.
## Heartbeat review — 08:51–08:59 UTC

Checked only Silbo Hosting project `bgbkqxdsjnbsizwkslsr`. The 06:17 esports, 06:57 API-Sports and 08:05 SportsDB batches succeeded; no cron failures or active-target errors at review. API-Sports replay fetched 811 records with zero changes or duplicate inserts. SportsDB updated 459 existing records, mainly older completed results; this is not 459 new upcoming events. All 69 SportsDB targets have next-event checks from the last five hours. Supplemental targets with null sync timestamps remain coverage candidates, not healthy connected feeds.

Current public inventory: 9,787 events, 7,700 upcoming and 826 score records. Upcoming counts by canonical sport: soccer 3,481; hockey 1,509; basketball 1,455; handball 371; American football 229; motorsport 252; esports 152; golf 123; rugby 71; combat 25; baseball 12; cycling 11; darts 6; snooker 3. Tennis, athletics, cricket, volleyball and Olympic sports remain at zero. Horizons: soccer May 2027, hockey April 2027, basketball April 2027, handball June 2027, football February 2027, rugby October 2027, motorsport December 2027, golf November 2027; esports October 26, combat December 29, baseball October 12, cycling/darts October 18, snooker October 20 (2026 for those shorter horizons). These horizons were observed, not independently validated against every official competition.

The 12 SportsDB schedule batches/day cap is already reached because of today's initial catch-up. Later scheduled calls today may report that cap; do not retry or bypass it. Tomorrow's normal rotation can resume. API-Sports has its separate four scheduled batches (normally 12 calls/day per enabled endpoint); combined ordinary provider-call ceiling is approximately 286/day, subject to TTL savings. See [API-Sports access report](apisports-access-2026-10-08.md) for plan restrictions.

Found and fixed a regional broadcast defect: scanning Intl/CLDR territories let retired FX and YU aliases overwrite France/Serbia name mappings. Repaired 98 existing listings (52 French, 46 Serbian; Serbian channel names explicitly identified RS/Serbia), skipped ambiguous retired territories going forward, and deployed the corrected TV worker. Country-qualified/HD/Max numbered channels now match only their known broadcaster in the selected country. Added the missing Ligue 1+ directory record using its [official destination](https://ligue1.com/en/offres-ligue1plus), then reconciled stored French listings without extra provider calls: **36 French event-specific destinations** are now available. No claim of subscription/blackout entitlement.

One bounded TV refresh used the remaining allowed TV batch (eight provider calls). Inventory increased from 1,342 listings / 202 events / 45 countries to **1,473 listings / 210 events / 46 countries**. Latest checks are fresh; zero SportsDB listings older than 48 hours, zero active expired watch links and zero unsafe configured link schemes at review. The prior audit's four access/network-unverified destinations still require follow-up; this heartbeat did not re-test all external endpoints. No duplicate schedules added, fan notifications sent, purchases made, secrets exposed or frontend published.

Official calendar research: [Volleyball World's personal ECAL sync](https://support.volleyballworld.com/hc/en-us/articles/25650979049628-What-is-ECAL) and its [official calendar](https://calendar.volleyballworld.com/) are documented fan-facing options, but no reusable anonymous ICS feed or redistribution permission was established. Do not connect a fan's calendar account to extract a feed. ATP's indexed [2027 calendar PDF](https://www.atptour.com/-/media/files/calendar-pdfs/2026/2027-atp-tour-calendar-14-january-2026-updated.pdf) still returned 403; no workaround or invented dates. Existing ICS candidates remain quarantined pending their terms/timestamp review.

Verification: live repaired-country counts, zero remaining FX/YU listings from this hydrator, successful refresh, 36 French event links, country/numbered-channel regression tests, 123 unit tests, desktop/mobile viewing-country checks, lint, TypeScript and Deno checks. No complete public-launch gate pass is implied; existing launch blockers remain.

## Heartbeat review — 12:55 UTC

No new fixture or broadcast imports since the preceding review. All sport horizons unchanged; upcoming counts fell naturally as start times passed (esports 138, baseball 11, hockey 1,506, basketball 1,447). Existing zero-coverage sports remain unresolved. TV inventory remains 1,473 listings across 210 events, with no stale 48-hour listings or expired active destinations. The French/Serbian mapping repair remains in effect.

09:35 future-season and 12:05 current-schedule cron entries report the already documented daily batch cap. This is the expected consequence of today's catch-up, not a new credential/feed outage; no retry, cap bypass or schedule change. No active target errors or targets stale beyond 24 hours. API-Sports remains scheduled at :57 every six hours; this review preceded its 12:57 batch. No further external calendar requests or imports while the previously recorded permission/access limitations remain. No additional user notification for this unchanged state.

## Heartbeat review — 16:58 UTC

The 12:57 API-Sports batch succeeded: 811 records fetched, no new events, 18 existing basketball/hockey records updated, and readable score inventory rose from 826 to 838. Public event count remains 9,787. Every sport's horizon is unchanged; reduced upcoming counts reflect elapsed start times (basketball 1,424, hockey 1,485, handball 363, esports 113; baseball still 11). No active provider/source errors or SportsDB next-event targets stale beyond 24 hours. The 16:05 SportsDB cron rejection is the same previously reported daily-cap stop; no retry or bypass.

TV coverage remains 1,473 listings for 210 events in 46 countries. No stale 48-hour listings, active expired watch links or unsafe destination URLs; French/Serbian canonical codes and 36 French event links remain intact. API-Sports has substantial provider-reported quota headroom. Existing calendar candidates remain dry-run only under the documented source/rights limitations; no unverified imports, additional providers or schedules. Routine status/result changes do not warrant another user alert.
