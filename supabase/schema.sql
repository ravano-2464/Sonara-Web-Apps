-- Sonara schema (Supabase Postgres)
-- Run this in Supabase SQL Editor.

create extension if not exists "pgcrypto";

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tracks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  artist text not null,
  album text,
  duration numeric(10,2) not null check (duration >= 0),
  genre text,
  lyrics text,
  cover_url text,
  audio_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.playlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  cover_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.playlist_tracks (
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  track_id uuid not null references public.tracks(id) on delete cascade,
  position integer not null default 0,
  added_at timestamptz not null default now(),
  primary key (playlist_id, track_id)
);

create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  track_id uuid not null references public.tracks(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, track_id)
);

create table if not exists public.recently_played (
  user_id uuid not null references auth.users(id) on delete cascade,
  track_id uuid not null references public.tracks(id) on delete cascade,
  played_at timestamptz not null default now(),
  primary key (user_id, track_id)
);

create table if not exists public.equalizer_presets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  band_20 numeric(5,2) not null default 0,
  band_25 numeric(5,2) not null default 0,
  band_31 numeric(5,2) not null default 0,
  band_40 numeric(5,2) not null default 0,
  band_50 numeric(5,2) not null default 0,
  band_63 numeric(5,2) not null default 0,
  band_80 numeric(5,2) not null default 0,
  band_100 numeric(5,2) not null default 0,
  band_125 numeric(5,2) not null default 0,
  band_160 numeric(5,2) not null default 0,
  band_200 numeric(5,2) not null default 0,
  band_250 numeric(5,2) not null default 0,
  band_315 numeric(5,2) not null default 0,
  band_400 numeric(5,2) not null default 0,
  band_500 numeric(5,2) not null default 0,
  band_630 numeric(5,2) not null default 0,
  band_800 numeric(5,2) not null default 0,
  band_1000 numeric(5,2) not null default 0,
  band_1250 numeric(5,2) not null default 0,
  band_1600 numeric(5,2) not null default 0,
  band_2000 numeric(5,2) not null default 0,
  band_2500 numeric(5,2) not null default 0,
  band_3150 numeric(5,2) not null default 0,
  band_4000 numeric(5,2) not null default 0,
  band_5000 numeric(5,2) not null default 0,
  band_6300 numeric(5,2) not null default 0,
  band_8000 numeric(5,2) not null default 0,
  band_10000 numeric(5,2) not null default 0,
  band_12500 numeric(5,2) not null default 0,
  band_16000 numeric(5,2) not null default 0,
  band_18000 numeric(5,2) not null default 0,
  band_20000 numeric(5,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

-- Patch existing deployments with newly added columns/defaults.
-- This makes the script safe to rerun after schema updates.
alter table if exists public.users add column if not exists email text;
alter table if exists public.users add column if not exists display_name text;
alter table if exists public.users add column if not exists avatar_url text;
alter table if exists public.users add column if not exists created_at timestamptz default now();
alter table if exists public.users add column if not exists updated_at timestamptz default now();
alter table if exists public.users alter column created_at set default now();
alter table if exists public.users alter column updated_at set default now();

alter table if exists public.tracks add column if not exists id uuid default gen_random_uuid();
alter table if exists public.tracks add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table if exists public.tracks add column if not exists title text;
alter table if exists public.tracks add column if not exists artist text;
alter table if exists public.tracks add column if not exists album text;
alter table if exists public.tracks add column if not exists duration numeric(10,2);
alter table if exists public.tracks add column if not exists genre text;
alter table if exists public.tracks add column if not exists lyrics text;
alter table if exists public.tracks add column if not exists cover_url text;
alter table if exists public.tracks add column if not exists audio_url text;
alter table if exists public.tracks add column if not exists created_at timestamptz default now();
alter table if exists public.tracks alter column id set default gen_random_uuid();
alter table if exists public.tracks alter column created_at set default now();

alter table if exists public.playlists add column if not exists id uuid default gen_random_uuid();
alter table if exists public.playlists add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table if exists public.playlists add column if not exists name text;
alter table if exists public.playlists add column if not exists description text;
alter table if exists public.playlists add column if not exists cover_url text;
alter table if exists public.playlists add column if not exists created_at timestamptz default now();
alter table if exists public.playlists add column if not exists updated_at timestamptz default now();
alter table if exists public.playlists alter column id set default gen_random_uuid();
alter table if exists public.playlists alter column created_at set default now();
alter table if exists public.playlists alter column updated_at set default now();

alter table if exists public.playlist_tracks add column if not exists playlist_id uuid references public.playlists(id) on delete cascade;
alter table if exists public.playlist_tracks add column if not exists track_id uuid references public.tracks(id) on delete cascade;
alter table if exists public.playlist_tracks add column if not exists position integer default 0;
alter table if exists public.playlist_tracks add column if not exists added_at timestamptz default now();
alter table if exists public.playlist_tracks alter column position set default 0;
alter table if exists public.playlist_tracks alter column added_at set default now();

alter table if exists public.favorites add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table if exists public.favorites add column if not exists track_id uuid references public.tracks(id) on delete cascade;
alter table if exists public.favorites add column if not exists created_at timestamptz default now();
alter table if exists public.favorites alter column created_at set default now();

alter table if exists public.recently_played add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table if exists public.recently_played add column if not exists track_id uuid references public.tracks(id) on delete cascade;
alter table if exists public.recently_played add column if not exists played_at timestamptz default now();
alter table if exists public.recently_played alter column played_at set default now();

alter table if exists public.equalizer_presets add column if not exists id uuid default gen_random_uuid();
alter table if exists public.equalizer_presets add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table if exists public.equalizer_presets add column if not exists name text;
alter table if exists public.equalizer_presets add column if not exists band_20 numeric(5,2) default 0;
alter table if exists public.equalizer_presets add column if not exists band_25 numeric(5,2) default 0;
alter table if exists public.equalizer_presets add column if not exists band_31 numeric(5,2) default 0;
alter table if exists public.equalizer_presets add column if not exists band_40 numeric(5,2) default 0;
alter table if exists public.equalizer_presets add column if not exists band_50 numeric(5,2) default 0;
alter table if exists public.equalizer_presets add column if not exists band_63 numeric(5,2) default 0;
alter table if exists public.equalizer_presets add column if not exists band_80 numeric(5,2) default 0;
alter table if exists public.equalizer_presets add column if not exists band_100 numeric(5,2) default 0;
alter table if exists public.equalizer_presets add column if not exists band_125 numeric(5,2) default 0;
alter table if exists public.equalizer_presets add column if not exists band_160 numeric(5,2) default 0;
alter table if exists public.equalizer_presets add column if not exists band_200 numeric(5,2) default 0;
alter table if exists public.equalizer_presets add column if not exists band_250 numeric(5,2) default 0;
alter table if exists public.equalizer_presets add column if not exists band_315 numeric(5,2) default 0;
alter table if exists public.equalizer_presets add column if not exists band_400 numeric(5,2) default 0;
alter table if exists public.equalizer_presets add column if not exists band_500 numeric(5,2) default 0;
alter table if exists public.equalizer_presets add column if not exists band_630 numeric(5,2) default 0;
alter table if exists public.equalizer_presets add column if not exists band_800 numeric(5,2) default 0;
alter table if exists public.equalizer_presets add column if not exists band_1000 numeric(5,2) default 0;
alter table if exists public.equalizer_presets add column if not exists band_1250 numeric(5,2) default 0;
alter table if exists public.equalizer_presets add column if not exists band_1600 numeric(5,2) default 0;
alter table if exists public.equalizer_presets add column if not exists band_2000 numeric(5,2) default 0;
alter table if exists public.equalizer_presets add column if not exists band_2500 numeric(5,2) default 0;
alter table if exists public.equalizer_presets add column if not exists band_3150 numeric(5,2) default 0;
alter table if exists public.equalizer_presets add column if not exists band_4000 numeric(5,2) default 0;
alter table if exists public.equalizer_presets add column if not exists band_5000 numeric(5,2) default 0;
alter table if exists public.equalizer_presets add column if not exists band_6300 numeric(5,2) default 0;
alter table if exists public.equalizer_presets add column if not exists band_8000 numeric(5,2) default 0;
alter table if exists public.equalizer_presets add column if not exists band_10000 numeric(5,2) default 0;
alter table if exists public.equalizer_presets add column if not exists band_12500 numeric(5,2) default 0;
alter table if exists public.equalizer_presets add column if not exists band_16000 numeric(5,2) default 0;
alter table if exists public.equalizer_presets add column if not exists band_18000 numeric(5,2) default 0;
alter table if exists public.equalizer_presets add column if not exists band_20000 numeric(5,2) default 0;
alter table if exists public.equalizer_presets add column if not exists created_at timestamptz default now();
alter table if exists public.equalizer_presets add column if not exists updated_at timestamptz default now();
alter table if exists public.equalizer_presets alter column id set default gen_random_uuid();
alter table if exists public.equalizer_presets alter column band_20 set default 0;
alter table if exists public.equalizer_presets alter column band_25 set default 0;
alter table if exists public.equalizer_presets alter column band_31 set default 0;
alter table if exists public.equalizer_presets alter column band_40 set default 0;
alter table if exists public.equalizer_presets alter column band_50 set default 0;
alter table if exists public.equalizer_presets alter column band_63 set default 0;
alter table if exists public.equalizer_presets alter column band_80 set default 0;
alter table if exists public.equalizer_presets alter column band_100 set default 0;
alter table if exists public.equalizer_presets alter column band_125 set default 0;
alter table if exists public.equalizer_presets alter column band_160 set default 0;
alter table if exists public.equalizer_presets alter column band_200 set default 0;
alter table if exists public.equalizer_presets alter column band_250 set default 0;
alter table if exists public.equalizer_presets alter column band_315 set default 0;
alter table if exists public.equalizer_presets alter column band_400 set default 0;
alter table if exists public.equalizer_presets alter column band_500 set default 0;
alter table if exists public.equalizer_presets alter column band_630 set default 0;
alter table if exists public.equalizer_presets alter column band_800 set default 0;
alter table if exists public.equalizer_presets alter column band_1000 set default 0;
alter table if exists public.equalizer_presets alter column band_1250 set default 0;
alter table if exists public.equalizer_presets alter column band_1600 set default 0;
alter table if exists public.equalizer_presets alter column band_2000 set default 0;
alter table if exists public.equalizer_presets alter column band_2500 set default 0;
alter table if exists public.equalizer_presets alter column band_3150 set default 0;
alter table if exists public.equalizer_presets alter column band_4000 set default 0;
alter table if exists public.equalizer_presets alter column band_5000 set default 0;
alter table if exists public.equalizer_presets alter column band_6300 set default 0;
alter table if exists public.equalizer_presets alter column band_8000 set default 0;
alter table if exists public.equalizer_presets alter column band_10000 set default 0;
alter table if exists public.equalizer_presets alter column band_12500 set default 0;
alter table if exists public.equalizer_presets alter column band_16000 set default 0;
alter table if exists public.equalizer_presets alter column band_18000 set default 0;
alter table if exists public.equalizer_presets alter column band_20000 set default 0;
alter table if exists public.equalizer_presets alter column created_at set default now();
alter table if exists public.equalizer_presets alter column updated_at set default now();

create index if not exists idx_tracks_created_at on public.tracks (created_at desc);
create index if not exists idx_tracks_user_id on public.tracks (user_id);
create index if not exists idx_playlists_user_id on public.playlists (user_id);
create index if not exists idx_playlist_tracks_playlist_position on public.playlist_tracks (playlist_id, position);
create index if not exists idx_favorites_user_id on public.favorites (user_id);
create index if not exists idx_recently_played_user_played on public.recently_played (user_id, played_at desc);
create unique index if not exists idx_users_display_name_lower_unique
on public.users ((lower(display_name)))
where display_name is not null;

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at
before update on public.users
for each row execute function public.handle_updated_at();

drop trigger if exists trg_playlists_updated_at on public.playlists;
create trigger trg_playlists_updated_at
before update on public.playlists
for each row execute function public.handle_updated_at();

drop trigger if exists trg_equalizer_presets_updated_at on public.equalizer_presets;
create trigger trg_equalizer_presets_updated_at
before update on public.equalizer_presets
for each row execute function public.handle_updated_at();

-- Keep users table synced with auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, display_name)
  values (
    new.id,
    new.email,
    nullif(
      trim(
        coalesce(
          new.raw_user_meta_data ->> 'display_name',
          new.raw_user_meta_data ->> 'username'
        )
      ),
      ''
    )
  )
  on conflict (id) do update
    set email = excluded.email,
        display_name = coalesce(excluded.display_name, public.users.display_name),
        updated_at = now();
  return new;
