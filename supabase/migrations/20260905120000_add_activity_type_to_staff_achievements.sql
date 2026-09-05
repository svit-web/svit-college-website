-- Add 'activity' as a valid staff_achievements.type value to support importing
-- legacy academic activities (workshops organized/attended, FDPs, seminars) that
-- don't fit award/patent/publication/research/qualification/experience.
ALTER TABLE staff_achievements DROP CONSTRAINT staff_achievements_type_check;
ALTER TABLE staff_achievements ADD CONSTRAINT staff_achievements_type_check
  CHECK (type = ANY (ARRAY['award'::text, 'patent'::text, 'publication'::text, 'research'::text, 'qualification'::text, 'experience'::text, 'activity'::text]));
