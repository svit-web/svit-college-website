# SVIT College Website — Supabase Database Schema

> Generated from Supabase project — 52 tables

---

## Custom ENUMs

```sql
CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE degree_level   AS ENUM ('undergraduate', 'graduate', 'doctorate', 'certificate');
CREATE TYPE event_status   AS ENUM ('draft', 'published', 'cancelled');
CREATE TYPE facility_type  AS ENUM ('campus', 'building', 'laboratory');
CREATE TYPE link_type      AS ENUM ('internal', 'external');
CREATE TYPE scope_level    AS ENUM ('global', 'trust', 'institute', 'college', 'department');
CREATE TYPE staff_type     AS ENUM ('faculty', 'office_staff');
CREATE TYPE submission_status AS ENUM ('unread', 'read', 'replied');
```

---

## 1. Hierarchy Tables

### `trusts`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `name` | `text` | NOT NULL |
| `slug` | `text` | NOT NULL, UNIQUE |
| `logo_url` | `text` | |
| `website_url` | `text` | |
| `sort_order` | `integer` | default `0` |
| `created_at` | `timestamptz` | default `now()` |
| `updated_at` | `timestamptz` | default `now()` |
| `created_by` | `uuid` | FK → `user_profiles.id` |
| `updated_by` | `uuid` | FK → `user_profiles.id` |
| `deleted_at` | `timestamptz` | |
| `deleted_by` | `uuid` | FK → `user_profiles.id` |
| `status` | `content_status` | default `'published'` |
| `metadata` | `jsonb` | default `'{}'` |

Checks: `slug ~* '^[a-z0-9]+(?:-[a-z0-9]+)*$'`

---

### `institutes`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `trust_id` | `uuid` | NOT NULL, FK → `trusts.id` |
| `name` | `text` | NOT NULL |
| `slug` | `text` | NOT NULL, UNIQUE |
| `logo_url` | `text` | |
| `website_url` | `text` | |
| `sort_order` | `integer` | default `0` |
| `created_at` | `timestamptz` | default `now()` |
| `updated_at` | `timestamptz` | default `now()` |
| `created_by` | `uuid` | FK → `user_profiles.id` |
| `updated_by` | `uuid` | FK → `user_profiles.id` |
| `deleted_at` | `timestamptz` | |
| `deleted_by` | `uuid` | FK → `user_profiles.id` |
| `status` | `content_status` | default `'published'` |
| `metadata` | `jsonb` | default `'{}'` |

Checks: `slug ~* '^[a-z0-9]+(?:-[a-z0-9]+)*$'`

---

### `colleges`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `institute_id` | `uuid` | NOT NULL, FK → `institutes.id` |
| `name` | `text` | NOT NULL |
| `slug` | `text` | NOT NULL, UNIQUE |
| `code` | `text` | NOT NULL, UNIQUE |
| `logo_url` | `text` | |
| `website_url` | `text` | |
| `sort_order` | `integer` | default `0` |
| `created_at` | `timestamptz` | default `now()` |
| `updated_at` | `timestamptz` | default `now()` |
| `created_by` | `uuid` | FK → `user_profiles.id` |
| `updated_by` | `uuid` | FK → `user_profiles.id` |
| `deleted_at` | `timestamptz` | |
| `deleted_by` | `uuid` | FK → `user_profiles.id` |
| `status` | `content_status` | default `'published'` |
| `metadata` | `jsonb` | default `'{}'` |

Checks: `code ~* '^[A-Z0-9]+$'`, `slug ~* '^[a-z0-9]+(?:-[a-z0-9]+)*$'`

---

