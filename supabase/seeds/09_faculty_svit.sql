-- Seed SVIT faculty and staff
-- Generated from: Employee_List_by_Department.xlsx
-- Date: 2026-09-17
-- Total staff: 201 across 18 departments
-- Status: Working only (Resigned employees excluded)

DO $$
DECLARE
  v_dept_svit_be_aeronautical uuid;
  v_dept_svit_be_ash uuid;
  v_dept_svit_be_civil uuid;
  v_dept_svit_be_computer uuid;
  v_dept_svit_be_csd uuid;
  v_dept_svit_dip_ash uuid;
  v_dept_svit_dip_civil uuid;
  v_dept_svit_dip_computer uuid;
  v_dept_svit_dip_electrical uuid;
  v_dept_svit_dip_it uuid;
  v_dept_svit_dip_mechanical uuid;
  v_dept_svit_be_electrical uuid;
  v_dept_svit_be_ec uuid;
  v_dept_svit_be_it uuid;
  v_dept_svit_be_ic uuid;
  v_dept_svit_mba uuid;
  v_dept_svit_mca uuid;
  v_dept_svit_be_mechanical uuid;
  v_staff_id uuid;
BEGIN
  -- Get department IDs
  SELECT id INTO v_dept_svit_be_aeronautical FROM departments WHERE slug = 'dept-svit-be-aeronautical';
  SELECT id INTO v_dept_svit_be_ash FROM departments WHERE slug = 'dept-svit-be-ash';
  SELECT id INTO v_dept_svit_be_civil FROM departments WHERE slug = 'dept-svit-be-civil';
  SELECT id INTO v_dept_svit_be_computer FROM departments WHERE slug = 'dept-svit-be-computer';
  SELECT id INTO v_dept_svit_be_csd FROM departments WHERE slug = 'dept-svit-be-csd';
  SELECT id INTO v_dept_svit_dip_ash FROM departments WHERE slug = 'dept-svit-dip-ash';
  SELECT id INTO v_dept_svit_dip_civil FROM departments WHERE slug = 'dept-svit-dip-civil';
  SELECT id INTO v_dept_svit_dip_computer FROM departments WHERE slug = 'dept-svit-dip-computer';
  SELECT id INTO v_dept_svit_dip_electrical FROM departments WHERE slug = 'dept-svit-dip-electrical';
  SELECT id INTO v_dept_svit_dip_it FROM departments WHERE slug = 'dept-svit-dip-it';
  SELECT id INTO v_dept_svit_dip_mechanical FROM departments WHERE slug = 'dept-svit-dip-mechanical';
  SELECT id INTO v_dept_svit_be_electrical FROM departments WHERE slug = 'dept-svit-be-electrical';
  SELECT id INTO v_dept_svit_be_ec FROM departments WHERE slug = 'dept-svit-be-ec';
  SELECT id INTO v_dept_svit_be_it FROM departments WHERE slug = 'dept-svit-be-it';
  SELECT id INTO v_dept_svit_be_ic FROM departments WHERE slug = 'dept-svit-be-ic';
  SELECT id INTO v_dept_svit_mba FROM departments WHERE slug = 'dept-svit-mba';
  SELECT id INTO v_dept_svit_mca FROM departments WHERE slug = 'dept-svit-mca';
  SELECT id INTO v_dept_svit_be_mechanical FROM departments WHERE slug = 'dept-svit-be-mechanical';

  -- ============================================
  -- AERONAUTICAL ENGINEERING (13 staff)
  -- ============================================

  -- MRS. NIYATI MAULIN SHAH - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Niyati Maulin',
    'Shah',
    'niyatimaulinshah@svitvasad.ac.in',
    'Mrs.',
    jsonb_build_object(
      'employee_code', '103-NMS',
      'gender', 'FEMALE',
      'department', 'AERONAUTICAL ENGINEERING',
      'full_name', 'MRS. NIYATI MAULIN SHAH'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_aeronautical,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '103-NMS')
  )
  ON CONFLICT DO NOTHING;

  -- MR. JIGNESH R VALA - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Jignesh R',
    'Vala',
    'jigneshrvala@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '106-JRV',
      'gender', 'MALE',
      'department', 'AERONAUTICAL ENGINEERING',
      'full_name', 'MR. JIGNESH R VALA'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_aeronautical,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '106-JRV')
  )
  ON CONFLICT DO NOTHING;

  -- MR. VIRAL R GAMI - SENIOR LAB TECHNICIAN
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Viral R',
    'Gami',
    'viralrgami@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '112-VRG',
      'gender', 'MALE',
      'department', 'AERONAUTICAL ENGINEERING',
      'full_name', 'MR. VIRAL R GAMI'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_aeronautical,
    gen_random_uuid(),
    'SENIOR LAB TECHNICIAN',
    true,
    'published',
    jsonb_build_object('employee_code', '112-VRG')
  )
  ON CONFLICT DO NOTHING;

  -- MR. VIKAS BHUPENDRA PATEL - LAB ATTENDANT
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Vikas Bhupendra',
    'Patel',
    'vikasbhupendrapatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '1140-VBP',
      'gender', 'MALE',
      'department', 'AERONAUTICAL ENGINEERING',
      'full_name', 'MR. VIKAS BHUPENDRA PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_aeronautical,
    gen_random_uuid(),
    'LAB ATTENDANT',
    true,
    'published',
    jsonb_build_object('employee_code', '1140-VBP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. PANKAJ R PATEL - JUNIOR LAB TECHNICIAN
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Pankaj R',
    'Patel',
    'pankajrpatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '115-PRP',
      'gender', 'MALE',
      'department', 'AERONAUTICAL ENGINEERING',
      'full_name', 'MR. PANKAJ R PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_aeronautical,
    gen_random_uuid(),
    'JUNIOR LAB TECHNICIAN',
    true,
    'published',
    jsonb_build_object('employee_code', '115-PRP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. MITESH SHASHIKANT PATEL - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Mitesh Shashikant',
    'Patel',
    'miteshshashikantpatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '1182-MSP',
      'gender', 'MALE',
      'department', 'AERONAUTICAL ENGINEERING',
      'full_name', 'MR. MITESH SHASHIKANT PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_aeronautical,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '1182-MSP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. MEHUL K RANA - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Mehul K',
    'Rana',
    'mehulkrana@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '119-MKR',
      'gender', 'MALE',
      'department', 'AERONAUTICAL ENGINEERING',
      'full_name', 'MR. MEHUL K RANA'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_aeronautical,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '119-MKR')
  )
  ON CONFLICT DO NOTHING;

  -- MR. TILAK CHANDRAKANT PATEL - LAB ATTENDANT
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Tilak Chandrakant',
    'Patel',
    'tilakchandrakantpatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '125-TCP',
      'gender', 'MALE',
      'department', 'AERONAUTICAL ENGINEERING',
      'full_name', 'MR. TILAK CHANDRAKANT PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_aeronautical,
    gen_random_uuid(),
    'LAB ATTENDANT',
    true,
    'published',
    jsonb_build_object('employee_code', '125-TCP')
  )
  ON CONFLICT DO NOTHING;

  -- DR. JIGARKUMAR BHARATKUMAR SURA - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Jigarkumar Bharatkumar',
    'Sura',
    'jigarkumarbharatkumarsura@svitvasad.ac.in',
    'Dr.',
    jsonb_build_object(
      'employee_code', '126-JBS',
      'gender', 'MALE',
      'department', 'AERONAUTICAL ENGINEERING',
      'full_name', 'DR. JIGARKUMAR BHARATKUMAR SURA'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_aeronautical,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '126-JBS')
  )
  ON CONFLICT DO NOTHING;

  -- MR. KARNAILSINGH BALWANTSINGH SAINI - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Karnailsingh Balwantsingh',
    'Saini',
    'karnailsinghbalwantsinghsaini@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '127-KBS',
      'gender', 'MALE',
      'department', 'AERONAUTICAL ENGINEERING',
      'full_name', 'MR. KARNAILSINGH BALWANTSINGH SAINI'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_aeronautical,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '127-KBS')
  )
  ON CONFLICT DO NOTHING;

  -- MR. HARDIK ROHITKUMAR VALA - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Hardik Rohitkumar',
    'Vala',
    'hardikrohitkumarvala@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '128-HRV',
      'gender', 'MALE',
      'department', 'AERONAUTICAL ENGINEERING',
      'full_name', 'MR. HARDIK ROHITKUMAR VALA'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_aeronautical,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '128-HRV')
  )
  ON CONFLICT DO NOTHING;

  -- MR. DEV MAHENDRABHAI PATEL - LAB ATTENDANT
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Dev Mahendrabhai',
    'Patel',
    'devmahendrabhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '129-DMP',
      'gender', 'MALE',
      'department', 'AERONAUTICAL ENGINEERING',
      'full_name', 'MR. DEV MAHENDRABHAI PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_aeronautical,
    gen_random_uuid(),
    'LAB ATTENDANT',
    true,
    'published',
    jsonb_build_object('employee_code', '129-DMP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. RISHI RAJESHKUMAR SAXENA - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Rishi Rajeshkumar',
    'Saxena',
    'rishirajeshkumarsaxena@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '369-RRS',
      'gender', 'MALE',
      'department', 'AERONAUTICAL ENGINEERING',
      'full_name', 'MR. RISHI RAJESHKUMAR SAXENA'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_aeronautical,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '369-RRS')
  )
  ON CONFLICT DO NOTHING;

  -- ============================================
  -- APPLIED SCIENCES AND HUMANITIES (20 staff)
  -- ============================================

  -- MR. RONAK ASHOKBHAI PATEL - JUNIOR CLERK
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Ronak Ashokbhai',
    'Patel',
    'ronakashokbhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '1141-RAP',
      'gender', 'MALE',
      'department', 'APPLIED SCIENCES AND HUMANITIES',
      'full_name', 'MR. RONAK ASHOKBHAI PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_ash,
    gen_random_uuid(),
    'JUNIOR CLERK',
    true,
    'published',
    jsonb_build_object('employee_code', '1141-RAP')
  )
  ON CONFLICT DO NOTHING;

  -- MS. SHABA I PATHAN - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Shaba I',
    'Pathan',
    'shabaipathan@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '3033-SIP',
      'gender', 'FEMALE',
      'department', 'APPLIED SCIENCES AND HUMANITIES',
      'full_name', 'MS. SHABA I PATHAN'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_ash,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '3033-SIP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. PARAS RAJENDRABHAI SHAH - SENIOR LAB TECHNICIAN
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Paras Rajendrabhai',
    'Shah',
    'parasrajendrabhaishah@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '631-PRS',
      'gender', 'MALE',
      'department', 'APPLIED SCIENCES AND HUMANITIES',
      'full_name', 'MR. PARAS RAJENDRABHAI SHAH'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_ash,
    gen_random_uuid(),
    'SENIOR LAB TECHNICIAN',
    true,
    'published',
    jsonb_build_object('employee_code', '631-PRS')
  )
  ON CONFLICT DO NOTHING;

  -- DR. RAJIV VASHRAMBHAI VIRADIA - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Rajiv Vashrambhai',
    'Viradia',
    'rajivvashrambhaiviradia@svitvasad.ac.in',
    'Dr.',
    jsonb_build_object(
      'employee_code', '919-RVV',
      'gender', 'MALE',
      'department', 'APPLIED SCIENCES AND HUMANITIES',
      'full_name', 'DR. RAJIV VASHRAMBHAI VIRADIA'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_ash,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '919-RVV')
  )
  ON CONFLICT DO NOTHING;

  -- DR. VIKASH BHAGWATSWARUP AGARWAL - DIRECTOR OF PHYSICAL EDUCATION
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Vikash Bhagwatswarup',
    'Agarwal',
    'vikashbhagwatswarupagarwal@svitvasad.ac.in',
    'Dr.',
    jsonb_build_object(
      'employee_code', '921-VBA',
      'gender', 'MALE',
      'department', 'APPLIED SCIENCES AND HUMANITIES',
      'full_name', 'DR. VIKASH BHAGWATSWARUP AGARWAL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_ash,
    gen_random_uuid(),
    'DIRECTOR OF PHYSICAL EDUCATION',
    true,
    'published',
    jsonb_build_object('employee_code', '921-VBA')
  )
  ON CONFLICT DO NOTHING;

  -- DR. RAHUL PINAKIN MEHTA - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Rahul Pinakin',
    'Mehta',
    'rahulpinakinmehta@svitvasad.ac.in',
    'Dr.',
    jsonb_build_object(
      'employee_code', '922-RPM',
      'gender', 'MALE',
      'department', 'APPLIED SCIENCES AND HUMANITIES',
      'full_name', 'DR. RAHUL PINAKIN MEHTA'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_ash,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '922-RPM')
  )
  ON CONFLICT DO NOTHING;

  -- DR. BHATT BHAVINI - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Bhatt',
    'Bhavini',
    'bhattbhavini@svitvasad.ac.in',
    'Dr.',
    jsonb_build_object(
      'employee_code', '923-BMP',
      'gender', 'Female',
      'department', 'APPLIED SCIENCES AND HUMANITIES',
      'full_name', 'DR. BHATT BHAVINI'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_ash,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '923-BMP')
  )
  ON CONFLICT DO NOTHING;

  -- DR. K P MREDULA - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'K P',
    'Mredula',
    'kpmredula@svitvasad.ac.in',
    'Dr.',
    jsonb_build_object(
      'employee_code', '924-KPM',
      'gender', 'FEMALE',
      'department', 'APPLIED SCIENCES AND HUMANITIES',
      'full_name', 'DR. K P MREDULA'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_ash,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '924-KPM')
  )
  ON CONFLICT DO NOTHING;

  -- MS. MANISHA VITHALRAO UMATHE - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Manisha Vithalrao',
    'Umathe',
    'manishavithalraoumathe@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '931-MVU',
      'gender', 'FEMALE',
      'department', 'APPLIED SCIENCES AND HUMANITIES',
      'full_name', 'MS. MANISHA VITHALRAO UMATHE'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_ash,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '931-MVU')
  )
  ON CONFLICT DO NOTHING;

  -- DR. DISHA HARDIK PATEL - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Disha Hardik',
    'Patel',
    'dishahardikpatel@svitvasad.ac.in',
    'Dr.',
    jsonb_build_object(
      'employee_code', '932-DHP',
      'gender', 'FEMALE',
      'department', 'APPLIED SCIENCES AND HUMANITIES',
      'full_name', 'DR. DISHA HARDIK PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_ash,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '932-DHP')
  )
  ON CONFLICT DO NOTHING;

  -- DR. ASIF MAHAMADBHAI VAHORA - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Asif Mahamadbhai',
    'Vahora',
    'asifmahamadbhaivahora@svitvasad.ac.in',
    'Dr.',
    jsonb_build_object(
      'employee_code', '934-AMV',
      'gender', 'MALE',
      'department', 'APPLIED SCIENCES AND HUMANITIES',
      'full_name', 'DR. ASIF MAHAMADBHAI VAHORA'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_ash,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '934-AMV')
  )
  ON CONFLICT DO NOTHING;

  -- DR. DHRUVESH KHUSPATRAI MATHUR - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Dhruvesh Khuspatrai',
    'Mathur',
    'dhruveshkhuspatraimathur@svitvasad.ac.in',
    'Dr.',
    jsonb_build_object(
      'employee_code', '935-DKM',
      'gender', 'MALE',
      'department', 'APPLIED SCIENCES AND HUMANITIES',
      'full_name', 'DR. DHRUVESH KHUSPATRAI MATHUR'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_ash,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '935-DKM')
  )
  ON CONFLICT DO NOTHING;

  -- MS. DIPTI M TAPIAWALA - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Dipti M',
    'Tapiawala',
    'diptimtapiawala@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '936-DMT',
      'gender', 'FEMALE',
      'department', 'APPLIED SCIENCES AND HUMANITIES',
      'full_name', 'MS. DIPTI M TAPIAWALA'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_ash,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '936-DMT')
  )
  ON CONFLICT DO NOTHING;

  -- MR. BHAVESH VIJAYBHAI SUTHAR - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Bhavesh Vijaybhai',
    'Suthar',
    'bhaveshvijaybhaisuthar@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '958-BVS',
      'gender', 'MALE',
      'department', 'APPLIED SCIENCES AND HUMANITIES',
      'full_name', 'MR. BHAVESH VIJAYBHAI SUTHAR'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_ash,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '958-BVS')
  )
  ON CONFLICT DO NOTHING;

  -- MS. MOOLAN SMRITI PHILIP - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Moolan Smriti',
    'Philip',
    'moolansmritiphilip@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '969-MSP',
      'gender', 'FEMALE',
      'department', 'APPLIED SCIENCES AND HUMANITIES',
      'full_name', 'MS. MOOLAN SMRITI PHILIP'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_ash,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '969-MSP')
  )
  ON CONFLICT DO NOTHING;

  -- MS. JEEL RAJESHKUMAR JOSHI - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Jeel Rajeshkumar',
    'Joshi',
    'jeelrajeshkumarjoshi@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '971-JRJ',
      'gender', 'FEMALE',
      'department', 'APPLIED SCIENCES AND HUMANITIES',
      'full_name', 'MS. JEEL RAJESHKUMAR JOSHI'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_ash,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '971-JRJ')
  )
  ON CONFLICT DO NOTHING;

  -- MR. MIHIRKUMAR RASIKKUMAR THAKKAR - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Mihirkumar Rasikkumar',
    'Thakkar',
    'mihirkumarrasikkumarthakkar@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '972-MRT',
      'gender', 'MALE',
      'department', 'APPLIED SCIENCES AND HUMANITIES',
      'full_name', 'MR. MIHIRKUMAR RASIKKUMAR THAKKAR'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_ash,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '972-MRT')
  )
  ON CONFLICT DO NOTHING;

  -- MS. KRUSHNALBEN VIJAYSINH SODHAPARMAR - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Krushnalben Vijaysinh',
    'Sodhaparmar',
    'krushnalbenvijaysinhsodhaparmar@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '973-KVS',
      'gender', 'FEMALE',
      'department', 'APPLIED SCIENCES AND HUMANITIES',
      'full_name', 'MS. KRUSHNALBEN VIJAYSINH SODHAPARMAR'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_ash,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '973-KVS')
  )
  ON CONFLICT DO NOTHING;

  -- MR. LALJIBHAI GHUSABHAI SHIYAL - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Laljibhai Ghusabhai',
    'Shiyal',
    'laljibhaighusabhaishiyal@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '975-LGS',
      'gender', 'MALE',
      'department', 'APPLIED SCIENCES AND HUMANITIES',
      'full_name', 'MR. LALJIBHAI GHUSABHAI SHIYAL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_ash,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '975-LGS')
  )
  ON CONFLICT DO NOTHING;

  -- MR. PARTH VIPULKUMAR SHAH - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Parth Vipulkumar',
    'Shah',
    'parthvipulkumarshah@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '976-PVS',
      'gender', 'Male',
      'department', 'APPLIED SCIENCES AND HUMANITIES',
      'full_name', 'MR. PARTH VIPULKUMAR SHAH'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_ash,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '976-PVS')
  )
  ON CONFLICT DO NOTHING;

  -- ============================================
  -- CIVIL ENGINEERING (14 staff)
  -- ============================================

  -- DR. NIRANJAN MARKANDRAY TRIVEDI - ASSOCIATE PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Niranjan Markandray',
    'Trivedi',
    'niranjanmarkandraytrivedi@svitvasad.ac.in',
    'Dr.',
    jsonb_build_object(
      'employee_code', '501-NMT',
      'gender', 'MALE',
      'department', 'CIVIL ENGINEERING',
      'full_name', 'DR. NIRANJAN MARKANDRAY TRIVEDI'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_civil,
    gen_random_uuid(),
    'ASSOCIATE PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '501-NMT')
  )
  ON CONFLICT DO NOTHING;

  -- MR. SAHIL SAYEEDBHAI HUSENI - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Sahil Sayeedbhai',
    'Huseni',
    'sahilsayeedbhaihuseni@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '505-SSH',
      'gender', 'MALE',
      'department', 'CIVIL ENGINEERING',
      'full_name', 'MR. SAHIL SAYEEDBHAI HUSENI'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_civil,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '505-SSH')
  )
  ON CONFLICT DO NOTHING;

  -- MR. CHITRANJAN GUNVANTBHAI PATEL - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Chitranjan Gunvantbhai',
    'Patel',
    'chitranjangunvantbhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '506-CGP',
      'gender', 'MALE',
      'department', 'CIVIL ENGINEERING',
      'full_name', 'MR. CHITRANJAN GUNVANTBHAI PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_civil,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '506-CGP')
  )
  ON CONFLICT DO NOTHING;

  -- DR. SHEFALI MANISH SHAH - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Shefali Manish',
    'Shah',
    'shefalimanishshah@svitvasad.ac.in',
    'Dr.',
    jsonb_build_object(
      'employee_code', '507-SMS',
      'gender', 'FEMALE',
      'department', 'CIVIL ENGINEERING',
      'full_name', 'DR. SHEFALI MANISH SHAH'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_civil,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '507-SMS')
  )
  ON CONFLICT DO NOTHING;

  -- DR. SAMTA PARAG SHAH - ASSOCIATE PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Samta Parag',
    'Shah',
    'samtaparagshah@svitvasad.ac.in',
    'Dr.',
    jsonb_build_object(
      'employee_code', '509-SPS',
      'gender', 'FEMALE',
      'department', 'CIVIL ENGINEERING',
      'full_name', 'DR. SAMTA PARAG SHAH'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_civil,
    gen_random_uuid(),
    'ASSOCIATE PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '509-SPS')
  )
  ON CONFLICT DO NOTHING;

  -- DR. ROOPALI VIKAS GOYAL - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Roopali Vikas',
    'Goyal',
    'roopalivikasgoyal@svitvasad.ac.in',
    'Dr.',
    jsonb_build_object(
      'employee_code', '510-RVG',
      'gender', 'FEMALE',
      'department', 'CIVIL ENGINEERING',
      'full_name', 'DR. ROOPALI VIKAS GOYAL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_civil,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '510-RVG')
  )
  ON CONFLICT DO NOTHING;

  -- DR. SEJAL PURVANG DALAL - ASSOCIATE PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Sejal Purvang',
    'Dalal',
    'sejalpurvangdalal@svitvasad.ac.in',
    'Dr.',
    jsonb_build_object(
      'employee_code', '511-SPD',
      'gender', 'FEMALE',
      'department', 'CIVIL ENGINEERING',
      'full_name', 'DR. SEJAL PURVANG DALAL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_civil,
    gen_random_uuid(),
    'ASSOCIATE PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '511-SPD')
  )
  ON CONFLICT DO NOTHING;

  -- MR. DIPEN CHANDUBHAI PATEL - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Dipen Chandubhai',
    'Patel',
    'dipenchandubhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '514-DCP',
      'gender', 'MALE',
      'department', 'CIVIL ENGINEERING',
      'full_name', 'MR. DIPEN CHANDUBHAI PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_civil,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '514-DCP')
  )
  ON CONFLICT DO NOTHING;

  -- MS. DHRUTI MIHIR PANDYA - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Dhruti Mihir',
    'Pandya',
    'dhrutimihirpandya@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '515-DMP',
      'gender', 'FEMALE',
      'department', 'CIVIL ENGINEERING',
      'full_name', 'MS. DHRUTI MIHIR PANDYA'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_civil,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '515-DMP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. HITESHKUMAR BABUBHAI PANDYA - SENIOR LAB TECHNICIAN
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Hiteshkumar Babubhai',
    'Pandya',
    'hiteshkumarbabubhaipandya@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '521-HBP',
      'gender', 'MALE',
      'department', 'CIVIL ENGINEERING',
      'full_name', 'MR. HITESHKUMAR BABUBHAI PANDYA'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_civil,
    gen_random_uuid(),
    'SENIOR LAB TECHNICIAN',
    true,
    'published',
    jsonb_build_object('employee_code', '521-HBP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. ALKESH VITTHALBHAI PATEL - SENIOR LAB TECHNICIAN
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Alkesh Vitthalbhai',
    'Patel',
    'alkeshvitthalbhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '522-AVP',
      'gender', 'MALE',
      'department', 'CIVIL ENGINEERING',
      'full_name', 'MR. ALKESH VITTHALBHAI PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_civil,
    gen_random_uuid(),
    'SENIOR LAB TECHNICIAN',
    true,
    'published',
    jsonb_build_object('employee_code', '522-AVP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. PIYUSHKUMAR ADITRAM BHATT - JUNIOR LAB TECHNICIAN
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Piyushkumar Aditram',
    'Bhatt',
    'piyushkumaraditrambhatt@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '525-PAB',
      'gender', 'MALE',
      'department', 'CIVIL ENGINEERING',
      'full_name', 'MR. PIYUSHKUMAR ADITRAM BHATT'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_civil,
    gen_random_uuid(),
    'JUNIOR LAB TECHNICIAN',
    true,
    'published',
    jsonb_build_object('employee_code', '525-PAB')
  )
  ON CONFLICT DO NOTHING;

  -- MRS. MANSI Y PATEL - CHEMIST
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Mansi Y',
    'Patel',
    'mansiypatel@svitvasad.ac.in',
    'Mrs.',
    jsonb_build_object(
      'employee_code', '531-MYP',
      'gender', 'FEMALE',
      'department', 'CIVIL ENGINEERING',
      'full_name', 'MRS. MANSI Y PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_civil,
    gen_random_uuid(),
    'CHEMIST',
    true,
    'published',
    jsonb_build_object('employee_code', '531-MYP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. MITESHKUMAR PATEL - CHEMICAL ENGINEER
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Miteshkumar',
    'Patel',
    'miteshkumarpatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '532-MBP',
      'gender', 'Male',
      'department', 'CIVIL ENGINEERING',
      'full_name', 'MR. MITESHKUMAR PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_civil,
    gen_random_uuid(),
    'CHEMICAL ENGINEER',
    true,
    'published',
    jsonb_build_object('employee_code', '532-MBP')
  )
  ON CONFLICT DO NOTHING;

  -- ============================================
  -- COMPUTER ENGINEERING (32 staff)
  -- ============================================

  -- MR. BHUMIN DIPAKBHAI PATEL - JUNIOR LAB TECHNICIAN
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Bhumin Dipakbhai',
    'Patel',
    'bhumindipakbhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '1149-BDP',
      'gender', 'MALE',
      'department', 'COMPUTER ENGINEERING',
      'full_name', 'MR. BHUMIN DIPAKBHAI PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_computer,
    gen_random_uuid(),
    'JUNIOR LAB TECHNICIAN',
    true,
    'published',
    jsonb_build_object('employee_code', '1149-BDP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. RITESH KAUSHIKBHAI PATEL - JUNIOR CLERK
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Ritesh Kaushikbhai',
    'Patel',
    'riteshkaushikbhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '1172-RKP',
      'gender', 'MALE',
      'department', 'COMPUTER ENGINEERING',
      'full_name', 'MR. RITESH KAUSHIKBHAI PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_computer,
    gen_random_uuid(),
    'JUNIOR CLERK',
    true,
    'published',
    jsonb_build_object('employee_code', '1172-RKP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. MOKSH ATULKUMAR SHAH - LAB ATTENDANT
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Moksh Atulkumar',
    'Shah',
    'mokshatulkumarshah@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '1198-MAS',
      'gender', 'MALE',
      'department', 'COMPUTER ENGINEERING',
      'full_name', 'MR. MOKSH ATULKUMAR SHAH'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_computer,
    gen_random_uuid(),
    'LAB ATTENDANT',
    true,
    'published',
    jsonb_build_object('employee_code', '1198-MAS')
  )
  ON CONFLICT DO NOTHING;

  -- MR. PANKAJBHAI GHANSHYAMBHAI PATEL - SENIOR LAB TECHNICIAN
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Pankajbhai Ghanshyambhai',
    'Patel',
    'pankajbhaighanshyambhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '214-PGP',
      'gender', 'MALE',
      'department', 'COMPUTER ENGINEERING',
      'full_name', 'MR. PANKAJBHAI GHANSHYAMBHAI PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_computer,
    gen_random_uuid(),
    'SENIOR LAB TECHNICIAN',
    true,
    'published',
    jsonb_build_object('employee_code', '214-PGP')
  )
  ON CONFLICT DO NOTHING;

  -- DR. NEHA RIPAL SONI - ASSOCIATE PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Neha Ripal',
    'Soni',
    'neharipalsoni@svitvasad.ac.in',
    'Dr.',
    jsonb_build_object(
      'employee_code', '702-NRS',
      'gender', 'FEMALE',
      'department', 'COMPUTER ENGINEERING',
      'full_name', 'DR. NEHA RIPAL SONI'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_computer,
    gen_random_uuid(),
    'ASSOCIATE PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '702-NRS')
  )
  ON CONFLICT DO NOTHING;

  -- MRS. JAYNA BIJAL SHAH - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Jayna Bijal',
    'Shah',
    'jaynabijalshah@svitvasad.ac.in',
    'Mrs.',
    jsonb_build_object(
      'employee_code', '704-JBS',
      'gender', 'FEMALE',
      'department', 'COMPUTER ENGINEERING',
      'full_name', 'MRS. JAYNA BIJAL SHAH'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_computer,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '704-JBS')
  )
  ON CONFLICT DO NOTHING;

  -- MS. PARUL VALLABH BHAI BAKARANIYA - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Parul Vallabh Bhai',
    'Bakaraniya',
    'parulvallabhbhaibakaraniya@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '708-PVB',
      'gender', 'FEMALE',
      'department', 'COMPUTER ENGINEERING',
      'full_name', 'MS. PARUL VALLABH BHAI BAKARANIYA'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_computer,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '708-PVB')
  )
  ON CONFLICT DO NOTHING;

  -- MR. MILIN MANUBHAI PATEL - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Milin Manubhai',
    'Patel',
    'milinmanubhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '709-MMP',
      'gender', 'MALE',
      'department', 'COMPUTER ENGINEERING',
      'full_name', 'MR. MILIN MANUBHAI PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_computer,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '709-MMP')
  )
  ON CONFLICT DO NOTHING;

  -- MRS. BARKHA MALAY JOSHI - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Barkha Malay',
    'Joshi',
    'barkhamalayjoshi@svitvasad.ac.in',
    'Mrs.',
    jsonb_build_object(
      'employee_code', '710-BMJ',
      'gender', 'FEMALE',
      'department', 'COMPUTER ENGINEERING',
      'full_name', 'MRS. BARKHA MALAY JOSHI'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_computer,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '710-BMJ')
  )
  ON CONFLICT DO NOTHING;

  -- MS. RIMI VINODKUMAR GUPTA - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Rimi Vinodkumar',
    'Gupta',
    'rimivinodkumargupta@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '711-RVG',
      'gender', 'FEMALE',
      'department', 'COMPUTER ENGINEERING',
      'full_name', 'MS. RIMI VINODKUMAR GUPTA'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_computer,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '711-RVG')
  )
  ON CONFLICT DO NOTHING;

  -- MS. NIDHI BHARATKUMAR SHAH - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Nidhi Bharatkumar',
    'Shah',
    'nidhibharatkumarshah@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '712-NBS',
      'gender', 'FEMALE',
      'department', 'COMPUTER ENGINEERING',
      'full_name', 'MS. NIDHI BHARATKUMAR SHAH'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_computer,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '712-NBS')
  )
  ON CONFLICT DO NOTHING;

  -- MRS. NISHA SAMIR VELANI - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Nisha Samir',
    'Velani',
    'nishasamirvelani@svitvasad.ac.in',
    'Mrs.',
    jsonb_build_object(
      'employee_code', '713-NSV',
      'gender', 'FEMALE',
      'department', 'COMPUTER ENGINEERING',
      'full_name', 'MRS. NISHA SAMIR VELANI'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_computer,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '713-NSV')
  )
  ON CONFLICT DO NOTHING;

  -- MR. RASHMIN BABUBHAI PRAJAPATI - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Rashmin Babubhai',
    'Prajapati',
    'rashminbabubhaiprajapati@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '717-RBP',
      'gender', 'MALE',
      'department', 'COMPUTER ENGINEERING',
      'full_name', 'MR. RASHMIN BABUBHAI PRAJAPATI'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_computer,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '717-RBP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. KEYUR SURESHBHAI SUTHAR - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Keyur Sureshbhai',
    'Suthar',
    'keyursureshbhaisuthar@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '718-KSS',
      'gender', 'MALE',
      'department', 'COMPUTER ENGINEERING',
      'full_name', 'MR. KEYUR SURESHBHAI SUTHAR'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_computer,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '718-KSS')
  )
  ON CONFLICT DO NOTHING;

  -- MR. KEYUR NIRANJANKUMAR UPADHYAY - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Keyur Niranjankumar',
    'Upadhyay',
    'keyurniranjankumarupadhyay@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '719-KNU',
      'gender', 'MALE',
      'department', 'COMPUTER ENGINEERING',
      'full_name', 'MR. KEYUR NIRANJANKUMAR UPADHYAY'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_computer,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '719-KNU')
  )
  ON CONFLICT DO NOTHING;

  -- MRS. SHRINA MANAN PATEL - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Shrina Manan',
    'Patel',
    'shrinamananpatel@svitvasad.ac.in',
    'Mrs.',
    jsonb_build_object(
      'employee_code', '722-SMP',
      'gender', 'FEMALE',
      'department', 'COMPUTER ENGINEERING',
      'full_name', 'MRS. SHRINA MANAN PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_computer,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '722-SMP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. RONAK JASWIN ROY - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Ronak Jaswin',
    'Roy',
    'ronakjaswinroy@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '727-RJR',
      'gender', 'MALE',
      'department', 'COMPUTER ENGINEERING',
      'full_name', 'MR. RONAK JASWIN ROY'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_computer,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '727-RJR')
  )
  ON CONFLICT DO NOTHING;

  -- MR. GAURANG KIRITBHAI PATEL - COMPUTER OPERATOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Gaurang Kiritbhai',
    'Patel',
    'gaurangkiritbhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '728-GKP',
      'gender', 'Male',
      'department', 'COMPUTER ENGINEERING',
      'full_name', 'MR. GAURANG KIRITBHAI PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_computer,
    gen_random_uuid(),
    'COMPUTER OPERATOR',
    true,
    'published',
    jsonb_build_object('employee_code', '728-GKP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. BRIJESHKUMAR YOGESHBHAI PANCHAL - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Brijeshkumar Yogeshbhai',
    'Panchal',
    'brijeshkumaryogeshbhaipanchal@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '743-BYP',
      'gender', 'MALE',
      'department', 'COMPUTER ENGINEERING',
      'full_name', 'MR. BRIJESHKUMAR YOGESHBHAI PANCHAL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_computer,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '743-BYP')
  )
  ON CONFLICT DO NOTHING;

  -- MRS. DIVYA JAYESH PARMAR - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Divya Jayesh',
    'Parmar',
    'divyajayeshparmar@svitvasad.ac.in',
    'Mrs.',
    jsonb_build_object(
      'employee_code', '747-DJP',
      'gender', 'FEMALE',
      'department', 'COMPUTER ENGINEERING',
      'full_name', 'MRS. DIVYA JAYESH PARMAR'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_computer,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '747-DJP')
  )
  ON CONFLICT DO NOTHING;

  -- MRS. SWATIBEN DIXITKUMAR BOPALIYA - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Swatiben Dixitkumar',
    'Bopaliya',
    'swatibendixitkumarbopaliya@svitvasad.ac.in',
    'Mrs.',
    jsonb_build_object(
      'employee_code', '748-SDB',
      'gender', 'FEMALE',
      'department', 'COMPUTER ENGINEERING',
      'full_name', 'MRS. SWATIBEN DIXITKUMAR BOPALIYA'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_computer,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '748-SDB')
  )
  ON CONFLICT DO NOTHING;

  -- MRS. MITTAL CHINTAN JOSHI - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Mittal Chintan',
    'Joshi',
    'mittalchintanjoshi@svitvasad.ac.in',
    'Mrs.',
    jsonb_build_object(
      'employee_code', '749-MCJ',
      'gender', 'FEMALE',
      'department', 'COMPUTER ENGINEERING',
      'full_name', 'MRS. MITTAL CHINTAN JOSHI'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_computer,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '749-MCJ')
  )
  ON CONFLICT DO NOTHING;

  -- MR. MILIND HIMANSHU SHAH - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Milind Himanshu',
    'Shah',
    'milindhimanshushah@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '754-MHS',
      'gender', 'MALE',
      'department', 'COMPUTER ENGINEERING',
      'full_name', 'MR. MILIND HIMANSHU SHAH'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_computer,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '754-MHS')
  )
  ON CONFLICT DO NOTHING;

  -- MRS. PRIYANKA ASHISH PATEL - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Priyanka Ashish',
    'Patel',
    'priyankaashishpatel@svitvasad.ac.in',
    'Mrs.',
    jsonb_build_object(
      'employee_code', '755-PAP',
      'gender', 'FEMALE',
      'department', 'COMPUTER ENGINEERING',
      'full_name', 'MRS. PRIYANKA ASHISH PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_computer,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '755-PAP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. ABHISHEK MAYURKUMAR PATEL - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Abhishek Mayurkumar',
    'Patel',
    'abhishekmayurkumarpatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '756-AMP',
      'gender', 'MALE',
      'department', 'COMPUTER ENGINEERING',
      'full_name', 'MR. ABHISHEK MAYURKUMAR PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_computer,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '756-AMP')
  )
  ON CONFLICT DO NOTHING;

  -- DR. MINAL PARIMALBHAI PATEL - ASSOCIATE PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Minal Parimalbhai',
    'Patel',
    'minalparimalbhaipatel@svitvasad.ac.in',
    'Dr.',
    jsonb_build_object(
      'employee_code', '759-MPP',
      'gender', 'MALE',
      'department', 'COMPUTER ENGINEERING',
      'full_name', 'DR. MINAL PARIMALBHAI PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_computer,
    gen_random_uuid(),
    'ASSOCIATE PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '759-MPP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. JAYDEEPSINH KISHAKUMAR SOLANKI - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Jaydeepsinh Kishakumar',
    'Solanki',
    'jaydeepsinhkishakumarsolanki@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '760-JKS',
      'gender', 'MALE',
      'department', 'COMPUTER ENGINEERING',
      'full_name', 'MR. JAYDEEPSINH KISHAKUMAR SOLANKI'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_computer,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '760-JKS')
  )
  ON CONFLICT DO NOTHING;

  -- MRS. JEENAL M PATEL - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Jeenal M',
    'Patel',
    'jeenalmpatel@svitvasad.ac.in',
    'Mrs.',
    jsonb_build_object(
      'employee_code', '763-JMP',
      'gender', 'FEMALE',
      'department', 'COMPUTER ENGINEERING',
      'full_name', 'MRS. JEENAL M PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_computer,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '763-JMP')
  )
  ON CONFLICT DO NOTHING;

  -- Ms. HETAL VICKY CHOKSHI - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Hetal Vicky',
    'Chokshi',
    'hetalvickychokshi@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '764-HVC',
      'gender', 'Female',
      'department', 'COMPUTER ENGINEERING',
      'full_name', 'Ms. HETAL VICKY CHOKSHI'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_computer,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '764-HVC')
  )
  ON CONFLICT DO NOTHING;

  -- Ms. HIMANI JIMIT BHATT - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Himani Jimit',
    'Bhatt',
    'himanijimitbhatt@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '765-HJB',
      'gender', 'Female',
      'department', 'COMPUTER ENGINEERING',
      'full_name', 'Ms. HIMANI JIMIT BHATT'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_computer,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '765-HJB')
  )
  ON CONFLICT DO NOTHING;

  -- Ms. PREXA JAYENDRAKUMAR DESAI - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Prexa Jayendrakumar',
    'Desai',
    'prexajayendrakumardesai@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '766-PJD',
      'gender', 'Female',
      'department', 'COMPUTER ENGINEERING',
      'full_name', 'Ms. PREXA JAYENDRAKUMAR DESAI'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_computer,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '766-PJD')
  )
  ON CONFLICT DO NOTHING;

  -- Mr. SACHIN PRAVINBHAI PATEL - CCTV OPERATOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Sachin Pravinbhai',
    'Patel',
    'sachinpravinbhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '767-SPP',
      'gender', 'Male',
      'department', 'COMPUTER ENGINEERING',
      'full_name', 'Mr. SACHIN PRAVINBHAI PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_computer,
    gen_random_uuid(),
    'CCTV OPERATOR',
    true,
    'published',
    jsonb_build_object('employee_code', '767-SPP')
  )
  ON CONFLICT DO NOTHING;

  -- ============================================
  -- COMPUTER SCIENCE AND DESIGN (8 staff)
  -- ============================================

  -- MR. VIHANG NARENDRAKUMAR PATEL - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Vihang Narendrakumar',
    'Patel',
    'vihangnarendrakumarpatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '1401-VNP',
      'gender', 'MALE',
      'department', 'COMPUTER SCIENCE AND DESIGN',
      'full_name', 'MR. VIHANG NARENDRAKUMAR PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_csd,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '1401-VNP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. ARPIT VIJAY MEHTA - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Arpit Vijay',
    'Mehta',
    'arpitvijaymehta@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '1402-AVM',
      'gender', 'MALE',
      'department', 'COMPUTER SCIENCE AND DESIGN',
      'full_name', 'MR. ARPIT VIJAY MEHTA'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_csd,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '1402-AVM')
  )
  ON CONFLICT DO NOTHING;

  -- MRS. URMILA DHAVALKUMAR KHUNT - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Urmila Dhavalkumar',
    'Khunt',
    'urmiladhavalkumarkhunt@svitvasad.ac.in',
    'Mrs.',
    jsonb_build_object(
      'employee_code', '1403-UDK',
      'gender', 'FEMALE',
      'department', 'COMPUTER SCIENCE AND DESIGN',
      'full_name', 'MRS. URMILA DHAVALKUMAR KHUNT'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_csd,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '1403-UDK')
  )
  ON CONFLICT DO NOTHING;

  -- DR. AJAYSINH DEVENDRASINH RATHOD - ASSOCIATE PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Ajaysinh Devendrasinh',
    'Rathod',
    'ajaysinhdevendrasinhrathod@svitvasad.ac.in',
    'Dr.',
    jsonb_build_object(
      'employee_code', '745-ADR',
      'gender', 'MALE',
      'department', 'COMPUTER SCIENCE AND DESIGN',
      'full_name', 'DR. AJAYSINH DEVENDRASINH RATHOD'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_csd,
    gen_random_uuid(),
    'ASSOCIATE PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '745-ADR')
  )
  ON CONFLICT DO NOTHING;

  -- MRS. PRIYA SHREYAS PATEL - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Priya Shreyas',
    'Patel',
    'priyashreyaspatel@svitvasad.ac.in',
    'Mrs.',
    jsonb_build_object(
      'employee_code', '752-PSP',
      'gender', 'FEMALE',
      'department', 'COMPUTER SCIENCE AND DESIGN',
      'full_name', 'MRS. PRIYA SHREYAS PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_csd,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '752-PSP')
  )
  ON CONFLICT DO NOTHING;

  -- MRS. RAJVEE AARJAV DESAI - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Rajvee Aarjav',
    'Desai',
    'rajveeaarjavdesai@svitvasad.ac.in',
    'Mrs.',
    jsonb_build_object(
      'employee_code', '753-RAD',
      'gender', 'FEMALE',
      'department', 'COMPUTER SCIENCE AND DESIGN',
      'full_name', 'MRS. RAJVEE AARJAV DESAI'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_csd,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '753-RAD')
  )
  ON CONFLICT DO NOTHING;

  -- MS. MAHESHWARI HITESHBHAI SAGAR - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Maheshwari Hiteshbhai',
    'Sagar',
    'maheshwarihiteshbhaisagar@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '761-MHS',
      'gender', 'FEMALE',
      'department', 'COMPUTER SCIENCE AND DESIGN',
      'full_name', 'MS. MAHESHWARI HITESHBHAI SAGAR'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_csd,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '761-MHS')
  )
  ON CONFLICT DO NOTHING;

  -- MR. NIRAV VASHRAMBHAI PATEL - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Nirav Vashrambhai',
    'Patel',
    'niravvashrambhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '762-NVP',
      'gender', 'MALE',
      'department', 'COMPUTER SCIENCE AND DESIGN',
      'full_name', 'MR. NIRAV VASHRAMBHAI PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_csd,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '762-NVP')
  )
  ON CONFLICT DO NOTHING;

  -- ============================================
  -- DIPLOMA APPLIED SCIENCE &amp... (6 staff)
  -- ============================================

  -- MS. UZMA MAHEBUBHUSAAIN VAHORA - LECTURER
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Uzma Mahebubhusaain',
    'Vahora',
    'uzmamahebubhusaainvahora@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '1191-UMV',
      'gender', 'FEMALE',
      'department', 'DIPLOMA APPLIED SCIENCE &amp...',
      'full_name', 'MS. UZMA MAHEBUBHUSAAIN VAHORA'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_dip_ash,
    gen_random_uuid(),
    'LECTURER',
    true,
    'published',
    jsonb_build_object('employee_code', '1191-UMV')
  )
  ON CONFLICT DO NOTHING;

  -- MR. SHARDUL RAM VADALKAR - LECTURER
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Shardul Ram',
    'Vadalkar',
    'shardulramvadalkar@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '2001-SRV',
      'gender', 'MALE',
      'department', 'DIPLOMA APPLIED SCIENCE &amp...',
      'full_name', 'MR. SHARDUL RAM VADALKAR'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_dip_ash,
    gen_random_uuid(),
    'LECTURER',
    true,
    'published',
    jsonb_build_object('employee_code', '2001-SRV')
  )
  ON CONFLICT DO NOTHING;

  -- MS. SABA MAHESHBHAI RAJ - LECTURER
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Saba Maheshbhai',
    'Raj',
    'sabamaheshbhairaj@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '2002-SMR',
      'gender', 'FEMALE',
      'department', 'DIPLOMA APPLIED SCIENCE &amp...',
      'full_name', 'MS. SABA MAHESHBHAI RAJ'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_dip_ash,
    gen_random_uuid(),
    'LECTURER',
    true,
    'published',
    jsonb_build_object('employee_code', '2002-SMR')
  )
  ON CONFLICT DO NOTHING;

  -- MR. NISH NARENDRABHAI PATEL - LAB ATTENDANT
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Nish Narendrabhai',
    'Patel',
    'nishnarendrabhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '2003-NNP',
      'gender', 'MALE',
      'department', 'DIPLOMA APPLIED SCIENCE &amp...',
      'full_name', 'MR. NISH NARENDRABHAI PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_dip_ash,
    gen_random_uuid(),
    'LAB ATTENDANT',
    true,
    'published',
    jsonb_build_object('employee_code', '2003-NNP')
  )
  ON CONFLICT DO NOTHING;

  -- MS. PARTE PRACHI SHANKAR - LECTURER
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Parte Prachi',
    'Shankar',
    'parteprachishankar@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '2004-PPS',
      'gender', 'FEMALE',
      'department', 'DIPLOMA APPLIED SCIENCE &amp...',
      'full_name', 'MS. PARTE PRACHI SHANKAR'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_dip_ash,
    gen_random_uuid(),
    'LECTURER',
    true,
    'published',
    jsonb_build_object('employee_code', '2004-PPS')
  )
  ON CONFLICT DO NOTHING;

  -- MS. SADEKABANU JAWADHUSEN MUNSHI - LECTURER
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Sadekabanu Jawadhusen',
    'Munshi',
    'sadekabanujawadhusenmunshi@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '2005-SJM',
      'gender', 'FEMALE',
      'department', 'DIPLOMA APPLIED SCIENCE &amp...',
      'full_name', 'MS. SADEKABANU JAWADHUSEN MUNSHI'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_dip_ash,
    gen_random_uuid(),
    'LECTURER',
    true,
    'published',
    jsonb_build_object('employee_code', '2005-SJM')
  )
  ON CONFLICT DO NOTHING;

  -- ============================================
  -- DIPLOMA IN CIVIL (2 staff)
  -- ============================================

  -- MS. DRASTI SANMUKHBHAI CHAUDHARI - LECTURER
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Drasti Sanmukhbhai',
    'Chaudhari',
    'drastisanmukhbhaichaudhari@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '1512-DSC',
      'gender', 'Female',
      'department', 'DIPLOMA IN CIVIL',
      'full_name', 'MS. DRASTI SANMUKHBHAI CHAUDHARI'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_dip_civil,
    gen_random_uuid(),
    'LECTURER',
    true,
    'published',
    jsonb_build_object('employee_code', '1512-DSC')
  )
  ON CONFLICT DO NOTHING;

  -- MS. KRUTI MRUNAL PARIKH - LECTURER
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Kruti Mrunal',
    'Parikh',
    'krutimrunalparikh@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '1701-KMP',
      'gender', 'FEMALE',
      'department', 'DIPLOMA IN CIVIL',
      'full_name', 'MS. KRUTI MRUNAL PARIKH'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_dip_civil,
    gen_random_uuid(),
    'LECTURER',
    true,
    'published',
    jsonb_build_object('employee_code', '1701-KMP')
  )
  ON CONFLICT DO NOTHING;

  -- ============================================
  -- DIPLOMA IN COMPUTER (4 staff)
  -- ============================================

  -- MR. DEEP SATISHBHAI PATEL - LAB ATTENDANT
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Deep Satishbhai',
    'Patel',
    'deepsatishbhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '1502-DSP',
      'gender', 'MALE',
      'department', 'DIPLOMA IN COMPUTER',
      'full_name', 'MR. DEEP SATISHBHAI PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_dip_computer,
    gen_random_uuid(),
    'LAB ATTENDANT',
    true,
    'published',
    jsonb_build_object('employee_code', '1502-DSP')
  )
  ON CONFLICT DO NOTHING;

  -- MS. HEMALIBEN MANSUKHBHAI NIMAVAT - LECTURER
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Hemaliben Mansukhbhai',
    'Nimavat',
    'hemalibenmansukhbhainimavat@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '1504-HMN',
      'gender', 'FEMALE',
      'department', 'DIPLOMA IN COMPUTER',
      'full_name', 'MS. HEMALIBEN MANSUKHBHAI NIMAVAT'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_dip_computer,
    gen_random_uuid(),
    'LECTURER',
    true,
    'published',
    jsonb_build_object('employee_code', '1504-HMN')
  )
  ON CONFLICT DO NOTHING;

  -- MR. DHRUV ANILKUMAR PATEL - LECTURER
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Dhruv Anilkumar',
    'Patel',
    'dhruvanilkumarpatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '1506-DAP',
      'gender', 'MALE',
      'department', 'DIPLOMA IN COMPUTER',
      'full_name', 'MR. DHRUV ANILKUMAR PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_dip_computer,
    gen_random_uuid(),
    'LECTURER',
    true,
    'published',
    jsonb_build_object('employee_code', '1506-DAP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. PRAJAPATI NIKULKUMAR MAHESHBHAI - LECTURER
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Prajapati Nikulkumar',
    'Maheshbhai',
    'prajapatinikulkumarmaheshbhai@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '1508-PNM',
      'gender', 'MALE',
      'department', 'DIPLOMA IN COMPUTER',
      'full_name', 'MR. PRAJAPATI NIKULKUMAR MAHESHBHAI'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_dip_computer,
    gen_random_uuid(),
    'LECTURER',
    true,
    'published',
    jsonb_build_object('employee_code', '1508-PNM')
  )
  ON CONFLICT DO NOTHING;

  -- ============================================
  -- DIPLOMA IN ELECTRICAL (3 staff)
  -- ============================================

  -- MR. KRUNALKUMAR MUKESHBHAI PANDYA - LECTURER
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Krunalkumar Mukeshbhai',
    'Pandya',
    'krunalkumarmukeshbhaipandya@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '1505-KMP',
      'gender', 'MALE',
      'department', 'DIPLOMA IN ELECTRICAL',
      'full_name', 'MR. KRUNALKUMAR MUKESHBHAI PANDYA'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_dip_electrical,
    gen_random_uuid(),
    'LECTURER',
    true,
    'published',
    jsonb_build_object('employee_code', '1505-KMP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. HIMANSHU SHANKARBHAI THAKOR - LECTURER
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Himanshu Shankarbhai',
    'Thakor',
    'himanshushankarbhaithakor@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '1510-HST',
      'gender', 'MALE',
      'department', 'DIPLOMA IN ELECTRICAL',
      'full_name', 'MR. HIMANSHU SHANKARBHAI THAKOR'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_dip_electrical,
    gen_random_uuid(),
    'LECTURER',
    true,
    'published',
    jsonb_build_object('employee_code', '1510-HST')
  )
  ON CONFLICT DO NOTHING;

  -- MS. SHIVANGINI RAJAT MAKWANA - LECTURER
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Shivangini Rajat',
    'Makwana',
    'shivanginirajatmakwana@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '1902-SRM',
      'gender', 'FEMALE',
      'department', 'DIPLOMA IN ELECTRICAL',
      'full_name', 'MS. SHIVANGINI RAJAT MAKWANA'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_dip_electrical,
    gen_random_uuid(),
    'LECTURER',
    true,
    'published',
    jsonb_build_object('employee_code', '1902-SRM')
  )
  ON CONFLICT DO NOTHING;

  -- ============================================
  -- DIPLOMA IN INFORMATION TECHN... (3 staff)
  -- ============================================

  -- MRS. MONIKA PARTH LIMBACHIYA - LECTURER
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Monika Parth',
    'Limbachiya',
    'monikaparthlimbachiya@svitvasad.ac.in',
    'Mrs.',
    jsonb_build_object(
      'employee_code', '1507-MPL',
      'gender', 'FEMALE',
      'department', 'DIPLOMA IN INFORMATION TECHN...',
      'full_name', 'MRS. MONIKA PARTH LIMBACHIYA'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_dip_it,
    gen_random_uuid(),
    'LECTURER',
    true,
    'published',
    jsonb_build_object('employee_code', '1507-MPL')
  )
  ON CONFLICT DO NOTHING;

  -- MRS. NIRIKSHABEN PARTH PATEL - LECTURER
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Nirikshaben Parth',
    'Patel',
    'nirikshabenparthpatel@svitvasad.ac.in',
    'Mrs.',
    jsonb_build_object(
      'employee_code', '1509-NPP',
      'gender', 'FEMALE',
      'department', 'DIPLOMA IN INFORMATION TECHN...',
      'full_name', 'MRS. NIRIKSHABEN PARTH PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_dip_it,
    gen_random_uuid(),
    'LECTURER',
    true,
    'published',
    jsonb_build_object('employee_code', '1509-NPP')
  )
  ON CONFLICT DO NOTHING;

  -- MS. JAHNAVI NAVINCHANDRA BRAHMBHATT - LECTURER
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Jahnavi Navinchandra',
    'Brahmbhatt',
    'jahnavinavinchandrabrahmbhatt@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '1601-JNB',
      'gender', 'FEMALE',
      'department', 'DIPLOMA IN INFORMATION TECHN...',
      'full_name', 'MS. JAHNAVI NAVINCHANDRA BRAHMBHATT'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_dip_it,
    gen_random_uuid(),
    'LECTURER',
    true,
    'published',
    jsonb_build_object('employee_code', '1601-JNB')
  )
  ON CONFLICT DO NOTHING;

  -- ============================================
  -- DIPLOMA IN MECHANICAL (5 staff)
  -- ============================================

  -- MR. JAIMITKUMAR NAGINBHAI PAREKH - LAB ATTENDANT
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Jaimitkumar Naginbhai',
    'Parekh',
    'jaimitkumarnaginbhaiparekh@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '1511-JNP',
      'gender', 'Male',
      'department', 'DIPLOMA IN MECHANICAL',
      'full_name', 'MR. JAIMITKUMAR NAGINBHAI PAREKH'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_dip_mechanical,
    gen_random_uuid(),
    'LAB ATTENDANT',
    true,
    'published',
    jsonb_build_object('employee_code', '1511-JNP')
  )
  ON CONFLICT DO NOTHING;

  -- Mr. RONAKSINH NATVARSINH SOLANKI - LECTURER
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Ronaksinh Natvarsinh',
    'Solanki',
    'ronaksinhnatvarsinhsolanki@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '1513-RNS',
      'gender', 'Male',
      'department', 'DIPLOMA IN MECHANICAL',
      'full_name', 'Mr. RONAKSINH NATVARSINH SOLANKI'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_dip_mechanical,
    gen_random_uuid(),
    'LECTURER',
    true,
    'published',
    jsonb_build_object('employee_code', '1513-RNS')
  )
  ON CONFLICT DO NOTHING;

  -- MR. PRATIK MAHENDRABHAI PATEL - LAB ATTENDANT
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Pratik Mahendrabhai',
    'Patel',
    'pratikmahendrabhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '1801-PMP',
      'gender', 'MALE',
      'department', 'DIPLOMA IN MECHANICAL',
      'full_name', 'MR. PRATIK MAHENDRABHAI PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_dip_mechanical,
    gen_random_uuid(),
    'LAB ATTENDANT',
    true,
    'published',
    jsonb_build_object('employee_code', '1801-PMP')
  )
  ON CONFLICT DO NOTHING;

  -- DR. SHAILEE GHANSHYAMBHAI ACHARYA - LECTURER
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Shailee Ghanshyambhai',
    'Acharya',
    'shaileeghanshyambhaiacharya@svitvasad.ac.in',
    'Dr.',
    jsonb_build_object(
      'employee_code', '375-SGA',
      'gender', 'FEMALE',
      'department', 'DIPLOMA IN MECHANICAL',
      'full_name', 'DR. SHAILEE GHANSHYAMBHAI ACHARYA'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_dip_mechanical,
    gen_random_uuid(),
    'LECTURER',
    true,
    'published',
    jsonb_build_object('employee_code', '375-SGA')
  )
  ON CONFLICT DO NOTHING;

  -- MR. ARPIT HARIVADAN MODI - LECTURER
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Arpit Harivadan',
    'Modi',
    'arpitharivadanmodi@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '377-AHM',
      'gender', 'MALE',
      'department', 'DIPLOMA IN MECHANICAL',
      'full_name', 'MR. ARPIT HARIVADAN MODI'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_dip_mechanical,
    gen_random_uuid(),
    'LECTURER',
    true,
    'published',
    jsonb_build_object('employee_code', '377-AHM')
  )
  ON CONFLICT DO NOTHING;

  -- ============================================
  -- ELECTRICAL ENGINEERING (17 staff)
  -- ============================================

  -- MR. JAYKUMAR JITENDRABHAI PATEL - JUNIOR CLERK
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Jaykumar Jitendrabhai',
    'Patel',
    'jaykumarjitendrabhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '1142-JJP',
      'gender', 'MALE',
      'department', 'ELECTRICAL ENGINEERING',
      'full_name', 'MR. JAYKUMAR JITENDRABHAI PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_electrical,
    gen_random_uuid(),
    'JUNIOR CLERK',
    true,
    'published',
    jsonb_build_object('employee_code', '1142-JJP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. KEVIN SIRISHBHAI PATEL - LAB ATTENDANT
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Kevin Sirishbhai',
    'Patel',
    'kevinsirishbhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '1143-KSP',
      'gender', 'MALE',
      'department', 'ELECTRICAL ENGINEERING',
      'full_name', 'MR. KEVIN SIRISHBHAI PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_electrical,
    gen_random_uuid(),
    'LAB ATTENDANT',
    true,
    'published',
    jsonb_build_object('employee_code', '1143-KSP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. MEET SANJAYBHAI PATEL - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Meet Sanjaybhai',
    'Patel',
    'meetsanjaybhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '1193-MSP',
      'gender', 'MALE',
      'department', 'ELECTRICAL ENGINEERING',
      'full_name', 'MR. MEET SANJAYBHAI PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_electrical,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '1193-MSP')
  )
  ON CONFLICT DO NOTHING;

  -- DR. CHETAN DATTATRAY KOTWAL - PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Chetan Dattatray',
    'Kotwal',
    'chetandattatraykotwal@svitvasad.ac.in',
    'Dr.',
    jsonb_build_object(
      'employee_code', '251-CDK',
      'gender', 'MALE',
      'department', 'ELECTRICAL ENGINEERING',
      'full_name', 'DR. CHETAN DATTATRAY KOTWAL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_electrical,
    gen_random_uuid(),
    'PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '251-CDK')
  )
  ON CONFLICT DO NOTHING;

  -- DR. PIMAL RAMESHBHAI GANDHI - ASSOCIATE PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Pimal Rameshbhai',
    'Gandhi',
    'pimalrameshbhaigandhi@svitvasad.ac.in',
    'Dr.',
    jsonb_build_object(
      'employee_code', '252-PRG',
      'gender', 'MALE',
      'department', 'ELECTRICAL ENGINEERING',
      'full_name', 'DR. PIMAL RAMESHBHAI GANDHI'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_electrical,
    gen_random_uuid(),
    'ASSOCIATE PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '252-PRG')
  )
  ON CONFLICT DO NOTHING;

  -- DR. NILAY NARENDRAKUMAR SHAH - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Nilay Narendrakumar',
    'Shah',
    'nilaynarendrakumarshah@svitvasad.ac.in',
    'Dr.',
    jsonb_build_object(
      'employee_code', '253-NNS',
      'gender', 'MALE',
      'department', 'ELECTRICAL ENGINEERING',
      'full_name', 'DR. NILAY NARENDRAKUMAR SHAH'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_electrical,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '253-NNS')
  )
  ON CONFLICT DO NOTHING;

  -- DR. NIRALI AJAY RATHOD - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Nirali Ajay',
    'Rathod',
    'niraliajayrathod@svitvasad.ac.in',
    'Dr.',
    jsonb_build_object(
      'employee_code', '254-NAR',
      'gender', 'FEMALE',
      'department', 'ELECTRICAL ENGINEERING',
      'full_name', 'DR. NIRALI AJAY RATHOD'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_electrical,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '254-NAR')
  )
  ON CONFLICT DO NOTHING;

  -- MR. RAKESHKUMAR CHANDUBHAI GAJJAR - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Rakeshkumar Chandubhai',
    'Gajjar',
    'rakeshkumarchandubhaigajjar@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '258-RCG',
      'gender', 'MALE',
      'department', 'ELECTRICAL ENGINEERING',
      'full_name', 'MR. RAKESHKUMAR CHANDUBHAI GAJJAR'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_electrical,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '258-RCG')
  )
  ON CONFLICT DO NOTHING;

  -- DR. SHITAL MANISHBHAI PUJARA - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Shital Manishbhai',
    'Pujara',
    'shitalmanishbhaipujara@svitvasad.ac.in',
    'Dr.',
    jsonb_build_object(
      'employee_code', '261-SMP',
      'gender', 'FEMALE',
      'department', 'ELECTRICAL ENGINEERING',
      'full_name', 'DR. SHITAL MANISHBHAI PUJARA'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_electrical,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '261-SMP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. SANJAYKUMAR NATVARLAL PATEL - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Sanjaykumar Natvarlal',
    'Patel',
    'sanjaykumarnatvarlalpatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '265-SNP',
      'gender', 'MALE',
      'department', 'ELECTRICAL ENGINEERING',
      'full_name', 'MR. SANJAYKUMAR NATVARLAL PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_electrical,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '265-SNP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. JIGNESH KANAIYALAL VYAS - SENIOR LAB TECHNICIAN
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Jignesh Kanaiyalal',
    'Vyas',
    'jigneshkanaiyalalvyas@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '272-JKV',
      'gender', 'MALE',
      'department', 'ELECTRICAL ENGINEERING',
      'full_name', 'MR. JIGNESH KANAIYALAL VYAS'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_electrical,
    gen_random_uuid(),
    'SENIOR LAB TECHNICIAN',
    true,
    'published',
    jsonb_build_object('employee_code', '272-JKV')
  )
  ON CONFLICT DO NOTHING;

  -- MR. HITESH SURESHBHAI PATEL - SENIOR LAB TECHNICIAN
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Hitesh Sureshbhai',
    'Patel',
    'hiteshsureshbhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '277-HSP',
      'gender', 'MALE',
      'department', 'ELECTRICAL ENGINEERING',
      'full_name', 'MR. HITESH SURESHBHAI PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_electrical,
    gen_random_uuid(),
    'SENIOR LAB TECHNICIAN',
    true,
    'published',
    jsonb_build_object('employee_code', '277-HSP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. BHARAT HARMANBHAI PATEL - SENIOR LAB TECHNICIAN
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Bharat Harmanbhai',
    'Patel',
    'bharatharmanbhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '278-BHP',
      'gender', 'MALE',
      'department', 'ELECTRICAL ENGINEERING',
      'full_name', 'MR. BHARAT HARMANBHAI PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_electrical,
    gen_random_uuid(),
    'SENIOR LAB TECHNICIAN',
    true,
    'published',
    jsonb_build_object('employee_code', '278-BHP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. NIRAVKUMAR ASHOKKUMAR CHAUHAN - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Niravkumar Ashokkumar',
    'Chauhan',
    'niravkumarashokkumarchauhan@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '279-NAC',
      'gender', 'MALE',
      'department', 'ELECTRICAL ENGINEERING',
      'full_name', 'MR. NIRAVKUMAR ASHOKKUMAR CHAUHAN'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_electrical,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '279-NAC')
  )
  ON CONFLICT DO NOTHING;

  -- MR. JAINESH MUKESHBHAI PATEL - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Jainesh Mukeshbhai',
    'Patel',
    'jaineshmukeshbhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '302-JMP',
      'gender', 'MALE',
      'department', 'ELECTRICAL ENGINEERING',
      'full_name', 'MR. JAINESH MUKESHBHAI PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_electrical,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '302-JMP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. MIHIRKUMAR D SHAH - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Mihirkumar D',
    'Shah',
    'mihirkumardshah@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '308-MDS',
      'gender', 'MALE',
      'department', 'ELECTRICAL ENGINEERING',
      'full_name', 'MR. MIHIRKUMAR D SHAH'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_electrical,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '308-MDS')
  )
  ON CONFLICT DO NOTHING;

  -- Mr. AAKASH NAVINKUMAR MEHTA - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Aakash Navinkumar',
    'Mehta',
    'aakashnavinkumarmehta@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '309-ANM',
      'gender', 'Male',
      'department', 'ELECTRICAL ENGINEERING',
      'full_name', 'Mr. AAKASH NAVINKUMAR MEHTA'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_electrical,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '309-ANM')
  )
  ON CONFLICT DO NOTHING;

  -- ============================================
  -- ELECTRONIC AND COMMUNICATION (7 staff)
  -- ============================================

  -- MR. JIGNESHKUMAR NARENDRAKUMAR PATEL - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Jigneshkumar Narendrakumar',
    'Patel',
    'jigneshkumarnarendrakumarpatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '804-JNP',
      'gender', 'MALE',
      'department', 'ELECTRONIC AND COMMUNICATION',
      'full_name', 'MR. JIGNESHKUMAR NARENDRAKUMAR PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_ec,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '804-JNP')
  )
  ON CONFLICT DO NOTHING;

  -- DR. SAURABH MANILAL PATEL - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Saurabh Manilal',
    'Patel',
    'saurabhmanilalpatel@svitvasad.ac.in',
    'Dr.',
    jsonb_build_object(
      'employee_code', '810-SMP',
      'gender', 'MALE',
      'department', 'ELECTRONIC AND COMMUNICATION',
      'full_name', 'DR. SAURABH MANILAL PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_ec,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '810-SMP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. TUSHAR KAMALKAR KULKARNI - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Tushar Kamalkar',
    'Kulkarni',
    'tusharkamalkarkulkarni@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '811-TKK',
      'gender', 'MALE',
      'department', 'ELECTRONIC AND COMMUNICATION',
      'full_name', 'MR. TUSHAR KAMALKAR KULKARNI'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_ec,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '811-TKK')
  )
  ON CONFLICT DO NOTHING;

  -- MR. TEJASKUMAR SURYAKANT PATEL - SENIOR LAB TECHNICIAN
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Tejaskumar Suryakant',
    'Patel',
    'tejaskumarsuryakantpatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '826-TSP',
      'gender', 'MALE',
      'department', 'ELECTRONIC AND COMMUNICATION',
      'full_name', 'MR. TEJASKUMAR SURYAKANT PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_ec,
    gen_random_uuid(),
    'SENIOR LAB TECHNICIAN',
    true,
    'published',
    jsonb_build_object('employee_code', '826-TSP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. NIRAVKUMAR HARIHAR PANDYA - SENIOR LAB TECHNICIAN
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Niravkumar Harihar',
    'Pandya',
    'niravkumarhariharpandya@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '827-NHP',
      'gender', 'MALE',
      'department', 'ELECTRONIC AND COMMUNICATION',
      'full_name', 'MR. NIRAVKUMAR HARIHAR PANDYA'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_ec,
    gen_random_uuid(),
    'SENIOR LAB TECHNICIAN',
    true,
    'published',
    jsonb_build_object('employee_code', '827-NHP')
  )
  ON CONFLICT DO NOTHING;

  -- Mr. VIRAL MAHESHKUMAR VYAS - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Viral Maheshkumar',
    'Vyas',
    'viralmaheshkumarvyas@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '837-VMV',
      'gender', 'Male',
      'department', 'ELECTRONIC AND COMMUNICATION',
      'full_name', 'Mr. VIRAL MAHESHKUMAR VYAS'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_ec,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '837-VMV')
  )
  ON CONFLICT DO NOTHING;

  -- Mr. ROHITKUMAR MANSUGBHAI JOSHI - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Rohitkumar Mansugbhai',
    'Joshi',
    'rohitkumarmansugbhaijoshi@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '838-RMJ',
      'gender', 'Male',
      'department', 'ELECTRONIC AND COMMUNICATION',
      'full_name', 'Mr. ROHITKUMAR MANSUGBHAI JOSHI'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_ec,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '838-RMJ')
  )
  ON CONFLICT DO NOTHING;

  -- ============================================
  -- INFORMATION TECHNOLOGY (25 staff)
  -- ============================================

  -- MR. PARTH JITENDRABHAI PATEL - LAB ATTENDANT
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Parth Jitendrabhai',
    'Patel',
    'parthjitendrabhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '1199-PJP',
      'gender', 'MALE',
      'department', 'INFORMATION TECHNOLOGY',
      'full_name', 'MR. PARTH JITENDRABHAI PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_it,
    gen_random_uuid(),
    'LAB ATTENDANT',
    true,
    'published',
    jsonb_build_object('employee_code', '1199-PJP')
  )
  ON CONFLICT DO NOTHING;

  -- MS. NISHA VIPUL SHAH - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Nisha Vipul',
    'Shah',
    'nishavipulshah@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '601-NVS',
      'gender', 'FEMALE',
      'department', 'INFORMATION TECHNOLOGY',
      'full_name', 'MS. NISHA VIPUL SHAH'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_it,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '601-NVS')
  )
  ON CONFLICT DO NOTHING;

  -- DR. MALA HASMUKHBHAI MEHTA - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Mala Hasmukhbhai',
    'Mehta',
    'malahasmukhbhaimehta@svitvasad.ac.in',
    'Dr.',
    jsonb_build_object(
      'employee_code', '605-MHM',
      'gender', 'FEMALE',
      'department', 'INFORMATION TECHNOLOGY',
      'full_name', 'DR. MALA HASMUKHBHAI MEHTA'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_it,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '605-MHM')
  )
  ON CONFLICT DO NOTHING;

  -- DR. PATEL FALGUNIBEN MANESHKUMAR - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Patel Falguniben',
    'Maneshkumar',
    'patelfalgunibenmaneshkumar@svitvasad.ac.in',
    'Dr.',
    jsonb_build_object(
      'employee_code', '606-PFM',
      'gender', 'FEMALE',
      'department', 'INFORMATION TECHNOLOGY',
      'full_name', 'DR. PATEL FALGUNIBEN MANESHKUMAR'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_it,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '606-PFM')
  )
  ON CONFLICT DO NOTHING;

  -- MS. GARGI KANTILAL CHAUHAN - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Gargi Kantilal',
    'Chauhan',
    'gargikantilalchauhan@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '607-GKC',
      'gender', 'FEMALE',
      'department', 'INFORMATION TECHNOLOGY',
      'full_name', 'MS. GARGI KANTILAL CHAUHAN'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_it,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '607-GKC')
  )
  ON CONFLICT DO NOTHING;

  -- MS. SNEHA ASHWINBHAI GAYWALA - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Sneha Ashwinbhai',
    'Gaywala',
    'snehaashwinbhaigaywala@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '608-SAG',
      'gender', 'FEMALE',
      'department', 'INFORMATION TECHNOLOGY',
      'full_name', 'MS. SNEHA ASHWINBHAI GAYWALA'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_it,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '608-SAG')
  )
  ON CONFLICT DO NOTHING;

  -- MR. PARESHKUMAR MOTIBHAI PATEL - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Pareshkumar Motibhai',
    'Patel',
    'pareshkumarmotibhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '609-PMP',
      'gender', 'MALE',
      'department', 'INFORMATION TECHNOLOGY',
      'full_name', 'MR. PARESHKUMAR MOTIBHAI PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_it,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '609-PMP')
  )
  ON CONFLICT DO NOTHING;

  -- MS. PARIKH PARITA PANTHESHKUMAR - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Parikh Parita',
    'Pantheshkumar',
    'parikhparitapantheshkumar@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '611-PPP',
      'gender', 'FEMALE',
      'department', 'INFORMATION TECHNOLOGY',
      'full_name', 'MS. PARIKH PARITA PANTHESHKUMAR'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_it,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '611-PPP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. AMITKUMAR INDUBHAI CHAUDHARI - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Amitkumar Indubhai',
    'Chaudhari',
    'amitkumarindubhaichaudhari@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '613-AIC',
      'gender', 'MALE',
      'department', 'INFORMATION TECHNOLOGY',
      'full_name', 'MR. AMITKUMAR INDUBHAI CHAUDHARI'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_it,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '613-AIC')
  )
  ON CONFLICT DO NOTHING;

  -- MR. PRADISH DAMJIBHAI DADHANIA - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Pradish Damjibhai',
    'Dadhania',
    'pradishdamjibhaidadhania@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '614-PDD',
      'gender', 'MALE',
      'department', 'INFORMATION TECHNOLOGY',
      'full_name', 'MR. PRADISH DAMJIBHAI DADHANIA'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_it,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '614-PDD')
  )
  ON CONFLICT DO NOTHING;

  -- MS. PRIYANKA PALAK SHAH - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Priyanka Palak',
    'Shah',
    'priyankapalakshah@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '617-PPS',
      'gender', 'FEMALE',
      'department', 'INFORMATION TECHNOLOGY',
      'full_name', 'MS. PRIYANKA PALAK SHAH'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_it,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '617-PPS')
  )
  ON CONFLICT DO NOTHING;

  -- MR. VIRALKUMAR SHAILESHBHAI PATEL - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Viralkumar Shaileshbhai',
    'Patel',
    'viralkumarshaileshbhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '626-VSP',
      'gender', 'MALE',
      'department', 'INFORMATION TECHNOLOGY',
      'full_name', 'MR. VIRALKUMAR SHAILESHBHAI PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_it,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '626-VSP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. PRASHANT SAMANTSINH RAJ - LAB ATTENDANT
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Prashant Samantsinh',
    'Raj',
    'prashantsamantsinhraj@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '629-PSR',
      'gender', 'MALE',
      'department', 'INFORMATION TECHNOLOGY',
      'full_name', 'MR. PRASHANT SAMANTSINH RAJ'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_it,
    gen_random_uuid(),
    'LAB ATTENDANT',
    true,
    'published',
    jsonb_build_object('employee_code', '629-PSR')
  )
  ON CONFLICT DO NOTHING;

  -- MR. NIRAV JITENDRABHAI PATEL - SENIOR LAB TECHNICIAN
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Nirav Jitendrabhai',
    'Patel',
    'niravjitendrabhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '630-NJP',
      'gender', 'MALE',
      'department', 'INFORMATION TECHNOLOGY',
      'full_name', 'MR. NIRAV JITENDRABHAI PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_it,
    gen_random_uuid(),
    'SENIOR LAB TECHNICIAN',
    true,
    'published',
    jsonb_build_object('employee_code', '630-NJP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. BRIJESH SANATKUMAR PANDYA - COMPUTER OPERATOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Brijesh Sanatkumar',
    'Pandya',
    'brijeshsanatkumarpandya@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '633-BSP',
      'gender', 'MALE',
      'department', 'INFORMATION TECHNOLOGY',
      'full_name', 'MR. BRIJESH SANATKUMAR PANDYA'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_it,
    gen_random_uuid(),
    'COMPUTER OPERATOR',
    true,
    'published',
    jsonb_build_object('employee_code', '633-BSP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. KEVIN CHANDRAKANT PATEL - CCTV OPERATOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Kevin Chandrakant',
    'Patel',
    'kevinchandrakantpatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '642-KCP',
      'gender', 'MALE',
      'department', 'INFORMATION TECHNOLOGY',
      'full_name', 'MR. KEVIN CHANDRAKANT PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_it,
    gen_random_uuid(),
    'CCTV OPERATOR',
    true,
    'published',
    jsonb_build_object('employee_code', '642-KCP')
  )
  ON CONFLICT DO NOTHING;

  -- MS. NIKESHA SANJAYBHAI PATEL - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Nikesha Sanjaybhai',
    'Patel',
    'nikeshasanjaybhaipatel@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '643-NSP',
      'gender', 'FEMALE',
      'department', 'INFORMATION TECHNOLOGY',
      'full_name', 'MS. NIKESHA SANJAYBHAI PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_it,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '643-NSP')
  )
  ON CONFLICT DO NOTHING;

  -- MRS. MITIXA SUDHIR DALAL - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Mitixa Sudhir',
    'Dalal',
    'mitixasudhirdalal@svitvasad.ac.in',
    'Mrs.',
    jsonb_build_object(
      'employee_code', '644-MSD',
      'gender', 'FEMALE',
      'department', 'INFORMATION TECHNOLOGY',
      'full_name', 'MRS. MITIXA SUDHIR DALAL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_it,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '644-MSD')
  )
  ON CONFLICT DO NOTHING;

  -- MS. SHEFALI NIRAVKUMAR RANA - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Shefali Niravkumar',
    'Rana',
    'shefaliniravkumarrana@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '645-SNR',
      'gender', 'FEMALE',
      'department', 'INFORMATION TECHNOLOGY',
      'full_name', 'MS. SHEFALI NIRAVKUMAR RANA'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_it,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '645-SNR')
  )
  ON CONFLICT DO NOTHING;

  -- MRS. ROHINI KANDARPKUMAR PATEL - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Rohini Kandarpkumar',
    'Patel',
    'rohinikandarpkumarpatel@svitvasad.ac.in',
    'Mrs.',
    jsonb_build_object(
      'employee_code', '646-RKP',
      'gender', 'FEMALE',
      'department', 'INFORMATION TECHNOLOGY',
      'full_name', 'MRS. ROHINI KANDARPKUMAR PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_it,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '646-RKP')
  )
  ON CONFLICT DO NOTHING;

  -- MS. NIYATI MUKESHBHAI MEVADA - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Niyati Mukeshbhai',
    'Mevada',
    'niyatimukeshbhaimevada@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '648-NMM',
      'gender', 'FEMALE',
      'department', 'INFORMATION TECHNOLOGY',
      'full_name', 'MS. NIYATI MUKESHBHAI MEVADA'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_it,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '648-NMM')
  )
  ON CONFLICT DO NOTHING;

  -- MRS. SAFEYA KAIF DHARMAJWALA - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Safeya Kaif',
    'Dharmajwala',
    'safeyakaifdharmajwala@svitvasad.ac.in',
    'Mrs.',
    jsonb_build_object(
      'employee_code', '649-SKD',
      'gender', 'FEMALE',
      'department', 'INFORMATION TECHNOLOGY',
      'full_name', 'MRS. SAFEYA KAIF DHARMAJWALA'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_it,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '649-SKD')
  )
  ON CONFLICT DO NOTHING;

  -- DHRUVI KALPESHBHAI PATEL - TEACHING ASSISTANT
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Dhruvi Kalpeshbhai',
    'Patel',
    'dhruvikalpeshbhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '650-DKP',
      'gender', 'Female',
      'department', 'INFORMATION TECHNOLOGY',
      'full_name', 'DHRUVI KALPESHBHAI PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_it,
    gen_random_uuid(),
    'TEACHING ASSISTANT',
    true,
    'published',
    jsonb_build_object('employee_code', '650-DKP')
  )
  ON CONFLICT DO NOTHING;

  -- Mrs. SNEHA SANTOSH NAIR - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Sneha Santosh',
    'Nair',
    'snehasantoshnair@svitvasad.ac.in',
    'Mrs.',
    jsonb_build_object(
      'employee_code', '651-SSN',
      'gender', 'Female',
      'department', 'INFORMATION TECHNOLOGY',
      'full_name', 'Mrs. SNEHA SANTOSH NAIR'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_it,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '651-SSN')
  )
  ON CONFLICT DO NOTHING;

  -- MR. ALKESH CHANDUBHAI PATEL - SENIOR LAB TECHNICIAN
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Alkesh Chandubhai',
    'Patel',
    'alkeshchandubhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '828-ACP',
      'gender', 'MALE',
      'department', 'INFORMATION TECHNOLOGY',
      'full_name', 'MR. ALKESH CHANDUBHAI PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_it,
    gen_random_uuid(),
    'SENIOR LAB TECHNICIAN',
    true,
    'published',
    jsonb_build_object('employee_code', '828-ACP')
  )
  ON CONFLICT DO NOTHING;

  -- ============================================
  -- INSTRUMENTATION AND CONTROL (1 staff)
  -- ============================================

  -- MR. CHETAN THAKORLAL THAKKAR - JUNIOR CLERK
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Chetan Thakorlal',
    'Thakkar',
    'chetanthakorlalthakkar@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '215-CTT',
      'gender', 'MALE',
      'department', 'INSTRUMENTATION AND CONTROL',
      'full_name', 'MR. CHETAN THAKORLAL THAKKAR'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_ic,
    gen_random_uuid(),
    'JUNIOR CLERK',
    true,
    'published',
    jsonb_build_object('employee_code', '215-CTT')
  )
  ON CONFLICT DO NOTHING;

  -- ============================================
  -- MASTER OF BUSINESS ADMINISTR... (7 staff)
  -- ============================================

  -- DR. DEEPA J NAYAK - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Deepa J',
    'Nayak',
    'deepajnayak@svitvasad.ac.in',
    'Dr.',
    jsonb_build_object(
      'employee_code', '2101-DDB',
      'gender', 'FEMALE',
      'department', 'MASTER OF BUSINESS ADMINISTR...',
      'full_name', 'DR. DEEPA J NAYAK'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_mba,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '2101-DDB')
  )
  ON CONFLICT DO NOTHING;

  -- MS. ISHA BHUPESHBHAI PATEL - JUNIOR CLERK
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Isha Bhupeshbhai',
    'Patel',
    'ishabhupeshbhaipatel@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '2102-IBP',
      'gender', 'FEMALE',
      'department', 'MASTER OF BUSINESS ADMINISTR...',
      'full_name', 'MS. ISHA BHUPESHBHAI PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_mba,
    gen_random_uuid(),
    'JUNIOR CLERK',
    true,
    'published',
    jsonb_build_object('employee_code', '2102-IBP')
  )
  ON CONFLICT DO NOTHING;

  -- MS. HARMI ANILBHAI SADARANI - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Harmi Anilbhai',
    'Sadarani',
    'harmianilbhaisadarani@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '2105-HAS',
      'gender', 'FEMALE',
      'department', 'MASTER OF BUSINESS ADMINISTR...',
      'full_name', 'MS. HARMI ANILBHAI SADARANI'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_mba,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '2105-HAS')
  )
  ON CONFLICT DO NOTHING;

  -- MRS. NIKETA PRATIK PATELMRS. NIKETA PRATIK PATEL - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Niketa Pratik Patelmrs. Niketa Pratik',
    'Patel',
    'niketapratikpatelmrsniketapratikpatel@svitvasad.ac.in',
    'Mrs.',
    jsonb_build_object(
      'employee_code', '2107-NPP',
      'gender', 'Female',
      'department', 'MASTER OF BUSINESS ADMINISTR...',
      'full_name', 'MRS. NIKETA PRATIK PATELMRS. NIKETA PRATIK PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_mba,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '2107-NPP')
  )
  ON CONFLICT DO NOTHING;

  -- Ms. DHRUTI PANKAJBHAI RATHWA - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Dhruti Pankajbhai',
    'Rathwa',
    'dhrutipankajbhairathwa@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '2108-DPR',
      'gender', 'Female',
      'department', 'MASTER OF BUSINESS ADMINISTR...',
      'full_name', 'Ms. DHRUTI PANKAJBHAI RATHWA'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_mba,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '2108-DPR')
  )
  ON CONFLICT DO NOTHING;

  -- Mr. SAMAR HARIKRUSHNABHAI PANJABI - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Samar Harikrushnabhai',
    'Panjabi',
    'samarharikrushnabhaipanjabi@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '2109-SHP',
      'gender', 'Male',
      'department', 'MASTER OF BUSINESS ADMINISTR...',
      'full_name', 'Mr. SAMAR HARIKRUSHNABHAI PANJABI'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_mba,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '2109-SHP')
  )
  ON CONFLICT DO NOTHING;

  -- DR. ARUN K ADHIKARY - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Arun K',
    'Adhikary',
    'arunkadhikary@svitvasad.ac.in',
    'Dr.',
    jsonb_build_object(
      'employee_code', '925-AKA',
      'gender', 'MALE',
      'department', 'MASTER OF BUSINESS ADMINISTR...',
      'full_name', 'DR. ARUN K ADHIKARY'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_mba,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '925-AKA')
  )
  ON CONFLICT DO NOTHING;

  -- ============================================
  -- MASTER OF COMPUTER APPLICATION (9 staff)
  -- ============================================

  -- MR. BIGAN RAJENDRABHAI PATEL - JUNIOR CLERK
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Bigan Rajendrabhai',
    'Patel',
    'biganrajendrabhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '1148-BRP',
      'gender', 'MALE',
      'department', 'MASTER OF COMPUTER APPLICATION',
      'full_name', 'MR. BIGAN RAJENDRABHAI PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_mca,
    gen_random_uuid(),
    'JUNIOR CLERK',
    true,
    'published',
    jsonb_build_object('employee_code', '1148-BRP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. KALPESH NAVNITBHAI PATEL - LAB ATTENDANT
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Kalpesh Navnitbhai',
    'Patel',
    'kalpeshnavnitbhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '1200-KNP',
      'gender', 'MALE',
      'department', 'MASTER OF COMPUTER APPLICATION',
      'full_name', 'MR. KALPESH NAVNITBHAI PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_mca,
    gen_random_uuid(),
    'LAB ATTENDANT',
    true,
    'published',
    jsonb_build_object('employee_code', '1200-KNP')
  )
  ON CONFLICT DO NOTHING;

  -- DR. RUPAM SENGUPTA - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Rupam',
    'Sengupta',
    'rupamsengupta@svitvasad.ac.in',
    'Dr.',
    jsonb_build_object(
      'employee_code', '152-RSG',
      'gender', 'Female',
      'department', 'MASTER OF COMPUTER APPLICATION',
      'full_name', 'DR. RUPAM SENGUPTA'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_mca,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '152-RSG')
  )
  ON CONFLICT DO NOTHING;

  -- DR. JONITA VATSAL ROMAN - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Jonita Vatsal',
    'Roman',
    'jonitavatsalroman@svitvasad.ac.in',
    'Dr.',
    jsonb_build_object(
      'employee_code', '155-JVR',
      'gender', 'FEMALE',
      'department', 'MASTER OF COMPUTER APPLICATION',
      'full_name', 'DR. JONITA VATSAL ROMAN'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_mca,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '155-JVR')
  )
  ON CONFLICT DO NOTHING;

  -- MR. NIL SURESHGIR GOSAI - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Nil Sureshgir',
    'Gosai',
    'nilsureshgirgosai@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '161-NSG',
      'gender', 'MALE',
      'department', 'MASTER OF COMPUTER APPLICATION',
      'full_name', 'MR. NIL SURESHGIR GOSAI'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_mca,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '161-NSG')
  )
  ON CONFLICT DO NOTHING;

  -- MR. NAGIN KANTIBHAI PARMAR - HAMAL
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Nagin Kantibhai',
    'Parmar',
    'naginkantibhaiparmar@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '163-NKP',
      'gender', 'MALE',
      'department', 'MASTER OF COMPUTER APPLICATION',
      'full_name', 'MR. NAGIN KANTIBHAI PARMAR'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_mca,
    gen_random_uuid(),
    'HAMAL',
    true,
    'published',
    jsonb_build_object('employee_code', '163-NKP')
  )
  ON CONFLICT DO NOTHING;

  -- MS. PAYAL ISAAC CHAUHAN - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Payal Isaac',
    'Chauhan',
    'payalisaacchauhan@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '166-PIC',
      'gender', 'FEMALE',
      'department', 'MASTER OF COMPUTER APPLICATION',
      'full_name', 'MS. PAYAL ISAAC CHAUHAN'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_mca,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '166-PIC')
  )
  ON CONFLICT DO NOTHING;

  -- MRS. ZANKHANABEN ASHISHKUMAR BHATT - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Zankhanaben Ashishkumar',
    'Bhatt',
    'zankhanabenashishkumarbhatt@svitvasad.ac.in',
    'Mrs.',
    jsonb_build_object(
      'employee_code', '168-ZAB',
      'gender', 'FEMALE',
      'department', 'MASTER OF COMPUTER APPLICATION',
      'full_name', 'MRS. ZANKHANABEN ASHISHKUMAR BHATT'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_mca,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '168-ZAB')
  )
  ON CONFLICT DO NOTHING;

  -- MS. KHUSHBU BHAVIN PATEL - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Khushbu Bhavin',
    'Patel',
    'khushbubhavinpatel@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '4003-KBP',
      'gender', 'FEMALE',
      'department', 'MASTER OF COMPUTER APPLICATION',
      'full_name', 'MS. KHUSHBU BHAVIN PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_mca,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '4003-KBP')
  )
  ON CONFLICT DO NOTHING;

  -- ============================================
  -- MECHANICAL ENGINEERING (25 staff)
  -- ============================================

  -- MR. JAY M PANDYA - LAB ATTENDANT
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Jay M',
    'Pandya',
    'jaympandya@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '1147-JMP',
      'gender', 'MALE',
      'department', 'MECHANICAL ENGINEERING',
      'full_name', 'MR. JAY M PANDYA'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_mechanical,
    gen_random_uuid(),
    'LAB ATTENDANT',
    true,
    'published',
    jsonb_build_object('employee_code', '1147-JMP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. DIPAKKUMAR RAMESHBHAI PATEL - SENIOR CLERK
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Dipakkumar Rameshbhai',
    'Patel',
    'dipakkumarrameshbhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '114-DRP',
      'gender', 'MALE',
      'department', 'MECHANICAL ENGINEERING',
      'full_name', 'MR. DIPAKKUMAR RAMESHBHAI PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_mechanical,
    gen_random_uuid(),
    'SENIOR CLERK',
    true,
    'published',
    jsonb_build_object('employee_code', '114-DRP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. TEJ I PATEL - JUNIOR DRAFTSMAN
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Tej I',
    'Patel',
    'tejipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '1160-TIP',
      'gender', 'MALE',
      'department', 'MECHANICAL ENGINEERING',
      'full_name', 'MR. TEJ I PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_mechanical,
    gen_random_uuid(),
    'JUNIOR DRAFTSMAN',
    true,
    'published',
    jsonb_build_object('employee_code', '1160-TIP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. SHARMIL VIRENDRABHAI PATEL - WORKSHOP ATTENDANT
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Sharmil Virendrabhai',
    'Patel',
    'sharmilvirendrabhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '1173-SVP',
      'gender', 'MALE',
      'department', 'MECHANICAL ENGINEERING',
      'full_name', 'MR. SHARMIL VIRENDRABHAI PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_mechanical,
    gen_random_uuid(),
    'WORKSHOP ATTENDANT',
    true,
    'published',
    jsonb_build_object('employee_code', '1173-SVP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. DHRUV KAMLESHKUMAR PATEL - LAB ATTENDANT
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Dhruv Kamleshkumar',
    'Patel',
    'dhruvkamleshkumarpatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '1196-DKP',
      'gender', 'MALE',
      'department', 'MECHANICAL ENGINEERING',
      'full_name', 'MR. DHRUV KAMLESHKUMAR PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_mechanical,
    gen_random_uuid(),
    'LAB ATTENDANT',
    true,
    'published',
    jsonb_build_object('employee_code', '1196-DKP')
  )
  ON CONFLICT DO NOTHING;

  -- DR. VENKATA RAMANA RAMARAO PALADUGULA - PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Venkata Ramana Ramarao',
    'Paladugula',
    'venkataramanaramaraopaladugula@svitvasad.ac.in',
    'Dr.',
    jsonb_build_object(
      'employee_code', '351-VRP',
      'gender', 'MALE',
      'department', 'MECHANICAL ENGINEERING',
      'full_name', 'DR. VENKATA RAMANA RAMARAO PALADUGULA'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_mechanical,
    gen_random_uuid(),
    'PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '351-VRP')
  )
  ON CONFLICT DO NOTHING;

  -- DR. PRATIK HARSHADBHAI SHAH - ASSOCIATE PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Pratik Harshadbhai',
    'Shah',
    'pratikharshadbhaishah@svitvasad.ac.in',
    'Dr.',
    jsonb_build_object(
      'employee_code', '354-PHS',
      'gender', 'MALE',
      'department', 'MECHANICAL ENGINEERING',
      'full_name', 'DR. PRATIK HARSHADBHAI SHAH'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_mechanical,
    gen_random_uuid(),
    'ASSOCIATE PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '354-PHS')
  )
  ON CONFLICT DO NOTHING;

  -- MRS. SEJAL KEYUR SHAH - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Sejal Keyur',
    'Shah',
    'sejalkeyurshah@svitvasad.ac.in',
    'Mrs.',
    jsonb_build_object(
      'employee_code', '355-SKS',
      'gender', 'FEMALE',
      'department', 'MECHANICAL ENGINEERING',
      'full_name', 'MRS. SEJAL KEYUR SHAH'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_mechanical,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '355-SKS')
  )
  ON CONFLICT DO NOTHING;

  -- DR. DIPENKUMAR SEVANTILAL SHAH - ASSOCIATE PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Dipenkumar Sevantilal',
    'Shah',
    'dipenkumarsevantilalshah@svitvasad.ac.in',
    'Dr.',
    jsonb_build_object(
      'employee_code', '356-DSS',
      'gender', 'MALE',
      'department', 'MECHANICAL ENGINEERING',
      'full_name', 'DR. DIPENKUMAR SEVANTILAL SHAH'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_mechanical,
    gen_random_uuid(),
    'ASSOCIATE PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '356-DSS')
  )
  ON CONFLICT DO NOTHING;

  -- DR. SEKAR PRAKASH SALADI - ASSOCIATE PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Sekar Prakash',
    'Saladi',
    'sekarprakashsaladi@svitvasad.ac.in',
    'Dr.',
    jsonb_build_object(
      'employee_code', '358-SPS',
      'gender', 'MALE',
      'department', 'MECHANICAL ENGINEERING',
      'full_name', 'DR. SEKAR PRAKASH SALADI'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_mechanical,
    gen_random_uuid(),
    'ASSOCIATE PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '358-SPS')
  )
  ON CONFLICT DO NOTHING;

  -- DR. JITENDRA MANUBHAI MISTRY - ASSOCIATE PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Jitendra Manubhai',
    'Mistry',
    'jitendramanubhaimistry@svitvasad.ac.in',
    'Dr.',
    jsonb_build_object(
      'employee_code', '360-JMM',
      'gender', 'MALE',
      'department', 'MECHANICAL ENGINEERING',
      'full_name', 'DR. JITENDRA MANUBHAI MISTRY'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_mechanical,
    gen_random_uuid(),
    'ASSOCIATE PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '360-JMM')
  )
  ON CONFLICT DO NOTHING;

  -- MR. DHAVAL RAJENDRABHAI JOSHI - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Dhaval Rajendrabhai',
    'Joshi',
    'dhavalrajendrabhaijoshi@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '362-DRJ',
      'gender', 'MALE',
      'department', 'MECHANICAL ENGINEERING',
      'full_name', 'MR. DHAVAL RAJENDRABHAI JOSHI'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_mechanical,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '362-DRJ')
  )
  ON CONFLICT DO NOTHING;

  -- MR. SAURABH ANILKUMAR BAN - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Saurabh Anilkumar',
    'Ban',
    'saurabhanilkumarban@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '364-SAB',
      'gender', 'MALE',
      'department', 'MECHANICAL ENGINEERING',
      'full_name', 'MR. SAURABH ANILKUMAR BAN'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_mechanical,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '364-SAB')
  )
  ON CONFLICT DO NOTHING;

  -- MR. TEJAS JAYANT GHOTIKAR - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Tejas Jayant',
    'Ghotikar',
    'tejasjayantghotikar@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '365-TJG',
      'gender', 'MALE',
      'department', 'MECHANICAL ENGINEERING',
      'full_name', 'MR. TEJAS JAYANT GHOTIKAR'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_mechanical,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '365-TJG')
  )
  ON CONFLICT DO NOTHING;

  -- DR. CHETAN OMPRAKASH YADAV - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Chetan Omprakash',
    'Yadav',
    'chetanomprakashyadav@svitvasad.ac.in',
    'Dr.',
    jsonb_build_object(
      'employee_code', '373-COY',
      'gender', 'MALE',
      'department', 'MECHANICAL ENGINEERING',
      'full_name', 'DR. CHETAN OMPRAKASH YADAV'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_mechanical,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '373-COY')
  )
  ON CONFLICT DO NOTHING;

  -- MR. DEVANG ARVINDBHAI PATEL - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Devang Arvindbhai',
    'Patel',
    'devangarvindbhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '376-DAP',
      'gender', 'MALE',
      'department', 'MECHANICAL ENGINEERING',
      'full_name', 'MR. DEVANG ARVINDBHAI PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_mechanical,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '376-DAP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. AJAYKUMAR MANANDBHAI SOLANKI - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Ajaykumar Manandbhai',
    'Solanki',
    'ajaykumarmanandbhaisolanki@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '378-AMS',
      'gender', 'MALE',
      'department', 'MECHANICAL ENGINEERING',
      'full_name', 'MR. AJAYKUMAR MANANDBHAI SOLANKI'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_mechanical,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '378-AMS')
  )
  ON CONFLICT DO NOTHING;

  -- MRS. HETAL RANJITSINGH CHAUHAN - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Hetal Ranjitsingh',
    'Chauhan',
    'hetalranjitsinghchauhan@svitvasad.ac.in',
    'Mrs.',
    jsonb_build_object(
      'employee_code', '381-HRC',
      'gender', 'FEMALE',
      'department', 'MECHANICAL ENGINEERING',
      'full_name', 'MRS. HETAL RANJITSINGH CHAUHAN'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_mechanical,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '381-HRC')
  )
  ON CONFLICT DO NOTHING;

  -- MR. JIGNESH SURESHBHAI THAKKAR - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Jignesh Sureshbhai',
    'Thakkar',
    'jigneshsureshbhaithakkar@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '389-JST',
      'gender', 'MALE',
      'department', 'MECHANICAL ENGINEERING',
      'full_name', 'MR. JIGNESH SURESHBHAI THAKKAR'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_mechanical,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '389-JST')
  )
  ON CONFLICT DO NOTHING;

  -- MR. SURESH KESHAVBHAI PARMAR - WORKSHOP ATTENDANT
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Suresh Keshavbhai',
    'Parmar',
    'sureshkeshavbhaiparmar@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '399-SKP',
      'gender', 'MALE',
      'department', 'MECHANICAL ENGINEERING',
      'full_name', 'MR. SURESH KESHAVBHAI PARMAR'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_mechanical,
    gen_random_uuid(),
    'WORKSHOP ATTENDANT',
    true,
    'published',
    jsonb_build_object('employee_code', '399-SKP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. RAMESH FULABHAI BHOI - WORKSHOP ATTENDANT
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Ramesh Fulabhai',
    'Bhoi',
    'rameshfulabhaibhoi@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '400-RFB',
      'gender', 'MALE',
      'department', 'MECHANICAL ENGINEERING',
      'full_name', 'MR. RAMESH FULABHAI BHOI'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_mechanical,
    gen_random_uuid(),
    'WORKSHOP ATTENDANT',
    true,
    'published',
    jsonb_build_object('employee_code', '400-RFB')
  )
  ON CONFLICT DO NOTHING;

  -- MR. JITENDRA KANUBHAI CHAUHAN - WORKSHOP ATTENDANT
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Jitendra Kanubhai',
    'Chauhan',
    'jitendrakanubhaichauhan@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '402-JKC',
      'gender', 'MALE',
      'department', 'MECHANICAL ENGINEERING',
      'full_name', 'MR. JITENDRA KANUBHAI CHAUHAN'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_mechanical,
    gen_random_uuid(),
    'WORKSHOP ATTENDANT',
    true,
    'published',
    jsonb_build_object('employee_code', '402-JKC')
  )
  ON CONFLICT DO NOTHING;

  -- MR. PRIYAL RAMANBHAI PATEL - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Priyal Ramanbhai',
    'Patel',
    'priyalramanbhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '406-PRP',
      'gender', 'MALE',
      'department', 'MECHANICAL ENGINEERING',
      'full_name', 'MR. PRIYAL RAMANBHAI PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_mechanical,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '406-PRP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. DARSHAN ASHOKBHAI PATEL - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Darshan Ashokbhai',
    'Patel',
    'darshanashokbhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '407-DAP',
      'gender', 'MALE',
      'department', 'MECHANICAL ENGINEERING',
      'full_name', 'MR. DARSHAN ASHOKBHAI PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_mechanical,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '407-DAP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. DIPAK MAHENDRA PATEL - LAB ATTENDANT
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Dipak Mahendra',
    'Patel',
    'dipakmahendrapatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '417-DMP',
      'gender', 'MALE',
      'department', 'MECHANICAL ENGINEERING',
      'full_name', 'MR. DIPAK MAHENDRA PATEL'
    ),
    'published'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    title = EXCLUDED.title,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_staff_id;

  INSERT INTO staff_department_assignments (
    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata
  )
  VALUES (
    v_staff_id,
    v_dept_svit_be_mechanical,
    gen_random_uuid(),
    'LAB ATTENDANT',
    true,
    'published',
    jsonb_build_object('employee_code', '417-DMP')
  )
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Successfully seeded 201 SVIT faculty members across 18 departments';

END $$;