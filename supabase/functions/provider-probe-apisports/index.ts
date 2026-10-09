import { authorizeMaintenance } from '../_shared/maintenance-auth.ts'

const endpoints = [
  ['football','https://v3.football.api-sports.io','fixtures'],
  ['afl','https://v1.afl.api-sports.io','games'],
  ['baseball','https://v1.baseball.api-sports.io','games'],
  ['basketball','https://v1.basketball.api-sports.io','games'],
  ['formula1','https://v1.formula-1.api-sports.io','races'],
  ['handball','https://v1.handball.api-sports.io','games'],
  ['hockey','https://v1.hockey.api-sports.io','games'],
  ['mma','https://v1.mma.api-sports.io','fights'],
  ['nba','https://v2.nba.api-sports.io','games'],
  ['nfl','https://v1.american-football.api-sports.io','games'],
  ['rugby','https://v1.rugby.api-sports.io','games'],
  ['volleyball','https://v1.volleyball.api-sports.io','games'],
] as const

Deno.serve(async req => {
  const rejected=await authorizeMaintenance(req,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
  if(rejected) return rejected
  const key=Deno.env.get('APISPORTS_KEY')
  if(!key) return Response.json({ok:false,error:'APISPORTS_KEY is not configured in this project'},{status:503})
  const body=await req.json().catch(()=>({}))
  if(body.phase==='baseball'){
    const samples=[]
    for(const offset of [0,1]){
      const date=new Date(Date.now()+offset*86400000).toISOString().slice(0,10)
      try{
        const res=await fetch(`https://v1.baseball.api-sports.io/games?date=${date}`,{headers:{'x-apisports-key':key},signal:AbortSignal.timeout(6000)})
        const json=await res.json()
        samples.push({date,http_status:res.status,errors:JSON.stringify(json.errors??{}).replaceAll(key,'[redacted]'),
          records:json.results,remaining:res.headers.get('x-ratelimit-requests-remaining'),examples:Array.isArray(json.response)?json.response.slice(0,2):[]})
        if(res.status===429 || Object.keys(json.errors??{}).length) break
      }catch{samples.push({date,error:'Timeout or unreadable response'});break}
      await new Promise(resolve=>setTimeout(resolve,700))
    }
    return Response.json({ok:true,checked_at:new Date().toISOString(),baseball:samples})
  }
  if(body.phase==='mma'){
    const samples=[]
    for(const offset of [-5,1,2,3,8,9,10]){
      const date=new Date(Date.now()+offset*86400000).toISOString().slice(0,10)
      await new Promise(resolve=>setTimeout(resolve,700))
      try{
        const res=await fetch(`https://v1.mma.api-sports.io/fights?date=${date}`,{headers:{'x-apisports-key':key},signal:AbortSignal.timeout(6000)})
        const json=await res.json()
        samples.push({date,http_status:res.status,errors:JSON.stringify(json.errors??{}).replaceAll(key,'[redacted]'),
          records:json.results,remaining:res.headers.get('x-ratelimit-requests-remaining'),
          examples:Array.isArray(json.response)?json.response.slice(0,3):[]})
        if(res.status===429) break
      }catch{samples.push({date,error:'Timeout or unreadable response'})}
    }
    return Response.json({ok:true,checked_at:new Date().toISOString(),mma:samples})
  }
  const output=[]
  for(const [sport,base,path] of endpoints){
    const item:Record<string,unknown>={sport,host:new URL(base).hostname}
    try{
      const status=await fetch(`${base}/status`,{headers:{'x-apisports-key':key},signal:AbortSignal.timeout(6000)})
      const json=await status.json()
      const response=Array.isArray(json.response)?json.response[0]:json.response
      item.http_status=status.status
      item.plan=response?.subscription?.plan ?? null
      item.active=response?.subscription?.active ?? null
      item.used=response?.requests?.current ?? null
      item.daily_limit=response?.requests?.limit_day ?? null
      item.status_errors=JSON.stringify(json.errors ?? {}).replaceAll(key,'[redacted]')
      // A single current-year request checks season restrictions, not just key validity.
      if(status.ok && item.active!==false){
        await new Promise(resolve=>setTimeout(resolve,650))
        const date=new Date().toISOString().slice(0,10)
        const query=sport==='formula1'?'season=2026':sport==='football'?'league=39&season=2026':
          sport==='baseball'?'league=1&season=2026':sport==='volleyball'?'league=1&season=2026':`date=${date}`
        const sample=await fetch(`${base}/${path}?${query}`,{headers:{'x-apisports-key':key},signal:AbortSignal.timeout(6000)})
        const sampleJson=await sample.json()
        item.coverage_http_status=sample.status
        item.coverage_errors=JSON.stringify(sampleJson.errors ?? {}).replaceAll(key,'[redacted]')
        item.records=sampleJson.results ?? (Array.isArray(sampleJson.response)?sampleJson.response.length:null)
        item.quota_remaining=sample.headers.get('x-ratelimit-requests-remaining')
        // Store only a minimal public-event example, never account details or credentials.
        const first=Array.isArray(sampleJson.response)?sampleJson.response[0]:null
        item.example=first?{id:first.id ?? first.fixture?.id,date:first.date ?? first.fixture?.date,
          league:first.league?.name,season:first.league?.season ?? first.season,status:first.status ?? first.fixture?.status}:null
      }
    }catch{item.error='Endpoint timed out or returned an unreadable response'}
    output.push(item)
  }
  return Response.json({ok:true,checked_at:new Date().toISOString(),access:output})
})
