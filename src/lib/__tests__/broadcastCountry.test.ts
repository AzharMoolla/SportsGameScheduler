import { describe, expect, it } from 'vitest'
import { broadcastCountryCode } from '../broadcastCountry'
import { matchWatchProvider, safeWatchUrl } from '../watchProviders'

describe('broadcast destinations', () => {
  it('normalizes provider country names without treating unknown territories as global', () => {
    expect(broadcastCountryCode('United States')).toBe('US')
    expect(broadcastCountryCode('United Kingdom')).toBe('GB')
    expect(broadcastCountryCode('UK')).toBe('GB')
    expect(broadcastCountryCode('Germany')).toBe('DE')
    expect(broadcastCountryCode('France')).toBe('FR')
    expect(broadcastCountryCode('Serbia')).toBe('RS')
    expect(broadcastCountryCode('FX')).toBe('FR')
    expect(broadcastCountryCode('YU')).toBeNull()
    expect(broadcastCountryCode('Soviet Union')).toBeNull()
    expect(broadcastCountryCode('International')).toBeNull()
  })
  it('matches channel names and numbered channels without first-word collisions', () => {
    expect(matchWatchProvider('MLB.tv', 'US')?.key).toBe('mlb_tv')
    expect(matchWatchProvider('TSN 1', 'CA')?.key).toBe('tsn')
    expect(matchWatchProvider('Sky Unknown Network', 'GB')).toBeNull()
    expect(matchWatchProvider('TSN', 'DE')).toBeNull()
    expect(matchWatchProvider('Ligue 1+ 1 FR','FR')?.key).toBe('ligue1_plus')
    expect(matchWatchProvider('BeIn Sports HD 2 France','FR')?.key).toBe('bein_sports')
    expect(matchWatchProvider('Canal+ Sport France','FR')?.key).toBe('canal_plus')
    expect(matchWatchProvider('BeIn Sports Max 4','FR')?.key).toBe('bein_sports')
    expect(matchWatchProvider('Ligue 1+ 1 FR','GB')).toBeNull()
  })
  it('rejects unsafe or credential-bearing outbound URLs', () => {
    expect(safeWatchUrl('javascript:alert(1)')).toBeNull()
    expect(safeWatchUrl('https://user:pass@example.com')).toBeNull()
    expect(safeWatchUrl('https://www.tsn.ca/')).toBe('https://www.tsn.ca/')
  })
})
