import { describe, expect, it } from 'vitest'
import { mergeCombatEnrichment } from '../../../supabase/functions/_shared/combat-enrichment'

const prior = { cito: { original_provider_starts_at: '2026-10-17T00:00:00.000Z', main_card_starts_at: '2026-10-18T00:00:00.000Z', announced_bouts: 13 } }

describe('combat source enrichment', () => {
  it('retains reviewed main-card timing and roster while accepting a new result', () => {
    const result = mergeCombatEnrichment(true, prior, { result: { method: 'decision' } }, '2026-10-18T00:00:00.000Z', '2026-10-17T00:00:00.000Z')
    expect(result.startsAt).toBe('2026-10-18T00:00:00.000Z')
    expect(result.enriched).toBe(true)
    expect(result.metadata.cito).toEqual(prior.cito)
    expect(result.metadata.result).toEqual({ method: 'decision' })
  })
  it('accepts a genuinely changed source time and marks old Cito timing for review', () => {
    const result = mergeCombatEnrichment(true, prior, {}, '2026-10-18T00:00:00.000Z', '2026-10-25T00:00:00.000Z')
    expect(result.startsAt).toBe('2026-10-25T00:00:00.000Z')
    expect(result.metadata.cito).toMatchObject({ main_card_starts_at: null, schedule_review_needed: true })
    expect(result.enriched).toBe(true)
  })
  it('does not interfere with unenriched or non-combat events', () => {
    expect(mergeCombatEnrichment(true, {}, {}, null, '2026-10-18T00:00:00.000Z')).toMatchObject({ enriched: false, startsAt: '2026-10-18T00:00:00.000Z' })
    expect(mergeCombatEnrichment(false, prior, {}, null, '2026-10-17T00:00:00.000Z').enriched).toBe(false)
  })
})
