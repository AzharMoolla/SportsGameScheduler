import { describe, expect, test } from 'vitest'
import { alertCopyFor, normalizeAlertKind } from '../../../supabase/functions/_shared/alert-copy'
import { renderSilboAlertEmail } from '../../../supabase/functions/_shared/email-template'

describe('alert copy', () => {
  test('renders participant/bracket updates as matchup-set alerts', () => {
    const copy = alertCopyFor(
      'bracket_slot_set',
      {
        title: '1A vs 3C/E/F/H/I',
        starts_at: '2026-07-01T01:00:00.000Z',
        venue_name: 'Mexico City',
        league_name: 'FIFA World Cup',
      },
      'https://silbosports.com/settings/alerts',
    )

    expect(normalizeAlertKind('bracket_slot_set')).toBe('participant_update')
    expect(copy.subject).toBe('Matchup set: 1A vs 3C/E/F/H/I')
    expect(copy.body).toContain('teams, players, or bracket slots')
    expect(copy.body).toContain('League: FIFA World Cup')
    expect(copy.body).toContain('Manage alerts: https://silbosports.com/settings/alerts')
  })

  test('keeps where-to-watch updates distinct from time changes', () => {
    const copy = alertCopyFor('broadcast_set', { title: 'UFC 329' }, 'https://silbosports.com/settings/alerts')

    expect(normalizeAlertKind('broadcast_set')).toBe('broadcast_update')
    expect(copy.subject).toBe('Watch info updated: UFC 329')
    expect(copy.body).toContain('where-to-watch information')
  })

  test('renders branded html and text email fallbacks', () => {
    const event = {
      title: 'Canada vs Morocco',
      starts_at: '2026-06-18T22:00:00.000Z',
      timezone: 'America/Toronto',
      venue_name: 'BMO Field',
      league_name: 'FIFA World Cup',
    }
    const copy = alertCopyFor('reminder', event, 'https://silbosports.com/settings/alerts')
    const email = renderSilboAlertEmail({
      appUrl: 'https://silbosports.com',
      copy,
      event,
      manageUrl: 'https://silbosports.com/settings/alerts',
    })

    expect(email.subject).toBe('Reminder: Canada vs Morocco')
    expect(email.text).toContain('Manage alerts: https://silbosports.com/settings/alerts')
    expect(email.text).toContain('League: FIFA World Cup')
    expect(email.html).toContain('Silbo Sports')
    expect(email.html).toContain('View event')
    expect(email.html).toContain('BMO Field')
    expect(email.html).toContain('Live schedule signal / your local time')
    expect(email.html).toContain('background-color:#f3eddd')
    expect(email.html).toContain('#45c7d4')
    expect(email.html).toContain('#ef6baf')
  })

  test('escapes event content and rejects unsafe destinations in both formats', () => {
    const event = { title: '<script>alert(1)</script>', starts_at: 'not-a-date' }
    const email = renderSilboAlertEmail({ appUrl: 'https://silbosports.com', event, copy: { subject: 'Update', lead: '<img src=x>', body: '' }, manageUrl: 'javascript:alert(1)', eventUrl: 'javascript:alert(1)', watch: [{ name: 'Bad', url: 'data:text/html,x' }], calendarUrl: 'javascript:alert(1)' })
    expect(email.html).not.toContain('<script>')
    expect(email.html).not.toContain('javascript:')
    expect(email.html).not.toContain('data:text/html')
    expect(email.html).toContain('&lt;script&gt;')
    expect(email.text).toContain('Time to be confirmed')
    expect(email.text).toContain('https://silbosports.com/settings/alerts')
  })

  test('honours the recipient timezone and includes broadcast links in plain text', () => {
    const event = { title: 'Design fixture', starts_at: '2026-10-12T23:00:00Z', timezone: 'America/Toronto' }
    const email = renderSilboAlertEmail({ appUrl: 'https://silbosports.com', event, copy: alertCopyFor('reminder', event, ''), manageUrl: 'https://silbosports.com/settings/alerts', displayTimezone: 'Europe/London', hour12: false, watch: [{ name: 'Broadcaster', url: 'https://example.com/watch' }] })
    expect(email.text).toContain('Tue, Oct 13, 00:00')
    expect(email.text).toContain('Europe/London')
    expect(email.text).toContain('https://example.com/watch')
    expect(email.html).toContain('blackout restrictions')
  })

  test('cancelled events do not advertise a countdown or add-to-calendar action', () => {
    const event = { title: 'Cancelled fixture', starts_at: '2099-10-12T23:00:00Z' }
    const email = renderSilboAlertEmail({ appUrl: 'https://silbosports.com', event, kind: 'cancellation', copy: alertCopyFor('cancellation', event, ''), manageUrl: 'https://silbosports.com/settings/alerts', calendarUrl: 'https://calendar.google.com/calendar/render' })
    expect(email.html).not.toContain('Starts in about')
    expect(email.html).not.toContain('Add to calendar')
  })
})
