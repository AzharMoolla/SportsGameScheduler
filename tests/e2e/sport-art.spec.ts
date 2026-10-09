import { expect, test } from '@playwright/test'

const remaining = ['football', 'hockey', 'motorsport', 'combat', 'track', 'olympic', 'custom']
const refreshed = ['baseball', 'soccer', 'golf', 'tennis', ...remaining]
// The mobile directory exposes secondary sports, which share the custom emblem.
const labels: Record<string, string> = { football: 'American Football', combat: 'Combat Sports', track: 'Track & Field', olympic: 'Olympic Sports', custom: 'Cricket' }
for (const sport of refreshed) {
  test(`${sport} has matching banner and menu emblems in both themes`, async ({ page }, testInfo) => {
    await page.addInitScript(() => localStorage.setItem('mp.onboarded', '1'))
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(`/sports/${sport}`)
    for (const mode of ['broadcast', 'program']) {
      const revision = sport === 'football' ? (mode === 'program' ? 'v14' : 'v15') : mode === 'program' && sport === 'combat' ? 'v8' : sport === 'hockey' ? 'v7' : remaining.includes(sport) ? 'v6' : sport === 'soccer' ? 'v1' : 'v2'
      const bannerRevision = sport === 'football' ? (mode === 'program' ? 'v14' : 'v15') : mode === 'broadcast' && sport === 'combat' ? 'v12' : mode === 'program' && ['combat', 'olympic', 'custom'].includes(sport) ? 'v8' : sport === 'hockey' ? 'v7' : remaining.includes(sport) ? 'v6' : sport === 'tennis' ? (mode === 'program' ? 'v5' : 'v4') : sport === 'golf' ? 'v3' : sport === 'soccer' && mode === 'program' ? 'v1' : 'v2'
      const toggle = page.getByRole('button', { name: mode === 'broadcast' ? 'Switch to Broadcast Dark' : 'Switch to Program Light', exact: true })
      if (await toggle.isVisible()) await toggle.click()
      const banner = page.locator('.sport-channel-banner--concept')
      await expect(banner.getByRole('heading', { level: 1 })).toBeVisible()
      await expect(banner).toHaveCSS('background-image', new RegExp(`${sport}-${mode}-${bannerRevision}.webp`))
      await expect(banner.getByRole('link', { name: /Sync schedule/i })).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy()
      await banner.screenshot({ path: `docs/design-review/sport-art-${remaining.includes(sport) ? 'v6' : 'v1'}/${sport}-${mode}-${testInfo.project.name}.png` })
      const desktopMenu = await page.locator('.sport-switcher-trigger').isVisible()
      if (desktopMenu) await page.locator('.sport-switcher-trigger').click()
      else await page.getByRole('navigation', { name: 'Primary mobile navigation' }).getByRole('link', { name: 'Sports', exact: true }).click()
      const icon = desktopMenu
        ? page.getByRole('menu').locator(`img[src="/assets/sport-icons/studio/${sport}-${mode}-${revision}.webp"]`)
        : page.getByRole('img', { name: `${labels[sport] ?? sport[0].toUpperCase()+sport.slice(1)} icon`, exact: true })
      await icon.scrollIntoViewIfNeeded()
      await expect(icon).toBeVisible()
      await expect(icon).toHaveAttribute('src', `/assets/sport-icons/studio/${sport}-${mode}-${revision}.webp`)
      await expect.poll(() => icon.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
      if (desktopMenu) await page.keyboard.press('Escape')
      else await page.goto(`/sports/${sport}`)
    }
  })
}







