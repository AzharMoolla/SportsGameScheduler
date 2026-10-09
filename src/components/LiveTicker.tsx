import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pause, Play, Radio } from 'lucide-react'
import { useAppState } from '../app/state-context'
import { useTickerEvents, type TickerEvent } from '../data/tickerEvents'
import { getSport } from '../domain/sports'
import { formatTime } from '../lib/time'

// Broadcast-style ticker tape across the top of the homepage: the week's events crawling by in a
// neon glow. Stops on hover, keyboard focus, or the pause control so links remain usable.
// Respects prefers-reduced-motion and hides the visual loop's duplicate links from focus.

const NORMAL_SPEED = 0.55 // px per frame (~33px/s at 60fps)

function dayLabel(date: Date, timeZone: string, locale?: string): string {
  const now = new Date()
  const fmt = (d: Date) => new Intl.DateTimeFormat(locale || 'en-US', { timeZone, year: 'numeric', month: 'numeric', day: 'numeric' }).format(d)
  const today = fmt(now)
  const tomorrow = fmt(new Date(now.getTime() + 86_400_000))
  const target = fmt(date)
  if (target === today) return 'Today'
  if (target === tomorrow) return 'Tomorrow'
  return new Intl.DateTimeFormat(locale || 'en-US', { timeZone, weekday: 'short' }).format(date)
}

function TickerItem({ event, timeZone, locale, hour12, duplicate = false }: { duplicate?: boolean; event: TickerEvent; timeZone: string; locale?: string; hour12?: boolean | null }) {
  const sport = event.sportKey ? getSport(event.sportKey) : undefined
  const when = `${dayLabel(event.startsAt, timeZone, locale ?? undefined)} ${formatTime(event.startsAt, timeZone, { locale: locale ?? undefined, hour12: hour12 ?? undefined })}`
  return (
    <Link
      to={`/events/${event.id}`}
      aria-hidden={duplicate || undefined}
      tabIndex={duplicate ? -1 : undefined}
      className="group inline-flex min-h-9 shrink-0 items-center gap-2 px-3 py-1 text-sm sm:gap-2.5 sm:px-5"
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-export shadow-[0_0_6px_var(--mp-export)]" aria-hidden="true" />
      {sport && (
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-export/80">{event.featureLabel ?? sport.label}</span>
      )}
      <span className="font-semibold text-ink/90 transition-colors group-hover:text-export">{event.title}</span>
      <span className="font-mono text-[11px] uppercase tracking-wide text-ink/45">{when}</span>
    </Link>
  )
}

export function LiveTicker() {
  const { prefs } = useAppState()
  const { events } = useTickerEvents()
  const trackRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(0)
  const targetSpeed = useRef(NORMAL_SPEED)
  const [paused, setPaused] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduceMotion(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (reduceMotion || paused || !events.length) return
    const track = trackRef.current
    if (!track) return
    let raf = 0
    let half = track.scrollWidth / 2
    let previous = 0
    const measure = () => { half = track.scrollWidth / 2 }
    const step = (now: number) => {
      const elapsed = previous ? Math.min(now - previous, 50) : 16.67
      previous = now
      offsetRef.current -= targetSpeed.current * elapsed / 16.67
      if (half > 0 && -offsetRef.current >= half) offsetRef.current += half
      track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    window.addEventListener('resize', measure)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', measure) }
  }, [events, reduceMotion, paused])

  if (!events.length) return null
  const loop = reduceMotion ? events : [...events, ...events]
  return (
    <div className="relative mb-5 overflow-hidden rounded-xl border border-primary/15 bg-surface py-2 pr-12"
      onMouseEnter={() => { targetSpeed.current = 0 }}
      onMouseLeave={() => { targetSpeed.current = NORMAL_SPEED }}
      onFocusCapture={() => { targetSpeed.current = 0 }}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) targetSpeed.current = NORMAL_SPEED }}
      aria-label="This week's events ticker">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center gap-1.5 bg-gradient-to-r from-surface via-surface/95 to-transparent pl-3 pr-8">
        <Radio size={13} className="text-primary" aria-hidden="true" />
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-primary">This week</span>
      </div>
      <div className={reduceMotion ? 'flex w-full gap-2 overflow-x-auto whitespace-nowrap pl-32' : 'flex w-max items-center whitespace-nowrap pl-40'}
        style={reduceMotion ? { transform: 'none' } : undefined} ref={trackRef}>
        {loop.map((event, i) => <TickerItem key={`${event.id}-${i}`} event={event} timeZone={prefs.timezone}
          locale={prefs.locale} hour12={prefs.hour12} duplicate={!reduceMotion && i >= events.length} />)}
      </div>
      {!reduceMotion && <button type="button" onClick={() => setPaused(!paused)} aria-pressed={paused}
        aria-label={paused ? 'Resume event ticker' : 'Pause event ticker'}
        className="absolute inset-y-0 right-0 z-20 flex w-11 items-center justify-center border-l border-primary/15 bg-surface text-primary">
        {paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}
      </button>}
    </div>
  )
}
