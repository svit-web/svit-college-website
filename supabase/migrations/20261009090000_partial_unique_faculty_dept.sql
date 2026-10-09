-- unique_faculty_dept blocked re-adding a staff member to a department they
-- were previously (soft-)removed from, since the constraint didn't exclude
-- deleted_at rows. Make it partial so only *active* assignments are unique.
alter table public.staff_department_assignments drop constraint unique_faculty_dept;
create unique index unique_faculty_dept on public.staff_department_assignments (staff_id, department_id) where deleted_at is null;
