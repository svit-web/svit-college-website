-- Seed placement_statistics table
-- Run order: 07
-- Data source: src/data/placement.ts

-- ============================================
-- PLACEMENT STATISTICS
-- ============================================

DO $$
DECLARE
  v_svit_id uuid;
  v_svica_id uuid;
  v_svion_id uuid;
  v_coa_id uuid;
BEGIN
  -- Get college IDs
  SELECT id INTO v_svit_id FROM colleges WHERE slug = 'svit';
  SELECT id INTO v_svica_id FROM colleges WHERE slug = 'svica';
  SELECT id INTO v_svion_id FROM colleges WHERE slug = 'svion';
  SELECT id INTO v_coa_id FROM colleges WHERE slug = 'svit-coa';

  -- SVIT Placement Statistics
  INSERT INTO placement_statistics (college_id, academic_year, students_registered, students_placed, placement_percentage, highest_package_inr, average_package_inr, median_package_inr, companies_visited, sort_order, metadata, status) VALUES
  (v_svit_id, '2020-2021', 185, 152, 82.16, 4200000, 430000, 400000, 120, 1, '{"legacy_year": "2020"}'::jsonb, 'published'),
  (v_svit_id, '2021-2022', 197, 168, 85.28, 4500000, 450000, 420000, 140, 2, '{"legacy_year": "2021"}'::jsonb, 'published'),
  (v_svit_id, '2022-2023', 201, 175, 87.06, 3800000, 435000, 410000, 160, 3, '{"legacy_year": "2022"}'::jsonb, 'published'),
  (v_svit_id, '2023-2024', 204, 180, 88.24, 3900000, 425000, 400000, 180, 4, '{"legacy_year": "2023"}'::jsonb, 'published'),
  (v_svit_id, '2024-2025', 214, 195, 91.12, 4000000, 430000, 405000, 190, 5, '{"legacy_year": "2024"}'::jsonb, 'published'),
  (v_svit_id, '2025-2026', 226, 211, 93.36, 4200000, 430000, 410000, 200, 6, '{"legacy_year": "2025"}'::jsonb, 'published');

  -- SVION Placement Statistics
  INSERT INTO placement_statistics (college_id, academic_year, students_registered, students_placed, placement_percentage, highest_package_inr, average_package_inr, median_package_inr, companies_visited, sort_order, metadata, status) VALUES
  (v_svion_id, '2022-2023', 47, 40, 85.11, 600000, 320000, 310000, 30, 1, '{"legacy_year": "2022"}'::jsonb, 'published'),
  (v_svion_id, '2023-2024', 55, 48, 87.27, 620000, 325000, 315000, 35, 2, '{"legacy_year": "2023"}'::jsonb, 'published'),
  (v_svion_id, '2024-2025', 61, 55, 90.16, 600000, 320000, 315000, 38, 3, '{"legacy_year": "2024"}'::jsonb, 'published'),
  (v_svion_id, '2025-2026', 67, 62, 92.54, 600000, 320000, 320000, 40, 4, '{"legacy_year": "2025"}'::jsonb, 'published');

  -- SVICA Placement Statistics
  INSERT INTO placement_statistics (college_id, academic_year, students_registered, students_placed, placement_percentage, highest_package_inr, average_package_inr, median_package_inr, companies_visited, sort_order, metadata, status) VALUES
  (v_svica_id, '2022-2023', 68, 55, 80.88, 1200000, 390000, 370000, 45, 1, '{"legacy_year": "2022"}'::jsonb, 'published'),
  (v_svica_id, '2023-2024', 74, 62, 83.78, 1150000, 385000, 375000, 50, 2, '{"legacy_year": "2023"}'::jsonb, 'published'),
  (v_svica_id, '2024-2025', 80, 70, 87.50, 1180000, 390000, 380000, 55, 3, '{"legacy_year": "2024"}'::jsonb, 'published'),
  (v_svica_id, '2025-2026', 86, 78, 90.70, 1200000, 390000, 385000, 60, 4, '{"legacy_year": "2025"}'::jsonb, 'published');

  -- COA Placement Statistics
  INSERT INTO placement_statistics (college_id, academic_year, students_registered, students_placed, placement_percentage, highest_package_inr, average_package_inr, median_package_inr, companies_visited, sort_order, metadata, status) VALUES
  (v_coa_id, '2022-2023', 28, 22, 78.57, 900000, 380000, 365000, 18, 1, '{"legacy_year": "2022"}'::jsonb, 'published'),
  (v_coa_id, '2023-2024', 31, 26, 83.87, 920000, 375000, 370000, 20, 2, '{"legacy_year": "2023"}'::jsonb, 'published'),
  (v_coa_id, '2024-2025', 34, 30, 88.24, 900000, 380000, 375000, 22, 3, '{"legacy_year": "2024"}'::jsonb, 'published'),
  (v_coa_id, '2025-2026', 38, 34, 89.47, 900000, 380000, 375000, 25, 4, '{"legacy_year": "2025"}'::jsonb, 'published');

END $$;
