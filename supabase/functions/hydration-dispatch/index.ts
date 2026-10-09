import { createClient } from 'npm:@supabase/supabase-js@2'

// Database-issued, short-lived, single-use tickets authorize cron dispatch.
// The service credential stays inside this function and the existing workers.
const url = Deno.env.get('SUPABASE_URL')!
const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const db = createClient(url, key)
const workers = new Set(['provider-hydrate', 'provider-hydrate-openf1', 'provider-hydrate-pandascore', 'provider-hydrate-players', 'provider-hydrate-broadcasts', 'ics-feed-ingest','provider-probe-apisports','provider-hydrate-apisports'])

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  const body = await req.json().catch(() => null)
  if (!body || typeof body.ticket !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.ticket)) {
    return new Response('Unauthorized', { status: 401 })
  }
  // Conditional UPDATE atomically consumes the ticket: concurrent replays lose.
  const { data, error } = await db.from('maintenance_hydration_requests')
    .update({ claimed_at: new Date().toISOString(), status: 'running' })
    .eq('id', body.ticket).is('claimed_at', null)
    .gt('created_at', new Date(Date.now() - 10 * 60_000).toISOString())
    .select('worker, payload').maybeSingle()
  if (error || !data || !workers.has(data.worker)) return new Response('Unauthorized', { status: 401 })
  try {
    const response = await fetch(`${url}/functions/v1/${data.worker}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify(data.payload),
      signal: AbortSignal.timeout(135_000),
    })
    const result = await response.json().catch(() => ({ error: 'Worker returned non-JSON response' }))
    const ok = response.ok && result.ok !== false
    await db.from('maintenance_hydration_requests').update({
      finished_at: new Date().toISOString(), status: ok ? 'success' : 'failed',
      result: { http_status: response.status, ...result },
    }).eq('id', body.ticket)
    return Response.json({ ok, worker: data.worker, result }, { status: ok ? 200 : 502 })
  } catch {
    await db.from('maintenance_hydration_requests').update({
      finished_at: new Date().toISOString(), status: 'failed',
      result: { error: 'Worker timed out or could not be reached; inspect provider_sync_runs before retrying' },
    }).eq('id', body.ticket)
    return Response.json({ ok: false, worker: data.worker }, { status: 502 })
  }
})
