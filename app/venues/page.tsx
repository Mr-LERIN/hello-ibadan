import { supabase } from '@/lib/supabase'
import VenueCard, { CATEGORY_LABELS } from '@/components/VenueCard'

export const dynamic = 'force-dynamic'

export default async function VenuesPage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string }
}) {
  let query = supabase
    .from('venues')
    .select('*, reviews(rating)')
    .order('created_at', { ascending: false })

  if (searchParams.category) query = query.eq('category', searchParams.category)
  if (searchParams.q) query = query.ilike('name', `%${searchParams.q}%`)

  const { data: venues } = await query

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">
        {searchParams.category
          ? CATEGORY_LABELS[searchParams.category] ?? 'Spots'
          : 'Explore spots in Ibadan'}
      </h1>
      <p className="mt-2 text-slate-600">
        {venues?.length ?? 0} place{venues?.length === 1 ? '' : 's'} found
        {searchParams.q && (
          <>
            {' '}
            for &ldquo;<span className="font-semibold">{searchParams.q}</span>&rdquo;
          </>
        )}
      </p>

      {/* Category filter pills */}
      <div className="mt-6 flex flex-wrap gap-2">
        <FilterPill label="All" href="/venues" active={!searchParams.category} />
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <FilterPill
            key={key}
            label={label}
            href={`/venues?category=${key}`}
            active={searchParams.category === key}
          />
        ))}
      </div>

      {venues && venues.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {venues.map((v) => (
            <VenueCard key={v.id} venue={v} />
          ))}
        </div>
      ) : (
        <div className="mt-12 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-500">
          Nothing here yet — check another category, or be the first to review somewhere!
        </div>
      )}
    </main>
  )
}

function FilterPill({
  label,
  href,
  active,
}: {
  label: string
  href: string
  active: boolean
}) {
  return (
    <a
      href={href}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        active
          ? 'bg-brand text-white'
          : 'border border-slate-200 bg-white text-slate-600 hover:border-brand/40 hover:text-brand'
      }`}
    >
      {label}
    </a>
  )
}
