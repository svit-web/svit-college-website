-- Seed SVIT-COA faculty and staff
-- Generated from: Employee_List_by_Department.xlsx
-- Date: 2026-09-17
-- Total staff: 26 across 1 departments
-- Status: Working only (Resigned employees excluded)

DO $$
DECLARE
  v_dept_coa_arch uuid;
  v_staff_id uuid;
BEGIN
  -- Get department IDs
  SELECT id INTO v_dept_coa_arch FROM departments WHERE slug = 'dept-coa-arch';

  -- ============================================
  -- BACHELOR OF ARCHITECTURE (26 staff)
  -- ============================================

  -- MR. SANDIPKUMAR HIRABHAI PATEL - ACCOUNTANT
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Sandipkumar Hirabhai',
    'Patel',
    'sandipkumarhirabhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '1007-SHP',
      'gender', 'MALE',
      'department', 'BACHELOR OF ARCHITECTURE',
      'full_name', 'MR. SANDIPKUMAR HIRABHAI PATEL'
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
    v_dept_coa_arch,
    gen_random_uuid(),
    'ACCOUNTANT',
    true,
    'published',
    jsonb_build_object('employee_code', '1007-SHP')
  )
  ON CONFLICT DO NOTHING;

  -- MRS. ROHINI R KACHROO - ASSOCIATE PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Rohini R',
    'Kachroo',
    'rohinirkachroo@svitvasad.ac.in',
    'Mrs.',
    jsonb_build_object(
      'employee_code', '10-RRK',
      'gender', 'FEMALE',
      'department', 'BACHELOR OF ARCHITECTURE',
      'full_name', 'MRS. ROHINI R KACHROO'
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
    v_dept_coa_arch,
    gen_random_uuid(),
    'ASSOCIATE PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '10-RRK')
  )
  ON CONFLICT DO NOTHING;

  -- MS. DEVANSHI  DHARMESHBHAI  PATEL - TEACHING ASSISTANT
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Devanshi Dharmeshbhai',
    'Patel',
    'devanshidharmeshbhaipatel@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '1302-DDP',
      'gender', 'FEMALE',
      'department', 'BACHELOR OF ARCHITECTURE',
      'full_name', 'MS. DEVANSHI  DHARMESHBHAI  PATEL'
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
    v_dept_coa_arch,
    gen_random_uuid(),
    'TEACHING ASSISTANT',
    true,
    'published',
    jsonb_build_object('employee_code', '1302-DDP')
  )
  ON CONFLICT DO NOTHING;

  -- HITEN CHAVDA - ASSOCIATE PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Hiten',
    'Chavda',
    'hitenchavda@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '1304-HJC',
      'gender', 'Male',
      'department', 'BACHELOR OF ARCHITECTURE',
      'full_name', 'HITEN CHAVDA'
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
    v_dept_coa_arch,
    gen_random_uuid(),
    'ASSOCIATE PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '1304-HJC')
  )
  ON CONFLICT DO NOTHING;

  -- MR. HARDIK N TAMBOLI - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Hardik N',
    'Tamboli',
    'hardikntamboli@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '1305-HNT',
      'gender', 'MALE',
      'department', 'BACHELOR OF ARCHITECTURE',
      'full_name', 'MR. HARDIK N TAMBOLI'
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
    v_dept_coa_arch,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '1305-HNT')
  )
  ON CONFLICT DO NOTHING;

  -- MR. RONAK VINODBHAI PATEL - ASSOCIATE PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Ronak Vinodbhai',
    'Patel',
    'ronakvinodbhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '13-RVP',
      'gender', 'MALE',
      'department', 'BACHELOR OF ARCHITECTURE',
      'full_name', 'MR. RONAK VINODBHAI PATEL'
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
    v_dept_coa_arch,
    gen_random_uuid(),
    'ASSOCIATE PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '13-RVP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. PRAGNESHKUMAR NAVNITLAL SHAH - PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Pragneshkumar Navnitlal',
    'Shah',
    'pragneshkumarnavnitlalshah@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '1-PNS',
      'gender', 'MALE',
      'department', 'BACHELOR OF ARCHITECTURE',
      'full_name', 'MR. PRAGNESHKUMAR NAVNITLAL SHAH'
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
    v_dept_coa_arch,
    gen_random_uuid(),
    'PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '1-PNS')
  )
  ON CONFLICT DO NOTHING;

  -- MR. NARENDRABHAI SHANTILAL PRAJAPATI - POTTER
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Narendrabhai Shantilal',
    'Prajapati',
    'narendrabhaishantilalprajapati@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '29-NSP',
      'gender', 'MALE',
      'department', 'BACHELOR OF ARCHITECTURE',
      'full_name', 'MR. NARENDRABHAI SHANTILAL PRAJAPATI'
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
    v_dept_coa_arch,
    gen_random_uuid(),
    'POTTER',
    true,
    'published',
    jsonb_build_object('employee_code', '29-NSP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. SHAILESH JIVRAMBHAI PATEL - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Shailesh Jivrambhai',
    'Patel',
    'shaileshjivrambhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '33-SJP',
      'gender', 'MALE',
      'department', 'BACHELOR OF ARCHITECTURE',
      'full_name', 'MR. SHAILESH JIVRAMBHAI PATEL'
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
    v_dept_coa_arch,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '33-SJP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. RAJENDRAKUMAR MULJIBHAI PATEL - LIBRARIAN
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Rajendrakumar Muljibhai',
    'Patel',
    'rajendrakumarmuljibhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '40-RMP',
      'gender', 'MALE',
      'department', 'BACHELOR OF ARCHITECTURE',
      'full_name', 'MR. RAJENDRAKUMAR MULJIBHAI PATEL'
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
    v_dept_coa_arch,
    gen_random_uuid(),
    'LIBRARIAN',
    true,
    'published',
    jsonb_build_object('employee_code', '40-RMP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. ANKITKUMAR ASHOKBHAI PATEL - SENIOR LAB TECHNICIAN
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Ankitkumar Ashokbhai',
    'Patel',
    'ankitkumarashokbhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '42-AAP',
      'gender', 'Male',
      'department', 'BACHELOR OF ARCHITECTURE',
      'full_name', 'MR. ANKITKUMAR ASHOKBHAI PATEL'
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
    v_dept_coa_arch,
    gen_random_uuid(),
    'SENIOR LAB TECHNICIAN',
    true,
    'published',
    jsonb_build_object('employee_code', '42-AAP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. MUKESH BHIKHABHAI PAREKH - HAMAL
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Mukesh Bhikhabhai',
    'Parekh',
    'mukeshbhikhabhaiparekh@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '43-MBP',
      'gender', 'MALE',
      'department', 'BACHELOR OF ARCHITECTURE',
      'full_name', 'MR. MUKESH BHIKHABHAI PAREKH'
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
    v_dept_coa_arch,
    gen_random_uuid(),
    'HAMAL',
    true,
    'published',
    jsonb_build_object('employee_code', '43-MBP')
  )
  ON CONFLICT DO NOTHING;

  -- MS. MITALI DIPAKKUMAR BHATT - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Mitali Dipakkumar',
    'Bhatt',
    'mitalidipakkumarbhatt@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '56-MDB',
      'gender', 'FEMALE',
      'department', 'BACHELOR OF ARCHITECTURE',
      'full_name', 'MS. MITALI DIPAKKUMAR BHATT'
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
    v_dept_coa_arch,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '56-MDB')
  )
  ON CONFLICT DO NOTHING;

  -- MR. TAHA HATIMBHAI PADRAWALA - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Taha Hatimbhai',
    'Padrawala',
    'tahahatimbhaipadrawala@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '59-THP',
      'gender', 'MALE',
      'department', 'BACHELOR OF ARCHITECTURE',
      'full_name', 'MR. TAHA HATIMBHAI PADRAWALA'
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
    v_dept_coa_arch,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '59-THP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. DINESHKUMAR LOKCHAND SHAH - ASSOCIATE PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Dineshkumar Lokchand',
    'Shah',
    'dineshkumarlokchandshah@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '5-DLS',
      'gender', 'MALE',
      'department', 'BACHELOR OF ARCHITECTURE',
      'full_name', 'MR. DINESHKUMAR LOKCHAND SHAH'
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
    v_dept_coa_arch,
    gen_random_uuid(),
    'ASSOCIATE PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '5-DLS')
  )
  ON CONFLICT DO NOTHING;

  -- MS. ESHA VINAY DALAL - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Esha Vinay',
    'Dalal',
    'eshavinaydalal@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '64-EVD',
      'gender', 'Female',
      'department', 'BACHELOR OF ARCHITECTURE',
      'full_name', 'MS. ESHA VINAY DALAL'
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
    v_dept_coa_arch,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '64-EVD')
  )
  ON CONFLICT DO NOTHING;

  -- MRS. PALLAVI MADANSINH MAHIDA - PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Pallavi Madansinh',
    'Mahida',
    'pallavimadansinhmahida@svitvasad.ac.in',
    'Mrs.',
    jsonb_build_object(
      'employee_code', '6-PMM',
      'gender', 'FEMALE',
      'department', 'BACHELOR OF ARCHITECTURE',
      'full_name', 'MRS. PALLAVI MADANSINH MAHIDA'
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
    v_dept_coa_arch,
    gen_random_uuid(),
    'PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '6-PMM')
  )
  ON CONFLICT DO NOTHING;

  -- MS. DHWANI V BHAVSAR - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Dhwani V',
    'Bhavsar',
    'dhwanivbhavsar@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '78-DVB',
      'gender', 'FEMALE',
      'department', 'BACHELOR OF ARCHITECTURE',
      'full_name', 'MS. DHWANI V BHAVSAR'
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
    v_dept_coa_arch,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '78-DVB')
  )
  ON CONFLICT DO NOTHING;

  -- MRS. PALLAVI TUSHAR ABHALE - ASSOCIATE PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Pallavi Tushar',
    'Abhale',
    'pallavitusharabhale@svitvasad.ac.in',
    'Mrs.',
    jsonb_build_object(
      'employee_code', '7-PTA',
      'gender', 'FEMALE',
      'department', 'BACHELOR OF ARCHITECTURE',
      'full_name', 'MRS. PALLAVI TUSHAR ABHALE'
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
    v_dept_coa_arch,
    gen_random_uuid(),
    'ASSOCIATE PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '7-PTA')
  )
  ON CONFLICT DO NOTHING;

  -- MRS. DARSHINI M JAIN - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Darshini M',
    'Jain',
    'darshinimjain@svitvasad.ac.in',
    'Mrs.',
    jsonb_build_object(
      'employee_code', '82-DMJ',
      'gender', 'Female',
      'department', 'BACHELOR OF ARCHITECTURE',
      'full_name', 'MRS. DARSHINI M JAIN'
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
    v_dept_coa_arch,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '82-DMJ')
  )
  ON CONFLICT DO NOTHING;

  -- MRS. PREETY SHAH - DESIGN CHAIR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Preety',
    'Shah',
    'preetyshah@svitvasad.ac.in',
    'Mrs.',
    jsonb_build_object(
      'employee_code', '86-PRS',
      'gender', 'Female',
      'department', 'BACHELOR OF ARCHITECTURE',
      'full_name', 'MRS. PREETY SHAH'
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
    v_dept_coa_arch,
    gen_random_uuid(),
    'DESIGN CHAIR',
    true,
    'published',
    jsonb_build_object('employee_code', '86-PRS')
  )
  ON CONFLICT DO NOTHING;

  -- MS. NAMRATA BINDUBHAI VYAS - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Namrata Bindubhai',
    'Vyas',
    'namratabindubhaivyas@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '95-NBV',
      'gender', 'FEMALE',
      'department', 'BACHELOR OF ARCHITECTURE',
      'full_name', 'MS. NAMRATA BINDUBHAI VYAS'
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
    v_dept_coa_arch,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '95-NBV')
  )
  ON CONFLICT DO NOTHING;

  -- MS. PALAV DHANANJAY DESAI - ASSISTANT PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Palav Dhananjay',
    'Desai',
    'palavdhananjaydesai@svitvasad.ac.in',
    'Ms.',
    jsonb_build_object(
      'employee_code', '97-PDD',
      'gender', 'FEMALE',
      'department', 'BACHELOR OF ARCHITECTURE',
      'full_name', 'MS. PALAV DHANANJAY DESAI'
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
    v_dept_coa_arch,
    gen_random_uuid(),
    'ASSISTANT PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '97-PDD')
  )
  ON CONFLICT DO NOTHING;

  -- MR. DARSHANKUMAR PRAKASHBHAI PATEL - LAB ATTENDANT
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Darshankumar Prakashbhai',
    'Patel',
    'darshankumarprakashbhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '98-DPP',
      'gender', 'Male',
      'department', 'BACHELOR OF ARCHITECTURE',
      'full_name', 'MR. DARSHANKUMAR PRAKASHBHAI PATEL'
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
    v_dept_coa_arch,
    gen_random_uuid(),
    'LAB ATTENDANT',
    true,
    'published',
    jsonb_build_object('employee_code', '98-DPP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. MEHULKUMAR MANUBHAI PATEL - OFFICE SUPERINTENDENT
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Mehulkumar Manubhai',
    'Patel',
    'mehulkumarmanubhaipatel@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '999-MMP',
      'gender', 'MALE',
      'department', 'BACHELOR OF ARCHITECTURE',
      'full_name', 'MR. MEHULKUMAR MANUBHAI PATEL'
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
    v_dept_coa_arch,
    gen_random_uuid(),
    'OFFICE SUPERINTENDENT',
    true,
    'published',
    jsonb_build_object('employee_code', '999-MMP')
  )
  ON CONFLICT DO NOTHING;

  -- MR. AMITKUMAR BIHARILAL SHAH - ASSOCIATE PROFESSOR
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES (
    'Amitkumar Biharilal',
    'Shah',
    'amitkumarbiharilalshah@svitvasad.ac.in',
    'Mr.',
    jsonb_build_object(
      'employee_code', '9-ABS',
      'gender', 'MALE',
      'department', 'BACHELOR OF ARCHITECTURE',
      'full_name', 'MR. AMITKUMAR BIHARILAL SHAH'
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
    v_dept_coa_arch,
    gen_random_uuid(),
    'ASSOCIATE PROFESSOR',
    true,
    'published',
    jsonb_build_object('employee_code', '9-ABS')
  )
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Successfully seeded 26 SVIT-COA faculty members across 1 departments';

END $$;