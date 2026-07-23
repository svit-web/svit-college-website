-- Seed accreditations table
-- Run order: 06
-- Data source: src/data/aboutPage.ts (accreditation.recognitions)

-- ============================================
-- ACCREDITATIONS
-- ============================================

DO $$
BEGIN
  INSERT INTO accreditations (organization, value, received_year, expiry_date, metadata, status) VALUES
  (
    'NBA (National Board of Accreditation), New Delhi',
    'Accredited',
    2020,
    NULL,
    jsonb_build_object(
      'description', 'SVIT is accredited by NBA (National Board of Accreditation), New Delhi. The NBA accreditation is a hallmark of excellence in technical education, ensuring that programs meet global standards of quality.',
      'type', 'accreditation'
    ),
    'published'
  ),
  (
    'AICTE (All India Council for Technical Education)',
    'Approved',
    1997,
    NULL,
    jsonb_build_object(
      'description', 'All programs offered by SVIT are approved by the All India Council for Technical Education (AICTE), the statutory body for technical education in India.',
      'type', 'approval',
      'document_url', '/document/aicte-approval.pdf'
    ),
    'published'
  ),
  (
    'GTU (Gujarat Technological University)',
    'Affiliated',
    1997,
    NULL,
    jsonb_build_object(
      'description', 'SVIT is affiliated with Gujarat Technological University (GTU) for all its engineering and technical programs.',
      'type', 'affiliation'
    ),
    'published'
  ),
  (
    'NIRF (National Institutional Ranking Framework)',
    'Active Participant',
    2016,
    NULL,
    jsonb_build_object(
      'description', 'SVIT actively participates in the National Institutional Ranking Framework (NIRF) and has consistently demonstrated its commitment to academic excellence, research, and overall institutional development.',
      'type', 'ranking',
      'document_url', '/img/NIRF2026.pdf'
    ),
    'published'
  );

END $$;
