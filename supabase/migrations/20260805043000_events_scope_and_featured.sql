-- Add college scoping and homepage-featured promotion to events

ALTER TABLE public.events
  ADD COLUMN college_id uuid REFERENCES public.colleges(id),
  ADD COLUMN is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN featured_at timestamptz,
  ADD COLUMN featured_by uuid REFERENCES public.user_profiles(id);

-- Keep scope_type consistent with which FK is actually set
ALTER TABLE public.events
  ADD CONSTRAINT events_scope_consistency CHECK (
    (scope_type IN ('global', 'trust', 'institute') AND college_id IS NULL AND department_id IS NULL)
    OR (scope_type = 'college' AND college_id IS NOT NULL AND department_id IS NULL)
    OR (scope_type = 'department' AND department_id IS NOT NULL)
  );

-- Auto-derive college_id for department-scoped events, and keep featured_at in sync
CREATE OR REPLACE FUNCTION public.events_before_write()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF NEW.scope_type = 'department' AND NEW.department_id IS NOT NULL AND NEW.college_id IS NULL THEN
    SELECT d.college_id INTO NEW.college_id FROM public.departments d WHERE d.id = NEW.department_id;
  END IF;

  IF NEW.is_featured AND (TG_OP = 'INSERT' OR NEW.is_featured IS DISTINCT FROM OLD.is_featured) THEN
    NEW.featured_at := timezone('utc'::text, now());
    NEW.featured_by := auth.uid();
  ELSIF NOT NEW.is_featured AND (TG_OP = 'UPDATE' AND NEW.is_featured IS DISTINCT FROM OLD.is_featured) THEN
    NEW.featured_at := NULL;
    NEW.featured_by := NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS events_before_write_trigger ON public.events;
CREATE TRIGGER events_before_write_trigger
  BEFORE INSERT OR UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.events_before_write();

-- Only a global-scoped role may feature/unfeature an event, and at most 8 may be featured at once
CREATE OR REPLACE FUNCTION public.events_enforce_featured_rules()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  featured_count integer;
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.is_featured)
     OR (TG_OP = 'UPDATE' AND NEW.is_featured IS DISTINCT FROM OLD.is_featured) THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.scope_type = 'global'
        AND ur.status = 'published'
        AND ur.deleted_at IS NULL
    ) THEN
      RAISE EXCEPTION 'Only a global administrator can feature or unfeature an event';
    END IF;
  END IF;

  IF NEW.is_featured AND (TG_OP = 'INSERT' OR NEW.is_featured IS DISTINCT FROM OLD.is_featured) THEN
    SELECT count(*) INTO featured_count
    FROM public.events
    WHERE is_featured = true AND deleted_at IS NULL AND id IS DISTINCT FROM NEW.id;

    IF featured_count >= 8 THEN
      RAISE EXCEPTION 'At most 8 events can be featured on the homepage at once';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS events_enforce_featured_rules_trigger ON public.events;
CREATE TRIGGER events_enforce_featured_rules_trigger
  BEFORE INSERT OR UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.events_enforce_featured_rules();

-- Scope-aware write access: a user may write an event only if they hold a
-- global role, or an editor role scoped to the same college/department
CREATE OR REPLACE FUNCTION public.can_write_event(p_scope_type public.scope_level, p_college_id uuid, p_department_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.status = 'published'
      AND ur.deleted_at IS NULL
      AND (
        ur.scope_type = 'global'
        OR (ur.scope_type = 'college' AND p_scope_type = 'college' AND ur.college_id = p_college_id)
        OR (ur.scope_type = 'department' AND p_scope_type = 'department' AND ur.department_id = p_department_id)
      )
  );
$$;

DROP POLICY IF EXISTS "Auth CRUD" ON public.events;

CREATE POLICY "Scoped insert events" ON public.events
  FOR INSERT WITH CHECK (public.can_write_event(scope_type, college_id, department_id));

CREATE POLICY "Scoped update events" ON public.events
  FOR UPDATE
  USING (public.can_write_event(scope_type, college_id, department_id))
  WITH CHECK (public.can_write_event(scope_type, college_id, department_id));

CREATE POLICY "Scoped delete events" ON public.events
  FOR DELETE USING (public.can_write_event(scope_type, college_id, department_id));
