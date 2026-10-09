import { Tv } from 'lucide-react'
import type { SportInfo } from '../domain/sports'
import { WatchOptionsPanel } from './WatchOptionsPanel'
import { Panel, PanelHeading } from './ui'

type Props = {
  sport: SportInfo
  regionCode?: string | null
  broadcastRegionCode?: string | null
  className?: string
  watchTitle: string
  watchSubtitle?: string
  leagueName?: string | null
  sportKey?: string | null
  locale?: string | null
}

export function SportWatchPanel({ sport, regionCode, broadcastRegionCode, className = '', watchTitle, watchSubtitle, leagueName, sportKey, locale }: Props) {
  return (
    <Panel className={`border-primary/20 bg-surface/85 ${className}`}>
      <PanelHeading title="Where to watch" subtitle={watchSubtitle}>
        <Tv size={17} className="text-primary" />
      </PanelHeading>
      <p className="mb-3 text-sm text-ink/60">{watchTitle}</p>
      <WatchOptionsPanel leagueName={leagueName} sportKey={sportKey ?? sport.key} regionCode={broadcastRegionCode ?? regionCode} locale={locale} limit={3} compact />
    </Panel>
  )
}
