import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'
import { normalizeApiSportsGame, sameApiSportsResult, apiSportsResultMetadata } from './apisports-normalize.ts'
import { normalizeText } from './provider-reconcile.ts'

export async function ingestApiSportsGames(db:SupabaseClient,endpoint:string,sportKey:string,date:string,raw:Record<string,unknown>[]) {
  // MMA records remain source evidence until card grouping/order has been verified.
  if(endpoint==='mma') return {created:0,updated:0,linked:0,staged:raw.length}
  const games=raw.map(row=>normalizeApiSportsGame(endpoint,row)).filter(row=>row!==null)
  if(!games.length) return {created:0,updated:0,linked:0,staged:raw.length}
  const check=<T>(result:{data:T,error:unknown})=>{if(result.error) throw result.error;return result.data}
  const sport=check(await db.from('sports').select('id').eq('key',sportKey).single())
  if(!sport) throw new Error('Unknown canonical sport')
  const leagues=check(await db.from('leagues').select('id,name,country,provider_key,provider_league_id').eq('sport_id',sport.id).eq('is_public',true))??[]
  const leagueMap=new Map<string,string>()
  for(const game of games){
    if(leagueMap.has(game.league.id)) continue
    const direct=leagues.find(row=>row.provider_key==='apisports' && row.provider_league_id===game.league.id)
    if(direct){leagueMap.set(game.league.id,direct.id);continue}
    const matches=leagues.filter(row=>normalizeText(row.name)===normalizeText(game.league.name) &&
      (!row.country || !game.league.country || normalizeText(row.country)===normalizeText(game.league.country)))
    if(matches.length===1){leagueMap.set(game.league.id,matches[0].id);continue}
    const row=check(await db.from('leagues').upsert({sport_id:sport.id,provider_key:'apisports',provider_league_id:game.league.id,
      name:game.league.name,country:game.league.country,is_public:true},{onConflict:'provider_key,provider_league_id'}).select('id').single())
    if(!row) throw new Error('League write returned no identity')
    leagueMap.set(game.league.id,row.id)
  }
  const seeds=[...new Map(games.flatMap(game=>[game.home,game.away]).map(team=>[team.id,team])).values()]
  const competitorRows=seeds.map(team=>({sport_id:sport.id,kind:'team',name:team.name,provider_key:'apisports',provider_competitor_id:team.id}))
  // Names and identity only: importing provider logos requires a separate media-rights review.
  const competitors=check(await db.from('competitors').upsert(competitorRows,{onConflict:'provider_key,provider_competitor_id'}).select('id,provider_competitor_id'))??[]
  const competitorMap=new Map(competitors.map(row=>[row.provider_competitor_id,row.id]))
  const from=new Date(Date.parse(`${date}T00:00:00Z`)-12*3600000).toISOString()
  const to=new Date(Date.parse(`${date}T00:00:00Z`)+36*3600000).toISOString()
  const existing=check(await db.from('events').select('*').eq('sport_id',sport.id).eq('visibility','public').is('custom_league_id',null)
    .in('provider_key',['thesportsdb','apisports','pandascore','openf1','apisports_f1','ics'])
    .gte('starts_at',from).lte('starts_at',to).limit(1000))??[]
  if(existing.length===1000) throw new Error('Candidate window needs pagination before importing')
  const identities=check(await db.from('event_external_ids').select('external_id,event_id').eq('provider_key','apisports').in('external_id',games.map(game=>game.id)))??[]
  const identityMap=new Map(identities.map(row=>[row.external_id,row.event_id]))
  const writes:Record<string,unknown>[]=[];const links:Record<string,unknown>[]=[];const participants:Record<string,unknown>[]=[]
  let created=0,updated=0,linked=0
  for(const game of games){
    const identity=identityMap.get(game.id)
    const matches=existing.filter(row=>identity ? row.id===identity :
      (row.provider_key==='apisports' && row.provider_event_id===game.id) ||
      (normalizeText(row.title)===normalizeText(game.title) && row.league_id===leagueMap.get(game.league.id) &&
        Math.abs(Date.parse(row.starts_at)-Date.parse(game.startsAt))<=10*60000))
    if(matches.length>1) continue // Ambiguous matches are kept in source staging.
    const old=matches[0]
    if(identity && !old) continue // Do not create a duplicate if a linked event moved outside the window.
    const eventId=old?.id??crypto.randomUUID()
    const resultMetadata=apiSportsResultMetadata(game)
    if(old){
      linked++
      // A delayed provider snapshot must not change a final game back to scheduled/live.
      if(old.status!=='finished' || game.status==='finished'){
        const metadata={...old.metadata,...resultMetadata}
        if(old.status!==game.status || !sameApiSportsResult(old.metadata?.result,metadata.result)){
          writes.push({...old,status:game.status,metadata,version:old.version+1,last_checked_at:new Date().toISOString()});updated++
        }
      }
    }else{
      created++
      writes.push({id:eventId,sport_id:sport.id,league_id:leagueMap.get(game.league.id),provider_key:'apisports',provider_event_id:game.id,
        kind:'match',title:game.title,status:game.status,starts_at:game.startsAt,starts_at_tbd:false,timezone:'UTC',visibility:'public',
        home_competitor_id:competitorMap.get(game.home.id),away_competitor_id:competitorMap.get(game.away.id),
        metadata:{source_endpoint:endpoint,...resultMetadata},version:1,source_confidence:'provider',last_checked_at:new Date().toISOString()})
    }
    if(!old || old.provider_key==='apisports') participants.push(
      {event_id:eventId,competitor_id:competitorMap.get(game.home.id),role:'home',position:1},
      {event_id:eventId,competitor_id:competitorMap.get(game.away.id),role:'away',position:2})
    links.push({provider_key:'apisports',external_id:game.id,event_id:eventId,source_confidence:'provider',match_confidence:100,
      last_seen_at:new Date().toISOString(),metadata:{endpoint}})
  }
  // Separate shapes avoid sending omitted fields as NULL on newly inserted rows.
  for(const rows of [writes.filter(row=>!('created_at' in row)),writes.filter(row=>'created_at' in row)]){
    if(rows.length) check(await db.from('events').upsert(rows,{onConflict:'id'}))
  }
  if(participants.length) check(await db.from('event_competitors').upsert(participants,{onConflict:'event_id,competitor_id'}))
  if(links.length) check(await db.from('event_external_ids').upsert(links,{onConflict:'provider_key,external_id'}))
  const byIdentity=new Map(links.map(row=>[row.external_id,row.event_id]))
  const sourceUpdates=games.filter(game=>byIdentity.has(game.id)).map(game=>({provider_key:'apisports',external_id:game.id,
    event_id:byIdentity.get(game.id),sport_key:sportKey,provider_league_id:game.league.id,normalized_title:normalizeText(game.title),
    starts_at:game.startsAt,status:game.status,raw_payload:raw.find(row=>normalizeApiSportsGame(endpoint,row)?.id===game.id)??{},
    metadata:{endpoint,queried_date:date},last_seen_at:new Date().toISOString()}))
  if(sourceUpdates.length) check(await db.from('provider_event_sources').upsert(sourceUpdates,{onConflict:'provider_key,external_id'}))
  return {created,updated,linked,staged:raw.length-games.length}
}
