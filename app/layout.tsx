import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'HelloIbadan — Discover the best spots in Ibadan',
  description:
    'Find and review the best inns, pizza spots, fine dining, hotels, lounges, bars and takeouts in Ibadan.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} bg-white font-sans text-ink antialiased`}>
        <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
          <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
            <Link href="/" className="text-xl font-extrabold tracking-tight">
              Hello<span className="text-brand">Ibadan</span>
            </Link>
            <div className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
              <Link href="/venues" className="hover:text-ink">Explore</Link>
              <Link href="/venues?category=hotel" className="hover:text-ink">Hotels</Link>
              <Link href="/venues?category=fine-dining" className="hover:text-ink">Fine Dining</Link>
              <Link href="/venues?category=pizza" className="hover:text-ink">Pizza</Link>
              <Link href="/venues?category=lounge" className="hover:text-ink">Lounges</Link>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Sign in
              </Link>
              <Link
                href="/dashboard"
                className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                For Businesses
              </Link>
            </div>
          </nav>
        </header>
        {children}
        <footer className="border-t border-slate-100 bg-slate-50">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-slate-500 md:flex-row">
            <p className="font-semibold text-ink">
              Hello<span className="text-brand">Ibadan</span>
            </p>
            <p>Built for Ibadan. Reviews are words-only — photos come from the venues themselves.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
