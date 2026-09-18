-- Seed complete diploma information
-- Courses, department details, and infrastructure
-- Generated: 2026-09-17

DO $$
DECLARE
  v_dept_dip_comp uuid;
  v_dept_dip_it uuid;
  v_dept_dip_elec uuid;
  v_dept_dip_mech uuid;
  v_dept_dip_civil uuid;
  v_dept_dip_ash uuid;
  v_course_id uuid;
BEGIN
  -- Get department IDs
  SELECT id INTO v_dept_dip_comp FROM departments WHERE slug = 'dept-svit-dip-computer';
  SELECT id INTO v_dept_dip_it FROM departments WHERE slug = 'dept-svit-dip-it';
  SELECT id INTO v_dept_dip_elec FROM departments WHERE slug = 'dept-svit-dip-electrical';
  SELECT id INTO v_dept_dip_mech FROM departments WHERE slug = 'dept-svit-dip-mechanical';
  SELECT id INTO v_dept_dip_civil FROM departments WHERE slug = 'dept-svit-dip-civil';
  SELECT id INTO v_dept_dip_ash FROM departments WHERE slug = 'dept-svit-dip-ash';

  -- ============================================
  -- DIPLOMA COURSES - Update with detailed information
  -- ============================================
  
  -- Computer Engineering Diploma
  UPDATE courses SET
    description = 'The Diploma in Computer Engineering program provides comprehensive training in computer hardware, software, programming, and networking. Students gain hands-on experience with modern computing technologies and industry-relevant skills.',
    eligibility = '10th Standard (SSC) with Mathematics and Science',
    duration = '3 Years',
    duration_years = 3,
    intake = 60,
    fees_per_semester = 'As per GTU norms',
    metadata = jsonb_build_object(
      'program_highlights', jsonb_build_array(
        'Industry-oriented curriculum',
        'Modern computer labs',
        'Programming in C, C++, Java, Python',
        'Database management and web technologies',
        'Networking and cybersecurity fundamentals',
        'Project-based learning'
      ),
      'career_opportunities', jsonb_build_array(
        'Junior Programmer',
        'Technical Support Engineer',
        'Web Developer',
        'Database Administrator',
        'Network Technician',
        'System Administrator'
      )
    )
  WHERE department_id = v_dept_dip_comp;

  -- Information Technology Diploma
  UPDATE courses SET
    description = 'The Diploma in Information Technology focuses on software development, web technologies, database management, and IT infrastructure. The program emphasizes practical skills needed for modern IT industry.',
    eligibility = '10th Standard (SSC) with Mathematics and Science',
    duration = '3 Years',
    duration_years = 3,
    intake = 60,
    fees_per_semester = 'As per GTU norms',
    metadata = jsonb_build_object(
      'program_highlights', jsonb_build_array(
        'Software development fundamentals',
        'Web application development',
        'Mobile app development basics',
        'Cloud computing introduction',
        'IT infrastructure management',
        'Industry internships'
      ),
      'career_opportunities', jsonb_build_array(
        'Software Developer',
        'Web Developer',
        'IT Support Specialist',
        'Application Developer',
        'Technical Consultant',
        'IT Administrator'
      )
    )
  WHERE department_id = v_dept_dip_it;

  -- Electrical Engineering Diploma
  UPDATE courses SET
    description = 'The Diploma in Electrical Engineering provides fundamental knowledge of electrical systems, power generation, distribution, electrical machines, and control systems. Students receive practical training in electrical workshops and labs.',
    eligibility = '10th Standard (SSC) with Mathematics and Science',
    duration = '3 Years',
    duration_years = 3,
    intake = 60,
    fees_per_semester = 'As per GTU norms',
    metadata = jsonb_build_object(
      'program_highlights', jsonb_build_array(
        'Electrical machines and transformers',
        'Power systems and distribution',
        'Electrical installation and maintenance',
        'Industrial automation',
        'Renewable energy systems',
        'Safety practices and standards'
      ),
      'career_opportunities', jsonb_build_array(
        'Electrical Technician',
        'Maintenance Engineer',
        'Power Plant Operator',
        'Electrical Supervisor',
        'Installation Engineer',
        'Quality Control Inspector'
      )
    )
  WHERE department_id = v_dept_dip_elec;

  -- Mechanical Engineering Diploma
  UPDATE courses SET
    description = 'The Diploma in Mechanical Engineering covers design, manufacturing, thermal systems, and industrial processes. Students gain practical experience through workshops in machining, welding, and CAD/CAM.',
    eligibility = '10th Standard (SSC) with Mathematics and Science',
    duration = '3 Years',
    duration_years = 3,
    intake = 60,
    fees_per_semester = 'As per GTU norms',
    metadata = jsonb_build_object(
      'program_highlights', jsonb_build_array(
        'Machine design and manufacturing',
        'CAD/CAM and AutoCAD',
        'Thermal engineering',
        'Production technology',
        'Industrial training',
        'Hands-on workshop practice'
      ),
      'career_opportunities', jsonb_build_array(
        'Mechanical Technician',
        'Production Engineer',
        'Quality Inspector',
        'Maintenance Engineer',
        'CAD Operator',
        'Manufacturing Supervisor'
      )
    )
  WHERE department_id = v_dept_dip_mech;

  -- Civil Engineering Diploma
  UPDATE courses SET
    description = 'The Diploma in Civil Engineering trains students in construction, surveying, building design, and infrastructure development. The program includes fieldwork and practical training on construction sites.',
    eligibility = '10th Standard (SSC) with Mathematics and Science',
    duration = '3 Years',
    duration_years = 3,
    intake = 60,
    fees_per_semester = 'As per GTU norms',
    metadata = jsonb_build_object(
      'program_highlights', jsonb_build_array(
        'Building construction and design',
        'Surveying and leveling',
        'Structural analysis basics',
        'Construction materials and testing',
        'AutoCAD for civil engineering',
        'Site visits and practical training'
      ),
      'career_opportunities', jsonb_build_array(
        'Civil Supervisor',
        'Site Engineer',
        'Survey Technician',
        'Estimation Engineer',
        'Quality Control Inspector',
        'Construction Coordinator'
      )
    )
  WHERE department_id = v_dept_dip_civil;

  -- ============================================
  -- DEPARTMENT DETAILS - Add About, Vision, Mission
  -- ============================================

  -- Computer Engineering Diploma
  UPDATE departments SET
    about = 'The Computer Engineering (Diploma) department provides industry-ready technical education in computer hardware, software, and networking. With modern computer labs and experienced faculty, we prepare students for careers in IT and software industries.',
    vision = 'To be a leading diploma program producing skilled computer engineering technicians who meet industry standards and contribute to technological advancement.',
    mission = 'To provide quality technical education in computer engineering through practical training, industry collaboration, and continuous curriculum updates aligned with technological trends.',
    intake_ug = 60,
    established_year = 2015,
    overview = 'The diploma program offers comprehensive training in programming, databases, networking, and web technologies with strong emphasis on practical skills and industry readiness.'
  WHERE slug = 'dept-svit-dip-computer';

  -- Information Technology Diploma
  UPDATE departments SET
    about = 'The Information Technology (Diploma) department focuses on software development, web technologies, and IT infrastructure. Our curriculum is designed to create job-ready IT professionals with strong practical skills.',
    vision = 'To develop competent IT professionals who can adapt to evolving technologies and contribute effectively to the software and IT service industries.',
    mission = 'To deliver quality IT education through hands-on training, industry exposure, and modern teaching methods that prepare students for successful IT careers.',
    intake_ug = 60,
    established_year = 2015,
    overview = 'The program emphasizes software development, web technologies, and IT infrastructure management with regular industry interactions and project-based learning.'
  WHERE slug = 'dept-svit-dip-it';

  -- Electrical Engineering Diploma
  UPDATE departments SET
    about = 'The Electrical Engineering (Diploma) department trains students in electrical systems, power distribution, and industrial automation. Our well-equipped electrical labs provide hands-on experience in electrical installations and maintenance.',
    vision = 'To create skilled electrical engineering technicians capable of working in power sector, industries, and electrical services with safety and efficiency.',
    mission = 'To provide quality technical education in electrical engineering through practical training, safety awareness, and exposure to modern electrical systems and renewable energy.',
    intake_ug = 60,
    established_year = 2015,
    overview = 'Students learn electrical machines, power systems, industrial automation, and renewable energy with extensive practical training in electrical workshops.'
  WHERE slug = 'dept-svit-dip-electrical';

  -- Mechanical Engineering Diploma
  UPDATE departments SET
    about = 'The Mechanical Engineering (Diploma) department offers comprehensive training in manufacturing, design, and thermal systems. Our workshops are equipped with modern machines and tools for practical training.',
    vision = 'To develop skilled mechanical engineering technicians who excel in manufacturing, maintenance, and production environments.',
    mission = 'To provide industry-oriented mechanical engineering education through hands-on workshop training, modern CAD/CAM tools, and strong industry linkages.',
    intake_ug = 60,
    established_year = 2015,
    overview = 'The program covers machine design, manufacturing processes, CAD/CAM, and thermal engineering with extensive workshop practice and industrial training.'
  WHERE slug = 'dept-svit-dip-mechanical';

  -- Civil Engineering Diploma
  UPDATE departments SET
    about = 'The Civil Engineering (Diploma) department trains students in construction technology, surveying, and building design. Field visits and practical training on construction sites are integral parts of the curriculum.',
    vision = 'To produce competent civil engineering technicians who can contribute to infrastructure development and construction industry.',
    mission = 'To deliver quality civil engineering education through practical training, site exposure, and modern surveying and design tools.',
    intake_ug = 60,
    established_year = 2015,
    overview = 'Students gain knowledge in building construction, surveying, structural basics, and construction management with regular site visits and practical training.'
  WHERE slug = 'dept-svit-dip-civil';

  -- Applied Science & Humanities Diploma
  UPDATE departments SET
    about = 'The Applied Science & Humanities department provides foundational education in Mathematics, Physics, Chemistry, English, and Communication Skills to all diploma students. We focus on building strong conceptual understanding and communication abilities.',
    vision = 'To develop strong foundational knowledge and communication skills in diploma students, enabling them to excel in their technical education and professional careers.',
    mission = 'To provide quality education in basic sciences, mathematics, and humanities that supports technical learning and develops well-rounded engineering professionals.',
    overview = 'The department teaches core subjects including Mathematics, Physics, Chemistry, English, Environmental Science, and Soft Skills to first and second year diploma students across all branches.',
    metadata = jsonb_set(
      COALESCE(metadata, '{}'::jsonb),
      '{is_support_department}',
      'true'::jsonb
    )
  WHERE slug = 'dept-svit-dip-ash';

  RAISE NOTICE 'Successfully updated diploma courses and department information';

END $$;
