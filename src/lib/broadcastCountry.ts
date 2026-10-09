const names = new Intl.DisplayNames(['en'], { type: 'region' })
const normalize = (value: string) => value.trim().toLowerCase().replace(/[^a-z]/g, '')
const countries = new Map<string, string>()
// CLDR recognises retired territories too. Their display names can overwrite a
// modern country's entry (FX -> France, YU -> Serbia) during the A-Z scan.
const retired = new Set(['AN','BU','CS','DD','FX','NT','SU','TP','YD','YU','ZR'])
const unambiguousAliases:Record<string,string>={UK:'GB',FX:'FR',BU:'MM',DD:'DE',TP:'TL',YD:'YE',ZR:'CD'}
for (let a = 65; a <= 90; a++) {
  for (let b = 65; b <= 90; b++) {
    const code = String.fromCharCode(a, b)
    if(retired.has(code)) continue
    const name = names.of(code)
    if (name && name !== code) countries.set(normalize(name), code === 'UK' ? 'GB' : code)
  }
}
for (const [name, code] of Object.entries({ uk: 'GB', usa: 'US', us: 'US', england: 'GB', scotland: 'GB', wales: 'GB', southkorea: 'KR', czechrepublic: 'CZ', russia: 'RU', turkey: 'TR' })) countries.set(name, code)

export function broadcastCountryCode(value: string | null | undefined): string | null {
  if (!value) return null
  const code = value.trim().toUpperCase()
  if(unambiguousAliases[code]) return unambiguousAliases[code]
  if(retired.has(code)) return null // Split states cannot be assigned a successor by guessing.
  if (/^[A-Z]{2}$/.test(code) && names.of(code) !== code) return code
  return countries.get(normalize(value)) ?? null
}
