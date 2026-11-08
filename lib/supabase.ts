import { createClient } from '@supabase/supabase-js'

// Anon key is safe to expose: Row Level Security in supabase/schema.sql
// enforces who can read/write what (e.g. only business accounts can upload images).
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
