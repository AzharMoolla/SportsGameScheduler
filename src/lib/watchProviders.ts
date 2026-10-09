// Direct broadcaster information for sports fans.

export type WatchProvider = {
  key: string
  name: string
  /** Regions where the provider is relevant (ISO country codes). */
  regions: string[]
  /** Sport keys where the provider is commonly relevant. Empty means broadly useful. */
  sports?: string[]
  /** Official public destination. */
  url: string
}

// Official broadcaster destinations, with no referral or tracking parameters.
export const WATCH_PROVIDERS: WatchProvider[] = [
  { key: 'ligue1_plus', name: 'Ligue 1+', regions: ['FR'], sports: ['soccer'], url: 'https://ligue1.com/en/offres-ligue1plus' },
  { key: 'nba_watch_guide', name: 'NBA broadcast guide', regions: [], sports: ['basketball'], url: 'https://www.nba.com/news/how-to-watch-games-2026-27-season' },
  { key: 'nhl_watch_guide', name: 'NHL broadcast guide', regions: [], sports: ['hockey'], url: 'https://www.nhl.com/info/how-to-watch-and-stream-nhl-games' },
  { key: 'uefa_watch_guide', name: 'UEFA broadcast guide', regions: [], sports: ['soccer'], url: 'https://www.uefa.com/uefachampionsleague/news/0253-0d82037aaedd-f371c464f919-1000--where-to-watch-the-champions-league-tv-broadcast-partners-streams/' },
  { key: 'espn_watch', name: 'ABC / ESPN', regions: ['US'], sports: ['basketball'], url: 'https://www.espn.com/watch/' },
  { key: 'fox_sports', name: 'FOX Sports', regions: ['US'], sports: ['world_cup'], url: 'https://www.foxsports.com/soccer/fifa-world-cup' },
  { key: 'telemundo', name: 'Telemundo Deportes', regions: ['US'], sports: ['world_cup'], url: 'https://www.telemundo.com/deportes' },
  { key: 'ctv_tsn_rds', name: 'CTV / TSN / RDS', regions: ['CA'], sports: ['world_cup'], url: 'https://www.tsn.ca/soccer' },
  { key: 'rte_player', name: 'RTE Player', regions: ['IE'], sports: ['world_cup', 'soccer'], url: 'https://www.rte.ie/player/' },
  { key: 'm6', name: 'M6+', regions: ['FR'], sports: ['world_cup', 'soccer'], url: 'https://www.m6.fr/' },
  { key: 'ard', name: 'ARD Mediathek', regions: ['DE'], sports: ['world_cup'], url: 'https://www.ardmediathek.de/' },
  { key: 'zdf', name: 'ZDF', regions: ['DE'], sports: ['world_cup', 'soccer'], url: 'https://www.zdf.de/' },
  { key: 'magenta_sport', name: 'MagentaSport', regions: ['DE'], sports: ['world_cup', 'soccer'], url: 'https://www.magentasport.de/' },
  { key: 'rai_play', name: 'RaiPlay', regions: ['IT'], sports: ['world_cup', 'soccer'], url: 'https://www.raiplay.it/' },
  { key: 'dazn_it', name: 'DAZN Italy', regions: ['IT'], sports: ['world_cup', 'soccer'], url: 'https://www.dazn.com/it-IT/home' },
  { key: 'dazn_es', name: 'DAZN Spain', regions: ['ES'], sports: ['world_cup', 'soccer', 'f1', 'motorsport'], url: 'https://www.dazn.com/es-ES/home' },
  { key: 'nos', name: 'NOS', regions: ['NL'], sports: ['world_cup', 'soccer'], url: 'https://nos.nl/sport' },
  { key: 'vrt_max', name: 'VRT MAX', regions: ['BE'], sports: ['world_cup', 'soccer'], url: 'https://www.vrt.be/vrtmax/' },
  { key: 'rtbf_auvio', name: 'RTBF Auvio', regions: ['BE'], sports: ['world_cup', 'soccer'], url: 'https://auvio.rtbf.be/' },
  { key: 'sport_tv_pt', name: 'Sport TV', regions: ['PT'], sports: ['world_cup', 'soccer'], url: 'https://www.sporttv.pt/' },
  { key: 'tvi', name: 'TVI', regions: ['PT'], sports: ['world_cup', 'soccer'], url: 'https://tvi.iol.pt/' },
  { key: 'rtp_play', name: 'RTP Play', regions: ['PT'], sports: ['world_cup', 'soccer'], url: 'https://www.rtp.pt/play/' },
  { key: 'dr_tv', name: 'DR TV', regions: ['DK'], sports: ['world_cup', 'soccer'], url: 'https://www.dr.dk/drtv/' },
  { key: 'tv2_dk', name: 'TV 2 Denmark', regions: ['DK'], sports: ['world_cup', 'soccer'], url: 'https://tv2.dk/' },
  { key: 'svt_play', name: 'SVT Play', regions: ['SE'], sports: ['world_cup', 'soccer'], url: 'https://www.svtplay.se/' },
  { key: 'tv4_play', name: 'TV4 Play', regions: ['SE'], sports: ['world_cup', 'soccer'], url: 'https://www.tv4play.se/' },
  { key: 'tv2_play_no', name: 'TV 2 Play Norway', regions: ['NO'], sports: ['world_cup', 'soccer'], url: 'https://play.tv2.no/' },
  { key: 'nrk_tv', name: 'NRK TV', regions: ['NO'], sports: ['world_cup', 'soccer'], url: 'https://tv.nrk.no/' },
  { key: 'yle_areena', name: 'Yle Areena', regions: ['FI'], sports: ['world_cup', 'soccer'], url: 'https://areena.yle.fi/' },
  { key: 'mtv_katsomo', name: 'MTV Katsomo', regions: ['FI'], sports: ['world_cup', 'soccer'], url: 'https://www.mtv.fi/' },
  { key: 'orf_on', name: 'ORF ON', regions: ['AT'], sports: ['world_cup', 'soccer'], url: 'https://on.orf.at/' },
  { key: 'servus_tv', name: 'ServusTV', regions: ['AT'], sports: ['world_cup', 'soccer'], url: 'https://www.servustv.com/' },
  { key: 'srg_ssr', name: 'SRG SSR', regions: ['CH'], sports: ['world_cup', 'soccer'], url: 'https://www.srgssr.ch/' },
  { key: 'tvp_sport', name: 'TVP Sport', regions: ['PL'], sports: ['world_cup', 'soccer'], url: 'https://sport.tvp.pl/' },
  { key: 'canal_plus', name: 'CANAL+', regions: ['FR', 'PL', 'LU', 'CH'], sports: ['soccer', 'rugby', 'motorsport', 'tennis'], url: 'https://www.canalplus.com/' },
  { key: 'televisa', name: 'Televisa', regions: ['MX'], sports: ['world_cup', 'soccer'], url: 'https://www.tudn.com/' },
  { key: 'tv_azteca', name: 'TV Azteca Deportes', regions: ['MX'], sports: ['world_cup', 'soccer'], url: 'https://www.tvazteca.com/aztecadeportes/' },
  { key: 'globo', name: 'Globo', regions: ['BR'], sports: ['world_cup', 'soccer'], url: 'https://ge.globo.com/' },
  { key: 'cazetv', name: 'CazeTV', regions: ['BR'], sports: ['world_cup', 'soccer'], url: 'https://www.youtube.com/@CazeTV' },
  { key: 'telefe', name: 'Telefe', regions: ['AR'], sports: ['world_cup', 'soccer'], url: 'https://mitelefe.com/' },
  { key: 'tyc_sports', name: 'TyC Sports', regions: ['AR'], sports: ['world_cup', 'soccer'], url: 'https://www.tycsports.com/' },
  { key: 'sbs_on_demand', name: 'SBS On Demand', regions: ['AU'], sports: ['world_cup', 'soccer'], url: 'https://www.sbs.com.au/ondemand/' },
  { key: 'tvnz', name: 'TVNZ+', regions: ['NZ'], sports: ['world_cup', 'soccer'], url: 'https://www.tvnz.co.nz/' },
  { key: 'apple_mls', name: 'MLS on Apple TV', regions: ['US', 'CA', 'GB', 'AU'], sports: ['soccer', 'mls'], url: 'https://tv.apple.com/us/channel/mls/tvs.sbd.7000' },
  { key: 'nfl_game_pass_dazn', name: 'NFL Game Pass on DAZN', regions: ['CA', 'GB', 'DE', 'FR', 'IT', 'ES'], sports: ['football', 'nfl', 'american_football'], url: 'https://www.dazn.com/en-GB/l/nfl-game-pass' },
  { key: 'nhl_tv_dazn', name: 'NHL.TV on DAZN', regions: ['GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE'], sports: ['hockey'], url: 'https://www.dazn.com/' },
  { key: 'icc_tv', name: 'ICC.tv', regions: [], sports: ['cricket'], url: 'https://www.icc.tv/' },
  { key: 'willow_tv', name: 'Willow TV', regions: ['US', 'CA'], sports: ['cricket'], url: 'https://www.willow.tv/' },
  { key: 'wtt_live', name: 'World Table Tennis', regions: ['US', 'CA', 'GB', 'DE', 'FR', 'IT', 'ES'], sports: ['table_tennis'], url: 'https://www.worldtabletennis.com/livevideo' },
  { key: 'dazn', name: 'DAZN', regions: ['US', 'CA', 'GB', 'DE', 'ES', 'IT', 'ZA'], sports: ['soccer', 'combat', 'boxing', 'mma'], url: 'https://www.dazn.com/' },
  { key: 'paramount_plus', name: 'Paramount+', regions: ['US', 'CA', 'GB', 'AU'], sports: ['soccer', 'combat', 'football'], url: 'https://www.paramountplus.com/' },
  { key: 'ufc_fight_pass', name: 'UFC Fight Pass', regions: ['US', 'CA', 'GB', 'AU', 'IN'], sports: ['combat', 'mma'], url: 'https://ufcfightpass.com/' },
  { key: 'prime_video', name: 'Prime Video', regions: ['US', 'CA', 'GB', 'ES', 'IN', 'ZA'], sports: ['combat', 'boxing', 'soccer', 'football', 'basketball'], url: 'https://www.primevideo.com/' },
  { key: 'ppv_com', name: 'PPV.com', regions: ['US', 'CA'], sports: ['combat', 'boxing', 'mma'], url: 'https://www.ppv.com/' },
  { key: 'espn_plus', name: 'ESPN+', regions: ['US'], sports: ['soccer', 'combat', 'football', 'basketball', 'hockey', 'tennis', 'golf'], url: 'https://plus.espn.com/' },
  { key: 'cbs_sports', name: 'CBS Sports', regions: ['US'], sports: ['basketball', 'football', 'golf'], url: 'https://www.cbssports.com/' },
  { key: 'ion', name: 'ION', regions: ['US'], sports: ['basketball', 'hockey'], url: 'https://iontelevision.com/sports' },
  { key: 'usa_network', name: 'USA Network', regions: ['US'], sports: ['basketball', 'olympic'], url: 'https://www.usanetwork.com/' },
  { key: 'fubo', name: 'Fubo', regions: ['US', 'CA'], sports: ['soccer', 'football', 'basketball', 'hockey', 'baseball'], url: 'https://www.fubo.tv/' },
  { key: 'mlb_tv', name: 'MLB.TV', regions: ['US', 'CA', 'GB', 'AU', 'JP'], sports: ['baseball'], url: 'https://www.mlb.com/live-stream-games' },
  { key: 'nba_league_pass', name: 'NBA League Pass', regions: ['US', 'CA', 'GB', 'AU', 'IN'], sports: ['basketball'], url: 'https://www.nba.com/watch/league-pass-stream' },
  { key: 'wnba_league_pass', name: 'WNBA League Pass', regions: ['US', 'CA', 'GB', 'AU'], sports: ['basketball', 'wnba'], url: 'https://www.wnba.com/leaguepass' },
  { key: 'formula1_tv', name: 'F1 TV', regions: ['US', 'CA', 'GB', 'AU', 'IN', 'ZA', 'ES'], sports: ['motorsport', 'f1'], url: 'https://f1tv.formula1.com/' },
  { key: 'apple_tv', name: 'Apple TV', regions: ['US', 'CA', 'GB', 'AU'], sports: ['soccer', 'baseball'], url: 'https://tv.apple.com/' },
  { key: 'sling', name: 'Sling TV', regions: ['US'], sports: ['soccer', 'football', 'basketball', 'hockey', 'baseball', 'combat'], url: 'https://www.sling.com/' },
  { key: 'peacock', name: 'Peacock', regions: ['US'], sports: ['soccer', 'football', 'olympic', 'track'], url: 'https://www.peacocktv.com/' },
  { key: 'max_tnt', name: 'TNT Sports / Max', regions: ['US'], sports: ['basketball', 'hockey', 'soccer', 'combat'], url: 'https://www.max.com/' },
  { key: 'tsn', name: 'TSN', regions: ['CA'], sports: ['soccer', 'football', 'basketball', 'hockey', 'combat', 'tennis', 'golf'], url: 'https://www.tsn.ca/' },
  { key: 'sportsnet_plus', name: 'Sportsnet+', regions: ['CA'], sports: ['hockey', 'baseball', 'basketball', 'soccer', 'combat', 'golf'], url: 'https://www.sportsnetplus.ca/' },
  { key: 'crave', name: 'Crave', regions: ['CA'], sports: ['soccer', 'combat', 'basketball', 'hockey'], url: 'https://www.crave.ca/' },
  { key: 'cbc_gem', name: 'CBC Gem', regions: ['CA'], sports: ['olympic', 'soccer', 'hockey', 'track'], url: 'https://gem.cbc.ca/' },
  { key: 'sky_sports', name: 'Sky Sports', regions: ['GB', 'IE'], sports: ['soccer', 'football', 'f1', 'motorsport', 'boxing', 'combat', 'golf', 'tennis'], url: 'https://www.skysports.com/' },
  { key: 'now_sports', name: 'NOW Sports', regions: ['GB', 'IE'], sports: ['soccer', 'football', 'f1', 'motorsport', 'boxing', 'combat', 'golf', 'tennis'], url: 'https://www.nowtv.com/membership/watch-sky-sports' },
  { key: 'tnt_sports_uk', name: 'TNT Sports UK', regions: ['GB', 'IE'], sports: ['soccer', 'combat', 'boxing', 'mma'], url: 'https://www.tntsports.co.uk/' },
  { key: 'bbc_iplayer', name: 'BBC iPlayer', regions: ['GB'], sports: ['soccer', 'olympic', 'tennis', 'track'], url: 'https://www.bbc.co.uk/iplayer' },
  { key: 'itvx', name: 'ITVX', regions: ['GB'], sports: ['soccer', 'rugby', 'boxing'], url: 'https://www.itv.com/' },
  { key: 'movistar_plus', name: 'Movistar Plus+', regions: ['ES'], sports: ['soccer', 'f1', 'motorsport', 'basketball', 'tennis', 'golf'], url: 'https://www.movistarplus.es/' },
  { key: 'rtve', name: 'RTVE Play', regions: ['ES'], sports: ['soccer', 'olympic', 'tennis', 'track'], url: 'https://www.rtve.es/play/' },
  { key: 'showmax', name: 'Showmax', regions: ['ZA', 'NG', 'KE', 'GH'], sports: ['soccer', 'football', 'rugby', 'combat'], url: 'https://www.showmax.com/' },
  { key: 'dstv_supersport', name: 'DStv / SuperSport', regions: ['ZA', 'NG', 'KE', 'GH'], sports: ['soccer', 'rugby', 'cricket', 'combat', 'motorsport', 'tennis', 'golf'], url: 'https://www.dstv.com/' },
  { key: 'bein_sports', name: 'beIN SPORTS', regions: ['QA', 'SA', 'AE', 'EG', 'MA', 'FR', 'ES', 'US'], sports: ['soccer', 'tennis', 'motorsport', 'combat'], url: 'https://www.beinsports.com/' },
  { key: 'sonyliv', name: 'SonyLIV', regions: ['IN'], sports: ['soccer', 'cricket', 'combat', 'tennis'], url: 'https://www.sonyliv.com/' },
  { key: 'fancode', name: 'FanCode', regions: ['IN'], sports: ['cricket', 'soccer', 'basketball', 'baseball'], url: 'https://www.fancode.com/' },
  { key: 'hotstar_jio', name: 'JioHotstar', regions: ['IN'], sports: ['cricket', 'football', 'soccer', 'tennis', 'olympic'], url: 'https://www.hotstar.com/in' },
  // League-rights providers referenced by the per-league CATALOG_RULES (docs/where-to-watch-rights-truth.md).
  { key: 'nbc_sports', name: 'NBC Sports', regions: ['US'], sports: ['soccer', 'football'], url: 'https://www.nbcsports.com/soccer/premier-league' },
  { key: 'premier_sports', name: 'Premier Sports', regions: ['GB', 'IE'], sports: ['soccer'], url: 'https://www.premiersports.com/' },
  { key: 'viaplay', name: 'Viaplay', regions: ['NL', 'SE', 'NO', 'DK', 'FI', 'GB', 'PL'], sports: ['soccer', 'football', 'f1', 'motorsport'], url: 'https://viaplay.com/' },
  { key: 'sky_de', name: 'Sky Deutschland', regions: ['DE', 'AT'], sports: ['soccer', 'f1', 'motorsport'], url: 'https://www.sky.de/sport' },
  { key: 'sky_it', name: 'Sky Italia', regions: ['IT'], sports: ['soccer', 'f1', 'motorsport'], url: 'https://programmi.sky.it/sport' },
  { key: 'ziggo_sport', name: 'Ziggo Sport', regions: ['NL'], sports: ['soccer', 'f1', 'motorsport'], url: 'https://www.ziggosport.nl/' },
  { key: 'channel4', name: 'Channel 4', regions: ['GB'], sports: ['motorsport', 'f1'], url: 'https://www.channel4.com/now/C4' },
  { key: 'tudn', name: 'TUDN', regions: ['US'], sports: ['soccer'], url: 'https://www.tudn.com/' },
  { key: 'wimbledon_tv', name: 'Wimbledon Watch', regions: [], sports: ['tennis'], url: 'https://www.wimbledon.com/en_GB/about/tv_coverage' },
  { key: 'tennis_tv', name: 'Tennis TV', regions: [], sports: ['tennis'], url: 'https://www.tennistv.com/' },
  { key: 'golf_channel', name: 'Golf Channel', regions: ['US'], sports: ['golf'], url: 'https://www.golfchannel.com/watch/on-air-schedule' },
  { key: 'pga_tour', name: 'PGA TOUR', regions: [], sports: ['golf'], url: 'https://www.pgatour.com/watch' },
  { key: 'cfl_plus', name: 'CFL+', regions: ['US', 'GB', 'IE', 'DE', 'FR', 'IT', 'ES', 'MX', 'AU'], sports: ['american_football', 'football', 'cfl'], url: 'https://www.cfl.ca/plus/' },
  { key: 'rugbypass_tv', name: 'RugbyPass TV', regions: [], sports: ['rugby'], url: 'https://rugbypass.tv/' },
  { key: 'pwhl_site', name: 'thePWHL.com', regions: ['US', 'GB', 'IE', 'DE', 'FR', 'IT', 'ES', 'AU', 'NZ'], sports: ['hockey', 'pwhl'], url: 'https://www.thepwhl.com/en/where-to-watch' },
  { key: 'pwhl_youtube', name: 'PWHL YouTube', regions: ['US', 'GB', 'IE', 'DE', 'FR', 'IT', 'ES', 'AU', 'NZ'], sports: ['hockey', 'pwhl'], url: 'https://www.youtube.com/@thepwhlofficial' },
  { key: 'vbtv', name: 'VBTV', regions: [], sports: ['volleyball'], url: 'https://tv.volleyballworld.com/' },
  { key: 'wst_play', name: 'WST Play', regions: [], sports: ['snooker'], url: 'https://www.wst.tv/watch-live/' },
  { key: 'pdc_tv', name: 'PDC TV', regions: [], sports: ['darts'], url: 'https://video.pdc.tv/' },
  { key: 'world_athletics_watch', name: 'World Athletics Watch', regions: [], sports: ['athletics', 'track'], url: 'https://worldathletics.org/watch/live' },
  { key: 'nbc_olympics', name: 'NBC Olympics', regions: ['US'], sports: ['olympic', 'olympic_sports', 'track'], url: 'https://www.nbcolympics.com/' },
  { key: 'discovery_plus', name: 'Discovery+ / Eurosport', regions: ['GB', 'IE', 'DE', 'FR', 'IT', 'ES', 'NL', 'SE', 'NO', 'DK', 'FI', 'PL'], sports: ['olympic', 'olympic_sports', 'cycling', 'tennis', 'snooker'], url: 'https://www.discoveryplus.com/' },
  { key: 'olympics_com', name: 'Olympics.com', regions: [], sports: ['olympic', 'olympic_sports'], url: 'https://olympics.com/' },
  { key: 'lolesports', name: 'LoL Esports', regions: [], sports: ['esports'], url: 'https://lolesports.com/' },
  { key: 'valorant_twitch', name: 'VALORANT Twitch', regions: [], sports: ['esports'], url: 'https://www.twitch.tv/valorant' },
  { key: 'blastpremier_twitch', name: 'BLAST Premier Twitch', regions: [], sports: ['esports'], url: 'https://www.twitch.tv/blastpremier' },
  { key: 'eslcs_twitch', name: 'ESL CS Twitch', regions: [], sports: ['esports'], url: 'https://www.twitch.tv/eslcs' },
]