### `departments`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `college_id` | `uuid` | NOT NULL, FK → `colleges.id` |
| `name` | `text` | NOT NULL |
| `slug` | `text` | NOT NULL |
| `code` | `text` | NOT NULL |
| `head_of_department_id` | `uuid` | FK → `staff_profiles.id` |
| `created_at` | `timestamptz` | default `now()` |
| `updated_at` | `timestamptz` | default `now()` |
| `created_by` | `uuid` | FK → `user_profiles.id` |
| `updated_by` | `uuid` | FK → `user_profiles.id` |
| `deleted_at` | `timestamptz` | |
| `deleted_by` | `uuid` | FK → `user_profiles.id` |
| `status` | `content_status` | default `'published'` |
| `metadata` | `jsonb` | default `'{}'` |

Unique: `(college_id, code)`, `(college_id, slug)`; Checks: `slug ~* '^[a-z0-9]+(?:-[a-z0-9]+)*$'`

---

## 2. Academic Structure

### `courses`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `department_id` | `uuid` | FK → `departments.id` |
| `name` | `text` | NOT NULL |
| `code` | `text` | NOT NULL, UNIQUE |
| `degree_level` | `degree_level` | NOT NULL |
| `created_at` / `updated_at` | `timestamptz` | defaults |
| `created_by` / `updated_by` | `uuid` | FK → `user_profiles.id` |
| `deleted_at` / `deleted_by` | `timestamptz` / `uuid` | |
| `status` | `content_status` | default `'published'` |
| `metadata` | `jsonb` | default `'{}'` |

---

### `branches`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `course_id` | `uuid` | NOT NULL, FK → `courses.id` |
| `name` | `text` | NOT NULL |
| `code` | `text` | NOT NULL, UNIQUE |
| *(audit columns)* | — | same pattern as above |

---

### `cells`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `college_id` | `uuid` | NOT NULL, FK → `colleges.id` |
| `name` | `text` | NOT NULL |
| `slug` | `text` | NOT NULL |
| *(audit columns)* | — | same pattern |

---

### `committees`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `college_id` | `uuid` | NOT NULL, FK → `colleges.id` |
| `name` | `text` | NOT NULL |
| `slug` | `text` | NOT NULL |
| *(audit columns)* | — | same pattern |

---

### `centers`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `college_id` | `uuid` | FK → `colleges.id` |
| `institute_id` | `uuid` | FK → `institutes.id` |
| `name` | `text` | NOT NULL |
| `slug` | `text` | NOT NULL |
| *(audit columns)* | — | same pattern |

Checks: `college_id IS NOT NULL OR institute_id IS NOT NULL`

---

### `facilities`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `facility_type` | `facility_type` | NOT NULL |
| `parent_id` | `uuid` | FK → `facilities.id` (self-ref) |
| `institute_id` | `uuid` | FK → `institutes.id` |
| `department_id` | `uuid` | FK → `departments.id` |
| `name` | `text` | NOT NULL |
| `slug` | `text` | UNIQUE |
| `address` | `text` | |
| `code` | `text` | |
| `room_number` | `text` | |
| *(audit columns)* | — | |

Checks:
- campus → institute_id NOT NULL, parent_id NULL
- building → parent_id NOT NULL
- laboratory → department_id NOT NULL

---

## 3. Users, Roles & Permissions

### `user_profiles`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, FK → `auth.users.id` (no default — matches Supabase Auth) |
| `first_name` | `text` | |
| `last_name` | `text` | |
| `avatar_url` | `text` | |
| `bio` | `text` | |
| *(audit columns)* | — | same pattern |

---

### `roles`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `name` | `text` | NOT NULL, UNIQUE |
| `code` | `text` | NOT NULL, UNIQUE |
| *(audit columns)* | — | same pattern |

---

### `permissions`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `name` | `text` | NOT NULL, UNIQUE |
| `code` | `text` | NOT NULL, UNIQUE |
| *(audit columns)* | — | same pattern |

---

### `role_permissions`

| Column | Type | Constraints |
|---|---|---|
| `role_id` | `uuid` | PK (composite), FK → `roles.id` |
| `permission_id` | `uuid` | PK (composite), FK → `permissions.id` |

---

