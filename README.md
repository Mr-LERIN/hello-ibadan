# HelloIbadan — Starter Codebase

A web app for discovering and reviewing spots in Ibadan: inns, pizza spots, fine dining, hotels, lounges, bars and takeouts.

## Rules baked in

- Regular users can only post **text reviews** — there is no image column on reviews at all, so it's enforced in the database, not just the UI.
- Only **business accounts** (venue owners) can upload images and edit their venue.

## Stack

Next.js 14 (App Router) + Tailwind CSS + Supabase (database, auth, image storage) + Vercel hosting.

## Setup (15 minutes)

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create a Supabase project** at https://supabase.com (free tier is fine).

3. **Run the database schema**
   - In Supabase, open **SQL Editor → New query**
   - Paste the entire contents of `supabase/schema.sql` and click **Run**
   - This creates the tables, security policies, the signup trigger, a public `venue-images` storage bucket, and 3 sample venues.

4. **Get your API keys**
   - Supabase → **Project Settings → API**
   - Copy the **Project URL** and the **anon public** key

5. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in the two values in `.env.local`.

6. **Run it**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

## How the roles work

- **Sign up normally** → you can browse and post text reviews on any venue page.
- **Sign up with "I'm a business owner" checked** → your account gets the `is_business` flag, which lets you create a venue on `/dashboard`, edit it, and upload photos to it.

## Pages

| Route | What it does |
|---|---|
| `/` | Landing page (hero search, categories, how it works) |
| `/venues` | Browse + filter all spots by category and search |
| `/venues/[id]` | Venue detail: photos, info, text reviews |
| `/login` | Sign in / sign up (with business toggle) |
| `/dashboard` | Business owners: create/edit venue, upload images |

## Deploying to Vercel

Push this folder to GitHub, then import it at https://vercel.com/new and add the same two environment variables. Done.
