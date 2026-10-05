-- office_hours is a list of {day, time} entries (staff wizard + public
-- staff page both treat it as an array), but the column defaulted to '{}'
-- — an empty object — so every profile held {} and the wizard crashed on
-- `.map is not a function`. Normalize the empty objects and fix the default.
update public.staff_profiles
set office_hours = '[]'::jsonb
where jsonb_typeof(office_hours) <> 'array';

alter table public.staff_profiles alter column office_hours set default '[]'::jsonb;
