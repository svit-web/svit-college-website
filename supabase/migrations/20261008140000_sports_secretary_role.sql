-- Sports Secretary: a dedicated admin role for managing sports content —
-- sports entries (/admin/sports) and sports-category achievements — with no
-- other write access. TS twin of the role-code gates below:
-- FULL_ACCESS_ROLE_CODES in src/lib/admin-sections.ts.

-- 1) Seeds (idempotent; roles.code / admin_sections.code are unique).
insert into public.roles (code, name)
values ('sports_secretary', 'Sports Secretary')
on conflict (code) do nothing;

insert into public.admin_sections (code, name)
values ('sports', 'Sports & Athletics')
on conflict (code) do nothing;

-- 2) is_global_admin() was role-code blind: any published global-scope
--    user_roles row counted as full global admin. Gate it to full-access
--    role codes so a section-scoped role (sports_secretary) granted at
--    global scope by mistake can never silently become a global admin.
--    Behavior-identical today — only admin/editor rows exist, and they are
--    the only codes granted at global scope.
create or replace function public.is_global_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and ur.status = 'published'
      and ur.deleted_at is null
      and ur.scope_type = 'global'
      and r.code in ('admin', 'editor')
  );
$$;

-- 3) can_write_scoped_record(): same hardening — otherwise a college-scoped
--    sports_secretary would inherit writes on every scope-governed table
--    (departments, courses, facilities, centers, ...).
create or replace function public.can_write_scoped_record(
  p_trust_id uuid default null,
  p_institute_id uuid default null,
  p_college_id uuid default null,
  p_department_id uuid default null
) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and ur.status = 'published'
      and ur.deleted_at is null
      and r.code in ('admin', 'editor', 'department_admin', 'college_admin')
      and (
        ur.scope_type = 'global'
        or (ur.scope_type = 'trust' and p_trust_id is not null and ur.trust_id = p_trust_id)
        or (ur.scope_type = 'institute' and p_institute_id is not null and ur.institute_id = p_institute_id)
        or (ur.scope_type = 'college' and p_college_id is not null and ur.college_id = p_college_id)
        or (ur.scope_type = 'department' and p_department_id is not null and ur.department_id = p_department_id)
      )
  );
$$;

-- 4) is_any_admin(): admit sports_secretary — the /admin/sports photo
--    editor inserts gallery_albums (owner_table 'sports') gated by this
--    function.
create or replace function public.is_any_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and ur.status = 'published'
      and ur.deleted_at is null
      and r.code in ('admin', 'editor', 'department_admin', 'college_admin', 'sports_secretary')
  );
$$;

-- 5) sports: add the dedicated 'sports' section branch (campus_life kept so
--    existing Campus Management grant holders lose nothing).
drop policy "Global admin write sports" on public.sports;
create policy "Global admin write sports" on public.sports for all
  using (
    public.is_global_admin()
    or public.can_write_section('campus_life')
    or public.can_write_section('sports')
  )
  with check (
    public.is_global_admin()
    or public.can_write_section('campus_life')
    or public.can_write_section('sports')
  );

-- 6) achievements: a sports-section holder may write ONLY sports-category
--    rows — WITH CHECK forces the category on insert, USING scopes
--    update/delete to sports rows.
drop policy "Global insert achievements" on public.achievements;
create policy "Global insert achievements" on public.achievements for insert
  with check (
    public.is_global_admin()
    or public.can_write_section('campus_life')
    or public.can_write_scoped_record(null::uuid, null::uuid, college_id, department_id)
    or (public.can_write_section('sports') and category = 'sports')
  );

drop policy "Global update achievements" on public.achievements;
create policy "Global update achievements" on public.achievements for update
  using (
    public.is_global_admin()
    or public.can_write_section('campus_life')
    or public.can_write_scoped_record(null::uuid, null::uuid, college_id, department_id)
    or (public.can_write_section('sports') and category = 'sports')
  )
  with check (
    public.is_global_admin()
    or public.can_write_section('campus_life')
    or public.can_write_scoped_record(null::uuid, null::uuid, college_id, department_id)
    or (public.can_write_section('sports') and category = 'sports')
  );

drop policy "Global delete achievements" on public.achievements;
create policy "Global delete achievements" on public.achievements for delete
  using (
    public.is_global_admin()
    or public.can_write_section('campus_life')
    or public.can_write_scoped_record(null::uuid, null::uuid, college_id, department_id)
    or (public.can_write_section('sports') and category = 'sports')
  );

-- 7) can_write_entry_album(): sports coverage. Without these branches a
--    sports secretary could create an album (is_any_admin) but never
--    update/delete it or its media. Covers albums owned by sports rows and
--    by sports-category achievements; existing branches unchanged.
create or replace function public.can_write_entry_album(target_album_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select target_album_id is not null and (
    public.is_global_admin()
    or public.can_write_section('campus_life')
    or exists (
      select 1
      from public.facilities f
      left join public.departments d on d.id = f.department_id
      where f.album_id = target_album_id
        and (
          public.can_write_scoped_record(null::uuid, f.institute_id, d.college_id, f.department_id)
          or (
            f.admin_section_id is not null
            and public.can_write_section(
              (select s.code from public.admin_sections s where s.id = f.admin_section_id)
            )
          )
        )
    )
    or exists (
      select 1 from public.centers c
      where c.album_id = target_album_id
        and (
          public.can_write_scoped_record(null::uuid, c.institute_id, c.college_id, null::uuid)
          or public.can_write_section('campus_life', c.institute_id, c.college_id, null::uuid)
        )
    )
    or exists (
      select 1 from public.events e
      where e.album_id = target_album_id
        and (
          public.can_write_section('news_events')
          or public.can_write_scoped_record(null::uuid, null::uuid, e.college_id, e.department_id)
        )
    )
    or exists (
      select 1 from public.posts p
      where p.album_id = target_album_id
        and public.can_write_section('news_events')
    )
    or exists (
      select 1 from public.sports sp
      where sp.album_id = target_album_id
        and public.can_write_section('sports')
    )
    or exists (
      select 1 from public.achievements a
      where a.album_id = target_album_id
        and a.category = 'sports'
        and public.can_write_section('sports')
    )
  );
$$;
