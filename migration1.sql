-- Enable UUID and Cryptography Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

--------------------------------------------------------------------------------
-- 1. ENUMS & CUSTOM TYPES
--------------------------------------------------------------------------------

create type public.scope_level as enum ('global', 'trust', 'institute', 'college', 'department');
create type public.degree_level as enum ('undergraduate', 'graduate', 'doctorate', 'certificate');
create type public.link_type as enum ('internal', 'external');
create type public.content_status as enum ('draft', 'published', 'archived');
create type public.event_status as enum ('draft', 'published', 'cancelled');
create type public.submission_status as enum ('unread', 'read', 'replied');
create type public.facility_type as enum ('campus', 'building', 'laboratory');
create type public.staff_type as enum ('faculty', 'office_staff');



--------------------------------------------------------------------------------
-- 2. TRIGGER FUNCTION FOR UPDATED_AT
--------------------------------------------------------------------------------

create or replace function public.update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

--------------------------------------------------------------------------------
-- 3. CORE ORGANIZATION TABLES
--------------------------------------------------------------------------------

-- 3.1 Trusts
create table public.trusts (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null unique,
    logo_url text,
    website_url text,
    sort_order integer default 0 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null,
    constraint slug_format check (slug ~* '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create trigger update_trusts_modtime
    before update on public.trusts
    for each row execute procedure public.update_updated_at_column();

-- 3.2 Institutes
create table public.institutes (
    id uuid primary key default gen_random_uuid(),
    trust_id uuid not null references public.trusts(id) on delete cascade,
    name text not null,
    slug text not null unique,
    logo_url text,
    website_url text,
    sort_order integer default 0 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null,
    constraint slug_format check (slug ~* '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create trigger update_institutes_modtime
    before update on public.institutes
    for each row execute procedure public.update_updated_at_column();

-- 3.3 Colleges
create table public.colleges (
    id uuid primary key default gen_random_uuid(),
    institute_id uuid not null references public.institutes(id) on delete cascade,
    name text not null,
    slug text not null unique,
    code text not null unique,
    logo_url text,
    website_url text,
    sort_order integer default 0 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null,
    constraint slug_format check (slug ~* '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
    constraint code_format check (code ~* '^[A-Z0-9]+$')
);

create trigger update_colleges_modtime
    before update on public.colleges
    for each row execute procedure public.update_updated_at_column();

-- 3.4 Departments
create table public.departments (
    id uuid primary key default gen_random_uuid(),
    college_id uuid not null references public.colleges(id) on delete cascade,
    name text not null,
    slug text not null,
    code text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null,
    constraint slug_format check (slug ~* '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
    constraint unique_college_dept_slug unique (college_id, slug),
    constraint unique_college_dept_code unique (college_id, code)
);

create trigger update_departments_modtime
    before update on public.departments
    for each row execute procedure public.update_updated_at_column();

-- 3.5 Facilities
create table public.facilities (
    id uuid primary key default gen_random_uuid(),
    facility_type public.facility_type not null,
    parent_id uuid references public.facilities(id) on delete cascade,
    institute_id uuid references public.institutes(id) on delete cascade,
    department_id uuid references public.departments(id) on delete cascade,
    name text not null,
    slug text,
    address text,
    code text,
    room_number text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null,
    
    constraint check_facility_fields check (
        (facility_type = 'campus' and institute_id is not null and parent_id is null) or
        (facility_type = 'building' and parent_id is not null) or
        (facility_type = 'laboratory' and department_id is not null)
    ),
    constraint unique_facility_slug unique (slug)
);

create trigger update_facilities_modtime
    before update on public.facilities
    for each row execute procedure public.update_updated_at_column();

-- 3.8 Centers
create table public.centers (
    id uuid primary key default gen_random_uuid(),
    college_id uuid references public.colleges(id) on delete cascade,
    institute_id uuid references public.institutes(id) on delete cascade,
    name text not null,
    slug text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null,
    constraint center_parent_check check (college_id is not null or institute_id is not null)
);

create trigger update_centers_modtime
    before update on public.centers
    for each row execute procedure public.update_updated_at_column();

-- 3.9 Cells
create table public.cells (
    id uuid primary key default gen_random_uuid(),
    college_id uuid not null references public.colleges(id) on delete cascade,
    name text not null,
    slug text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null
);

create trigger update_cells_modtime
    before update on public.cells
    for each row execute procedure public.update_updated_at_column();

-- 3.10 Committees
create table public.committees (
    id uuid primary key default gen_random_uuid(),
    college_id uuid not null references public.colleges(id) on delete cascade,
    name text not null,
    slug text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null
);

create trigger update_committees_modtime
    before update on public.committees
    for each row execute procedure public.update_updated_at_column();


--------------------------------------------------------------------------------
-- 4. ACADEMIC STRUCTURE TABLES
--------------------------------------------------------------------------------

-- 4.1 Courses
create table public.courses (
    id uuid primary key default gen_random_uuid(),
    department_id uuid references public.departments(id) on delete set null,
    name text not null,
    code text not null unique,
    degree_level public.degree_level not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null
);

create trigger update_courses_modtime
    before update on public.courses
    for each row execute procedure public.update_updated_at_column();

-- 4.2 Branches
create table public.branches (
    id uuid primary key default gen_random_uuid(),
    course_id uuid not null references public.courses(id) on delete cascade,
    name text not null,
    code text not null unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null
);

create trigger update_branches_modtime
    before update on public.branches
    for each row execute procedure public.update_updated_at_column();

-- Programs and department_programs tables have been removed and replaced by direct course->branch and department->course linkages.


--------------------------------------------------------------------------------
-- 5. USER PROFILES AND RBAC
--------------------------------------------------------------------------------

-- 5.1 User Profiles (Extends auth.users)
create table public.user_profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    first_name text,
    last_name text,
    avatar_url text,
    bio text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null
);

create trigger update_profiles_modtime
    before update on public.user_profiles
    for each row execute procedure public.update_updated_at_column();

-- Sync trigger to create public user profile automatically when a user is created in auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, first_name, last_name, avatar_url, bio, status, metadata)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'bio',
    'published'::public.content_status,
    '{}'::jsonb
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Link audits to user profiles now that they are declared
alter table public.trusts add foreign key (created_by) references public.user_profiles(id) on delete set null;
alter table public.trusts add foreign key (updated_by) references public.user_profiles(id) on delete set null;
alter table public.trusts add foreign key (deleted_by) references public.user_profiles(id) on delete set null;

alter table public.institutes add foreign key (created_by) references public.user_profiles(id) on delete set null;
alter table public.institutes add foreign key (updated_by) references public.user_profiles(id) on delete set null;
alter table public.institutes add foreign key (deleted_by) references public.user_profiles(id) on delete set null;

alter table public.colleges add foreign key (created_by) references public.user_profiles(id) on delete set null;
alter table public.colleges add foreign key (updated_by) references public.user_profiles(id) on delete set null;
alter table public.colleges add foreign key (deleted_by) references public.user_profiles(id) on delete set null;

alter table public.departments add foreign key (created_by) references public.user_profiles(id) on delete set null;
alter table public.departments add foreign key (updated_by) references public.user_profiles(id) on delete set null;
alter table public.departments add foreign key (deleted_by) references public.user_profiles(id) on delete set null;

alter table public.facilities add foreign key (created_by) references public.user_profiles(id) on delete set null;
alter table public.facilities add foreign key (updated_by) references public.user_profiles(id) on delete set null;
alter table public.facilities add foreign key (deleted_by) references public.user_profiles(id) on delete set null;

-- 5.2 Roles
create table public.roles (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    code text not null unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references public.user_profiles(id) on delete set null,
    updated_by uuid references public.user_profiles(id) on delete set null,
    deleted_at timestamp with time zone,
    deleted_by uuid references public.user_profiles(id) on delete set null,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null
);

create trigger update_roles_modtime
    before update on public.roles
    for each row execute procedure public.update_updated_at_column();

-- 5.3 Permissions
create table public.permissions (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    code text not null unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references public.user_profiles(id) on delete set null,
    updated_by uuid references public.user_profiles(id) on delete set null,
    deleted_at timestamp with time zone,
    deleted_by uuid references public.user_profiles(id) on delete set null,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null
);

create trigger update_permissions_modtime
    before update on public.permissions
    for each row execute procedure public.update_updated_at_column();

-- 5.4 Role Permissions mapping (M:N)
create table public.role_permissions (
    role_id uuid not null references public.roles(id) on delete cascade,
    permission_id uuid not null references public.permissions(id) on delete cascade,
    primary key (role_id, permission_id)
);

-- 5.5 User Scoped Roles
create table public.user_roles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.user_profiles(id) on delete cascade,
    role_id uuid not null references public.roles(id) on delete cascade,
    scope_type public.scope_level not null,
    trust_id uuid references public.trusts(id) on delete cascade,
    institute_id uuid references public.institutes(id) on delete cascade,
    college_id uuid references public.colleges(id) on delete cascade,
    department_id uuid references public.departments(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references public.user_profiles(id) on delete set null,
    updated_by uuid references public.user_profiles(id) on delete set null,
    deleted_at timestamp with time zone,
    deleted_by uuid references public.user_profiles(id) on delete set null,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null,
    
    constraint scope_fkey_check check (
        (scope_type = 'global' and trust_id is null and institute_id is null and college_id is null and department_id is null) or
        (scope_type = 'trust' and trust_id is not null and institute_id is null and college_id is null and department_id is null) or
        (scope_type = 'institute' and institute_id is not null and trust_id is null and college_id is null and department_id is null) or
        (scope_type = 'college' and college_id is not null and trust_id is null and institute_id is null and department_id is null) or
        (scope_type = 'department' and department_id is not null and trust_id is null and institute_id is null and college_id is null)
    ),
    constraint unique_user_role_scope unique (user_id, role_id, scope_type, trust_id, institute_id, college_id, department_id)
);

create trigger update_user_roles_modtime
    before update on public.user_roles
    for each row execute procedure public.update_updated_at_column();


--------------------------------------------------------------------------------
-- 6. WEBSITES & CMS MODULE
--------------------------------------------------------------------------------



-- 6.2 SEO Metadata
create table public.seo_metadata (
    id uuid primary key default gen_random_uuid(),
    meta_title text,
    meta_description text,
    meta_keywords text[] default '{}'::text[] not null,
    canonical_url text,
    og_title text,
    og_description text,
    og_image_url text,
    twitter_card text,
    structured_data jsonb default '{}'::jsonb not null,
    robots_directives text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references public.user_profiles(id) on delete set null,
    updated_by uuid references public.user_profiles(id) on delete set null,
    deleted_at timestamp with time zone,
    deleted_by uuid references public.user_profiles(id) on delete set null,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null
);

create trigger update_seo_metadata_modtime
    before update on public.seo_metadata
    for each row execute procedure public.update_updated_at_column();

-- 6.3 Pages
create table public.pages (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    slug text not null,
    content text,
    parent_id uuid references public.pages(id) on delete set null,
    is_homepage boolean default false not null,
    seo_id uuid references public.seo_metadata(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references public.user_profiles(id) on delete set null,
    updated_by uuid references public.user_profiles(id) on delete set null,
    deleted_at timestamp with time zone,
    deleted_by uuid references public.user_profiles(id) on delete set null,
    status public.content_status default 'draft'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null,
    
    constraint slug_format check (slug ~* '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
    constraint unique_page_slug unique (slug)
);

create unique index unique_homepage on public.pages (is_homepage) where (is_homepage = true);

create trigger update_pages_modtime
    before update on public.pages
    for each row execute procedure public.update_updated_at_column();

-- 6.4 Menus
create table public.menus (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    code text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references public.user_profiles(id) on delete set null,
    updated_by uuid references public.user_profiles(id) on delete set null,
    deleted_at timestamp with time zone,
    deleted_by uuid references public.user_profiles(id) on delete set null,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null,
    constraint unique_menu_code unique (code)
);

create trigger update_menus_modtime
    before update on public.menus
    for each row execute procedure public.update_updated_at_column();

-- 6.5 Menu Items
create table public.menu_items (
    id uuid primary key default gen_random_uuid(),
    menu_id uuid not null references public.menus(id) on delete cascade,
    parent_id uuid references public.menu_items(id) on delete set null,
    title text not null,
    link_type public.link_type not null,
    url text,
    page_id uuid references public.pages(id) on delete set null,
    icon text,
    sort_order integer default 0 not null,
    permissions_required text[] default '{}'::text[] not null,
    visibility_rules jsonb default '{}'::jsonb not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references public.user_profiles(id) on delete set null,
    updated_by uuid references public.user_profiles(id) on delete set null,
    deleted_at timestamp with time zone,
    deleted_by uuid references public.user_profiles(id) on delete set null,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null,
    
    constraint menu_item_url_check check (
        (link_type = 'internal' and page_id is not null) or
        (link_type = 'external' and url is not null)
    )
);

create trigger update_menu_items_modtime
    before update on public.menu_items
    for each row execute procedure public.update_updated_at_column();

-- 6.6 Redirects
create table public.redirects (
    id uuid primary key default gen_random_uuid(),
    source_path text not null,
    target_path text not null,
    status_code integer default 301 not null check (status_code in (301, 302, 307, 308)),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references public.user_profiles(id) on delete set null,
    updated_by uuid references public.user_profiles(id) on delete set null,
    deleted_at timestamp with time zone,
    deleted_by uuid references public.user_profiles(id) on delete set null,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null,
    constraint unique_source_redirect unique (source_path)
);

create trigger update_redirects_modtime
    before update on public.redirects
    for each row execute procedure public.update_updated_at_column();


--------------------------------------------------------------------------------
-- 7. HOMEPAGE BUILDER
--------------------------------------------------------------------------------

-- 7.1 Sections
create table public.homepage_sections (
    id uuid primary key default gen_random_uuid(),
    scope_type public.scope_level default 'global'::public.scope_level not null,
    department_id uuid references public.departments(id) on delete cascade,
    title text,
    section_type text not null,
    sort_order integer default 0 not null,
    is_active boolean default true not null,
    config jsonb default '{}'::jsonb not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references public.user_profiles(id) on delete set null,
    updated_by uuid references public.user_profiles(id) on delete set null,
    deleted_at timestamp with time zone,
    deleted_by uuid references public.user_profiles(id) on delete set null,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null,
    
    constraint check_content_scope check (
        (scope_type = 'global' and department_id is null) or
        (scope_type = 'department' and department_id is not null)
    )
);

create trigger update_homepage_sections_modtime
    before update on public.homepage_sections
    for each row execute procedure public.update_updated_at_column();

-- 7.2 Widgets (Items inside a section)
create table public.homepage_widgets (
    id uuid primary key default gen_random_uuid(),
    section_id uuid not null references public.homepage_sections(id) on delete cascade,
    title text,
    widget_type text not null,
    config jsonb default '{}'::jsonb not null,
    sort_order integer default 0 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references public.user_profiles(id) on delete set null,
    updated_by uuid references public.user_profiles(id) on delete set null,
    deleted_at timestamp with time zone,
    deleted_by uuid references public.user_profiles(id) on delete set null,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null
);

create trigger update_homepage_widgets_modtime
    before update on public.homepage_widgets
    for each row execute procedure public.update_updated_at_column();

-- 7.3 Homepage Items (Unified table for list items, banners, counters, why-choose cards, and hero elements)
create table public.homepage_items (
    id uuid primary key default gen_random_uuid(),
    scope_type public.scope_level default 'global'::public.scope_level not null,
    department_id uuid references public.departments(id) on delete cascade,
    item_type text not null, -- 'hero', 'quick_link', 'highlight_card', 'carousel_slide', 'stat', 'why_choose', 'trust_badge', 'promo_card', 'important_link', 'popup_announcement'
    eyebrow text,
    title text not null,
    title_accent text,
    subtitle text,
    body text,
    image_url text,
    icon_name text,
    link_href text,
    link_label text,
    secondary_link_href text,
    secondary_link_label text,
    sort_order integer default 0 not null,
    is_active boolean default true not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references public.user_profiles(id) on delete set null,
    updated_by uuid references public.user_profiles(id) on delete set null,
    deleted_at timestamp with time zone,
    deleted_by uuid references public.user_profiles(id) on delete set null,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null,
    
    constraint check_content_scope check (
        (scope_type = 'global' and department_id is null) or
        (scope_type = 'department' and department_id is not null)
    )
);

create trigger update_homepage_items_modtime
    before update on public.homepage_items
    for each row execute procedure public.update_updated_at_column();



--------------------------------------------------------------------------------
-- 8. FACULTY & STAFF MODULE
--------------------------------------------------------------------------------

-- 8.1 Designations
create table public.designations (
    id uuid primary key default gen_random_uuid(),
    title text not null unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references public.user_profiles(id) on delete set null,
    updated_by uuid references public.user_profiles(id) on delete set null,
    deleted_at timestamp with time zone,
    deleted_by uuid references public.user_profiles(id) on delete set null,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null
);

create trigger update_designations_modtime
    before update on public.designations
    for each row execute procedure public.update_updated_at_column();

-- 8.2 Faculty Profiles
create table public.staff_profiles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.user_profiles(id) on delete set null,
    title text,
    first_name text not null,
    last_name text not null,
    email text not null unique,
    phone text,
    avatar_url text,
    bio text,
    office_hours jsonb default '{}'::jsonb not null,
    social_links jsonb default '{}'::jsonb not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references public.user_profiles(id) on delete set null,
    updated_by uuid references public.user_profiles(id) on delete set null,
    deleted_at timestamp with time zone,
    deleted_by uuid references public.user_profiles(id) on delete set null,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null
);

create trigger update_staff_profiles_modtime
    before update on public.staff_profiles
    for each row execute procedure public.update_updated_at_column();

-- Complete circular dependency for HoD in departments
alter table public.departments add column head_of_department_id uuid references public.staff_profiles(id) on delete set null;

-- 8.3 Faculty Department Assignments (Many-to-Many Assignment with Designations)
create table public.staff_department_assignments (
    id uuid primary key default gen_random_uuid(),
    staff_id uuid not null references public.staff_profiles(id) on delete cascade,
    department_id uuid not null references public.departments(id) on delete cascade,
    designation_id uuid not null references public.designations(id) on delete set null,
    is_primary boolean default false not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references public.user_profiles(id) on delete set null,
    updated_by uuid references public.user_profiles(id) on delete set null,
    deleted_at timestamp with time zone,
    deleted_by uuid references public.user_profiles(id) on delete set null,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null,
    
    constraint unique_faculty_dept unique (staff_id, department_id)
);

create trigger update_faculty_dept_assignments_modtime
    before update on public.staff_department_assignments
    for each row execute procedure public.update_updated_at_column();

-- 8.4 Qualifications
create table public.qualifications (
    id uuid primary key default gen_random_uuid(),
    staff_id uuid not null references public.staff_profiles(id) on delete cascade,
    degree text not null,
    institution text not null,
    year integer not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references public.user_profiles(id) on delete set null,
    updated_by uuid references public.user_profiles(id) on delete set null,
    deleted_at timestamp with time zone,
    deleted_by uuid references public.user_profiles(id) on delete set null,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null
);

create trigger update_qualifications_modtime
    before update on public.qualifications
    for each row execute procedure public.update_updated_at_column();

-- 8.5 Experiences
create table public.experiences (
    id uuid primary key default gen_random_uuid(),
    staff_id uuid not null references public.staff_profiles(id) on delete cascade,
    organization text not null,
    role text not null,
    start_date date not null,
    end_date date,
    is_academic boolean default true not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references public.user_profiles(id) on delete set null,
    updated_by uuid references public.user_profiles(id) on delete set null,
    deleted_at timestamp with time zone,
    deleted_by uuid references public.user_profiles(id) on delete set null,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null
);

create trigger update_experiences_modtime
    before update on public.experiences
    for each row execute procedure public.update_updated_at_column();

-- 8.6 Research Interests
create table public.research_interests (
    id uuid primary key default gen_random_uuid(),
    staff_id uuid not null references public.staff_profiles(id) on delete cascade,
    interest_name text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references public.user_profiles(id) on delete set null,
    updated_by uuid references public.user_profiles(id) on delete set null,
    deleted_at timestamp with time zone,
    deleted_by uuid references public.user_profiles(id) on delete set null,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null,
    constraint unique_faculty_interest unique (staff_id, interest_name)
);

create trigger update_research_interests_modtime
    before update on public.research_interests
    for each row execute procedure public.update_updated_at_column();

-- 8.7 Publications
create table public.publications (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    journal_conference text not null,
    publish_date date not null,
    doi_url text,
    abstract text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references public.user_profiles(id) on delete set null,
    updated_by uuid references public.user_profiles(id) on delete set null,
    deleted_at timestamp with time zone,
    deleted_by uuid references public.user_profiles(id) on delete set null,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null
);

create trigger update_publications_modtime
    before update on public.publications
    for each row execute procedure public.update_updated_at_column();

-- 8.8 Faculty Publications Mapping
create table public.staff_publications (
    staff_id uuid not null references public.staff_profiles(id) on delete cascade,
    publication_id uuid not null references public.publications(id) on delete cascade,
    primary key (staff_id, publication_id)
);

-- 8.9 Awards
create table public.awards (
    id uuid primary key default gen_random_uuid(),
    staff_id uuid not null references public.staff_profiles(id) on delete cascade,
    title text not null,
    awarding_body text not null,
    received_year integer not null,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references public.user_profiles(id) on delete set null,
    updated_by uuid references public.user_profiles(id) on delete set null,
    deleted_at timestamp with time zone,
    deleted_by uuid references public.user_profiles(id) on delete set null,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null
);

create trigger update_awards_modtime
    before update on public.awards
    for each row execute procedure public.update_updated_at_column();


--------------------------------------------------------------------------------
-- 9. WEBSITE CONTENT MODULES
--------------------------------------------------------------------------------

-- 9.1 Content Categories (CMS tags/categories)
create table public.content_categories (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null,
    module_type text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references public.user_profiles(id) on delete set null,
    updated_by uuid references public.user_profiles(id) on delete set null,
    deleted_at timestamp with time zone,
    deleted_by uuid references public.user_profiles(id) on delete set null,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null,
    constraint unique_category_slug unique (slug, module_type)
);

create trigger update_content_categories_modtime
    before update on public.content_categories
    for each row execute procedure public.update_updated_at_column();

-- 9.2 Posts (News, Announcements)
create table public.posts (
    id uuid primary key default gen_random_uuid(),
    scope_type public.scope_level default 'global'::public.scope_level not null,
    department_id uuid references public.departments(id) on delete cascade,
    title text not null,
    slug text not null,
    summary text,
    content text,
    featured_image_url text,
    category_id uuid references public.content_categories(id) on delete set null,
    is_featured boolean default false not null,
    published_at timestamp with time zone,
    expires_at timestamp with time zone,
    seo_id uuid references public.seo_metadata(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references public.user_profiles(id) on delete set null,
    updated_by uuid references public.user_profiles(id) on delete set null,
    deleted_at timestamp with time zone,
    deleted_by uuid references public.user_profiles(id) on delete set null,
    status public.content_status default 'draft'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null,
    
    constraint check_content_scope check (
        (scope_type = 'global' and department_id is null) or
        (scope_type = 'department' and department_id is not null)
    )
);

create unique index unique_post_slug_global on public.posts (slug) where (department_id is null);
create unique index unique_post_slug_dept on public.posts (department_id, slug) where (department_id is not null);

create trigger update_posts_modtime
    before update on public.posts
    for each row execute procedure public.update_updated_at_column();

-- 9.3 Events
create table public.events (
    id uuid primary key default gen_random_uuid(),
    scope_type public.scope_level default 'global'::public.scope_level not null,
    department_id uuid references public.departments(id) on delete cascade,
    title text not null,
    slug text not null,
    description text,
    tag text,
    start_date timestamp with time zone not null,
    end_date timestamp with time zone,
    location text,
    map_url text,
    registration_link text,
    featured_image_url text,
    sort_order integer default 0 not null,
    seo_id uuid references public.seo_metadata(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references public.user_profiles(id) on delete set null,
    updated_by uuid references public.user_profiles(id) on delete set null,
    deleted_at timestamp with time zone,
    deleted_by uuid references public.user_profiles(id) on delete set null,
    status public.event_status default 'draft'::public.event_status not null,
    metadata jsonb default '{}'::jsonb not null,
    
    constraint check_content_scope check (
        (scope_type = 'global' and department_id is null) or
        (scope_type = 'department' and department_id is not null)
    ),
    constraint event_date_check check (start_date <= end_date)
);

create unique index unique_event_slug_global on public.events (slug) where (department_id is null);
create unique index unique_event_slug_dept on public.events (department_id, slug) where (department_id is not null);

create trigger update_events_modtime
    before update on public.events
    for each row execute procedure public.update_updated_at_column();

-- 9.4 Achievements
create table public.achievements (
    id uuid primary key default gen_random_uuid(),
    scope_type public.scope_level default 'global'::public.scope_level not null,
    department_id uuid references public.departments(id) on delete cascade,
    title text not null,
    slug text not null,
    description text,
    date date not null,
    category text not null check (category in ('student', 'faculty', 'college', 'department')),
    featured_image_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references public.user_profiles(id) on delete set null,
    updated_by uuid references public.user_profiles(id) on delete set null,
    deleted_at timestamp with time zone,
    deleted_by uuid references public.user_profiles(id) on delete set null,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null,
    
    constraint check_content_scope check (
        (scope_type = 'global' and department_id is null) or
        (scope_type = 'department' and department_id is not null)
    )
);

create unique index unique_achievement_slug_global on public.achievements (slug) where (department_id is null);
create unique index unique_achievement_slug_dept on public.achievements (department_id, slug) where (department_id is not null);

create trigger update_achievements_modtime
    before update on public.achievements
    for each row execute procedure public.update_updated_at_column();

-- 9.5 Gallery Albums
create table public.gallery_albums (
    id uuid primary key default gen_random_uuid(),
    scope_type public.scope_level default 'global'::public.scope_level not null,
    department_id uuid references public.departments(id) on delete cascade,
    title text not null,
    slug text not null,
    description text,
    cover_image_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references public.user_profiles(id) on delete set null,
    updated_by uuid references public.user_profiles(id) on delete set null,
    deleted_at timestamp with time zone,
    deleted_by uuid references public.user_profiles(id) on delete set null,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null,
    
    constraint check_content_scope check (
        (scope_type = 'global' and department_id is null) or
        (scope_type = 'department' and department_id is not null)
    )
);

create unique index unique_album_slug_global on public.gallery_albums (slug) where (department_id is null);
create unique index unique_album_slug_dept on public.gallery_albums (department_id, slug) where (department_id is not null);

create trigger update_gallery_albums_modtime
    before update on public.gallery_albums
    for each row execute procedure public.update_updated_at_column();

-- 9.6 Gallery Media (Photos / Videos)
create table public.gallery_media (
    id uuid primary key default gen_random_uuid(),
    album_id uuid not null references public.gallery_albums(id) on delete cascade,
    media_type text not null check (media_type in ('image', 'video')),
    url text not null,
    caption text,
    sort_order integer default 0 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references public.user_profiles(id) on delete set null,
    updated_by uuid references public.user_profiles(id) on delete set null,
    deleted_at timestamp with time zone,
    deleted_by uuid references public.user_profiles(id) on delete set null,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null
);

create trigger update_gallery_media_modtime
    before update on public.gallery_media
    for each row execute procedure public.update_updated_at_column();

-- 9.7 Testimonials
create table public.testimonials (
    id uuid primary key default gen_random_uuid(),
    author_name text not null,
    author_role text not null,
    company_or_institution text,
    quote text not null,
    avatar_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references public.user_profiles(id) on delete set null,
    updated_by uuid references public.user_profiles(id) on delete set null,
    deleted_at timestamp with time zone,
    deleted_by uuid references public.user_profiles(id) on delete set null,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null
);

create trigger update_testimonials_modtime
    before update on public.testimonials
    for each row execute procedure public.update_updated_at_column();

-- 9.8 Downloads
create table public.downloads (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    file_url text not null,
    file_type text,
    file_size integer,
    category text not null check (category in ('circular', 'notice', 'syllabus', 'form', 'other')),
    publish_date date default current_date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references public.user_profiles(id) on delete set null,
    updated_by uuid references public.user_profiles(id) on delete set null,
    deleted_at timestamp with time zone,
    deleted_by uuid references public.user_profiles(id) on delete set null,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null
);

create trigger update_downloads_modtime
    before update on public.downloads
    for each row execute procedure public.update_updated_at_column();

-- 9.9 Recruiters
create table public.recruiters (
    id uuid primary key default gen_random_uuid(),
    company_name text not null,
    logo_url text not null,
    website_url text,
    sort_order integer default 0 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references public.user_profiles(id) on delete set null,
    updated_by uuid references public.user_profiles(id) on delete set null,
    deleted_at timestamp with time zone,
    deleted_by uuid references public.user_profiles(id) on delete set null,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null
);

create trigger update_recruiters_modtime
    before update on public.recruiters
    for each row execute procedure public.update_updated_at_column();

-- 9.10 Placement Statistics
create table public.placement_statistics (
    id uuid primary key default gen_random_uuid(),
    academic_year text not null,
    total_students integer not null,
    placed_students integer not null,
    highest_package numeric(12,2),
    average_package numeric(12,2),
    recruiters_count integer,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references public.user_profiles(id) on delete set null,
    updated_by uuid references public.user_profiles(id) on delete set null,
    deleted_at timestamp with time zone,
    deleted_by uuid references public.user_profiles(id) on delete set null,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null,
    constraint unique_placement_year unique (academic_year)
);

create trigger update_placement_statistics_modtime
    before update on public.placement_statistics
    for each row execute procedure public.update_updated_at_column();

-- 9.11 Research Projects
create table public.research_projects (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    funding_agency text,
    amount numeric(15,2),
    duration_years numeric(3,1),
    project_status text not null check (project_status in ('ongoing', 'completed')),
    principal_investigator_id uuid not null references public.staff_profiles(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references public.user_profiles(id) on delete set null,
    updated_by uuid references public.user_profiles(id) on delete set null,
    deleted_at timestamp with time zone,
    deleted_by uuid references public.user_profiles(id) on delete set null,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null
);

create trigger update_research_projects_modtime
    before update on public.research_projects
    for each row execute procedure public.update_updated_at_column();

-- 9.12 Patents
create table public.patents (
    id uuid primary key default gen_random_uuid(),
    staff_id uuid not null references public.staff_profiles(id) on delete cascade,
    title text not null,
    patent_number text,
    patent_status text not null check (patent_status in ('filed', 'published', 'granted')),
    publication_date date,
    inventors text[] not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references public.user_profiles(id) on delete set null,
    updated_by uuid references public.user_profiles(id) on delete set null,
    deleted_at timestamp with time zone,
    deleted_by uuid references public.user_profiles(id) on delete set null,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null
);

create trigger update_patents_modtime
    before update on public.patents
    for each row execute procedure public.update_updated_at_column();



-- 9.13 MoUs & Collaborations
create table public.mous (
    id uuid primary key default gen_random_uuid(),
    partner_organization text not null,
    logo_url text,
    purpose text,
    signed_date date not null,
    expiry_date date,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references public.user_profiles(id) on delete set null,
    updated_by uuid references public.user_profiles(id) on delete set null,
    deleted_at timestamp with time zone,
    deleted_by uuid references public.user_profiles(id) on delete set null,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null
);

create trigger update_mous_modtime
    before update on public.mous
    for each row execute procedure public.update_updated_at_column();

-- 9.14 Accreditations & Rankings
create table public.accreditations (
    id uuid primary key default gen_random_uuid(),
    organization text not null,
    value text not null,
    received_year integer not null,
    expiry_date date,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references public.user_profiles(id) on delete set null,
    updated_by uuid references public.user_profiles(id) on delete set null,
    deleted_at timestamp with time zone,
    deleted_by uuid references public.user_profiles(id) on delete set null,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null
);

create trigger update_accreditations_modtime
    before update on public.accreditations
    for each row execute procedure public.update_updated_at_column();

-- 9.15 Student Clubs
create table public.student_clubs (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null,
    description text,
    logo_url text,
    coordinator_id uuid references public.staff_profiles(id) on delete set null,
    student_coordinator_name text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references public.user_profiles(id) on delete set null,
    updated_by uuid references public.user_profiles(id) on delete set null,
    deleted_at timestamp with time zone,
    deleted_by uuid references public.user_profiles(id) on delete set null,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null,
    constraint unique_club_slug unique (slug)
);

create trigger update_student_clubs_modtime
    before update on public.student_clubs
    for each row execute procedure public.update_updated_at_column();


--------------------------------------------------------------------------------
-- 10. MEDIA LIBRARY
--------------------------------------------------------------------------------

-- 10.1 Media Folders
create table public.media_folders (
    id uuid primary key default gen_random_uuid(),
    scope_type public.scope_level default 'global'::public.scope_level not null,
    department_id uuid references public.departments(id) on delete cascade,
    name text not null,
    parent_id uuid references public.media_folders(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references public.user_profiles(id) on delete set null,
    updated_by uuid references public.user_profiles(id) on delete set null,
    deleted_at timestamp with time zone,
    deleted_by uuid references public.user_profiles(id) on delete set null,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null,
    
    constraint check_content_scope check (
        (scope_type = 'global' and department_id is null) or
        (scope_type = 'department' and department_id is not null)
    )
);

create unique index unique_folder_parent_global on public.media_folders (name, parent_id) where (department_id is null);
create unique index unique_folder_parent_dept on public.media_folders (department_id, name, parent_id) where (department_id is not null);

create trigger update_media_folders_modtime
    before update on public.media_folders
    for each row execute procedure public.update_updated_at_column();

-- 10.2 Media Files
create table public.media_files (
    id uuid primary key default gen_random_uuid(),
    scope_type public.scope_level default 'global'::public.scope_level not null,
    department_id uuid references public.departments(id) on delete cascade,
    folder_id uuid references public.media_folders(id) on delete set null,
    filename text not null,
    file_path text not null unique,
    mime_type text not null,
    file_size integer not null,
    alt_text text,
    caption text,
    tags text[] default '{}'::text[] not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references public.user_profiles(id) on delete set null,
    updated_by uuid references public.user_profiles(id) on delete set null,
    deleted_at timestamp with time zone,
    deleted_by uuid references public.user_profiles(id) on delete set null,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null,
    
    constraint check_content_scope check (
        (scope_type = 'global' and department_id is null) or
        (scope_type = 'department' and department_id is not null)
    )
);

create trigger update_media_files_modtime
    before update on public.media_files
    for each row execute procedure public.update_updated_at_column();


--------------------------------------------------------------------------------
-- 11. CONTACT MODULE & INQUIRY FORMS
--------------------------------------------------------------------------------

-- 11.1 Contact Info
create table public.contact_info (
    id uuid primary key default gen_random_uuid(),
    address text,
    phone text,
    email text,
    office_hours jsonb default '{}'::jsonb not null,
    map_iframe_url text,
    social_links jsonb default '{}'::jsonb not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references public.user_profiles(id) on delete set null,
    updated_by uuid references public.user_profiles(id) on delete set null,
    deleted_at timestamp with time zone,
    deleted_by uuid references public.user_profiles(id) on delete set null,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null
);

create trigger update_contact_info_modtime
    before update on public.contact_info
    for each row execute procedure public.update_updated_at_column();

-- 11.2 Inquiry Forms
create table public.inquiry_forms (
    id uuid primary key default gen_random_uuid(),
    form_name text not null,
    fields_config jsonb default '[]'::jsonb not null,
    recipient_emails text[] default '{}'::text[] not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references public.user_profiles(id) on delete set null,
    updated_by uuid references public.user_profiles(id) on delete set null,
    deleted_at timestamp with time zone,
    deleted_by uuid references public.user_profiles(id) on delete set null,
    status public.content_status default 'published'::public.content_status not null,
    metadata jsonb default '{}'::jsonb not null,
    constraint unique_form_name unique (form_name)
);

create trigger update_inquiry_forms_modtime
    before update on public.inquiry_forms
    for each row execute procedure public.update_updated_at_column();

-- 11.3 Inquiry Submissions
create table public.inquiry_submissions (
    id uuid primary key default gen_random_uuid(),
    form_id uuid not null references public.inquiry_forms(id) on delete cascade,
    submitted_data jsonb not null,
    status public.submission_status default 'unread'::public.submission_status not null,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references public.user_profiles(id) on delete set null,
    updated_by uuid references public.user_profiles(id) on delete set null,
    deleted_at timestamp with time zone,
    deleted_by uuid references public.user_profiles(id) on delete set null,
    metadata jsonb default '{}'::jsonb not null
);

create trigger update_inquiry_submissions_modtime
    before update on public.inquiry_submissions
    for each row execute procedure public.update_updated_at_column();


--------------------------------------------------------------------------------
-- 12. AUDITING SYSTEM
--------------------------------------------------------------------------------

-- 12.1 Audit Logs
create table public.audit_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.user_profiles(id) on delete set null,
    action text not null,
    table_name text not null,
    record_id uuid not null,
    old_values jsonb,
    new_values jsonb,
    client_ip text,
    user_agent text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12.2 Generic Audit Logging Trigger Function
create or replace function public.process_audit_log()
returns trigger as $$
declare
    v_user_id uuid;
    v_client_ip text;
    v_user_agent text;
begin
    -- Retrieve Supabase transaction context parameters if available
    begin
        v_user_id := auth.uid();
    exception when others then
        v_user_id := null;
    end;
    
    begin
        v_client_ip := current_setting('request.headers', true)::jsonb->>'x-forwarded-for';
        v_user_agent := current_setting('request.headers', true)::jsonb->>'user-agent';
    exception when others then
        v_client_ip := null;
        v_user_agent := null;
    end;

    if (tg_op = 'INSERT') then
        insert into public.audit_logs (user_id, action, table_name, record_id, old_values, new_values, client_ip, user_agent)
        values (v_user_id, tg_op, tg_table_name, new.id, null, to_jsonb(new), v_client_ip, v_user_agent);
        return new;
    elsif (tg_op = 'UPDATE') then
        insert into public.audit_logs (user_id, action, table_name, record_id, old_values, new_values, client_ip, user_agent)
        values (v_user_id, tg_op, tg_table_name, new.id, to_jsonb(old), to_jsonb(new), v_client_ip, v_user_agent);
        return new;
    elsif (tg_op = 'DELETE') then
        insert into public.audit_logs (user_id, action, table_name, record_id, old_values, new_values, client_ip, user_agent)
        values (v_user_id, tg_op, tg_table_name, old.id, to_jsonb(old), null, v_client_ip, v_user_agent);
        return old;
    end if;
    return null;
end;
$$ language plpgsql security definer;

-- Apply Audit Trigger to Content Tables
create trigger audit_posts_trigger
    after insert or update or delete on public.posts
    for each row execute procedure public.process_audit_log();

create trigger audit_pages_trigger
    after insert or update or delete on public.pages
    for each row execute procedure public.process_audit_log();

create trigger audit_events_trigger
    after insert or update or delete on public.events
    for each row execute procedure public.process_audit_log();

create trigger audit_homepage_sections_trigger
    after insert or update or delete on public.homepage_sections
    for each row execute procedure public.process_audit_log();

create trigger audit_homepage_widgets_trigger
    after insert or update or delete on public.homepage_widgets
    for each row execute procedure public.process_audit_log();

--------------------------------------------------------------------------------
-- 13. INDEXES FOR PERFORMANCE OPTIMIZATION
--------------------------------------------------------------------------------

-- Foreign Key Indexes
create index idx_institutes_trust_id on public.institutes(trust_id);
create index idx_colleges_institute_id on public.colleges(institute_id);
create index idx_departments_college_id on public.departments(college_id);
create index idx_facilities_parent_id on public.facilities(parent_id);
create index idx_facilities_institute_id on public.facilities(institute_id);
create index idx_facilities_department_id on public.facilities(department_id);
create index idx_courses_department_id on public.courses(department_id);
create index idx_branches_course_id on public.branches(course_id);
create index idx_user_roles_user_id on public.user_roles(user_id);
create index idx_research_projects_pi_id on public.research_projects(principal_investigator_id);
create index idx_patents_staff_id on public.patents(staff_id);
create index idx_menu_items_menu_id on public.menu_items(menu_id);
create index idx_media_files_folder_id on public.media_files(folder_id);

-- Slug and Route Indexes
create index idx_trust_slug on public.trusts(slug);
create index idx_institute_slug on public.institutes(slug);
create index idx_college_slug on public.colleges(slug);
create index idx_dept_slug on public.departments(slug);
create index idx_facility_slug on public.facilities(slug);
create index idx_page_slug on public.pages(slug);
create index idx_post_slug on public.posts(slug);
create index idx_event_slug on public.events(slug);

-- Scoped Content Indexes
create index idx_events_scope on public.events(scope_type, department_id);
create index idx_posts_scope on public.posts(scope_type, department_id);
create index idx_achievements_scope on public.achievements(scope_type, department_id);
create index idx_gallery_albums_scope on public.gallery_albums(scope_type, department_id);
create index idx_media_folders_scope on public.media_folders(scope_type, department_id);
create index idx_media_files_scope on public.media_files(scope_type, department_id);

-- Homepage Builder Indexes
create index idx_homepage_sections_scope on public.homepage_sections(scope_type, department_id);
create index idx_homepage_widgets_section_id on public.homepage_widgets(section_id);
create index idx_homepage_items_scope on public.homepage_items(scope_type, department_id);

-- Soft Delete Filter Indexes (Partial Indexes for active content queries)
create index idx_pages_active on public.pages(status) where deleted_at is null;
create index idx_posts_active on public.posts(status) where deleted_at is null;
create index idx_events_active on public.events(status) where deleted_at is null;
