-- CODATOR Database Schema Update
-- Copy and run this script in your Supabase SQL Editor.

-- 1. Add 'position' column to members table (defaults to 'Member')
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS position text NOT NULL DEFAULT 'Member';

-- 2. Create 'announcements' table
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL CHECK (category IN ('general', 'event', 'urgent', 'opportunity')),
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES public.members(id) ON DELETE CASCADE
);

-- Enable Row Level Security (RLS) on announcements
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies for announcements
-- Allow anyone (public and members) to read announcements
CREATE POLICY "Allow anyone to read announcements"
  ON public.announcements FOR SELECT
  USING (true);

-- Allow admins full access to manage announcements
CREATE POLICY "Allow admins full access to announcements"
  ON public.announcements FOR ALL
  USING (public.is_admin());
