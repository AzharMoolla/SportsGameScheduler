import { describe, expect, it } from 'vitest'
import { finalResultText, scheduleVisibilityFilter } from '../eventLifecycle'

describe('event lifecycle', () => {
  it('keeps live and recently completed events beyond their start, with a 48-hour completion cutoff', () => {
    const filter = scheduleVisibilityFilter(Date.parse('2026-10-08T12:00:00Z'))
    expect(filter).toContain('status.eq.live')
    expect(filter).toContain('and(status.eq.finished,completed_at.gte.2026-10-06T12:00:00.000Z)')
    expect(filter).toContain('and(status.eq.scheduled,starts_at.gte.2026-10-07T12:00:00.000Z)')
  })
  it('shows a real score including zero, without inventing missing results', () => {
    expect(finalResultText('finished', { result: { home_score: 0, away_score: 2, home_team: 'A', away_team: 'B' } })).toBe('Final: A 0 – B 2')
    expect(finalResultText('finished', { result: { home_score: null, away_score: 2 } })).toMatch(/awaiting provider/)
    expect(finalResultText('live', { result: { home_score: 1, away_score: 2 } })).toBeNull()
    expect(finalResultText('finished', { result: { home_score: '', away_score: -1 } })).toMatch(/awaiting provider/)
  })
})
