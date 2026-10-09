import { describe, expect, test } from 'vitest'
import { leagueTimeToUtc } from '../leagueTime'
import { parseCustomLeagueEventsCsv } from '../customLeagueImport'
import { inScheduleRange } from '../scheduleRange'
describe('community league timezones', () => {
  test('uses the league timezone independently of the device',()=>{
    expect(leagueTimeToUtc('2026-10-10','18:30','America/Toronto').toISOString()).toBe('2026-10-10T22:30:00.000Z')
    expect(leagueTimeToUtc('2026-10-10','18:30','Asia/Tokyo').toISOString()).toBe('2026-10-10T09:30:00.000Z')
  })
  test('Today uses the selected timezone near midnight',()=>{
    const now=new Date('2026-10-10T01:00:00Z').getTime()
    const event=new Date('2026-10-10T22:30:00Z')
    expect(inScheduleRange(event,'today',now,'America/Toronto')).toBe(false)
    expect(inScheduleRange(event,'today',now,'UTC')).toBe(true)
  })
  test('rejects a nonexistent clock-change time',()=>expect(()=>leagueTimeToUtc('2026-03-08','02:30','America/Toronto')).toThrow('does not exist'))
  test('selects the documented earlier autumn occurrence',()=>expect(leagueTimeToUtc('2026-11-01','01:30','America/Toronto').toISOString()).toBe('2026-11-01T05:30:00.000Z'))
  test('CSV wall clocks use the league zone and explicit offsets remain authoritative',()=>{
    const result=parseCustomLeagueEventsCsv('date,time,title\n2026-10-10,18:30,Practice',{makeId:()=> 'one',timezone:'America/Toronto'})
    expect(result.events[0].startsAt).toBe('2026-10-10T22:30:00.000Z')
    const explicit=parseCustomLeagueEventsCsv('startsAt,title\n2026-10-10T18:30:00+02:00,Game',{makeId:()=> 'two',timezone:'America/Toronto'})
    expect(explicit.events[0].startsAt).toBe('2026-10-10T16:30:00.000Z')
  })
})
