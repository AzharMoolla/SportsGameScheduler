import { createClient } from 'npm:@supabase/supabase-js@2'
import { authorizeMaintenance } from '../_shared/maintenance-auth.ts'
import { broadcastCountryCode } from '../../../src/lib/broadcastCountry.ts'
import { matchWatchProvider, safeWatchUrl } from '../../../src/lib/watchProviders.ts'

const key = Deno.env.get('THESPORTSDB_API_KEY') ?? ''
const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
type Listing = { idEvent?: string; strCountry?: string; strChannel?: string }

Deno.serve(async req => {
  const rejected = await authorizeMaintenance(req, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
  if (rejected) return rejected
  if (!key) return Response.json({ ok: false, error: 'Provider key not configured' }, { status: 500 })
  const checked = new Date().toISOString()
  const { data: run } = await db.from('provider_sync_runs').insert({ provider_key: 'thesportsdb_tv', sport_key: 'multi', status: 'running' }).select('id').single()
  const rows = new Map<string, Record<string, unknown>>()
  const watchRows = new Map<string, Record<string, unknown>>()
  const { data: providers } = await db.from('watch_providers').select('key,direct_url').eq('is_active', true)
  const destinations = new Map((providers ?? []).map(p => [p.key, safeWatchUrl(p.direct_url)]))
  const counters = { calls: 0, listings: 0, matched: 0, linked: 0, unmappedCountries: 0 }
  let stopped = 'done'
  try {
    for (let day = 0; day < 8; day++) {
      const date = new Date(Date.now() + day * 86400_000).toISOString().slice(0, 10)
      await new Promise(resolve => setTimeout(resolve, 2100))
      counters.calls++
      const response = await fetch(`https://www.thesportsdb.com/api/v1/json/${key}/eventstv.php?d=${date}`, { signal: AbortSignal.timeout(12000) })
      if (response.status === 429) { stopped = 'rate_limited'; break }
      if (!response.ok) throw new Error(`TV listing request failed (${response.status})`)
      const json = await response.json()
      const listings: Listing[] = json.tvevents ?? []
      counters.listings += listings.length
      const ids = [...new Set(listings.map(row => row.idEvent).filter(Boolean))]
      const events = new Map<string, string>()
      for (let i = 0; i < ids.length; i += 200) {
        const { data, error } = await db.from('events').select('id,provider_event_id')
          .eq('provider_key', 'thesportsdb').eq('visibility', 'public').in('provider_event_id', ids.slice(i, i + 200))
        if (error) throw error
        for (const event of data ?? []) events.set(event.provider_event_id, event.id)
      }
      for (const listing of listings) {
        const eventId = listing.idEvent ? events.get(listing.idEvent) : null
        const country = broadcastCountryCode(listing.strCountry)
        if (!country) { counters.unmappedCountries++; continue }
        if (!eventId || !listing.strChannel) continue
        const channel = listing.strChannel.trim()
        rows.set(`${eventId}|${country}|${channel}`, {
          event_id: eventId, country, channel, kind: 'tv', stream_url: null,
          source_key: 'thesportsdb', source_url: `https://www.thesportsdb.com/event/${listing.idEvent}`,
          last_checked_at: checked,
        })
        const provider = matchWatchProvider(channel, country)
        const destination = provider ? destinations.get(provider.key) : null
        if (provider && destination) {
          const rule = `tv:${eventId}:${country}:${provider.key}`
          watchRows.set(rule, {
            rule_key: rule, provider_key: provider.key, label: channel, event_id: eventId,
            country_codes: [country], sport_keys: [], link_kind: 'official', url: destination,
            source_confidence: 'provider', priority: 1, is_active: true,
            ends_at: `${new Date(Date.parse(date) + 2 * 86400_000).toISOString()}`,
            notes: `Event-specific TheSportsDB TV listing checked ${checked}; local blackout/subscription restrictions remain provider-controlled.`,
          })
        }
      }
    }
    const values = [...rows.values()]
    for (let i = 0; i < values.length; i += 250) {
      const { error } = await db.from('broadcasts').upsert(values.slice(i, i + 250), { onConflict: 'event_id,country,channel' })
      if (error) throw error
    }
    counters.matched = rows.size
    const links = [...watchRows.values()]
    for (let i = 0; i < links.length; i += 250) {
      const { error } = await db.from('watch_links').upsert(links.slice(i, i + 250), { onConflict: 'rule_key' })
      if (error) throw error
    }
    counters.linked = links.length
    await db.from('provider_sync_runs').update({ status: 'success', fetched_count: counters.listings, changed_count: rows.size,
      finished_at: new Date().toISOString(), error: stopped === 'done' ? null : stopped }).eq('id', run!.id)
    return Response.json({ ok: true, counters, stopped })
  } catch {
    await db.from('provider_sync_runs').update({ status: 'failed', fetched_count: counters.listings, finished_at: new Date().toISOString(),
      error: 'TV listing request or database write failed; no unverified channel URLs were imported' }).eq('id', run!.id)
    return Response.json({ ok: false, counters }, { status: 502 })
  }
})
