/** Parse a wall-clock time in an IANA timezone, independent of the browser timezone.
 * Reject nonexistent spring-forward times. An ambiguous autumn time uses the earlier occurrence.
 */
export function leagueTimeToUtc(date: string, time: string, timezone: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}(?::\d{2})?$/.test(time)) throw new Error('Enter a valid date and time.')
  const target = new Date(`${date}T${time.length === 5 ? `${time}:00` : time}Z`)
  if (!Number.isFinite(target.getTime())) throw new Error('Enter a valid date and time.')
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' })
  const wallMs = (value: Date) => {
    const p = Object.fromEntries(formatter.formatToParts(value).map(p => [p.type,p.value]))
    return Date.UTC(Number(p.year), Number(p.month)-1, Number(p.day), Number(p.hour), Number(p.minute), Number(p.second))
  }
  const offsets = new Set([-36,-12,0,12,36].map(hours => { const candidate = new Date(target.getTime() + hours * 3600000); return wallMs(candidate) - candidate.getTime() }))
  const matches = [...offsets].map(offset => new Date(target.getTime() - offset)).filter(value => wallMs(value) === target.getTime()).sort((a,b) => a.getTime()-b.getTime())
  if (!matches.length) throw new Error('This time does not exist in the league timezone because the clocks change. Choose another time.')
  return matches[0]
}

export function leagueWallTime(value: string, timezone: string) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23' }).formatToParts(new Date(value)).map(p=>[p.type,p.value]))
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` }
}
