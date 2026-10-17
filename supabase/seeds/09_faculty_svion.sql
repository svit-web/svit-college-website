-- Seed SVION faculty and staff
-- Generated from: Employee_List_by_Department.xlsx
-- Date: 2026-09-17
-- Total staff: 29 across 1 departments
-- Status: Working only (Resigned employees excluded)

DO $$
DECLARE
  v_dept_svion_gn uuid;
  v_staff_id uuid;
BEGIN
  -- Get department IDs
  SELECT id INTO v_dept_svion_gn FROM departments WHERE slug = 'dept-svion-gn';

  -- ============================================
  -- BACHELOR OF SCIENCE IN NURSING (29 staff)
  -- ============================================

  -- MR. CHETANKUMAR PUSHPAKANTBHAI PATEL - OFFICER ON SPECIAL DUTY
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Chetankumar Pushpakantbhai',
    'Patel',
    'chetankumarpushpakantbhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '1001-CPP',
      'gender', 'MALE',
      'department', 'BACHELOR OF SCIENCE IN NURSING',
      'full_name', 'MR. CHETANKUMAR PUSHPAKANTBHAI PATEL'
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
    v_dept_svion_gn,
    gen_random_uuid(),
    'OFFICER ON SPECIAL DUTY',
    true,
    'published',
    jsonb_build_object('employee_code', '1001-CPP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. PRITESHKUMAR ARUNBHAI PATEL - LIBRARY ATTENDANT
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Priteshkumar Arunbhai',
    'Patel',
    'priteshkumararunbhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '100-PAP',
      'gender', 'MALE',
      'department', 'BACHELOR OF SCIENCE IN NURSING',
      'full_name', 'MR. PRITESHKUMAR ARUNBHAI PATEL'
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
    v_dept_svion_gn,
    gen_random_uuid(),
    'LIBRARY ATTENDANT',
    true,
    'published',
    jsonb_build_object('employee_code', '100-PAP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. MOHAN PARSOTTAMBHAI HARIJAN - SWEEPER
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Mohan Parsottambhai',
    'Harijan',
    'mohanparsottambhaiharijan@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '1033-MPH',
      'gender', 'MALE',
      'department', 'BACHELOR OF SCIENCE IN NURSING',
      'full_name', 'MR. MOHAN PARSOTTAMBHAI HARIJAN'
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
    v_dept_svion_gn,
    gen_random_uuid(),
    'SWEEPER',
    true,
    'published',
    jsonb_build_object('employee_code', '1033-MPH')
  )
  ON CONFLICT DO NOTHING;

  -- MR. AMITKUMAR JAGDISHBHAI PARMAR - HAMAL
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Amitkumar Jagdishbhai',
    'Parmar',
    'amitkumarjagdishbhaiparmar@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '1068-AJP',
      'gender', 'MALE',
      'department', 'BACHELOR OF SCIENCE IN NURSING',
      'full_name', 'MR. AMITKUMAR JAGDISHBHAI PARMAR'
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
    v_dept_svion_gn,
    gen_random_uuid(),
    'HAMAL',
    true,
    'published',
    jsonb_build_object('employee_code', '1068-AJP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. PRITESHKUMAR RAMESHBHAI BHOI - HAMAL
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Priteshkumar Rameshbhai',
    'Bhoi',
    'priteshkumarrameshbhaibhoi@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '1070-PRB',
      'gender', 'MALE',
      'department', 'BACHELOR OF SCIENCE IN NURSING',
      'full_name', 'MR. PRITESHKUMAR RAMESHBHAI BHOI'
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
    v_dept_svion_gn,
    gen_random_uuid(),
    'HAMAL',
    true,
    'published',
    jsonb_build_object('employee_code', '1070-PRB')
  )
  ON CONFLICT DO NOTHING;

  -- MR. BHAVESHBHAI BUDHABHAI GOHEL - HAMAL
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Bhaveshbhai Budhabhai',
    'Gohel',
    'bhaveshbhaibudhabhaigohel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '1074-BBG',
      'gender', 'MALE',
      'department', 'BACHELOR OF SCIENCE IN NURSING',
      'full_name', 'MR. BHAVESHBHAI BUDHABHAI GOHEL'
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
    v_dept_svion_gn,
    gen_random_uuid(),
    'HAMAL',
    true,
    'published',
    jsonb_build_object('employee_code', '1074-BBG')
  )
  ON CONFLICT DO NOTHING;

  -- MRS. DIPALI NITINBHAI PATEL - JUNIOR CLERK
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Dipali Nitinbhai',
    'Patel',
    'dipalinitinbhaipatel@svitvasad.ac.in',
    'Mrs.',
    jsonb_build_object(
      'employee_code', '3007-DNP',
      'gender', 'FEMALE',
      'department', 'BACHELOR OF SCIENCE IN NURSING',
      'full_name', 'MRS. DIPALI NITINBHAI PATEL'
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
    v_dept_svion_gn,
    gen_random_uuid(),
    'JUNIOR CLERK',
    true,
    'published',
    jsonb_build_object('employee_code', '3007-DNP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. TAKSHAKBHAI MAHENDRABHAI MAKWANA - TUTOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Takshakbhai Mahendrabhai',
    'Makwana',
    'takshakbhaimahendrabhaimakwana@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '3013-TMM',
      'gender', 'MALE',
      'department', 'BACHELOR OF SCIENCE IN NURSING',
      'full_name', 'MR. TAKSHAKBHAI MAHENDRABHAI MAKWANA'
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
    v_dept_svion_gn,
    gen_random_uuid(),
    'TUTOR',
    true,
    'published',
    jsonb_build_object('employee_code', '3013-TMM')
  )
  ON CONFLICT DO NOTHING;

  -- MS. SUJANBEN  TRFANBHAI VAHORA - TUTOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Sujanben Trfanbhai',
    'Vahora',
    'sujanbentrfanbhaivahora@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '3021-STV',
      'gender', 'FEMALE',
      'department', 'BACHELOR OF SCIENCE IN NURSING',
      'full_name', 'MS. SUJANBEN  TRFANBHAI VAHORA'
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
    v_dept_svion_gn,
    gen_random_uuid(),
    'TUTOR',
    true,
    'published',
    jsonb_build_object('employee_code', '3021-STV')
  )
  ON CONFLICT DO NOTHING;

  -- MS. PARIN DILIPBHAI MAHIDA - TUTOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Parin Dilipbhai',
    'Mahida',
    'parindilipbhaimahida@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '3022-PDM',
      'gender', 'FEMALE',
      'department', 'BACHELOR OF SCIENCE IN NURSING',
      'full_name', 'MS. PARIN DILIPBHAI MAHIDA'
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
    v_dept_svion_gn,
    gen_random_uuid(),
    'TUTOR',
    true,
    'published',
    jsonb_build_object('employee_code', '3022-PDM')
  )
  ON CONFLICT DO NOTHING;

  -- MRS. SWETABEN M BARIYA - TUTOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Swetaben M',
    'Bariya',
    'swetabenmbariya@svitvasad.ac.in',
    'Mrs.',
    jsonb_build_object(
      'employee_code', '3025-SMB',
      'gender', 'Female',
      'department', 'BACHELOR OF SCIENCE IN NURSING',
      'full_name', 'MRS. SWETABEN M BARIYA'
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
    v_dept_svion_gn,
    gen_random_uuid(),
    'TUTOR',
    true,
    'published',
    jsonb_build_object('employee_code', '3025-SMB')
  )
  ON CONFLICT DO NOTHING;

  -- MS. PATEL EKTA MAYANKKUMAR - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Patel Ekta',
    'Mayankkumar',
    'patelektamayankkumar@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '3034-PEM',
      'gender', 'FEMALE',
      'department', 'BACHELOR OF SCIENCE IN NURSING',
      'full_name', 'MS. PATEL EKTA MAYANKKUMAR'
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
    v_dept_svion_gn,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '3034-PEM')
  )
  ON CONFLICT DO NOTHING;

  -- MR. AATIFALI SAJIDALI SAIYAD - TUTOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Aatifali Sajidali',
    'Saiyad',
    'aatifalisajidalisaiyad@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '3035-ASS',
      'gender', 'Male',
      'department', 'BACHELOR OF SCIENCE IN NURSING',
      'full_name', 'MR. AATIFALI SAJIDALI SAIYAD'
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
    v_dept_svion_gn,
    gen_random_uuid(),
    'TUTOR',
    true,
    'published',
    jsonb_build_object('employee_code', '3035-ASS')
  )
  ON CONFLICT DO NOTHING;

  -- MR. JAYKUMAR PRAVINBHAI SOLANKI - TUTOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Jaykumar Pravinbhai',
    'Solanki',
    'jaykumarpravinbhaisolanki@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '3036-JPS',
      'gender', 'Male',
      'department', 'BACHELOR OF SCIENCE IN NURSING',
      'full_name', 'MR. JAYKUMAR PRAVINBHAI SOLANKI'
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
    v_dept_svion_gn,
    gen_random_uuid(),
    'TUTOR',
    true,
    'published',
    jsonb_build_object('employee_code', '3036-JPS')
  )
  ON CONFLICT DO NOTHING;

  -- MR. ABHAYKUMAR FRANCISBHAI PARMAR - TUTOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Abhaykumar Francisbhai',
    'Parmar',
    'abhaykumarfrancisbhaiparmar@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '3037-AFP',
      'gender', 'Male',
      'department', 'BACHELOR OF SCIENCE IN NURSING',
      'full_name', 'MR. ABHAYKUMAR FRANCISBHAI PARMAR'
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
    v_dept_svion_gn,
    gen_random_uuid(),
    'TUTOR',
    true,
    'published',
    jsonb_build_object('employee_code', '3037-AFP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. HARISH KANUBHAI PURBIYA - TUTOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Harish Kanubhai',
    'Purbiya',
    'harishkanubhaipurbiya@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '3038-HKP',
      'gender', 'Male',
      'department', 'BACHELOR OF SCIENCE IN NURSING',
      'full_name', 'MR. HARISH KANUBHAI PURBIYA'
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
    v_dept_svion_gn,
    gen_random_uuid(),
    'TUTOR',
    true,
    'published',
    jsonb_build_object('employee_code', '3038-HKP')
  )
  ON CONFLICT DO NOTHING;

  -- MS. RIDDHI BHARATBHAI PATEL - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Riddhi Bharatbhai',
    'Patel',
    'riddhibharatbhaipatel@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '3040-RBP',
      'gender', 'Female',
      'department', 'BACHELOR OF SCIENCE IN NURSING',
      'full_name', 'MS. RIDDHI BHARATBHAI PATEL'
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
    v_dept_svion_gn,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '3040-RBP')
  )
  ON CONFLICT DO NOTHING;

  -- MRS. NIKETABEN NOEL VAGHELA - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Niketaben Noel',
    'Vaghela',
    'niketabennoelvaghela@svitvasad.ac.in',
    'Mrs.',
    jsonb_build_object(
      'employee_code', '3041-NNV',
      'gender', 'Female',
      'department', 'BACHELOR OF SCIENCE IN NURSING',
      'full_name', 'MRS. NIKETABEN NOEL VAGHELA'
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
    v_dept_svion_gn,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '3041-NNV')
  )
  ON CONFLICT DO NOTHING;

  -- MRS. PRIYANKABEN RAJESHBHAI GURAV - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Priyankaben Rajeshbhai',
    'Gurav',
    'priyankabenrajeshbhaigurav@svitvasad.ac.in',
    'Mrs.',
    jsonb_build_object(
      'employee_code', '3042-PRG',
      'gender', 'Female',
      'department', 'BACHELOR OF SCIENCE IN NURSING',
      'full_name', 'MRS. PRIYANKABEN RAJESHBHAI GURAV'
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
    v_dept_svion_gn,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '3042-PRG')
  )
  ON CONFLICT DO NOTHING;

  -- MR. HARSHUL PARMAR - TUTOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Harshul',
    'Parmar',
    'harshulparmar@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '3044-HRP',
      'gender', 'Male',
      'department', 'BACHELOR OF SCIENCE IN NURSING',
      'full_name', 'MR. HARSHUL PARMAR'
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
    v_dept_svion_gn,
    gen_random_uuid(),
    'TUTOR',
    true,
    'published',
    jsonb_build_object('employee_code', '3044-HRP')
  )
  ON CONFLICT DO NOTHING;

  -- MS. VAISHNAVIBEN BHAGWANSINH JADAV - TUTOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Vaishnaviben Bhagwansinh',
    'Jadav',
    'vaishnavibenbhagwansinhjadav@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '3045-VBJ',
      'gender', 'Female',
      'department', 'BACHELOR OF SCIENCE IN NURSING',
      'full_name', 'MS. VAISHNAVIBEN BHAGWANSINH JADAV'
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
    v_dept_svion_gn,
    gen_random_uuid(),
    'TUTOR',
    true,
    'published',
    jsonb_build_object('employee_code', '3045-VBJ')
  )
  ON CONFLICT DO NOTHING;

  -- MRS. NIKISHA DIPAKBHAI PATEL - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Nikisha Dipakbhai',
    'Patel',
    'nikishadipakbhaipatel@svitvasad.ac.in',
    'Mrs.',
    jsonb_build_object(
      'employee_code', '3046-NDP',
      'gender', 'Female',
      'department', 'BACHELOR OF SCIENCE IN NURSING',
      'full_name', 'MRS. NIKISHA DIPAKBHAI PATEL'
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
    v_dept_svion_gn,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '3046-NDP')
  )
  ON CONFLICT DO NOTHING;

  -- MS. RUPALIBEN SATISHKUMAR JOSHI - TUTOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Rupaliben Satishkumar',
    'Joshi',
    'rupalibensatishkumarjoshi@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '3047-RSJ',
      'gender', 'Female',
      'department', 'BACHELOR OF SCIENCE IN NURSING',
      'full_name', 'MS. RUPALIBEN SATISHKUMAR JOSHI'
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
    v_dept_svion_gn,
    gen_random_uuid(),
    'TUTOR',
    true,
    'published',
    jsonb_build_object('employee_code', '3047-RSJ')
  )
  ON CONFLICT DO NOTHING;

  -- MS. SHIRLEY VIJAYKUMAR PARMAR - TUTOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Shirley Vijaykumar',
    'Parmar',
    'shirleyvijaykumarparmar@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '3048-SVP',
      'gender', 'Female',
      'department', 'BACHELOR OF SCIENCE IN NURSING',
      'full_name', 'MS. SHIRLEY VIJAYKUMAR PARMAR'
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
    v_dept_svion_gn,
    gen_random_uuid(),
    'TUTOR',
    true,
    'published',
    jsonb_build_object('employee_code', '3048-SVP')
  )
  ON CONFLICT DO NOTHING;

  -- MS. DHARABEN HARSHADBHAI PATEL - TUTOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Dharaben Harshadbhai',
    'Patel',
    'dharabenharshadbhaipatel@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '3049-DHP',
      'gender', 'Female',
      'department', 'BACHELOR OF SCIENCE IN NURSING',
      'full_name', 'MS. DHARABEN HARSHADBHAI PATEL'
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
    v_dept_svion_gn,
    gen_random_uuid(),
    'TUTOR',
    true,
    'published',
    jsonb_build_object('employee_code', '3049-DHP')
  )
  ON CONFLICT DO NOTHING;

  -- MS. KINJAL MAHESHBHAI RATHWA - TUTOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Kinjal Maheshbhai',
    'Rathwa',
    'kinjalmaheshbhairathwa@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '3050-KMR',
      'gender', 'Female',
      'department', 'BACHELOR OF SCIENCE IN NURSING',
      'full_name', 'MS. KINJAL MAHESHBHAI RATHWA'
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
    v_dept_svion_gn,
    gen_random_uuid(),
    'TUTOR',
    true,
    'published',
    jsonb_build_object('employee_code', '3050-KMR')
  )
  ON CONFLICT DO NOTHING;

  -- MS. GRACY VIJAYBHAI MACWAN - TUTOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Gracy Vijaybhai',
    'Macwan',
    'gracyvijaybhaimacwan@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '3051-GVM',
      'gender', 'Female',
      'department', 'BACHELOR OF SCIENCE IN NURSING',
      'full_name', 'MS. GRACY VIJAYBHAI MACWAN'
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
    v_dept_svion_gn,
    gen_random_uuid(),
    'TUTOR',
    true,
    'published',
    jsonb_build_object('employee_code', '3051-GVM')
  )
  ON CONFLICT DO NOTHING;

  -- Ms. MAITRI GIRISHKUMAR PRAJAPATI - TUTOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Maitri Girishkumar',
    'Prajapati',
    'maitrigirishkumarprajapati@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '3052-MGP',
      'gender', 'Female',
      'department', 'BACHELOR OF SCIENCE IN NURSING',
      'full_name', 'Ms. MAITRI GIRISHKUMAR PRAJAPATI'
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
    v_dept_svion_gn,
    gen_random_uuid(),
    'TUTOR',
    true,
    'published',
    jsonb_build_object('employee_code', '3052-MGP')
  )
  ON CONFLICT DO NOTHING;

  -- Mr. RAHUL RAJUBHAI SAGAR - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Rahul Rajubhai',
    'Sagar',
    'rahulrajubhaisagar@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '3053-RRS',
      'gender', 'Male',
      'department', 'BACHELOR OF SCIENCE IN NURSING',
      'full_name', 'Mr. RAHUL RAJUBHAI SAGAR'
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
    v_dept_svion_gn,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '3053-RRS')
  )
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Successfully seeded 29 SVION faculty members across 1 departments';

END $$;