### `user_roles`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `user_id` | `uuid` | NOT NULL, FK → `user_profiles.id` |
| `role_id` | `uuid` | NOT NULL, FK → `roles.id` |
| `scope_type` | `scope_level` | NOT NULL |
| `trust_id` | `uuid` | FK → `trusts.id` |
| `institute_id` | `uuid` | FK → `institutes.id` |
| `college_id` | `uuid` | FK → `colleges.id` |
| `department_id` | `uuid` | FK → `departments.id` |
| *(audit columns)* | — | same pattern |

Unique: `(user_id, role_id, scope_type, trust_id, institute_id, college_id, department_id)`

Checks: scope must match the corresponding FK — e.g. global → all scope IDs are NULL, department → department_id NOT NULL and rest NULL, etc.

---

## 4. Staff

### `staff_profiles`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `user_id` | `uuid` | FK → `user_profiles.id` |
| `title` | `text` | |
| `first_name` | `text` | NOT NULL |
| `last_name` | `text` | NOT NULL |
| `email` | `text` | NOT NULL, UNIQUE |
| `phone` | `text` | |
| `avatar_url` | `text` | |
| `bio` | `text` | |
| `office_hours` | `jsonb` | default `'{}'` |
| `social_links` | `jsonb` | default `'{}'` |
| *(audit columns)* | — | same pattern |

---

### `designations`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `title` | `text` | NOT NULL, UNIQUE |
| *(audit columns)* | — | same pattern |

---

### `staff_department_assignments`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `staff_id` | `uuid` | NOT NULL, FK → `staff_profiles.id` |
| `department_id` | `uuid` | NOT NULL, FK → `departments.id` |
| `designation_id` | `uuid` | NOT NULL, FK → `designations.id` |
| `is_primary` | `boolean` | default `false` |
| *(audit columns)* | — | same pattern |

Unique: `(staff_id, department_id)`

---

### `qualifications`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `staff_id` | `uuid` | NOT NULL, FK → `staff_profiles.id` |
| `degree` | `text` | NOT NULL |
| `institution` | `text` | NOT NULL |
| `year` | `integer` | NOT NULL |
| *(audit columns)* | — | same pattern |

---

### `experiences`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `staff_id` | `uuid` | NOT NULL, FK → `staff_profiles.id` |
| `organization` | `text` | NOT NULL |
| `role` | `text` | NOT NULL |
| `start_date` | `date` | NOT NULL |
| `end_date` | `date` | |
| `is_academic` | `boolean` | default `true` |
| *(audit columns)* | — | same pattern |

---

### `publications`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `title` | `text` | NOT NULL |
| `journal_conference` | `text` | NOT NULL |
| `publish_date` | `date` | NOT NULL |
| `doi_url` | `text` | |
| `abstract` | `text` | |
| *(audit columns)* | — | same pattern |

---

### `staff_publications`

| Column | Type | Constraints |
|---|---|---|
| `staff_id` | `uuid` | PK (composite), FK → `staff_profiles.id` |
| `publication_id` | `uuid` | PK (composite), FK → `publications.id` |

---

### `research_projects`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `title` | `text` | NOT NULL |
| `funding_agency` | `text` | |
| `amount` | `numeric(15,2)` | |
| `duration_years` | `numeric(3,1)` | |
| `project_status` | `text` | NOT NULL |
| `principal_investigator_id` | `uuid` | NOT NULL, FK → `staff_profiles.id` |
| *(audit columns)* | — | same pattern |

Checks: `project_status IN ('ongoing', 'completed')`

---

### `research_interests`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `staff_id` | `uuid` | NOT NULL, FK → `staff_profiles.id` |
| `interest_name` | `text` | NOT NULL |
| *(audit columns)* | — | same pattern |

Unique: `(staff_id, interest_name)`

---

### `awards`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `staff_id` | `uuid` | NOT NULL, FK → `staff_profiles.id` |
| `title` | `text` | NOT NULL |
| `awarding_body` | `text` | NOT NULL |
| `received_year` | `integer` | NOT NULL |
| `description` | `text` | |
| *(audit columns)* | — | same pattern |

