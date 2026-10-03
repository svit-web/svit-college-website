-- Phase 3 of the SYSTEM_MAP.md broken-items fix plan: the 'library'
-- admin_sections row exists but unlocks nothing — no ROUTE_SECTION_MAP
-- entry (src/lib/admin-sections.ts) and no can_write_section() clause on
-- the one table it evidently governs (downloads). Fixing only the route
-- map without this would let a library-granted scoped admin reach
-- /admin/tables/downloads but have every write silently rejected by RLS.
DROP POLICY IF EXISTS "Global write downloads" ON public.downloads;

CREATE POLICY "Global write downloads" ON public.downloads
  FOR ALL
  TO authenticated
  USING (is_global_admin() OR can_write_section('library'::text))
  WITH CHECK (is_global_admin() OR can_write_section('library'::text));
