import { useSportActivity,eventHeat,isMlbPostseason,type ActivityEvent } from './sportActivity'
export type TickerEvent={id:string;title:string;startsAt:Date;sportKey:string|null;leagueName:string;featureLabel?:string}
export function rankTickerEvents(events:ActivityEvent[],now:number,max=30):TickerEvent[]{
 const eligible=events.filter(event=>event.startsAt.getTime()>=now && event.startsAt.getTime()<=now+7*86400000 && eventHeat(event,now)>=0).sort((a,b)=>eventHeat(b,now)-eventHeat(a,now)||a.startsAt.getTime()-b.startsAt.getTime())
 const leaders=eligible.filter(event=>eventHeat(event,now)>=75).slice(0,4)
 const selected=new Set(leaders.map(event=>event.id));const seenSports=new Set(leaders.map(event=>event.sportKey))
 const firstLap=eligible.filter(event=>{if(selected.has(event.id)||seenSports.has(event.sportKey))return false;seenSports.add(event.sportKey);return true})
 const ordered=[...leaders,...firstLap,...eligible.filter(event=>!selected.has(event.id)&&!firstLap.some(item=>item.id===event.id))].slice(0,max)
 return ordered.map(event=>({...event,featureLabel:isMlbPostseason(event,now)?'MLB Playoffs':undefined}))
}
export function useTickerEvents(){const activity=useSportActivity();return {events:rankTickerEvents(activity.events,activity.now),loading:activity.loading}}
