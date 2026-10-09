import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('mp.onboarded', '1'))
})

test('home discovery links and keyboard search reach a sport', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Your sports\.\s*Your time\./)
  const hero = page.locator('[data-home-section="hero"]')
  await expect(hero.getByRole('link', { name: 'Browse sports' })).toHaveAttribute('href', '/explore')
  expect(await hero.locator('a button, button a').count()).toBe(0)
  const search = page.getByRole('combobox')
  await search.fill('basketball')
  await expect(page.getByRole('option').first()).toBeVisible()
  const activeId = await search.getAttribute('aria-activedescendant')
  expect(activeId).toBeTruthy()
  await expect(page.locator(`[id="${activeId}"]`)).toHaveAttribute('aria-selected', 'true')
  await search.press('Escape')
  await search.press('Enter')
  await expect(page).toHaveURL(/\/$/)
  await search.press('ArrowDown')
  await expect(search).toHaveAttribute('aria-expanded', 'true')
  await search.press('Enter')
  await expect(page).toHaveURL(/basketball/)
})

test('ticker pauses and stays off the schedule screen', async ({ page }) => {
  await page.goto('/')
  const ticker = page.locator('[aria-label="This week\'s events ticker"]')
  await ticker.getByRole('button', { name: 'Pause event ticker' }).click()
  await expect(ticker.getByRole('button', { name: 'Resume event ticker' })).toHaveAttribute('aria-pressed', 'true')
  await page.mouse.move(0, 0)
  const track = ticker.locator('div[style*="translate3d"]')
  const before = await track.getAttribute('style')
  await page.waitForTimeout(150)
  expect(await track.getAttribute('style')).toBe(before)
  await page.goto('/my-schedule')
  await expect(ticker).toHaveCount(0)
})

test('reduced motion keeps ticker static and removes duplicate links', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const ticker = page.locator('[aria-label="This week\'s events ticker"]')
  await expect(ticker).toBeVisible()
  await expect(ticker.getByRole('button', { name: /event ticker/ })).toHaveCount(0)
  expect(await ticker.locator('a[aria-hidden="true"]').count()).toBe(0)
  await expect(ticker.locator('div[style]')).toHaveCSS('transform', 'none')
})

test('home and explore reflow at 320px without horizontal scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 })
  for (const route of ['/', '/explore']) {
    await page.goto(route)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    expect(await page.locator('main a button, main button a').count()).toBe(0)
  }
})

test('skip link moves keyboard focus to the main content', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#main-content')).toBeFocused()
})
