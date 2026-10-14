import { expect, test } from '@playwright/test'

test('a newly announced fighter card appears in an open personal schedule', async ({ page }) => {
  const fighterId = '11111111-1111-4111-8111-111111111111'
  const eventId = '22222222-2222-4222-8222-222222222222'
  const newEventId = '33333333-3333-4333-8333-333333333333'
  let announced = false
  await page.addInitScript(({ fighterId }) => {
    localStorage.setItem('mp.onboarded', '1')
    localStorage.setItem('mp.follows', JSON.stringify([{ targetType: 'competitor', targetId: fighterId, intent: 'watch' }]))
  }, { fighterId })
  await page.route('**/rest/v1/**', async route => {
    const url = new URL(route.request().url())
    let rows: unknown[] = []
    if (url.pathname.endsWith('/event_competitors') && url.searchParams.get('select') === 'event_id') {
      rows = [{ event_id: eventId }, ...(announced ? [{ event_id: newEventId }] : [])]
    } else if (url.pathname.endsWith('/events')) {
      const event = { starts_at: new Date(Date.now() + 86400000).toISOString(), starts_at_tbd: false, status: 'scheduled',
        kind: 'fight_card', metadata: {}, league_id: null, venues: null, sports: { key: 'combat_sports' },
        leagues: { name: 'UFC' }, updated_at: new Date().toISOString(), version: 1 }
      rows = [{ ...event, id: eventId, title: 'Existing UFC card' }, ...(announced ? [{ ...event, id: newEventId, title: 'Newly announced UFC card' }] : [])]
    }
    await route.fulfill({ json: rows })
  })
  await page.clock.install()
  await page.goto('/my-schedule')
  await expect(page.getByText('Existing UFC card', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('Newly announced UFC card', { exact: true })).toHaveCount(0)
  announced = true
  await page.clock.fastForward(5 * 60_000)
  await expect(page.getByText('Newly announced UFC card', { exact: true }).first()).toBeVisible()
})
