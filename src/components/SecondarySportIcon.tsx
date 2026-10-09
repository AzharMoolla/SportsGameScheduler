import { useId } from 'react'
import type { ReactNode } from 'react'

// Purpose-drawn equipment silhouettes, with regular geometry for racket strings.
// The category banner remains shared; these symbols identify individual sports.
export function SecondarySportIcon({ sport, size = 40, label, className = '' }: {
  sport: string; size?: number; label?: string; className?: string
}) {
  const id = useId().replaceAll(':', '')
  const key = sport.toLowerCase().replaceAll(' ', '_')
  const paint = `url(#${id}-paint)`
  const solid = { fill: paint, stroke: 'currentColor', strokeWidth: 2.4 }
  const seam = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, opacity: .9 }
  const ball = (x: number, y: number, r: number) => <circle cx={x} cy={y} r={r} {...solid} />
  const racket = (squash = false) => <g transform="rotate(28 30 30)">
    <path d="M27 40 25 48H35L33 40" {...solid} />
    <path d="M27 47H33V59H27Z" {...solid} />
    <ellipse cx="30" cy="24" rx={squash ? 12 : 14} ry={squash ? 20 : 18} {...solid} fill="none" strokeWidth="3" />
    <g clipPath={`url(#${id}-strings)`} fill="none" stroke="currentColor" strokeWidth="1.15" opacity=".8">
      {[20, 25, 30, 35, 40].map(x => <path key={`v${x}`} d={`M${x} 3V45`} />)}
      {[9, 15, 21, 27, 33, 39].map(y => <path key={`h${y}`} d={`M14 ${y}H46`} />)}
    </g>
  </g>
  let art: ReactNode
  switch (key) {
    case 'cricket': art = <>
      <g transform="rotate(35 29 31)"><path d="M26 4H32V21H26Z" {...solid} /><path d="M23 21H35L38 55Q29 61 20 55Z" {...solid} /><path d="M26 9H32M26 13H32M26 17H32M29 26V52" {...seam} /></g>
      {ball(49, 45, 8)}<path d="M45 39Q50 45 45 51M48 38Q54 45 49 52" {...seam} />
    </>; break
    case 'rugby': art = <g transform="rotate(-30 32 32)"><ellipse cx="32" cy="32" rx="16" ry="27" {...solid} /><path d="M19 13Q32 19 45 13M19 51Q32 45 45 51M32 19V43M28 24H36M28 29H36M28 34H36M28 39H36" {...seam} /></g>; break
    case 'volleyball': art = <>{ball(32, 32, 25)}{[0,120,240].map(angle => <g key={angle} transform={`rotate(${angle} 32 32)`}><path d="M32 32Q21 19 32 7M28 27Q20 16 23 9" {...seam} /></g>)}</>; break
    case 'handball': art = <>
      {ball(28, 24, 19)}
      <path d="M28 15 37 21 34 31H22L19 21ZM28 15V5M37 21 46 18M34 31 39 40M22 31 17 40M19 21 10 18" {...seam} strokeWidth="1.8" />
      <path d="M16 58 20 48Q13 42 12 35Q12 32 15 32Q17 32 19 37L23 42Q32 46 40 38L47 28Q49 25 52 27Q54 29 52 32L44 45Q40 51 33 52L30 58Z" {...solid} />
      <path d="M23 42Q29 45 35 43M44 34 48 37M40 40 44 43" {...seam} strokeWidth="1.8" />
    </>; break
    case 'cycling': art = <>
      <circle cx="15" cy="45" r="12" {...solid} fill="none" strokeWidth="3" /><circle cx="49" cy="45" r="12" {...solid} fill="none" strokeWidth="3" />
      <path d="M15 45 25 26 36 45H15L40 26 49 45M25 26H40M25 26 22 19M17 19H28M40 26 44 16H52V21" {...solid} fill="none" strokeWidth="3" /><circle cx="36" cy="45" r="3" {...solid} />
    </>; break
    case 'snooker': art = <>
      <path d="M6 56 40 7 43 9 9 59Z" {...solid} />
      {ball(43, 30, 8)}{ball(34, 48, 8)}{ball(52, 48, 8)}
    </>; break
    case 'darts': art = <>
      <g transform="rotate(35 32 32)">
        <path d="M32 58V44" {...seam} />
        <path d="M29 27H35V44H29Z" {...solid} />
        <path d="M32 27V5L21 13V23ZM32 5 43 13V23L32 27Z" {...solid} />
        <path d="M29 32H35M29 37H35" {...seam} />
      </g>
    </>; break
    case 'esports': art = <>
      <path d="M17 17H47Q54 17 57 28L61 45Q63 56 54 55L42 44H22L10 55Q1 56 3 45L7 28Q10 17 17 17Z" {...solid} />
      <path d="M19 25V37M13 31H25" {...seam} strokeWidth="3.5" /><circle cx="45" cy="27" r="2.5" fill="currentColor" /><circle cx="51" cy="33" r="2.5" fill="currentColor" /><circle cx="27" cy="40" r="4" {...seam} /><circle cx="38" cy="40" r="4" {...seam} />
    </>; break
    case 'badminton': art = <>{racket()}<g transform="rotate(-25 50 44)"><path d="M43 33H57L53 48H47Z" {...solid} fillOpacity=".35" /><path d="M43 33 48 45M48 33 49 45M53 33 51 45M57 33 52 45M45 39H55" {...seam} stroke="currentColor" /><path d="M47 45H53V49Q50 54 47 49Z" {...solid} /></g></>; break
    case 'squash': art = <>{racket(true)}{ball(49, 49, 6)}</>; break
    case 'table_tennis': art = <g transform="rotate(30 30 30)"><path d="M26 39H34V57Q30 61 26 57Z" {...solid} /><ellipse cx="30" cy="24" rx="19" ry="21" {...solid} /><path d="M16 16Q20 8 31 8" {...seam} strokeWidth="3" /><circle cx="52" cy="36" r="7" fill="currentColor" stroke="currentColor" strokeWidth="2" /></g>; break
    case 'pickleball': art = <>
      <g transform="rotate(25 26 29)"><path d="M22 40H30V58H22Z" {...solid} /><path d="M13 5H39Q44 5 44 12V32Q44 41 35 42H17Q8 41 8 32V12Q8 5 13 5Z" {...solid} /><path d="M14 12H38M14 18H38M14 24H38M14 30H38" {...seam} opacity=".3" /></g>
      {ball(49, 45, 11)}{[[46,40],[53,42],[45,48],[51,51]].map(([x,y])=><circle key={`${x}-${y}`} cx={x} cy={y} r="2" fill="var(--mp-surface)" />)}
    </>; break
    case 'lacrosse': art = <>
      <g transform="rotate(24 28 31)"><path d="M25 33H31V60H25Z" {...solid} /><path d="M10 5Q28 0 46 5L39 22Q35 32 28 35Q21 32 17 22Z" {...solid} fillOpacity=".18" /><path d="M16 7 23 26 28 30 33 26 40 7M22 5 26 24M34 5 30 24M15 12H41M18 19H38M23 26H33" {...seam} stroke="currentColor" /></g>{ball(50, 47, 7)}
    </>; break
    case 'netball': art = <>
      <path d="M30 25V59M19 59H41" {...solid} fill="none" strokeWidth="4" /><ellipse cx="30" cy="23" rx="20" ry="5" {...solid} fill="none" strokeWidth="3" /><path d="M12 25 18 42H42L48 25M20 27 24 42M30 28V42M40 27 36 42M16 33H44M18 39H42" {...seam} stroke="currentColor" />{ball(44, 9, 7)}
    </>; break
    case 'field_hockey': art = <>
      <g transform="rotate(-18 26 32)"><path d="M21 5H27V43Q27 50 34 50H38V47H44V51Q44 57 34 57Q21 57 21 43Z" {...solid} /><path d="M21 11H27M21 17H27M21 23H27" {...seam} /></g>{ball(52, 32, 6)}
    </>; break
    case 'water_polo': art = <>
      {ball(32, 24, 18)}<path d="M14 24H50M32 6Q19 24 32 42M32 6Q45 24 32 42" {...seam} /><path d="M7 48Q14 41 22 48T38 48T55 48M7 57Q14 50 22 57T38 57T55 57" {...seam} strokeWidth="3" />
    </>; break
    case 'softball': art = <>
      {ball(32,32,25)}<path d="M17 11Q34 32 17 53M47 11Q30 32 47 53" {...seam} />
      {[16,23,30,37,44].map(y => <path key={y} d={`M${y<25||y>40?18:22} ${y}l5 -2M${y<25||y>40?46:42} ${y}l-5 -2`} stroke="currentColor" strokeWidth="1.6" />)}
    </>; break
    default: art = <>{ball(32,32,22)}<path d="M16 32H48M32 16V48" {...seam} /></>
  }
  return <svg width={size} height={size} viewBox="0 0 64 64" className={`secondary-sport-icon ${className}`}
    role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} data-sport-icon={key}>
    <defs>
      <linearGradient id={`${id}-paint`} x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="currentColor" stopOpacity=".12" /><stop offset="1" stopColor="currentColor" stopOpacity=".12" />
      </linearGradient>
      <clipPath id={`${id}-strings`}><ellipse cx="30" cy="24" rx={key==='squash'?10:12} ry={key==='squash'?18:16} /></clipPath>
    </defs>
    <g strokeLinecap="round" strokeLinejoin="round">{art}</g>
  </svg>
}

