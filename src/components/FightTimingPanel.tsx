import { useEffect, useMemo, useRef, useState } from 'react'
import type { EventDetail } from '../data/liveSport'
import { estimateFightCard, fightDiscipline } from '../lib/fightTiming'
import { formatTime } from '../lib/time'
import { Panel, PanelHeading } from './ui'

export function FightTimingPanel({ event, timezone, locale, hour12 }: { event: EventDetail; timezone: string; locale?: string; hour12?: boolean | null }) {
  const [watched, setWatched] = useState<string[]>(() => { try { const value: unknown = JSON.parse(localStorage.getItem('mp.fight-alerts') ?? '[]'); return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string').slice(-200) : [] } catch { return [] } })
  const [message, setMessage] = useState('')
  const delivered = useRef(new Set<string>())
  const previous = useRef(new Map<string,number>())
  const options={locale,hour12:hour12 ?? undefined}
  const discipline=fightDiscipline(event.leagueName,event.metadata)
  const windows=useMemo(()=>estimateFightCard(event.startsAt,event.bouts,discipline,event.fighterHistory),[event,discipline])
  const mainCard=event.bouts.find(b=>b.metadata.card_segment==='main' || b.metadata.is_main_card===true)
  const mainCardWindow=windows.find(w=>w.id===mainCard?.id)
  useEffect(()=>{
    for(const window of windows){
      if(!watched.includes(window.id)) continue
      const bout=event.bouts.find(b=>b.id===window.id)!
      const title=bout.redCorner && bout.blueCorner ? `${bout.redCorner.name} vs ${bout.blueCorner.name}` : 'Your selected fight'
      const expected=window.expected?.getTime()
      const before=previous.current.get(window.id)
      let key=''; let text=''
      if(bout.status==='live'){key=`${window.id}:live`;text=`${title} is reported underway.`}
      else if(bout.status==='cancelled'){key=`${window.id}:cancelled`;text=`${title} is reported cancelled.`}
      else if(bout.status==='scheduled' && expected != null){
        if(before != null && Math.abs(expected-before)>=15*60_000){key=`${window.id}:shift:${Math.floor(expected/900000)}`;text=`${title} timing shifted. Check the updated estimate.`}
        else if(expected>Date.now() && expected-Date.now()<=10*60_000){key=`${window.id}:soon`;text=`${title} is estimated within ten minutes. Timing can change.`}
        previous.current.set(window.id,expected)
      }
      if(!key || delivered.current.has(key)) continue
      delivered.current.add(key)
      setMessage(text)
      if('Notification' in globalThis && Notification.permission==='granted'){
        try { new Notification('Silbo fight alert',{body:text,tag:key}) } catch { /* The in-page alert remains available. */ }
      }
    }
  },[windows,watched,event.bouts])
  async function toggle(id:string){
    const next=watched.includes(id) ? watched.filter(value=>value!==id) : [...watched,id]
    setWatched(next)
    try{localStorage.setItem('mp.fight-alerts',JSON.stringify(next.slice(-200)))}catch{ /* Session selection still works. */ }
    if(next.includes(id) && 'Notification' in globalThis && Notification.permission==='default') await Notification.requestPermission().catch(()=>null)
    setMessage(next.includes(id) ? 'Fight alerts enabled while this event page stays open.' : 'Fight alert removed.')
  }
  return <Panel className="space-y-3">
    <PanelHeading title="Fight timing" subtitle="Predicted ring-walk windows in your timezone" />
    <p className="text-xs text-ink/60">Card start and headliner start are different. Estimates use known bout order, rounds, available recent results and confirmed live timing. Walkouts, decisions and broadcast pauses can change these windows.</p>
    <p className="text-sm font-semibold">Main card: {mainCardWindow?.expected ? `${formatTime(mainCardWindow.earliest!,timezone,options)}–${formatTime(mainCardWindow.latest!,timezone,options)} estimated` : 'segment timing not available yet'}</p>
    <div className="space-y-2">{windows.map(window=>{
      const bout=event.bouts.find(b=>b.id===window.id)!
      const name=bout.redCorner && bout.blueCorner ? `${bout.redCorner.name} vs ${bout.blueCorner.name}` : bout.redCorner?.name ?? 'Fight'
      const main=bout.metadata.main_event===true || bout.metadata.is_main_event===true || bout.metadata.completeness==='main_event_only'
      return <article key={bout.id} className="rounded-lg border border-primary/20 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">{name}{main ? ' · Main event' : ''}</h3><span className="font-mono text-xs">{bout.status}</span></div>
        <p className="mt-1 font-semibold">{window.expected ? window.basis==='provider' || (window.basis==='live' && bout.status==='live') ?
          formatTime(window.expected,timezone,options) : `${formatTime(window.earliest!,timezone,options)}–${formatTime(window.latest!,timezone,options)} estimated` : 'Timing unavailable'}</p>
        <p className="mt-1 text-xs text-ink/60">{window.note}</p>
        {bout.status!=='finished' && bout.status!=='cancelled' && <button type="button" aria-pressed={watched.includes(bout.id)} onClick={()=>void toggle(bout.id)} className="mt-2 rounded border border-primary/30 px-3 py-1.5 text-xs font-bold">{watched.includes(bout.id) ? 'Stop fight alerts' : 'Alert me for this fight'}</button>}
      </article>
    })}</div>
    <p role="status" aria-live="polite" className="text-sm text-primary">{message}</p>
    <p className="text-[11px] text-ink/55">Alerts work while this page is open. Estimates refresh from available data every 30 seconds; this does not guarantee a live provider update. Background email/push alerts are not enabled.</p>
  </Panel>
}
