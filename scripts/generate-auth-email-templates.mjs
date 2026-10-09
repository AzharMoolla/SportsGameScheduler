import fs from 'node:fs/promises'
import { renderEmailShell, emailButton } from '../supabase/functions/_shared/email-shell.ts'

export const authTemplates = [
  { file: 'magic-link', key: 'magic_link', subject: 'Your sign-in link — Silbo Sports', heading: 'Your schedule is ready.', lead: 'Sign in to sync your follows, saved events and preferences across devices.', button: 'Sign in to Silbo Sports', note: 'Open this one-time link on the device where you requested it. If it has expired, request a fresh link from the site.' },
  { file: 'confirm-signup', key: 'confirmation', subject: 'Confirm your email — Silbo Sports', heading: 'Make it your sports board.', lead: 'Confirm your email to finish creating your account and take your schedule with you.', button: 'Confirm my email', note: 'Confirming your email does not subscribe you to marketing. Event alerts are controlled separately in your settings.' },
  { file: 'email-change', key: 'email_change', subject: 'Confirm your email change — Silbo Sports', heading: 'Confirm your new address.', lead: 'Confirm this email address change for your Silbo Sports account.', button: 'Confirm email change', note: 'If you did not request this change, do not use this link. Review your account on silbosports.com.' },
  { file: 'invite', key: 'invite', subject: 'Your invitation — Silbo Sports', heading: 'Your place on the board.', lead: 'You have been invited to create a Silbo Sports account. Accept to start building your personal sports schedule.', button: 'Accept invitation', note: 'Accepting this invitation does not subscribe you to marketing or turn on event notifications.' },
  { file: 'reauthentication', key: 'reauthentication', subject: 'Your verification code — Silbo Sports', heading: 'One more check.', lead: 'Use this one-time code to confirm the action you requested in Silbo Sports.', button: null, note: 'Enter the code only on silbosports.com. Never share it with anyone. If you did not request it, ignore this email.' },
]

await fs.mkdir('supabase/templates', { recursive: true })
const config = {}
for (const template of authTemplates) {
  const action = template.button
    ? `${emailButton(template.button, '{{ .ConfirmationURL }}')}<p class="email-muted" style="margin:18px 0 0;color:#53675f;font:400 12px/1.7 Arial,sans-serif">Button not working? Copy this one-time link into your browser:</p><p style="margin:6px 0 0;word-break:break-all"><a class="email-link" href="{{ .ConfirmationURL }}" style="color:#0b6f44;font:400 12px/1.6 Arial,sans-serif">{{ .ConfirmationURL }}</a></p>`
    : '<p class="event-ticket email-copy" style="padding:20px;text-align:center;border:1px solid #b9cdbd;border-radius:8px;background:#edf1e6;font:700 32px/1.2 Courier New,monospace;letter-spacing:6px">{{ .Token }}</p>'
  const html = renderEmailShell({
    title: template.subject, preheader: template.lead, eyebrow: 'Your account / secure sign-in',
    body: `<h1 class="title email-copy" style="margin:0;color:#17352d;font:900 36px/1.1 Arial,sans-serif;letter-spacing:-1px">${template.heading}</h1><p class="email-muted" style="margin:18px 0 26px;color:#53675f;font:400 16px/1.7 Arial,sans-serif">${template.lead}</p>${action}<p class="email-muted" style="margin:24px 0 0;color:#53675f;font:400 13px/1.7 Arial,sans-serif">${template.note}</p>`,
    footer: 'This email was sent for an account action. If you didn’t request it, you can ignore it. Do not forward this message or share your sign-in link or code.',
  })
  await fs.writeFile(`supabase/templates/${template.file}.html`, html)
  config[`mailer_subjects_${template.key}`] = template.subject
  config[`mailer_templates_${template.key}_content`] = html
}
await fs.writeFile('supabase/templates/auth-config.json', JSON.stringify(config, null, 2) + '\n')
console.log('Generated five branded authentication templates and a credential-free partial config payload.')
