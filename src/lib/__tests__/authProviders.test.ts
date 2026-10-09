import { afterEach, describe, expect, test, vi } from 'vitest'
import { authCallbackError, getSignInProviders, signInError } from '../authProviders'

afterEach(() => vi.unstubAllGlobals())
describe('public sign-in availability', () => {
  test('shows only supported, explicitly enabled providers', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ external: { google: true, apple: false, azure: true, github: true } }))))
    expect(await getSignInProviders('https://project.supabase.co', 'public-key')).toEqual(['google', 'azure'])
  })
  test('does not convert truthy strings to enabled providers', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ external: { google: 'true' } }))))
    expect(await getSignInProviders('https://project.supabase.co', 'public-key')).toEqual([])
  })
  test('rejects unavailable settings without inventing sign-in options', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 503 })))
    await expect(getSignInProviders('https://project.supabase.co', 'public-key')).rejects.toThrow('temporarily unavailable')
  })
  test('does not display raw provider errors or sensitive values', () => {
    expect(signInError(new Error('secret provider diagnostic'))).not.toContain('secret')
    expect(signInError({ code: 'over_email_send_rate_limit' })).toContain('wait')
  })
  test('handles cancelled and expired callbacks without displaying provider descriptions', () => {
    expect(authCallbackError('#access_token=example')).toBe('')
    expect(authCallbackError('#error=access_denied&error_description=private')).toContain('expired')
    expect(authCallbackError('#error=invalid_request&error_description=private')).not.toContain('private')
  })
})
