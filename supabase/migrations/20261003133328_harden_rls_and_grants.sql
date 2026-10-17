-- Phase 1 of the SYSTEM_MAP.md broken-items fix plan: tighten RLS policies and
-- function grants that were found wide open (any authenticated user, or even
-- anon, instead of the scope-aware checks every sibling table already uses).
-- See docs/architecture/SYSTEM_MAP.md "Gaps (master list) > Broken" for the
-- audit evidence behind each change below.

-- ── trusts: top-level table had no role check at all ────────────────────
-- Was: USING (true) / WITH CHECK (true) for any authenticated user.
-- Trusts have no higher scope to check against, so global-admin-only is the
-- correct replacement (matches how institutes treat their own top scope).
DROP POLICY IF EXISTS "Auth CRUD" ON public.trusts;

CREATE POLICY "Global admin CRUD trusts" ON public.trusts
  FOR ALL
  USING (is_global_admin())
  WITH CHECK (is_global_admin());

-- ── staff_profiles: INSERT had no check at all (WITH CHECK (true)) ───────
-- UPDATE/DELETE on this table already require created_by = self, OR a
-- global role, OR a scoped role via an existing department assignment. A
-- brand-new staff row has no assignment yet, so INSERT instead requires the
-- inserting user to hold SOME published admin role (global or scoped).
DROP POLICY IF EXISTS "Scoped insert staff_profiles" ON public.staff_profiles;

CREATE POLICY "Scoped insert staff_profiles" ON public.staff_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    is_global_admin()
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.status = 'published'
        AND ur.deleted_at IS NULL
    )
  );

-- ── scholarships: write policy hardcoded a literal role code ─────────────
-- Was: r.code = 'admin', which silently excludes any other global-admin
-- role code and ignores section grants entirely, unlike every sibling
-- table in the About/Campus/Admissions domain (e.g. accreditations, mous).
DROP POLICY IF EXISTS "Admins can manage scholarships" ON public.scholarships;

CREATE POLICY "Global write scholarships" ON public.scholarships
  FOR ALL
  TO authenticated
  USING (is_global_admin() OR can_write_section('admissions'::text))
  WITH CHECK (is_global_admin() OR can_write_section('admissions'::text));

-- ── RBAC lookup tables: SELECT was USING (true) for any authenticated ────
-- user. These are only ever read from /admin/user-management, which is
-- already global-only (assertGlobalAdmin() in actions.ts), so scoping the
-- read to global admins matches actual usage with no legitimate breakage.
DROP POLICY IF EXISTS "roles_select" ON public.roles;
CREATE POLICY "Global admin read roles" ON public.roles
  FOR SELECT TO authenticated USING (is_global_admin());

DROP POLICY IF EXISTS "Authenticated read permissions" ON public.permissions;
CREATE POLICY "Global admin read permissions" ON public.permissions
  FOR SELECT TO authenticated USING (is_global_admin());

DROP POLICY IF EXISTS "Authenticated read role_permissions" ON public.role_permissions;
CREATE POLICY "Global admin read role_permissions" ON public.role_permissions
  FOR SELECT TO authenticated USING (is_global_admin());

DROP POLICY IF EXISTS "Authenticated read admin_sections" ON public.admin_sections;
CREATE POLICY "Global admin read admin_sections" ON public.admin_sections
  FOR SELECT TO authenticated USING (is_global_admin());

DROP POLICY IF EXISTS "Authenticated read user_section_grants" ON public.user_section_grants;
CREATE POLICY "Global admin read user_section_grants" ON public.user_section_grants
  FOR SELECT TO authenticated USING (is_global_admin());

-- ── get_table_schema_info: granted to PUBLIC, so anon could call it ──────
-- regardless of any per-role revoke. Only the authenticated admin UI
-- (AdminCrudManager.tsx) needs this.
REVOKE EXECUTE ON FUNCTION public.get_table_schema_info(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_table_schema_info(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_table_schema_info(text) TO authenticated;

-- ── courses: audit columns had no FK constraint ──────────────────────────
-- Confirmed live: no orphaned values, safe to add straight away.
ALTER TABLE public.courses
  ADD CONSTRAINT courses_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id),
  ADD CONSTRAINT courses_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id),
  ADD CONSTRAINT courses_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id);

-- ── centers: slug had no UNIQUE constraint ────────────────────────────────
-- Confirmed live: zero duplicate slugs today, safe to add.
ALTER TABLE public.centers
  ADD CONSTRAINT unique_centers_slug UNIQUE (slug);
