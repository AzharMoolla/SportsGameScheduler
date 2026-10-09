// Custom authentication: a hashed, unguessable URL token authorizes this feed.
// Calendar apps cannot send JWTs. All private custom data also requires owner matching.
import { createClient } from 'npm:@supabase/supabase-js@2'
import { renderCalendar, type FeedEvent } from '../_shared/ics.ts'
import { checkRateLimit, rateLimitKey, rateLimitedResponse } from '../_shared/rate-limit.ts'
const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
const APP_URL = Deno.env.get('APP_URL') ?? 'https://silbosports.com'
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const ids = (v: unknown): string[] => Array.isArray(v) ? [...new Set(v.filter((id): id is string => typeof id === 'string' && UUID.test(id)))].slice(0, 500) : []
const headers = { 'content-type': 'text/calendar; charset=utf-8', 'cache-control': 'private, no-store', 'x-content-type-options': 'nosniff' }

Deno.serve(async req => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } })
  const token = (new URL(req.url).pathname.split('/').filter(Boolean).at(-1) ?? '').replace(/\.ics$/, '')
  if (!/^[0-9a-f]{32}$/i.test(token)) return new Response('Not found', { status: 404, headers })
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
  const tokenHash = Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join('')
  const limit = checkRateLimit(rateLimitKey(req, 'calendar-feed', tokenHash), { limit: 120, windowMs: 60_000 })
  if (!limit.allowed) return rateLimitedResponse(limit.retryAfterSeconds)
  const { data: feed, error } = await supabase.from('calendar_feeds').select('id,user_id,name,filters,is_active,include_placeholders,include_broadcasts,last_accessed_at').eq('token_hash', tokenHash).maybeSingle()
  if (error) return new Response('Calendar temporarily unavailable', { status: 503, headers })
  if (!feed?.is_active) return new Response('Not found', { status: 404, headers })
  try {
    const filters = (feed.filters ?? {}) as Record<string, unknown>
    const selected = new Map<string, FeedEvent>()
    const leagueIds = ids(filters.leagueIds)
    const competitorIds = ids(filters.competitorIds)
    const explicitEventIds = ids(filters.eventIds)
    const eventIds = new Set(explicitEventIds)
    const customIds = ids([...(Array.isArray(filters.customLeagueIds) ? filters.customLeagueIds : []), filters.customLeagueId])
    // Preserve the database's 90-day history; explicit event picks retain their UID beyond it.
    const cutoff = new Date(Date.now() - 90 * 86400_000).toISOString()
    if (competitorIds.length) {
      for (let offset = 0; ; offset += 1000) {
        const { data, error } = await supabase.from('event_competitors').select('event_id').in('competitor_id', competitorIds).order('event_id').range(offset, offset + 999)
        if (error) throw error
        for (const row of data ?? []) eventIds.add(row.event_id)
        if ((data?.length ?? 0) < 1000) break
        if (offset >= 9000) throw new Error('Selection too large')
      }
    }
    const select = 'id,title,starts_at,starts_at_tbd,updated_at,version,status,metadata,venues(name),sports(key),leagues(name)' + (feed.include_broadcasts ? ',broadcasts(country,channel,kind,stream_url)' : '')
    const includePlaceholders = feed.include_placeholders
    async function load(column: string, picks: string[], retainExplicit = false) {
      for (let i = 0; i < picks.length; i += 100) {
        let query = supabase.from('events').select(select).eq('visibility', 'public').in(column, picks.slice(i, i + 100)).order('starts_at').limit(500)
        if (!retainExplicit) query = query.gte('starts_at', cutoff)
        if (!includePlaceholders) query = query.eq('starts_at_tbd', false)
        const { data, error } = await query
        if (error) throw error
        for (const row of (data ?? []) as unknown as Array<{ id: string; title: string; starts_at: string; starts_at_tbd: boolean; updated_at: string; version: number; status: string; metadata: { ends_at?: string }; venues: { name: string } | null; sports: { key: string } | null; leagues: { name: string } | null; broadcasts?: FeedEvent['broadcasts'] }>) {
          selected.set(row.id, { id: row.id, title: row.title, starts_at: row.starts_at, starts_at_tbd: row.starts_at_tbd, ends_at: row.metadata?.ends_at, updated_at: row.updated_at, version: row.version, status: row.status, venue_name: row.venues?.name, sport_key: row.sports?.key, league_name: row.leagues?.name, broadcasts: row.broadcasts ?? [] })
        }
      }
    }
    // Union of picks; no filters means an empty calendar, never all database events.
    if (leagueIds.length) await load('league_id', leagueIds)
    if (eventIds.size) await load('id', [...eventIds])
    if (explicitEventIds.length) await load('id', explicitEventIds, true)
    if (customIds.length) {
      const { data, error } = await supabase.from('custom_leagues').select('id,name,payload,updated_at').eq('owner_user_id', feed.user_id).in('id', customIds)
      if (error) throw error
      for (const league of data ?? []) {
        for (const event of league.payload?.events ?? []) {
          if (!UUID.test(event.id) || !event.startsAt || event.startsAt < cutoff) continue
          selected.set(event.id, { id: event.id, url: `${APP_URL}/custom-leagues`, title: event.title + (event.opponent ? ` vs ${event.opponent}` : ''), starts_at: event.startsAt, ends_at: event.endsAt, updated_at: event.updatedAt ?? league.updated_at, version: event.version ?? 1, status: event.status, venue_name: event.venue, sport_key: league.payload?.sportKey ?? 'custom', league_name: league.name, description: [event.arriveEarlyMinutes ? `Arrive ${event.arriveEarlyMinutes} minutes early.` : '', event.uniformColor ? `Uniform: ${event.uniformColor}` : '', event.notes ?? ''].filter(Boolean).join('\n') })
        }
      }
    }
    if (!feed.last_accessed_at || Date.now() - new Date(feed.last_accessed_at).getTime() > 900000) {
      const { error } = await supabase.from('calendar_feeds').update({ last_accessed_at: new Date().toISOString() }).eq('id', feed.id)
      if (error) console.warn('Calendar access timestamp update failed')
    }
    const reminders = Array.isArray(filters.reminderMinutes) ? filters.reminderMinutes.filter((n): n is number => Number.isInteger(n) && Number(n) >= 0 && Number(n) <= 10080).slice(0, 3) : []
    const events = [...selected.values()].sort((a,b) => (a.starts_at ?? '').localeCompare(b.starts_at ?? '')).slice(0,500)
    return new Response(req.method === 'HEAD' ? null : renderCalendar(feed.name, events, { appUrl: APP_URL, reminderMinutes: reminders }), { headers })
  } catch {
    return new Response('Calendar temporarily unavailable', { status: 503, headers })
  }
})
