-- =========================================================================
-- SVIT College Website - RBAC Seeding Script for Test Users
-- =========================================================================
-- This script registers 6 users inside Supabase Auth (auth.users) and assigns
-- them various scoped roles in public.user_roles for testing RBAC rules.
--
-- Preset Users:
-- 1. Email: admin.global@svit.ac.in     - Role: admin  (Scope: global)
-- 2. Email: editor.trust@svit.ac.in     - Role: editor (Scope: trust)
-- 3. Email: editor.svit@svit.ac.in      - Role: editor (Scope: college - SVIT)
-- 4. Email: editor.svica@svit.ac.in     - Role: editor (Scope: college - SVICA)
-- 5. Email: editor.comp@svit.ac.in      - Role: editor (Scope: department - CE)
-- 6. Email: editor.it@svit.ac.in        - Role: editor (Scope: department - IT)
--
-- Password for all test accounts: Password123!
-- =========================================================================

-- 1. Clean up existing test roles and users (for idempotence)
DELETE FROM auth.identities WHERE user_id IN (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66'
);

DELETE FROM public.user_roles WHERE user_id IN (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66'
);

DELETE FROM public.user_profiles WHERE id IN (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66'
);

DELETE FROM auth.users WHERE id IN (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66'
);

-- 2. Insert users into auth.users (trigger public.handle_new_user automatically creates public.user_profiles)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  raw_app_meta_data,
  aud,
  role,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change_token_current,
  phone_change_token,
  email_change,
  phone_change,
  reauthentication_token
)
VALUES 
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
  '00000000-0000-0000-0000-000000000000',
  'admin.global@svit.ac.in', 
  extensions.crypt('Password123!', extensions.gen_salt('bf', 10)), 
  now(), 
  '{"first_name": "Global", "last_name": "Admin"}'::jsonb, 
  '{"provider": "email", "providers": ["email"]}'::jsonb, 
  'authenticated', 
  'authenticated', 
  now(), 
  now(),
  '', '', '', '', '', '', '', ''
),
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 
  '00000000-0000-0000-0000-000000000000',
  'editor.trust@svit.ac.in', 
  extensions.crypt('Password123!', extensions.gen_salt('bf', 10)), 
  now(), 
  '{"first_name": "Trust", "last_name": "Editor"}'::jsonb, 
  '{"provider": "email", "providers": ["email"]}'::jsonb, 
  'authenticated', 
  'authenticated', 
  now(), 
  now(),
  '', '', '', '', '', '', '', ''
),
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 
  '00000000-0000-0000-0000-000000000000',
  'editor.svit@svit.ac.in', 
  extensions.crypt('Password123!', extensions.gen_salt('bf', 10)), 
  now(), 
  '{"first_name": "SVIT", "last_name": "CollegeEditor"}'::jsonb, 
  '{"provider": "email", "providers": ["email"]}'::jsonb, 
  'authenticated', 
  'authenticated', 
  now(), 
  now(),
  '', '', '', '', '', '', '', ''
),
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 
  '00000000-0000-0000-0000-000000000000',
  'editor.svica@svit.ac.in', 
  extensions.crypt('Password123!', extensions.gen_salt('bf', 10)), 
  now(), 
  '{"first_name": "SVICA", "last_name": "CollegeEditor"}'::jsonb, 
  '{"provider": "email", "providers": ["email"]}'::jsonb, 
  'authenticated', 
  'authenticated', 
  now(), 
  now(),
  '', '', '', '', '', '', '', ''
),
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 
  '00000000-0000-0000-0000-000000000000',
  'editor.comp@svit.ac.in', 
  extensions.crypt('Password123!', extensions.gen_salt('bf', 10)), 
  now(), 
  '{"first_name": "Computer", "last_name": "DeptEditor"}'::jsonb, 
  '{"provider": "email", "providers": ["email"]}'::jsonb, 
  'authenticated', 
  'authenticated', 
  now(), 
  now(),
  '', '', '', '', '', '', '', ''
),
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 
  '00000000-0000-0000-0000-000000000000',
  'editor.it@svit.ac.in', 
  extensions.crypt('Password123!', extensions.gen_salt('bf', 10)), 
  now(), 
  '{"first_name": "IT", "last_name": "DeptEditor"}'::jsonb, 
  '{"provider": "email", "providers": ["email"]}'::jsonb, 
  'authenticated', 
  'authenticated', 
  now(), 
  now(),
  '', '', '', '', '', '', '', ''
);