---

### `patents`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `staff_id` | `uuid` | NOT NULL, FK → `staff_profiles.id` |
| `title` | `text` | NOT NULL |
| `patent_number` | `text` | |
| `patent_status` | `text` | NOT NULL |
| `publication_date` | `date` | |
| `inventors` | `text[]` | NOT NULL |
| *(audit columns)* | — | same pattern |

Checks: `patent_status IN ('filed', 'published', 'granted')`

---

## 5. Content Management

### `content_categories`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `name` | `text` | NOT NULL |
| `slug` | `text` | NOT NULL |
| `module_type` | `text` | NOT NULL |
| *(audit columns)* | — | same pattern |

Unique: `(slug, module_type)`

---

### `posts`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `scope_type` | `scope_level` | default `'global'` |
| `department_id` | `uuid` | FK → `departments.id` |
| `title` | `text` | NOT NULL |
| `slug` | `text` | NOT NULL |
| `summary` | `text` | |
| `content` | `text` | |
| `featured_image_url` | `text` | |
| `category_id` | `uuid` | FK → `content_categories.id` |
| `is_featured` | `boolean` | default `false` |
| `published_at` | `timestamptz` | |
| `expires_at` | `timestamptz` | |
| `seo_id` | `uuid` | FK → `seo_metadata.id` |
| *(audit columns)* | — | same pattern |

Checks: scope must match department_id (global → NULL, department → NOT NULL)

---

### `pages`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `title` | `text` | NOT NULL |
| `slug` | `text` | NOT NULL, UNIQUE |
| `content` | `text` | |
| `parent_id` | `uuid` | FK → `pages.id` (self-ref) |
| `is_homepage` | `boolean` | default `false` |
| `seo_id` | `uuid` | FK → `seo_metadata.id` |
| *(audit columns)* | — | same pattern (status default `'draft'`) |

Checks: `slug ~* '^[a-z0-9]+(?:-[a-z0-9]+)*$'`

---

### `events`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `scope_type` | `scope_level` | default `'global'` |
| `department_id` | `uuid` | FK → `departments.id` |
| `title` | `text` | NOT NULL |
| `slug` | `text` | NOT NULL |
| `description` | `text` | |
| `tag` | `text` | |
| `start_date` | `timestamptz` | NOT NULL |
| `end_date` | `timestamptz` | |
| `location` | `text` | |
| `map_url` | `text` | |
| `registration_link` | `text` | |
| `featured_image_url` | `text` | |
| `sort_order` | `integer` | default `0` |
| `seo_id` | `uuid` | FK → `seo_metadata.id` |
| *(audit columns)* | — | same pattern (status default `'draft'`, type `event_status`) |

Checks: `start_date <= end_date`, scope must match department_id

---

### `achievements`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `scope_type` | `scope_level` | default `'global'` |
| `department_id` | `uuid` | FK → `departments.id` |
| `title` | `text` | NOT NULL |
| `slug` | `text` | NOT NULL |
| `description` | `text` | |
| `date` | `date` | NOT NULL |
| `category` | `text` | NOT NULL |
| `featured_image_url` | `text` | |
| *(audit columns)* | — | same pattern |

Checks: `category IN ('student', 'faculty', 'college', 'department')`, scope must match department_id

---

### `downloads`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `title` | `text` | NOT NULL |
| `file_url` | `text` | NOT NULL |
| `file_type` | `text` | |
| `file_size` | `integer` | |
| `category` | `text` | NOT NULL |
| `publish_date` | `date` | default `CURRENT_DATE` |
| *(audit columns)* | — | same pattern |

Checks: `category IN ('circular', 'notice', 'syllabus', 'form', 'other')`

---

