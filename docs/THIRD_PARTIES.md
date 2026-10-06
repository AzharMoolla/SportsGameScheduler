# Third parties — restoration inventory

2026-10-06. This describes inspected source/configuration, not verified production. The old Supabase database and Cloudflare hosting were deleted. The new project is inaccessible/inactive in the current session.

| Service | Role / data boundary | Current state and next verification |
| --- | --- | --- |
| Supabase | Auth emails, account identifiers, preferences, follows, calendar feeds, alert subscriptions and application data; server secrets | New project `bgbkqxdsjnbsizwkslsr` intended. Confirm region, access, schema, RLS, retention and recovery before enabling. Old credentials/config references need replacement together. |
| Cloudflare | App hosting, request/network metadata and logs | Previous Worker deleted. Confirm new deployment, logging, regions and retention. |
| TheSportsDB | Server-side sports fixtures, teams and metadata | Public endpoint verified. User obtained new premium key; upload failed. No fan identity needed for ingestion. |
| API-Sports / PandaScore | Server-side sports/esports ingestion | Restore provider credentials only if required coverage justifies them; live authorization not verified. |
| OpenF1 | Public racing schedule/session data | Read-only public feed verified; no fan identity required. |
| World Athletics / TFRRS / Cricsheet / Openfootball | Supplementary public/experimental ingestion sources | Some probes succeeded; prove coverage, attribution and permitted use before production inclusion. |
| Resend | Reminder email destination and event content | Old credentials lost; delivery/unsubscribe and retention must be verified before enabling. |
| Browser push providers | Opt-in push endpoint/key material and notification delivery | Regenerate VAPID credentials; verify opt-in, revocation and endpoint cleanup. |
| Remote image hosts | Team/league imagery; browser requests expose normal network metadata | Inventory actual hosts, caching and rights before release; they are external requests even without advertising. |
| Broadcasters | Direct outbound viewing links | Local code uses direct destinations. Verify redirects and destination behavior; no affiliate commission links intended. |
| Anthropic | Optional offline blog-drafting script | Not an app runtime feature. Review script inputs and authorization before any use; do not send private user data. |
| Stripe | Possible future support/premium billing | Planned only; no current payment integration or subscription promises. |

Ads and affiliate UI/configuration were removed locally; this has not been deployed. No analytics or tracking provider was added. Re-audit network requests when the restored app is running.
