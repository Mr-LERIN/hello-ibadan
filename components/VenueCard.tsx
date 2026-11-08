import Link from 'next/link'

export type VenueWithReviews = {
  id: string
  name: string
  category: string
  area: string | null
  description: string | null
  reviews?: { rating: number }[] | null
}

export const CATEGORY_LABELS: Record<string, string> = {
  inn: 'Inn',
  pizza: 'Pizza Spot',
  'fine-dining': 'Fine Dining',
  hotel: 'Hotel',
  lounge: 'Lounge',
  bar: 'Bar',
  takeout: 'Takeout',
}

export function averageRating(reviews?: { rating: number }[] | null) {
  if (!reviews || reviews.length === 0) return null
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
}

export function RatingStars({ rating }: { rating: number | null }) {
  if (rating === null) return <span className="text-sm text-slate-400">No reviews yet</span>
  return (
    <span className="text-sm font-semibold text-amber-500">
      {'★'.repeat(Math.round(rating))}
      <span className="ml-1 font-medium text-slate-500">{rating.toFixed(1)}</span>
    </span>
  )
}

export default function VenueCard({ venue }: { venue: VenueWithReviews }) {
  const rating = averageRating(venue.reviews)
  return (
    <Link
      href={`/venues/${venue.id}`}
      className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">
          {CATEGORY_LABELS[venue.category] ?? venue.category}
        </span>
        <RatingStars rating={rating} />
      </div>
      <h3 className="text-lg font-bold group-hover:text-brand">{venue.name}</h3>
      {venue.area && <p className="mt-0.5 text-sm text-slate-500">{venue.area}, Ibadan</p>}
      {venue.description && (
        <p className="mt-2 line-clamp-2 text-sm text-slate-600">{venue.description}</p>
      )}
      <p className="mt-4 text-sm font-semibold text-brand">
        See reviews <span aria-hidden>→</span>
      </p>
    </Link>
  )
}
