import { describe, expect, it } from 'vitest'
import { durationFraction, estimateFightCard, type TimingBout } from '../fightTiming'
const start=new Date('2026-10-08T20:00:00Z')
const base=(id:string,order:number):TimingBout=>({id,order,scheduledRounds:3,status:'scheduled',estimatedStartAt:null,metadata:{},redCorner:{id:'a'},blueCorner:{id:'b'}})
describe('fight timing',()=>{
  it('uses recent duration history and sport-specific rounds',()=>{
    const bouts=[base('one',1),base('two',2)]
    const fallback=estimateFightCard(start,bouts,'mma',{},0)
    const shorter=estimateFightCard(start,bouts,'mma',{a:[{scheduledRounds:3,roundSeconds:300,durationSeconds:60}]},0)
    expect(shorter[1].expected!.getTime()).toBeLessThan(fallback[1].expected!.getTime())
    expect(shorter[0].samples).toBe(1)
    expect(shorter[1].latest!.getTime()).toBeGreaterThan(shorter[1].earliest!.getTime())
  })
  it('reanchors after a confirmed early finish, and preserves confirmed starts',()=>{
    const first={...base('one',1),status:'finished',metadata:{actual_end_at:'2026-10-08T20:05:00Z'}}
    const second={...base('two',2)}
    const windows=estimateFightCard(start,[first,second],'mma',{},0)
    expect(windows[1].expected!.toISOString()).toBe('2026-10-08T20:17:00.000Z')
    expect(windows[1].basis).toBe('live')
    const official={...second,estimatedStartAt:new Date('2026-10-08T21:00:00Z'),metadata:{start_time_confirmed:true}}
    expect(estimateFightCard(start,[first,official],'mma',{},0)[1].expected!.toISOString()).toBe('2026-10-08T21:00:00.000Z')
  })
  it('does not invent an undercard for an inferred headliner or unknown finish time',()=>{
    expect(estimateFightCard(start,[{...base('main',1),metadata:{completeness:'main_event_only'}}],'mma',{},0)[0].expected).toBeNull()
    expect(estimateFightCard(start,[{...base('one',1),status:'finished'},base('two',2)],'boxing',{},0)[1].expected).toBeNull()
    expect(durationFraction({scheduledRounds:3,roundSeconds:300,method:'decision'})).toBe(1)
    expect(durationFraction({scheduledRounds:3,roundSeconds:300,durationSeconds:9999})).toBeNull()
  })
})
