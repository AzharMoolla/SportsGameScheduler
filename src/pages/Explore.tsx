import { ArrowRight, CalendarClock, Database, PlusCircle, Search, Check } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppState } from '../app/state-context'
import { GlobalSearch } from '../components/GlobalSearch'
import { SportAssetIcon } from '../components/SportAssetIcon'
import { Badge, LinkButton, Panel, PanelHeading } from '../components/ui'
import { useSportSchedule } from '../data/liveSport'
import { displaySportLabel } from '../lib/i18n'
import { secondarySports, sports, type SportInfo } from '../domain/sports'
import { getTheme, withSurfaceMode } from '../theme/themes'

const coreSports = sports.filter((sport) => sport.key !== 'custom')

function LiveRouteCard({ sport, dense = false }: { sport: SportInfo; dense?: boolean }) {
  const { prefs, surfaceMode } = useAppState()
  const schedule = useSportSchedule(sport.canonicalSportKey)
  const theme = withSurfaceMode(getTheme(sport.key), surfaceMode)
  const iconVariant = surfaceMode === 'program' ? 'brush' : 'neon3d'
  const liveReady = schedule.configured && !schedule.loading && schedule.events.length > 0
  const route = sport.key === 'custom' ? '/other-sports' : `/sports/${sport.key}`

  return (
    <Link
      to={route}
      className={`group grid h-full rounded-card border bg-surface/72 transition-colors hover:bg-primary/6 ${
        dense ? 'min-h-[132px] p-3' : 'min-h-[178px] p-4'
      }`}
      style={{ borderColor: `${theme.colors.primary}33` }}
    >
      <div className="flex min-w-0 flex-col items-start gap-3">
        <div className="flex w-full min-w-0 items-center gap-3">
          <SportAssetIcon
            sportKey={sport.key}
            size={dense ? 'sm' : 'channel'}
            variant={iconVariant}
            label={`${sport.label} icon`}
          />
          <div className="min-w-0 flex-1">
            <h2 className={`${dense ? 'text-base' : 'text-lg'} font-black uppercase leading-tight text-primary`}>
              {displaySportLabel(sport.canonicalSportKey, sport.label, prefs.locale, prefs.regionCode)}
            </h2>
            <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-wide text-ink/45">
              {sport.flagshipLeague}
            </p>
          </div>
        </div>
        <Badge tone={liveReady ? 'secondary' : 'muted'} className="shrink-0 whitespace-nowrap">
          {schedule.loading ? 'Checking' : liveReady ? 'Fixtures available' : 'Explore leagues'}
        </Badge>
      </div>

      <p className={`${dense ? 'mt-2 text-[13px]' : 'mt-3 text-sm'} line-clamp-2 leading-relaxed text-ink/62`}>
        {sport.tagline}
      </p>

      <div className="mt-4 flex items-center gap-3 self-end border-t border-primary/12 pt-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/45">
          {schedule.loading ? '...' : `${schedule.leagues.length} leagues`}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/45">
          {schedule.loading ? '...' : `${schedule.events.length} upcoming`}
        </span>
        <span className="ml-auto inline-flex items-center gap-1 text-sm font-bold text-primary">
          Open <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  )
}

export function ExplorePage() {
  const [query, setQuery] = useState('')

  const filteredSecondarySports = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return secondarySports
    return secondarySports.filter((sport) => {
      return (
        sport.label.toLowerCase().includes(q) ||
        sport.flagshipLeague.toLowerCase().includes(q) ||
        sport.tagline.toLowerCase().includes(q)
      )
    })
  }, [query])

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Panel className="relative overflow-hidden p-0">
          <div className="color-bars h-2 w-full" aria-hidden="true" />
          <div className="space-y-5 p-5 sm:p-6">
            <div className="max-w-3xl">
              <p className="board-label text-ink/45">Sports hub</p>
              <h1 className="mt-2 font-display text-3xl font-black uppercase leading-none text-primary sm:text-5xl">
                Find your sport.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink/64 sm:text-base">
                Race weekends, weeknight games and everything in between. Browse a sport, find your teams, and build a schedule that fits your life.
              </p>
              <div className="mt-4 max-w-xl">
                <GlobalSearch placeholder="Search any sport, league, team, or player" />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <LinkButton to="/my-schedule"><CalendarClock size={16} /> My schedule</LinkButton>
              <LinkButton to="/other-sports" variant="ghost"><Database size={16} /> More sports</LinkButton>
              <LinkButton to="/custom-leagues" variant="ghost"><PlusCircle size={16} /> Create league</LinkButton>
            </div>
          </div>
        </Panel>

        <Panel className="hidden h-fit lg:block">
          <PanelHeading title="Make it yours" subtitle="One place for the sports you follow." />
          <ul className="space-y-5 text-sm leading-relaxed text-ink/75">
            {['Follow a team, league or athlete.', 'See every start in your local time.', 'Save your schedule to a calendar or share it.'].map((step) =>
              <li key={step} className="flex gap-3"><Check size={18} className="shrink-0 text-primary" aria-hidden="true" /> {step}</li>)}
          </ul>
          <p className="mt-6 border-t border-primary/15 pt-4 text-sm text-ink/65">No account needed to explore. Your follows stay saved in this browser.</p>
        </Panel>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-primary">Pick a sport</h2>
            <p className="text-sm text-ink/60">Open a sport to find leagues, teams and upcoming events.</p>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/45">Your starting lineup</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {coreSports.map((sport) => (
            <LiveRouteCard key={sport.key} sport={sport} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Panel className="h-fit lg:sticky lg:top-20">
          <PanelHeading title="More sports" subtitle="Find something beyond your usual lineup.">
            <Database size={18} className="text-primary" />
          </PanelHeading>
          <label className="mb-3 flex items-center gap-2 rounded-lg border border-primary/20 bg-page/60 px-3 py-2">
            <Search size={15} className="text-ink/40" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search more sports"
              aria-label="Search more sports"
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>
          <Link to="/other-sports" className="inline-flex items-center gap-1 text-sm font-bold text-primary">
            Explore all sports <ArrowRight size={14} />
          </Link>
        </Panel>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filteredSecondarySports.map((sport) => (
            <LiveRouteCard key={sport.key} sport={sport} dense />
          ))}
          {filteredSecondarySports.length === 0 && (
            <Panel className="sm:col-span-2 xl:col-span-3">
              <p className="text-sm text-ink/55">No live routes match that search yet.</p>
            </Panel>
          )}
        </div>
      </section>
    </div>
  )
}
