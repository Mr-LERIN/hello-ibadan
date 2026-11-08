'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isBusiness, setIsBusiness] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (mode === 'signup') {
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            is_business: isBusiness,
          },
        },
      })
      setLoading(false)
      if (err) return setError(err.message)
      setMessage('Account created! Check your email to confirm, then sign in.')
      setMode('signin')
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      setLoading(false)
      if (err) return setError(err.message)
      router.push('/venues')
      router.refresh()
    }
  }

  return (
    <main className="mx-auto flex max-w-6xl items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-brand/5">
        <h1 className="text-2xl font-extrabold tracking-tight">
          {mode === 'signin' ? 'Welcome back' : 'Join HelloIbadan'}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {mode === 'signin'
            ? 'Sign in to review spots and share experiences.'
            : 'Create a profile to review spots. Businesses can also claim their page.'}
        </p>

        <div className="mt-6 grid grid-cols-2 rounded-full bg-slate-100 p-1 text-sm font-semibold">
          {(['signin', 'signup'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-full py-2 transition ${
                mode === m ? 'bg-white text-ink shadow-sm' : 'text-slate-500'
              }`}
            >
              {m === 'signin' ? 'Sign in' : 'Sign up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === 'signup' && (
            <>
              <input
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Display name (shown on your reviews)"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4">
                <input
                  type="checkbox"
                  checked={isBusiness}
                  onChange={(e) => setIsBusiness(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-brand"
                />
                <span>
                  <span className="block text-sm font-semibold">
                    I&apos;m a business owner
                  </span>
                  <span className="block text-xs text-slate-500">
                    Lets you create a venue page, post photos and edit your listing.
                  </span>
                </span>
              </label>
            </>
          )}
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
          <input
            required
            minLength={6}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 6 characters)"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-green-600">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-brand py-3 font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
          >
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </div>
    </main>
  )
}
