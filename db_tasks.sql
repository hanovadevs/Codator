-- CODATOR Tasks & XP Schema Update
-- Copy and run this script in your Supabase SQL Editor.

-- 1. Add 'xp' column to members table (defaults to 0)
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS xp integer NOT NULL DEFAULT 0;

-- 2. Create 'tasks' table
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  xp_reward integer NOT NULL DEFAULT 100,
  assigned_by uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  assigned_to uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'pending_review', 'completed')),
  proof text,
  created_at timestamptz DEFAULT now(),
  submitted_at timestamptz,
  completed_at timestamptz
);

-- Enable Row Level Security (RLS) on tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid duplicate errors
DROP POLICY IF EXISTS "Allow members to view their own or assigned tasks" ON public.tasks;
DROP POLICY IF EXISTS "Allow assignees to update their tasks" ON public.tasks;
DROP POLICY IF EXISTS "Allow assigners to manage tasks they created" ON public.tasks;

-- Policy: Members can select tasks assigned to them or created by them (Admins/Presidents/Mentors can select all tasks)
CREATE POLICY "Allow members to view their own or assigned tasks"
  ON public.tasks FOR SELECT
  USING (
    assigned_to IN (SELECT id FROM public.members WHERE user_id = auth.uid() OR email = auth.jwt() ->> 'email') OR
    assigned_by IN (SELECT id FROM public.members WHERE user_id = auth.uid() OR email = auth.jwt() ->> 'email') OR
    (SELECT role FROM public.members WHERE user_id = auth.uid() OR email = auth.jwt() ->> 'email') = 'admin' OR
    (SELECT position FROM public.members WHERE user_id = auth.uid() OR email = auth.jwt() ->> 'email') ILIKE '%president%' OR
    (SELECT position FROM public.members WHERE user_id = auth.uid() OR email = auth.jwt() ->> 'email') ILIKE '%mentor%'
  );

-- Policy: Members can update tasks assigned to them (to submit proof)
CREATE POLICY "Allow assignees to update their tasks"
  ON public.tasks FOR UPDATE
  USING (
    assigned_to IN (SELECT id FROM public.members WHERE user_id = auth.uid() OR email = auth.jwt() ->> 'email')
  );

-- Policy: Assigners can manage (insert/update/delete) tasks they created (Admins/Presidents/Mentors can manage all tasks)
CREATE POLICY "Allow assigners to manage tasks they created"
  ON public.tasks FOR ALL
  USING (
    assigned_by IN (SELECT id FROM public.members WHERE user_id = auth.uid() OR email = auth.jwt() ->> 'email') OR
    (SELECT role FROM public.members WHERE user_id = auth.uid() OR email = auth.jwt() ->> 'email') = 'admin' OR
    (SELECT position FROM public.members WHERE user_id = auth.uid() OR email = auth.jwt() ->> 'email') ILIKE '%president%' OR
    (SELECT position FROM public.members WHERE user_id = auth.uid() OR email = auth.jwt() ->> 'email') ILIKE '%mentor%'
  );
