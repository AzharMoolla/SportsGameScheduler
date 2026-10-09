import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('mp.onboarded', '1'))
})

test('sign-in options follow project settings and dismiss with Escape', async ({ page }) => {
  await page.route('**/auth/v1/settings', route => route.fulfill({ json: { external: { google: true, apple: true, azure: true } } }))
  await page.goto('/')
  const trigger = page.getByRole('button', { name: 'Sign in', exact: true })
  await trigger.click()
  await expect(page.getByRole('button', { name: 'Continue with Google', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sign in with Apple', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Continue with Microsoft', exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('region', { name: 'Take your schedule with you.' })).toHaveCount(0)
  await expect(trigger).toBeFocused()
})

test('unconfigured providers stay hidden, including contextual account prompts', async ({ page }) => {
  await page.route('**/auth/v1/settings', route => route.fulfill({ json: { external: { google: false, apple: false, azure: false } } }))
  await page.goto('/settings/alerts')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page.getByText('Checking sign-in options…')).toHaveCount(0)
  await expect(page.getByRole('button', { name: /with Google|with Apple|with Microsoft/ })).toHaveCount(0)
  await expect(page.locator('#silbo-sign-in').getByRole('button', { name: 'Send magic link' })).toBeVisible()
})

test('email delivery errors remain readable without revealing raw diagnostics', async ({ page }) => {
  await page.route('**/auth/v1/settings', route => route.fulfill({ json: { external: {} } }))
  await page.route('**/auth/v1/otp*', route => route.fulfill({ status: 429, headers: { 'x-supabase-api-version': '2024-01-01' }, json: { code: 'over_email_send_rate_limit', msg: 'Private mail transport diagnostic' } }))
  await page.goto('/')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await page.locator('#silbo-sign-in').getByRole('textbox', { name: 'Email', exact: true }).fill('test@example.com')
  await page.getByRole('button', { name: 'Send magic link', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('wait a few minutes')
  await expect(page.getByText('Private mail transport diagnostic')).toHaveCount(0)
})
