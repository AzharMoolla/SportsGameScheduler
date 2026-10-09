# Data inventory — restoration baseline

2026-10-07. Categories reflect application source and restored database. The old database, including 11 accounts, was deleted. They cannot be recovered from schema/configuration snapshots. Public provider data and synthetic feed isolation/update checks are verified; real account flows and recovery remain unverified.

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

Community leagues now include optional permission-confirmed league/team/player thumbnails in the owner's JSON payload. Inputs are resized to 256 pixels, encoded under 100 KB and stripped of original metadata in the browser; original files are not sent. Share-enabled leagues expose these thumbnails through the gated share resolver. The owner calendar feed may include private community notes; its URL must be treated as a bearer capability. Tokens are hashed in the database and new live tokens are shown only in the creating session. Calendars retain up to 30 days of history; this is feed selection behaviour, not a database retention policy.

2026-10-09: OAuth sign-in is prepared for Google, Apple and Microsoft. Public Auth settings expose only availability flags; provider selection initiates identity exchange with Supabase. No new profile fields, trackers or identity scopes are added. Auth SMTP and provider credentials are not yet configured. Message templates use first-party brand images and system fonts; no font-provider request. Notifications remain paused. See docs/auth-and-messages-2026-10-09.md.