### `contact_info`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `address` | `text` | |
| `phone` | `text` | |
| `email` | `text` | |
| `office_hours` | `jsonb` | default `'{}'` |
| `map_iframe_url` | `text` | |
| `social_links` | `jsonb` | default `'{}'` |
| *(audit columns)* | — | same pattern |

---

### `seo_metadata`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `meta_title` | `text` | |
| `meta_description` | `text` | |
| `meta_keywords` | `text[]` | default `'{}'` |
| `canonical_url` | `text` | |
| `og_title` | `text` | |
| `og_description` | `text` | |
| `og_image_url` | `text` | |
| `twitter_card` | `text` | |
| `structured_data` | `jsonb` | default `'{}'` |
| `robots_directives` | `text` | |
| *(audit columns)* | — | same pattern |

---

### `redirects`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `source_path` | `text` | NOT NULL, UNIQUE |
| `target_path` | `text` | NOT NULL |
| `status_code` | `integer` | default `301` |
| *(audit columns)* | — | same pattern |

Checks: `status_code IN (301, 302, 307, 308)`

---

### `testimonials`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `author_name` | `text` | NOT NULL |
| `author_role` | `text` | NOT NULL |
| `company_or_institution` | `text` | |
| `quote` | `text` | NOT NULL |
| `avatar_url` | `text` | |
| *(audit columns)* | — | same pattern |

---

## 6. Homepage Builder

### `homepage_sections`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `scope_type` | `scope_level` | default `'global'` |
| `department_id` | `uuid` | FK → `departments.id` |
| `title` | `text` | |
| `section_type` | `text` | NOT NULL |
| `sort_order` | `integer` | default `0` |
| `is_active` | `boolean` | default `true` |
| `config` | `jsonb` | default `'{}'` |
| *(audit columns)* | — | same pattern |

Checks: scope must match department_id

---

### `homepage_items`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `scope_type` | `scope_level` | default `'global'` |
| `department_id` | `uuid` | FK → `departments.id` |
| `item_type` | `text` | NOT NULL |
| `eyebrow` | `text` | |
| `title` | `text` | NOT NULL |
| `title_accent` | `text` | |
| `subtitle` | `text` | |
| `body` | `text` | |
| `image_url` | `text` | |
| `icon_name` | `text` | |
| `link_href` | `text` | |
| `link_label` | `text` | |
| `secondary_link_href` | `text` | |
| `secondary_link_label` | `text` | |
| `sort_order` | `integer` | default `0` |
| `is_active` | `boolean` | default `true` |
| *(audit columns)* | — | same pattern |

Checks: scope must match department_id

---

### `homepage_widgets`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `section_id` | `uuid` | NOT NULL, FK → `homepage_sections.id` |
| `title` | `text` | |
| `widget_type` | `text` | NOT NULL |
| `config` | `jsonb` | default `'{}'` |
| `sort_order` | `integer` | default `0` |
| *(audit columns)* | — | same pattern |

---

## 7. Navigation

### `menus`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `name` | `text` | NOT NULL |
| `code` | `text` | NOT NULL, UNIQUE |
| *(audit columns)* | — | same pattern |

---

### `menu_items`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `menu_id` | `uuid` | NOT NULL, FK → `menus.id` |
| `parent_id` | `uuid` | FK → `menu_items.id` (self-ref) |
| `title` | `text` | NOT NULL |
| `link_type` | `link_type` | NOT NULL |
| `url` | `text` | |
| `page_id` | `uuid` | FK → `pages.id` |
| `icon` | `text` | |
| `sort_order` | `integer` | default `0` |
| `permissions_required` | `text[]` | default `'{}'` |
| `visibility_rules` | `jsonb` | default `'{}'` |
| *(audit columns)* | — | same pattern |

Checks: internal link → page_id NOT NULL, external → url NOT NULL

---

## 8. Media

### `media_folders`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `scope_type` | `scope_level` | default `'global'` |
| `department_id` | `uuid` | FK → `departments.id` |
| `name` | `text` | NOT NULL |
| `parent_id` | `uuid` | FK → `media_folders.id` (self-ref) |
| *(audit columns)* | — | same pattern |

