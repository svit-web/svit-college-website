# Supabase Database Schema & Data Dictionary

This document contains the schema definitions and data dictionary for the public schema of the connected Supabase instance.

## Table Summary

| Table Name | RLS Enabled | Approx. Rows | Columns Count | Primary Keys |
| :--- | :---: | :---: | :---: | :--- |
| [public.accreditations](#publicaccreditations) | ✅ Yes | 0 | 13 | `id` |
| [public.achievements](#publicachievements) | ✅ Yes | 0 | 17 | `id` |
| [public.audit_logs](#publicaudit_logs) | ✅ Yes | 2 | 10 | `id` |
| [public.awards](#publicawards) | ✅ Yes | 0 | 14 | `id` |
| [public.branches](#publicbranches) | ✅ Yes | 0 | 12 | `id` |
| [public.cells](#publiccells) | ✅ Yes | 0 | 12 | `id` |
| [public.centers](#publiccenters) | ✅ Yes | 0 | 13 | `id` |
| [public.colleges](#publiccolleges) | ✅ Yes | 4 | 16 | `id` |
| [public.committees](#publiccommittees) | ✅ Yes | 0 | 12 | `id` |
| [public.contact_info](#publiccontact_info) | ✅ Yes | 0 | 15 | `id` |
| [public.content_categories](#publiccontent_categories) | ✅ Yes | 0 | 12 | `id` |
| [public.courses](#publiccourses) | ✅ Yes | 2 | 13 | `id` |
| [public.departments](#publicdepartments) | ✅ Yes | 3 | 14 | `id` |
| [public.designations](#publicdesignations) | ✅ Yes | 2 | 10 | `id` |
| [public.downloads](#publicdownloads) | ✅ Yes | 0 | 15 | `id` |
| [public.events](#publicevents) | ✅ Yes | 2 | 23 | `id` |
| [public.experiences](#publicexperiences) | ✅ Yes | 0 | 15 | `id` |
| [public.facilities](#publicfacilities) | ✅ Yes | 0 | 18 | `id` |
| [public.gallery_albums](#publicgallery_albums) | ✅ Yes | 0 | 15 | `id` |
| [public.gallery_media](#publicgallery_media) | ✅ Yes | 0 | 14 | `id` |
| [public.homepage_items](#publichomepage_items) | ✅ Yes | 20 | 25 | `id` |
| [public.homepage_sections](#publichomepage_sections) | ✅ Yes | 0 | 16 | `id` |
| [public.homepage_widgets](#publichomepage_widgets) | ✅ Yes | 0 | 14 | `id` |
| [public.inquiry_forms](#publicinquiry_forms) | ✅ Yes | 0 | 12 | `id` |
| [public.inquiry_submissions](#publicinquiry_submissions) | ✅ Yes | 0 | 12 | `id` |
| [public.institutes](#publicinstitutes) | ✅ Yes | 1 | 15 | `id` |
| [public.media_files](#publicmedia_files) | ✅ Yes | 0 | 19 | `id` |
| [public.media_folders](#publicmedia_folders) | ✅ Yes | 0 | 13 | `id` |
| [public.menu_items](#publicmenu_items) | ✅ Yes | 10 | 19 | `id` |
| [public.menus](#publicmenus) | ✅ Yes | 2 | 11 | `id` |
| [public.mous](#publicmous) | ✅ Yes | 0 | 14 | `id` |
| [public.pages](#publicpages) | ✅ Yes | 0 | 15 | `id` |
| [public.patents](#publicpatents) | ✅ Yes | 0 | 15 | `id` |
| [public.permissions](#publicpermissions) | ✅ Yes | 0 | 11 | `id` |
| [public.placement_statistics](#publicplacement_statistics) | ✅ Yes | 0 | 15 | `id` |
| [public.posts](#publicposts) | ✅ Yes | 0 | 21 | `id` |
| [public.publications](#publicpublications) | ✅ Yes | 0 | 14 | `id` |
| [public.qualifications](#publicqualifications) | ✅ Yes | 0 | 13 | `id` |
| [public.recruiters](#publicrecruiters) | ✅ Yes | 30 | 13 | `id` |
| [public.redirects](#publicredirects) | ✅ Yes | 0 | 12 | `id` |
| [public.research_interests](#publicresearch_interests) | ✅ Yes | 0 | 11 | `id` |
| [public.research_projects](#publicresearch_projects) | ✅ Yes | 0 | 15 | `id` |
| [public.role_permissions](#publicrole_permissions) | ✅ Yes | 0 | 2 | `role_id, permission_id` |
| [public.roles](#publicroles) | ✅ Yes | 0 | 11 | `id` |
| [public.seo_metadata](#publicseo_metadata) | ✅ Yes | 0 | 19 | `id` |
| [public.staff_department_assignments](#publicstaff_department_assignments) | ✅ Yes | 0 | 13 | `id` |
| [public.staff_profiles](#publicstaff_profiles) | ✅ Yes | 1 | 19 | `id` |
| [public.staff_publications](#publicstaff_publications) | ✅ Yes | 0 | 2 | `staff_id, publication_id` |
| [public.student_clubs](#publicstudent_clubs) | ✅ Yes | 0 | 15 | `id` |
| [public.testimonials](#publictestimonials) | ✅ Yes | 0 | 14 | `id` |
| [public.trusts](#publictrusts) | ✅ Yes | 1 | 14 | `id` |
| [public.user_profiles](#publicuser_profiles) | ✅ Yes | 0 | 13 | `id` |
| [public.user_roles](#publicuser_roles) | ✅ Yes | 0 | 16 | `id` |

## Detailed Table Definitions

### public.accreditations
- **RLS Enabled:** Enabled
- **Approx. Rows:** 0
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **organization** | `text` | ❌ No | - | - |
| **value** | `text` | ❌ No | - | - |
| **received_year** | `integer (int4)` | ❌ No | - | - |
| **expiry_date** | `date` | ✅ Yes | - | - |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `created_by` references `public.user_profiles.id` (via `accreditations_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `accreditations_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `accreditations_deleted_by_fkey`)

---

### public.achievements
- **RLS Enabled:** Enabled
- **Approx. Rows:** 0
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **scope_type** | `USER-DEFINED (scope_level)` | ❌ No | `'global'::scope_level` | Enums: `global`, `trust`, `institute`, `college`, `department` |
| **department_id** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.departments.id` |
| **title** | `text` | ❌ No | - | - |
| **slug** | `text` | ❌ No | - | - |
| **description** | `text` | ✅ Yes | - | - |
| **date** | `date` | ❌ No | - | - |
| **category** | `text` | ❌ No | - | Check: `category = ANY (ARRAY['student'::text, 'faculty'::text, 'college'::text, 'department'::text])` |
| **featured_image_url** | `text` | ✅ Yes | - | - |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `department_id` references `public.departments.id` (via `achievements_department_id_fkey`)
- `created_by` references `public.user_profiles.id` (via `achievements_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `achievements_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `achievements_deleted_by_fkey`)

---

### public.audit_logs
- **RLS Enabled:** Enabled
- **Approx. Rows:** 2
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **user_id** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **action** | `text` | ❌ No | - | - |
| **table_name** | `text` | ❌ No | - | - |
| **record_id** | `uuid` | ❌ No | - | - |
| **old_values** | `jsonb` | ✅ Yes | - | - |
| **new_values** | `jsonb` | ✅ Yes | - | - |
| **client_ip** | `text` | ✅ Yes | - | - |
| **user_agent** | `text` | ✅ Yes | - | - |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |

**Foreign Key Constraints:**
- `user_id` references `public.user_profiles.id` (via `audit_logs_user_id_fkey`)

---

### public.awards
- **RLS Enabled:** Enabled
- **Approx. Rows:** 0
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **staff_id** | `uuid` | ❌ No | - | 🔗 FK ➔ `public.staff_profiles.id` |
| **title** | `text` | ❌ No | - | - |
| **awarding_body** | `text` | ❌ No | - | - |
| **received_year** | `integer (int4)` | ❌ No | - | - |
| **description** | `text` | ✅ Yes | - | - |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `staff_id` references `public.staff_profiles.id` (via `awards_staff_id_fkey`)
- `created_by` references `public.user_profiles.id` (via `awards_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `awards_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `awards_deleted_by_fkey`)

---

### public.branches
- **RLS Enabled:** Enabled
- **Approx. Rows:** 0
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **course_id** | `uuid` | ❌ No | - | 🔗 FK ➔ `public.courses.id` |
| **name** | `text` | ❌ No | - | - |
| **code** | `text` | ❌ No | - | ✨ Unique |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | - |
| **updated_by** | `uuid` | ✅ Yes | - | - |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | - |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `course_id` references `public.courses.id` (via `branches_course_id_fkey`)

---

### public.cells
- **RLS Enabled:** Enabled
- **Approx. Rows:** 0
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **college_id** | `uuid` | ❌ No | - | 🔗 FK ➔ `public.colleges.id` |
| **name** | `text` | ❌ No | - | - |
| **slug** | `text` | ❌ No | - | - |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | - |
| **updated_by** | `uuid` | ✅ Yes | - | - |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | - |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `college_id` references `public.colleges.id` (via `cells_college_id_fkey`)

---

### public.centers
- **RLS Enabled:** Enabled
- **Approx. Rows:** 0
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **college_id** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.colleges.id` |
| **institute_id** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.institutes.id` |
| **name** | `text` | ❌ No | - | - |
| **slug** | `text` | ❌ No | - | - |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | - |
| **updated_by** | `uuid` | ✅ Yes | - | - |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | - |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `college_id` references `public.colleges.id` (via `centers_college_id_fkey`)
- `institute_id` references `public.institutes.id` (via `centers_institute_id_fkey`)

---

### public.colleges
- **RLS Enabled:** Enabled
- **Approx. Rows:** 4
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **institute_id** | `uuid` | ❌ No | - | 🔗 FK ➔ `public.institutes.id` |
| **name** | `text` | ❌ No | - | - |
| **slug** | `text` | ❌ No | - | ✨ Unique; Check: `slug ~* '^[a-z0-9]+(?:-[a-z0-9]+)*$'::text` |
| **code** | `text` | ❌ No | - | ✨ Unique; Check: `code ~* '^[A-Z0-9]+$'::text` |
| **logo_url** | `text` | ✅ Yes | - | - |
| **website_url** | `text` | ✅ Yes | - | - |
| **sort_order** | `integer (int4)` | ❌ No | `0` | - |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `institute_id` references `public.institutes.id` (via `colleges_institute_id_fkey`)
- `created_by` references `public.user_profiles.id` (via `colleges_created_by_fkey`)
- `college_id` references `public.colleges.id` (via `departments_college_id_fkey`)
- `college_id` references `public.colleges.id` (via `centers_college_id_fkey`)
- `college_id` references `public.colleges.id` (via `cells_college_id_fkey`)
- `college_id` references `public.colleges.id` (via `committees_college_id_fkey`)
- `updated_by` references `public.user_profiles.id` (via `colleges_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `colleges_deleted_by_fkey`)
- `college_id` references `public.colleges.id` (via `user_roles_college_id_fkey`)

---

### public.committees
- **RLS Enabled:** Enabled
- **Approx. Rows:** 0
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **college_id** | `uuid` | ❌ No | - | 🔗 FK ➔ `public.colleges.id` |
| **name** | `text` | ❌ No | - | - |
| **slug** | `text` | ❌ No | - | - |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | - |
| **updated_by** | `uuid` | ✅ Yes | - | - |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | - |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `college_id` references `public.colleges.id` (via `committees_college_id_fkey`)

---

### public.contact_info
- **RLS Enabled:** Enabled
- **Approx. Rows:** 0
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **address** | `text` | ✅ Yes | - | - |
| **phone** | `text` | ✅ Yes | - | - |
| **email** | `text` | ✅ Yes | - | - |
| **office_hours** | `jsonb` | ❌ No | `'{}'::jsonb` | - |
| **map_iframe_url** | `text` | ✅ Yes | - | - |
| **social_links** | `jsonb` | ❌ No | `'{}'::jsonb` | - |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `created_by` references `public.user_profiles.id` (via `contact_info_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `contact_info_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `contact_info_deleted_by_fkey`)

---

### public.content_categories
- **RLS Enabled:** Enabled
- **Approx. Rows:** 0
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **name** | `text` | ❌ No | - | - |
| **slug** | `text` | ❌ No | - | - |
| **module_type** | `text` | ❌ No | - | - |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `created_by` references `public.user_profiles.id` (via `content_categories_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `content_categories_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `content_categories_deleted_by_fkey`)
- `category_id` references `public.content_categories.id` (via `posts_category_id_fkey`)

---

### public.courses
- **RLS Enabled:** Enabled
- **Approx. Rows:** 2
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **department_id** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.departments.id` |
| **name** | `text` | ❌ No | - | - |
| **code** | `text` | ❌ No | - | ✨ Unique |
| **degree_level** | `USER-DEFINED (degree_level)` | ❌ No | - | Enums: `undergraduate`, `graduate`, `doctorate`, `certificate` |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | - |
| **updated_by** | `uuid` | ✅ Yes | - | - |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | - |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `department_id` references `public.departments.id` (via `courses_department_id_fkey`)
- `course_id` references `public.courses.id` (via `branches_course_id_fkey`)

---

### public.departments
- **RLS Enabled:** Enabled
- **Approx. Rows:** 3
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **college_id** | `uuid` | ❌ No | - | 🔗 FK ➔ `public.colleges.id` |
| **name** | `text` | ❌ No | - | - |
| **slug** | `text` | ❌ No | - | Check: `slug ~* '^[a-z0-9]+(?:-[a-z0-9]+)*$'::text` |
| **code** | `text` | ❌ No | - | - |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |
| **head_of_department_id** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.staff_profiles.id` |

**Foreign Key Constraints:**
- `college_id` references `public.colleges.id` (via `departments_college_id_fkey`)
- `department_id` references `public.departments.id` (via `facilities_department_id_fkey`)
- `department_id` references `public.departments.id` (via `courses_department_id_fkey`)
- `created_by` references `public.user_profiles.id` (via `departments_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `departments_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `departments_deleted_by_fkey`)
- `department_id` references `public.departments.id` (via `user_roles_department_id_fkey`)
- `department_id` references `public.departments.id` (via `homepage_sections_department_id_fkey`)
- `department_id` references `public.departments.id` (via `homepage_items_department_id_fkey`)
- `head_of_department_id` references `public.staff_profiles.id` (via `departments_head_of_department_id_fkey`)
- `department_id` references `public.departments.id` (via `staff_department_assignments_department_id_fkey`)
- `department_id` references `public.departments.id` (via `posts_department_id_fkey`)
- `department_id` references `public.departments.id` (via `events_department_id_fkey`)
- `department_id` references `public.departments.id` (via `achievements_department_id_fkey`)
- `department_id` references `public.departments.id` (via `gallery_albums_department_id_fkey`)
- `department_id` references `public.departments.id` (via `media_folders_department_id_fkey`)
- `department_id` references `public.departments.id` (via `media_files_department_id_fkey`)

---

### public.designations
- **RLS Enabled:** Enabled
- **Approx. Rows:** 2
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **title** | `text` | ❌ No | - | ✨ Unique |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `created_by` references `public.user_profiles.id` (via `designations_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `designations_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `designations_deleted_by_fkey`)
- `designation_id` references `public.designations.id` (via `staff_department_assignments_designation_id_fkey`)

---

### public.downloads
- **RLS Enabled:** Enabled
- **Approx. Rows:** 0
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **title** | `text` | ❌ No | - | - |
| **file_url** | `text` | ❌ No | - | - |
| **file_type** | `text` | ✅ Yes | - | - |
| **file_size** | `integer (int4)` | ✅ Yes | - | - |
| **category** | `text` | ❌ No | - | Check: `category = ANY (ARRAY['circular'::text, 'notice'::text, 'syllabus'::text, 'form'::text, 'other'::text])` |
| **publish_date** | `date` | ❌ No | `CURRENT_DATE` | - |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `created_by` references `public.user_profiles.id` (via `downloads_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `downloads_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `downloads_deleted_by_fkey`)

---

### public.events
- **RLS Enabled:** Enabled
- **Approx. Rows:** 2
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **scope_type** | `USER-DEFINED (scope_level)` | ❌ No | `'global'::scope_level` | Enums: `global`, `trust`, `institute`, `college`, `department` |
| **department_id** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.departments.id` |
| **title** | `text` | ❌ No | - | - |
| **slug** | `text` | ❌ No | - | - |
| **description** | `text` | ✅ Yes | - | - |
| **tag** | `text` | ✅ Yes | - | - |
| **start_date** | `timestamp with time zone (timestamptz)` | ❌ No | - | - |
| **end_date** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **location** | `text` | ✅ Yes | - | - |
| **map_url** | `text` | ✅ Yes | - | - |
| **registration_link** | `text` | ✅ Yes | - | - |
| **featured_image_url** | `text` | ✅ Yes | - | - |
| **sort_order** | `integer (int4)` | ❌ No | `0` | - |
| **seo_id** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.seo_metadata.id` |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (event_status)` | ❌ No | `'draft'::event_status` | Enums: `draft`, `published`, `cancelled` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `department_id` references `public.departments.id` (via `events_department_id_fkey`)
- `seo_id` references `public.seo_metadata.id` (via `events_seo_id_fkey`)
- `created_by` references `public.user_profiles.id` (via `events_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `events_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `events_deleted_by_fkey`)

---

### public.experiences
- **RLS Enabled:** Enabled
- **Approx. Rows:** 0
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **staff_id** | `uuid` | ❌ No | - | 🔗 FK ➔ `public.staff_profiles.id` |
| **organization** | `text` | ❌ No | - | - |
| **role** | `text` | ❌ No | - | - |
| **start_date** | `date` | ❌ No | - | - |
| **end_date** | `date` | ✅ Yes | - | - |
| **is_academic** | `boolean (bool)` | ❌ No | `true` | - |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `staff_id` references `public.staff_profiles.id` (via `experiences_staff_id_fkey`)
- `created_by` references `public.user_profiles.id` (via `experiences_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `experiences_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `experiences_deleted_by_fkey`)

---

### public.facilities
- **RLS Enabled:** Enabled
- **Approx. Rows:** 0
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **facility_type** | `USER-DEFINED (facility_type)` | ❌ No | - | Enums: `campus`, `building`, `laboratory` |
| **parent_id** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.facilities.id` |
| **institute_id** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.institutes.id` |
| **department_id** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.departments.id` |
| **name** | `text` | ❌ No | - | - |
| **slug** | `text` | ✅ Yes | - | ✨ Unique |
| **address** | `text` | ✅ Yes | - | - |
| **code** | `text` | ✅ Yes | - | - |
| **room_number** | `text` | ✅ Yes | - | - |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `parent_id` references `public.facilities.id` (via `facilities_parent_id_fkey`)
- `institute_id` references `public.institutes.id` (via `facilities_institute_id_fkey`)
- `department_id` references `public.departments.id` (via `facilities_department_id_fkey`)
- `created_by` references `public.user_profiles.id` (via `facilities_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `facilities_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `facilities_deleted_by_fkey`)

---

### public.gallery_albums
- **RLS Enabled:** Enabled
- **Approx. Rows:** 0
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **scope_type** | `USER-DEFINED (scope_level)` | ❌ No | `'global'::scope_level` | Enums: `global`, `trust`, `institute`, `college`, `department` |
| **department_id** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.departments.id` |
| **title** | `text` | ❌ No | - | - |
| **slug** | `text` | ❌ No | - | - |
| **description** | `text` | ✅ Yes | - | - |
| **cover_image_url** | `text` | ✅ Yes | - | - |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `department_id` references `public.departments.id` (via `gallery_albums_department_id_fkey`)
- `created_by` references `public.user_profiles.id` (via `gallery_albums_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `gallery_albums_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `gallery_albums_deleted_by_fkey`)
- `album_id` references `public.gallery_albums.id` (via `gallery_media_album_id_fkey`)

---

### public.gallery_media
- **RLS Enabled:** Enabled
- **Approx. Rows:** 0
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **album_id** | `uuid` | ❌ No | - | 🔗 FK ➔ `public.gallery_albums.id` |
| **media_type** | `text` | ❌ No | - | Check: `media_type = ANY (ARRAY['image'::text, 'video'::text])` |
| **url** | `text` | ❌ No | - | - |
| **caption** | `text` | ✅ Yes | - | - |
| **sort_order** | `integer (int4)` | ❌ No | `0` | - |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `album_id` references `public.gallery_albums.id` (via `gallery_media_album_id_fkey`)
- `created_by` references `public.user_profiles.id` (via `gallery_media_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `gallery_media_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `gallery_media_deleted_by_fkey`)

---

### public.homepage_items
- **RLS Enabled:** Enabled
- **Approx. Rows:** 20
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **scope_type** | `USER-DEFINED (scope_level)` | ❌ No | `'global'::scope_level` | Enums: `global`, `trust`, `institute`, `college`, `department` |
| **department_id** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.departments.id` |
| **item_type** | `text` | ❌ No | - | - |
| **eyebrow** | `text` | ✅ Yes | - | - |
| **title** | `text` | ❌ No | - | - |
| **title_accent** | `text` | ✅ Yes | - | - |
| **subtitle** | `text` | ✅ Yes | - | - |
| **body** | `text` | ✅ Yes | - | - |
| **image_url** | `text` | ✅ Yes | - | - |
| **icon_name** | `text` | ✅ Yes | - | - |
| **link_href** | `text` | ✅ Yes | - | - |
| **link_label** | `text` | ✅ Yes | - | - |
| **secondary_link_href** | `text` | ✅ Yes | - | - |
| **secondary_link_label** | `text` | ✅ Yes | - | - |
| **sort_order** | `integer (int4)` | ❌ No | `0` | - |
| **is_active** | `boolean (bool)` | ❌ No | `true` | - |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `department_id` references `public.departments.id` (via `homepage_items_department_id_fkey`)
- `created_by` references `public.user_profiles.id` (via `homepage_items_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `homepage_items_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `homepage_items_deleted_by_fkey`)

---

### public.homepage_sections
- **RLS Enabled:** Enabled
- **Approx. Rows:** 0
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **scope_type** | `USER-DEFINED (scope_level)` | ❌ No | `'global'::scope_level` | Enums: `global`, `trust`, `institute`, `college`, `department` |
| **department_id** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.departments.id` |
| **title** | `text` | ✅ Yes | - | - |
| **section_type** | `text` | ❌ No | - | - |
| **sort_order** | `integer (int4)` | ❌ No | `0` | - |
| **is_active** | `boolean (bool)` | ❌ No | `true` | - |
| **config** | `jsonb` | ❌ No | `'{}'::jsonb` | - |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `department_id` references `public.departments.id` (via `homepage_sections_department_id_fkey`)
- `created_by` references `public.user_profiles.id` (via `homepage_sections_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `homepage_sections_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `homepage_sections_deleted_by_fkey`)
- `section_id` references `public.homepage_sections.id` (via `homepage_widgets_section_id_fkey`)

---

### public.homepage_widgets
- **RLS Enabled:** Enabled
- **Approx. Rows:** 0
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **section_id** | `uuid` | ❌ No | - | 🔗 FK ➔ `public.homepage_sections.id` |
| **title** | `text` | ✅ Yes | - | - |
| **widget_type** | `text` | ❌ No | - | - |
| **config** | `jsonb` | ❌ No | `'{}'::jsonb` | - |
| **sort_order** | `integer (int4)` | ❌ No | `0` | - |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `section_id` references `public.homepage_sections.id` (via `homepage_widgets_section_id_fkey`)
- `created_by` references `public.user_profiles.id` (via `homepage_widgets_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `homepage_widgets_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `homepage_widgets_deleted_by_fkey`)

---

### public.inquiry_forms
- **RLS Enabled:** Enabled
- **Approx. Rows:** 0
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **form_name** | `text` | ❌ No | - | ✨ Unique |
| **fields_config** | `jsonb` | ❌ No | `'[]'::jsonb` | - |
| **recipient_emails** | `ARRAY (_text)` | ❌ No | `'{}'::text[]` | - |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `created_by` references `public.user_profiles.id` (via `inquiry_forms_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `inquiry_forms_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `inquiry_forms_deleted_by_fkey`)
- `form_id` references `public.inquiry_forms.id` (via `inquiry_submissions_form_id_fkey`)

---

### public.inquiry_submissions
- **RLS Enabled:** Enabled
- **Approx. Rows:** 0
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **form_id** | `uuid` | ❌ No | - | 🔗 FK ➔ `public.inquiry_forms.id` |
| **submitted_data** | `jsonb` | ❌ No | - | - |
| **status** | `USER-DEFINED (submission_status)` | ❌ No | `'unread'::submission_status` | Enums: `unread`, `read`, `replied` |
| **notes** | `text` | ✅ Yes | - | - |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `form_id` references `public.inquiry_forms.id` (via `inquiry_submissions_form_id_fkey`)
- `created_by` references `public.user_profiles.id` (via `inquiry_submissions_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `inquiry_submissions_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `inquiry_submissions_deleted_by_fkey`)

---

### public.institutes
- **RLS Enabled:** Enabled
- **Approx. Rows:** 1
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **trust_id** | `uuid` | ❌ No | - | 🔗 FK ➔ `public.trusts.id` |
| **name** | `text` | ❌ No | - | - |
| **slug** | `text` | ❌ No | - | ✨ Unique; Check: `slug ~* '^[a-z0-9]+(?:-[a-z0-9]+)*$'::text` |
| **logo_url** | `text` | ✅ Yes | - | - |
| **website_url** | `text` | ✅ Yes | - | - |
| **sort_order** | `integer (int4)` | ❌ No | `0` | - |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `trust_id` references `public.trusts.id` (via `institutes_trust_id_fkey`)
- `institute_id` references `public.institutes.id` (via `colleges_institute_id_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `institutes_deleted_by_fkey`)
- `institute_id` references `public.institutes.id` (via `facilities_institute_id_fkey`)
- `institute_id` references `public.institutes.id` (via `centers_institute_id_fkey`)
- `created_by` references `public.user_profiles.id` (via `institutes_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `institutes_updated_by_fkey`)
- `institute_id` references `public.institutes.id` (via `user_roles_institute_id_fkey`)

---

### public.media_files
- **RLS Enabled:** Enabled
- **Approx. Rows:** 0
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **scope_type** | `USER-DEFINED (scope_level)` | ❌ No | `'global'::scope_level` | Enums: `global`, `trust`, `institute`, `college`, `department` |
| **department_id** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.departments.id` |
| **folder_id** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.media_folders.id` |
| **filename** | `text` | ❌ No | - | - |
| **file_path** | `text` | ❌ No | - | ✨ Unique |
| **mime_type** | `text` | ❌ No | - | - |
| **file_size** | `integer (int4)` | ❌ No | - | - |
| **alt_text** | `text` | ✅ Yes | - | - |
| **caption** | `text` | ✅ Yes | - | - |
| **tags** | `ARRAY (_text)` | ❌ No | `'{}'::text[]` | - |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `department_id` references `public.departments.id` (via `media_files_department_id_fkey`)
- `folder_id` references `public.media_folders.id` (via `media_files_folder_id_fkey`)
- `created_by` references `public.user_profiles.id` (via `media_files_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `media_files_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `media_files_deleted_by_fkey`)

---

### public.media_folders
- **RLS Enabled:** Enabled
- **Approx. Rows:** 0
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **scope_type** | `USER-DEFINED (scope_level)` | ❌ No | `'global'::scope_level` | Enums: `global`, `trust`, `institute`, `college`, `department` |
| **department_id** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.departments.id` |
| **name** | `text` | ❌ No | - | - |
| **parent_id** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.media_folders.id` |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `department_id` references `public.departments.id` (via `media_folders_department_id_fkey`)
- `parent_id` references `public.media_folders.id` (via `media_folders_parent_id_fkey`)
- `created_by` references `public.user_profiles.id` (via `media_folders_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `media_folders_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `media_folders_deleted_by_fkey`)
- `folder_id` references `public.media_folders.id` (via `media_files_folder_id_fkey`)

---

### public.menu_items
- **RLS Enabled:** Enabled
- **Approx. Rows:** 10
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **menu_id** | `uuid` | ❌ No | - | 🔗 FK ➔ `public.menus.id` |
| **parent_id** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.menu_items.id` |
| **title** | `text` | ❌ No | - | - |
| **link_type** | `USER-DEFINED (link_type)` | ❌ No | - | Enums: `internal`, `external` |
| **url** | `text` | ✅ Yes | - | - |
| **page_id** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.pages.id` |
| **icon** | `text` | ✅ Yes | - | - |
| **sort_order** | `integer (int4)` | ❌ No | `0` | - |
| **permissions_required** | `ARRAY (_text)` | ❌ No | `'{}'::text[]` | - |
| **visibility_rules** | `jsonb` | ❌ No | `'{}'::jsonb` | - |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `menu_id` references `public.menus.id` (via `menu_items_menu_id_fkey`)
- `parent_id` references `public.menu_items.id` (via `menu_items_parent_id_fkey`)
- `page_id` references `public.pages.id` (via `menu_items_page_id_fkey`)
- `created_by` references `public.user_profiles.id` (via `menu_items_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `menu_items_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `menu_items_deleted_by_fkey`)

---

### public.menus
- **RLS Enabled:** Enabled
- **Approx. Rows:** 2
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **name** | `text` | ❌ No | - | - |
| **code** | `text` | ❌ No | - | ✨ Unique |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `created_by` references `public.user_profiles.id` (via `menus_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `menus_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `menus_deleted_by_fkey`)
- `menu_id` references `public.menus.id` (via `menu_items_menu_id_fkey`)

---

### public.mous
- **RLS Enabled:** Enabled
- **Approx. Rows:** 0
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **partner_organization** | `text` | ❌ No | - | - |
| **logo_url** | `text` | ✅ Yes | - | - |
| **purpose** | `text` | ✅ Yes | - | - |
| **signed_date** | `date` | ❌ No | - | - |
| **expiry_date** | `date` | ✅ Yes | - | - |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `created_by` references `public.user_profiles.id` (via `mous_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `mous_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `mous_deleted_by_fkey`)

---

### public.pages
- **RLS Enabled:** Enabled
- **Approx. Rows:** 0
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **title** | `text` | ❌ No | - | - |
| **slug** | `text` | ❌ No | - | ✨ Unique; Check: `slug ~* '^[a-z0-9]+(?:-[a-z0-9]+)*$'::text` |
| **content** | `text` | ✅ Yes | - | - |
| **parent_id** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.pages.id` |
| **is_homepage** | `boolean (bool)` | ❌ No | `false` | - |
| **seo_id** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.seo_metadata.id` |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'draft'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `parent_id` references `public.pages.id` (via `pages_parent_id_fkey`)
- `seo_id` references `public.seo_metadata.id` (via `pages_seo_id_fkey`)
- `created_by` references `public.user_profiles.id` (via `pages_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `pages_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `pages_deleted_by_fkey`)
- `page_id` references `public.pages.id` (via `menu_items_page_id_fkey`)

---

### public.patents
- **RLS Enabled:** Enabled
- **Approx. Rows:** 0
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **staff_id** | `uuid` | ❌ No | - | 🔗 FK ➔ `public.staff_profiles.id` |
| **title** | `text` | ❌ No | - | - |
| **patent_number** | `text` | ✅ Yes | - | - |
| **patent_status** | `text` | ❌ No | - | Check: `patent_status = ANY (ARRAY['filed'::text, 'published'::text, 'granted'::text])` |
| **publication_date** | `date` | ✅ Yes | - | - |
| **inventors** | `ARRAY (_text)` | ❌ No | - | - |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `staff_id` references `public.staff_profiles.id` (via `patents_staff_id_fkey`)
- `created_by` references `public.user_profiles.id` (via `patents_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `patents_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `patents_deleted_by_fkey`)

---

### public.permissions
- **RLS Enabled:** Enabled
- **Approx. Rows:** 0
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **name** | `text` | ❌ No | - | ✨ Unique |
| **code** | `text` | ❌ No | - | ✨ Unique |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `created_by` references `public.user_profiles.id` (via `permissions_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `permissions_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `permissions_deleted_by_fkey`)
- `permission_id` references `public.permissions.id` (via `role_permissions_permission_id_fkey`)

---

### public.placement_statistics
- **RLS Enabled:** Enabled
- **Approx. Rows:** 0
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **academic_year** | `text` | ❌ No | - | ✨ Unique |
| **total_students** | `integer (int4)` | ❌ No | - | - |
| **placed_students** | `integer (int4)` | ❌ No | - | - |
| **highest_package** | `numeric` | ✅ Yes | - | - |
| **average_package** | `numeric` | ✅ Yes | - | - |
| **recruiters_count** | `integer (int4)` | ✅ Yes | - | - |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `created_by` references `public.user_profiles.id` (via `placement_statistics_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `placement_statistics_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `placement_statistics_deleted_by_fkey`)

---

### public.posts
- **RLS Enabled:** Enabled
- **Approx. Rows:** 0
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **scope_type** | `USER-DEFINED (scope_level)` | ❌ No | `'global'::scope_level` | Enums: `global`, `trust`, `institute`, `college`, `department` |
| **department_id** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.departments.id` |
| **title** | `text` | ❌ No | - | - |
| **slug** | `text` | ❌ No | - | - |
| **summary** | `text` | ✅ Yes | - | - |
| **content** | `text` | ✅ Yes | - | - |
| **featured_image_url** | `text` | ✅ Yes | - | - |
| **category_id** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.content_categories.id` |
| **is_featured** | `boolean (bool)` | ❌ No | `false` | - |
| **published_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **expires_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **seo_id** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.seo_metadata.id` |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'draft'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `department_id` references `public.departments.id` (via `posts_department_id_fkey`)
- `category_id` references `public.content_categories.id` (via `posts_category_id_fkey`)
- `seo_id` references `public.seo_metadata.id` (via `posts_seo_id_fkey`)
- `created_by` references `public.user_profiles.id` (via `posts_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `posts_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `posts_deleted_by_fkey`)

---

### public.publications
- **RLS Enabled:** Enabled
- **Approx. Rows:** 0
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **title** | `text` | ❌ No | - | - |
| **journal_conference** | `text` | ❌ No | - | - |
| **publish_date** | `date` | ❌ No | - | - |
| **doi_url** | `text` | ✅ Yes | - | - |
| **abstract** | `text` | ✅ Yes | - | - |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `created_by` references `public.user_profiles.id` (via `publications_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `publications_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `publications_deleted_by_fkey`)
- `publication_id` references `public.publications.id` (via `staff_publications_publication_id_fkey`)

---

### public.qualifications
- **RLS Enabled:** Enabled
- **Approx. Rows:** 0
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **staff_id** | `uuid` | ❌ No | - | 🔗 FK ➔ `public.staff_profiles.id` |
| **degree** | `text` | ❌ No | - | - |
| **institution** | `text` | ❌ No | - | - |
| **year** | `integer (int4)` | ❌ No | - | - |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `staff_id` references `public.staff_profiles.id` (via `qualifications_staff_id_fkey`)
- `created_by` references `public.user_profiles.id` (via `qualifications_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `qualifications_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `qualifications_deleted_by_fkey`)

---

### public.recruiters
- **RLS Enabled:** Enabled
- **Approx. Rows:** 30
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **company_name** | `text` | ❌ No | - | - |
| **logo_url** | `text` | ❌ No | - | - |
| **website_url** | `text` | ✅ Yes | - | - |
| **sort_order** | `integer (int4)` | ❌ No | `0` | - |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `created_by` references `public.user_profiles.id` (via `recruiters_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `recruiters_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `recruiters_deleted_by_fkey`)

---

### public.redirects
- **RLS Enabled:** Enabled
- **Approx. Rows:** 0
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **source_path** | `text` | ❌ No | - | ✨ Unique |
| **target_path** | `text` | ❌ No | - | - |
| **status_code** | `integer (int4)` | ❌ No | `301` | Check: `status_code = ANY (ARRAY[301, 302, 307, 308])` |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `created_by` references `public.user_profiles.id` (via `redirects_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `redirects_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `redirects_deleted_by_fkey`)

---

### public.research_interests
- **RLS Enabled:** Enabled
- **Approx. Rows:** 0
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **staff_id** | `uuid` | ❌ No | - | 🔗 FK ➔ `public.staff_profiles.id` |
| **interest_name** | `text` | ❌ No | - | - |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `staff_id` references `public.staff_profiles.id` (via `research_interests_staff_id_fkey`)
- `created_by` references `public.user_profiles.id` (via `research_interests_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `research_interests_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `research_interests_deleted_by_fkey`)

---

### public.research_projects
- **RLS Enabled:** Enabled
- **Approx. Rows:** 0
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **title** | `text` | ❌ No | - | - |
| **funding_agency** | `text` | ✅ Yes | - | - |
| **amount** | `numeric` | ✅ Yes | - | - |
| **duration_years** | `numeric` | ✅ Yes | - | - |
| **project_status** | `text` | ❌ No | - | Check: `project_status = ANY (ARRAY['ongoing'::text, 'completed'::text])` |
| **principal_investigator_id** | `uuid` | ❌ No | - | 🔗 FK ➔ `public.staff_profiles.id` |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `principal_investigator_id` references `public.staff_profiles.id` (via `research_projects_principal_investigator_id_fkey`)
- `created_by` references `public.user_profiles.id` (via `research_projects_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `research_projects_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `research_projects_deleted_by_fkey`)

---

### public.role_permissions
- **RLS Enabled:** Enabled
- **Approx. Rows:** 0
- **Primary Key(s):** `role_id, permission_id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **role_id** | `uuid` | ❌ No | - | 🔑 PK; 🔗 FK ➔ `public.roles.id` |
| **permission_id** | `uuid` | ❌ No | - | 🔑 PK; 🔗 FK ➔ `public.permissions.id` |

**Foreign Key Constraints:**
- `role_id` references `public.roles.id` (via `role_permissions_role_id_fkey`)
- `permission_id` references `public.permissions.id` (via `role_permissions_permission_id_fkey`)

---

### public.roles
- **RLS Enabled:** Enabled
- **Approx. Rows:** 0
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **name** | `text` | ❌ No | - | ✨ Unique |
| **code** | `text` | ❌ No | - | ✨ Unique |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `created_by` references `public.user_profiles.id` (via `roles_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `roles_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `roles_deleted_by_fkey`)
- `role_id` references `public.roles.id` (via `role_permissions_role_id_fkey`)
- `role_id` references `public.roles.id` (via `user_roles_role_id_fkey`)

---

### public.seo_metadata
- **RLS Enabled:** Enabled
- **Approx. Rows:** 0
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **meta_title** | `text` | ✅ Yes | - | - |
| **meta_description** | `text` | ✅ Yes | - | - |
| **meta_keywords** | `ARRAY (_text)` | ❌ No | `'{}'::text[]` | - |
| **canonical_url** | `text` | ✅ Yes | - | - |
| **og_title** | `text` | ✅ Yes | - | - |
| **og_description** | `text` | ✅ Yes | - | - |
| **og_image_url** | `text` | ✅ Yes | - | - |
| **twitter_card** | `text` | ✅ Yes | - | - |
| **structured_data** | `jsonb` | ❌ No | `'{}'::jsonb` | - |
| **robots_directives** | `text` | ✅ Yes | - | - |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `created_by` references `public.user_profiles.id` (via `seo_metadata_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `seo_metadata_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `seo_metadata_deleted_by_fkey`)
- `seo_id` references `public.seo_metadata.id` (via `pages_seo_id_fkey`)
- `seo_id` references `public.seo_metadata.id` (via `posts_seo_id_fkey`)
- `seo_id` references `public.seo_metadata.id` (via `events_seo_id_fkey`)

---

### public.staff_department_assignments
- **RLS Enabled:** Enabled
- **Approx. Rows:** 0
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **staff_id** | `uuid` | ❌ No | - | 🔗 FK ➔ `public.staff_profiles.id` |
| **department_id** | `uuid` | ❌ No | - | 🔗 FK ➔ `public.departments.id` |
| **designation_id** | `uuid` | ❌ No | - | 🔗 FK ➔ `public.designations.id` |
| **is_primary** | `boolean (bool)` | ❌ No | `false` | - |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `staff_id` references `public.staff_profiles.id` (via `staff_department_assignments_staff_id_fkey`)
- `department_id` references `public.departments.id` (via `staff_department_assignments_department_id_fkey`)
- `designation_id` references `public.designations.id` (via `staff_department_assignments_designation_id_fkey`)
- `created_by` references `public.user_profiles.id` (via `staff_department_assignments_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `staff_department_assignments_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `staff_department_assignments_deleted_by_fkey`)

---

### public.staff_profiles
- **RLS Enabled:** Enabled
- **Approx. Rows:** 1
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **user_id** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **title** | `text` | ✅ Yes | - | - |
| **first_name** | `text` | ❌ No | - | - |
| **last_name** | `text` | ❌ No | - | - |
| **email** | `text` | ❌ No | - | ✨ Unique |
| **phone** | `text` | ✅ Yes | - | - |
| **avatar_url** | `text` | ✅ Yes | - | - |
| **bio** | `text` | ✅ Yes | - | - |
| **office_hours** | `jsonb` | ❌ No | `'{}'::jsonb` | - |
| **social_links** | `jsonb` | ❌ No | `'{}'::jsonb` | - |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `user_id` references `public.user_profiles.id` (via `staff_profiles_user_id_fkey`)
- `created_by` references `public.user_profiles.id` (via `staff_profiles_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `staff_profiles_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `staff_profiles_deleted_by_fkey`)
- `head_of_department_id` references `public.staff_profiles.id` (via `departments_head_of_department_id_fkey`)
- `staff_id` references `public.staff_profiles.id` (via `staff_department_assignments_staff_id_fkey`)
- `staff_id` references `public.staff_profiles.id` (via `qualifications_staff_id_fkey`)
- `staff_id` references `public.staff_profiles.id` (via `experiences_staff_id_fkey`)
- `staff_id` references `public.staff_profiles.id` (via `research_interests_staff_id_fkey`)
- `staff_id` references `public.staff_profiles.id` (via `staff_publications_staff_id_fkey`)
- `staff_id` references `public.staff_profiles.id` (via `awards_staff_id_fkey`)
- `principal_investigator_id` references `public.staff_profiles.id` (via `research_projects_principal_investigator_id_fkey`)
- `staff_id` references `public.staff_profiles.id` (via `patents_staff_id_fkey`)
- `coordinator_id` references `public.staff_profiles.id` (via `student_clubs_coordinator_id_fkey`)

---

### public.staff_publications
- **RLS Enabled:** Enabled
- **Approx. Rows:** 0
- **Primary Key(s):** `staff_id, publication_id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **staff_id** | `uuid` | ❌ No | - | 🔑 PK; 🔗 FK ➔ `public.staff_profiles.id` |
| **publication_id** | `uuid` | ❌ No | - | 🔑 PK; 🔗 FK ➔ `public.publications.id` |

**Foreign Key Constraints:**
- `staff_id` references `public.staff_profiles.id` (via `staff_publications_staff_id_fkey`)
- `publication_id` references `public.publications.id` (via `staff_publications_publication_id_fkey`)

---

### public.student_clubs
- **RLS Enabled:** Enabled
- **Approx. Rows:** 0
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **name** | `text` | ❌ No | - | - |
| **slug** | `text` | ❌ No | - | ✨ Unique |
| **description** | `text` | ✅ Yes | - | - |
| **logo_url** | `text` | ✅ Yes | - | - |
| **coordinator_id** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.staff_profiles.id` |
| **student_coordinator_name** | `text` | ✅ Yes | - | - |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `coordinator_id` references `public.staff_profiles.id` (via `student_clubs_coordinator_id_fkey`)
- `created_by` references `public.user_profiles.id` (via `student_clubs_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `student_clubs_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `student_clubs_deleted_by_fkey`)

---

### public.testimonials
- **RLS Enabled:** Enabled
- **Approx. Rows:** 0
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **author_name** | `text` | ❌ No | - | - |
| **author_role** | `text` | ❌ No | - | - |
| **company_or_institution** | `text` | ✅ Yes | - | - |
| **quote** | `text` | ❌ No | - | - |
| **avatar_url** | `text` | ✅ Yes | - | - |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `created_by` references `public.user_profiles.id` (via `testimonials_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `testimonials_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `testimonials_deleted_by_fkey`)

---

### public.trusts
- **RLS Enabled:** Enabled
- **Approx. Rows:** 1
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **name** | `text` | ❌ No | - | - |
| **slug** | `text` | ❌ No | - | ✨ Unique; Check: `slug ~* '^[a-z0-9]+(?:-[a-z0-9]+)*$'::text` |
| **logo_url** | `text` | ✅ Yes | - | - |
| **website_url** | `text` | ✅ Yes | - | - |
| **sort_order** | `integer (int4)` | ❌ No | `0` | - |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `trust_id` references `public.trusts.id` (via `institutes_trust_id_fkey`)
- `created_by` references `public.user_profiles.id` (via `trusts_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `trusts_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `trusts_deleted_by_fkey`)
- `trust_id` references `public.trusts.id` (via `user_roles_trust_id_fkey`)

---

### public.user_profiles
- **RLS Enabled:** Enabled
- **Approx. Rows:** 0
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | - | 🔑 PK; 🔗 FK ➔ `auth.users.id` |
| **first_name** | `text` | ✅ Yes | - | - |
| **last_name** | `text` | ✅ Yes | - | - |
| **avatar_url** | `text` | ✅ Yes | - | - |
| **bio** | `text` | ✅ Yes | - | - |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `deleted_by` references `public.user_profiles.id` (via `institutes_deleted_by_fkey`)
- `created_by` references `public.user_profiles.id` (via `colleges_created_by_fkey`)
- `id` references `auth.users.id` (via `user_profiles_id_fkey`)
- `created_by` references `public.user_profiles.id` (via `trusts_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `trusts_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `trusts_deleted_by_fkey`)
- `created_by` references `public.user_profiles.id` (via `institutes_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `institutes_updated_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `colleges_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `colleges_deleted_by_fkey`)
- `created_by` references `public.user_profiles.id` (via `departments_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `departments_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `departments_deleted_by_fkey`)
- `created_by` references `public.user_profiles.id` (via `facilities_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `facilities_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `facilities_deleted_by_fkey`)
- `created_by` references `public.user_profiles.id` (via `roles_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `roles_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `roles_deleted_by_fkey`)
- `created_by` references `public.user_profiles.id` (via `permissions_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `permissions_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `permissions_deleted_by_fkey`)
- `user_id` references `public.user_profiles.id` (via `user_roles_user_id_fkey`)
- `created_by` references `public.user_profiles.id` (via `user_roles_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `user_roles_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `user_roles_deleted_by_fkey`)
- `created_by` references `public.user_profiles.id` (via `seo_metadata_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `seo_metadata_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `seo_metadata_deleted_by_fkey`)
- `created_by` references `public.user_profiles.id` (via `pages_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `pages_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `pages_deleted_by_fkey`)
- `created_by` references `public.user_profiles.id` (via `menus_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `menus_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `menus_deleted_by_fkey`)
- `created_by` references `public.user_profiles.id` (via `menu_items_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `menu_items_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `menu_items_deleted_by_fkey`)
- `created_by` references `public.user_profiles.id` (via `redirects_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `redirects_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `redirects_deleted_by_fkey`)
- `created_by` references `public.user_profiles.id` (via `homepage_sections_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `homepage_sections_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `homepage_sections_deleted_by_fkey`)
- `created_by` references `public.user_profiles.id` (via `homepage_widgets_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `homepage_widgets_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `homepage_widgets_deleted_by_fkey`)
- `created_by` references `public.user_profiles.id` (via `homepage_items_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `homepage_items_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `homepage_items_deleted_by_fkey`)
- `created_by` references `public.user_profiles.id` (via `designations_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `designations_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `designations_deleted_by_fkey`)
- `user_id` references `public.user_profiles.id` (via `staff_profiles_user_id_fkey`)
- `created_by` references `public.user_profiles.id` (via `staff_profiles_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `staff_profiles_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `staff_profiles_deleted_by_fkey`)
- `created_by` references `public.user_profiles.id` (via `staff_department_assignments_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `staff_department_assignments_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `staff_department_assignments_deleted_by_fkey`)
- `created_by` references `public.user_profiles.id` (via `qualifications_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `qualifications_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `qualifications_deleted_by_fkey`)
- `created_by` references `public.user_profiles.id` (via `experiences_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `experiences_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `experiences_deleted_by_fkey`)
- `created_by` references `public.user_profiles.id` (via `research_interests_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `research_interests_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `research_interests_deleted_by_fkey`)
- `created_by` references `public.user_profiles.id` (via `publications_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `publications_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `publications_deleted_by_fkey`)
- `created_by` references `public.user_profiles.id` (via `awards_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `awards_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `awards_deleted_by_fkey`)
- `created_by` references `public.user_profiles.id` (via `content_categories_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `content_categories_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `content_categories_deleted_by_fkey`)
- `created_by` references `public.user_profiles.id` (via `posts_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `posts_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `posts_deleted_by_fkey`)
- `created_by` references `public.user_profiles.id` (via `events_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `events_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `events_deleted_by_fkey`)
- `created_by` references `public.user_profiles.id` (via `achievements_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `achievements_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `achievements_deleted_by_fkey`)
- `created_by` references `public.user_profiles.id` (via `recruiters_created_by_fkey`)
- `created_by` references `public.user_profiles.id` (via `gallery_albums_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `gallery_albums_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `gallery_albums_deleted_by_fkey`)
- `created_by` references `public.user_profiles.id` (via `gallery_media_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `gallery_media_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `gallery_media_deleted_by_fkey`)
- `created_by` references `public.user_profiles.id` (via `testimonials_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `testimonials_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `testimonials_deleted_by_fkey`)
- `created_by` references `public.user_profiles.id` (via `downloads_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `downloads_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `downloads_deleted_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `recruiters_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `recruiters_deleted_by_fkey`)
- `created_by` references `public.user_profiles.id` (via `placement_statistics_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `placement_statistics_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `placement_statistics_deleted_by_fkey`)
- `created_by` references `public.user_profiles.id` (via `research_projects_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `research_projects_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `research_projects_deleted_by_fkey`)
- `created_by` references `public.user_profiles.id` (via `patents_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `patents_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `patents_deleted_by_fkey`)
- `created_by` references `public.user_profiles.id` (via `mous_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `mous_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `mous_deleted_by_fkey`)
- `created_by` references `public.user_profiles.id` (via `accreditations_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `accreditations_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `accreditations_deleted_by_fkey`)
- `created_by` references `public.user_profiles.id` (via `student_clubs_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `student_clubs_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `student_clubs_deleted_by_fkey`)
- `created_by` references `public.user_profiles.id` (via `media_folders_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `media_folders_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `media_folders_deleted_by_fkey`)
- `created_by` references `public.user_profiles.id` (via `media_files_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `media_files_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `media_files_deleted_by_fkey`)
- `created_by` references `public.user_profiles.id` (via `contact_info_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `contact_info_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `contact_info_deleted_by_fkey`)
- `created_by` references `public.user_profiles.id` (via `inquiry_forms_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `inquiry_forms_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `inquiry_forms_deleted_by_fkey`)
- `created_by` references `public.user_profiles.id` (via `inquiry_submissions_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `inquiry_submissions_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `inquiry_submissions_deleted_by_fkey`)
- `user_id` references `public.user_profiles.id` (via `audit_logs_user_id_fkey`)

---

### public.user_roles
- **RLS Enabled:** Enabled
- **Approx. Rows:** 0
- **Primary Key(s):** `id`

| Column | Type | Nullable | Default | Constraints / Info |
| :--- | :--- | :---: | :--- | :--- |
| **id** | `uuid` | ❌ No | `gen_random_uuid()` | 🔑 PK |
| **user_id** | `uuid` | ❌ No | - | 🔗 FK ➔ `public.user_profiles.id` |
| **role_id** | `uuid` | ❌ No | - | 🔗 FK ➔ `public.roles.id` |
| **scope_type** | `USER-DEFINED (scope_level)` | ❌ No | - | Enums: `global`, `trust`, `institute`, `college`, `department` |
| **trust_id** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.trusts.id` |
| **institute_id** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.institutes.id` |
| **college_id** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.colleges.id` |
| **department_id** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.departments.id` |
| **created_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **updated_at** | `timestamp with time zone (timestamptz)` | ❌ No | `timezone('utc'::text, now())` | - |
| **created_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **updated_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **deleted_at** | `timestamp with time zone (timestamptz)` | ✅ Yes | - | - |
| **deleted_by** | `uuid` | ✅ Yes | - | 🔗 FK ➔ `public.user_profiles.id` |
| **status** | `USER-DEFINED (content_status)` | ❌ No | `'published'::content_status` | Enums: `draft`, `published`, `archived` |
| **metadata** | `jsonb` | ❌ No | `'{}'::jsonb` | - |

**Foreign Key Constraints:**
- `user_id` references `public.user_profiles.id` (via `user_roles_user_id_fkey`)
- `role_id` references `public.roles.id` (via `user_roles_role_id_fkey`)
- `trust_id` references `public.trusts.id` (via `user_roles_trust_id_fkey`)
- `institute_id` references `public.institutes.id` (via `user_roles_institute_id_fkey`)
- `college_id` references `public.colleges.id` (via `user_roles_college_id_fkey`)
- `department_id` references `public.departments.id` (via `user_roles_department_id_fkey`)
- `created_by` references `public.user_profiles.id` (via `user_roles_created_by_fkey`)
- `updated_by` references `public.user_profiles.id` (via `user_roles_updated_by_fkey`)
- `deleted_by` references `public.user_profiles.id` (via `user_roles_deleted_by_fkey`)

---