end;
$$;

-- Resolve username to email for password login.
create or replace function public.resolve_login_email(login_identifier text)
returns text
language sql
security definer
set search_path = public
as $$
  with normalized as (
    select lower(trim(login_identifier)) as value
  )
  select u.email
  from public.users u
  cross join normalized n
  where u.email is not null
    and (
      lower(u.email) = n.value
      or lower(coalesce(u.display_name, '')) = n.value
    )
  order by
    case when lower(u.email) = n.value then 0 else 1 end
  limit 1;
$$;

-- Resolve email to username for account recovery.
create or replace function public.resolve_username_by_email(account_email text)
returns text
language sql
security definer
set search_path = public
as $$
  with normalized as (
    select lower(trim(account_email)) as value
  )
  select nullif(trim(u.display_name), '')
  from public.users u
  cross join normalized n
  where u.email is not null
    and lower(u.email) = n.value
  limit 1;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- RLS
alter table public.users enable row level security;
alter table public.tracks enable row level security;
alter table public.playlists enable row level security;
alter table public.playlist_tracks enable row level security;
alter table public.favorites enable row level security;
alter table public.recently_played enable row level security;
alter table public.equalizer_presets enable row level security;

-- users
drop policy if exists "Users can read own profile" on public.users;
create policy "Users can read own profile"
on public.users
for select
using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
on public.users
for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- tracks
drop policy if exists "Authenticated users can read tracks" on public.tracks;
create policy "Authenticated users can read tracks"
on public.tracks
for select
using (auth.role() = 'authenticated');

