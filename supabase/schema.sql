-- SunnyBee English: Supabase schema for Cloud Curriculum & Media
-- Run this in Supabase SQL Editor when you connect Cloud storage.

create table if not exists public.curriculum_store (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.curriculum_store enable row level security;

-- Allow read access for the app without login
create policy "Public read curriculum_store"
  on public.curriculum_store
  for select
  using (true);

-- Note: Writes from Next.js API routes use SUPABASE_SERVICE_ROLE_KEY (bypasses RLS).
-- Only enable anon insert/update if you do not configure SUPABASE_SERVICE_ROLE_KEY:
-- create policy "Anon upsert curriculum_store"
--   on public.curriculum_store
--   for all
--   using (true)
--   with check (true);

-- Public bucket for uploaded images & generated TTS audio
insert into storage.buckets (id, name, public)
values ('learning-media', 'learning-media', true)
on conflict (id) do nothing;

create policy "Public read learning-media"
  on storage.objects
  for select
  using (bucket_id = 'learning-media');
