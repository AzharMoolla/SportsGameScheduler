import { Apple, ArrowRight, LogIn, Mail, UserCircle, X } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAppState } from '../app/state-context'
import { getAvailableSignInProviders } from '../lib/supabase'
import { SIGN_IN_PROVIDERS, authCallbackError, signInError, type SignInProvider } from '../lib/authProviders'
import { Button } from './ui'

function ProviderMark({ provider }: { provider: SignInProvider }) {
  if (provider === 'apple') return <Apple size={19} aria-hidden="true" />
  if (provider === 'azure') return <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path fill="#f25022" d="M0 0h8v8H0z" /><path fill="#7fba00" d="M10 0h8v8h-8z" /><path fill="#00a4ef" d="M0 10h8v8H0z" /><path fill="#ffb900" d="M10 10h8v8h-8z" /></svg>
  return <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.36Z" /><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.05.97-3.38.97-2.61 0-4.83-1.77-5.62-4.15H3.03v2.59A10 10 0 0 0 12 22Z" /><path fill="#FBBC05" d="M6.38 13.9a6 6 0 0 1 0-3.8V7.51H3.03a10 10 0 0 0 0 8.98Z" /><path fill="#EA4335" d="M12 5.95c1.47 0 2.79.5 3.82 1.5l2.87-2.86A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.97 5.51l3.35 2.59C7.17 7.72 9.39 5.95 12 5.95Z" /></svg>
}

export function AuthButton() {
  const { auth, follows } = useAppState()
  const [callbackError] = useState(() => authCallbackError(window.location.hash))
  const [open, setOpen] = useState(Boolean(callbackError))
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState(callbackError)
  const [busy, setBusy] = useState(false)
  const [providers, setProviders] = useState<SignInProvider[]>([])
  const [providersLoading, setProvidersLoading] = useState(false)
  const panel = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (callbackError && window.location.hash.includes('error=')) window.history.replaceState(null, '', window.location.pathname + window.location.search)
    if (!open) return
    let cancelled = false
    getAvailableSignInProviders().then((available) => {
      if (!cancelled) setProviders(available)
    }).catch(() => {
      if (!cancelled) setProviders([])
    }).finally(() => { if (!cancelled) setProvidersLoading(false) })
    const dismiss = (event: PointerEvent) => {
      if (!trigger.current?.contains(event.target as Node)) setOpen(false)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        trigger.current?.querySelector<HTMLButtonElement>('button')?.focus()
      }
    }
    panel.current?.querySelector<HTMLButtonElement>('button')?.focus()
    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('keydown', escape)
    return () => {
      cancelled = true
      document.removeEventListener('pointerdown', dismiss)
      document.removeEventListener('keydown', escape)
    }
  }, [open, callbackError])

  async function submitMagicLink(event: FormEvent) {
    event.preventDefault()
    if (!email.trim() || busy) return
    setBusy(true)
    setMessage('')
    try {
      await auth.signInWithMagicLink(email.trim())
      setMessage('Check your inbox for a one-time sign-in link. Open it on this device; check spam if it hasn’t arrived.')
    } catch (error) { setMessage(signInError(error)) }
    finally { setBusy(false) }
  }

  async function signIn(provider: SignInProvider) {
    if (busy) return
    setBusy(true)
    setMessage('')
    try { await auth.signInWithProvider(provider) }
    catch (error) { setMessage(signInError(error)) }
    finally { setBusy(false) }
  }

  if (!auth.configured) return <Button variant="ghost" disabled title="Account sync is not available in this environment" aria-label="Local-only mode" className="max-sm:h-9 max-sm:w-9 max-sm:px-0"><UserCircle size={16} /><span className="hidden sm:inline">Local</span></Button>
  if (auth.user) return <Link to="/account" title={auth.user.email ?? 'Account'} aria-label="Your account" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary/12 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary max-sm:h-9 max-sm:w-9 max-sm:px-0"><UserCircle size={16} /><span className="hidden sm:inline">Account</span></Link>

  return <div className="relative" ref={trigger}>
    <Button variant="ghost" onClick={() => { setOpen(!open); if (!open) setProvidersLoading(true) }} className="max-sm:h-9 max-sm:w-9 max-sm:px-0" aria-label="Sign in" aria-expanded={open} aria-controls="silbo-sign-in"><LogIn size={16} /><span className="hidden sm:inline">Sign in</span></Button>
    {open && <div id="silbo-sign-in" ref={panel} role="region" aria-labelledby="sign-in-title" className="auth-popover fixed inset-x-3 top-[4.6rem] z-50 max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-card border border-primary/20 bg-surface shadow-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-[calc(100%+10px)] sm:w-96">
      <div aria-hidden="true" className="flex h-1"><span className="flex-1 bg-primary" /><span className="flex-1 bg-cyan-400" /><span className="flex-1 bg-amber-400" /><span className="flex-1 bg-pink-400" /></div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3"><div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-primary">Your personal sports board</p><h2 id="sign-in-title" className="mt-2 text-xl font-bold text-ink">Take your schedule with you.</h2></div><button type="button" aria-label="Close sign in" onClick={() => { setOpen(false); trigger.current?.querySelector<HTMLButtonElement>('button')?.focus() }} className="rounded p-1.5 text-ink/65 hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-primary"><X size={18} /></button></div>
        <p className="mt-2 text-sm leading-relaxed text-ink/70">Sync your follows and preferences across devices. Your local schedule stays with you.</p>
        <div className="mt-4 space-y-2" aria-busy={providersLoading}>
          {SIGN_IN_PROVIDERS.filter(({ id }) => providers.includes(id)).map(({ id, label }) => <button key={id} onClick={() => void signIn(id)} disabled={busy} className="flex min-h-11 w-full items-center justify-center gap-3 rounded-lg border border-ink/20 bg-surface px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"><ProviderMark provider={id} />{id === 'apple' ? 'Sign in' : 'Continue'} with {label}</button>)}
          {providersLoading && <p role="status" className="text-xs text-ink/65">Checking sign-in options…</p>}
        </div>
        {providers.length > 0 && <div className="my-4 flex items-center gap-3 text-xs text-ink/60"><span className="h-px flex-1 bg-ink/15" />or use your email<span className="h-px flex-1 bg-ink/15" /></div>}
        <form onSubmit={submitMagicLink} className="mt-4 space-y-2">
          <label className="block"><span className="mb-1 block text-sm font-medium text-ink/80">Email</span><input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="w-full rounded-lg border border-primary/25 bg-surface px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40" /></label>
          <Button className="min-h-11 w-full" type="submit" disabled={busy}><Mail size={16} />{busy ? 'Please wait…' : 'Send magic link'}<ArrowRight size={15} /></Button>
          <p className="text-xs text-ink/65">A secure, one-time link. No password to remember.</p>
        </form>
        {message && <p role="status" aria-live="polite" className="mt-3 rounded-lg bg-primary/10 p-3 text-sm font-medium text-ink">{message}</p>}
        {follows.length > 0 && <p className="mt-4 text-xs text-ink/65">Your {follows.length} local {follows.length === 1 ? 'follow merges' : 'follows merge'} into your account when you sign in.</p>}
        <p className="mt-4 border-t border-ink/10 pt-3 text-xs text-ink/60">Read our <Link className="underline" to="/privacy" onClick={() => setOpen(false)}>Privacy Policy</Link> and <Link className="underline" to="/terms" onClick={() => setOpen(false)}>Terms</Link>.</p>
      </div>
    </div>}
  </div>
}
