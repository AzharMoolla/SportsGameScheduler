import fs from 'node:fs/promises'
import { renderSilboAlertEmail } from '../supabase/functions/_shared/email-template.ts'
import { alertCopyFor } from '../supabase/functions/_shared/alert-copy.ts'

await fs.mkdir('docs/previews/emails', { recursive: true })
const event = { title: 'Preview: Toronto vs Boston', starts_at: '2026-10-12T23:00:00Z', timezone: 'America/Toronto', league_name: 'Baseball · design sample', venue_name: 'Toronto' }
const kinds = ['reminder', 'time_change', 'cancellation', 'broadcast_update']
for (const kind of kinds) {
  const result = renderSilboAlertEmail({ appUrl: 'https://silbosports.com', event, copy: alertCopyFor(kind, event, 'https://silbosports.com/settings/alerts'), kind, eventUrl: 'https://silbosports.com/my-schedule', manageUrl: 'https://silbosports.com/settings/alerts', displayTimezone: 'Europe/London', region: 'GB', watch: [{ name: 'Official broadcaster — design sample', url: 'https://silbosports.com/my-schedule' }], calendarUrl: kind === 'cancellation' ? null : 'https://calendar.google.com/calendar/render?action=TEMPLATE' })
  await fs.writeFile(`docs/previews/emails/${kind}.html`, result.html)
  await fs.writeFile(`docs/previews/emails/${kind}.txt`, result.text)
}
const auth = ['magic-link', 'confirm-signup', 'email-change', 'invite', 'reauthentication']
const variants = [...auth.map(name => ({ name, url: `/supabase/templates/${name}.html` })), ...kinds.map(name => ({ name, url: `/docs/previews/emails/${name}.html` }))]
await fs.writeFile('docs/previews/emails/index.html', `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Silbo email design previews</title><style>body{margin:0;background:#f3eddd;font:16px Arial;color:#17352d}header{padding:24px;background:#171b18;color:#54ff9f}nav{display:flex;flex-wrap:wrap;gap:12px;margin-top:18px}a{color:inherit}iframe{display:block;border:0;width:100%;height:1100px}small{display:block;margin-top:12px;color:#c3cfc7}</style></head><body><header><h1>Silbo email studio</h1><p>Authentication and event messages · cream programme / dark broadcast</p><small>Design previews only. Sample fixtures and viewing options are not event or broadcast claims. No emails are sent here.</small><nav>${variants.map(v => `<a href="${v.url}" target="message-preview">${v.name.replaceAll('_', ' ').replaceAll('-', ' ')}</a>`).join('')}</nav></header><iframe title="Email design preview" name="message-preview" src="/supabase/templates/magic-link.html"></iframe></body></html>`)
console.log('Email studio and four alert samples generated; nothing sent.')
