-- Seed committees table
-- Run order: 05
-- Data source: src/data/aboutPage.ts (committees array)

-- ============================================
-- COMMITTEES
-- ============================================

DO $$
DECLARE
  v_svit_id uuid;
BEGIN
  -- Get SVIT college ID (committees are at college level)
  SELECT id INTO v_svit_id FROM colleges WHERE slug = 'svit';

  INSERT INTO committees (college_id, name, slug, description, vision, mission, sort_order, metadata, status) VALUES
  (
    v_svit_id,
    'Women Development Cell',
    'women-development-cell',
    'Created to ensure a safe working environment for the female fraternity. Organizes programs on women empowerment.',
    'To assist women in achieving full potential in education, career and personal life through academic and intellectual growth and personal empowerment.',
    'To educate them on gender-related issues, showcase their talent, boost confidence, identify strength areas, and motivate them towards individuality.',
    1,
    jsonb_build_object(
      'key_activities', jsonb_build_array(
        'Creates social awareness among female staff and girl students about relevant issues',
        'Organizes seminars and workshops for general awareness and orientation',
        'Conducts training programs and creates awareness about self-employment schemes',
        'Promotes general well-being of female students and staff'
      )
    ),
    'published'
  ),
  (
    v_svit_id,
    'Grievance Redressal Cell',
    'grievance-redressal-cell',
    'Functions to enquire into grievances and suggest final action at the institutional level for redressal.',
    NULL,
    NULL,
    2,
    jsonb_build_object(
      'key_activities', jsonb_build_array(
        'Ensures fair, impartial and consistent redressal of issues faced by students',
        'Develops a responsive and accountable attitude among students',
        'Maintains harmonious atmosphere in the college campus',
        'Resolves grievances with complete confidentiality',
        'Handles: physical harassment, mental harassment, complaints against teaching/administrative staff, accommodation/hostel, and transportation issues'
      )
    ),
    'published'
  ),
  (
    v_svit_id,
    'Sexual Harassment Cell',
    'sexual-harassment-cell',
    'Established per UGC, NAAC, and Supreme Court guidelines to provide a healthy and congenial atmosphere for all staff and students.',
    NULL,
    NULL,
    3,
    jsonb_build_object(
      'key_activities', jsonb_build_array(
        'Promotes gender equality and removal of gender bias',
        'Addresses sexual harassment and gender-based violence',
        'Treats all complaints with dignity and respect',
        'Maintains complete confidentiality of complaints'
      )
    ),
    'published'
  ),
  (
    v_svit_id,
    'Anti-Ragging Committee',
    'anti-ragging-committee',
    'Ragging in any form is strictly forbidden. The committee punishes students found guilty as per UGC regulations.',
    NULL,
    NULL,
    4,
    jsonb_build_object(
      'key_activities', jsonb_build_array(
        'Awareness programs on dehumanizing effects of ragging',
        'Continuous watch and vigil across campus',
        'Stringent action against ragging incidents',
        'Regular checks of hostels, buses, canteens, and classrooms',
        'Follows Supreme Court guidelines — Civil Appeal No. 887 of 2009'
      )
    ),
    'published'
  ),
  (
    v_svit_id,
    'Internal Quality Assurance Cell (IQAC)',
    'iqac',
    'Apex body overseeing the internal quality assurance system with appropriate structures and processes.',
    NULL,
    NULL,
    5,
    jsonb_build_object(
      'key_activities', jsonb_build_array(
        'Plans, guides, and monitors Quality Assurance and Quality Enhancement activities',
        'Channelizes efforts towards academic excellence',
        'Develops quality circles within the institute',
        'Collects feedback from all stakeholders',
        'Organizes workshops and seminars on quality improvement'
      )
    ),
    'published'
  );

END $$;
