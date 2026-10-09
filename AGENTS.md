<!-- agent-project-playbook:begin -->
Before public-facing implementation or release work, read and follow
`AGENT_PROJECT_PLAYBOOK.md`. Preserve project-specific instructions and the
user's explicit scope and authorization. Optional tools are selected by need;
this pointer does not enable hooks, tracking, external providers or deployment.
<!-- agent-project-playbook:end -->

## Scheduler context

- React/Vite/TypeScript app with Supabase functions and Cloudflare hosting. Preserve the existing sports poster design.
- Restore a fan-first, ad-free scheduler. Do not reintroduce ads, affiliate redirects or ticket commissions. Support payments and premium benefits are future product decisions, not shipped functionality.
- The previous database and hosting were deleted. New Supabase project: `bgbkqxdsjnbsizwkslsr`; connector and database access verified ACTIVE_HEALTHY in Canada Central; CLI permission still needs the new-account login. Never use the old project as a deployment target or mix a new URL with old credentials.
- Preserve `marketing/` and existing agent configuration. Keep secrets server-side; never print their values.
- Consult `docs/DATA_INVENTORY.md`, `docs/THIRD_PARTIES.md`, `docs/TOOLING_DECISIONS.md` and `docs/PRE_LAUNCH_GATE.md` for data flows, tool decisions and release blockers.
- Run lint, TypeScript and unit checks for meaningful code changes; use focused browser checks for changed user flows. A build with live-data verification skipped proves compilation only.
- Keep refresh jobs disabled during restoration. Establish a bounded schedule, API-call budget and observable freshness before enabling cron. Free-plan limits and backup coverage must be verified against current official documentation before deployment.
