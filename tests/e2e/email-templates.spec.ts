import { expect, test } from '@playwright/test'

test.describe('email template presentation', () => {
  for (const template of [
    { path: '/supabase/templates/magic-link.html', heading: /your schedule is ready/i },
    { path: '/supabase/templates/confirm-signup.html', heading: /make it your sports board/i },
  ]) {
    test(`${template.path} stays readable at the project viewport`, async ({ page }) => {
      await page.goto(template.path)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(template.heading)
      await expect(page.locator('.primary-button')).toBeVisible()

      const dimensions = await page.evaluate(() => ({
        viewport: window.innerWidth,
        document: document.documentElement.scrollWidth,
        panel: document.querySelector('.panel')?.getBoundingClientRect().width ?? 0,
      }))
      expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport)
      expect(dimensions.panel).toBeLessThanOrEqual(Math.min(600, dimensions.viewport))
    })
  }

  test('alert layout handles dark mode, images off and a narrow viewport', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 })
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.route('**/*.png', route => route.abort())
    await page.goto('/docs/previews/emails/time_change.html')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Preview: Toronto vs Boston')
    await expect(page.getByRole('link', { name: 'View event', exact: true })).toBeVisible()
    await expect(page.getByText('Europe/London')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Manage or stop alerts' })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  })
})
