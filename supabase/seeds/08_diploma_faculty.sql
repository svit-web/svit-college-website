-- Seed diploma faculty and staff
-- Run order: 08 (depends on departments)
-- Data source: /Users/porus/Downloads/Employee_List_by_Department.xlsx

-- ============================================
-- DIPLOMA FACULTY & STAFF
-- ============================================
-- Total: 23 staff members across 6 departments
-- 5 Engineering departments + 1 Applied Science & Humanities (support)

DO $$
DECLARE
  v_dept_dip_comp uuid;
  v_dept_dip_it uuid;
  v_dept_dip_elec uuid;
  v_dept_dip_mech uuid;
  v_dept_dip_civil uuid;
  v_dept_dip_ash uuid;
  v_staff_id uuid;
  v_designation_lecturer uuid;
  v_designation_lab_att uuid;
BEGIN
  -- Get department IDs
  SELECT id INTO v_dept_dip_comp FROM departments WHERE slug = 'dept-svit-dip-computer';
  SELECT id INTO v_dept_dip_it FROM departments WHERE slug = 'dept-svit-dip-it';
  SELECT id INTO v_dept_dip_elec FROM departments WHERE slug = 'dept-svit-dip-electrical';
  SELECT id INTO v_dept_dip_mech FROM departments WHERE slug = 'dept-svit-dip-mechanical';
  SELECT id INTO v_dept_dip_civil FROM departments WHERE slug = 'dept-svit-dip-civil';
  SELECT id INTO v_dept_dip_ash FROM departments WHERE slug = 'dept-svit-dip-ash';

  -- Get or create designation IDs (assuming designations table exists)
  -- If designations table doesn't exist, we'll use designation_override in staff_department_assignments
  
  -- ============================================
  -- DIPLOMA IN COMPUTER ENGINEERING (4 faculty)
  -- ============================================
  
  -- MS. HEMALIBEN MANSUKHBHAI NIMAVAT - Lecturer
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES ('Hemaliben', 'Nimavat', 'hemalibennimavat.dip@svitvasad.ac.in', 'Ms.', 
    jsonb_build_object('employee_code', '1504-HMN', 'gender', 'Female', 'department', 'Diploma Computer'),
    'published')
  RETURNING id INTO v_staff_id;
  
  INSERT INTO staff_department_assignments (staff_id, department_id, designation_id, designation_override, is_primary, status)
  VALUES (v_staff_id, v_dept_dip_comp, gen_random_uuid(), 'Lecturer', true, 'published');

  -- MR. DHRUV ANILKUMAR PATEL - Lecturer
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES ('Dhruv', 'Patel', 'dhruvpatel.dip@svitvasad.ac.in', 'Mr.', 
    jsonb_build_object('employee_code', '1506-DAP', 'gender', 'Male', 'department', 'Diploma Computer'),
    'published')
  RETURNING id INTO v_staff_id;
  
  INSERT INTO staff_department_assignments (staff_id, department_id, designation_id, designation_override, is_primary, status)
  VALUES (v_staff_id, v_dept_dip_comp, gen_random_uuid(), 'Lecturer', true, 'published');

  -- MR. PRAJAPATI NIKULKUMAR MAHESHBHAI - Lecturer
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES ('Nikulkumar', 'Prajapati', 'nikulprajapati.dip@svitvasad.ac.in', 'Mr.', 
    jsonb_build_object('employee_code', '1508-PNM', 'gender', 'Male', 'department', 'Diploma Computer'),
    'published')
  RETURNING id INTO v_staff_id;
  
  INSERT INTO staff_department_assignments (staff_id, department_id, designation_id, designation_override, is_primary, status)
  VALUES (v_staff_id, v_dept_dip_comp, gen_random_uuid(), 'Lecturer', true, 'published');

  -- MR. DEEP SATISHBHAI PATEL - Lab Attendant
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES ('Deep', 'Patel', 'deeppatel.dip@svitvasad.ac.in', 'Mr.', 
    jsonb_build_object('employee_code', '1502-DSP', 'gender', 'Male', 'department', 'Diploma Computer'),
    'published')
  RETURNING id INTO v_staff_id;
  
  INSERT INTO staff_department_assignments (staff_id, department_id, designation_id, designation_override, is_primary, status)
  VALUES (v_staff_id, v_dept_dip_comp, gen_random_uuid(), 'Lab Attendant', true, 'published');

  -- ============================================
  -- DIPLOMA IN INFORMATION TECHNOLOGY (3 faculty)
  -- ============================================
  
  -- MRS. MONIKA PARTH LIMBACHIYA - Lecturer
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES ('Monika', 'Limbachiya', 'monikalimbachiya.dip@svitvasad.ac.in', 'Mrs.', 
    jsonb_build_object('employee_code', '1507-MPL', 'gender', 'Female', 'department', 'Diploma IT'),
    'published')
  RETURNING id INTO v_staff_id;
  
  INSERT INTO staff_department_assignments (staff_id, department_id, designation_id, designation_override, is_primary, status)
  VALUES (v_staff_id, v_dept_dip_it, gen_random_uuid(), 'Lecturer', true, 'published');

  -- MRS. NIRIKSHABEN PARTH PATEL - Lecturer
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES ('Nirikshaben', 'Patel', 'nirikshapatel.dip@svitvasad.ac.in', 'Mrs.', 
    jsonb_build_object('employee_code', '1509-NPP', 'gender', 'Female', 'department', 'Diploma IT'),
    'published')
  RETURNING id INTO v_staff_id;
  
  INSERT INTO staff_department_assignments (staff_id, department_id, designation_id, designation_override, is_primary, status)
  VALUES (v_staff_id, v_dept_dip_it, gen_random_uuid(), 'Lecturer', true, 'published');

  -- MS. JAHNAVI NAVINCHANDRA BRAHMBHATT - Lecturer
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES ('Jahnavi', 'Brahmbhatt', 'jahnavibrahmbhatt.dip@svitvasad.ac.in', 'Ms.', 
    jsonb_build_object('employee_code', '1601-JNB', 'gender', 'Female', 'department', 'Diploma IT'),
    'published')
  RETURNING id INTO v_staff_id;
  
  INSERT INTO staff_department_assignments (staff_id, department_id, designation_id, designation_override, is_primary, status)
  VALUES (v_staff_id, v_dept_dip_it, gen_random_uuid(), 'Lecturer', true, 'published');

  -- ============================================
  -- DIPLOMA IN ELECTRICAL ENGINEERING (3 faculty)
  -- ============================================
  
  -- MR. KRUNALKUMAR MUKESHBHAI PANDYA - Lecturer
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES ('Krunalkumar', 'Pandya', 'krunalpandya.dip@svitvasad.ac.in', 'Mr.', 
    jsonb_build_object('employee_code', '1505-KMP', 'gender', 'Male', 'department', 'Diploma Electrical'),
    'published')
  RETURNING id INTO v_staff_id;
  
  INSERT INTO staff_department_assignments (staff_id, department_id, designation_id, designation_override, is_primary, status)
  VALUES (v_staff_id, v_dept_dip_elec, gen_random_uuid(), 'Lecturer', true, 'published');

  -- MR. HIMANSHU SHANKARBHAI THAKOR - Lecturer
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES ('Himanshu', 'Thakor', 'himanshuthakor.dip@svitvasad.ac.in', 'Mr.', 
    jsonb_build_object('employee_code', '1510-HST', 'gender', 'Male', 'department', 'Diploma Electrical'),
    'published')
  RETURNING id INTO v_staff_id;
  
  INSERT INTO staff_department_assignments (staff_id, department_id, designation_id, designation_override, is_primary, status)
  VALUES (v_staff_id, v_dept_dip_elec, gen_random_uuid(), 'Lecturer', true, 'published');

  -- MS. SHIVANGINI RAJAT MAKWANA - Lecturer
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES ('Shivangini', 'Makwana', 'shivanginimakwana.dip@svitvasad.ac.in', 'Ms.', 
    jsonb_build_object('employee_code', '1902-SRM', 'gender', 'Female', 'department', 'Diploma Electrical'),
    'published')
  RETURNING id INTO v_staff_id;
  
  INSERT INTO staff_department_assignments (staff_id, department_id, designation_id, designation_override, is_primary, status)
  VALUES (v_staff_id, v_dept_dip_elec, gen_random_uuid(), 'Lecturer', true, 'published');

  -- ============================================
  -- DIPLOMA IN MECHANICAL ENGINEERING (5 faculty)
  -- ============================================
  
  -- DR. SHAILEE GHANSHYAMBHAI ACHARYA - Lecturer
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES ('Shailee', 'Acharya', 'shaileeacharya.dip@svitvasad.ac.in', 'Dr.', 
    jsonb_build_object('employee_code', '375-SGA', 'gender', 'Female', 'department', 'Diploma Mechanical'),
    'published')
  RETURNING id INTO v_staff_id;
  
  INSERT INTO staff_department_assignments (staff_id, department_id, designation_id, designation_override, is_primary, status)
  VALUES (v_staff_id, v_dept_dip_mech, gen_random_uuid(), 'Lecturer', true, 'published');

  -- MR. ARPIT HARIVADAN MODI - Lecturer
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES ('Arpit', 'Modi', 'arpitmodi.dip@svitvasad.ac.in', 'Mr.', 
    jsonb_build_object('employee_code', '377-AHM', 'gender', 'Male', 'department', 'Diploma Mechanical'),
    'published')
  RETURNING id INTO v_staff_id;
  
  INSERT INTO staff_department_assignments (staff_id, department_id, designation_id, designation_override, is_primary, status)
  VALUES (v_staff_id, v_dept_dip_mech, gen_random_uuid(), 'Lecturer', true, 'published');

  -- MR. RONAKSINH NATVARSINH SOLANKI - Lecturer
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES ('Ronaksinh', 'Solanki', 'ronaksinhsolanki.dip@svitvasad.ac.in', 'Mr.', 
    jsonb_build_object('employee_code', '1513-RNS', 'gender', 'Male', 'department', 'Diploma Mechanical'),
    'published')
  RETURNING id INTO v_staff_id;
  
  INSERT INTO staff_department_assignments (staff_id, department_id, designation_id, designation_override, is_primary, status)
  VALUES (v_staff_id, v_dept_dip_mech, gen_random_uuid(), 'Lecturer', true, 'published');

  -- MR. JAIMITKUMAR NAGINBHAI PAREKH - Lab Attendant
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES ('Jaimitkumar', 'Parekh', 'jaimitparekh.dip@svitvasad.ac.in', 'Mr.', 
    jsonb_build_object('employee_code', '1511-JNP', 'gender', 'Male', 'department', 'Diploma Mechanical'),
    'published')
  RETURNING id INTO v_staff_id;
  
  INSERT INTO staff_department_assignments (staff_id, department_id, designation_id, designation_override, is_primary, status)
  VALUES (v_staff_id, v_dept_dip_mech, gen_random_uuid(), 'Lab Attendant', true, 'published');

  -- MR. PRATIK MAHENDRABHAI PATEL - Lab Attendant
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES ('Pratik', 'Patel', 'pratikpatel.dip@svitvasad.ac.in', 'Mr.', 
    jsonb_build_object('employee_code', '1801-PMP', 'gender', 'Male', 'department', 'Diploma Mechanical'),
    'published')
  RETURNING id INTO v_staff_id;
  
  INSERT INTO staff_department_assignments (staff_id, department_id, designation_id, designation_override, is_primary, status)
  VALUES (v_staff_id, v_dept_dip_mech, gen_random_uuid(), 'Lab Attendant', true, 'published');

  -- ============================================
  -- DIPLOMA IN CIVIL ENGINEERING (2 faculty)
  -- ============================================
  
  -- MS. DRASTI SANMUKHBHAI CHAUDHARI - Lecturer
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES ('Drasti', 'Chaudhari', 'drastichaudhari.dip@svitvasad.ac.in', 'Ms.', 
    jsonb_build_object('employee_code', '1512-DSC', 'gender', 'Female', 'department', 'Diploma Civil'),
    'published')
  RETURNING id INTO v_staff_id;
  
  INSERT INTO staff_department_assignments (staff_id, department_id, designation_id, designation_override, is_primary, status)
  VALUES (v_staff_id, v_dept_dip_civil, gen_random_uuid(), 'Lecturer', true, 'published');

  -- MS. KRUTI MRUNAL PARIKH - Lecturer
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES ('Kruti', 'Parikh', 'krutiparikh.dip@svitvasad.ac.in', 'Ms.', 
    jsonb_build_object('employee_code', '1701-KMP', 'gender', 'Female', 'department', 'Diploma Civil'),
    'published')
  RETURNING id INTO v_staff_id;
  
  INSERT INTO staff_department_assignments (staff_id, department_id, designation_id, designation_override, is_primary, status)
  VALUES (v_staff_id, v_dept_dip_civil, gen_random_uuid(), 'Lecturer', true, 'published');

  -- ============================================
  -- DIPLOMA APPLIED SCIENCE & HUMANITIES (6 faculty)
  -- ============================================
  
  -- MS. UZMA MAHEBUBHUSAAIN VAHORA - Lecturer
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES ('Uzma', 'Vahora', 'uzmavahora.dip@svitvasad.ac.in', 'Ms.', 
    jsonb_build_object('employee_code', '1191-UMV', 'gender', 'Female', 'department', 'Diploma Applied Science & Humanities'),
    'published')
  RETURNING id INTO v_staff_id;
  
  INSERT INTO staff_department_assignments (staff_id, department_id, designation_id, designation_override, is_primary, status)
  VALUES (v_staff_id, v_dept_dip_ash, gen_random_uuid(), 'Lecturer', true, 'published');

  -- MR. SHARDUL RAM VADALKAR - Lecturer
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES ('Shardul', 'Vadalkar', 'shardulvadalkar.dip@svitvasad.ac.in', 'Mr.', 
    jsonb_build_object('employee_code', '2001-SRV', 'gender', 'Male', 'department', 'Diploma Applied Science & Humanities'),
    'published')
  RETURNING id INTO v_staff_id;
  
  INSERT INTO staff_department_assignments (staff_id, department_id, designation_id, designation_override, is_primary, status)
  VALUES (v_staff_id, v_dept_dip_ash, gen_random_uuid(), 'Lecturer', true, 'published');

  -- MS. SABA MAHESHBHAI RAJ - Lecturer
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES ('Saba', 'Raj', 'sabaraj.dip@svitvasad.ac.in', 'Ms.', 
    jsonb_build_object('employee_code', '2002-SMR', 'gender', 'Female', 'department', 'Diploma Applied Science & Humanities'),
    'published')
  RETURNING id INTO v_staff_id;
  
  INSERT INTO staff_department_assignments (staff_id, department_id, designation_id, designation_override, is_primary, status)
  VALUES (v_staff_id, v_dept_dip_ash, gen_random_uuid(), 'Lecturer', true, 'published');

  -- MS. PARTE PRACHI SHANKAR - Lecturer
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES ('Prachi', 'Parte', 'prachiparte.dip@svitvasad.ac.in', 'Ms.', 
    jsonb_build_object('employee_code', '2004-PPS', 'gender', 'Female', 'department', 'Diploma Applied Science & Humanities'),
    'published')
  RETURNING id INTO v_staff_id;
  
  INSERT INTO staff_department_assignments (staff_id, department_id, designation_id, designation_override, is_primary, status)
  VALUES (v_staff_id, v_dept_dip_ash, gen_random_uuid(), 'Lecturer', true, 'published');

  -- MS. SADEKABANU JAWADHUSEN MUNSHI - Lecturer
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES ('Sadekabanu', 'Munshi', 'sadekamunshi.dip@svitvasad.ac.in', 'Ms.', 
    jsonb_build_object('employee_code', '2005-SJM', 'gender', 'Female', 'department', 'Diploma Applied Science & Humanities'),
    'published')
  RETURNING id INTO v_staff_id;
  
  INSERT INTO staff_department_assignments (staff_id, department_id, designation_id, designation_override, is_primary, status)
  VALUES (v_staff_id, v_dept_dip_ash, gen_random_uuid(), 'Lecturer', true, 'published');

  -- MR. NISH NARENDRABHAI PATEL - Lab Attendant
  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)
  VALUES ('Nish', 'Patel', 'nishpatel.dip@svitvasad.ac.in', 'Mr.', 
    jsonb_build_object('employee_code', '2003-NNP', 'gender', 'Male', 'department', 'Diploma Applied Science & Humanities'),
    'published')
  RETURNING id INTO v_staff_id;
  
  INSERT INTO staff_department_assignments (staff_id, department_id, designation_id, designation_override, is_primary, status)
  VALUES (v_staff_id, v_dept_dip_ash, gen_random_uuid(), 'Lab Attendant', true, 'published');

  RAISE NOTICE 'Successfully seeded 23 diploma faculty members across 6 departments';
  RAISE NOTICE 'Computer: 4, IT: 3, Electrical: 3, Mechanical: 5, Civil: 2, Applied Science & Humanities: 6';

END $$;
