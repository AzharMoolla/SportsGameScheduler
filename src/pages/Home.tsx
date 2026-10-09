import {
  Bell,
  CalendarDays,
  Camera,
  ChevronRight,
  Clock,
  FileText,
  ArrowRight,
  Trophy,
  Tv,
  Users,
} from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAppState } from '../app/state-context'
import { GlobalEventBoard, PosterFeatureStrip } from '../components/PosterMotifs'
import { GlobalSearch } from '../components/GlobalSearch'
import { LinkButton, Panel, PanelHeading } from '../components/ui'
import { filterMatchesForTeams, filterUpcomingMatches, useMatches } from '../data/liveMatches'
import { dedupeSpotlightBySport, useSpotlightEvents } from '../data/spotlight'
import { getSport } from '../domain/sports'
import { useSportActivity } from '../data/sportActivity'
import { usePersonalEvents as useMyEvents } from '../data/personalSchedule'
import { brand } from '../domain/brand'
import { aboutContent, faqContent, howItWorksContent } from '../content/siteContent'
import { t } from '../lib/i18n'
import { formatLongDate, formatTime } from '../lib/time'
import { useNow } from '../lib/useNow'

const exportPaths = [
  { icon: CalendarDays, titleKey: 'home.export.liveTitle', bodyKey: 'home.export.liveBody' },
  { icon: Camera, titleKey: 'home.export.photoTitle', bodyKey: 'home.export.photoBody' },
  { icon: FileText, titleKey: 'home.export.notesTitle', bodyKey: 'home.export.notesBody' },
  { icon: Bell, titleKey: 'home.export.alertsTitle', bodyKey: 'home.export.alertsBody' },
]


export function HomePage() {
  const { followedTeams, followedLeagueIds, followedCompetitorIds, followedEventIds, prefs } = useAppState()
  const { matches } = useMatches()
  const personalEvents = useMyEvents(followedLeagueIds, followedCompetitorIds, followedEventIds)
  const now = useNow()
  const activity = useSportActivity()
  const spotlightEvents = useSpotlightEvents(prefs.regionCode)
  // One card per sport on the homepage board/strip — no sport (e.g. soccer) showing up twice.
  const spotlightBySport = useMemo(() => dedupeSpotlightBySport(spotlightEvents), [spotlightEvents])

  const upcomingEvents = useMemo(() => {
    const live = personalEvents.events.filter((event) => event.startsAt && event.startsAt.getTime() > now)
      .map((event) => ({ id: event.id, title: event.title, startsAt: event.startsAt!, to: `/events/${event.id}` }))
    const legacy = followedTeams.length ? filterUpcomingMatches(filterMatchesForTeams(matches, followedTeams))
      .map((match) => ({ id: `${match.date}-${match.team1}-${match.team2}`, title: `${match.team1} vs ${match.team2}`, startsAt: match.startsAt, to: '/my-schedule' })) : []
    return [...live, ...legacy].sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime()).slice(0, 3)
  }, [personalEvents.events, followedTeams, matches, now])
  const quickSports = activity.ranked.slice(0,6).flatMap(item => { const sport = getSport(item.sportKey); return sport ? [sport] : [] })
  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_390px]" data-home-section="hero">
        <div className="home-hero rounded-card border border-primary/15 bg-surface p-5 sm:p-8">
          <p className="board-label mb-4 text-primary">{t('home.kicker', undefined, prefs.locale)}</p>
          <h1 className="home-headline whitespace-pre-line font-head text-primary">{t('home.headline', undefined, prefs.locale)}</h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink/75">{t('home.body', undefined, prefs.locale)}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <LinkButton to="/explore">{t('home.exploreSports', undefined, prefs.locale)} <ArrowRight size={17} aria-hidden="true" /></LinkButton>
            <LinkButton to="/my-schedule" variant="ghost">{t('nav.mySchedule', undefined, prefs.locale)}</LinkButton>
          </div>
          <div className="home-search mt-7 border-t border-primary/15 pt-5">
            <p className="mb-3 text-sm font-semibold text-ink/75">{t('home.searchLead', undefined, prefs.locale)}</p>
            <GlobalSearch placeholder={t('home.searchPlaceholder', undefined, prefs.locale)} />
            <nav className="mt-3 flex flex-wrap gap-2" aria-label="Popular sports">
              {quickSports.map((sport) => <Link key={sport.key} to={`/sports/${sport.key}`} className="home-sport-link">{sport.label}</Link>)}
            </nav>
          </div>
          <p className="mt-5 flex items-center gap-2 text-xs text-ink/65"><Clock size={14} aria-hidden="true" /> {t('home.localTime', { timezone: prefs.timezone }, prefs.locale)}</p>
        </div>

        <Panel className="home-next-panel flex flex-col self-start">
          <PanelHeading
            title={t('home.nextEvents', undefined, prefs.locale)}
            subtitle={t('home.localTime', { timezone: prefs.timezone }, prefs.locale)}
          >
            <Clock size={18} className="text-primary" />
          </PanelHeading>
          {upcomingEvents.length ? (
            <div className="space-y-2">
              {upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  to={event.to}
                  className="block rounded-lg bg-page/70 px-3 py-2 hover:bg-primary/10"
                >
                  <p className="text-sm font-bold">
                    {event.title}
                  </p>
                  <p className="text-xs text-ink/55">
                    {formatLongDate(event.startsAt, prefs.timezone, { locale: prefs.locale, hour12: prefs.hour12 ?? undefined })} at{' '}
                    {formatTime(event.startsAt, prefs.timezone, { locale: prefs.locale, hour12: prefs.hour12 ?? undefined })}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col rounded-xl bg-page/70 p-5">
              <Trophy size={26} className="text-primary" />
              <p className="mt-3 text-sm text-ink/65">
                {personalEvents.loading ? t('schedule.loadingLive', undefined, prefs.locale) : t('home.pickPrompt', { module: brand.modules.schedule.toLowerCase() }, prefs.locale)}
              </p>
            </div>
          )}
          <Link to="/my-schedule" className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-primary">
            {t('home.continueSchedule', undefined, prefs.locale)} <ChevronRight size={15} />
          </Link>
        </Panel>
      </section>

      <div className="home-board hidden sm:block" data-home-section="world-board">
        <GlobalEventBoard events={spotlightBySport} variant="room" />
      </div>


      <section className="grid gap-4 lg:grid-cols-[1fr_320px]" data-home-section="tools">
        <div className="grid gap-3 sm:grid-cols-2">
          {exportPaths.map(({ icon: Icon, titleKey, bodyKey }) => (
            <Panel key={titleKey} className="flex gap-3 max-sm:p-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon size={19} />
              </span>
              <div>
                <h3 className="text-sm font-bold text-primary sm:text-base">{t(titleKey, undefined, prefs.locale)}</h3>
                <p className="mt-1 hidden text-sm text-ink/60 sm:block">{t(bodyKey, undefined, prefs.locale)}</p>
              </div>
            </Panel>
          ))}
        </div>

        <div className="space-y-3">
          <Panel>
            <PanelHeading title={t('home.watchTitle', undefined, prefs.locale)} subtitle={t('home.watchSubtitle', undefined, prefs.locale)}>
              <Tv size={18} className="text-primary" />
            </PanelHeading>
            <p className="text-sm text-ink/60">
              {t('home.watchBody', undefined, prefs.locale)}
            </p>
          </Panel>
          <Panel>
            <PanelHeading title={t('home.customTitle', undefined, prefs.locale)} subtitle={t('home.customSubtitle', undefined, prefs.locale)}>
              <Users size={18} className="text-primary" />
            </PanelHeading>
            <LinkButton to="/custom-leagues" className="w-full" variant="ghost">{t('home.customCta', undefined, prefs.locale)}</LinkButton>
          </Panel>
        </div>
      </section>

      <div className="hidden sm:block">
        <PosterFeatureStrip />
      </div>

      <HomeExplainer />
    </div>
  )
}

