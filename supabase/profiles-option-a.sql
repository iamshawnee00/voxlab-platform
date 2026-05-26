-- VOXLAB manual user setup for Supabase Auth + grade access.
-- Use this after creating users manually in Supabase Dashboard > Authentication > Users.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  grade text not null check (grade in (
    'G1 - Lead',
    'G2 - Senior',
    'G3 - Executive',
    'G4 - Support',
    'External'
  )),
  role text not null default 'staff',
  personnel_id text,
  status text not null default 'active' check (status in ('active', 'disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Option A workflow:
-- 1. Create users manually in Supabase Dashboard > Authentication > Users.
-- 2. Copy the Auth user UUID.
-- 3. Insert the matching public.profiles row manually.
--
-- We intentionally do NOT create an auth.users trigger in Option A because the
-- Dashboard create-user flow may not provide user metadata fields. A strict
-- metadata trigger can block Auth user creation with:
-- "Database error creating new user".
--
-- These drops remove stale trigger/function leftovers from earlier setup.
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

-- Do not add a self-update policy for this option. Grade and personnel access are
-- managed manually by VOXLAB admin in Supabase Dashboard for now.

-- Example profile insert after creating an auth user:
-- insert into public.profiles (id, full_name, grade, role, personnel_id)
-- values ('PASTE_AUTH_USER_UUID', 'Alex Mercer', 'G1 - Lead', 'admin', 't1');

-- Manual profile insert after creating an Auth user:
-- insert into public.profiles (id, full_name, grade, role, personnel_id)
-- values ('PASTE_AUTH_USER_UUID', 'Alex Mercer', 'G1 - Lead', 'admin', 't1');
