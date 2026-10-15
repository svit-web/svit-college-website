-- The About Page editor (Leadership Messages, etc.) is now unlockable by the
-- 'about_us' admin section grant (see src/lib/admin-sections.ts), matching
-- board_members/committees/accreditations. RLS previously only let global
-- admins write to `pages` at all, so a section-scoped user's save silently
-- affected 0 rows. Scope the grant to the 'about' row only -- the Admissions
-- page editor and page creation/deletion stay global-only.
create policy "about_us section update pages"
  on public.pages
  for update
  using (slug = 'about' and can_write_section('about_us'))
  with check (slug = 'about' and can_write_section('about_us'));
