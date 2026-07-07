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
  status text NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'pending_review', 'completed', 'cancelled')),
  proof text,
  proof_image text,
  due_at timestamptz,
  extension_requested_at timestamptz,
  extension_reason text,
  extension_status text NOT NULL DEFAULT 'none' CHECK (extension_status IN ('none', 'pending', 'approved', 'rejected')),
  extension_due_at timestamptz,
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

-- Policy: Members can update tasks assigned to them (to submit proof/request extension)
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

-- 4. Apply column extensions to tasks table (if tasks table already exists)
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS proof_image text;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS due_at timestamptz;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS extension_requested_at timestamptz;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS extension_reason text;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS extension_status text NOT NULL DEFAULT 'none';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS extension_due_at timestamptz;

-- Re-apply status constraint if tasks already existed (to include 'cancelled')
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_status_check CHECK (status IN ('assigned', 'pending_review', 'completed', 'cancelled'));

-- Re-apply extension constraint if tasks already existed
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_extension_status_check;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_extension_status_check CHECK (extension_status IN ('none', 'pending', 'approved', 'rejected'));


-- 5. Create PGSQL Function for automatic expiration cancellation and -10 XP deduction
CREATE OR REPLACE FUNCTION public.check_expired_tasks()
RETURNS void AS $$
DECLARE
  task_row RECORD;
BEGIN
  -- Loop over all active assigned tasks that have passed their deadline
  FOR task_row IN 
    SELECT id, assigned_to 
    FROM public.tasks 
    WHERE status = 'assigned' AND due_at IS NOT NULL AND due_at < now()
  LOOP
    -- Update task status to 'cancelled'
    UPDATE public.tasks 
    SET status = 'cancelled', completed_at = now() 
    WHERE id = task_row.id;

    -- Deduct 10 XP from the member (enforce floor at 0)
    UPDATE public.members 
    SET xp = GREATEST(0, xp - 10) 
    WHERE id = task_row.assigned_to;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
