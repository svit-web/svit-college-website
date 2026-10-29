-- Central Library page, part 2: staff + downloads.
--
-- Staff: the page lists the staff assigned to one department, chosen in
-- /admin/library and stored on the library facility row as
-- metadata.staff_department_id (not facilities.department_id — a department_id
-- marks a row as a department lab and hides it from Campus Life). Seeded to the
-- existing "Library Department" (code LIB) when that department exists.
--
-- Downloads: a 'library' category, shown in the page's Downloads section and
-- already writable by the 'library' section grant
-- (20261003135303_wire_library_section_to_downloads.sql).

alter table public.downloads drop constraint if exists downloads_category_check;
alter table public.downloads add constraint downloads_category_check
  check (category = any (array['circular', 'notice', 'syllabus', 'form', 'library', 'other']));

update public.facilities f
set metadata = coalesce(f.metadata, '{}'::jsonb)
  || jsonb_build_object('staff_department_id', d.id)
from public.departments d
where f.slug = 'library'
  and f.department_id is null
  and d.code = 'LIB'
  and d.deleted_at is null
  and coalesce(f.metadata->>'staff_department_id', '') = '';
