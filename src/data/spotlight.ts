import { getSport } from '../domain/sports'
import { useSportActivity } from './sportActivity'
export type SpotlightEvent = {
 title: string; sportKey: string; label: string; detail: string; href: string; importance: number
 lifecycle?: string; templateSlug?: string | null; artKey?: string | null
 startsAt?: string | null; endsAt?: string | null; resultHoldUntil?: string | null
 scheduleReleaseExpectedAt?: string | null; sourceConfidence?: string | null
}
export function isSpotlightCurrent(event: SpotlightEvent, now = Date.now()): boolean {
 if (event.startsAt && (!Number.isFinite(Date.parse(event.startsAt)) || Date.parse(event.startsAt)>now+28*86400000)) return false
 const cutoff=event.endsAt??event.startsAt
 return !cutoff || (Number.isFinite(Date.parse(cutoff)) && Date.parse(cutoff)>=now-12*3600000)
}
export function dedupeSpotlightBySport(events: SpotlightEvent[]): SpotlightEvent[] {
 const seen=new Set<string>()
 return [...events].sort((a,b)=>b.importance-a.importance).filter(event=>{
  const key=getSport(event.sportKey)?.canonicalSportKey??event.sportKey
  if(seen.has(key)) return false
  seen.add(key);return true
 })
}
// Only confirmed fixtures qualify promotions; no static fallback advertisements.
export function useSpotlightEvents(_regionCode?: string | null): SpotlightEvent[] {
 void _regionCode
 const activity=useSportActivity()
 return activity.ranked.map(item=>({title:item.title,sportKey:item.sportKey,label:item.label,detail:item.detail,href:`/sports/${getSport(item.sportKey)?.key??item.sportKey}`,importance:item.score,lifecycle:'schedule_live',startsAt:item.feature.startsAt.toISOString(),sourceConfidence:'scheduled_fixture'}))
}
