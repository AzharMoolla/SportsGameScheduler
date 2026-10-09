import { useEffect } from 'react'

// Screen-space artwork: content travels over it. Small, staggered sweeps continue
// at rest; no animation loop or layout reads are needed to light the scene.
export function AmbientBroadcastArt() {
  useEffect(() => {
    const root=document.documentElement
    const sync=()=>{root.dataset.ambientPaused=String(document.hidden)}
    sync()
    document.addEventListener('visibilitychange',sync)
    return ()=>{document.removeEventListener('visibilitychange',sync);delete root.dataset.ambientPaused}
  },[])
  return <div className="ambient-broadcast-art" aria-hidden="true">
    {(['left','right'] as const).map(side=><div key={side} className={`ambient-edge ambient-edge-${side}`}>
      <svg viewBox="0 0 180 780" preserveAspectRatio="xMinYMid meet" fill="none" focusable="false">
        <g className="ambient-registration">
          <path d="M8 65v-18h18M8 310v18h18M8 455v-18h18M8 710v18h18" />
          <path d="M12 365h24m-12-12v24M12 754h24m-12-12v24" />
        </g>
        <g className="ambient-sport ambient-sport-court">
          <path d="M34 102h98v166H34zM34 185h98M60 102v32h46v-32M60 268v-32h46v32" />
          <circle cx="83" cy="185" r="22" />
          <path className="ambient-travel" pathLength="100" d="M34 102h98v166H34z" />
        </g>
        <g className="ambient-sport ambient-sport-track">
          <rect x="32" y="490" width="108" height="182" rx="54" />
          <rect x="44" y="502" width="84" height="158" rx="42" />
          <path d="M32 582h108M44 590h84M56 598h60" />
          <rect className="ambient-travel" pathLength="100" x="32" y="490" width="108" height="182" rx="54" />
        </g>
        <g className="ambient-signal">
          <path d="M8 405h30v-14h24v28h24v-14h52" />
          <path className="ambient-travel" pathLength="100" d="M8 405h30v-14h24v28h24v-14h52" />
        </g>
      </svg>
      <span className="ambient-decal ambient-decal-a"><i /><i /><i /><i /></span>
      <span className="ambient-decal ambient-decal-b"><i /><i /><i /></span>
      <span className="ambient-edge-light" />
    </div>)}
  </div>
}