drop policy if exists "Users can insert own tracks" on public.tracks;
create policy "Users can insert own tracks"
on public.tracks
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own tracks" on public.tracks;
create policy "Users can update own tracks"
on public.tracks
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own tracks" on public.tracks;
create policy "Users can delete own tracks"
on public.tracks
for delete
using (auth.uid() = user_id);

-- playlists
drop policy if exists "Users can read own playlists" on public.playlists;
create policy "Users can read own playlists"
on public.playlists
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own playlists" on public.playlists;
create policy "Users can insert own playlists"
on public.playlists
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own playlists" on public.playlists;
create policy "Users can update own playlists"
on public.playlists
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own playlists" on public.playlists;
create policy "Users can delete own playlists"
on public.playlists
for delete
using (auth.uid() = user_id);

-- playlist_tracks
drop policy if exists "Users can read tracks from own playlists" on public.playlist_tracks;
create policy "Users can read tracks from own playlists"
on public.playlist_tracks
for select
using (
  exists (
    select 1
    from public.playlists p
    where p.id = playlist_id
      and p.user_id = auth.uid()
  )
);

drop policy if exists "Users can manage tracks in own playlists" on public.playlist_tracks;
create policy "Users can manage tracks in own playlists"
on public.playlist_tracks
for all
using (
  exists (
    select 1
    from public.playlists p
    where p.id = playlist_id
      and p.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.playlists p
    where p.id = playlist_id
      and p.user_id = auth.uid()
  )
);

