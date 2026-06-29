-- CODATOR Database Schema
-- Run this in the Supabase SQL Editor to set up your tables and RLS policies.

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- 1. MEMBERS TABLE
create table public.members (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  university_roll text not null,
  department text not null,
  batch_year text not null,
  email text not null unique,
  phone text,
  why_join text,
  skills text[] default '{}',
  status text not null default 'pending' check (status in ('pending', 'active', 'rejected', 'suspended')),
  codator_id text unique,
  pass_token text,
  role text not null default 'member' check (role in ('member', 'admin')),
  applied_at timestamptz default now(),
  approved_at timestamptz,
  approved_by uuid references public.members(id),
  user_id uuid references auth.users(id) on delete set null -- links to Supabase Auth once signed up
);

-- Enable RLS on members
alter table public.members enable row level security;

-- 2. EVENTS TABLE
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text not null,
  category text not null check (category in ('hackathon', 'workshop', 'seminar', 'social')),
  date_start timestamptz not null,
  date_end timestamptz,
  location text,
  banner_url text,
  capacity integer,
  free_for_members boolean default true,
  is_published boolean default false,
  created_by uuid references public.members(id),
  created_at timestamptz default now()
);

-- Enable RLS on events
alter table public.events enable row level security;

-- 3. EVENT REGISTRATIONS TABLE
create table public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  registered_at timestamptz default now(),
  checked_in_at timestamptz,
  unique (event_id, member_id)
);

-- Enable RLS on event registrations
alter table public.event_registrations enable row level security;


--- RLS POLICIES & HELPER FUNCTIONS ---

-- Helper: Check if the current authenticated user is an Admin
create or replace function public.is_admin()
returns boolean security definer as $$
begin
  -- An admin must have a member record with role = 'admin' matching their auth email or user_id
  return exists (
    select 1 from public.members
    where (user_id = auth.uid() or email = auth.jwt() ->> 'email')
      and role = 'admin'
  );
end;
$$ language plpgsql;

-- Helper: Check if the current authenticated user is an Active Member
create or replace function public.is_active_member()
returns boolean security definer as $$
begin
  return exists (
    select 1 from public.members
    where (user_id = auth.uid() or email = auth.jwt() ->> 'email')
      and status = 'active'
  );
end;
$$ language plpgsql;


-- Members Policies
create policy "Allow public to apply"
  on public.members for insert
  with check (status = 'pending' and role = 'member'); -- applicants can only insert as pending/member

create policy "Allow admins full access to members"
  on public.members for all
  using (public.is_admin());

create policy "Allow members to view/update their own profile"
  on public.members for select
  using (user_id = auth.uid() or email = auth.jwt() ->> 'email');


-- Events Policies
create policy "Allow anyone to view published events"
  on public.events for select
  using (is_published = true);

create policy "Allow admins full access to events"
  on public.events for all
  using (public.is_admin());


-- Event Registrations Policies
create policy "Allow admins full access to registrations"
  on public.event_registrations for all
  using (public.is_admin());

create policy "Allow active members to view their own registrations"
  on public.event_registrations for select
  using (
    member_id in (
      select id from public.members 
      where user_id = auth.uid() or email = auth.jwt() ->> 'email'
    )
  );

create policy "Allow active members to register for events"
  on public.event_registrations for insert
  with check (
    member_id in (
      select id from public.members 
      where (user_id = auth.uid() or email = auth.jwt() ->> 'email')
        and status = 'active'
    )
  );
