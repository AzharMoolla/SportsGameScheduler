import type { LiveEvent } from '../data/liveSport'
import type { Match } from '../domain/match'
import type { CustomLeague } from './store'

export function eventToMatch(event: LiveEvent): Match {
  const start = event.startsAt ?? new Date()
  return { id: event.id, exportEvent: event, startsAt: start, date: start.toISOString().slice(0,10), time: start.toISOString().slice(11,16), team1: event.title, team2: '', round: event.leagueName, ground: event.venue ?? '' }
}

export function customLeagueEvents(league: CustomLeague): LiveEvent[] {
  return league.events.map(event => ({ id: event.id, title: event.title + (event.opponent ? ` vs ${event.opponent}` : ''), startsAt: new Date(event.startsAt), startsAtTbd: false, status: event.status, leagueId: league.id, leagueName: league.name, sportKey: league.sportKey, venue: event.venue, metadata: { ends_at: event.endsAt, updated_at: event.updatedAt ?? league.createdAt, version: event.version ?? 1, description: [event.notes, event.arriveEarlyMinutes ? `Arrive ${event.arriveEarlyMinutes} minutes early.` : '', event.uniformColor ? `Uniform: ${event.uniformColor}` : ''].filter(Boolean).join('\n'), custom_league_id: league.id } }))
}
