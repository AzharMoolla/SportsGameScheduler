export function inScheduleRange(date: Date, range: 'all' | 'today' | 'weekend' | 'week', nowMs: number, timezone: string) {
  if (range === 'all') return true
  const formatter = new Intl.DateTimeFormat('en-CA',{ timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit' })
  const day = (value: Date) => { const p=Object.fromEntries(formatter.formatToParts(value).map(part=>[part.type,part.value])); return Date.UTC(Number(p.year),Number(p.month)-1,Number(p.day))/86400000 }
  const today=day(new Date(nowMs)); const eventDay=day(date)
  if(range==='today') return eventDay===today
  if(range==='week') return eventDay>=today && eventDay<today+7
  const weekday=new Date(today*86400000).getUTCDay()
  const saturday=today+(weekday===0?-1:6-weekday)
  return eventDay>=saturday && eventDay<saturday+2
}
