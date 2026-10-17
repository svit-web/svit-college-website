-- staff-photos bucket already holds 273 legacy staff photo objects (bulk-imported via
-- service-role script), but had no RLS write policy, so no authenticated admin upload
-- could ever write a new photo there. Mirror the 'media' bucket's write policies so the
-- intended upload path (Staff Wizard photo uploader) can actually write into it.
create policy "Allow authenticated insert on staff-photos bucket" on storage.objects for insert
  with check (bucket_id = 'staff-photos' and auth.role() = 'authenticated');

create policy "Allow owner or global admin update on staff-photos bucket" on storage.objects for update
  using (bucket_id = 'staff-photos' and (owner = auth.uid() or is_global_admin()));

create policy "Allow owner or global admin delete on staff-photos bucket" on storage.objects for delete
  using (bucket_id = 'staff-photos' and (owner = auth.uid() or is_global_admin()));

create policy "Allow public read on staff-photos bucket" on storage.objects for select
  using (bucket_id = 'staff-photos');
