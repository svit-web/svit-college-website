-- The 20261014150000 cascade fix assumed facilities.institute_id is always set
-- ("facilities: institute_id is direct"), but in the live data the large majority
-- of facilities (labs, libraries, etc.) only set department_id and leave
-- institute_id null. That left trust-scoped and institute-scoped admins unable to
-- see or write any department-attached facility, even though college-scope could
-- already read them via the department -> college_id derivation that was present.
--
-- Fix: resolve institute_id (and the trust_id derived from it) through
-- COALESCE(facilities.institute_id, department -> college -> institute) so the
-- chain works whichever column is actually populated on a given row.

drop policy if exists "Scoped insert facilities" on public.facilities;
create policy "Scoped insert facilities" on public.facilities for insert
  with check (
    can_write_scoped_record(
      (select i.trust_id from public.institutes i
        where i.id = coalesce(
          facilities.institute_id,
          (select c.institute_id from public.departments d
             join public.colleges c on c.id = d.college_id
             where d.id = facilities.department_id)
        )),
      coalesce(
        facilities.institute_id,
        (select c.institute_id from public.departments d
           join public.colleges c on c.id = d.college_id
           where d.id = facilities.department_id)
      ),
      (select d.college_id from public.departments d where d.id = facilities.department_id),
      department_id
    )
    or (admin_section_id is not null and can_write_section(
      (select admin_sections.code from public.admin_sections where admin_sections.id = facilities.admin_section_id)
    ))
  );

drop policy if exists "Scoped update facilities" on public.facilities;
create policy "Scoped update facilities" on public.facilities for update
  using (
    can_write_scoped_record(
      (select i.trust_id from public.institutes i
        where i.id = coalesce(
          facilities.institute_id,
          (select c.institute_id from public.departments d
             join public.colleges c on c.id = d.college_id
             where d.id = facilities.department_id)
        )),
      coalesce(
        facilities.institute_id,
        (select c.institute_id from public.departments d
           join public.colleges c on c.id = d.college_id
           where d.id = facilities.department_id)
      ),
      (select d.college_id from public.departments d where d.id = facilities.department_id),
      department_id
    )
    or (admin_section_id is not null and can_write_section(
      (select admin_sections.code from public.admin_sections where admin_sections.id = facilities.admin_section_id)
    ))
  )
  with check (
    can_write_scoped_record(
      (select i.trust_id from public.institutes i
        where i.id = coalesce(
          facilities.institute_id,
          (select c.institute_id from public.departments d
             join public.colleges c on c.id = d.college_id
             where d.id = facilities.department_id)
        )),
      coalesce(
        facilities.institute_id,
        (select c.institute_id from public.departments d
           join public.colleges c on c.id = d.college_id
           where d.id = facilities.department_id)
      ),
      (select d.college_id from public.departments d where d.id = facilities.department_id),
      department_id
    )
    or (admin_section_id is not null and can_write_section(
      (select admin_sections.code from public.admin_sections where admin_sections.id = facilities.admin_section_id)
    ))
  );

drop policy if exists "Scoped delete facilities" on public.facilities;
create policy "Scoped delete facilities" on public.facilities for delete
  using (
    can_write_scoped_record(
      (select i.trust_id from public.institutes i
        where i.id = coalesce(
          facilities.institute_id,
          (select c.institute_id from public.departments d
             join public.colleges c on c.id = d.college_id
             where d.id = facilities.department_id)
        )),
      coalesce(
        facilities.institute_id,
        (select c.institute_id from public.departments d
           join public.colleges c on c.id = d.college_id
           where d.id = facilities.department_id)
      ),
      (select d.college_id from public.departments d where d.id = facilities.department_id),
      department_id
    )
    or (admin_section_id is not null and can_write_section(
      (select admin_sections.code from public.admin_sections where admin_sections.id = facilities.admin_section_id)
    ))
  );

drop policy if exists "Scoped read facilities" on public.facilities;
create policy "Scoped read facilities" on public.facilities for select
  to authenticated
  using (can_write_scoped_record(
    (select i.trust_id from public.institutes i
      where i.id = coalesce(
        facilities.institute_id,
        (select c.institute_id from public.departments d
           join public.colleges c on c.id = d.college_id
           where d.id = facilities.department_id)
      )),
    coalesce(
      facilities.institute_id,
      (select c.institute_id from public.departments d
         join public.colleges c on c.id = d.college_id
         where d.id = facilities.department_id)
    ),
    (select d.college_id from public.departments d where d.id = facilities.department_id),
    department_id
  ));
