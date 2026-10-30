-- Centre pages, part 2: fill the new sections from content the site already
-- states, so /campus-life/centre-of-excellence and /campus-life/nss-ncc show
-- them without re-typing. Nothing here is new information:
--   * CoE lab, equipment, programmes and coordinators come from the 'coe'
--     centers row's own description and highlights.
--   * MoUs / achievements are existing rows, only tagged with center_id.
-- Idempotent: every insert is skipped when the centre already has rows of
-- that kind, and tags only touch rows with no centre yet.

do $$
declare
  v_coe uuid := (select id from public.centers where slug = 'coe' and deleted_at is null);
  v_nss uuid := (select id from public.centers where slug = 'nss-ncc' and deleted_at is null);
begin
  if v_coe is not null then
    -- The single lab (metadata.lab), from the description's opening paragraphs.
    update public.centers
    set metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object('lab', jsonb_build_object(
      'name', 'Centre of Excellence (CoE) Lab',
      'partner', 'Edunet Foundation (SAP CSR initiative)',
      'description', 'A dedicated facility for technology-driven learning, innovation, research and '
        || 'skill development, established with an investment of approximately ₹20 lakh. Its '
        || 'initiatives focus on Artificial Intelligence, Machine Learning, IoT, Cybersecurity, '
        || 'Data Analytics, Cloud Technologies and Industry 4.0.'
    ))
    where id = v_coe and coalesce(metadata->'lab'->>'name', '') = '';

    -- "A dedicated technology lab equipped with 20 computers, a server, and IoT devices".
    if not exists (select 1 from public.center_equipment where center_id = v_coe and deleted_at is null) then
      insert into public.center_equipment (center_id, name, quantity, description, sort_order) values
        (v_coe, 'Computers', 20, 'Workstations for hands-on training, experimentation and project development.', 1),
        (v_coe, 'Server', 1, 'Lab server for training, experimentation and project development.', 2),
        (v_coe, 'IoT devices', null, 'IoT kits for hands-on Internet of Things training and prototypes.', 3);
    end if;

    -- "Programs Under the Centre of Excellence (CoE) Lab", items 1–7.
    if not exists (select 1 from public.center_programs where center_id = v_coe and deleted_at is null) then
      insert into public.center_programs
        (center_id, title, program_type, certifying_body, duration, description, sort_order) values
        (v_coe, 'Code Unnati Program', 'training', 'Edunet Foundation', null,
          'Industry-oriented training in Python, AI, Machine Learning, IoT, Cybersecurity, Data '
          || 'Analytics, and SAP technologies, including foundation courses, advanced courses, '
          || 'internships, and capstone projects. Training is delivered by industry experts and '
          || 'Edunet Foundation trainers.', 1),
        (v_coe, 'Educate to Employ (E2E) Program — SAP', 'training', 'SAP', 'One year',
          'An industry-oriented program focusing on Software Development and Analytics, covering '
          || 'SAP technologies, programming, data analytics, and employability skills through '
          || 'expert-led training and practical projects.', 2),
        (v_coe, 'Green and AI Skills Internship Program', 'internship', 'Edunet Foundation & Shell', '50 hours',
          'Industry-oriented training conducted by industry experts, focusing on Artificial '
          || 'Intelligence, Machine Learning, IoT, and green technologies. Organized by Edunet '
          || 'Foundation in collaboration with Shell.', 3),
        (v_coe, 'Faculty Development Programmes (FDPs)', 'training', null, 'Five days',
          'Professional development programmes designed to enhance faculty knowledge and technical '
          || 'skills through expert-led sessions and hands-on learning.', 4),
        (v_coe, 'IBM SkillsBuild Initiatives', 'training', 'IBM', null,
          'Technology orientation and skill-development activities introducing students to '
          || 'emerging technologies and industry-relevant digital skills through expert-led sessions.', 5),
        (v_coe, 'Microsoft Elevate Initiatives', 'training', 'Microsoft', null,
          'AI and digital skills development initiatives designed to enhance students'' '
          || 'technological awareness and practical competencies through learning sessions and '
          || 'expert guidance.', 6),
        (v_coe, 'Short-Term Technical Workshops', 'workshop', null, null,
          'Hands-on workshops on IoT, Home Automation, Arduino, ESP32, Raspberry Pi, Artificial '
          || 'Intelligence, Machine Learning, Cybersecurity, and other emerging technologies, '
          || 'conducted by faculty members and invited technical experts.', 7);
    end if;

    -- Coordinators named in the description, linked to their staff profiles.
    if not exists (select 1 from public.center_members where center_id = v_coe and deleted_at is null) then
      insert into public.center_members (center_id, staff_id, name, role, member_group, sort_order)
      select v_coe, s.id, case when s.id is null then m.name end, m.role, 'faculty', m.sort_order
      from (values
        ('Prof. Pradish Dadhania', 'Coordinator & SPOC, CoE Program', 'Dadhania', 'Pradish%', 1),
        ('Prof. Nikesha Patel', 'Joint Coordinator', 'Patel', 'Nikesha%', 2)
      ) as m(name, role, last_name, first_like, sort_order)
      left join lateral (
        select sp.id from public.staff_profiles sp
        where sp.last_name ilike m.last_name and sp.first_name ilike m.first_like
          and sp.deleted_at is null
        limit 1
      ) s on true;
    end if;

    -- The programmes and coordinators now have their own sections; keep the
    -- description to its overview paragraphs so they aren't shown twice.
    update public.centers
    set description = rtrim(split_part(description, 'Programs Under the Centre of Excellence', 1))
    where id = v_coe and description like '%Programs Under the Centre of Excellence%';

    -- Existing Edunet MoUs (CoE development, training modules).
    update public.mous set center_id = v_coe
    where center_id is null and deleted_at is null and partner_organization ilike 'edunet%';
  end if;

  if v_nss is not null then
    -- Existing "Best NSS Volunteer" achievements.
    update public.achievements set center_id = v_nss
    where center_id is null and deleted_at is null and title ilike '%NSS%';
  end if;
end $$;
