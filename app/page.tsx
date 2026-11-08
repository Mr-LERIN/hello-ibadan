import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import VenueCard from '@/components/VenueCard'

export const dynamic = 'force-dynamic'

const CATEGORIES = [
  { key: 'hotel', label: 'Hotels', blurb: 'Comfortable stays across the city' },
  { key: 'fine-dining', label: 'Fine Dining', blurb: 'Special-occasion restaurants' },
  { key: 'pizza', label: 'Pizza Spots', blurb: 'Slices and deliveries near you' },
  { key: 'lounge', label: 'Lounges', blurb: 'Nightlife, shisha and live DJs' },
  { key: 'bar', label: 'Bars', blurb: 'Cold drinks, good music' },
  { key: 'inn', label: 'Inns', blurb: 'Simple, budget-friendly rooms' },
  { key: 'takeout', label: 'Takeouts', blurb: 'Grab it and go' },
]

export default async function HomePage() {
  const { data: latest } = await supabase
    .from('venues')
    .select('*, reviews(rating)')
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    <main>
      {/* Hero — Turing-style: bold headline, generous whitespace, search front and center */}
      <section className="bg-gradient-to-b from-brand-soft to-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center md:py-28">
          <span className="rounded-full border border-brand/30 bg-white px-4 py-1.5 text-xs font-semibold text-brand">
            Ibadan&apos;s own discovery platform
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
            Find the best spots in{' '}
            <span className="bg-gradient-to-r from-brand to-purple-500 bg-clip-text text-transparent">
              Ibadan
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-slate-600">
            Hotels, lounges, pizza spots, fine dining and more — reviewed by real
            people, in their own words.
          </p>
          <form action="/venues" className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-full border border-slate-200 bg-white p-2 shadow-lg shadow-brand/5">
            <input
              name="q"
              placeholder="Search for a spot… e.g. Jericho Pizza"
              className="w-full bg-transparent px-4 text-sm outline-none"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              Search
            </button>
          </form>
          <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs">
            {['Bodija', 'Jericho', 'Ring Road', 'Dugbe', 'UI', 'Challenge'].map((a) => (
              <Link
                key={a}
                href={`/venues?q=${a}`}
                className="rounded-full bg-white px-3 py-1.5 font-medium text-slate-600 shadow-sm hover:text-brand"
              >
                {a}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Browse by category</h2>
        <p className="mt-2 text-slate-600">Whatever you are in the mood for tonight.</p>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.key}
              href={`/venues?category=${c.key}`}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg"
            >
              <h3 className="font-bold">{c.label}</h3>
              <p className="mt-1 text-sm text-slate-500">{c.blurb}</p>
            </Link>
          ))}
          <Link
            href="/venues"
            className="flex items-center justify-center rounded-2xl bg-ink p-5 font-bold text-white transition hover:bg-brand-dark"
          >
            See all spots →
          </Link>
        </div>
      </section>

      {/* Latest spots */}
      {latest && latest.length > 0 && (
        <section className="bg-slate-50">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">New on the platform</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {latest.map((v) => (
                <VenueCard key={v.id} venue={v} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold tracking-tight md:text-3xl">
          How HelloIbadan works
        </h2>
        <div className="mt-10 grid gap-8 text-center md:grid-cols-3">
          {[
            { t: 'Discover', d: 'Search spots by category or area — Bodija to Ring Road.' },
            { t: 'Read real words', d: 'Reviews are written experiences. No spammy photos, just honest text from visitors.' },
            { t: 'Share yours', d: 'Sign in, tell the city how it was. Venues post their own photos.' },
          ].map((s, i) => (
            <div key={s.t} className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand font-bold text-white">
                {i + 1}
              </div>
              <h3 className="mt-4 font-bold">{s.t}</h3>
              <p className="mt-2 text-sm text-slate-600">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Business CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="rounded-3xl bg-ink px-8 py-14 text-center text-white md:px-16">
          <h2 className="text-2xl font-bold md:text-4xl">Own a spot in Ibadan?</h2>
          <p className="mx-auto mt-3 max-w-lg text-slate-300">
            Claim your page, post your photos, update your details — and let the
            reviews do the talking.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-full bg-white px-8 py-3 font-semibold text-ink hover:bg-brand hover:text-white"
          >
            Join as a business
          </Link>
        </div>
      </section>
    </main>
  )
}
