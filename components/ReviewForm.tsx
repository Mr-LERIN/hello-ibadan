'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ReviewForm({ venueId }: { venueId: string }) {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null | undefined>(undefined)
  const [rating, setRating] = useState(0)
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Check login state once, client-side.
  if (userId === undefined) {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
  }

  if (userId === null) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">
        <Link href="/login" className="font-semibold text-brand hover:underline">
          Sign in
        </Link>{' '}
        to share your experience at this spot. Reviews are text-only — no pictures needed.
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) return setError('Please pick a star rating first.')
    setLoading(true)
    setError('')
    const { error: err } = await supabase.from('reviews').insert({
      venue_id: venueId,
      user_id: userId,
      rating,
      body,
    })
    setLoading(false)
    if (err) return setError(err.message)
    setRating(0)
    setBody('')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-100 p-6 shadow-sm">
      <h3 className="mb-3 font-bold">Share your experience</h3>
      <div className="mb-3 flex gap-1 text-2xl">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            aria-label={`${n} stars`}
            className={n <= rating ? 'text-amber-400' : 'text-slate-300 hover:text-amber-200'}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        required
        minLength={10}
        maxLength={2000}
        rows={4}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="How was the food, the service, the vibe? (words only — photos are posted by the venue itself)"
        className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-3 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
      >
        {loading ? 'Posting…' : 'Post review'}
      </button>
    </form>
  )
}
