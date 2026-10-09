// Importing an image URL does not authorize its reuse. Approve each asset only after
// verifying its license, creator, attribution and any additional commercial restrictions.
export type ClearedImage = { name: string; url: string; source: string; creator: string; license: string; licenseUrl: string; changes: string; reviewedAt: string }
export const clearedSportsImages: ClearedImage[] = [
  { name: 'Novak Djokovic', url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5f/Novak_Djokovic_%2816650975118%29_%28cropped%29.jpg/250px-Novak_Djokovic_%2816650975118%29_%28cropped%29.jpg', source: 'https://commons.wikimedia.org/wiki/File:Novak_Djokovic_(16650975118)_(cropped).jpg', creator: 'Christian Mesiano; crop by Joalbertine', license: 'CC BY-SA 2.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0/', changes: 'Existing Commons crop; displayed in a thumbnail frame.', reviewedAt: '2026-10-07' },
  { name: 'Oleksandr Usyk', url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1b/Oleksandr_Usyk.jpg/250px-Oleksandr_Usyk.jpg', source: 'https://commons.wikimedia.org/wiki/File:Oleksandr_Usyk.jpg', creator: 'KuRaG; crop by Ahonc', license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/', changes: 'Existing Commons crop; displayed in a thumbnail frame.', reviewedAt: '2026-10-07' },
]
export function approvedSportsImage(url: string | null | undefined, name?: string): string | null {
  const portrait = name ? clearedSportsImages.find(image => image.name === name) : undefined
  if (portrait) return portrait.url
  if (!url) return null
  if (url.startsWith('/assets/')) return url
  return clearedSportsImages.some(image => image.url === url) ? url : null
}

export type CommunityImage = { dataUrl: string; permissionConfirmed: true }
export function communityImageUrl(image: CommunityImage | undefined): string | undefined {
  return image?.permissionConfirmed && image.dataUrl.length <= 100000 && /^data:image\/(webp|png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(image.dataUrl) ? image.dataUrl : undefined
}

export async function prepareCommunityImage(file: File): Promise<CommunityImage> {
  if (!['image/png','image/jpeg','image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error('Choose a PNG, JPEG or WebP image under 5 MB.')
  const bitmap = await createImageBitmap(file)
  try {
    if (bitmap.width * bitmap.height > 16000000) throw new Error('Choose an image under 16 megapixels.')
    const canvas = document.createElement('canvas')
    const scale = Math.min(1,256 / Math.max(bitmap.width,bitmap.height))
    canvas.width = Math.max(1,Math.round(bitmap.width*scale)); canvas.height = Math.max(1,Math.round(bitmap.height*scale))
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('This browser cannot process images.')
    ctx.drawImage(bitmap,0,0,canvas.width,canvas.height)
    const dataUrl = canvas.toDataURL('image/webp',0.8)
    if (dataUrl.length > 100000) throw new Error('This image is too detailed. Choose a smaller image.')
    return { dataUrl, permissionConfirmed: true }
  } finally { bitmap.close() }
}
