-- Phase 4 of the Entry model (docs/adr/0001-entry-card-photo-and-album.md):
-- move facility / centre photos out of per-table jsonb shapes into the shared
-- Card photo column (card_photo_url) and Entry album (album_id -> gallery_albums).
--
-- Sources (read from live on 2026-09-23):
--   * 37 labs with metadata.images[] (every one has exactly 1 image)
--   * 1 lab with metadata.imageUrl (airplane-lab, soft-deleted, migrated anyway
--     so a restore from Trash keeps its photo)
--   * the library (facilities.slug='library') metadata.gallery.images[] (3 photos)
--   * centers.metadata.gallery.images[] (NSS/NCC: 0 photos live today; handled
--     generically in section 3 in case photos are added before this is applied)
--
-- Rule: the FIRST photo becomes card_photo_url. Only when there are more photos
-- is an Entry album created (owner_table set, show_in_public_gallery=false) and
-- the remaining photos inserted as gallery_media with increasing sort_order.
--
-- Idempotent: every statement is guarded (card_photo_url IS NULL / album_id IS
-- NULL / NOT EXISTS), so re-running is a no-op. The old metadata keys are left
-- in place (nothing reads them any more); see the optional cleanup at the end.

BEGIN;

-- ─── 1. Labs: single photo -> card_photo_url ───────────────────────────────
UPDATE public.facilities AS f
SET card_photo_url = v.url
FROM (
  VALUES
  ('d317f6e7-5e2f-4780-93eb-cd6a109d17dd'::uuid, 'https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/images/1788157598632-mp2zsj.webp'), -- AE / airplane-lab (soft-deleted, from metadata.imageUrl)
  ('d797733c-b9fe-4266-a136-9c27c7677cf9'::uuid, 'https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/facilities/d797733c-b9fe-4266-a136-9c27c7677cf9.png'), -- AE / lab-aircraft-control-and-navigation-lab-inf103
  ('9900cb2f-8128-4f5e-870f-f424f3786ed9'::uuid, 'https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/facilities/9900cb2f-8128-4f5e-870f-f424f3786ed9.jpg'), -- ASH01 / lab-language-lab-1-and-lab2-inf68
  ('a390ddf9-7134-4ce3-bbc9-bba889343990'::uuid, 'https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/facilities/a390ddf9-7134-4ce3-bbc9-bba889343990.jpg'), -- ASH01 / lab-physics-lab-inf70
  ('be2490bf-0bc9-49a8-8565-58123c9b03cc'::uuid, 'https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/facilities/be2490bf-0bc9-49a8-8565-58123c9b03cc.jpeg'), -- CA / lab-computer-lab-second-floor-inf109
  ('c3765b5b-4e80-4e80-b922-643ae906c31d'::uuid, 'https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/facilities/c3765b5b-4e80-4e80-b922-643ae906c31d.jpg'), -- CA / lab-library-inf110
  ('c1e8f3d8-c145-46b6-a1b6-8ccc9fbb66e4'::uuid, 'https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/facilities/c1e8f3d8-c145-46b6-a1b6-8ccc9fbb66e4.jpeg'), -- CA / lab-smart-classroom-inf108
  ('861969c9-1049-46f6-8d53-17e9e44a070a'::uuid, 'https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/facilities/861969c9-1049-46f6-8d53-17e9e44a070a.jpg'), -- CE / lab-database-management-system-lab-inf50
  ('80a63bb6-2776-4bbe-8ec8-d125ed8dfbb7'::uuid, 'https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/facilities/80a63bb6-2776-4bbe-8ec8-d125ed8dfbb7.jpg'), -- CE / lab-me-lab-inf57
  ('7faeb897-e1e8-4cf1-8e33-05f38708ca10'::uuid, 'https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/facilities/7faeb897-e1e8-4cf1-8e33-05f38708ca10.jpg'), -- CE / lab-research-development-lab-inf56
  ('2d5dce5c-abb7-4d5c-a4ad-3dad7859e61c'::uuid, 'https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/facilities/2d5dce5c-abb7-4d5c-a4ad-3dad7859e61c.jpg'), -- CE / lab-software-engineering-lab-inf51
  ('924a6826-b2bf-4f87-b085-b35d3e9018f3'::uuid, 'https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/facilities/924a6826-b2bf-4f87-b085-b35d3e9018f3.jpg'), -- CE / lab-web-programming-laboratory-inf53
  ('212b6a7e-77ae-4e32-92c2-53b5a841b785'::uuid, 'https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/facilities/212b6a7e-77ae-4e32-92c2-53b5a841b785.png'), -- CIV / lab-computer-lab-inf39
  ('55cec289-9b41-4ae0-b1ec-5a0b8e97ef9a'::uuid, 'https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/facilities/55cec289-9b41-4ae0-b1ec-5a0b8e97ef9a.png'), -- EC / lab-communication-system-lab-1-inf76
  ('1af3bf1a-ec73-4760-8d48-4fc3f43ff96d'::uuid, 'https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/facilities/1af3bf1a-ec73-4760-8d48-4fc3f43ff96d.png'), -- EC / lab-communication-system-lab-2-inf92
  ('a21dacc2-097e-47ba-9fc9-d32605594ab3'::uuid, 'https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/facilities/a21dacc2-097e-47ba-9fc9-d32605594ab3.png'), -- EC / lab-electronic-circuits-lab-1-inf77
  ('3fe60cbb-6e0c-4826-8436-4c64224124fe'::uuid, 'https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/facilities/3fe60cbb-6e0c-4826-8436-4c64224124fe.jpg'), -- EC / lab-electronic-circuits-lab-2-inf78
  ('eebe7a8b-2755-49c8-a619-f0a0c796840b'::uuid, 'https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/facilities/eebe7a8b-2755-49c8-a619-f0a0c796840b.jpg'), -- EC / lab-microwave-devices-antenna-lab-inf75
  ('30d05dfd-90ab-439e-9ca7-9f9c24aa795f'::uuid, 'https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/facilities/30d05dfd-90ab-439e-9ca7-9f9c24aa795f.jpg'), -- EC / lab-pcb-lab-modrob-inf74
  ('19b549bf-6d86-4712-b921-797cec0b5e70'::uuid, 'https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/facilities/19b549bf-6d86-4712-b921-797cec0b5e70.png'), -- EC / lab-pg-research-lab-inf91
  ('0b73762b-95b4-4bce-a082-51f06e44e0cd'::uuid, 'https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/facilities/0b73762b-95b4-4bce-a082-51f06e44e0cd.jpg'), -- EC / lab-switching-and-digital-lab-inf79
  ('afc2d522-6c9b-4f44-8460-783b33969a54'::uuid, 'https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/facilities/afc2d522-6c9b-4f44-8460-783b33969a54.jpg'), -- EE / lab-basic-electrical-engineering-lab-i-inf25
  ('68c032c3-f6be-49f0-aeaf-94731a0813bd'::uuid, 'https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/facilities/68c032c3-f6be-49f0-aeaf-94731a0813bd.jpg'), -- EE / lab-basic-electrical-engineering-lab-ii-inf107
  ('fe0bf039-5da0-46f8-8b0c-1f015f3bf62d'::uuid, 'https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/facilities/fe0bf039-5da0-46f8-8b0c-1f015f3bf62d.jpg'), -- EE / lab-electrical-measurement-lab-inf26
  ('aab8a19e-d0a4-4f61-8a28-3da44b401680'::uuid, 'https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/facilities/aab8a19e-d0a4-4f61-8a28-3da44b401680.png'), -- EE / lab-microprocessor-lab-inf29
  ('17c044b8-c2f0-4076-bffd-5fcec1eb0eaa'::uuid, 'https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/facilities/17c044b8-c2f0-4076-bffd-5fcec1eb0eaa.png'), -- EE / lab-seminar-hall-inf36
  ('b116e27c-dc46-4111-b858-ae17069838b0'::uuid, 'https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/facilities/b116e27c-dc46-4111-b858-ae17069838b0.png'), -- EE / lab-simulation-lab-i-inf33
  ('c9bd3e8a-7384-46d6-a0aa-3c649f17a2d9'::uuid, 'https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/facilities/c9bd3e8a-7384-46d6-a0aa-3c649f17a2d9.png'), -- GN / lab-nursing-2-inf106
  ('a795eaeb-2af7-4dc2-9c53-0fb3d521f89f'::uuid, 'https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/facilities/a795eaeb-2af7-4dc2-9c53-0fb3d521f89f.jpg'), -- IT / lab-artificial-intelligence-lab-inf65
  ('db760ae6-e7c6-4908-9fcc-4c85fb6007c6'::uuid, 'https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/facilities/db760ae6-e7c6-4908-9fcc-4c85fb6007c6.jpg'), -- IT / lab-operating-system-lab-inf61
  ('5e0c9192-544e-4d7b-b4e8-c7e50cdca651'::uuid, 'https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/facilities/5e0c9192-544e-4d7b-b4e8-c7e50cdca651.jpg'), -- IT / lab-programming-lab-inf58
  ('3f76b3c6-1c32-495e-b349-aa41372bc9ed'::uuid, 'https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/facilities/3f76b3c6-1c32-495e-b349-aa41372bc9ed.png'), -- IT / lab-research-development-lab-inf66
  ('9372da1f-a1de-4c2a-9d87-e80122f8d7ba'::uuid, 'https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/facilities/9372da1f-a1de-4c2a-9d87-e80122f8d7ba.png'), -- MBA / lab-mba-1-inf111
  ('7d5f7531-525f-4075-84fc-f076718c094a'::uuid, 'https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/facilities/7d5f7531-525f-4075-84fc-f076718c094a.png'), -- MBA / lab-mba-2-inf112
  ('3634ebcc-5747-472b-8a3e-373ec673edeb'::uuid, 'https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/facilities/3634ebcc-5747-472b-8a3e-373ec673edeb.png'), -- ME / lab-dynamic-balancing-machine-modrob-scheme-inf97
  ('7f5b5000-b14f-4b9c-97a0-89e6da9cb7e1'::uuid, 'https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/facilities/7f5b5000-b14f-4b9c-97a0-89e6da9cb7e1.png'), -- ME / lab-machine-tool-inf95
  ('3723a847-5540-4e18-b0dd-8d3dc70c6e0d'::uuid, 'https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/facilities/3723a847-5540-4e18-b0dd-8d3dc70c6e0d.png'), -- ME / lab-renewable-energy-engineering-inf96
  ('1c8f3f2d-aabc-4161-9930-56e8204a8b61'::uuid, 'https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/facilities/1c8f3f2d-aabc-4161-9930-56e8204a8b61.png')  -- ME / lab-surface-engineering-inf94
) AS v(id, url)
WHERE f.id = v.id
  AND f.facility_type = 'laboratory'
  AND f.card_photo_url IS NULL;