// Visible, original prose on the homepage so a first-time visitor lands on
// real content explaining what the product is and how it works — not just the scheduling tool. Copy
// lives in src/content/siteContent.ts; deeper detail is on /about, /how-it-works and /faq.
function HomeExplainer() {
  return (
    <section aria-labelledby="home-explainer-heading" className="mt-2 border-t border-primary/15 pt-6" data-home-section="explainer">
      <details className="rounded-card border border-primary/15 bg-surface p-4 sm:hidden">
        <summary className="cursor-pointer text-sm font-black uppercase tracking-[0.14em] text-primary">
          About, help, and FAQs
        </summary>
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-ink/75">
          <p>{aboutContent.intro}</p>
          <Link to="/about" className="inline-flex items-center gap-1 font-bold text-primary">
            More about Silbo Sports <ChevronRight size={15} />
          </Link>
          <div className="grid gap-2">
            <Link to="/how-it-works" className="inline-flex items-center justify-between rounded-lg bg-page/60 px-3 py-2 font-bold text-primary">
              How it works <ChevronRight size={15} />
            </Link>
            <Link to="/faq" className="inline-flex items-center justify-between rounded-lg bg-page/60 px-3 py-2 font-bold text-primary">
              Common questions <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </details>

      <div className="hidden space-y-6 sm:block">
      {/* Intro and the how-it-works steps sit side by side on desktop so the section fills the page
          width like the rest of the home page and stays short. Text stays readable via max-w caps. */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:items-start">
        <div className="max-w-2xl space-y-3 text-sm leading-relaxed text-ink/80">
          <h2 id="home-explainer-heading" className="font-display text-2xl tracking-wide text-ink">
            What is Silbo Sports?
          </h2>
          <p>{aboutContent.intro}</p>
          <p>{aboutContent.sections[0].paragraphs[0]}</p>
          <Link to="/about" className="inline-flex items-center gap-1 text-sm font-bold text-primary">
            More about Silbo Sports <ChevronRight size={15} />
          </Link>
        </div>

        <div className="space-y-3">
          <h3 className="font-display text-lg tracking-wide text-ink">How it works</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {howItWorksContent.steps.map((step) => (
              <div key={step.heading} className="rounded-xl border border-primary/15 bg-page/60 p-4">
                <h4 className="font-bold text-primary">{step.heading}</h4>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/65">{step.paragraphs[0]}</p>
              </div>
            ))}
          </div>
          <Link to="/how-it-works" className="inline-flex items-center gap-1 text-sm font-bold text-primary">
            Read the full guide <ChevronRight size={15} />
          </Link>
        </div>
      </div>

      <div className="space-y-3 text-sm leading-relaxed text-ink/80">
        <h3 className="font-display text-lg tracking-wide text-ink">Common questions</h3>
        <dl className="grid gap-x-10 gap-y-4 sm:grid-cols-2">
          {faqContent.faqs.slice(0, 4).map((faq) => (
            <div key={faq.q} className="border-b border-primary/10 pb-4">
              <dt className="font-semibold text-ink">{faq.q}</dt>
              <dd className="mt-1.5 text-ink/75">{faq.a}</dd>
            </div>
          ))}
        </dl>
        <Link to="/faq" className="inline-flex items-center gap-1 text-sm font-bold text-primary">
          See all FAQs <ChevronRight size={15} />
        </Link>
      </div>
      </div>
    </section>
  )
}
