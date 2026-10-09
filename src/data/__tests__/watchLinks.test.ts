import { describe, expect, it } from 'vitest'
import { fallbackWatchOptions, mapWatchRows } from '../watchLinks'

// The where-to-watch boxes resolve league-specific official rights via CATALOG_RULES
// (docs/where-to-watch-rights-truth.md). These assert the documented broadcaster shows up for the
// right league + region, without substituting unrelated providers for missing coverage.
function names(regionCode: string, sportKey: string, leagueName?: string) {
  return fallbackWatchOptions(regionCode, sportKey, 6, leagueName).map((o) => o.name)
}

describe('fallbackWatchOptions league-specific rights', () => {
  it('English Premier League maps to NBC (US) and Sky (UK)', () => {
    expect(names('US', 'soccer', 'Premier League')).toContain('NBC Sports')
    expect(names('GB', 'soccer', 'Premier League')).toContain('Sky Sports')
  })

  it('UEFA Champions League maps to Paramount+ (US) and DAZN (CA)', () => {
    expect(names('US', 'soccer', 'UEFA Champions League')).toContain('Paramount+')
    expect(names('CA', 'soccer', 'UEFA Champions League')).toContain('DAZN')
  })

  it('Formula 1 maps to Apple TV (US 2026) and Sky F1 (UK)', () => {
    expect(names('US', 'motorsport', 'Formula 1')).toContain('Apple TV')
    expect(names('GB', 'motorsport', 'Formula 1')).toContain('Sky Sports F1')
  })

  it('World Cup maps priority North America and UK routes', () => {
    expect(names('US', 'soccer', 'FIFA World Cup 2026')).toEqual(expect.arrayContaining(['FOX Sports', 'Telemundo Deportes']))
    expect(names('CA', 'soccer', 'FIFA World Cup 2026')).toContain('CTV / TSN / RDS')
    expect(names('GB', 'soccer', 'FIFA World Cup 2026')).toEqual(expect.arrayContaining(['BBC iPlayer', 'ITVX']))
    expect(names('MX', 'soccer', 'FIFA World Cup 2026')).toEqual(expect.arrayContaining(['Televisa / TUDN', 'TV Azteca Deportes']))
  })

  it('World Cup maps major EU public routes', () => {
    expect(names('FR', 'soccer', 'FIFA World Cup 2026')).toEqual(expect.arrayContaining(['M6+', 'beIN SPORTS']))
    expect(names('DE', 'soccer', 'FIFA World Cup 2026')).toEqual(expect.arrayContaining(['ARD Mediathek', 'ZDF']))
    expect(names('IT', 'soccer', 'FIFA World Cup 2026')).toContain('RaiPlay')
    expect(names('ES', 'soccer', 'FIFA World Cup 2026')).toContain('RTVE Play')
    expect(names('NL', 'soccer', 'FIFA World Cup 2026')).toContain('NOS')
  })

  it('NBA maps to NBA League Pass', () => {
    expect(names('US', 'basketball', 'NBA')).toContain('NBA League Pass')
  })

  it('uses current UFC and Ligue 1 destinations', () => {
    expect(names('US', 'combat_sports', 'UFC')).toContain('Paramount+')
    expect(names('US', 'combat_sports', 'UFC')).not.toContain('ESPN+')
    expect(names('FR', 'soccer', 'Ligue 1')).toContain('Ligue 1+')
    expect(names('FR', 'soccer', 'Ligue 1')).not.toContain('CANAL+')
  })

  it('keeps Ireland, Austria and unsupported NHL territories distinct', () => {
    expect(names('IE', 'soccer', 'UEFA Champions League')).toContain('Premier Sports')
    expect(names('IE', 'soccer', 'UEFA Champions League')).not.toContain('TNT Sports')
    expect(names('AT', 'soccer', 'UEFA Champions League')).not.toContain('DAZN')
    expect(names('NL', 'hockey', 'NHL')).toContain('NHL broadcast guide')
    expect(names('NL', 'hockey', 'NHL')).not.toContain('NHL.TV on DAZN')
  })

  it('major non-soccer sports keep official first routes', () => {
    expect(names('CA', 'american_football', 'NFL')).toContain('NFL Game Pass on DAZN')
    expect(names('US', 'baseball', 'MLB')).toContain('MLB.TV')
    expect(names('CA', 'cricket', 'Cricket')).toContain('Willow TV')
    expect(names('US', 'table_tennis', 'World Table Tennis')).toContain('World Table Tennis')
  })

  it('newer supported leagues map to official watch hubs', () => {
    expect(names('US', 'basketball', 'WNBA')).toEqual(expect.arrayContaining(['Prime Video', 'WNBA League Pass', 'ION']))
    expect(names('CA', 'american_football', 'CFL')).toContain('TSN')
    expect(names('US', 'hockey', 'PWHL')).toEqual(expect.arrayContaining(['thePWHL.com', 'PWHL YouTube']))
    expect(names('US', 'golf', 'PGA Tour')).toEqual(expect.arrayContaining(['ESPN+', 'Golf Channel', 'PGA TOUR']))
  })

  it('smaller sport routes use official federation or tour destinations', () => {
    expect(names('US', 'rugby', 'Rugby')).toContain('RugbyPass TV')
    expect(names('CA', 'tennis', 'ATP Tour')).toEqual(expect.arrayContaining(['TSN', 'Tennis TV']))
    expect(names('US', 'volleyball', 'Volleyball Nations League')).toContain('VBTV')
    expect(names('GB', 'snooker', 'World Snooker Tour')).toEqual(expect.arrayContaining(['Discovery+ / Eurosport', 'WST Play']))
    expect(names('GB', 'darts', 'PDC World Darts Championship')).toEqual(expect.arrayContaining(['Sky Sports', 'PDC TV']))
    expect(names('US', 'athletics', 'Diamond League')).toEqual(expect.arrayContaining(['Peacock', 'World Athletics Watch']))
    expect(names('US', 'esports', 'League of Legends Worlds')).toContain('LoL Esports')
  })

  it('every resolved link is a real https destination', () => {
    for (const option of fallbackWatchOptions('US', 'soccer', 6, 'Premier League')) {
      expect(option.href).toMatch(/^https:\/\//)
    }
  })

  it('an unmatched league still returns non-empty regional fallback', () => {
    expect(names('US', 'soccer', 'Some Obscure League').length).toBeGreaterThan(0)
  })

  it('does not substitute an unrelated country or sport for missing coverage', () => {
    expect(fallbackWatchOptions('ZZ', 'unknown_sport', 6, 'Unknown')).toEqual([])
    expect(fallbackWatchOptions('DE', 'american_football', 8, 'NFL').some(link => link.name === 'FOX Sports')).toBe(false)
  })

  it('excludes expired, inactive and unsafe database watch destinations', () => {
    const base = { provider_key: 'test', label: 'Test', event_id: 'event', league_id: null,
      country_codes: ['CA'], sport_keys: ['hockey'], link_kind: 'official' as const, url: 'https://example.com', priority: 1,
      watch_providers: { key: 'test', name: 'Test', network: '', direct_url: 'https://example.com', priority: 1, is_active: true } }
    const query = { eventId: 'event', regionCode: 'CA', sportKey: 'hockey' }
    expect(mapWatchRows([base], query)[0]?.scope).toBe('event')
    expect(mapWatchRows([{ ...base, ends_at: '2020-01-01' }], query)).toEqual([])
    expect(mapWatchRows([{ ...base, url: 'javascript:alert(1)' }], query)).toEqual([])
    expect(mapWatchRows([{ ...base, watch_providers: { ...base.watch_providers, is_active: false } }], query)).toEqual([])
    expect(mapWatchRows([base], { ...query, regionCode: 'DE' })).toEqual([])
  })

  // League-name patterns are anchored so look-alikes don't inherit the wrong country's routing.
  // A matched league returns ONLY its catalog rights; a look-alike falls through to generic
  // providers — so the test is whether the broadcaster came from the league rule (source 'catalog').
  function sourceOf(region: string, sport: string, league: string, name: string) {
    return fallbackWatchOptions(region, sport, 8, league).find((o) => o.name === name)?.source
  }

  it('applies Italian Serie A routing to Italian, not Brazilian, Serie A', () => {
    expect(sourceOf('US', 'soccer', 'Italian Serie A', 'Paramount+')).toBe('catalog')
    expect(sourceOf('US', 'soccer', 'Brazilian Serie A', 'Paramount+')).not.toBe('catalog')
  })

  it('applies English Premier League routing to English, not Scottish, Premier League', () => {
    expect(sourceOf('US', 'soccer', 'English Premier League', 'NBC Sports')).toBe('catalog')
    expect(sourceOf('US', 'soccer', 'Scottish Premier League', 'NBC Sports')).not.toBe('catalog')
  })
})
