-- Default new events/facilities/centers/student_clubs/achievements rows to
-- having their own detail page, and flip existing rows that were left off.
-- Labs are rows in `facilities` (department_id NOT NULL), so they're covered by
-- the facilities update below — there is no separate labs table.
-- Sports is intentionally excluded: no public detail route exists for it yet
-- (SportsSection.tsx hardcodes detailHref to null), so the flag would be a no-op.

ALTER TABLE public.events          ALTER COLUMN has_detail_page SET DEFAULT true;
ALTER TABLE public.facilities      ALTER COLUMN has_detail_page SET DEFAULT true;
ALTER TABLE public.centers         ALTER COLUMN has_detail_page SET DEFAULT true;
ALTER TABLE public.student_clubs   ALTER COLUMN has_detail_page SET DEFAULT true;
ALTER TABLE public.achievements    ALTER COLUMN has_detail_page SET DEFAULT true;

UPDATE public.events        SET has_detail_page = true WHERE has_detail_page = false;
UPDATE public.facilities    SET has_detail_page = true WHERE has_detail_page = false;
UPDATE public.centers       SET has_detail_page = true WHERE has_detail_page = false;
UPDATE public.student_clubs SET has_detail_page = true WHERE has_detail_page = false;
UPDATE public.achievements  SET has_detail_page = true WHERE has_detail_page = false;