-- ─── 2. Library (facilities b1548e6e…, slug 'library'): 3 photos ───────────
-- Photo 1 -> card_photo_url; photos 2-3 -> Entry album d9aa8cb6….
UPDATE public.facilities
SET card_photo_url = 'https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/images/1788253461494-042k6y.webp'
WHERE id = 'b1548e6e-47e8-4cb5-a9db-3d1d9d7d4ef9'
  AND card_photo_url IS NULL;

INSERT INTO public.gallery_albums
  (id, scope_type, title, slug, owner_table, show_in_public_gallery, status)
SELECT
  'd9aa8cb6-c10b-436b-8038-e0976686f79e', 'global', 'Central Library', 'facility-central-library',
  'facilities', false, 'published'
WHERE NOT EXISTS (
    SELECT 1 FROM public.gallery_albums WHERE id = 'd9aa8cb6-c10b-436b-8038-e0976686f79e'
  )
  -- Don't create a second album if an admin already gave the library one.
  AND EXISTS (
    SELECT 1 FROM public.facilities
    WHERE id = 'b1548e6e-47e8-4cb5-a9db-3d1d9d7d4ef9' AND album_id IS NULL
  );

UPDATE public.facilities
SET album_id = 'd9aa8cb6-c10b-436b-8038-e0976686f79e'
WHERE id = 'b1548e6e-47e8-4cb5-a9db-3d1d9d7d4ef9'
  AND album_id IS NULL
  AND EXISTS (SELECT 1 FROM public.gallery_albums WHERE id = 'd9aa8cb6-c10b-436b-8038-e0976686f79e');