const PROVIDER_BY_KEY = new Map(WATCH_PROVIDERS.map((p) => [p.key, p]))

export type ResolvedWatchLink = { name: string; href: string; affiliate: false }

export function watchLinkFor(key: string): ResolvedWatchLink | null {
  const provider = PROVIDER_BY_KEY.get(key)
  return provider ? { name: provider.name, href: provider.url, affiliate: false } : null
}

// Fuzzy-match a broadcaster/channel string from the data feed to a known broadcaster.
export function safeWatchUrl(value: string | null | undefined): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null
  } catch { return null }
}

export function matchWatchProvider(channel: string, country?: string): WatchProvider | null {
  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '')
  const code=country?.toUpperCase()
  const regionName=code && /^[A-Z]{2}$/.test(code) ? new Intl.DisplayNames(['en'],{type:'region'}).of(code) : null
  const qualified=regionName ? channel.replace(new RegExp(`\\s+(?:${regionName}|${code})\\s*$`,'i'),'') : channel
  const c = normalize(qualified)
  if (!c) return null
  return WATCH_PROVIDERS.filter(p => !country || !p.regions.length || p.regions.includes(country.toUpperCase()))
    .sort((a, b) => normalize(b.name).length - normalize(a.name).length)
    .find(p => {
      if(p.key==='bein_sports' && /^beinsports(?:(?:hd|max|uhd)?\d*)?$/.test(c)) return true
      if(p.key==='ligue1_plus' && /^ligue1(?:plus)?\d*$/.test(c)) return true
      if(p.key==='canal_plus' && /^canal(?:plus)?(?:sport)?\d*(?:hd|uhd)?$/.test(c)) return true
      const names = [normalize(p.key), normalize(p.name)]
      return names.some(name => name.length >= 3 && (c === name || new RegExp(`^${name}\\d*(?:hd|uhd)?$`).test(c)))
    }) ?? null
}
