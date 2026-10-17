-- Migration: Create placed_students table for individual student records

CREATE TABLE IF NOT EXISTS public.placed_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  college_code text NOT NULL,
  student_name text NOT NULL,
  company_name text NOT NULL,
  photo_url text,
  status public.content_status NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS & Permissions
ALTER TABLE public.placed_students ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.placed_students TO anon, authenticated;
GRANT ALL ON public.placed_students TO service_role;
GRANT ALL ON public.placed_students TO authenticated;

-- Policies
CREATE POLICY "Public read placed_students" ON public.placed_students FOR SELECT USING (true);
CREATE POLICY "Admin write placed_students" ON public.placed_students FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_placed_students_updated_at
    BEFORE UPDATE ON public.placed_students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Seed initial placeholder records for svit-degree
INSERT INTO public.placed_students (college_code, student_name, company_name, photo_url)
VALUES
('svit-degree', 'Raj Patel', 'Microsoft', NULL),
('svit-degree', 'Sneha Reddy', 'Amazon', NULL),
('svit-degree', 'Amit Sharma', 'Google', NULL)
ON CONFLICT DO NOTHING;
