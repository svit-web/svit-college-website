-- Add intake and fees columns to courses table
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS intake integer,
  ADD COLUMN IF NOT EXISTS fees_per_semester text;

-- Create scholarships table
CREATE TABLE IF NOT EXISTS public.scholarships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'merit',
  description text,
  eligibility text,
  amount text,
  provider text,
  status text NOT NULL DEFAULT 'published',
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Scholarships are publicly readable"
  ON public.scholarships FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can manage scholarships"
  ON public.scholarships FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.code IN ('admin', 'superadmin')
    )
  );

CREATE INDEX IF NOT EXISTS scholarships_sort_order_idx ON public.scholarships (sort_order, created_at);

CREATE OR REPLACE FUNCTION public.set_scholarships_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS scholarships_updated_at ON public.scholarships;
CREATE TRIGGER scholarships_updated_at
  BEFORE UPDATE ON public.scholarships
  FOR EACH ROW EXECUTE FUNCTION public.set_scholarships_updated_at();
