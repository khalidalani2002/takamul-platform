-- ============================================================
--  Takamul website — Supabase schema
--  Run this ONCE in: Supabase Dashboard -> SQL Editor -> New query
-- ============================================================

-- 1) Blog posts table -----------------------------------------
create table if not exists public.posts (
  id          uuid primary key default gen_random_uuid(),
  category    text not null check (category in ('about', 'events', 'muathren')),
  title       text not null,
  body        text,
  media       jsonb not null default '[]'::jsonb,   -- legacy gallery (kept for old posts)
  -- ordered content blocks built in the admin editor:
  -- [{ "type": "heading"|"text", "text": "..." },
  --  { "type": "image"|"video", "url": "...", "path": "storage/path" }, ...]
  content     jsonb not null default '[]'::jsonb,
  published   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- make sure the columns exist even if the table was created by an older schema
alter table public.posts add column if not exists media   jsonb not null default '[]'::jsonb;
alter table public.posts add column if not exists content jsonb not null default '[]'::jsonb;
alter table public.posts add column if not exists cover   jsonb;   -- main photo { "url": "...", "path": "..." }
alter table public.posts add column if not exists layout  jsonb;   -- visual builder doc { "rows": [ { "columns": [ { "elements": [...] } ] } ] }
alter table public.posts add column if not exists event_date text;  -- optional display date (YYYY-MM-DD)

alter table public.posts enable row level security;

-- Anyone (public site visitors) can read published posts.
drop policy if exists "public can read published posts" on public.posts;
create policy "public can read published posts"
  on public.posts for select
  using (published = true);

-- Only logged-in (admin) users can create / edit / delete.
drop policy if exists "authenticated can insert" on public.posts;
create policy "authenticated can insert"
  on public.posts for insert to authenticated with check (true);

drop policy if exists "authenticated can update" on public.posts;
create policy "authenticated can update"
  on public.posts for update to authenticated using (true);

drop policy if exists "authenticated can delete" on public.posts;
create policy "authenticated can delete"
  on public.posts for delete to authenticated using (true);


-- 2) Storage bucket for photos & videos -----------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Public can read files; only logged-in admin can upload/delete.
drop policy if exists "public can read media" on storage.objects;
create policy "public can read media"
  on storage.objects for select
  using (bucket_id = 'media');

drop policy if exists "authenticated can upload media" on storage.objects;
create policy "authenticated can upload media"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'media');

drop policy if exists "authenticated can delete media" on storage.objects;
create policy "authenticated can delete media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'media');
