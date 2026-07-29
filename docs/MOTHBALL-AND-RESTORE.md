# Mothball & Restore — Silbo Sports

**Status: MOTHBALLED (2026-07-29).** The site is offline, all automation is stopped, and the
database is paused. Nothing should be accruing cost. This document is everything needed to bring
it back.

---

## What was shut down (and how to undo each)

| Thing | What was done | How to bring it back |
| --- | --- | --- |
| **Cloudflare Worker** (`silbosports`) | **Deleted** — site is offline, custom domain routes released. | `npm run cloudflare:deploy` (runs build + `wrangler deploy`). Re-add the `silbosports.com` / `www` custom domains if they don't auto-attach from `wrangler.jsonc`. |
| **GitHub Actions — Live Data Monitor** | Schedule (every 30 min) commented out; manual-only. | Uncomment the `schedule:` block in `.github/workflows/live-data-monitor.yml`. |
| **GitHub Actions — CI** | `push`/`pull_request` triggers commented out; manual-only. | Uncomment the `push:`/`pull_request:` blocks in `.github/workflows/ci.yml`. |
| **Supabase cron jobs** (7) | All unscheduled via `cron.unschedule`. | Re-run the schedule statements in `supabase/cron.sql` (replace `<project-ref>`; the live jobs used the anon JWT — see that file's comments). |
| **Supabase project** | **Paused** — compute stops, data retained. | Supabase dashboard → the project → **Restore**. |
| **Edge Functions** | Left in place (inactive while paused). Source lives in `supabase/functions/`. | Redeploy with the Supabase CLI/MCP if needed. |

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

## The database is preserved two ways

**1. The project is paused, not deleted.** All data (including the 11 auth users) is retained and
comes back intact on restore. This is the preferred path.

**2. A full structural snapshot is committed to this repo** — insurance in case the project is ever
deleted, or you want to rebuild elsewhere:

- **`supabase/snapshot/full-schema-snapshot.sql`** — the complete live structure: 6 extensions,
  the `private` schema, **40 tables**, all primary/foreign keys, uniques and checks, **86 indexes**,
  **14 functions**, 3 triggers, RLS enabled on every table, and **44 RLS policies**.
- **`supabase/snapshot/config-data-snapshot.sql`** — the hand-curated configuration rows that
  aren't regenerable from providers: sports (20), leagues incl. `display_rank` (148), competition
  templates/instances/calendar rules/art kits, spotlight cards (16), provider targets (84), source
  providers (30) + targets, watch providers (73) + watch links (68), blog posts.

Provider-derived rows (**events**, **competitors**, **venues**) are deliberately *not* snapshotted —
they re-hydrate from the APIs and would be stale anyway.

### Rebuilding from the snapshot (only if the project is gone)
1. Create a new Supabase project.
2. SQL Editor → run `supabase/snapshot/full-schema-snapshot.sql`.
3. SQL Editor → run `supabase/snapshot/config-data-snapshot.sql`.
4. Set the edge-function secrets again (see below), deploy `supabase/functions/*`.
5. Re-add the cron jobs from `supabase/cron.sql`.
6. Update `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` in `.env` **and** `wrangler.jsonc`.

> Note: `auth.users` is managed by Supabase and is **not** in the snapshot — a rebuilt project
> starts with no accounts. Pausing (not deleting) is what preserves the existing users.

---

## Secrets that will need re-entering on restore

These live in Supabase → Settings → Edge Functions → Secrets (they are *not* in the repo):
`THESPORTSDB_API_KEY`, `APISPORTS_KEY`, `PANDASCORE_TOKEN`, `RESEND_API_KEY` (or `RESENDAPI`),
`EMAIL_FROM`, `APP_URL`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `ADMIN_EMAILS`,
`SUPABASE_SERVICE_ROLE_KEY`.

---

## Restarting the whole thing, in order

1. **Supabase** → Restore the project. Confirm tables/data are there.
2. **Secrets** → re-add any that were rotated/expired while parked.
3. **API subscriptions** → re-subscribe to whichever providers you cancelled (see below).
4. **Cron** → re-schedule from `supabase/cron.sql`.
5. **Cloudflare** → `npm run cloudflare:deploy`, re-attach the custom domain.
6. **GitHub** → uncomment the workflow triggers.
7. Run `npm run verify:prod` for a readiness check.

---

## Third-party accounts (billing lives outside this repo)

Cancel/downgrade these yourself — they can't be changed from code:

- **Supabase** — pausing stops compute, but a *Pro plan* is billed at the **organization** level and
  keeps charging even with every project paused. Downgrade the org to Free if this was the only
  project.
- **PandaScore** (esports data) — paid/keyed plan.
- **API-Sports / API-Football** (`APISPORTS_KEY`).
- **TheSportsDB** (`THESPORTSDB_API_KEY`) — paid tier if you're on one.
- **Resend** (transactional email) — free tier may be fine to leave.
- **Google AdSense** — nothing to cancel; it just stops earning.
- **Cloudflare** — the Worker is deleted. The **domain registration** (`silbosports.com`, expires
  **June 2027**) is separate and still active; let it lapse or keep it as you prefer.
