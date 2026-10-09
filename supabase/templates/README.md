# Silbo account and event messages

Updated 2026-10-09. The five auth templates are **prepared locally**, not installed on the restored project. Its dashboard requires custom SMTP before template editing; SMTP is currently disabled. Older deployment dates referred to the deleted project.

Generate auth HTML and the credential-free partial Management API payload with `node scripts/generate-auth-email-templates.mjs`. Preview auth and sample event messages with `node scripts/preview-email-templates.mjs`, then open `/docs/previews/emails/index.html` on the local Vite server. Samples are explicitly labelled; they do not assert actual fixtures or broadcasts.

| Template | Subject | Action |
| --- | --- | --- |
| magic-link.html | Your sign-in link — Silbo Sports | One-time sign-in |
| confirm-signup.html | Confirm your email — Silbo Sports | Verify a new account |
| email-change.html | Confirm your email change — Silbo Sports | Confirm an email change |
| invite.html | Your invitation — Silbo Sports | Accept an invitation |
| reauthentication.html | Your verification code — Silbo Sports | Display the one-time code |

Use only project `bgbkqxdsjnbsizwkslsr` on Silbo Hosting. Configure an existing verified Resend sender through Supabase → Authentication → Emails → SMTP Settings. Host `smtp.resend.com`, port `465`, username `resend`; the owner enters the API key directly in the SMTP password field. Never copy keys into chat or this repository. Keep link/click tracking disabled for authentication messages. Sender verification and actual delivery still need owner verification.

After SMTP setup, install the matching subject/body for each template in Authentication → Emails. Alternatively, submit `auth-config.json` as a partial PATCH to `https://api.supabase.com/v1/projects/bgbkqxdsjnbsizwkslsr/config/auth` with an authorized Management API token, then verify the changed keys. This changes only template subjects/content. The CLI's currently saved account does not own this project.

`{{ .ConfirmationURL }}` stays intact in link templates; `{{ .Token }}` is retained for reauthentication. No password recovery flow is shipped, so no recovery template or reset-password promise is introduced. Account emails do not grant marketing consent.

The shared shell in `functions/_shared/email-shell.ts` uses warm cream, charcoal, Silbo green and small cyan/pink/amber/green accents. Solid inline styles, system fonts, a text logo alternative, dark-mode enhancements and mobile stacking keep messages usable without images or external font requests. Outlook fixed-width fallbacks are included; real Gmail/Apple Mail/Outlook inbox rendering remains unverified.

Event emails use the same shell through `functions/_shared/email-template.ts`, with explicit local time, direct event CTA, calendar action, broadcaster names/URLs in both HTML and text, and alert-management links. Cancelled events omit countdown and calendar actions. No countdown is presented as a live-updating value.

Notification dispatch stays paused by default. The worker requires server-only authorization plus `NOTIFICATIONS_ENABLED=true` before materializing or sending; no sending cron is enabled. Browser push uses the branded colour icon and monochrome whistle badge. Clicks navigate an existing same-origin tab to the specific event; cross-origin payload destinations are rejected.

References: [Supabase email templates](https://supabase.com/docs/guides/auth/auth-email-templates), [Supabase SMTP](https://supabase.com/docs/guides/auth/auth-smtp), [Resend SMTP](https://resend.com/docs/send-with-smtp).
