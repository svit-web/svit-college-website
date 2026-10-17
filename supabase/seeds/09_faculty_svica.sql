-- Seed SVICA faculty and staff
-- Generated from: Employee_List_by_Department.xlsx
-- Date: 2026-09-17
-- Total staff: 11 across 1 departments
-- Status: Working only (Resigned employees excluded)

DO $$
DECLARE
  v_dept_svica_ca uuid;
  v_staff_id uuid;
BEGIN
  -- Get department IDs
  SELECT id INTO v_dept_svica_ca FROM departments WHERE slug = 'dept-svica-ca';

  -- ============================================
  -- BACHELOR OF COMPUTER APPLICA... (11 staff)
  -- ============================================

  -- MR. RASHMIN SHANTILAL PARMAR - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Rashmin Shantilal',
    'Parmar',
    'rashminshantilalparmar@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '4002-RSP',
      'gender', 'MALE',
      'department', 'BACHELOR OF COMPUTER APPLICA...',
      'full_name', 'MR. RASHMIN SHANTILAL PARMAR'
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
    v_dept_svica_ca,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '4002-RSP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. SANDIPKUMAR VINUBHAI SUTHAR - LAB TECHNICIAN
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Sandipkumar Vinubhai',
    'Suthar',
    'sandipkumarvinubhaisuthar@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '4004-SVS',
      'gender', 'MALE',
      'department', 'BACHELOR OF COMPUTER APPLICA...',
      'full_name', 'MR. SANDIPKUMAR VINUBHAI SUTHAR'
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
    v_dept_svica_ca,
    gen_random_uuid(),
    'LAB TECHNICIAN',
    true,
    'published',
    jsonb_build_object('employee_code', '4004-SVS')
  )
  ON CONFLICT DO NOTHING;

  -- MR. KANUBHAI NAGINBHAI DHOBI - LAB ATTENDANT
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Kanubhai Naginbhai',
    'Dhobi',
    'kanubhainaginbhaidhobi@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '4005-KND',
      'gender', 'MALE',
      'department', 'BACHELOR OF COMPUTER APPLICA...',
      'full_name', 'MR. KANUBHAI NAGINBHAI DHOBI'
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
    v_dept_svica_ca,
    gen_random_uuid(),
    'LAB ATTENDANT',
    true,
    'published',
    jsonb_build_object('employee_code', '4005-KND')
  )
  ON CONFLICT DO NOTHING;

  -- MR. AMIT KANTIBHAI PATEL - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Amit Kantibhai',
    'Patel',
    'amitkantibhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '4006-AKP',
      'gender', 'MALE',
      'department', 'BACHELOR OF COMPUTER APPLICA...',
      'full_name', 'MR. AMIT KANTIBHAI PATEL'
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
    v_dept_svica_ca,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '4006-AKP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. GHANSHYAMBHAI VIRENDRAKUMAR THAKAR - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Ghanshyambhai Virendrakumar',
    'Thakar',
    'ghanshyambhaivirendrakumarthakar@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '4007-GVT',
      'gender', 'MALE',
      'department', 'BACHELOR OF COMPUTER APPLICA...',
      'full_name', 'MR. GHANSHYAMBHAI VIRENDRAKUMAR THAKAR'
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
    v_dept_svica_ca,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '4007-GVT')
  )
  ON CONFLICT DO NOTHING;

  -- MS. JANISH BHUPENDRABHAI MACWAN - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Janish Bhupendrabhai',
    'Macwan',
    'janishbhupendrabhaimacwan@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '4010-JBM',
      'gender', 'FEMALE',
      'department', 'BACHELOR OF COMPUTER APPLICA...',
      'full_name', 'MS. JANISH BHUPENDRABHAI MACWAN'
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
    v_dept_svica_ca,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '4010-JBM')
  )
  ON CONFLICT DO NOTHING;

  -- MR. HIREN SUBHASHBHAI PATEL - LAB ATTENDANT
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Hiren Subhashbhai',
    'Patel',
    'hirensubhashbhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '4011-HSP',
      'gender', 'MALE',
      'department', 'BACHELOR OF COMPUTER APPLICA...',
      'full_name', 'MR. HIREN SUBHASHBHAI PATEL'
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
    v_dept_svica_ca,
    gen_random_uuid(),
    'LAB ATTENDANT',
    true,
    'published',
    jsonb_build_object('employee_code', '4011-HSP')
  )
  ON CONFLICT DO NOTHING;

  -- MS. NEHAL PANKAJBHAI DAULATJADA - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Nehal Pankajbhai',
    'Daulatjada',
    'nehalpankajbhaidaulatjada@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '4012-NPD',
      'gender', 'FEMALE',
      'department', 'BACHELOR OF COMPUTER APPLICA...',
      'full_name', 'MS. NEHAL PANKAJBHAI DAULATJADA'
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
    v_dept_svica_ca,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '4012-NPD')
  )
  ON CONFLICT DO NOTHING;

  -- MR. RACHIT BABUBHAI PRAJAPATI - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Rachit Babubhai',
    'Prajapati',
    'rachitbabubhaiprajapati@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '4013-RBP',
      'gender', 'Male',
      'department', 'BACHELOR OF COMPUTER APPLICA...',
      'full_name', 'MR. RACHIT BABUBHAI PRAJAPATI'
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
    v_dept_svica_ca,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '4013-RBP')
  )
  ON CONFLICT DO NOTHING;

  -- MS. FIZA YUNUSBHAI VHORA - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Fiza Yunusbhai',
    'Vhora',
    'fizayunusbhaivhora@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '4015-FYV',
      'gender', 'FEMALE',
      'department', 'BACHELOR OF COMPUTER APPLICA...',
      'full_name', 'MS. FIZA YUNUSBHAI VHORA'
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
    v_dept_svica_ca,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '4015-FYV')
  )
  ON CONFLICT DO NOTHING;

  -- MR. HEMANGKUMAR JAYESHBHAI PATEL - LAB ATTENDANT
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Hemangkumar Jayeshbhai',
    'Patel',
    'hemangkumarjayeshbhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '91-HJP',
      'gender', 'MALE',
      'department', 'BACHELOR OF COMPUTER APPLICA...',
      'full_name', 'MR. HEMANGKUMAR JAYESHBHAI PATEL'
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
    v_dept_svica_ca,
    gen_random_uuid(),
    'LAB ATTENDANT',
    true,
    'published',
    jsonb_build_object('employee_code', '91-HJP')
  )
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Successfully seeded 11 SVICA faculty members across 1 departments';

END $$;