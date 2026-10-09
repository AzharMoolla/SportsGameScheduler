import { ALERT_KIND_COPY, normalizeAlertKind, type AlertCopy, type AlertCopyEvent } from './alert-copy.ts'
import { emailButton, escapeEmailHtml as escapeHtml, renderEmailShell, safeEmailUrl } from './email-shell.ts'

export type WatchOption = { name: string; url: string; providerKey?: string | null }
type RenderAlertEmailOptions = {
  appUrl: string
  brandName?: string
  copy: AlertCopy
  event: AlertCopyEvent
  manageUrl: string
  eventUrl?: string
  kind?: string
  displayTimezone?: string | null
  hour12?: boolean | null
  region?: string | null
  watch?: WatchOption[]
  calendarUrl?: string | null
}
const UPCOMING_KINDS = new Set(['reminder', 'time_change', 'time_set', 'new_event', 'participant_update', 'venue_change'])

export function formatAlertStart(startsAt: string | null | undefined, timezone: string, hour12?: boolean | null) {
  if (!startsAt || !Number.isFinite(new Date(startsAt).getTime())) return null
  const date = new Date(startsAt)
  try {
    const day = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: timezone }).format(date)
    const time = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: hour12 ?? undefined, timeZone: timezone }).format(date)
    const zone = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short', timeZone: timezone }).formatToParts(date).find(part => part.type === 'timeZoneName')?.value ?? timezone
    return { day, time, zone, timezone, full: `${day}, ${time} ${zone}` }
  } catch { return { day: 'UTC', time: date.toUTCString(), zone: 'UTC', timezone: 'UTC', full: date.toUTCString() } }
}

function countdownLabel(startsAt?: string | null) {
  const minutes = startsAt ? Math.ceil((new Date(startsAt).getTime() - Date.now()) / 60000) : NaN
  if (!Number.isFinite(minutes) || minutes <= 0) return null
  if (minutes < 90) return `Starts in about ${minutes} minute${minutes === 1 ? '' : 's'}`
  const hours = Math.round(minutes / 60)
  if (hours < 36) return `Starts in about ${hours} hour${hours === 1 ? '' : 's'}`
  const days = Math.round(hours / 24)
  return `Starts in about ${days} day${days === 1 ? '' : 's'}`
}

