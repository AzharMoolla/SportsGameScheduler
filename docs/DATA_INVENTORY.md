# Data inventory — restoration baseline

2026-10-06. Categories reflect application source and schema snapshots. The old database, including 11 accounts, was deleted. They cannot be recovered from the schema/configuration snapshots. No new production dataset has been verified.

| Category | Purpose / source | Storage and third parties | Retention / user control / unresolved checks |
| --- | --- | --- | --- |
| Public fixtures, teams, competitors, venues | Sports provider ingestion and schedule discovery | Supabase; provider APIs | Bound ingestion window and refresh budgets. Record source, attribution and freshness; rebuild rather than treat snapshots as current. |
| Auth identity and sessions | Account login | Managed Supabase Auth; browser session storage | Verify managed password handling, session expiry, account deletion and abuse controls on restored project. |
| Preferences and follows | Personal schedule, region/time zone and followed sports/teams | Browser state and account-associated database records | Confirm synchronization and delete/export behavior. Region preference is not evidence of precise location tracking. |
| Custom leagues / schedules | User-created league/team/event content | Browser/app and database paths | Names could be personal data. Confirm whether content is private/shared, ownership authorization, deletion and minor-related use before launch. |
| Calendar-feed tokens and saved events | Subscription calendar and export | Supabase, feed consumer/calendar provider | Treat tokens as sensitive bearer capabilities; verify rotation, revocation and log redaction. |
| Reminder email / push subscriptions | User-requested alerts | Supabase, Resend, browser push providers | Verify opt-in, cancellation, account deletion propagation and stale-endpoint cleanup; do not infer marketing permission. |
| Requests / operational logs | Reliability and security | Supabase and Cloudflare | Region, contents, redaction and retention are unverified. Define bounded retention before launch. |
| Provider/service credentials | Server ingestion and delivery | Local private environment / Supabase secrets | Never client bundle or Git. Upload only to intended project, restrict access and rotate lost/obsolete credentials. |
| Payments | Future support / premium | Not implemented | Define benefits, processor, cancellation and data flows if this feature is approved. No card data is currently required by the app. |

Outstanding decisions: actual hosting regions and cross-border flows; retention periods per category; deletion/export coverage; recovery for user-created data; permitted provider/image use. Do not invent retention periods or claim legal compliance.