-- 3. Explicitly insert roles in public.user_roles mapped by scope

-- User 1: Global Admin (Scope: global)
INSERT INTO public.user_roles (user_id, role_id, scope_type, status)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  (SELECT id FROM public.roles WHERE code = 'admin' LIMIT 1),
  'global'::public.scope_level,
  'published'::public.content_status
) ON CONFLICT DO NOTHING;

-- User 2: Trust Editor (Scope: trust)
INSERT INTO public.user_roles (user_id, role_id, scope_type, trust_id, status)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  (SELECT id FROM public.roles WHERE code = 'editor' LIMIT 1),
  'trust'::public.scope_level,
  'cafe77d8-718f-40a9-8237-654425cccc8a', -- Mahapatra Education Trust
  'published'::public.content_status
) ON CONFLICT DO NOTHING;

-- User 3: SVIT College Editor (Scope: college)
INSERT INTO public.user_roles (user_id, role_id, scope_type, college_id, status)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  (SELECT id FROM public.roles WHERE code = 'editor' LIMIT 1),
  'college'::public.scope_level,
  '5b2d6308-f93f-47dd-816d-fad491f30019', -- SVIT College
  'published'::public.content_status
) ON CONFLICT DO NOTHING;

-- User 4: SVICA College Editor (Scope: college)
INSERT INTO public.user_roles (user_id, role_id, scope_type, college_id, status)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
  (SELECT id FROM public.roles WHERE code = 'editor' LIMIT 1),
  'college'::public.scope_level,
  '9e2136bf-728a-4461-89a5-e4501b148620', -- SVICA College
  'published'::public.content_status
) ON CONFLICT DO NOTHING;

-- User 5: Computer Eng Dept Editor (Scope: department)
INSERT INTO public.user_roles (user_id, role_id, scope_type, department_id, status)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
  (SELECT id FROM public.roles WHERE code = 'editor' LIMIT 1),
  'department'::public.scope_level,
  '926f0424-4ada-4abe-92f2-3203b802388f', -- Computer Engineering
  'published'::public.content_status
) ON CONFLICT DO NOTHING;

-- User 6: IT Dept Editor (Scope: department)
INSERT INTO public.user_roles (user_id, role_id, scope_type, department_id, status)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
  (SELECT id FROM public.roles WHERE code = 'editor' LIMIT 1),
  'department'::public.scope_level,
  '0730f88f-d684-4113-9a0e-5e48a52373b1', -- Information Technology
  'published'::public.content_status
) ON CONFLICT DO NOTHING;

-- 4. Explicitly insert identities in auth.identities for GoTrue mapping
INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
VALUES
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '{"sub": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", "email": "admin.global@svit.ac.in", "email_verified": true, "phone_verified": false}'::jsonb,
  'email',
  now(),
  now()
),
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  '{"sub": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22", "email": "editor.trust@svit.ac.in", "email_verified": true, "phone_verified": false}'::jsonb,
  'email',
  now(),
  now()
),
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  '{"sub": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33", "email": "editor.svit@svit.ac.in", "email_verified": true, "phone_verified": false}'::jsonb,
  'email',
  now(),
  now()
),
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
  '{"sub": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44", "email": "editor.svica@svit.ac.in", "email_verified": true, "phone_verified": false}'::jsonb,
  'email',
  now(),
  now()
),
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
  '{"sub": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55", "email": "editor.comp@svit.ac.in", "email_verified": true, "phone_verified": false}'::jsonb,
  'email',
  now(),
  now()
),
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
  '{"sub": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66", "email": "editor.it@svit.ac.in", "email_verified": true, "phone_verified": false}'::jsonb,
  'email',
  now(),
  now()
) ON CONFLICT DO NOTHING;
