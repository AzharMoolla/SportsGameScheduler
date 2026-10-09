# Restoration status — 2026-10-07

## 2026-10-08 hydration follow-up

The user authorized expanded hydration and recurring batches. The database now contains **9,012 public events, 7,231 upcoming**, and 1,342 TV channel listings for 202 events in 45 countries. All 41 public tables have RLS. Bounded current/future schedule, roster, broadcast, F1/esports, calendar-candidate and retention jobs are enabled; external fan notifications remain off. Lint, TypeScript, 117 unit tests, two viewing-country browser tests and ownership/share checks pass. Baseball (12 upcoming) and Olympic fixtures (0) still fail the strict coverage gate. Real-account lifecycle and full recovery remain unverified. See [review and source recommendations](data/hydration-backend-review-2026-10-08.md). Sections below describe the earlier restoration state unless explicitly updated.

## Completed

- New Supabase project `bgbkqxdsjnbsizwkslsr` verified ACTIVE_HEALTHY, region `ca-central-1`.
- Full schema restored: 40 tables, all with RLS. Snapshot function order corrected so `admin_overview` is created after `spotlight_ranked`. Original snapshots preserved.
- Curated configuration restored: 20 sports, 148 leagues, 84 provider targets, 73 watch providers, 68 watch rules, competition/spotlight configuration and one blog post. Provider sync timestamps reset for a fresh rebuild; affiliate URLs/status cleared and networks normalized to direct.
- Explicit table/function permissions restrict maintenance/admin RPCs to service role. Nine internal tables remain service-only.
- Share RPC now strips private event notes server-side when notes sharing is off.
- Public REST sports/spotlight requests passed. Transactional SQL checks passed for ownership isolation, cross-account write rejection, anonymous privacy, invalid/revoked shares, note redaction and restricted maintenance access; all test accounts/data rolled back.
- SportsDB and OpenF1 hydration functions deployed with JWT checks plus service-role-only request authorization. Public anon JWT requests returned 401 from both functions. Four focused authorization tests, TypeScript and lint passed.
- Local app and production Worker configuration now use the new project URL and matching publishable key.
- Cloudflare zone ownership/status confirmed active, with nameservers intact. `silbosports` Worker recreated; `silbosports.com` and `www.silbosports.com` custom domains enabled and certificate IDs assigned. Temporary restoration page uses 503/Retry-After/noindex; www/HTTP redirects to canonical HTTPS. Dry-run and deployment succeeded.

## First hydration and design refresh

- Cloudflare was resumed by the owner. Apex HTTPS responds with the restoration Worker (503), and www redirects to the canonical domain.
- SportsDB's initial active targets are all checkpointed. PandaScore returned 165 matches in five calls. OpenF1 meeting/session/driver data is linked to Formula 1 fixtures.
- Verified database totals: 2,426 public events, 1,270 upcoming events, 1,671 competitors; zero active SportsDB targets awaiting their first event pass and zero cron jobs.
- Repaired the OpenF1 14-hour candidate window, which could merge distinct sessions. Matching now uses a one-minute window. Rebuilt its 50 source links; SQL confirmed zero source/fixture start-time mismatches and zero duplicate public F1 start groups. Superseded restore-generated OpenF1 rows remain private for recovery rather than deleting fixture records.
- Manual hydration used an expiring, JWT-protected bootstrap with a random nonce held only in a temporary local file and its hash deployed server-side. It allowed only three named hydration functions, forwarding their server-side authorization. It is now retired (410) and its local nonce file deleted. All three hydrators reject anonymous credentials (401); SportsDB defaults to 20 paced calls per invocation.
- Removed stale World Cup live labels and internal provider/template copy from public spotlights. The finished 2026 World Cup promotion is inactive. Replayable copy updates are in supabase/snapshot/fan-facing-copy-2026.sql.
- Refreshed home/discovery, controls, search accessibility, navigation and motion. See docs/design-review/REFRESH.md and screenshots for the reviewable result and validation.

## Remaining blockers

1. The strict live-data gate still fails baseball's 100-upcoming minimum (currently 21) and Olympic detailed fixtures (zero). Several seasonal/secondary feeds also have no upcoming events. Do not fabricate fixtures or silently relax the release gate.
2. Supabase CLI's saved login still lacks new-account privileges. The connector restored data successfully; a new-account CLI login is needed for ongoing secret management and conventional maintenance invocations.
3. Auth redirects/login/sync, native calendar clients, alert delivery, recovery and public launch checks need end-to-end validation. The deployed calendar feed passed synthetic integration checks for selections, privacy, edits, cancellation and revocation. No notifications or scheduled jobs were enabled.
4. The 11 deleted old user accounts cannot be recovered from preserved snapshots. Premium/support payments have not been implemented.

## Security advisor findings

No missing-RLS table warning was found. Intentional service-only tables report informational no-policy notices. The share RPC is deliberately a SECURITY DEFINER capability endpoint so a valid enabled share token can read an otherwise private league; its guest/authenticated execution warnings remain expected and require maintaining token secrecy and server-side redaction. [Supabase remediation guidance](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable).

`pg_net` is installed in public by the historical snapshot and is not relocatable; the extension-schema warning remains recorded rather than dropping/recreating the extension opportunistically. [Extension-schema guidance](https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public).

## Cost controls

No paid plan or new paid service was added. Bounded refresh jobs were enabled on 2026-10-08 under the user's explicit instruction; see the follow-up review for limits and cadence. The previous invoice included the Pro subscription and per-project compute; invocation reductions alone do not remove those fixed charges. Preserve the new free-account choice. SportsDB uses a six-hour warm target TTL with oldest targets first and paced calls; the batch rotation means this is not a guaranteed six-hour per-league refresh. Player hydration has a ten-call budget. Never use the public anon key as the sole authorization for ingestion.

Source references: [Cloudflare custom domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/), [Supabase Data API access](https://supabase.com/docs/guides/api/securing-your-api).

## Design and workflow follow-up

See [the 2026-10-07 workflow audit](design-review/WORKFLOW-AUDIT.md) for evergreen soccer, sport colours, preserved motion, calendar fixes, community uploads, image licensing and current test evidence. Player hydration added 949 source rows in eight calls; current competitor total is 2,600. Database size is about 20 MB, with zero cron jobs. The frontend has not been pushed live.
# API-Sports hydration update — 2026-10-08

APISPORTS_KEY verified server-side across the twelve Free endpoints. Near-term import added 775 public events (477 upcoming at verification), with 810 linked source identities and 306 readable score records. Four bounded daily batches enabled for basketball, hockey, handball, American football, rugby and MMA; normal usage is 12 calls/day per endpoint. Current-season restrictions prevent Football/Baseball/F1/Volleyball season downloads; MMA only permits yesterday/today/tomorrow and returned no bouts in this window. No paid upgrade, background fan notifications or full frontend publication. See [access and safeguards](data/apisports-access-2026-10-08.md).

## 2026-10-09 owner-authorized public beta

The full application replaces the restoration Worker on silbosports.com. Cloudflare version `f50b57fa-0e79-46f7-8d04-94e13bfc244c`; normal production build and seasonal live-data verification pass. Baseball date-based API-Sports access is working and included in the existing bounded job; full-season queries remain restricted. Olympic fixtures are seasonal rather than a mandatory release count. Email/push fan delivery remains paused and Google sign-in is unavailable. Account deletion is now deployed and rejects anonymous callers; real-account and recovery checks remain open. See [release evidence and remaining checks](releases/2026-10-09.md). GitHub CI is resumed; no high-frequency Actions data monitor or cancelled Codex heartbeat is resumed.
