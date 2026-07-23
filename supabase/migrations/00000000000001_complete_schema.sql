-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUM types
DO $$ BEGIN
  CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE scope_level AS ENUM ('global', 'trust', 'institute', 'college', 'department');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE degree_level AS ENUM ('undergraduate', 'graduate', 'doctorate', 'certificate');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE submission_status AS ENUM ('unread', 'read', 'replied');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE link_type AS ENUM ('internal', 'external');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE facility_type AS ENUM ('campus', 'building', 'laboratory');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Core / organizational tables (no FK dependencies on each other besides hierarchy)

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS trusts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS institutes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trust_id UUID NOT NULL REFERENCES trusts(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS colleges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id UUID NOT NULL REFERENCES institutes(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  code TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS designations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS seo_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[] NOT NULL DEFAULT '{}'::text[],
  canonical_url TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image_url TEXT,
  twitter_card TEXT,
  structured_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  robots_directives TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS content_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  module_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Staff profiles (depends on user_profiles)
CREATE TABLE IF NOT EXISTS staff_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  title TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  office_hours JSONB NOT NULL DEFAULT '{}'::jsonb,
  social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Departments (depends on colleges, staff_profiles)
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID NOT NULL REFERENCES colleges(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  code TEXT NOT NULL,
  head_of_department_id UUID REFERENCES staff_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Courses (depends on departments)
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES departments(id),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  degree_level degree_level NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Branches (depends on courses)
CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Staff assignments (depends on staff_profiles, departments, designations)
CREATE TABLE IF NOT EXISTS staff_department_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff_profiles(id),
  department_id UUID NOT NULL REFERENCES departments(id),
  designation_id UUID NOT NULL REFERENCES designations(id),
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Staff research / qualifications
CREATE TABLE IF NOT EXISTS qualifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff_profiles(id),
  degree TEXT NOT NULL,
  institution TEXT NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff_profiles(id),
  organization TEXT NOT NULL,
  role TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_academic BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff_profiles(id),
  title TEXT NOT NULL,
  awarding_body TEXT NOT NULL,
  received_year INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS research_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff_profiles(id),
  interest_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS research_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  funding_agency TEXT,
  amount NUMERIC,
  duration_years NUMERIC,
  project_status TEXT NOT NULL,
  principal_investigator_id UUID NOT NULL REFERENCES staff_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  journal_conference TEXT NOT NULL,
  publish_date DATE NOT NULL,
  doi_url TEXT,
  abstract TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS staff_publications (
  staff_id UUID NOT NULL REFERENCES staff_profiles(id),
  publication_id UUID NOT NULL REFERENCES publications(id),
  PRIMARY KEY (staff_id, publication_id)
);

CREATE TABLE IF NOT EXISTS patents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff_profiles(id),
  title TEXT NOT NULL,
  patent_number TEXT,
  patent_status TEXT NOT NULL,
  publication_date DATE,
  inventors TEXT[] NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Pages (self-referencing parent_id)
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT,
  parent_id UUID REFERENCES pages(id),
  is_homepage BOOLEAN NOT NULL DEFAULT false,
  seo_id UUID REFERENCES seo_metadata(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'draft'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Menu items (depends on menus, pages, self-referencing)
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID NOT NULL REFERENCES menus(id),
  parent_id UUID REFERENCES menu_items(id),
  title TEXT NOT NULL,
  link_type link_type NOT NULL,
  url TEXT,
  page_id UUID REFERENCES pages(id),
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  permissions_required TEXT[] NOT NULL DEFAULT '{}'::text[],
  visibility_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Posts (depends on departments, content_categories, seo_metadata)
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope_type scope_level NOT NULL DEFAULT 'global'::scope_level,
  department_id UUID REFERENCES departments(id),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  featured_image_url TEXT,
  category_id UUID REFERENCES content_categories(id),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  seo_id UUID REFERENCES seo_metadata(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'draft'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Events (depends on departments, seo_metadata)
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope_type scope_level NOT NULL DEFAULT 'global'::scope_level,
  department_id UUID REFERENCES departments(id),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  tag TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT,
  map_url TEXT,
  registration_link TEXT,
  featured_image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  seo_id UUID REFERENCES seo_metadata(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status event_status NOT NULL DEFAULT 'draft'::event_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Achievements (depends on departments)
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope_type scope_level NOT NULL DEFAULT 'global'::scope_level,
  department_id UUID REFERENCES departments(id),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  featured_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL,
  company_or_institution TEXT,
  quote TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Homepage sections (depends on departments)
CREATE TABLE IF NOT EXISTS homepage_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope_type scope_level NOT NULL DEFAULT 'global'::scope_level,
  department_id UUID REFERENCES departments(id),
  title TEXT,
  section_type TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Homepage items (depends on departments)
CREATE TABLE IF NOT EXISTS homepage_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope_type scope_level NOT NULL DEFAULT 'global'::scope_level,
  department_id UUID REFERENCES departments(id),
  item_type TEXT NOT NULL,
  eyebrow TEXT,
  title TEXT NOT NULL,
  title_accent TEXT,
  subtitle TEXT,
  body TEXT,
  image_url TEXT,
  icon_name TEXT,
  link_href TEXT,
  link_label TEXT,
  secondary_link_href TEXT,
  secondary_link_label TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Homepage widgets (depends on homepage_sections)
CREATE TABLE IF NOT EXISTS homepage_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES homepage_sections(id),
  title TEXT,
  widget_type TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Media folders (depends on departments, self-referencing)
CREATE TABLE IF NOT EXISTS media_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope_type scope_level NOT NULL DEFAULT 'global'::scope_level,
  department_id UUID REFERENCES departments(id),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES media_folders(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Media files (depends on departments, media_folders)
CREATE TABLE IF NOT EXISTS media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope_type scope_level NOT NULL DEFAULT 'global'::scope_level,
  department_id UUID REFERENCES departments(id),
  folder_id UUID REFERENCES media_folders(id),
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  alt_text TEXT,
  caption TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}'::text[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Gallery albums (depends on departments)
CREATE TABLE IF NOT EXISTS gallery_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope_type scope_level NOT NULL DEFAULT 'global'::scope_level,
  department_id UUID REFERENCES departments(id),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS gallery_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES gallery_albums(id),
  media_type TEXT NOT NULL,
  url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Facilities (depends on institutes, departments, self-referencing)
CREATE TABLE IF NOT EXISTS facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_type facility_type NOT NULL,
  parent_id UUID REFERENCES facilities(id),
  institute_id UUID REFERENCES institutes(id),
  department_id UUID REFERENCES departments(id),
  name TEXT NOT NULL,
  slug TEXT,
  address TEXT,
  code TEXT,
  room_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Centers (depends on colleges, institutes)
CREATE TABLE IF NOT EXISTS centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID REFERENCES colleges(id),
  institute_id UUID REFERENCES institutes(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Cells (depends on colleges)
CREATE TABLE IF NOT EXISTS cells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID NOT NULL REFERENCES colleges(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Committees (depends on colleges)
CREATE TABLE IF NOT EXISTS committees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID NOT NULL REFERENCES colleges(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Student clubs (depends on staff_profiles)
CREATE TABLE IF NOT EXISTS student_clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  coordinator_id UUID REFERENCES staff_profiles(id),
  student_coordinator_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Recruiters
CREATE TABLE IF NOT EXISTS recruiters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Placement statistics
CREATE TABLE IF NOT EXISTS placement_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year TEXT NOT NULL,
  total_students INTEGER NOT NULL,
  placed_students INTEGER NOT NULL,
  highest_package NUMERIC,
  average_package NUMERIC,
  recruiters_count INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Inquiry forms
CREATE TABLE IF NOT EXISTS inquiry_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_name TEXT NOT NULL,
  fields_config JSONB NOT NULL DEFAULT '[]'::jsonb,
  recipient_emails TEXT[] NOT NULL DEFAULT '{}'::text[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS inquiry_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES inquiry_forms(id),
  submitted_data JSONB NOT NULL,
  status submission_status NOT NULL DEFAULT 'unread'::submission_status,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Contact info
CREATE TABLE IF NOT EXISTS contact_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT,
  phone TEXT,
  email TEXT,
  office_hours JSONB NOT NULL DEFAULT '{}'::jsonb,
  map_iframe_url TEXT,
  social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- MoUs
CREATE TABLE IF NOT EXISTS mous (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_organization TEXT NOT NULL,
  logo_url TEXT,
  purpose TEXT,
  signed_date DATE NOT NULL,
  expiry_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Accreditations
CREATE TABLE IF NOT EXISTS accreditations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization TEXT NOT NULL,
  value TEXT NOT NULL,
  received_year INTEGER NOT NULL,
  expiry_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Downloads
CREATE TABLE IF NOT EXISTS downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  category TEXT NOT NULL,
  publish_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Redirects
CREATE TABLE IF NOT EXISTS redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_path TEXT NOT NULL,
  target_path TEXT NOT NULL,
  status_code INTEGER NOT NULL DEFAULT 301,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Role permissions (junction table)
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id UUID NOT NULL REFERENCES roles(id),
  permission_id UUID NOT NULL REFERENCES permissions(id),
  PRIMARY KEY (role_id, permission_id)
);

-- User roles (depends on user_profiles, roles, trusts, institutes, colleges, departments)
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  role_id UUID NOT NULL REFERENCES roles(id),
  scope_type scope_level NOT NULL,
  trust_id UUID REFERENCES trusts(id),
  institute_id UUID REFERENCES institutes(id),
  college_id UUID REFERENCES colleges(id),
  department_id UUID REFERENCES departments(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  status content_status NOT NULL DEFAULT 'published'::content_status,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Audit logs (simple append-only, no status/metadata columns)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  client_ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
