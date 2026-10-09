import { CalendarPlus, Copy, ExternalLink, Power, Trash2, RotateCcw, RefreshCw } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useAppState } from '../app/state-context'
import { Badge, Button, EmptyState, Field, Panel, PanelHeading } from '../components/ui'
import { SignUpNudge } from '../components/SignUpNudge'
import { copyToClipboard } from '../lib/clipboard'
import { getSupabaseClient } from '../lib/supabase'
import { useCustomLeagues } from '../data/customLeagues'
import { mergeFeedsOnSignIn, sha256Hex } from '../data/feeds'
import { getFeeds, newId, newToken, saveFeeds, type CalendarFeed } from '../lib/store'

// Live subscribed calendars (Objective 6). When signed in, feeds are persisted to Supabase with a
// hashed token (a DB leak can't reuse the URL) and resolved by the deployed calendar-feed
// function. Signed-out users get a local preview and a nudge to sign in for a live URL.
const FEED_ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL ?? ''}/functions/v1/calendar-feed`

function feedUrl(feed: CalendarFeed) {
  return `${FEED_ENDPOINT}/${feed.token}.ics`
}

function webcalUrl(feed: CalendarFeed) {
  return feedUrl(feed).replace(/^https?:\/\//, 'webcal://')
}

export function CalendarFeedsPage({ embedded = false, customLeagueId }: { embedded?: boolean; customLeagueId?: string } = {}) {
  const { followedLeagueIds, followedCompetitorIds, followedEventIds, prefs, auth } = useAppState()
  const [feeds, setFeeds] = useState<CalendarFeed[]>(() => getFeeds())
  const [name, setName] = useState('My sports schedule')
  const [includePlaceholders, setIncludePlaceholders] = useState(false)
  const [includeBroadcasts, setIncludeBroadcasts] = useState(false)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const { leagues } = useCustomLeagues()
  const signedIn = Boolean(auth.user)
  const selectedCustomIds = customLeagueId ? [customLeagueId] : leagues.map(league => league.id)
  const currentFilters = { leagueIds: customLeagueId ? [] : followedLeagueIds, competitorIds: customLeagueId ? [] : followedCompetitorIds, eventIds: customLeagueId ? [] : followedEventIds, customLeagueIds: selectedCustomIds, reminderMinutes: [60] }
  const followCount = currentFilters.leagueIds.length + currentFilters.competitorIds.length + currentFilters.eventIds.length + selectedCustomIds.length

  // When signed in, the DB is the source of truth. Claim any feed previewed while signed-out into
  // the account, then show the unified server list. Tokens held locally on this device are
  // re-attached so their URL stays copyable; feeds created on another device list without a URL.
  useEffect(() => {
    if (!auth.user) return
    let cancelled = false
    getSupabaseClient().then(async (supabase) => {
      if (!supabase || cancelled) return
      const merged = await mergeFeedsOnSignIn(supabase, auth.user!.id, getFeeds())
      if (!cancelled) setFeeds(merged)
    }).catch(() => { if (!cancelled) setMessage('Could not load live feeds. Please try again.') })
    return () => {
      cancelled = true
    }
  }, [auth.user])

  function persistLocal(next: CalendarFeed[]) {
    saveFeeds(next)
    setFeeds(next)
  }

  async function createFeed(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    const token = newToken()
    const filters = currentFilters

    try {
      if (signedIn) {
        const supabase = await getSupabaseClient()
        if (!supabase) throw new Error('Supabase not configured')
        const tokenHash = await sha256Hex(token)
        const { data, error } = await supabase
          .from('calendar_feeds')
          .insert({
            user_id: auth.user!.id,
            name: name.trim() || 'My schedule',
            timezone: prefs.timezone,
            filters,
            token_hash: tokenHash,
            include_placeholders: includePlaceholders,
            include_broadcasts: includeBroadcasts,
            is_active: true,
          })
          .select('id, created_at')
          .single()
        if (error) throw error
        const feed: CalendarFeed = {
          id: data.id,
          token, // kept in-memory this session so the live URL is copyable once
          name: name.trim() || 'My schedule',
          timezone: prefs.timezone,
          filters,
          includePlaceholders,
          includeBroadcasts,
          isActive: true,
          createdAt: data.created_at,
        }
        setFeeds((current) => [feed, ...current])
        setMessage('Live feed created. Copy the URL now — for security it is only shown once.')
      } else {
        const feed: CalendarFeed = {
          id: newId(),
          token,
          name: name.trim() || 'My schedule',
          timezone: prefs.timezone,
          filters,
          includePlaceholders,
          includeBroadcasts,
          isActive: true,
          createdAt: new Date().toISOString(),
        }
        persistLocal([feed, ...feeds])
        setMessage('Preview feed created on this device. Sign in to get a live, auto-updating URL.')
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not create feed.')
    } finally {
      setBusy(false)
    }
  }

  async function copyUrl(feed: CalendarFeed) {
    if (!signedIn) { setMessage('Sign in to activate this preview and get a live URL.'); return }
    if (!feed.token) {
      setMessage('This feed’s URL was only shown once at creation. Delete and recreate it to get a new URL.')
      return
    }
    await copyToClipboard(feedUrl(feed))
    setMessage('Feed URL copied. Paste it into "Subscribe to calendar" in your calendar app.')
  }

  function openWebcal(feed: CalendarFeed) {
    if (!signedIn || !feed.token || !feed.isActive) return
    window.location.href = webcalUrl(feed)
    setMessage('Opening your calendar app if this device supports webcal links.')
  }

  async function updateFeed(feed: CalendarFeed, action: 'active' | 'delete' | 'rotate' | 'selection') {
    setBusy(true); setMessage('')
    try {
      const token = action === 'rotate' ? newToken() : feed.token
      const next = { ...feed, token, isActive: action === 'active' ? !feed.isActive : feed.isActive, filters: action === 'selection' ? currentFilters : feed.filters }
      if (signedIn) {
        const supabase = await getSupabaseClient()
        if (!supabase) throw new Error('Connection unavailable')
        const request = action === 'delete' ? supabase.from('calendar_feeds').delete().eq('id', feed.id) : supabase.from('calendar_feeds').update({ is_active: next.isActive, filters: next.filters, ...(action === 'rotate' ? { token_hash: await sha256Hex(token) } : {}) }).eq('id', feed.id)
        const { data, error } = await request.select('id').single()
        if (error || !data) throw new Error('Could not save this change. Please try again.')
        setFeeds(current => action === 'delete' ? current.filter(f => f.id !== feed.id) : current.map(f => f.id === feed.id ? next : f))
      } else {
        persistLocal(action === 'delete' ? feeds.filter(f => f.id !== feed.id) : feeds.map(f => f.id === feed.id ? next : f))
      }
      setMessage(action === 'rotate' ? 'New URL ready. The old URL no longer works; subscribe again with this URL.' : action === 'selection' ? 'Feed updated to your current selections. Your subscription URL stays the same.' : 'Change saved.')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not save this change.') }
    finally { setBusy(false) }
  }

  return (
    <div className="space-y-4">
      {!embedded && (
        <div>
          <h1 className="text-xl font-extrabold text-primary">Silbo Sync</h1>
          <p className="text-sm text-ink/60">
            A <strong>subscribed calendar feed</strong> keeps itself up to date when match times change. A
            one-time <strong>.ics download</strong> is just a snapshot. Prefer feeds for anything ongoing.
          </p>
        </div>
      )}

      {/* Breakpoints are viewport-based, so when this page is embedded in the guided-flow modal
          (~600px) on a desktop viewport, the lg: two-column grid would still kick in and crush
          both columns. Embedded = always a single readable column. */}
      <div className={embedded ? 'grid min-w-0 gap-4' : 'grid min-w-0 gap-4 lg:grid-cols-[360px_minmax(0,1fr)]'}>
        <Panel className="min-w-0 h-fit">
          <PanelHeading
            title="Create a feed"
            subtitle={`Includes your ${followCount} selected leagues, players, events & community schedules, in ${prefs.timezone}.`}
          />
          {!signedIn && <SignUpNudge trigger="feed" className="mb-3" />}
          <form onSubmit={createFeed} className="space-y-3">
            <Field label="Feed name" value={name} onChange={(e) => setName(e.target.value)} required />
            <label className="flex items-center gap-2 text-sm text-ink/70">
              <input
                type="checkbox"
                checked={includePlaceholders}
                onChange={(event) => setIncludePlaceholders(event.target.checked)}
              />
              Include events with a date but provisional time
            </label>
            <label className="flex items-center gap-2 text-sm text-ink/70">
              <input
                type="checkbox"
                checked={includeBroadcasts}
                onChange={(event) => setIncludeBroadcasts(event.target.checked)}
              />
              Include where-to-watch notes when available
            </label>
            <Button className="w-full" type="submit" disabled={busy || followCount === 0}>
              <CalendarPlus size={15} /> {busy ? 'Creating…' : 'Create feed'}
            </Button>
            {followCount === 0 && (
              <p className="text-xs text-ink/50">Save an event, follow a league or player, or create a community schedule first, then create a feed for them.</p>
            )}
          </form>
          <p className="mt-3 text-xs text-ink/50">Share a feed URL only with people who may see every selected event, including community notes. A feed holds up to 500 events and 30 days of history.
            Calendar apps decide their own refresh timing — updates can take a few hours to appear.
          </p>
        </Panel>

        <div className="min-w-0 space-y-3">
          <Panel><PanelHeading title="Subscribe in your calendar" /><p className="text-sm text-ink/70">Apple Calendar on Mac: File → New Calendar Subscription, paste the URL, then choose an auto-refresh interval. On iPhone: Calendar → Calendars → Add Calendar → Add Subscription Calendar. Google Calendar on the web: Other calendars → + → From URL. Outlook on the web: Add calendar → Subscribe from web.</p></Panel>
          {feeds.length === 0 && (
            <EmptyState
              title="No feeds yet"
              body="Create a feed, then subscribe to its URL from Apple Calendar, Google Calendar, or Outlook. Your schedule stays current automatically."
            />
          )}
          {feeds.filter(feed => !customLeagueId || feed.filters.customLeagueIds?.includes(customLeagueId) || feed.filters.customLeagueId === customLeagueId).map((feed) => (
            <Panel key={feed.id} className="flex min-w-0 flex-col items-stretch gap-3 overflow-hidden sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold">{feed.name}</h3>
                  {!signedIn ? <Badge tone="muted">Preview</Badge> : feed.isActive ? <Badge tone="secondary">Active</Badge> : <Badge tone="muted">Disabled</Badge>}
                </div>
                <p className="mt-0.5 truncate font-mono text-xs text-ink/50">
                  {!signedIn ? 'Sign in to activate a live URL' : feed.token ? feedUrl(feed) : 'Generate a new URL to subscribe from this device'}
                </p>
                <p className="text-xs text-ink/50">
                  {(feed.filters.leagueIds?.length ?? 0) + (feed.filters.competitorIds?.length ?? 0) + (feed.filters.eventIds?.length ?? 0) + (feed.filters.customLeagueIds?.length ?? 0)} picks - {feed.timezone}
                  {feed.includePlaceholders ? ' - TBD included' : ''}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:justify-end">
                <Button variant="ghost" disabled={busy || !signedIn} onClick={() => updateFeed(feed, 'rotate')} title="Generate a new URL"><RotateCcw size={14} /> New URL</Button>
                <Button variant="ghost" disabled={busy || followCount === 0} onClick={() => updateFeed(feed, 'selection')} title="Update to current selections"><RefreshCw size={14} /> Update picks</Button>
                <Button variant="subtle" onClick={() => copyUrl(feed)} title="Copy URL" disabled={busy || !signedIn || !feed.token || !feed.isActive}>
                  <Copy size={14} />
                </Button>
                <Button variant="subtle" onClick={() => openWebcal(feed)} title="Open webcal subscribe link" disabled={busy || !signedIn || !feed.token || !feed.isActive}>
                  <ExternalLink size={14} />
                </Button>
                <Button variant="ghost" disabled={busy} onClick={() => updateFeed(feed, 'active')} title={feed.isActive ? 'Disable' : 'Enable'}>
                  <Power size={14} />
                </Button>
                <Button variant="danger" disabled={busy} onClick={() => updateFeed(feed, 'delete')} title="Delete">
                  <Trash2 size={14} />
                </Button>
              </div>
            </Panel>
          ))}
          {message && <p className="text-sm font-medium text-primary">{message}</p>}

          <Panel className="min-w-0 overflow-hidden">
            <PanelHeading title="How to subscribe" />
            <ol className="list-decimal space-y-2 pl-5 text-sm text-ink/70">
              <li>
                <strong>Apple Calendar:</strong> File → New Calendar Subscription (Mac) or Settings →
                Calendar → Accounts → Add Subscribed Calendar (iPhone), then paste the feed URL.
              </li>
              <li>
                <strong>Google Calendar:</strong> Other calendars → + → From URL, paste the feed URL.
              </li>
              <li>
                <strong>Outlook:</strong> Add calendar → Subscribe from web, paste the feed URL.
              </li>
            </ol>
            <p className="mt-3 text-xs text-ink/50">
              Feed URLs contain an unguessable token, so they work without a login. Anyone with the URL can
              read that feed — delete it if a link leaks.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  )
}
