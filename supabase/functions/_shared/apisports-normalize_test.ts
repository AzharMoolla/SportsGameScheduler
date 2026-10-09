import { normalizeApiSportsGame, sameApiSportsResult } from './apisports-normalize.ts'
const assert=(condition:unknown,message:string)=>{if(!condition) throw new Error(message)}
const fixture={id:1,timestamp:1791417600,status:{short:'FT'},league:{id:12,name:'NBA'},
  teams:{home:{id:1,name:'Home'},away:{id:2,name:'Away'}},scores:{home:{total:0},away:{total:117}}}
Deno.test('Baseball innings stay live and completed totals remain readable',()=>{
  const live=normalizeApiSportsGame('baseball',{...fixture,status:{short:'IN5',long:'Inning 5'},scores:{home:{total:3},away:{total:1}}})
  assert(live?.status==='live','A live inning is not a scheduled game')
  assert(live?.id==='baseball:1','Baseball identities must be namespaced')
  const final=normalizeApiSportsGame('baseball',{...fixture,scores:{home:{total:0},away:{total:9}}})
  assert(final?.status==='finished' && final.result?.homeScore===0 && final.result?.awayScore===9,'Read totals, including zero, without summing unknown innings')
})
Deno.test('Database JSONB key order does not cause repeated result updates',()=>{
  assert(sameApiSportsResult({home_score:0,away_score:1,source:'apisports'},{source:'apisports',away_score:1,home_score:0}),'Compare values, not object key order')
  assert(!sameApiSportsResult({home_score:0},{home_score:1}),'A real score correction must update')
})
Deno.test('API-Sports preserves zero scores and namespaced identities',()=>{
  const game=normalizeApiSportsGame('basketball',fixture)
  assert(game?.result?.homeScore===0,'Zero must be retained')
  assert(game?.id==='basketball:1','Provider IDs must not collide across endpoints')
  assert(game?.status==='finished','FT is terminal')
})
Deno.test('API-Sports NFL nested timestamp keeps the kickoff time',()=>{
  const game=normalizeApiSportsGame('nfl',{...fixture,id:undefined,timestamp:undefined,
    game:{id:3,date:{date:'2026-10-08',time:'00:04',timestamp:1791417840},status:{short:'Q2'}}})
  assert(game?.startsAt==='2026-10-08T00:04:00.000Z','Do not drop the time by parsing date-only')
  assert(game?.status==='live','Q2 must be live')
})
Deno.test('API-Sports null scores and malformed records are not invented',()=>{
  const game=normalizeApiSportsGame('handball',{...fixture,status:{short:'NS'},scores:{home:null,away:null}})
  assert(game?.result===null,'Null scores are unknown, not zero')
  assert(game?.status==='scheduled','NS is scheduled')
  assert(normalizeApiSportsGame('handball',{...fixture,timestamp:undefined,date:'bad'})===null,'Reject invalid dates')
  assert(normalizeApiSportsGame('handball',{...fixture,teams:{}})===null,'Reject missing teams')
})
