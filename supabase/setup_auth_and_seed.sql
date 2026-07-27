-- =========================================================================
-- SVIT College Website - Complete Auth Setup + Seed
-- Run ALL of this in Supabase SQL Editor (one go)
-- =========================================================================

-- Step 1: Create roles table
CREATE TABLE IF NOT EXISTS public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  status public.content_status NOT NULL DEFAULT 'published',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  deleted_by uuid
);

GRANT SELECT ON public.roles TO anon, authenticated;
GRANT ALL ON public.roles TO service_role;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read roles" ON public.roles FOR SELECT USING (true);

-- Step 2: Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY,
  first_name text,
  last_name text,
  avatar_url text,
  bio text,
  status public.content_status NOT NULL DEFAULT 'published',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  deleted_by uuid
);

GRANT SELECT ON public.user_profiles TO anon, authenticated;
GRANT ALL ON public.user_profiles TO service_role;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile"
  ON public.user_profiles FOR SELECT
  USING (id = auth.uid());

-- Step 3: Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.user_profiles(id),
  role_id uuid NOT NULL REFERENCES public.roles(id),
  scope_type public.scope_level NOT NULL,
  trust_id uuid,
  college_id uuid REFERENCES public.colleges(id),
  institute_id uuid,
  department_id uuid,
  status public.content_status NOT NULL DEFAULT 'published',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  deleted_by uuid
);

GRANT SELECT ON public.user_roles TO anon, authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid());

-- Step 4: Create auto-profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, first_name, last_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 5: Insert default roles
INSERT INTO public.roles (code, name) VALUES
  ('admin', 'Admin'),
  ('editor', 'Editor'),
  ('department_admin', 'Department Admin'),
  ('college_admin', 'College Admin')
ON CONFLICT (code) DO NOTHING;

-- =========================================================================
-- STEP 6: Seed test users (from seed_test_users.sql)
-- =========================================================================

-- Clean up existing test roles and users (for idempotence)
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

-- Insert users into auth.users (trigger on_auth_user_created auto-creates user_profiles)
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, raw_app_meta_data, aud, role,
  created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new,
  email_change_token_current, phone_change_token, email_change,
  phone_change, reauthentication_token
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
  'authenticated', 'authenticated', now(), now(),
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
  'authenticated', 'authenticated', now(), now(),
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
  'authenticated', 'authenticated', now(), now(),
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
  'authenticated', 'authenticated', now(), now(),
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
  'authenticated', 'authenticated', now(), now(),
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
  'authenticated', 'authenticated', now(), now(),
  '', '', '', '', '', '', '', ''
);

-- Insert roles in public.user_roles mapped by scope
INSERT INTO public.user_roles (user_id, role_id, scope_type, status)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  (SELECT id FROM public.roles WHERE code = 'admin' LIMIT 1),
  'global'::public.scope_level,
  'published'::public.content_status
) ON CONFLICT DO NOTHING;

INSERT INTO public.user_roles (user_id, role_id, scope_type, trust_id, status)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  (SELECT id FROM public.roles WHERE code = 'editor' LIMIT 1),
  'trust'::public.scope_level,
  'cafe77d8-718f-40a9-8237-654425cccc8a',
  'published'::public.content_status
) ON CONFLICT DO NOTHING;

INSERT INTO public.user_roles (user_id, role_id, scope_type, college_id, status)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  (SELECT id FROM public.roles WHERE code = 'editor' LIMIT 1),
  'college'::public.scope_level,
  '5b2d6308-f93f-47dd-816d-fad491f30019',
  'published'::public.content_status
) ON CONFLICT DO NOTHING;

INSERT INTO public.user_roles (user_id, role_id, scope_type, college_id, status)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
  (SELECT id FROM public.roles WHERE code = 'editor' LIMIT 1),
  'college'::public.scope_level,
  '9e2136bf-728a-4461-89a5-e4501b148620',
  'published'::public.content_status
) ON CONFLICT DO NOTHING;

INSERT INTO public.user_roles (user_id, role_id, scope_type, department_id, status)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
  (SELECT id FROM public.roles WHERE code = 'editor' LIMIT 1),
  'department'::public.scope_level,
  '926f0424-4ada-4abe-92f2-3203b802388f',
  'published'::public.content_status
) ON CONFLICT DO NOTHING;

INSERT INTO public.user_roles (user_id, role_id, scope_type, department_id, status)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
  (SELECT id FROM public.roles WHERE code = 'editor' LIMIT 1),
  'department'::public.scope_level,
  '0730f88f-d684-4113-9a0e-5e48a52373b1',
  'published'::public.content_status
) ON CONFLICT DO NOTHING;

-- Insert identities in auth.identities for GoTrue mapping
INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
VALUES
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '{"sub": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", "email": "admin.global@svit.ac.in", "email_verified": true, "phone_verified": false}'::jsonb,
  'email', now(), now()
),
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  '{"sub": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22", "email": "editor.trust@svit.ac.in", "email_verified": true, "phone_verified": false}'::jsonb,
  'email', now(), now()
),
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  '{"sub": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33", "email": "editor.svit@svit.ac.in", "email_verified": true, "phone_verified": false}'::jsonb,
  'email', now(), now()
),
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
  '{"sub": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44", "email": "editor.svica@svit.ac.in", "email_verified": true, "phone_verified": false}'::jsonb,
  'email', now(), now()
),
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
  '{"sub": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55", "email": "editor.comp@svit.ac.in", "email_verified": true, "phone_verified": false}'::jsonb,
  'email', now(), now()
),
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
  '{"sub": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66", "email": "editor.it@svit.ac.in", "email_verified": true, "phone_verified": false}'::jsonb,
  'email', now(), now()
) ON CONFLICT DO NOTHING;
