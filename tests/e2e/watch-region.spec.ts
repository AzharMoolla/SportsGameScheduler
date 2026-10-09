import { expect, test } from '@playwright/test'

test('NFL watch options follow the viewing country without cross-country fallback', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('mp.onboarded', '1')
    localStorage.setItem('mp.prefs', JSON.stringify({ timezone: 'America/Toronto', city: 'Toronto', hour12: false,
      locale: 'en', regionCode: 'CA', broadcastRegion: 'DE', themeMode: 'dark' }))
  })
  await page.goto('/sports/football')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.locator('[aria-label="Where to watch in DE"]').first()).toBeVisible()
  const options = page.locator('[aria-label="Where to watch in DE"]').first()
  await expect(options.locator('a').first()).toHaveAttribute('href', /^https:\/\//)
  await expect(options.locator('a').first()).toHaveAttribute('title', /Check coverage|Event listing/)
  await expect(options.getByRole('link', { name: /^FOX/ })).toHaveCount(0)
})
