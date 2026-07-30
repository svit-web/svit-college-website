-- Migration: Seed dynamic default records for placement_cells with different content

INSERT INTO public.placement_cells (college_code, about_text, officer_name, officer_designation, officer_phone, officer_email, placed_students)
VALUES
(
  'overview',
  'The Central Training & Placement (T&P) Cell at SVIT Group of Institutions facilitates student growth and placement opportunities across all colleges, including Engineering, Architecture, Nursing, and Applied Sciences. We collaborate with national and multinational companies to bridge academic training and corporate demands.',
  'Group T&P Coordindator',
  'Central Placement Coordinator',
  '+91 2692 274760',
  'placement@svitvasad.ac.in',
  '[]'::jsonb
),
(
  'svit-degree',
  'The Training & Placement Cell at Sardar Vallabhbhai Patel Institute of Technology (Degree College) is dedicated to providing students with career counseling, skill development workshops, mock interviews, and campus recruitment drives from tier-1 MNCs and global technology leaders.',
  'Mr. Nilesh Patel',
  'Training & Placement Officer',
  '+91 98765 43210',
  'tpo.svit@svitvasad.ac.in',
  '[]'::jsonb
),
(
  'svit-coa',
  'The Placement division at the College of Architecture (COA) helps coordinate design internships, portfolio workshops, architectural firm presentations, and professional placement with leading national and international studios.',
  'Ar. Priya Shah',
  'Architecture Placement Head',
  '+91 98765 43211',
  'tpo.coa@svitvasad.ac.in',
  '[]'::jsonb
),
(
  'svica',
  'The Placement cell at SVIT College of Applied Sciences (SVICA) focuses on linking MCA & BCA students with IT companies, software houses, startup ecosystems, and analytics firms.',
  'Mrs. Hetal Shah',
  'Computer Applications T&P Head',
  '+91 98765 43212',
  'tpo.svica@svitvasad.ac.in',
  '[]'::jsonb
),
(
  'svion',
  'The Placement cell at SVIT Institute of Nursing (SVION) bridges clinical training with job opportunities in leading multi-speciality hospitals, research organizations, public health groups, and medical healthcare corporations.',
  'Ms. Anjali Sharma',
  'Nursing Placement Coordinator',
  '+91 98765 43213',
  'tpo.svion@svitvasad.ac.in',
  '[]'::jsonb
)
ON CONFLICT (college_code) DO UPDATE SET
  about_text = EXCLUDED.about_text,
  officer_name = EXCLUDED.officer_name,
  officer_designation = EXCLUDED.officer_designation,
  officer_phone = EXCLUDED.officer_phone,
  officer_email = EXCLUDED.officer_email;
