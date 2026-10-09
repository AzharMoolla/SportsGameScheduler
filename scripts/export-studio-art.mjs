import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'

const output = 'public/assets/sport-banners/studio'
await mkdir(output, { recursive: true })
for (const mode of ['broadcast', 'program']) {
  await sharp(`docs/design-review/blender/basketball-${mode}-banner.png`)
    .webp({ quality: 88 })
    .toFile(`${output}/basketball-${mode}-banner.webp`)
}
