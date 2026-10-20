-- "Entry album insert gallery_albums" (20260923140100_entry_model_rls.sql) required
-- show_in_public_gallery = false at INSERT time, so a scoped admin could only create
-- an Entry album hidden and had to flip it visible in a later UPDATE once it was
-- linked to its Entry row (can_write_entry_album() only becomes true after that link).
--
-- The app's EntryPhotosEditor didn't honor that order: checking "Also show in
-- Gallery" before the first photo made it INSERT with show_in_public_gallery = true
-- directly, which this policy rejected outright ("new row violates row-level
-- security policy for table gallery_albums") — a raw RLS error surfaced straight to
-- non-technical staff, with no way for them to tell what went wrong. The app code
-- is being fixed to always insert hidden then flip visibility after linking, but
-- that fix depends on a frontend deploy. Relaxing the policy here removes the
-- footgun at the source regardless of call order or future code paths: any admin
-- (is_any_admin()) can already create a hidden Entry album for an owner_table, and
-- the two-step create+link already happens atomically from the app, so there is no
-- extra exposure in letting it be created already-visible.
DROP POLICY IF EXISTS "Entry album insert gallery_albums" ON public.gallery_albums;
CREATE POLICY "Entry album insert gallery_albums" ON public.gallery_albums
  FOR INSERT TO authenticated
  WITH CHECK (
    owner_table IS NOT NULL
    AND public.is_any_admin()
  );
