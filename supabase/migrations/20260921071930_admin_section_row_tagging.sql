-- Row-level section tagging for tables shared across multiple admin sections.
alter table public.facilities add column admin_section_id uuid references public.admin_sections(id);
alter table public.app_settings add column admin_section_id uuid references public.admin_sections(id);

update public.facilities
set admin_section_id = (select id from public.admin_sections where code = 'library')
where slug = 'library';

update public.app_settings
set admin_section_id = (select id from public.admin_sections where code = 'home_page')
where key = 'hero_appearance';

-- facilities: add section-based write access alongside the existing org-scope policies
drop policy "Scoped insert facilities" on public.facilities;
create policy "Scoped insert facilities" on public.facilities for insert
  with check (
    public.can_write_scoped_record(null, institute_id,
      (select d.college_id from public.departments d where d.id = facilities.department_id), department_id)
    or (admin_section_id is not null
        and public.can_write_section((select code from public.admin_sections where id = admin_section_id)))
  );

drop policy "Scoped update facilities" on public.facilities;
create policy "Scoped update facilities" on public.facilities for update
  using (
    public.can_write_scoped_record(null, institute_id,
      (select d.college_id from public.departments d where d.id = facilities.department_id), department_id)
    or (admin_section_id is not null
        and public.can_write_section((select code from public.admin_sections where id = admin_section_id)))
  )
  with check (
    public.can_write_scoped_record(null, institute_id,
      (select d.college_id from public.departments d where d.id = facilities.department_id), department_id)
    or (admin_section_id is not null
        and public.can_write_section((select code from public.admin_sections where id = admin_section_id)))
  );

drop policy "Scoped delete facilities" on public.facilities;
create policy "Scoped delete facilities" on public.facilities for delete
  using (
    public.can_write_scoped_record(null, institute_id,
      (select d.college_id from public.departments d where d.id = facilities.department_id), department_id)
    or (admin_section_id is not null
        and public.can_write_section((select code from public.admin_sections where id = admin_section_id)))
  );

-- app_settings: add section-based write access alongside the existing global-admin-only policy
drop policy "Global admins can write app_settings" on public.app_settings;
create policy "Global admins can write app_settings" on public.app_settings for all
  using (
    public.is_global_admin()
    or (admin_section_id is not null
        and public.can_write_section((select code from public.admin_sections where id = admin_section_id)))
  )
  with check (
    public.is_global_admin()
    or (admin_section_id is not null
        and public.can_write_section((select code from public.admin_sections where id = admin_section_id)))
  );