-- gallery_media ids reuse the ids the photos already had in metadata.gallery.images[].
INSERT INTO public.gallery_media (id, album_id, media_type, url, sort_order, status)
SELECT v.id, 'd9aa8cb6-c10b-436b-8038-e0976686f79e', 'image', v.url, v.sort_order, 'published'
FROM (
  VALUES
  ('b55756b7-1aad-4139-9ad9-e808d702face'::uuid, 'https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/images/1788253477953-o6qrek.webp', 1),
  ('a07a78f3-9ade-42b1-bc50-d768f61594ab'::uuid, 'https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/images/1788253487573-gfrm5u.webp', 2)
) AS v(id, url, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.gallery_media m WHERE m.id = v.id)
  AND EXISTS (
    SELECT 1 FROM public.facilities
    WHERE id = 'b1548e6e-47e8-4cb5-a9db-3d1d9d7d4ef9'
      AND album_id = 'd9aa8cb6-c10b-436b-8038-e0976686f79e'
  );

-- ─── 3. Centres (NSS/NCC and any other centre) metadata.gallery.images[] ───
-- Live has 0 centre photos today, so this section changes nothing when applied
-- now. It is written set-based (not literal) so photos added via the old
-- /admin/nss-ncc page before this is applied are still carried over.
-- 3a. First photo -> card_photo_url.
UPDATE public.centers
SET card_photo_url = metadata #>> '{gallery,images,0,url}'
WHERE card_photo_url IS NULL
  AND coalesce(metadata #>> '{gallery,images,0,url}', '') <> '';

-- 3b. One album per centre that has 2+ photos and no album yet. The album id is
-- derived deterministically from the centre id (md5 -> uuid) so a re-run finds it.
INSERT INTO public.gallery_albums
  (id, scope_type, title, slug, owner_table, show_in_public_gallery, status)
SELECT
  md5('centers-album-' || c.id::text)::uuid, 'global', c.name,
  'centre-' || c.slug || '-' || left(c.id::text, 8), 'centers', false, 'published'
FROM public.centers c
WHERE c.album_id IS NULL
  AND jsonb_typeof(c.metadata #> '{gallery,images}') = 'array'
  AND jsonb_array_length(c.metadata #> '{gallery,images}') > 1
  AND NOT EXISTS (
    SELECT 1 FROM public.gallery_albums a WHERE a.id = md5('centers-album-' || c.id::text)::uuid
  );

UPDATE public.centers c
SET album_id = md5('centers-album-' || c.id::text)::uuid
WHERE c.album_id IS NULL
  AND EXISTS (
    SELECT 1 FROM public.gallery_albums a WHERE a.id = md5('centers-album-' || c.id::text)::uuid
  );

-- 3c. Photos 2..n -> gallery_media (sort_order 1..n-1), skipping any already copied.
INSERT INTO public.gallery_media (album_id, media_type, url, sort_order, status)
SELECT c.album_id, 'image', img.value ->> 'url', (img.ordinality - 1)::int, 'published'
FROM public.centers c
CROSS JOIN LATERAL jsonb_array_elements(c.metadata #> '{gallery,images}') WITH ORDINALITY AS img(value, ordinality)
WHERE c.album_id = md5('centers-album-' || c.id::text)::uuid
  AND jsonb_typeof(c.metadata #> '{gallery,images}') = 'array'
  AND img.ordinality > 1
  AND coalesce(img.value ->> 'url', '') <> ''
  AND NOT EXISTS (
    SELECT 1 FROM public.gallery_media m
    WHERE m.album_id = c.album_id AND m.url = img.value ->> 'url'
  );

COMMIT;

-- ─── Optional follow-up (NOT run by this migration) ────────────────────────
-- Once the new pages are verified, the now-unused jsonb keys can be dropped.
-- A full copy of every facilities/centers row is in
-- docs/backups/2026-09-23-entry-model/{facilities,centers}.json.
--
-- UPDATE public.facilities SET metadata = metadata - 'images' - 'imageUrl'
--   WHERE metadata ?| array['images', 'imageUrl'];
-- UPDATE public.facilities SET metadata = metadata - 'gallery' WHERE metadata ? 'gallery';
-- UPDATE public.centers    SET metadata = metadata - 'gallery' WHERE metadata ? 'gallery';