Checks: scope must match department_id

---

### `media_files`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `scope_type` | `scope_level` | default `'global'` |
| `department_id` | `uuid` | FK → `departments.id` |
| `folder_id` | `uuid` | FK → `media_folders.id` |
| `filename` | `text` | NOT NULL |
| `file_path` | `text` | NOT NULL, UNIQUE |
| `mime_type` | `text` | NOT NULL |
| `file_size` | `integer` | NOT NULL |
| `alt_text` | `text` | |
| `caption` | `text` | |
| `tags` | `text[]` | default `'{}'` |
| *(audit columns)* | — | same pattern |

Checks: scope must match department_id

---

### `gallery_albums`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `scope_type` | `scope_level` | default `'global'` |
| `department_id` | `uuid` | FK → `departments.id` |
| `title` | `text` | NOT NULL |
| `slug` | `text` | NOT NULL |
| `description` | `text` | |
| `cover_image_url` | `text` | |
| *(audit columns)* | — | same pattern |

Checks: scope must match department_id

---

### `gallery_media`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `album_id` | `uuid` | NOT NULL, FK → `gallery_albums.id` |
| `media_type` | `text` | NOT NULL |
| `url` | `text` | NOT NULL |
| `caption` | `text` | |
| `sort_order` | `integer` | default `0` |
| *(audit columns)* | — | same pattern |

Checks: `media_type IN ('image', 'video')`

---

## 9. Placements & Recruitment

### `recruiters`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `company_name` | `text` | NOT NULL |
| `logo_url` | `text` | NOT NULL |
| `website_url` | `text` | |
| `sort_order` | `integer` | default `0` |
| *(audit columns)* | — | same pattern |

---

### `placement_statistics`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `academic_year` | `text` | NOT NULL, UNIQUE |
| `total_students` | `integer` | NOT NULL |
| `placed_students` | `integer` | NOT NULL |
| `highest_package` | `numeric(12,2)` | |
| `average_package` | `numeric(12,2)` | |
| `recruiters_count` | `integer` | |
| *(audit columns)* | — | same pattern |

---

### `mous`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `partner_organization` | `text` | NOT NULL |
| `logo_url` | `text` | |
| `purpose` | `text` | |
| `signed_date` | `date` | NOT NULL |
| `expiry_date` | `date` | |
| *(audit columns)* | — | same pattern |

---

### `accreditations`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `organization` | `text` | NOT NULL |
| `value` | `text` | NOT NULL |
| `received_year` | `integer` | NOT NULL |
| `expiry_date` | `date` | |
| *(audit columns)* | — | same pattern |

---

## 10. Inquiry / Contact Forms

### `inquiry_forms`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `form_name` | `text` | NOT NULL, UNIQUE |
| `fields_config` | `jsonb` | default `'[]'` |
| `recipient_emails` | `text[]` | default `'{}'` |
| *(audit columns)* | — | same pattern |

---

### `inquiry_submissions`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `form_id` | `uuid` | NOT NULL, FK → `inquiry_forms.id` |
| `submitted_data` | `jsonb` | NOT NULL |
| `status` | `submission_status` | default `'unread'` |
| `notes` | `text` | |
| *(audit columns)* | — | (no `status`/`metadata` — uses only `submission_status`) |

---

## 11. Student Clubs

### `student_clubs`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `name` | `text` | NOT NULL |
| `slug` | `text` | NOT NULL, UNIQUE |
| `description` | `text` | |
| `logo_url` | `text` | |
| `coordinator_id` | `uuid` | FK → `staff_profiles.id` |
| `student_coordinator_name` | `text` | |
| *(audit columns)* | — | same pattern |

---

## 12. Audit

