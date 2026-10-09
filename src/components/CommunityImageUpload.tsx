import { useState } from 'react'
import { communityImageUrl, prepareCommunityImage, type CommunityImage } from '../lib/mediaRights'

export function CommunityImageUpload({ label, image, onChange }: { label: string; image?: CommunityImage; onChange: (image?: CommunityImage) => void }) {
  const [permission, setPermission] = useState(false)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const src = communityImageUrl(image)
  return <div className="space-y-2 rounded-lg border border-primary/20 p-3">
    <p className="text-sm font-semibold">{label}</p>
    {src && <img src={src} alt={label} className="h-16 w-16 rounded-lg object-contain" />}
    <label className="flex gap-2 text-xs text-ink/70"><input type="checkbox" checked={permission} onChange={e=>setPermission(e.target.checked)} />I have permission to use and share this image.</label>
    <input aria-label={label} type="file" accept="image/png,image/jpeg,image/webp" disabled={!permission || busy} className="block w-full text-xs" onChange={async e=>{
      const file=e.target.files?.[0]; e.target.value=''; if(!file) return
      setBusy(true); setMessage('')
      try { onChange(await prepareCommunityImage(file)); setMessage('Image saved. Originals and photo metadata are not uploaded.') }
      catch(error){ setMessage(error instanceof Error ? error.message : 'Could not save image.') }
      finally{setBusy(false)}
    }} />
    {src && <button type="button" className="text-xs underline" onClick={()=>onChange(undefined)}>Remove image</button>}
    {message && <p role="status" className="text-xs text-ink/70">{message}</p>}
  </div>
}
