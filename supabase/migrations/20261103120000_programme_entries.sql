-- Programme entries for courses that had no card on /courses. M.E. becomes one
-- Programme, as B.E. already is; BCA, Interior Design, B.Sc Nursing and GNM get
-- their own. No department_id, so each is a Programme (see CONTEXT.md).
-- Intake is copied from the matching course rows; the nursing descriptions are
-- taken from theirs. GNM goes under Diploma because its own text calls it
-- diploma-level, although its course row says undergraduate.
-- Idempotent: a code that already exists is left alone.

insert into public.courses
  (code, name, short_name, full_name, tagline, degree_level, duration, intake, description,
   color, accent, is_programme, status, metadata)
select
  v.code, v.name, v.short_name, v.full_name, v.tagline, v.degree_level::public.degree_level,
  v.duration, coalesce(v.intake, source.intake), v.description,
  'bg-navy', 'text-navy', true, 'published'::public.content_status,
  '{"highlights": [], "outcomes": []}'::jsonb
from (values
  ('me', 'M.E. Engineering', 'M.E.', 'Master of Engineering', 'M.E. — Postgraduate Engineering',
   'graduate', '2 Years', 27, 'Postgraduate engineering programmes in Software and Structure.', null),
  ('bca', 'BCA', 'BCA', 'Bachelor of Computer Applications', 'BCA — Bachelor of Computer Applications',
   'undergraduate', '3 Years', null, 'Undergraduate programme in Computer Applications.', 'BCA'),
  ('interior-design', 'Interior Design', 'BID', 'Bachelor of Interior Design', 'BID — Bachelor of Interior Design',
   'undergraduate', '4 Years', null, 'Undergraduate programme in Interior Design.', 'BID'),
  ('bsc-nursing', 'B.Sc Nursing', 'B.Sc', 'Bachelor of Science in Nursing', 'B.Sc Nursing',
   'undergraduate', '4 Years', null,
   'A four-year undergraduate program designed to prepare competent, compassionate, and skilled nursing professionals.',
   'BSC-NURSING'),
  ('gnm', 'General Nursing & Midwifery', 'GNM', 'General Nursing & Midwifery', 'GNM',
   'certificate', '3 Years', null,
   'A diploma-level nursing course designed to prepare competent and compassionate nursing professionals.',
   'GNM')
) as v(code, name, short_name, full_name, tagline, degree_level, duration, intake, description, source_code)
left join public.courses source on source.code = v.source_code
on conflict (code) do nothing;