### `audit_logs`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `user_id` | `uuid` | FK → `user_profiles.id` |
| `action` | `text` | NOT NULL |
| `table_name` | `text` | NOT NULL |
| `record_id` | `uuid` | NOT NULL |
| `old_values` | `jsonb` | |
| `new_values` | `jsonb` | |
| `client_ip` | `text` | |
| `user_agent` | `text` | |
| `created_at` | `timestamptz` | default `now()` |

---

## Indexes

| Index | Table | Columns |
|---|---|---|
| `idx_achievements_scope` | `achievements` | `scope_type, department_id` |
| `idx_branches_course_id` | `branches` | `course_id` |
| `idx_colleges_institute_id` | `colleges` | `institute_id` |
| `idx_college_slug` | `colleges` | `slug` |
| `idx_courses_department_id` | `courses` | `department_id` |
| `idx_departments_college_id` | `departments` | `college_id` |
| `idx_dept_slug` | `departments` | `slug` |
| `idx_event_slug` | `events` | `slug` |
| `idx_events_scope` | `events` | `scope_type, department_id` |
| `idx_events_active` | `events` | `status` |
| `idx_facilities_parent_id` | `facilities` | `parent_id` |
| `idx_facilities_institute_id` | `facilities` | `institute_id` |
| `idx_facilities_department_id` | `facilities` | `department_id` |
| `idx_facility_slug` | `facilities` | `slug` |
| `idx_gallery_albums_scope` | `gallery_albums` | `scope_type, department_id` |
| `idx_homepage_items_scope` | `homepage_items` | `scope_type, department_id` |
| `idx_homepage_sections_scope` | `homepage_sections` | `scope_type, department_id` |
| `idx_homepage_widgets_section_id` | `homepage_widgets` | `section_id` |
| `idx_institutes_trust_id` | `institutes` | `trust_id` |
| `idx_institute_slug` | `institutes` | `slug` |
| `idx_media_files_folder_id` | `media_files` | `folder_id` |
| `idx_media_files_scope` | `media_files` | `scope_type, department_id` |
| `idx_media_folders_scope` | `media_folders` | `scope_type, department_id` |
| `idx_menu_items_menu_id` | `menu_items` | `menu_id` |
| `idx_page_slug` | `pages` | `slug` |
| `idx_pages_active` | `pages` | `status` |
| `idx_patents_staff_id` | `patents` | `staff_id` |
| `idx_post_slug` | `posts` | `slug` |
| `idx_posts_scope` | `posts` | `scope_type, department_id` |
| `idx_posts_active` | `posts` | `status` |
| `idx_research_projects_pi_id` | `research_projects` | `principal_investigator_id` |
| `idx_trust_slug` | `trusts` | `slug` |
| `idx_user_roles_user_id` | `user_roles` | `user_id` |

---

## Entity Relationship Diagram (Conceptual)

```
trusts ──< institutes ──< colleges ──< departments ──< courses ──< branches
                │             │             │
                │             │             ├── cells
                │             │             ├── committees
                │             │             └── centers
                │             │
                │             └── facilities (campus)
                │
                └── facilities (building)

staff_profiles ──< staff_department_assignments >── designations
      │                │
      ├── qualifications        departments
      ├── experiences
      ├── awards
      ├── patents
      ├── research_interests
      ├── research_projects
      └── staff_publications >── publications

user_profiles ──< user_roles >── roles ──< role_permissions >── permissions

pages ──< menu_items >── menus
posts ──< content_categories
events
achievements

homepage_sections ──< homepage_widgets
homepage_sections ──< homepage_items

media_folders ──< media_files
gallery_albums ──< gallery_media

inquiry_forms ──< inquiry_submissions
```

**Conventions across all tables:**
- Every table (except junction tables and `audit_logs`) has: `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at`, `deleted_by`, `status`, `metadata`
- `created_by` / `updated_by` / `deleted_by` always FK → `user_profiles.id`
- `status` always `content_status` with default `'published'`
- `metadata` always `jsonb` with default `'{}'`
- Soft deletes via `deleted_at` + `deleted_by`
