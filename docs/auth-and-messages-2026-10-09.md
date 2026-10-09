# Account sign-in and message design

Owner requested Google, Apple if available, useful additional providers, and improved email/notification presentation. Owner authorized a **separate Silbo Google project**, preserving WasFirst.

## Configuration inspected

- Only Supabase `bgbkqxdsjnbsizwkslsr` on Silbo Hosting is targeted. Email enabled, Google/Apple/Azure disabled, signup allowed, email confirmation required.
- Separate Google project **Silbo Sports**, ID `model-magnet-511106-f4`, created without adding billing. External audience and existing owner contact prepared. Google API Services User Data Policy awaits owner acceptance. WasFirst preserved.
- Supabase custom SMTP is disabled. Default templates are used; custom SMTP required to edit them. The restricted default sender is unsuitable for general public fan sign-in. Existing Resend can be reused after a verified sender and owner-entered key are configured. [SMTP restrictions](https://supabase.com/docs/guides/auth/auth-smtp).

## Implementation

- Google, Apple and Microsoft handlers/buttons prepared. Availability comes from public Auth settings. Contextual prompts obey the same check. Microsoft requests the required `email` scope. No provider SDK, tracker, billing or additional data scopes added.
- New sign-in panel: device sync, magic links, safe readable errors, expired/cancelled callback message, Escape/outside dismissal and mobile scrolling.
- Five account templates and event renderer share system-font cream/charcoal design, colour decals, dark mode, mobile/Outlook fallbacks, image-independent content and personal-schedule links.
- Event emails: recipient timezone, full broadcaster names/URLs in HTML/text, event/calendar actions and alert management. Cancellation omits countdown/calendar. HTTPS URL validation and escaped event text.
- Push uses existing whistle colour icon and monochrome transparent badge. Clicking navigates an existing app tab to the event; rejects external destinations.
- Dispatcher requires server-only authorization and explicit enabled flag. Verified sender must be configured; removed old `.app` fallback. Email viewing options prefer broadcast-country preference, omit expired/not-yet-valid links and other games' event-specific links. No fan delivery/schedule enabled.

## Owner setup

1. Finish Google policy acceptance in prepared tab. Branding URLs: `https://silbosports.com`, `/privacy`, `/terms`; authorized domains: `silbosports.com` and restored callback domain. Testing limits access to test users; review publishing readiness before production.
2. Create Web OAuth client **Silbo Sports Web**. JavaScript origin: `https://silbosports.com`. Redirect URI: `https://bgbkqxdsjnbsizwkslsr.supabase.co/auth/v1/callback`. Owner completes credential creation and enters client ID/secret directly in this project's Google provider form. Leave skip-nonce and allow-without-email off. Verify real sign-in and follow merging.
3. Confirm verified Resend sender. SMTP: `smtp.resend.com`, port `465`, username `resend`, API key entered directly as password in Supabase. Preserve 60-second interval/rate limits and disable click tracking. Install subjects/bodies from `supabase/templates` and test an owner-requested link.
4. Apple requires Developer account, Services ID, signing key and expiring client secret. Rotate web OAuth secret within six months and register sender domain for private relay. Never store `.p8` or secrets in Git. [Apple setup](https://supabase.com/docs/guides/auth/social-login/auth-apple).
5. Microsoft requires Entra app registration, suitable account audience, callback and secret. Prepared but disabled. [Microsoft setup](https://supabase.com/docs/guides/auth/social-login/auth-azure).

## Gate / evidence

- PASS: 131 unit tests, lint/TypeScript, Deno notification check, local push display/navigation check, 12 desktop/mobile sign-in and email browser checks. Normal build includes strict live-data verification.
- BLOCKED: real provider consent/login/merging; SMTP sender/key, installed hosted templates, actual auth delivery, real inbox rendering and opted-in notification delivery. No secrets printed, no fan messages sent.
- Prepared providers/templates must not be described as operational before configuration/verification.

## Deployment

Published the tested sign-in UI, push navigation and brand assets to silbosports.com (Cloudflare version f75a19f7-5b7e-40e3-b184-8d84cf3a5139). Deployed notifications version 1 to the restored Supabase project with JWT/service authorization and default-off dispatch. Unauthenticated POST returns 401. No notification cron exists. Account templates remain local until SMTP is configured; Google/Apple/Microsoft remain disabled pending owner setup.
