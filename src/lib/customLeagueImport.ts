import { leagueTimeToUtc } from './leagueTime'
import type { CustomEvent } from './store'

type ParseOptions = {
  makeId: () => string
  timezone?: string
  existingEvents?: CustomEvent[]
}

type ParsedCsv = {
  events: CustomEvent[]
  errors: string[]
}

const HEADER_ALIASES: Record<string, string> = {
  event: 'title',
  game: 'title',
  match: 'title',
  location: 'venue',
  place: 'venue',
  opponentname: 'opponent',
  arrive: 'arriveEarlyMinutes',
  arriveearly: 'arriveEarlyMinutes',
  arriveearlyminutes: 'arriveEarlyMinutes',
  uniform: 'uniformColor',
  kit: 'uniformColor',
  start: 'startsAt',
  startsat: 'startsAt',
  datetime: 'startsAt',
}

function normalizeHeader(value: string) {
  const key = value.trim().replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  return HEADER_ALIASES[key] ?? key
}

function parseCsv(text: string) {
  const line = text.replace(/^\uFEFF/, '').replace(/\r\n|\r/g, '\n')
  const rows: string[][] = []
  const cells: string[] = []
  let current = ''
  let quoted = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    const next = line[index + 1]
    if (char === '"' && quoted && next === '"') {
      current += '"'
      index += 1
    } else if (char === '"') {
      quoted = !quoted
    } else if (char === ',' && !quoted) {
      cells.push(current.trim())
      current = ''
    } else if (char === '\n' && !quoted) {
      cells.push(current.trim())
      if (cells.some(Boolean)) rows.push([...cells])
      cells.length = 0
      current = ''
    } else {
      current += char
    }
  }

  cells.push(current.trim())
  if (quoted) throw new Error('CSV has an unclosed quoted field.')
  if (cells.some(Boolean)) rows.push(cells)
  return rows
}

function normalizeStatus(value: string | undefined): CustomEvent['status'] {
  const status = value?.trim().toLowerCase()
  if (status === 'cancelled' || status === 'canceled') return 'cancelled'
  if (status === 'postponed') return 'postponed'
  return 'scheduled'
}

function parseStart(row: Record<string, string>, timezone?: string) {
  const explicit = row.startsAt?.trim()
  const date = row.date?.trim()
  const time = row.time?.trim() || '12:00'
  const value = explicit || (date ? `${date}T${time.length === 5 ? `${time}:00` : time}` : '')
  if (!value) return null

  let parsed: Date
  try { parsed = timezone && !/(Z|[+-]\d{2}:?\d{2})$/.test(value) ? leagueTimeToUtc(value.slice(0,10), value.slice(11), timezone) : new Date(value) } catch { return null }
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function parseCustomLeagueEventsCsv(text: string, options: ParseOptions): ParsedCsv {
  let rows: string[][]
  try { rows = parseCsv(text) } catch (error) { return { events: [], errors: [String((error as Error).message)] } }
  if (rows.length < 2) return { events: [], errors: ['CSV needs a header row and at least one event row.'] }

  const headers = rows[0].map(normalizeHeader)
  const events: CustomEvent[] = []
  const errors: string[] = []
  const identity = (event: Pick<CustomEvent, 'title' | 'startsAt' | 'opponent'>) => `${event.title.trim().toLowerCase()}|${event.startsAt}|${event.opponent?.trim().toLowerCase() ?? ''}`
  const seen = new Set((options.existingEvents ?? []).map(identity))

  rows.slice(1).forEach((cells, offset) => {
    const rowNumber = offset + 2
    const row = Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? '']))
    const title = row.title?.trim()
    const starts = parseStart(row, options.timezone)

    if (!title) {
      errors.push(`Row ${rowNumber}: missing title.`)
      return
    }
    if (!starts) {
      errors.push(`Row ${rowNumber}: missing or invalid date/time.`)
      return
    }

    const candidate = { title, startsAt: starts.toISOString(), opponent: row.opponent?.trim() || undefined }
    if (seen.has(identity(candidate))) { errors.push(`Row ${rowNumber}: duplicate event skipped.`); return }
    seen.add(identity(candidate))
    const arriveEarlyMinutes = row.arriveEarlyMinutes ? Number(row.arriveEarlyMinutes) : undefined
    events.push({
      id: options.makeId(),
      title,
      startsAt: starts.toISOString(),
      venue: row.venue?.trim() ?? '',
      opponent: row.opponent?.trim() || undefined,
      arriveEarlyMinutes: Number.isFinite(arriveEarlyMinutes) && Number(arriveEarlyMinutes) >= 0 && Number(arriveEarlyMinutes) <= 1440 ? arriveEarlyMinutes : undefined,
      uniformColor: row.uniformColor?.trim() || undefined,
      notes: row.notes?.trim() || undefined,
      status: normalizeStatus(row.status),
    })
  })

  return { events, errors }
}
