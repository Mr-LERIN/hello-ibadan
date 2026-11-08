'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ImageManager from '@/components/ImageManager'

type Venue = {
  id: string
  name: string
  category: string
  area: string | null
  address: string | null
  description: string | null
  phone: string | null
  owner_id: string | null
}

const EMPTY: Omit<Venue, 'id' | 'owner_id'> = {
  name: '',
  category: 'restaurant' as string,
  area: '',
  address: '',
  description: '',
  phone: '',
}

const CATEGORIES = ['inn', 'pizza', 'fine-dining', 'hotel', 'lounge', 'bar', 'takeout']

export default function DashboardPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [profile, setProfile] = useState<{ id: string; is_business: boolean } | null>(null)
  const [venues, setVenues] = useState<Venue[]>([])
  const [editing, setEditing] = useState<(Omit<Venue, 'id' | 'owner_id'> & { id?: string }) | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) {
        router.push('/login')
        return
      }
      const { data: prof } = await supabase
        .from('profiles')
        .select('id, is_business')
        .eq('id', auth.user.id)
        .single()
      setProfile(prof)
      if (prof?.is_business) {
        const { data } = await supabase
          .from('venues')
          .select('*')
          .eq('owner_id', prof.id)
          .order('created_at', { ascending: false })
        setVenues(data ?? [])
      }
      setReady(true)
    }
    load()
  }, [router])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!editing || !profile) return
    setSaving(true)
    setError('')
    const payload = {
      name: editing.name,
      category: editing.category,
      area: editing.area || null,
      address: editing.address || null,
      description: editing.description || null,
      phone: editing.phone || null,
    }
    const { error: err } = editing.id
      ? await supabase.from('venues').update(payload).eq('id', editing.id)
      : await supabase
          .from('venues')
          .insert({ ...payload, owner_id: profile.id })
    setSaving(false)
    if (err) return setError(err.message)
    router.refresh()
    window.location.reload()
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (!ready) {
    return <main className="mx-auto max-w-6xl px-4 py-20 text-center text-slate-500">Loading…</main>
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">Your dashboard</h1>
        <button
          onClick={handleSignOut}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-brand"
        >
          Sign out
        </button>
      </div>

      {!profile?.is_business ? (
        <div className="mt-10 rounded-3xl border border-slate-100 bg-slate-50 p-10 text-center">
          <h2 className="text-xl font-bold">You&apos;re signed in as an explorer 🎉</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
            You can browse spots and post text reviews. If you own a venue and want to
            post photos and manage a listing, you need a business account.
          </p>
          <p className="mt-4">
            <Link href="/venues" className="font-semibold text-brand hover:underline">
              Start exploring →
            </Link>
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* Venue list */}
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Your venues</h2>
              <button
                onClick={() => setEditing({ ...EMPTY, category: 'pizza' })}
                className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                + Add venue
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {venues.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setEditing(v)}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm hover:border-brand/40"
                >
                  <span>
                    <span className="block font-bold">{v.name}</span>
                    <span className="text-sm capitalize text-slate-500">
                      {v.category} · {v.area ?? 'Ibadan'}
                    </span>
                  </span>
                  <span className="text-sm font-semibold text-brand">Edit →</span>
                </button>
              ))}
              {venues.length === 0 && (
                <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  No venues yet. Click &ldquo;Add venue&rdquo; to list your spot.
                </p>
              )}
            </div>

            {editing?.id && (
              <div className="mt-8">
                <h2 className="mb-3 text-xl font-bold">Photos — {editing.name}</h2>
                <ImageManager
                  venueId={editing.id}
                  ownerId={profile.id}
                  initialImages={[]}
                />
                <p className="mt-2 text-xs text-slate-400">
                  Note: photos reload after save. Open the venue page to manage them.
                </p>
              </div>
            )}
          </div>

          {/* Edit form */}
          <div>
            {editing ? (
              <form
                onSubmit={handleSave}
                className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"
              >
                <h2 className="text-xl font-bold">
                  {editing.id ? 'Edit venue' : 'Add a new venue'}
                </h2>
                <div className="mt-4 space-y-3">
                  <input
                    required
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    placeholder="Venue name"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                  <select
                    value={editing.category}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c.replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                  <input
                    value={editing.area ?? ''}
                    onChange={(e) => setEditing({ ...editing, area: e.target.value })}
                    placeholder="Area / neighbourhood (e.g. Bodija)"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                  <input
                    value={editing.address ?? ''}
                    onChange={(e) => setEditing({ ...editing, address: e.target.value })}
                    placeholder="Street address"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                  <input
                    value={editing.phone ?? ''}
                    onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
                    placeholder="Phone number"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                  <textarea
                    rows={4}
                    value={editing.description ?? ''}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                    placeholder="Short description — what makes your spot special?"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                </div>
                {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
                <div className="mt-4 flex gap-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
                  >
                    {saving ? 'Saving…' : 'Save venue'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="rounded-full border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
                Select a venue to edit, or add a new one.
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
