'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type ImageRow = { id: string; image_url: string }

// Renders the venue's photo gallery. Only shows the upload/delete controls
// when the signed-in user is a business account that owns this venue.
// (Supabase RLS blocks anyone else anyway — this just hides the buttons.)
export default function ImageManager({
  venueId,
  ownerId,
  initialImages,
}: {
  venueId: string
  ownerId: string | null
  initialImages: ImageRow[]
}) {
  const router = useRouter()
  const [images, setImages] = useState(initialImages)
  const [canManage, setCanManage] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function check() {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) return
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_business')
        .eq('id', auth.user.id)
        .single()
      setCanManage(Boolean(profile?.is_business && ownerId === auth.user.id))
    }
    check()
  }, [ownerId])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    const path = `${venueId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const { error: upErr } = await supabase.storage
      .from('venue-images')
      .upload(path, file)
    if (upErr) {
      setUploading(false)
      return setError(upErr.message)
    }
    const { data: pub } = supabase.storage.from('venue-images').getPublicUrl(path)
    const { error: dbErr } = await supabase.from('venue_images').insert({
      venue_id: venueId,
      image_url: pub.publicUrl,
      uploaded_by: (await supabase.auth.getUser()).data.user?.id,
    })
    setUploading(false)
    if (dbErr) return setError(dbErr.message)
    router.refresh()
  }

  async function handleDelete(image: ImageRow) {
    await supabase.from('venue_images').delete().eq('id', image.id)
    setImages((prev) => prev.filter((i) => i.id !== image.id))
    router.refresh()
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {images.map((img) => (
          <div key={img.id} className="group relative overflow-hidden rounded-2xl bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.image_url} alt="Venue" className="h-44 w-full object-cover" />
            {canManage && (
              <button
                onClick={() => handleDelete(img)}
                className="absolute right-2 top-2 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        {images.length === 0 && (
          <div className="col-span-full flex h-44 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400">
            {canManage
              ? 'No photos yet — add your first one below.'
              : 'Photos coming soon — they are added by the venue itself.'}
          </div>
        )}
      </div>

      {canManage && (
        <div className="mt-4">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-brand px-5 py-2.5 text-sm font-semibold text-brand hover:bg-brand-soft">
            {uploading ? 'Uploading…' : '+ Upload a photo'}
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
          <p className="mt-2 text-xs text-slate-500">
            Business accounts only. Users can only leave written reviews.
          </p>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      )}
    </div>
  )
}
