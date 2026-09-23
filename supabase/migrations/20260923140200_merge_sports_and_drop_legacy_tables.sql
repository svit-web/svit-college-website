-- =============================================================================
-- Entry model, part 3 of 3: one-time data merges and table drops.
--   H. sports_achievements (5 rows) -> achievements (category 'sports')
--   I. facilities with category 'sports' (10 rows) -> sports; source rows soft-deleted
--   K. DROP testimonials
--   L. DROP club_events, department_activities, sports_achievements
--
-- Requires part 1 (achievements.card_photo_url, 'sports' category, sports.status enum).
-- Literal values were read from the live DB on 2026-09-23. All rows are also in
-- docs/backups/2026-09-23-entry-model/*.json. Inserts are guarded with NOT EXISTS
-- so a re-run doesn't duplicate them.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- H. sports_achievements -> achievements
--    category='sports', scope_type='global' (department_id/college_id NULL satisfies
--    check_content_scope), status 'published' (all 5 are published + is_active),
--    date <- achievement_date, card_photo_url <- image_url (all 5 NULL live),
--    created_at preserved, audit *_by left NULL (NULL live too).
--    Fields achievements has no column for (sport, level, position, sort_order,
--    source id) go into metadata.
--    Slugs: 'sports-<sport>-<slugified title>-<year>'. None collide with existing
--    achievements slugs (unique_achievement_slug_global, department_id IS NULL).
-- -----------------------------------------------------------------------------
INSERT INTO public.achievements
  (scope_type, title, slug, description, date, category, card_photo_url, status, created_at, metadata)
SELECT v.scope_type::public.scope_level, v.title, v.slug, v.description, v.date::date, 'sports',
       NULL, 'published'::public.content_status, v.created_at::timestamptz, v.metadata::jsonb
FROM (VALUES
  ('global',
   'GTU Inter-University Champions',
   'sports-kabaddi-gtu-inter-university-champions-2024',
   'SVIT Kabaddi team clinched the GTU Inter-University gold, defeating 24 teams in the knockout rounds.',
   '2024-02-10', '2026-07-29 05:56:35.315043+00',
   '{"migrated_from":"sports_achievements","legacy_id":"480555d7-3a07-49ef-93cc-e8eec7fa4576","sport_id":"eccde3d3-1a90-4df4-8fbe-487e46f22d78","sport_slug":"kabaddi","level":"university","position":"1st Place","sort_order":10}'),
  ('global',
   'State-Level Cricket Runner-up',
   'sports-cricket-state-level-cricket-runner-up-2023',
   'Cricket team finished runners-up at the Gujarat State Inter-Engineering College Cricket Tournament 2023.',
   '2023-11-20', '2026-07-29 05:56:35.315043+00',
   '{"migrated_from":"sports_achievements","legacy_id":"c38e1309-0af3-4b43-8b2a-d267bba887b2","sport_id":"55a3bece-5191-422d-8c15-f8a9133887cd","sport_slug":"cricket","level":"state","position":"Runner-up","sort_order":20}'),
  ('global',
   'AICTE Chess Championship – Bronze',
   'sports-chess-aicte-chess-championship-bronze-2024',
   'Individual chess player secured bronze at the All-India AICTE Chess Championship held in Pune.',
   '2024-01-15', '2026-07-29 05:56:35.315043+00',
   '{"migrated_from":"sports_achievements","legacy_id":"4243f7ce-8ff4-4b7a-940b-85b56c5d5d3b","sport_id":"504f744b-6b8a-4974-bad3-dfa17874d9be","sport_slug":"chess","level":"national","position":"Bronze","sort_order":30}'),
  ('global',
   'GTU Football Zone Champions',
   'sports-football-gtu-football-zone-champions-2023',
   'Football team won the GTU Ahmedabad Zone championship and qualified for the national inter-university meet.',
   '2023-09-05', '2026-07-29 05:56:35.315043+00',
   '{"migrated_from":"sports_achievements","legacy_id":"95a06018-6271-4401-9105-f04cc9747bce","sport_id":"a00b009c-9698-413d-afad-77adda28126e","sport_slug":"football","level":"university","position":"1st Place","sort_order":40}'),
  ('global',
   'Volleyball State Runners-up',
   'sports-volleyball-volleyball-state-runners-up-2024',
   'Men''s volleyball team represented north Gujarat and finished runners-up at the state inter-engineering games.',
   '2024-03-12', '2026-07-29 05:56:35.315043+00',
   '{"migrated_from":"sports_achievements","legacy_id":"d2077f84-b5f2-4d6b-bd73-138b7a162560","sport_id":"06d6dc8c-2f3e-4a6b-86c4-a1a8a0e0cc3e","sport_slug":"volleyball","level":"state","position":"Runner-up","sort_order":50}')
) AS v(scope_type, title, slug, description, date, created_at, metadata)
WHERE NOT EXISTS (
  SELECT 1 FROM public.achievements a
  WHERE a.slug = v.slug AND a.department_id IS NULL
);

-- -----------------------------------------------------------------------------
-- I. Sports facilities -> sports.
--    Live facilities with category='sports' (all department_id NULL, published):
--      e794fe27… badminton      -> exists in sports (badminton)
--      606f0688… basketball     -> exists (basketball)
--      ff797a6f… carrom         -> NEW
--      913cb497… chess          -> exists (chess)
--      fabd1521… cricket        -> exists (cricket)
--      aa808998… football       -> exists (football)
--      db3109fa… pickle         -> NEW (sports slug 'pickleball')
--      d06fe16c… table-tennis   -> exists (table-tennis)
--      32c4dfea… volley         -> exists (volleyball)
--      a490d63f… weightlifting  -> NEW
--    sports athletics/kabaddi/kho-kho have no facility counterpart: untouched.
--
--    New sports rows use the sport's name (like the existing "Badminton", not the
--    venue name "Carrom Room"). The venue name, subtitle, highlights and source id
--    are kept in metadata. Category follows the existing indoor/outdoor split.
--    sort_order continues after the current max (100).
-- -----------------------------------------------------------------------------
INSERT INTO public.sports (name, slug, category, description, is_active, sort_order, status, metadata)
SELECT v.name, v.slug, v.category, v.description, true, v.sort_order,
       'published'::public.content_status, v.metadata::jsonb
FROM (VALUES
  ('Carrom', 'carrom', 'indoor',
   'Recreational carrom lounge for informal play between classes and during hostel evenings.',
   110,
   '{"migrated_from":"facilities","legacy_facility_id":"ff797a6f-0c4e-43ec-8c54-2377c9d48e66","legacy_facility_slug":"carrom","venue_name":"Carrom Room","subtitle":"Recreational lounge","highlights":[{"title":"Multiple boards","description":"Concurrent play for many students."},{"title":"Casual play","description":"Open access during college hours."},{"title":"Tournaments","description":"Inter-department tournaments during Sportlon."},{"title":"Equipment","description":"Boards, strikers and coins managed by sports room."}]}'),
  ('Pickleball', 'pickleball', 'outdoor',
   'Dedicated pickleball court supporting the fastest-growing racquet sport on campus.',
   120,
   '{"migrated_from":"facilities","legacy_facility_id":"db3109fa-ff72-4784-829f-a1e2faf7bac5","legacy_facility_slug":"pickle","venue_name":"Pickleball Court","subtitle":"Fast-growing racquet sport","highlights":[{"title":"Regulation court","description":"Standard court markings and net."},{"title":"Beginner-friendly","description":"Easy to pick up for new players."},{"title":"Equipment","description":"Paddles and balls available."},{"title":"Growing community","description":"Weekly informal meets."}]}'),
  ('Weightlifting', 'weightlifting', 'indoor',
   'Campus gym with weightlifting, cardio and functional-training equipment supervised by trained staff.',
   130,
   '{"migrated_from":"facilities","legacy_facility_id":"a490d63f-e087-4d1f-8574-a0b607fcfed2","legacy_facility_slug":"weightlifting","venue_name":"Weightlifting & Gym","subtitle":"Strength & conditioning","highlights":[{"title":"Full range","description":"Free weights, machines and cardio equipment."},{"title":"Supervised","description":"Trained instructors on floor during peak hours."},{"title":"Structured plans","description":"Beginner-to-advanced training routines."},{"title":"Safety","description":"Safety protocols and spotters for heavy lifts."}]}')
) AS v(name, slug, category, description, sort_order, metadata)
WHERE NOT EXISTS (SELECT 1 FROM public.sports s WHERE s.slug = v.slug);

-- Soft-delete all 10 sports facilities (redundant or now moved to sports).
-- facilities has no audit trigger; deleted_by stays NULL (no auth.uid() in a migration).
-- They remain restorable from /admin/trash (facilities is in the Trash list).
UPDATE public.facilities
SET deleted_at = timezone('utc'::text, now())
WHERE deleted_at IS NULL
  AND category = 'sports'
  AND department_id IS NULL
  AND id IN (
    'e794fe27-d5dd-41e3-bd83-78d606993471', -- badminton
    '606f0688-11a0-4d55-8522-2ed4cc3ad4c4', -- basketball
    'ff797a6f-0c4e-43ec-8c54-2377c9d48e66', -- carrom
    '913cb497-c589-41e7-a039-ce1f441203f3', -- chess
    'fabd1521-8992-49b7-97bd-44fba9583c72', -- cricket
    'aa808998-e696-45c7-a1b1-a11aed579b85', -- football
    'db3109fa-ff72-4784-829f-a1e2faf7bac5', -- pickle
    'd06fe16c-725d-4627-9b45-cfe87910a6cc', -- table-tennis
    '32c4dfea-abec-449d-ba2a-500ed98c7974', -- volley
    'a490d63f-e087-4d1f-8574-a0b607fcfed2'  -- weightlifting
  );

-- -----------------------------------------------------------------------------
-- K. testimonials: data exported to
--    docs/backups/2026-09-23-entry-model/testimonials-export.md (+ testimonials.json).
--    No FK points into it; its trigger update_testimonials_modtime is dropped with
--    the table. The shared update_updated_at_column() function stays.
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS public.testimonials;

-- -----------------------------------------------------------------------------
-- L. Merged-away tables. Re-checked live 2026-09-23 (all rows backed up):
--    club_events (6): "drone event ", "sdfghjk", "frtyuio", "qwertyui" (deleted),
--      " gdg event" (description "wertdyujkdzfghj"), "test activity" (keyboard mash).
--      All test data. Their image files stay in the media bucket.
--    department_activities (3): "test visit", "test", "test".
--    sports_achievements (5): copied into achievements above.
--    No FK points into any of them (pg_constraint checked), so no CASCADE.
--    Dropping sports_achievements drops trg_sports_ach_updated_at; the function
--    update_sports_updated_at() is kept (sports still uses it).
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS public.club_events;
DROP TABLE IF EXISTS public.department_activities;
DROP TABLE IF EXISTS public.sports_achievements;