export function renderSilboAlertEmail(options: RenderAlertEmailOptions) {
  const appUrl = safeEmailUrl(options.appUrl).replace(/\/$/, '')
  const eventUrl = safeEmailUrl(options.eventUrl, appUrl)
  const manageUrl = safeEmailUrl(options.manageUrl, `${appUrl}/settings/alerts`)
  const start = formatAlertStart(options.event.starts_at, options.displayTimezone || options.event.timezone || 'UTC', options.hour12)
  const kind = normalizeAlertKind(options.kind ?? 'reminder')
  const kindLabel = ALERT_KIND_COPY[kind].label
  const countdown = UPCOMING_KINDS.has(kind) ? countdownLabel(options.event.starts_at) : null
  const watch = (options.watch ?? []).filter(item => safeEmailUrl(item.url, '')).slice(0, 4)
  const calendarUrl = kind === 'cancellation' ? '' : safeEmailUrl(options.calendarUrl, '')
  const text = [
    kindLabel, options.event.title, options.copy.lead, countdown,
    options.event.league_name ? `League: ${options.event.league_name}` : '',
    start ? `Start: ${start.full} (${start.timezone})` : 'Start: Time to be confirmed',
    options.event.venue_name ? `Venue: ${options.event.venue_name}` : '',
    ...watch.map(item => `Check coverage${options.region ? ` (${options.region})` : ''}: ${item.name} — ${safeEmailUrl(item.url)}`),
    watch.length ? 'Confirm coverage with the broadcaster. Location, subscription and blackout restrictions can apply.' : '',
    `View event: ${eventUrl}`, calendarUrl ? `Add to calendar: ${calendarUrl}` : '',
    `My schedule: ${appUrl}/my-schedule`, `Manage alerts: ${manageUrl}`,
  ].filter(Boolean).join('\n')
  const watchHtml = watch.length ? `<p class="email-copy" style="margin:24px 0 10px;color:#17352d;font:700 14px/1.4 Arial,sans-serif">Check viewing options${options.region ? ` · ${escapeHtml(options.region)}` : ''}</p><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${watch.map(item => `<tr><td style="padding:0 0 8px"><a class="email-link" href="${escapeHtml(safeEmailUrl(item.url))}" style="display:block;padding:12px;border:1px solid #b9cdbd;border-radius:6px;color:#0b6f44;font:700 14px/1.4 Arial,sans-serif;text-decoration:underline">${escapeHtml(item.name)} →</a></td></tr>`).join('')}</table><p class="email-muted" style="margin:4px 0 0;color:#53675f;font:400 12px/1.6 Arial,sans-serif">Confirm event coverage with the broadcaster. Location, subscription and blackout restrictions can apply.</p>` : ''
  const body = `<p class="email-link" style="margin:0 0 12px;font:700 11px/1.5 Courier New,monospace;letter-spacing:2px;color:#0b6f44">${escapeHtml(kindLabel.toUpperCase())}</p>
<h1 class="title email-copy" style="margin:0;color:#17352d;font:900 34px/1.12 Arial,sans-serif;letter-spacing:-.6px">${escapeHtml(options.event.title)}</h1>
<p class="email-muted" style="margin:16px 0 22px;color:#53675f;font:400 16px/1.6 Arial,sans-serif">${escapeHtml(options.copy.lead)}</p>
${countdown ? `<p class="email-link" style="margin:0 0 20px;color:#0b6f44;font:700 14px/1.5 Arial,sans-serif">${escapeHtml(countdown)} · estimated at send time</p>` : ''}
<table class="event-ticket" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #b9cdbd;border-radius:8px;background:#edf1e6"><tr>
<td class="time-cell" style="padding:20px;vertical-align:top;width:42%"><p class="email-muted" style="margin:0;color:#53675f;font:700 11px/1.5 Courier New,monospace;text-transform:uppercase">${escapeHtml(start?.day ?? 'Start time')}</p><p class="email-copy" style="margin:6px 0;color:#17352d;font:900 27px/1.15 Arial,sans-serif">${escapeHtml(start?.time ?? 'TBD')}</p><p class="email-muted" style="margin:0;color:#53675f;font:400 12px/1.5 Arial,sans-serif">${escapeHtml(start?.zone ?? '')}<br>${escapeHtml(start?.timezone ?? 'Time to be confirmed')}</p></td>
<td class="details-cell" style="padding:20px;vertical-align:top"><p class="email-copy" style="margin:0;color:#17352d;font:700 14px/1.5 Arial,sans-serif">${escapeHtml(options.event.league_name ?? 'Event')}</p>${options.event.venue_name ? `<p class="email-muted" style="margin:8px 0 0;color:#53675f;font:400 13px/1.5 Arial,sans-serif">${escapeHtml(options.event.venue_name)}</p>` : ''}<p class="email-muted" style="margin:10px 0 0;color:#53675f;font:400 12px/1.5 Arial,sans-serif">Start shown in your selected timezone.</p></td></tr></table>
${watchHtml}<div style="margin-top:26px">${emailButton('View event', eventUrl)}</div>${calendarUrl ? `<div style="margin-top:12px">${emailButton('Add to calendar', calendarUrl, true)}</div>` : ''}`
  const html = renderEmailShell({ title: options.copy.subject, preheader: options.copy.lead, eyebrow: 'Live schedule signal / your local time', body, appUrl,
    footer: `You enabled event alerts for your follows. <a class="email-link" href="${escapeHtml(manageUrl)}" style="color:#0b6f44;font-weight:700">Manage or stop alerts</a> at any time. Schedule and viewing details may change; open the event for the latest information.`,
  })
  return { subject: options.copy.subject, text, html }
}
