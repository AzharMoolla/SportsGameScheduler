import sharp from 'sharp'
import { mkdir, readdir } from 'node:fs/promises'

const remainingSports = ['football', 'hockey', 'motorsport', 'combat', 'track', 'olympic', 'custom']
const sports = ['baseball', 'soccer', 'golf', 'tennis', ...remainingSports]
await Promise.all([
  mkdir('public/assets/sport-banners/studio', { recursive: true }),
  mkdir('public/assets/sport-icons/studio', { recursive: true }),
])
for (const sport of sports) {
  for (const mode of ['broadcast', 'program']) {
    const iconRevision = sport === 'football' ? (mode === 'program' ? 'v14' : 'v15') : mode === 'program' && sport === 'combat' ? 'v8' : sport === 'hockey' ? 'v7' : remainingSports.includes(sport) ? 'v6' : sport === 'soccer' ? 'v1' : 'v2'
    const bannerRevision = sport === 'football' ? (mode === 'program' ? 'v14' : 'v15') : mode === 'broadcast' && sport === 'combat' ? 'v12' : mode === 'program' && ['combat', 'olympic', 'custom'].includes(sport) ? 'v8' : sport === 'hockey' ? 'v7' : remainingSports.includes(sport) ? 'v6' : sport === 'tennis' ? (mode === 'program' ? 'v5' : 'v4') : sport === 'golf' ? 'v3' : sport === 'soccer' && mode === 'program' ? 'v1' : 'v2'
    await sharp(`docs/design-review/sport-art-${bannerRevision}/${sport}-${mode}-banner.png`)
      .webp({ quality: 88 })
      .toFile(`public/assets/sport-banners/studio/${sport}-${mode}-${bannerRevision}.webp`)
    await sharp(`docs/design-review/sport-art-${iconRevision}/${sport}-${mode}-icon.png`)
      .resize(320, 320, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 88 })
      .toFile(`public/assets/sport-icons/studio/${sport}-${mode}-${iconRevision}.webp`)
  }
}
await sharp('docs/design-review/sport-art-v1/basketball-program-icon.png')
  .resize(320, 320, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .webp({ quality: 88 })
  .toFile('public/assets/sport-icons/studio/basketball-program-v1.webp')

// Small navigation images and larger card images share the same transparent source.
for (const file of await readdir('public/assets/sport-icons/studio')) {
  if (!file.endsWith('.webp') || file.endsWith('-160.webp')) continue
  await sharp(`public/assets/sport-icons/studio/${file}`)
    .resize(160, 160)
    .webp({ quality: 86 })
    .toFile(`public/assets/sport-icons/studio/${file.replace('.webp', '-160.webp')}`)
}







