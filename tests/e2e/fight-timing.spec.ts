import { expect, test } from '@playwright/test'

test('fight estimates show history, opt-in alerts, and reanchor after a real finish',async({page})=>{
  await page.addInitScript(()=>{localStorage.setItem('mp.onboarded','1'); Object.defineProperty(window,'Notification',{value:undefined,configurable:true}); delete (window as unknown as Record<string,unknown>).Notification})
  const id='aaaaaaaa-2222-4444-8888-bbbbbbbbbbbb'
  const a='aaaaaaaa-3333-4444-8888-bbbbbbbbbbbb', b='aaaaaaaa-4444-4444-8888-bbbbbbbbbbbb'
  const start=new Date(Date.now()+3600_000).toISOString()
  const fixture={id,title:'Timing Test Card',status:'scheduled',starts_at:start,starts_at_tbd:false,updated_at:new Date().toISOString(),version:1,
    league_id:null,kind:'card',sports:{key:'combat_sports'},leagues:{name:'UFC'},venues:null,metadata:{}}
  let finished=false
  await page.route('**/rest/v1/events?*',r=>r.fulfill({json:[fixture]}))
  await page.route('**/rest/v1/event_competitors?*',r=>r.fulfill({json:[]}))
  await page.route('**/rest/v1/competitors?*',r=>r.fulfill({json:[{id:a,name:'Fighter A',country:'CA',logo_url:null},{id:b,name:'Fighter B',country:'US',logo_url:null}]}))
  await page.route('**/rest/v1/event_bouts?*',r=>r.fulfill({json:[
    {id:'bout-one',bout_order:1,red_corner_competitor_id:a,blue_corner_competitor_id:b,scheduled_rounds:3,status:finished?'finished':'scheduled',metadata:finished?{actual_end_at:new Date(Date.parse(start)+5*60_000).toISOString()}:{}},
    {id:'bout-two',bout_order:2,red_corner_competitor_id:a,blue_corner_competitor_id:b,scheduled_rounds:5,status:'scheduled',metadata:{main_event:true,card_segment:'main'}}]}))
  await page.route('**/rest/v1/rpc/fight_timing_history',r=>r.fulfill({json:[{fighter_id:a,scheduled_rounds:3,result:{duration_seconds:120},metadata:{round_seconds:300}}]}))
  await page.goto(`/events/${id}`)
  await expect(page.getByText(/Uses available recent fight durations/).first()).toBeVisible()
  await page.getByRole('button',{name:'Alert me for this fight'}).last().click()
  await expect(page.getByRole('status')).toContainText('while this event page stays open')
  await expect(page.getByRole('button',{name:'Stop fight alerts'})).toBeVisible()
  finished=true
  await page.reload()
  await expect(page.getByText('Adjusted using confirmed live bout timing.')).toBeVisible()
  await expect(page.getByRole('button',{name:'Stop fight alerts'})).toBeVisible()
})
