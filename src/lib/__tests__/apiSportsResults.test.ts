import { expect, test } from 'vitest'
import { normalizeApiSportsGame, apiSportsResultMetadata } from '../../../supabase/functions/_shared/apisports-normalize'
import { finalResultText } from '../eventLifecycle'

test('Imported API-Sports results use the schema read by schedule cards',()=>{
  const game=normalizeApiSportsGame('hockey',{id:1,date:'2026-10-08T02:00:00Z',status:{short:'FT'},
    league:{id:57,name:'NHL'},teams:{home:{id:1,name:'Anaheim Ducks'},away:{id:2,name:'Edmonton Oilers'}},
    scores:{home:0,away:5}})
  expect(game).not.toBeNull()
  expect(finalResultText(game!.status,apiSportsResultMetadata(game!))).toBe('Final: Anaheim Ducks 0 – Edmonton Oilers 5')
})
