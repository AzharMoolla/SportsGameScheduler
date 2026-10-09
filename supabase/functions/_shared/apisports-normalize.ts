export type GameRecord = {
  id: string; startsAt: string; title: string; status: string;
  league: {id: string; name: string; country: string | null};
  home: {id: string; name: string}; away: {id: string; name: string};
  result: {homeScore: number; awayScore: number; homeName: string; awayName: string} | null
}
type Raw = Record<string, unknown>
export function apiSportsResultMetadata(game:GameRecord) {
  return game.result ? {result:{home_score:game.result.homeScore,away_score:game.result.awayScore,
    home_team:game.result.homeName,away_team:game.result.awayName,source:'apisports'}} : {}
}
const object = (value: unknown): Raw => value && typeof value === 'object' ? value as Raw : {}
export function sameApiSportsResult(left:unknown,right:unknown):boolean {
  if(left==null || right==null) return left==null && right==null
  const a=object(left),b=object(right)
  return ['home_score','away_score','home_team','away_team','source'].every(key=>a[key]===b[key])
}
const score = (value: unknown): number | null => {
  const candidate=typeof value==='object' && value!==null ? object(value).total : value
  return typeof candidate==='number' && Number.isFinite(candidate) && candidate>=0 ? candidate : null
}
export function normalizeApiSportsGame(endpoint: string, raw: Raw): GameRecord | null {
  const game=object(raw.game ?? raw), teams=object(raw.teams), league=object(raw.league)
  const home=object(teams.home), away=object(teams.away), date=object(game.date)
  const timestamp=game.timestamp ?? date.timestamp
  const dateString=typeof game.date==='string' ? game.date : typeof date.start==='string' ? date.start : null
  const time=typeof timestamp==='number' ? timestamp*1000 : dateString ? Date.parse(dateString) : NaN
  if(!Number.isFinite(time) || game.id==null || league.id==null || !league.name || home.id==null || away.id==null || !home.name || !away.name) return null
  const short=String(object(game.status).short??'').toUpperCase()
  const long=String(object(game.status).long??'').toLowerCase()
  const status=/^(FT|AOT|AP|AET|PEN|AWD|WO)$/.test(short)||/finished|ended|final/.test(long) ? 'finished' :
    /postpon/.test(long)||short==='PST' ? 'postponed' : /cancel|abandon/.test(long)||/^(CANC|ABD)$/.test(short) ? 'cancelled' :
    /^(Q[1-4]|OT|BT|HT|P[1-3]|[12]H|LIVE|INP|IN\d+)$/.test(short)||/in progress|half time|quarter|period|inning/.test(long) ? 'live' : 'scheduled'
  const scores=object(raw.scores), homeScore=score(scores.home), awayScore=score(scores.away)
  return {id:`${endpoint}:${game.id}`,startsAt:new Date(time).toISOString(),title:`${home.name} vs ${away.name}`,status,
    league:{id:`${endpoint}:${league.id}`,name:String(league.name),country:String(object(raw.country ?? league.country).name??'')||null},
    home:{id:`${endpoint}:${home.id}`,name:String(home.name)},away:{id:`${endpoint}:${away.id}`,name:String(away.name)},
    result:homeScore!==null && awayScore!==null ? {homeScore,awayScore,homeName:String(home.name),awayName:String(away.name)} : null}
}
