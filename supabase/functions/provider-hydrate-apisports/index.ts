import { createClient } from 'npm:@supabase/supabase-js@2'
import { authorizeMaintenance } from '../_shared/maintenance-auth.ts'
import { normalizeText } from '../_shared/provider-reconcile.ts'
import { ingestApiSportsGames } from '../_shared/apisports-ingest.ts'

const endpoints = [
  ['baseball','https://v1.baseball.api-sports.io','baseball'],
  ['basketball','https://v1.basketball.api-sports.io','basketball'],
  ['handball','https://v1.handball.api-sports.io','handball'],
  ['hockey','https://v1.hockey.api-sports.io','hockey'],
  ['nfl','https://v1.american-football.api-sports.io','american_football'],
  ['rugby','https://v1.rugby.api-sports.io','rugby'],
  ['mma','https://v1.mma.api-sports.io','combat_sports'],
] as const

Deno.serve(async req => {
  const rejected=await authorizeMaintenance(req,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
  if(rejected) return rejected
  const key=Deno.env.get('APISPORTS_KEY')
  if(!key) return Response.json({ok:false,error:'APISPORTS_KEY is missing'},{status:503})
  const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const body=await req.json().catch(()=>({}))
  const deadline=Date.now()+100000
  const output=[]
  for(const [endpoint,host,sport] of endpoints){
    // The free plans permit yesterday/today/tomorrow. Never query outside that window.
    for(const offset of (body.sample ? [0] : [-1,0,1])){
      if(Date.now()>deadline-8000) break
      const date=new Date(Date.now()+offset*86400000).toISOString().slice(0,10)
      if(body.cached===true){
        const {data,error}=await db.from('provider_event_sources').select('raw_payload').eq('provider_key','apisports')
          .eq('metadata->>endpoint',endpoint).eq('metadata->>queried_date',date).limit(1000)
        if(error || data?.length===1000) return Response.json({ok:false,error:'Cached source read failed or requires pagination'},{status:500})
        const counts=await ingestApiSportsGames(db,endpoint,sport,date,(data??[]).map(row=>row.raw_payload))
        output.push({endpoint,date,status:'cached_success',...counts})
        continue
      }
      const {data:reserved,error:budgetError}=await db.rpc('reserve_apisports_request',{endpoint_name:endpoint})
      if(budgetError || !reserved){output.push({endpoint,date,status:'budget_exhausted'});break}
      await new Promise(resolve=>setTimeout(resolve,700))
      const started=new Date().toISOString()
      try{
        const response=await fetch(`${host}/${endpoint==='mma'?'fights':'games'}?date=${date}`,{
          headers:{'x-apisports-key':key},signal:AbortSignal.timeout(6000)})
        const remaining=Number(response.headers.get('x-ratelimit-requests-remaining'))
        if(response.headers.has('x-ratelimit-requests-remaining') && Number.isFinite(remaining)){
          const {error}=await db.from('apisports_request_budget').update({remaining:Math.max(0,Math.min(100,remaining))})
            .eq('day',new Date().toISOString().slice(0,10)).eq('endpoint',endpoint)
          if(error) throw error
        }
        const json=await response.json()
        const errors=json.errors && Object.keys(json.errors).length ? JSON.stringify(json.errors).replaceAll(key,'[redacted]') : null
        if(!response.ok || errors){
          output.push({endpoint,date,status:'provider_rejected',http_status:response.status,error:errors})
          // Stop this endpoint for the batch, including HTTP 200 plan errors.
          break
        }
        const rows=Array.isArray(json.response)?json.response:[]
        if(body.sample){output.push({endpoint,date,records:rows.length,example:rows[0]??null});continue}
        const sources=rows.flatMap((raw:Record<string,unknown>)=>{
          const game=(raw.game??raw) as Record<string,unknown>
          if(game.id==null) return []
          const teams=raw.teams as {home?:{name?:string},away?:{name?:string}}|undefined
          const fighters=raw.fighters as {first?:{name?:string},second?:{name?:string}}|undefined
          const title=teams?.home?.name && teams?.away?.name ? `${teams.home.name} vs ${teams.away.name}` :
            fighters?.first?.name && fighters?.second?.name ? `${fighters.first.name} vs ${fighters.second.name}` : String(raw.title??`MMA fight ${game.id}`)
          const value=game.date as string|{date?:string,start?:string}|undefined
          const rawDate=typeof value==='string'?value:value?.date??value?.start
          const stamp=rawDate && Number.isFinite(Date.parse(rawDate))?new Date(rawDate).toISOString():null
          const league=raw.league as {id?:number}|undefined
          return [{provider_key:'apisports',external_id:`${endpoint}:${game.id}`,sport_key:sport,
            provider_league_id:league?.id==null?null:`${endpoint}:${league.id}`,normalized_title:normalizeText(title),
            starts_at:stamp,raw_payload:raw,metadata:{endpoint,queried_date:date},last_seen_at:new Date().toISOString()}]
        })
        if(sources.length){
          const {error}=await db.from('provider_event_sources').upsert(sources,{onConflict:'provider_key,external_id'})
          if(error) throw error
        }
        const counts=await ingestApiSportsGames(db,endpoint,sport,date,rows)
        const {error}=await db.from('provider_sync_runs').insert({provider_key:'apisports',sport_key:sport,
          status:'success',fetched_count:rows.length,changed_count:counts.created+counts.updated,started_at:started,finished_at:new Date().toISOString()})
        if(error) throw error
        output.push({endpoint,date,status:'success',records:rows.length,...counts})
      }catch(error){output.push({endpoint,date,status:'failed',error:String(error).replaceAll(key,'[redacted]').slice(0,500)});break}
    }
  }
  return Response.json({ok:!output.some(x=>x.status==='failed'||x.status==='provider_rejected'),checked_at:new Date().toISOString(),batches:output})
})
