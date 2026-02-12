-- AIXENTRA schema + RLS (paste into Supabase SQL editor)
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  bio text,
  avatar_url text,
  role text not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tracks (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  genre text,
  mood text,
  ai_tool text,
  audio_path text not null,
  cover_path text,
  status text not null default 'pending',
  review_note text,
  plays bigint not null default 0,
  likes_count bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tracks_status_created_at_idx on public.tracks(status, created_at desc);
create index if not exists tracks_creator_idx on public.tracks(creator_id, created_at desc);

create table if not exists public.likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  track_id uuid not null references public.tracks(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, track_id)
);

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
as $$
  select exists(
    select 1 from public.profiles p
    where p.id = uid and p.role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (new.id, null, null)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.tracks enable row level security;
alter table public.likes enable row level security;

drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public"
on public.profiles for select
to anon, authenticated
using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "tracks_select_approved" on public.tracks;
create policy "tracks_select_approved"
on public.tracks for select
to anon, authenticated
using (status = 'approved' or creator_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "tracks_insert_own" on public.tracks;
create policy "tracks_insert_own"
on public.tracks for insert
to authenticated
with check (creator_id = auth.uid());

drop policy if exists "tracks_update_own_or_admin" on public.tracks;
create policy "tracks_update_own_or_admin"
on public.tracks for update
to authenticated
using (creator_id = auth.uid() or public.is_admin(auth.uid()))
with check (creator_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "likes_select_public" on public.likes;
create policy "likes_select_public"
on public.likes for select
to anon, authenticated
using (true);

drop policy if exists "likes_insert_own" on public.likes;
create policy "likes_insert_own"
on public.likes for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "likes_delete_own" on public.likes;
create policy "likes_delete_own"
on public.likes for delete
to authenticated
using (user_id = auth.uid());
