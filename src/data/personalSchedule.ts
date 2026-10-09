import { useNow } from '../lib/useNow'
import { useMemo } from 'react'
import { useCustomLeagues } from './customLeagues'
import { useMyEvents } from './liveSport'
import { customLeagueEvents } from '../lib/scheduleAdapter'

export function usePersonalEvents(leagueIds: string[], competitorIds: string[], eventIds: string[] = []) {
  const now = useNow()
  const live = useMyEvents(leagueIds, competitorIds, eventIds)
  const { leagues } = useCustomLeagues()
  // Live reads already apply completion windows and preserve explicitly saved archives.
  // The schedule's Hide finished control decides whether to display that history.
  const events = useMemo(() => [...live.events, ...leagues.flatMap(customLeagueEvents).filter(event => event.startsAt && event.startsAt.getTime() >= now - 10800000)].filter(event => event.startsAt).sort((a,b) => a.startsAt!.getTime() - b.startsAt!.getTime()), [live.events, leagues, now])
  return { ...live, events }
}
