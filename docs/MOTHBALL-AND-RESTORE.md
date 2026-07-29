# Mothball & Restore — Silbo Sports

**Status: MOTHBALLED (2026-07-29).** The site is offline, all automation is stopped, and the
Supabase project has been **deleted**. Nothing is accruing cost. This document is everything
needed to bring it back.

> **The database no longer exists.** Pausing wasn't possible (the Supabase org is on the Pro plan,
> which blocks pausing, and that plan is shared with two other live projects — `Sel-Fi` and
> `WasFirst` — so downgrading the whole org wasn't appropriate). The project
> `gcnbgdpicgeahxscpsfc` was therefore deleted after its structure was snapshotted into this repo.
> **Rebuilding means creating a fresh project and running the two snapshot files** (see below).
> The 11 user accounts, all events, competitors and venues are gone — events/competitors/venues
> re-hydrate from the provider APIs; user accounts do not.

---

## What was shut down (and how to undo each)

| Thing | What was done | How to bring it back |
| --- | --- | --- |
| **Cloudflare Worker** (`silbosports`) | **Deleted** — site is offline, custom domain routes released. | `npm run cloudflare:deploy` (runs build + `wrangler deploy`). Re-add the `silbosports.com` / `www` custom domains if they don't auto-attach from `wrangler.jsonc`. |
| **GitHub Actions — Live Data Monitor** | Schedule (every 30 min) commented out; manual-only. | Uncomment the `schedule:` block in `.github/workflows/live-data-monitor.yml`. |
| **GitHub Actions — CI** | `push`/`pull_request` triggers commented out; manual-only. | Uncomment the `push:`/`pull_request:` blocks in `.github/workflows/ci.yml`. |
| **Supabase cron jobs** (7) | All unscheduled via `cron.unschedule`. | Re-run the schedule statements in `supabase/cron.sql` (replace `<project-ref>`; the live jobs used the anon JWT — see that file's comments). |
| **Supabase project** (`gcnbgdpicgeahxscpsfc`) | **Deleted.** | Create a new project, then run the two snapshot files (see "Rebuilding" below). |
| **Edge Functions** | Gone with the project. Source still lives in `supabase/functions/`. | Redeploy from source once a new project exists. |

### The cron jobs that were removed
```
cleanup-past-events           30 4 * * *
ics-feed-ingest               17 */6 * * *
notifications-dispatch        */5 * * * *
provider-hydrate-openf1       42 7 * * *
provider-hydrate-pandascore   21 * * * *
provider-hydrate-players      7,27,47 * * * *
provider-hydrate-thesportsdb  */15 * * * *
```

---

## How the database is preserved

The live project is gone, so **this repo is the only copy.** Two files, both committed:

- **`supabase/snapshot/full-schema-snapshot.sql`** — the complete live structure: 6 extensions,
  the `private` schema, **40 tables**, all primary/foreign keys, uniques and checks, **86 indexes**,
  **14 functions**, 3 triggers, RLS enabled on every table, and **44 RLS policies**.
- **`supabase/snapshot/config-data-snapshot.sql`** — the hand-curated configuration rows that
  aren't regenerable from providers: sports (20), leagues incl. `display_rank` (148), competition
  templates/instances/calendar rules/art kits, spotlight cards (16), provider targets (84), source
  providers (30) + targets, watch providers (73) + watch links (68), blog posts.

Provider-derived rows (**events**, **competitors**, **venues**) are deliberately *not* snapshotted —
they re-hydrate from the APIs and would be stale anyway.

### Rebuilding from the snapshot (this is now the required path)
1. Create a new Supabase project.
2. SQL Editor → run `supabase/snapshot/full-schema-snapshot.sql`.
3. SQL Editor → run `supabase/snapshot/config-data-snapshot.sql`.
4. Set the edge-function secrets again (see below), deploy `supabase/functions/*`.
5. Re-add the cron jobs from `supabase/cron.sql`.
6. Update `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` in `.env` **and** `wrangler.jsonc`.

> Note: `auth.users` is managed by Supabase and is **not** in the snapshot — a rebuilt project
> starts with no accounts. The 11 accounts that existed were deleted with the project.

---

## Secrets that will need re-entering on restore

These live in Supabase → Settings → Edge Functions → Secrets (they are *not* in the repo):
`THESPORTSDB_API_KEY`, `APISPORTS_KEY`, `PANDASCORE_TOKEN`, `RESEND_API_KEY` (or `RESENDAPI`),
`EMAIL_FROM`, `APP_URL`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `ADMIN_EMAILS`,
`SUPABASE_SERVICE_ROLE_KEY`.

---

## Restarting the whole thing, in order

1. **Supabase** → Create a new project and run both snapshot files. Then update the project ref +
   publishable key in `.env` **and** `wrangler.jsonc` (both still point at the deleted
   `gcnbgdpicgeahxscpsfc`).
2. **Secrets** → re-add any that were rotated/expired while parked.
3. **API subscriptions** → re-subscribe to whichever providers you cancelled (see below).
4. **Cron** → re-schedule from `supabase/cron.sql`.
5. **Cloudflare** → `npm run cloudflare:deploy`, re-attach the custom domain.
6. **GitHub** → uncomment the workflow triggers.
7. Run `npm run verify:prod` for a readiness check.

---

## Third-party accounts

**Nothing here needs cancelling.** Confirmed 2026-07-29: every data provider was on a free/keyed
tier, so parking the project costs nothing and restarting it doesn't require re-purchasing anything.

- **All data providers — free tier, nothing to cancel.** PandaScore (esports), API-Sports /
  API-Football, TheSportsDB, OpenF1. Their API keys died with the Supabase project's secrets, so on
  restart you just re-issue keys from the same free accounts.
- **Resend** (transactional email) — free tier; leave it.
- **Google AdSense** — nothing to cancel; it simply stops earning.
- **Cloudflare** — the Worker is deleted, so no compute. The **domain registration**
  (`silbosports.com`, paid through **June 2027**) is separate and still active — let it lapse or
  keep it as you prefer.
- **Supabase** — this project is deleted and adds no further compute. The org (`Azr-Erzr's Org`) is
  **still on Pro (~$25/mo)**, but only because two *other* live projects use it: `Sel-Fi` and
  `WasFirst`. Leave Pro as-is unless you want to park those too (Free allows exactly 2 active
  projects, which those two would just fit). **This is the only recurring cost, and it isn't this
  project's.**
