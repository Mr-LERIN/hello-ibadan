-- ============================================================
-- HelloIbadan database schema
-- Paste this whole file into Supabase → SQL Editor → Run once.
-- ============================================================

-- ---------- TABLES ----------

create table public.profiles (
  id           uuid primary key references auth.users on delete cascade,
  display_name text,
  is_business  boolean not null default false,
  created_at   timestamptz not null default now()
);

create table public.venues (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  category    text not null check (category in
              ('inn', 'pizza', 'fine-dining', 'hotel', 'lounge', 'bar', 'takeout')),
  area        text,                 -- e.g. 'Bodija', 'Ring Road', 'Jericho'
  address     text,
  description text,
  phone       text,
  owner_id    uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- NOTE: reviews intentionally have NO image column anywhere.
-- Users can only ever write text. That is the product rule.
create table public.reviews (
  id         uuid primary key default gen_random_uuid(),
  venue_id   uuid not null references public.venues on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  rating     int not null check (rating between 1 and 5),
  body       text not null check (char_length(body) > 0),
  created_at timestamptz not null default now()
);

create table public.venue_images (
  id          uuid primary key default gen_random_uuid(),
  venue_id    uuid not null references public.venues on delete cascade,
  image_url   text not null,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ---------- AUTO-CREATE PROFILE ON SIGNUP ----------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, is_business)
  values (
    new.id,
    new.raw_user_meta_data ->> 'display_name',
    coalesce((new.raw_user_meta_data ->> 'is_business')::boolean, false)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- ROW LEVEL SECURITY ----------

alter table public.profiles     enable row level security;
alter table public.venues       enable row level security;
alter table public.reviews      enable row level security;
alter table public.venue_images enable row level security;

-- Profiles: anyone signed in can view profiles (to see review author names);
-- each user can only edit their own.
create policy "profiles viewable by users"
  on public.profiles for select to authenticated using (true);

create policy "users edit own profile"
  on public.profiles for update to authenticated using (id = auth.uid());

-- Venues: public can browse; only business accounts can create,
-- and only the owner can edit their venue.
create policy "venues public read"
  on public.venues for select using (true);

create policy "businesses create venues"
  on public.venues for insert to authenticated
  with check (
    owner_id = auth.uid()
    and exists (select 1 from public.profiles p
                where p.id = auth.uid() and p.is_business)
  );

create policy "owners edit own venue"
  on public.venues for update to authenticated
  using (owner_id = auth.uid());

-- Reviews: public read; signed-in users write reviews as themselves only.
create policy "reviews public read"
  on public.reviews for select using (true);

create policy "signed-in users post text reviews"
  on public.reviews for insert to authenticated
  with check (user_id = auth.uid());

create policy "users delete own review"
  on public.reviews for delete to authenticated
  using (user_id = auth.uid());

-- Venue images: public read; ONLY business accounts that own the venue
-- can add images. Regular users cannot, at the database level.
create policy "venue images public read"
  on public.venue_images for select using (true);

create policy "business owners upload images to own venue"
  on public.venue_images for insert to authenticated
  with check (
    uploaded_by = auth.uid()
    and exists (select 1 from public.profiles p
                where p.id = auth.uid() and p.is_business)
    and exists (select 1 from public.venues v
                where v.id = venue_id and v.owner_id = auth.uid())
  );

create policy "business owners delete own venue images"
  on public.venue_images for delete to authenticated
  using (uploaded_by = auth.uid());

-- ---------- IMAGE STORAGE (business accounts only) ----------

insert into storage.buckets (id, name, public)
values ('venue-images', 'venue-images', true)
on conflict (id) do nothing;

create policy "public read venue images"
  on storage.objects for select
  using (bucket_id = 'venue-images');

create policy "businesses upload venue images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'venue-images'
    and exists (select 1 from public.profiles p
                where p.id = auth.uid() and p.is_business)
  );

create policy "businesses delete own uploads"
  on storage.objects for delete to authenticated
  using (bucket_id = 'venue-images' and owner = auth.uid());

-- ---------- SAMPLE DATA (delete anytime) ----------

insert into public.venues (name, category, area, address, description, phone) values
('Cocoa House Grill', 'fine-dining', 'Dugbe', 'Cocoa House Complex, Dugbe', 'Premium grills and continental dishes in an iconic Ibadan setting.', '08030000001'),
('Jericho Pizza Hub', 'pizza', 'Jericho', '14 Jericho GRA Road', 'Wood-fired pizzas, quick delivery across Jericho and environs.', '08030000002'),
('Bodija Lounge 77', 'lounge', 'Bodija', 'Bodija Market Road', 'Chill lounge with live DJ nights and small chops.', '08030000003');
