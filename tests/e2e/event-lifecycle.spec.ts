import { expect, test } from '@playwright/test'

test('recent final results remain in the schedule and on their event page', async ({ page }) => {
  await page.addInitScript(() => { localStorage.setItem('mp.onboarded', '1') })
  const id = 'aaaaaaaa-1111-4444-8888-bbbbbbbbbbbb'
  const fixture = { id, title: 'Lifecycle A vs Lifecycle B', status: 'finished', kind: 'match',
    starts_at: new Date(Date.now() - 4 * 3600_000).toISOString(), starts_at_tbd: false,
    completed_at: new Date(Date.now() - 3600_000).toISOString(), updated_at: new Date().toISOString(), version: 2,
    league_id: null, leagues: { name: 'NFL' }, sports: { key: 'american_football' }, venues: null,
    metadata: { result: { home_score: 0, away_score: 14, home_team: 'Lifecycle A', away_team: 'Lifecycle B' } } }
  let includesCompletionWindow = false
  await page.route('**/rest/v1/events?*', async route => {
    const query = new URL(route.request().url()).searchParams
    if (query.has('or')) includesCompletionWindow = query.get('or')!.includes('completed_at.gte.')
    await route.fulfill({ json: [fixture] })
  })
  await page.goto('/sports/football')
  await expect(page.getByLabel('Final result').first()).toContainText('Final: Lifecycle A 0 – Lifecycle B 14')
  expect(includesCompletionWindow).toBe(true)
  await page.goto(`/events/${id}`)
  await expect(page.getByLabel('Final result')).toContainText('Final: Lifecycle A 0 – Lifecycle B 14')
})
