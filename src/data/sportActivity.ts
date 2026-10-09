import { useEffect, useState } from 'react'
import { getSupabaseClient } from '../lib/supabase'
import { useNow } from '../lib/useNow'
import { getSport } from '../domain/sports'

export type ActivityEvent = { id: string; title: string; startsAt: Date; sportKey: string; leagueName: string; status: string; startsAtTbd: boolean; metadata: Record<string, unknown> }
const DAY = 86400000
let cache: { fetchedAt: number; events: ActivityEvent[] } | undefined
let pending: Promise<ActivityEvent[]> | undefined

async function loadActivity(): Promise<ActivityEvent[]> {
  if (cache && Date.now() - cache.fetchedAt < 300000) return cache.events
  if (pending) return pending
  pending = (async () => {
    const client = await getSupabaseClient()
    if (!client) return []
    const events: ActivityEvent[] = []
    const now = Date.now()
    for (let offset = 0; offset < 3000; offset += 1000) {
      const { data, error } = await client.from('events')
        .select('id,title,starts_at,starts_at_tbd,status,metadata,sports(key),leagues(name)')
        .eq('visibility', 'public').not('status', 'in', '(finished,cancelled,postponed)')
        .gte('starts_at', new Date(now - 3 * 3600000).toISOString())
        .lte('starts_at', new Date(now + 28 * DAY).toISOString())
        .order('starts_at').order('id').range(offset, offset + 999)
      if (error) throw error
      for (const row of data ?? []) {
        const r = row as unknown as { id: string; title: string; starts_at: string; starts_at_tbd: boolean; status: string; metadata: Record<string, unknown>; sports: { key: string } | null; leagues: { name: string } | null }
        if (!r.sports?.key || !Number.isFinite(Date.parse(r.starts_at))) continue
        events.push({ id: r.id, title: r.title, startsAt: new Date(r.starts_at), startsAtTbd: r.starts_at_tbd, status: r.status, metadata: r.metadata ?? {}, sportKey: r.sports.key, leagueName: r.leagues?.name ?? '' })
      }
      if ((data?.length ?? 0) < 1000) break
    }
    cache = { fetchedAt: Date.now(), events }
    return events
  })().finally(() => { pending = undefined })
  return pending
}

export function isPromotableEvent(event: ActivityEvent, now: number) {
  const start = event.startsAt.getTime()
  return !event.startsAtTbd && !['finished', 'cancelled', 'postponed'].includes(event.status)
    && start >= now - 3 * 3600000 && start <= now + 28 * DAY
}

// Explicit, source-verified season window. A calendar date alone never qualifies a promo.
export function isMlbPostseason(event: ActivityEvent, now: number) {
  return event.sportKey === 'baseball' && /^(MLB|Major League Baseball)$/i.test(event.leagueName)
    && now >= Date.parse('2026-09-29T00:00:00-04:00') && now < Date.parse('2026-11-01T00:00:00-04:00')
    && event.startsAt.getTime() < Date.parse('2026-11-01T00:00:00-04:00') && isPromotableEvent(event, now)
}

export function eventHeat(event: ActivityEvent, now: number) {
  if (!isPromotableEvent(event, now)) return -1
  const hours = (event.startsAt.getTime() - now) / 3600000
  const urgent = hours <= 24 ? 40 : hours <= 72 ? 30 : hours <= 168 ? 15 : 0
  const major = /\b(final|championship|playoff|postseason|grand final|grand prix|major)\b/i.test(`${event.title} ${event.metadata.round ?? ''}`) ? 35 : 0
  return urgent + major + (isMlbPostseason(event, now) ? 100 : 0)
}

export function rankActiveSports(events: ActivityEvent[], now: number) {
  const groups = new Map<string, ActivityEvent[]>()
  for (const event of events.filter(event => isPromotableEvent(event, now))) {
    const group = groups.get(event.sportKey) ?? []; group.push(event); groups.set(event.sportKey, group)
  }
  return [...groups].map(([sportKey, fixtures]) => {
    const ranked = [...fixtures].sort((a,b) => eventHeat(b,now)-eventHeat(a,now) || a.startsAt.getTime()-b.startsAt.getTime())
    const feature = ranked[0]
    const playoffs = ranked.some(event => isMlbPostseason(event,now))
    const sport = getSport(sportKey)
    return { sportKey, fixtures, feature, score: eventHeat(feature,now), title: playoffs ? 'MLB Playoffs' : `${sport?.label ?? sportKey} this week`, bannerTitle: playoffs ? 'MLB Playoffs' : `${sport?.label ?? sportKey} Channel`, label: playoffs ? 'Postseason · October 2026' : 'Coming up', detail: playoffs ? 'Division Series and the road to the World Series. Follow the confirmed games.' : `${feature.leagueName}: ${feature.title}` }
  }).sort((a,b) => b.score-a.score || a.feature.startsAt.getTime()-b.feature.startsAt.getTime() || a.sportKey.localeCompare(b.sportKey))
}

export function useSportActivity() {
  const now = useNow()
  const [state, setState] = useState<{ events: ActivityEvent[]; loading: boolean; error: boolean }>({ events: cache?.events ?? [], loading: !cache, error: false })
  useEffect(() => {
    let cancelled = false
    const refresh = () => loadActivity().then(events => { if (!cancelled) setState({ events, loading: false, error: false }) }).catch(() => { if (!cancelled) setState({ events: [], loading: false, error: true }) })
    void refresh()
    const timer = setInterval(refresh,300000)
    return () => { cancelled = true; clearInterval(timer) }
  }, [])
  return { ...state, events: state.events.filter(event=>isPromotableEvent(event,now)), ranked: rankActiveSports(state.events,now), now }
}
