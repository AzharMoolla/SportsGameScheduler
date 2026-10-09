export type FightHistory = { scheduledRounds: number; roundSeconds: number; durationSeconds?: number; roundsFought?: number; method?: string }
export type TimingBout = { id: string; order: number | null; scheduledRounds: number | null; status: string;
  estimatedStartAt: Date | null; metadata: Record<string, unknown>; redCorner: { id: string } | null; blueCorner: { id: string } | null }
export type FightWindow = { id: string; expected: Date | null; earliest: Date | null; latest: Date | null;
  basis: 'provider' | 'live' | 'history' | 'format' | 'unavailable'; samples: number; note: string }

const timestamp = (value: unknown) => typeof value === 'string' && Number.isFinite(Date.parse(value)) ? Date.parse(value) : null
const positive = (value: unknown, fallback: number) => typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback

export function fightDiscipline(leagueName: string, metadata?: Record<string, unknown>): 'mma' | 'boxing' {
  return metadata?.discipline === 'boxing' || /boxing|\bwbc\b|\bwba\b|\bibf\b|\bwbo\b|matchroom|top rank|queensberry/i.test(leagueName) ? 'boxing' : 'mma'
}

export function durationFraction(history: FightHistory): number | null {
  const max = history.scheduledRounds * history.roundSeconds
  if (!(max > 0)) return null
  if (history.durationSeconds != null && history.durationSeconds >= 0 && history.durationSeconds <= max)
    return history.durationSeconds / max
  if (/decision|points/i.test(history.method ?? '')) return 1
  if (history.roundsFought != null && history.roundsFought > 0 && history.roundsFought <= history.scheduledRounds)
    return history.roundsFought / history.scheduledRounds
  return null
}

// Predict timing, not winners. Recent history is shrunk toward a format prior;
// walkouts, breaks and uncertainty remain even after a quick stoppage.
export function estimateFightCard(cardStart: Date | null, bouts: TimingBout[], discipline: 'mma' | 'boxing',
  history: Record<string, FightHistory[]> = {}, now = Date.now()): FightWindow[] {
  let cursor = cardStart?.getTime() ?? null
  let uncertainty = 10 * 60_000
  let anchoredLive = false
  const incomplete = bouts.some(b => b.metadata.completeness === 'main_event_only' || b.metadata.source === 'title_inference')
  const ordered = [...bouts].sort((a,b) => (a.order ?? Infinity) - (b.order ?? Infinity))
  const windows: FightWindow[] = []
  for (const bout of ordered) {
    const roundSeconds = positive(bout.metadata.round_seconds, discipline === 'mma' ? 300 : 180)
    const rounds = positive(bout.scheduledRounds, discipline === 'mma' ? (bout.metadata.main_event ? 5 : 3) : 10)
    const samples = [bout.redCorner?.id, bout.blueCorner?.id].flatMap(id => id ?
      (history[id] ?? []).slice(0,3).map(durationFraction).filter((v): v is number => v !== null) : [])
    const fraction = (samples.reduce((sum,v) => sum+v,0) + 0.75 * 3) / (samples.length+3)
    const fightMinutes = fraction * rounds * roundSeconds / 60 + Math.max(0,rounds-1)
    const turnaround = positive(bout.metadata.turnaround_minutes, discipline === 'mma' ? 12 : 15)
    const actualStart = timestamp(bout.metadata.actual_start_at)
    const actualEnd = timestamp(bout.metadata.actual_end_at)
    const official = bout.metadata.start_time_confirmed === true ? bout.estimatedStartAt?.getTime() ?? null : null
    // A lone inferred headliner provides no undercard/order information to model.
    let expected = actualStart ?? official ?? (!incomplete && bout.order != null ? cursor : null)
    if (bout.status === 'cancelled') expected = null
    const basis: FightWindow['basis'] = actualStart !== null ? 'live' : official !== null ? 'provider' :
      expected === null ? 'unavailable' : anchoredLive ? 'live' : samples.length ? 'history' : 'format'
    if (expected !== null && bout.status === 'scheduled' && expected < now && anchoredLive) expected = now
    windows.push({ id: bout.id, expected: expected === null ? null : new Date(expected),
      earliest: expected === null ? null : new Date(expected-(official !== null || actualStart !== null ? 0 : uncertainty)),
      latest: expected === null ? null : new Date(expected+(official !== null || actualStart !== null ? 0 : uncertainty)),
      basis, samples: samples.length,
      note: basis === 'unavailable' ? 'Full card order or a confirmed start is needed.' :
        basis === 'provider' ? 'Confirmed provider start.' : basis === 'live' ? 'Adjusted using confirmed live bout timing.' :
        samples.length ? `Uses available recent fight durations (${samples.length} results), rounds and card turnaround.` : 'Format-based estimate; recent fighter results unavailable.' })
    if (bout.status === 'cancelled') continue
    if (actualEnd !== null) { cursor = actualEnd+turnaround*60_000; uncertainty=8*60_000; anchoredLive=true }
    else if (actualStart !== null && bout.status === 'live') {
      cursor=Math.max(now,actualStart+fightMinutes*60_000)+turnaround*60_000; uncertainty=12*60_000; anchoredLive=true
    } else if (bout.status === 'finished') {
      // A status without an end timestamp cannot tell us when the next bout walks out.
      cursor=null
    } else if (expected !== null) { cursor=expected+(fightMinutes+turnaround)*60_000; uncertainty+=Math.min(15,rounds*2)*60_000 }
    else cursor=null
  }
  return windows
}
