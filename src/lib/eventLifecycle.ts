// Provider status is authoritative. A recent unconfirmed start stays visible for a
// day without being labelled live; known live events remain until completion.
export function scheduleVisibilityFilter(now = Date.now()) {
  return `starts_at.gte.${new Date(now).toISOString()},status.eq.live,and(status.eq.finished,completed_at.gte.${new Date(now - 48 * 3600_000).toISOString()}),and(status.eq.scheduled,starts_at.gte.${new Date(now - 24 * 3600_000).toISOString()})`
}

export function finalResultText(status: string, metadata?: Record<string, unknown> | null): string | null {
  if (status !== 'finished') return null
  const result = metadata?.result as Record<string, unknown> | undefined
  const score = (value: unknown) => (typeof value === 'number' || typeof value === 'string') && /^\d+(?:\.\d+)?$/.test(String(value)) ? String(value) : null
  const home = score(result?.home_score)
  const away = score(result?.away_score)
  if (home === null || away === null) return 'Final result awaiting provider confirmation'
  return `Final: ${typeof result?.home_team === 'string' ? result.home_team + ' ' : ''}${home} – ${typeof result?.away_team === 'string' ? result.away_team + ' ' : ''}${away}`
}