-- favorites
drop policy if exists "Users manage own favorites" on public.favorites;
create policy "Users manage own favorites"
on public.favorites
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- recently played
drop policy if exists "Users manage own recently played" on public.recently_played;
create policy "Users manage own recently played"
on public.recently_played
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- equalizer presets
drop policy if exists "Users manage own equalizer presets" on public.equalizer_presets;
create policy "Users manage own equalizer presets"
on public.equalizer_presets
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Storage buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('track-audio', 'track-audio', true, 104857600, array['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'video/mp4']),
  ('track-covers', 'track-covers', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Storage policies
drop policy if exists "Public can read track audio" on storage.objects;
create policy "Public can read track audio"
on storage.objects
for select
using (bucket_id = 'track-audio');

drop policy if exists "Public can read track covers" on storage.objects;
create policy "Public can read track covers"
on storage.objects
for select
using (bucket_id = 'track-covers');

drop policy if exists "Users upload own track audio" on storage.objects;
create policy "Users upload own track audio"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'track-audio'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users update own track audio" on storage.objects;
create policy "Users update own track audio"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'track-audio'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'track-audio'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users delete own track audio" on storage.objects;
create policy "Users delete own track audio"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'track-audio'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users upload own track covers" on storage.objects;
create policy "Users upload own track covers"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'track-covers'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users update own track covers" on storage.objects;
create policy "Users update own track covers"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'track-covers'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'track-covers'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users delete own track covers" on storage.objects;
create policy "Users delete own track covers"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'track-covers'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Force PostgREST schema cache refresh after setup/migration.
notify pgrst, 'reload schema';
