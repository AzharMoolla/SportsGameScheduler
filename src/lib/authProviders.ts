export const SIGN_IN_PROVIDERS = [
  { id: 'google', label: 'Google' },
  { id: 'apple', label: 'Apple' },
  { id: 'azure', label: 'Microsoft' },
] as const

export type SignInProvider = (typeof SIGN_IN_PROVIDERS)[number]['id']

/** Public Auth settings contain enabled flags, never OAuth credentials. Fail closed. */
export async function getSignInProviders(url: string, publishableKey: string): Promise<SignInProvider[]> {
  const response = await fetch(`${url.replace(/\/$/, '')}/auth/v1/settings`, {
    headers: { apikey: publishableKey },
    signal: AbortSignal.timeout(6000),
  })
  if (!response.ok) throw new Error('Sign-in options are temporarily unavailable.')
  const settings = await response.json() as { external?: Record<string, unknown> }
  return SIGN_IN_PROVIDERS.filter(({ id }) => settings.external?.[id] === true).map(({ id }) => id)
}

export function signInError(error: unknown) {
  const code = (error as { code?: string })?.code
  if ((error as { status?: number })?.status === 429 || code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit') return 'Too many sign-in requests. Please wait a few minutes before trying again.'
  if (code === 'email_address_not_authorized') return 'Email sign-in is temporarily unavailable. Please try another available sign-in option.'
  return 'Sign-in could not be started. Please try again, or use another available option.'
}

export function authCallbackError(hash: string) {
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  if (!params.has('error')) return ''
  return params.get('error') === 'access_denied'
    ? 'Sign-in was cancelled or the link has expired. Try signing in again.'
    : 'That sign-in could not be completed. Please request a new link or try another option.'
}
