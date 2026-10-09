import fs from 'node:fs/promises'
import { WATCH_PROVIDERS } from '../src/lib/watchProviders.ts'

// HTTP health is separate from event rights and subscriber blackout eligibility.
const pending = [...WATCH_PROVIDERS]
const results = []
await Promise.all(Array.from({ length: 4 }, async () => {
  while (pending.length) {
    const provider = pending.shift()
    try {
      const response = await fetch(provider.url, { signal: AbortSignal.timeout(9000), headers: { 'User-Agent': 'SilboSportsLinkHealth/1.0' } })
      results.push({ key: provider.key, url: provider.url, status: response.status, destination: response.url,
        health: response.status === 404 || response.status === 410 ? 'broken' : response.ok ? 'reachable' : 'needs_browser_review' })
      await response.body?.cancel()
    } catch { results.push({ key: provider.key, url: provider.url, health: 'network_unverified' }) }
  }
}))
results.sort((a, b) => a.key.localeCompare(b.key))
await fs.mkdir('docs/data', { recursive: true })
await fs.writeFile('docs/data/watch-destination-audit-2026-10-08.json', JSON.stringify({ checked_at: new Date().toISOString(),
  scope: 'HTTP destinations only; does not establish current rights, individual event carriage or blackout eligibility', results }, null, 2))
console.log(JSON.stringify({ total: results.length, counts: results.reduce((acc, row) => ({ ...acc, [row.health]: (acc[row.health] ?? 0) + 1 }), {}),
  broken: results.filter(row => row.health === 'broken').map(row => ({ key: row.key, url: row.url, status: row.status })) }))
