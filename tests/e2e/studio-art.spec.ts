import { expect, test } from '@playwright/test'

for (const art of ['studio', 'concept']) {
test(`${art} study loads in both themes and reflows on mobile`, async ({ page }, testInfo) => {
  await page.addInitScript(() => localStorage.setItem('mp.onboarded', '1'))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(`/sports/basketball?art=${art}`)
  const banner = page.locator('.sport-channel-banner--studio')
  await expect(banner.getByRole('heading', { level: 1 })).toHaveText('Basketball Channel')
  for (const mode of ['broadcast', 'program']) {
    const toggle = page.getByRole('button', { name: mode === 'broadcast' ? 'Switch to Broadcast Dark' : 'Switch to Program Light', exact: true })
    if (await toggle.isVisible()) await toggle.click()
    const suffix = art === 'concept' ? (mode === 'program' ? 'clean-v8' : 'concept-v2') : 'banner'
    await expect(banner).toHaveCSS('background-image', new RegExp(`basketball-${mode}-${suffix}.webp`))
    const asset = await page.request.get(`/assets/sport-banners/studio/basketball-${mode}-${suffix}.webp`)
    expect(asset.ok()).toBeTruthy()
    await expect(banner.getByRole('link', { name: /Sync schedule/i })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy()
    await banner.screenshot({ path: `docs/design-review/blender/basketball-${mode}-${art}-${testInfo.project.name}.png` })
  }
})
}

test('approved watercolor art is the default basketball light banner', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('mp.onboarded', '1'))
  await page.goto('/sports/basketball')
  const lightToggle = page.getByRole('button', { name: 'Switch to Program Light', exact: true })
  if (await lightToggle.isVisible()) await lightToggle.click()
  await expect(page.locator('.sport-channel-banner--concept')).toHaveCSS('background-image', /basketball-program-clean-v8.webp/)
})
