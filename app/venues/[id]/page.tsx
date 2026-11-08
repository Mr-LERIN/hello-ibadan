import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ReviewForm from '@/components/ReviewForm'
import ImageManager from '@/components/ImageManager'
import { CATEGORY_LABELS, RatingStars, averageRating } from '@/components/VenueCard'

export const dynamic = 'force-dynamic'

export default async function VenueDetailPage({ params }: { params: { id: string } }) {
  const { data: venue } = await supabase
    .from('venues')
    .select('*, reviews(rating)')
    .eq('id', params.id)
    .single()

  if (!venue) notFound()

  const [{ data: images }, { data: reviews }] = await Promise.all([
    supabase
      .from('venue_images')
      .select('id, image_url')
      .eq('venue_id', venue.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('reviews')
      .select('id, rating, body, created_at, profiles(display_name)')
      .eq('venue_id', venue.id)
      .order('created_at', { ascending: false }),
  ])

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-10 md:grid-cols-5">
        {/* Left: info + reviews */}
        <div className="md:col-span-3">
          <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">
            {CATEGORY_LABELS[venue.category] ?? venue.category}
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
            {venue.name}
          </h1>
          <div className="mt-2">
            <RatingStars rating={averageRating(venue.reviews)} />
          </div>
          {venue.area && <p className="mt-2 text-slate-600">{venue.area}, Ibadan</p>}
          {venue.address && <p className="text-sm text-slate-500">{venue.address}</p>}
          {venue.phone && (
            <p className="mt-1 text-sm font-semibold text-brand">{venue.phone}</p>
          )}
          {venue.description && (
            <p className="mt-4 leading-relaxed text-slate-700">{venue.description}</p>
          )}

          <h2 className="mb-4 mt-10 text-xl font-bold">
            Reviews ({reviews?.length ?? 0})
          </h2>
          <div className="space-y-4">
            {reviews?.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold">
                    {(r.profiles as { display_name: string | null } | null)?.display_name ??
                      'Anonymous'}
                  </p>
                  <span className="text-sm font-semibold text-amber-500">
                    {'★'.repeat(r.rating)}
                    <span className="ml-1 text-slate-400">{'★'.repeat(5 - r.rating)}</span>
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{r.body}</p>
                <p className="mt-2 text-xs text-slate-400">
                  {new Date(r.created_at).toLocaleDateString('en-NG', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            ))}
            {(!reviews || reviews.length === 0) && (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                No reviews yet — be the first to share your experience.
              </p>
            )}
          </div>
        </div>

        {/* Right: photos + review form */}
        <div className="space-y-6 md:col-span-2">
          <ImageManager
            venueId={venue.id}
            ownerId={venue.owner_id}
            initialImages={images ?? []}
          />
          <ReviewForm venueId={venue.id} />
        </div>
      </div>
    </main>
  )
}
