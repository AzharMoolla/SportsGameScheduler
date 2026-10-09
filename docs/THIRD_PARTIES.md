# Third parties — restoration inventory

2026-10-07. The old Supabase database and Cloudflare hosting were deleted. New database schema/configuration and provider data are restored in Canada Central. Cloudflare is resumed with a temporary restoration Worker. The full frontend remains local for review.

| Service | Role / data boundary | Current state and next verification |
| --- | --- | --- |
| Supabase | Auth emails, account identifiers, preferences, follows, calendar feeds, alert subscriptions and application data; server secrets | New project `bgbkqxdsjnbsizwkslsr` restored in `ca-central-1`; 40 tables have RLS. Ownership/share SQL checks passed. Verify real account flows, retention and recovery before launch. Old credentials/config references need replacement together. |
| Cloudflare | App hosting, request/network metadata and logs | Zone resumed; restoration Worker and canonical redirect verified. Full app publication and log retention remain to verify. |
| TheSportsDB | Server-side sports fixtures, teams, metadata and TV channel listings | Premium key operational; bounded current/future-season, roster and TV jobs enabled 2026-10-08 at the user's request. 9,012 public events across connected sources; 1,342 TV listings. Server secrets only, no fan identity needed for ingestion. Image/mark rights require per-asset review. |
| API-Sports / PandaScore | Server-side sports/esports ingestion | API-Sports key verified on 12 active Free endpoints; near-term basketball, hockey, handball, American football and rugby import added 775 events. Four bounded batches/day enabled; current-season and MMA date restrictions remain. PandaScore operational. No fan identity sent to ingestion providers. See data/apisports-access-2026-10-08.md. |
| OpenF1 | Public racing schedule/session data | Read-only public feed verified; no fan identity required. |
| World Athletics / TFRRS / Cricsheet / Openfootball | Supplementary public/experimental ingestion sources | Some probes succeeded; prove coverage, attribution and permitted use before production inclusion. |
| Resend | Reminder email destination and event content | User added new key; delivery/unsubscribe and retention must be verified before enabling. No outbound reminders enabled. |
| Browser push providers | Opt-in push endpoint/key material and notification delivery | Regenerate VAPID credentials; verify opt-in, revocation and endpoint cleanup. |
| Remote image hosts | Team/league imagery; browser requests expose normal network metadata | Inventory actual hosts, caching and rights before release; they are external requests even without advertising. |
| Wikimedia Commons thumbnails | Two attributed athlete photos loaded by browsers from thumb.wikimedia.org | Explicit creator/source/CC licence records and footer credits added. Requests expose ordinary IP/network metadata. Broader coverage and local asset rights remain incomplete. |
| Broadcasters | Direct outbound viewing links | 111 destinations audited 2026-10-08: 107 reachable, four need browser/network follow-up, zero confirmed 404/410 after repairs. Country-level routing improved; no guarantee of postcode-level entitlement. No affiliate commission links intended. |
| Anthropic | Optional offline blog-drafting script | Not an app runtime feature. Review script inputs and authorization before any use; do not send private user data. |
| Stripe | Possible future support/premium billing | Planned only; no current payment integration or subscription promises. |

Ads and affiliate UI/configuration were removed locally; this has not been deployed. No analytics or tracking provider was added. Re-audit network requests when the restored app is running.
