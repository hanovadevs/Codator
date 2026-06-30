-- CODATOR Society Settings Table and Seeds
-- Run this in the Supabase SQL Editor to add settings capability to your database.

-- Create society_settings table
create table if not exists public.society_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value text not null,
  description text,
  updated_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table public.society_settings enable row level security;

-- Policies for society_settings
create policy "Allow public to read settings"
  on public.society_settings for select
  using (true);

create policy "Allow admins full access to settings"
  on public.society_settings for all
  using (public.is_admin())
  with check (public.is_admin());

-- Seed initial configuration values
insert into public.society_settings (key, value, description) values
  ('society_name', 'CODATOR', 'The official name of the society'),
  ('contact_email', 'contact@codator.org', 'Public contact email address'),
  ('registrations_open', 'true', 'Toggle to allow new membership applications (true/false)'),
  ('allowed_domains', '.edu, .edu.pk', 'Comma-separated list of allowed university email domains')
on conflict (key) do update 
set description = excluded.description;
