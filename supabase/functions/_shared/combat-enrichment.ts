// Preserve reviewed rosters and main-card times when a title-only source refreshes.
export function mergeCombatEnrichment(combat: boolean, prior: Record<string, unknown>, incoming: Record<string, unknown>,
  currentStart: string | null, incomingStart: string | null) {
  const enriched = combat && prior.cito != null && typeof prior.cito === 'object'
  const cito = enriched ? prior.cito as Record<string, unknown> : null
  const preserveStart = typeof cito?.original_provider_starts_at === 'string' && incomingStart === cito.original_provider_starts_at
    && typeof cito.main_card_starts_at === 'string' && Number.isFinite(Date.parse(cito.main_card_starts_at))
  const metadata: Record<string, unknown> = { ...prior, ...incoming }
  if (cito && !preserveStart && currentStart !== incomingStart) {
    metadata.cito = { ...cito, main_card_starts_at: null, schedule_review_needed: true }
  }
  return { enriched, metadata, startsAt: preserveStart ? cito!.main_card_starts_at as string : incomingStart }
}
