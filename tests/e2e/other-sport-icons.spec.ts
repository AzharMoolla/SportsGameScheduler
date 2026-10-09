import { expect, test } from '@playwright/test'

test('other sports have distinct equipment icons in both themes and filters', async ({ page }, testInfo) => {
  await page.addInitScript(() => localStorage.setItem('mp.onboarded', '1'))
  await page.goto('/other-sports')
  for (const mode of ['broadcast', 'program']) {
    const toggle = page.getByRole('button', { name: mode === 'broadcast' ? 'Switch to Broadcast Dark' : 'Switch to Program Light', exact: true })
    if (await toggle.isVisible()) await toggle.click()
    const icons = page.locator('main [data-sport-icon]')
    await expect(icons).toHaveCount(18)
    const keys = await icons.evaluateAll(nodes => nodes.map(node => node.getAttribute('data-sport-icon')))
    expect(new Set(keys).size).toBe(17)
    const colors = await icons.evaluateAll(nodes => nodes.map(node => getComputedStyle(node).color))
    expect(new Set(colors).size).toBe(1)
    await expect(page.getByRole('img', { name: 'Snooker icon', exact: true })).toBeVisible()
    await page.screenshot({ path: `docs/design-review/sport-art-v8/other-sports-${mode}-${testInfo.project.name}.png`, fullPage: true })
  }
  await page.getByPlaceholder('Search sports').fill('badminton')
  await expect(page.locator('article')).toHaveCount(1)
  await expect(page.locator('article [data-sport-icon="badminton"]')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy()
})
