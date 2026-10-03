-- Phase 2e of the SYSTEM_MAP.md broken-items fix plan: /admissions/scholarships
-- is wired correctly end-to-end but always renders empty because the real
-- content was never migrated out of pages.metadata.facilities.scholarships
-- (a leftover from the pre-Supabase-normalization "about" page JSON blob)
-- into the actual scholarships table. Move the 5 real entries over.

INSERT INTO public.scholarships (name, amount, eligibility, sort_order, status)
SELECT
  elem->>'name',
  elem->>'amount',
  elem->>'eligibility',
  (ord - 1)::int,
  'published'
FROM public.pages,
     jsonb_array_elements(metadata->'facilities'->'scholarships') WITH ORDINALITY AS t(elem, ord)
WHERE slug = 'about';
