# Supabase Database Schema

**Project:** `agezrfclusigfqysbxwb`  
**Generated:** 2026-07-22

---

## Tables (53)

### `accreditations`

**Rows:** 0  
**Columns:** 13

| Column | Type |
|--------|------|
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `expiry_date` | string (nullable) |
| `id` | string |
| `metadata` | jsonb |
| `organization` | string |
| `received_year` | number |
| `status` | content_status (enum) |
| `updated_at` | string |
| `updated_by` | string (nullable) |
| `value` | string |

### `achievements`

**Rows:** 0  
**Columns:** 17

| Column | Type |
|--------|------|
| `category` | string |
| `created_at` | string |
| `created_by` | string (nullable) |
| `date` | string |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `department_id` | string (nullable) |
| `description` | string (nullable) |
| `featured_image_url` | string (nullable) |
| `id` | string |
| `metadata` | jsonb |
| `scope_type` | scope_level (enum) |
| `slug` | string |
| `status` | content_status (enum) |
| `title` | string |
| `updated_at` | string |
| `updated_by` | string (nullable) |

### `audit_logs`

**Rows:** 0  
**Columns:** 10

| Column | Type |
|--------|------|
| `action` | string |
| `client_ip` | string (nullable) |
| `created_at` | string |
| `id` | string |
| `new_values` | jsonb (nullable) |
| `old_values` | jsonb (nullable) |
| `record_id` | string |
| `table_name` | string |
| `user_agent` | string (nullable) |
| `user_id` | string (nullable) |

### `awards`

**Rows:** 0  
**Columns:** 14

| Column | Type |
|--------|------|
| `awarding_body` | string |
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `description` | string (nullable) |
| `id` | string |
| `metadata` | jsonb |
| `received_year` | number |
| `staff_id` | string |
| `status` | content_status (enum) |
| `title` | string |
| `updated_at` | string |
| `updated_by` | string (nullable) |

### `branches`

**Rows:** 0  
**Columns:** 12

| Column | Type |
|--------|------|
| `code` | string |
| `course_id` | string |
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `id` | string |
| `metadata` | jsonb |
| `name` | string |
| `status` | content_status (enum) |
| `updated_at` | string |
| `updated_by` | string (nullable) |

### `cells`

**Rows:** 0  
**Columns:** 12

| Column | Type |
|--------|------|
| `college_id` | string |
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `id` | string |
| `metadata` | jsonb |
| `name` | string |
| `slug` | string |
| `status` | content_status (enum) |
| `updated_at` | string |
| `updated_by` | string (nullable) |

### `centers`

**Rows:** 0  
**Columns:** 13

| Column | Type |
|--------|------|
| `college_id` | string (nullable) |
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `id` | string |
| `institute_id` | string (nullable) |
| `metadata` | jsonb |
| `name` | string |
| `slug` | string |
| `status` | content_status (enum) |
| `updated_at` | string |
| `updated_by` | string (nullable) |

### `colleges`

**Rows:** 4  
**Columns:** 16

| Column | Type |
|--------|------|
| `code` | string |
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `id` | string |
| `institute_id` | string |
| `logo_url` | string (nullable) |
| `metadata` | jsonb |
| `name` | string |
| `slug` | string |
| `sort_order` | number |
| `status` | content_status (enum) |
| `updated_at` | string |
| `updated_by` | string (nullable) |
| `website_url` | string (nullable) |

<details>
<summary>Sample Data (3 rows)</summary>

```json
[
  {
    "id": "5b2d6308-f93f-47dd-816d-fad491f30019",
    "institute_id": "d9c3c849-08e5-4a52-b678-b8ab23523a79",
    "name": "Sardar Vallabhbhai Patel Institute of Technology",
    "slug": "svit",
    "code": "SVIT",
    "logo_url": "/__l5e/assets-v1/6b5fd3d4-843d-4072-8ec4-663e3fe9e57a/svit-logo.jpg",
    "website_url": null,
    "sort_order": 1,
    "created_at": "2026-07-20T08:13:02.148293+00:00",
    "updated_at": "2026-07-21T09:48:48.42626+00:00",
    "created_by": null,
    "updated_by": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "deleted_at": null,
    "deleted_by": null,
    "status": "published",
    "metadata": {}
  },
  {
    "id": "f228fc71-183a-4466-84b7-1b711fa09bec",
    "institute_id": "d9c3c849-08e5-4a52-b678-b8ab23523a79",
    "name": "College of Architecture",
    "slug": "svit-coa",
    "code": "COA",
    "logo_url": "/__l5e/assets-v1/d3a378f3-5f40-476f-ba85-f2a98b40730e/coa-svit-logo.png",
    "website_url": null,
    "sort_order": 4,
    "created_at": "2026-07-20T08:13:02.148293+00:00",
    "updated_at": "2026-07-21T10:20:54.29691+00:00",
    "created_by": null,
    "updated_by": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "deleted_at": null,
    "deleted_by": null,
    "status": "published",
    "metadata": {}
  },
  {
    "id": "9e2136bf-728a-4461-89a5-e4501b148620",
    "institute_id": "d9c3c849-08e5-4a52-b678-b8ab23523a79",
    "name": "Sardar Vallabhbhai Patel Institute of Computer Applications",
    "slug": "svica",
    "code": "SVICA",
    "logo_url": "/__l5e/assets-v1/3c28feb0-462e-48c1-8a9f-42234f5be279/svica-logo.jpg",
    "website_url": null,
    "sort_order": 2,
    "created_at": "2026-07-20T08:13:02.148293+00:00",
    "updated_at": "2026-07-20T09:12:18.977316+00:00",
    "created_by": null,
    "updated_by": null,
    "deleted_at": null,
    "deleted_by": null,
    "status": "published",
    "metadata": {}
  }
]
```

</details>

### `committees`

**Rows:** 0  
**Columns:** 12

| Column | Type |
|--------|------|
| `college_id` | string |
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `id` | string |
| `metadata` | jsonb |
| `name` | string |
| `slug` | string |
| `status` | content_status (enum) |
| `updated_at` | string |
| `updated_by` | string (nullable) |

### `contact_info`

**Rows:** 0  
**Columns:** 15

| Column | Type |
|--------|------|
| `address` | string (nullable) |
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `email` | string (nullable) |
| `id` | string |
| `map_iframe_url` | string (nullable) |
| `metadata` | jsonb |
| `office_hours` | jsonb |
| `phone` | string (nullable) |
| `social_links` | jsonb |
| `status` | content_status (enum) |
| `updated_at` | string |
| `updated_by` | string (nullable) |

### `content_categories`

**Rows:** 0  
**Columns:** 12

| Column | Type |
|--------|------|
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `id` | string |
| `metadata` | jsonb |
| `module_type` | string |
| `name` | string |
| `slug` | string |
| `status` | content_status (enum) |
| `updated_at` | string |
| `updated_by` | string (nullable) |

### `courses`

**Rows:** 2  
**Columns:** 13

| Column | Type |
|--------|------|
| `code` | string |
| `created_at` | string |
| `created_by` | string (nullable) |
| `degree_level` | degree_level (enum) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `department_id` | string (nullable) |
| `id` | string |
| `metadata` | jsonb |
| `name` | string |
| `status` | content_status (enum) |
| `updated_at` | string |
| `updated_by` | string (nullable) |

<details>
<summary>Sample Data (2 rows)</summary>

```json
[
  {
    "id": "ce331cef-904a-4b7b-be05-223482b81545",
    "department_id": "926f0424-4ada-4abe-92f2-3203b802388f",
    "name": "B.Tech Computer Engineering",
    "code": "BTECH-CE",
    "degree_level": "undergraduate",
    "created_at": "2026-07-20T08:13:02.762337+00:00",
    "updated_at": "2026-07-20T09:12:19.367475+00:00",
    "created_by": null,
    "updated_by": null,
    "deleted_at": null,
    "deleted_by": null,
    "status": "published",
    "metadata": {}
  },
  {
    "id": "97539319-07c8-438d-84ff-51262628119e",
    "department_id": "926f0424-4ada-4abe-92f2-3203b802388f",
    "name": "M.Tech Computer Engineering",
    "code": "MTECH-CE",
    "degree_level": "graduate",
    "created_at": "2026-07-20T08:13:02.762337+00:00",
    "updated_at": "2026-07-20T09:12:19.367475+00:00",
    "created_by": null,
    "updated_by": null,
    "deleted_at": null,
    "deleted_by": null,
    "status": "published",
    "metadata": {}
  }
]
```

</details>

### `departments`

**Rows:** 3  
**Columns:** 14

| Column | Type |
|--------|------|
| `code` | string |
| `college_id` | string |
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `head_of_department_id` | string (nullable) |
| `id` | string |
| `metadata` | jsonb |
| `name` | string |
| `slug` | string |
| `status` | content_status (enum) |
| `updated_at` | string |
| `updated_by` | string (nullable) |

<details>
<summary>Sample Data (3 rows)</summary>

```json
[
  {
    "id": "926f0424-4ada-4abe-92f2-3203b802388f",
    "college_id": "5b2d6308-f93f-47dd-816d-fad491f30019",
    "name": "Computer Engineering",
    "slug": "computer-engineering",
    "code": "CE",
    "created_at": "2026-07-20T08:13:02.449039+00:00",
    "updated_at": "2026-07-20T09:12:19.176374+00:00",
    "created_by": null,
    "updated_by": null,
    "deleted_at": null,
    "deleted_by": null,
    "status": "published",
    "metadata": {},
    "head_of_department_id": null
  },
  {
    "id": "0730f88f-d684-4113-9a0e-5e48a52373b1",
    "college_id": "5b2d6308-f93f-47dd-816d-fad491f30019",
    "name": "Information Technology",
    "slug": "information-technology",
    "code": "IT",
    "created_at": "2026-07-20T08:13:02.449039+00:00",
    "updated_at": "2026-07-20T09:12:19.176374+00:00",
    "created_by": null,
    "updated_by": null,
    "deleted_at": null,
    "deleted_by": null,
    "status": "published",
    "metadata": {},
    "head_of_department_id": null
  },
  {
    "id": "0041486b-9473-43f1-9a4b-839d97045066",
    "college_id": "5b2d6308-f93f-47dd-816d-fad491f30019",
    "name": "Mechanical Engineering",
    "slug": "mechanical-engineering",
    "code": "ME",
    "created_at": "2026-07-20T08:13:02.449039+00:00",
    "updated_at": "2026-07-20T09:12:19.176374+00:00",
    "created_by": null,
    "updated_by": null,
    "deleted_at": null,
    "deleted_by": null,
    "status": "published",
    "metadata": {},
    "head_of_department_id": null
  }
]
```

</details>

### `designations`

**Rows:** 2  
**Columns:** 10

| Column | Type |
|--------|------|
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `id` | string |
| `metadata` | jsonb |
| `status` | content_status (enum) |
| `title` | string |
| `updated_at` | string |
| `updated_by` | string (nullable) |

<details>
<summary>Sample Data (2 rows)</summary>

```json
[
  {
    "id": "18ae9fda-a1b8-4146-a8c3-f1efab71272b",
    "title": "Professor & Head of Department",
    "created_at": "2026-07-20T08:12:49.516789+00:00",
    "updated_at": "2026-07-20T09:12:19.550006+00:00",
    "created_by": null,
    "updated_by": null,
    "deleted_at": null,
    "deleted_by": null,
    "status": "published",
    "metadata": {}
  },
  {
    "id": "1242c66f-49e2-4856-96e8-b0fb08f52344",
    "title": "Associate Professor",
    "created_at": "2026-07-20T08:12:49.516789+00:00",
    "updated_at": "2026-07-20T09:12:19.550006+00:00",
    "created_by": null,
    "updated_by": null,
    "deleted_at": null,
    "deleted_by": null,
    "status": "published",
    "metadata": {}
  }
]
```

</details>

### `downloads`

**Rows:** 0  
**Columns:** 15

| Column | Type |
|--------|------|
| `category` | string |
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `file_size` | number (nullable) |
| `file_type` | string (nullable) |
| `file_url` | string |
| `id` | string |
| `metadata` | jsonb |
| `publish_date` | string |
| `status` | content_status (enum) |
| `title` | string |
| `updated_at` | string |
| `updated_by` | string (nullable) |

### `events`

**Rows:** 2  
**Columns:** 23

| Column | Type |
|--------|------|
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `department_id` | string (nullable) |
| `description` | string (nullable) |
| `end_date` | string (nullable) |
| `featured_image_url` | string (nullable) |
| `id` | string |
| `location` | string (nullable) |
| `map_url` | string (nullable) |
| `metadata` | jsonb |
| `registration_link` | string (nullable) |
| `scope_type` | scope_level (enum) |
| `seo_id` | string (nullable) |
| `slug` | string |
| `sort_order` | number |
| `start_date` | string |
| `status` | event_status (enum) |
| `tag` | string (nullable) |
| `title` | string |
| `updated_at` | string |
| `updated_by` | string (nullable) |

<details>
<summary>Sample Data (2 rows)</summary>

```json
[
  {
    "id": "3d5cf5da-10b6-4d3d-9a4d-ad6b3ff5dfae",
    "scope_type": "global",
    "department_id": null,
    "title": "Ananya 2026 Cultural Fest",
    "slug": "ananya-2026",
    "description": "Three days of music, dance, drama and food across the campus greens.",
    "tag": "Culture",
    "start_date": "2026-02-12T00:00:00+00:00",
    "end_date": null,
    "location": null,
    "map_url": null,
    "registration_link": null,
    "featured_image_url": null,
    "sort_order": 1,
    "seo_id": null,
    "created_at": "2026-07-20T08:13:14.613498+00:00",
    "updated_at": "2026-07-20T08:13:14.613498+00:00",
    "created_by": null,
    "updated_by": null,
    "deleted_at": null,
    "deleted_by": null,
    "status": "published",
    "metadata": {}
  },
  {
    "id": "5ad71600-f576-4faa-a249-fe432373c2fe",
    "scope_type": "global",
    "department_id": null,
    "title": "TechFest — National Symposium",
    "slug": "techfest-2026",
    "description": "Hackathons, tech talks and workshops with industry leaders.",
    "tag": "Tech",
    "start_date": "2026-03-08T00:00:00+00:00",
    "end_date": null,
    "location": null,
    "map_url": null,
    "registration_link": null,
    "featured_image_url": null,
    "sort_order": 2,
    "seo_id": null,
    "created_at": "2026-07-20T08:13:14.613498+00:00",
    "updated_at": "2026-07-20T08:13:14.613498+00:00",
    "created_by": null,
    "updated_by": null,
    "deleted_at": null,
    "deleted_by": null,
    "status": "published",
    "metadata": {}
  }
]
```

</details>

### `experiences`

**Rows:** 0  
**Columns:** 15

| Column | Type |
|--------|------|
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `end_date` | string (nullable) |
| `id` | string |
| `is_academic` | boolean |
| `metadata` | jsonb |
| `organization` | string |
| `role` | string |
| `staff_id` | string |
| `start_date` | string |
| `status` | content_status (enum) |
| `updated_at` | string |
| `updated_by` | string (nullable) |

### `facilities`

**Rows:** 0  
**Columns:** 18

| Column | Type |
|--------|------|
| `address` | string (nullable) |
| `code` | string (nullable) |
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `department_id` | string (nullable) |
| `facility_type` | facility_type (enum) |
| `id` | string |
| `institute_id` | string (nullable) |
| `metadata` | jsonb |
| `name` | string |
| `parent_id` | string (nullable) |
| `room_number` | string (nullable) |
| `slug` | string (nullable) |
| `status` | content_status (enum) |
| `updated_at` | string |
| `updated_by` | string (nullable) |

### `gallery_albums`

**Rows:** 0  
**Columns:** 15

| Column | Type |
|--------|------|
| `cover_image_url` | string (nullable) |
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `department_id` | string (nullable) |
| `description` | string (nullable) |
| `id` | string |
| `metadata` | jsonb |
| `scope_type` | scope_level (enum) |
| `slug` | string |
| `status` | content_status (enum) |
| `title` | string |
| `updated_at` | string |
| `updated_by` | string (nullable) |

### `gallery_media`

**Rows:** 0  
**Columns:** 14

| Column | Type |
|--------|------|
| `album_id` | string |
| `caption` | string (nullable) |
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `id` | string |
| `media_type` | string |
| `metadata` | jsonb |
| `sort_order` | number |
| `status` | content_status (enum) |
| `updated_at` | string |
| `updated_by` | string (nullable) |
| `url` | string |

### `homepage_items`

**Rows:** 20  
**Columns:** 25

| Column | Type |
|--------|------|
| `body` | string (nullable) |
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `department_id` | string (nullable) |
| `eyebrow` | string (nullable) |
| `icon_name` | string (nullable) |
| `id` | string |
| `image_url` | string (nullable) |
| `is_active` | boolean |
| `item_type` | string |
| `link_href` | string (nullable) |
| `link_label` | string (nullable) |
| `metadata` | jsonb |
| `scope_type` | scope_level (enum) |
| `secondary_link_href` | string (nullable) |
| `secondary_link_label` | string (nullable) |
| `sort_order` | number |
| `status` | content_status (enum) |
| `subtitle` | string (nullable) |
| `title` | string |
| `title_accent` | string (nullable) |
| `updated_at` | string |
| `updated_by` | string (nullable) |

<details>
<summary>Sample Data (3 rows)</summary>

```json
[
  {
    "id": "1053fa38-d713-4241-801a-a5e10d83afd7",
    "scope_type": "global",
    "department_id": null,
    "item_type": "stat",
    "eyebrow": null,
    "title": "20+",
    "title_accent": null,
    "subtitle": "Years of Excellence",
    "body": null,
    "image_url": null,
    "icon_name": null,
    "link_href": null,
    "link_label": null,
    "secondary_link_href": null,
    "secondary_link_label": null,
    "sort_order": 1,
    "is_active": true,
    "created_at": "2026-07-20T08:13:03.920265+00:00",
    "updated_at": "2026-07-20T08:13:03.920265+00:00",
    "created_by": null,
    "updated_by": null,
    "deleted_at": null,
    "deleted_by": null,
    "status": "published",
    "metadata": {}
  },
  {
    "id": "2c5fd88a-1ee8-4770-9823-2df4a9feb7ac",
    "scope_type": "global",
    "department_id": null,
    "item_type": "stat",
    "eyebrow": null,
    "title": "5000+",
    "title_accent": null,
    "subtitle": "Students",
    "body": null,
    "image_url": null,
    "icon_name": null,
    "link_href": null,
    "link_label": null,
    "secondary_link_href": null,
    "secondary_link_label": null,
    "sort_order": 2,
    "is_active": true,
    "created_at": "2026-07-20T08:13:03.920265+00:00",
    "updated_at": "2026-07-20T08:13:03.920265+00:00",
    "created_by": null,
    "updated_by": null,
    "deleted_at": null,
    "deleted_by": null,
    "status": "published",
    "metadata": {}
  },
  {
    "id": "fe13470c-bda0-480c-8f56-e457dd73d884",
    "scope_type": "global",
    "department_id": null,
    "item_type": "stat",
    "eyebrow": null,
    "title": "95%",
    "title_accent": null,
    "subtitle": "Placement Record",
    "body": null,
    "image_url": null,
    "icon_name": null,
    "link_href": null,
    "link_label": null,
    "secondary_link_href": null,
    "secondary_link_label": null,
    "sort_order": 3,
    "is_active": true,
    "created_at": "2026-07-20T08:13:03.920265+00:00",
    "updated_at": "2026-07-20T08:13:03.920265+00:00",
    "created_by": null,
    "updated_by": null,
    "deleted_at": null,
    "deleted_by": null,
    "status": "published",
    "metadata": {}
  }
]
```

</details>

### `homepage_sections`

**Rows:** 0  
**Columns:** 16

| Column | Type |
|--------|------|
| `config` | jsonb |
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `department_id` | string (nullable) |
| `id` | string |
| `is_active` | boolean |
| `metadata` | jsonb |
| `scope_type` | scope_level (enum) |
| `section_type` | string |
| `sort_order` | number |
| `status` | content_status (enum) |
| `title` | string (nullable) |
| `updated_at` | string |
| `updated_by` | string (nullable) |

### `homepage_widgets`

**Rows:** 0  
**Columns:** 14

| Column | Type |
|--------|------|
| `config` | jsonb |
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `id` | string |
| `metadata` | jsonb |
| `section_id` | string |
| `sort_order` | number |
| `status` | content_status (enum) |
| `title` | string (nullable) |
| `updated_at` | string |
| `updated_by` | string (nullable) |
| `widget_type` | string |

### `inquiry_forms`

**Rows:** 0  
**Columns:** 12

| Column | Type |
|--------|------|
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `fields_config` | jsonb |
| `form_name` | string |
| `id` | string |
| `metadata` | jsonb |
| `recipient_emails` | string[] |
| `status` | content_status (enum) |
| `updated_at` | string |
| `updated_by` | string (nullable) |

### `inquiry_submissions`

**Rows:** 0  
**Columns:** 12

| Column | Type |
|--------|------|
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `form_id` | string |
| `id` | string |
| `metadata` | jsonb |
| `notes` | string (nullable) |
| `status` | submission_status (enum) |
| `submitted_data` | jsonb |
| `updated_at` | string |
| `updated_by` | string (nullable) |

### `institutes`

**Rows:** 1  
**Columns:** 15

| Column | Type |
|--------|------|
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `id` | string |
| `logo_url` | string (nullable) |
| `metadata` | jsonb |
| `name` | string |
| `slug` | string |
| `sort_order` | number |
| `status` | content_status (enum) |
| `trust_id` | string |
| `updated_at` | string |
| `updated_by` | string (nullable) |
| `website_url` | string (nullable) |

<details>
<summary>Sample Data (1 rows)</summary>

```json
[
  {
    "id": "d9c3c849-08e5-4a52-b678-b8ab23523a79",
    "trust_id": "cafe77d8-718f-40a9-8237-654425cccc8a",
    "name": "SVIT Group of Educational Institutes",
    "slug": "svit-group",
    "logo_url": "data:image/jpeg;base64,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",
    "website_url": null,
    "sort_order": 0,
    "created_at": "2026-07-20T08:12:47.86094+00:00",
    "updated_at": "2026-07-20T09:14:02.776389+00:00",
    "created_by": null,
    "updated_by": null,
    "deleted_at": null,
    "deleted_by": null,
    "status": "published",
    "metadata": {}
  }
]
```

</details>

### `media_files`

**Rows:** 0  
**Columns:** 19

| Column | Type |
|--------|------|
| `alt_text` | string (nullable) |
| `caption` | string (nullable) |
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `department_id` | string (nullable) |
| `file_path` | string |
| `file_size` | number |
| `filename` | string |
| `folder_id` | string (nullable) |
| `id` | string |
| `metadata` | jsonb |
| `mime_type` | string |
| `scope_type` | scope_level (enum) |
| `status` | content_status (enum) |
| `tags` | string[] |
| `updated_at` | string |
| `updated_by` | string (nullable) |

### `media_folders`

**Rows:** 0  
**Columns:** 13

| Column | Type |
|--------|------|
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `department_id` | string (nullable) |
| `id` | string |
| `metadata` | jsonb |
| `name` | string |
| `parent_id` | string (nullable) |
| `scope_type` | scope_level (enum) |
| `status` | content_status (enum) |
| `updated_at` | string |
| `updated_by` | string (nullable) |

### `menu_items`

**Rows:** 10  
**Columns:** 19

| Column | Type |
|--------|------|
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `icon` | string (nullable) |
| `id` | string |
| `link_type` | link_type (enum) |
| `menu_id` | string |
| `metadata` | jsonb |
| `page_id` | string (nullable) |
| `parent_id` | string (nullable) |
| `permissions_required` | string[] |
| `sort_order` | number |
| `status` | content_status (enum) |
| `title` | string |
| `updated_at` | string |
| `updated_by` | string (nullable) |
| `url` | string (nullable) |
| `visibility_rules` | jsonb |

<details>
<summary>Sample Data (3 rows)</summary>

```json
[
  {
    "id": "60b1775c-38bc-45dd-9267-a970d3999400",
    "menu_id": "8c6445cb-1766-490e-b5f5-ff9cde66fed2",
    "parent_id": null,
    "title": "Home",
    "link_type": "external",
    "url": "/",
    "page_id": null,
    "icon": null,
    "sort_order": 1,
    "permissions_required": [],
    "visibility_rules": {},
    "created_at": "2026-07-20T09:12:21.096426+00:00",
    "updated_at": "2026-07-20T09:12:21.096426+00:00",
    "created_by": null,
    "updated_by": null,
    "deleted_at": null,
    "deleted_by": null,
    "status": "published",
    "metadata": {
      "is_featured": true,
      "show_in_menu": true
    }
  },
  {
    "id": "1fcc7d60-9c1a-4c64-a632-e01f7188c4c2",
    "menu_id": "8c6445cb-1766-490e-b5f5-ff9cde66fed2",
    "parent_id": null,
    "title": "Colleges",
    "link_type": "external",
    "url": "/colleges",
    "page_id": null,
    "icon": null,
    "sort_order": 3,
    "permissions_required": [],
    "visibility_rules": {},
    "created_at": "2026-07-20T09:12:21.096426+00:00",
    "updated_at": "2026-07-20T09:12:21.096426+00:00",
    "created_by": null,
    "updated_by": null,
    "deleted_at": null,
    "deleted_by": null,
    "status": "published",
    "metadata": {
      "is_featured": true,
      "show_in_menu": true
    }
  },
  {
    "id": "38b9b104-bcab-4d68-b21c-19bcc564831b",
    "menu_id": "8c6445cb-1766-490e-b5f5-ff9cde66fed2",
    "parent_id": null,
    "title": "Campus Life",
    "link_type": "external",
    "url": "/campus-life",
    "page_id": null,
    "icon": null,
    "sort_order": 4,
    "permissions_required": [],
    "visibility_rules": {},
    "created_at": "2026-07-20T09:12:21.096426+00:00",
    "updated_at": "2026-07-20T09:12:21.096426+00:00",
    "created_by": null,
    "updated_by": null,
    "deleted_at": null,
    "deleted_by": null,
    "status": "published",
    "metadata": {
      "is_featured": true,
      "show_in_menu": true
    }
  }
]
```

</details>

### `menus`

**Rows:** 2  
**Columns:** 11

| Column | Type |
|--------|------|
| `code` | string |
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `id` | string |
| `metadata` | jsonb |
| `name` | string |
| `status` | content_status (enum) |
| `updated_at` | string |
| `updated_by` | string (nullable) |

<details>
<summary>Sample Data (2 rows)</summary>

```json
[
  {
    "id": "8c6445cb-1766-490e-b5f5-ff9cde66fed2",
    "name": "Main Header Navigation",
    "code": "main_navigation",
    "created_at": "2026-07-20T08:57:05.380363+00:00",
    "updated_at": "2026-07-20T09:12:20.49731+00:00",
    "created_by": null,
    "updated_by": null,
    "deleted_at": null,
    "deleted_by": null,
    "status": "published",
    "metadata": {}
  },
  {
    "id": "e53c7255-2d50-4230-af1a-dde2f6146204",
    "name": "Top Utility Navigation",
    "code": "top_navigation",
    "created_at": "2026-07-20T08:57:05.380363+00:00",
    "updated_at": "2026-07-20T09:12:20.49731+00:00",
    "created_by": null,
    "updated_by": null,
    "deleted_at": null,
    "deleted_by": null,
    "status": "published",
    "metadata": {}
  }
]
```

</details>

### `mous`

**Rows:** 0  
**Columns:** 14

| Column | Type |
|--------|------|
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `expiry_date` | string (nullable) |
| `id` | string |
| `logo_url` | string (nullable) |
| `metadata` | jsonb |
| `partner_organization` | string |
| `purpose` | string (nullable) |
| `signed_date` | string |
| `status` | content_status (enum) |
| `updated_at` | string |
| `updated_by` | string (nullable) |

### `pages`

**Rows:** 0  
**Columns:** 15

| Column | Type |
|--------|------|
| `content` | string (nullable) |
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `id` | string |
| `is_homepage` | boolean |
| `metadata` | jsonb |
| `parent_id` | string (nullable) |
| `seo_id` | string (nullable) |
| `slug` | string |
| `status` | content_status (enum) |
| `title` | string |
| `updated_at` | string |
| `updated_by` | string (nullable) |

### `patents`

**Rows:** 0  
**Columns:** 15

| Column | Type |
|--------|------|
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `id` | string |
| `inventors` | string[] |
| `metadata` | jsonb |
| `patent_number` | string (nullable) |
| `patent_status` | string |
| `publication_date` | string (nullable) |
| `staff_id` | string |
| `status` | content_status (enum) |
| `title` | string |
| `updated_at` | string |
| `updated_by` | string (nullable) |

### `permissions`

**Rows:** 0  
**Columns:** 11

| Column | Type |
|--------|------|
| `code` | string |
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `id` | string |
| `metadata` | jsonb |
| `name` | string |
| `status` | content_status (enum) |
| `updated_at` | string |
| `updated_by` | string (nullable) |

### `placement_statistics`

**Rows:** 0  
**Columns:** 15

| Column | Type |
|--------|------|
| `academic_year` | string |
| `average_package` | number (nullable) |
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `highest_package` | number (nullable) |
| `id` | string |
| `metadata` | jsonb |
| `placed_students` | number |
| `recruiters_count` | number (nullable) |
| `status` | content_status (enum) |
| `total_students` | number |
| `updated_at` | string |
| `updated_by` | string (nullable) |

### `posts`

**Rows:** 0  
**Columns:** 21

| Column | Type |
|--------|------|
| `category_id` | string (nullable) |
| `content` | string (nullable) |
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `department_id` | string (nullable) |
| `expires_at` | string (nullable) |
| `featured_image_url` | string (nullable) |
| `id` | string |
| `is_featured` | boolean |
| `metadata` | jsonb |
| `published_at` | string (nullable) |
| `scope_type` | scope_level (enum) |
| `seo_id` | string (nullable) |
| `slug` | string |
| `status` | content_status (enum) |
| `summary` | string (nullable) |
| `title` | string |
| `updated_at` | string |
| `updated_by` | string (nullable) |

### `publications`

**Rows:** 0  
**Columns:** 14

| Column | Type |
|--------|------|
| `abstract` | string (nullable) |
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `doi_url` | string (nullable) |
| `id` | string |
| `journal_conference` | string |
| `metadata` | jsonb |
| `publish_date` | string |
| `status` | content_status (enum) |
| `title` | string |
| `updated_at` | string |
| `updated_by` | string (nullable) |

### `qualifications`

**Rows:** 0  
**Columns:** 13

| Column | Type |
|--------|------|
| `created_at` | string |
| `created_by` | string (nullable) |
| `degree` | string |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `id` | string |
| `institution` | string |
| `metadata` | jsonb |
| `staff_id` | string |
| `status` | content_status (enum) |
| `updated_at` | string |
| `updated_by` | string (nullable) |
| `year` | number |

### `recruiters`

**Rows:** 30  
**Columns:** 13

| Column | Type |
|--------|------|
| `company_name` | string |
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `id` | string |
| `logo_url` | string |
| `metadata` | jsonb |
| `sort_order` | number |
| `status` | content_status (enum) |
| `updated_at` | string |
| `updated_by` | string (nullable) |
| `website_url` | string (nullable) |

<details>
<summary>Sample Data (3 rows)</summary>

```json
[
  {
    "id": "8870675d-b781-4737-b669-5275f7188774",
    "company_name": "TCS",
    "logo_url": "/__l5e/assets-v1/tcs.jpg",
    "website_url": null,
    "sort_order": 1,
    "created_at": "2026-07-20T08:13:04.204175+00:00",
    "updated_at": "2026-07-20T08:13:04.204175+00:00",
    "created_by": null,
    "updated_by": null,
    "deleted_at": null,
    "deleted_by": null,
    "status": "published",
    "metadata": {}
  },
  {
    "id": "906a49f6-5b61-4e2f-81ad-7a56b7dc586f",
    "company_name": "Infosys",
    "logo_url": "/__l5e/assets-v1/infosys.jpg",
    "website_url": null,
    "sort_order": 2,
    "created_at": "2026-07-20T08:13:04.204175+00:00",
    "updated_at": "2026-07-20T08:13:04.204175+00:00",
    "created_by": null,
    "updated_by": null,
    "deleted_at": null,
    "deleted_by": null,
    "status": "published",
    "metadata": {}
  },
  {
    "id": "70bb6c08-f7ac-4024-83f2-fcd1d0fb1506",
    "company_name": "Wipro",
    "logo_url": "/__l5e/assets-v1/wipro.jpg",
    "website_url": null,
    "sort_order": 3,
    "created_at": "2026-07-20T08:13:04.204175+00:00",
    "updated_at": "2026-07-20T08:13:04.204175+00:00",
    "created_by": null,
    "updated_by": null,
    "deleted_at": null,
    "deleted_by": null,
    "status": "published",
    "metadata": {}
  }
]
```

</details>

### `redirects`

**Rows:** 0  
**Columns:** 12

| Column | Type |
|--------|------|
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `id` | string |
| `metadata` | jsonb |
| `source_path` | string |
| `status` | content_status (enum) |
| `status_code` | number |
| `target_path` | string |
| `updated_at` | string |
| `updated_by` | string (nullable) |

### `research_interests`

**Rows:** 0  
**Columns:** 11

| Column | Type |
|--------|------|
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `id` | string |
| `interest_name` | string |
| `metadata` | jsonb |
| `staff_id` | string |
| `status` | content_status (enum) |
| `updated_at` | string |
| `updated_by` | string (nullable) |

### `research_projects`

**Rows:** 0  
**Columns:** 15

| Column | Type |
|--------|------|
| `amount` | number (nullable) |
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `duration_years` | number (nullable) |
| `funding_agency` | string (nullable) |
| `id` | string |
| `metadata` | jsonb |
| `principal_investigator_id` | string |
| `project_status` | string |
| `status` | content_status (enum) |
| `title` | string |
| `updated_at` | string |
| `updated_by` | string (nullable) |

### `role_permissions`

**Rows:** 0  
**Columns:** 2

| Column | Type |
|--------|------|
| `permission_id` | string |
| `role_id` | string |

### `roles`

**Rows:** 0  
**Columns:** 11

| Column | Type |
|--------|------|
| `code` | string |
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `id` | string |
| `metadata` | jsonb |
| `name` | string |
| `status` | content_status (enum) |
| `updated_at` | string |
| `updated_by` | string (nullable) |

### `seo_metadata`

**Rows:** 0  
**Columns:** 19

| Column | Type |
|--------|------|
| `canonical_url` | string (nullable) |
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `id` | string |
| `meta_description` | string (nullable) |
| `meta_keywords` | string[] |
| `meta_title` | string (nullable) |
| `metadata` | jsonb |
| `og_description` | string (nullable) |
| `og_image_url` | string (nullable) |
| `og_title` | string (nullable) |
| `robots_directives` | string (nullable) |
| `status` | content_status (enum) |
| `structured_data` | jsonb |
| `twitter_card` | string (nullable) |
| `updated_at` | string |
| `updated_by` | string (nullable) |

### `staff_department_assignments`

**Rows:** 0  
**Columns:** 13

| Column | Type |
|--------|------|
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `department_id` | string |
| `designation_id` | string |
| `id` | string |
| `is_primary` | boolean |
| `metadata` | jsonb |
| `staff_id` | string |
| `status` | content_status (enum) |
| `updated_at` | string |
| `updated_by` | string (nullable) |

### `staff_profiles`

**Rows:** 1  
**Columns:** 19

| Column | Type |
|--------|------|
| `avatar_url` | string (nullable) |
| `bio` | string (nullable) |
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `email` | string |
| `first_name` | string |
| `id` | string |
| `last_name` | string |
| `metadata` | jsonb |
| `office_hours` | jsonb |
| `phone` | string (nullable) |
| `social_links` | jsonb |
| `status` | content_status (enum) |
| `title` | string (nullable) |
| `updated_at` | string |
| `updated_by` | string (nullable) |
| `user_id` | string (nullable) |

<details>
<summary>Sample Data (1 rows)</summary>

```json
[
  {
    "id": "9509c873-99f2-43ab-a7f6-be5462ccea79",
    "user_id": null,
    "title": "Dr.",
    "first_name": "Rajesh",
    "last_name": "Patel",
    "email": "rajesh.patel@svit.ac.in",
    "phone": null,
    "avatar_url": null,
    "bio": "Senior Academician & Head of Computer Engineering with 20+ years of research in AI.",
    "office_hours": {},
    "social_links": {},
    "created_at": "2026-07-20T08:12:49.81178+00:00",
    "updated_at": "2026-07-20T09:12:19.740277+00:00",
    "created_by": null,
    "updated_by": null,
    "deleted_at": null,
    "deleted_by": null,
    "status": "published",
    "metadata": {}
  }
]
```

</details>

### `staff_publications`

**Rows:** 0  
**Columns:** 2

| Column | Type |
|--------|------|
| `publication_id` | string |
| `staff_id` | string |

### `student_clubs`

**Rows:** 0  
**Columns:** 15

| Column | Type |
|--------|------|
| `coordinator_id` | string (nullable) |
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `description` | string (nullable) |
| `id` | string |
| `logo_url` | string (nullable) |
| `metadata` | jsonb |
| `name` | string |
| `slug` | string |
| `status` | content_status (enum) |
| `student_coordinator_name` | string (nullable) |
| `updated_at` | string |
| `updated_by` | string (nullable) |

### `testimonials`

**Rows:** 0  
**Columns:** 14

| Column | Type |
|--------|------|
| `author_name` | string |
| `author_role` | string |
| `avatar_url` | string (nullable) |
| `company_or_institution` | string (nullable) |
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `id` | string |
| `metadata` | jsonb |
| `quote` | string |
| `status` | content_status (enum) |
| `updated_at` | string |
| `updated_by` | string (nullable) |

### `trusts`

**Rows:** 1  
**Columns:** 14

| Column | Type |
|--------|------|
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `id` | string |
| `logo_url` | string (nullable) |
| `metadata` | jsonb |
| `name` | string |
| `slug` | string |
| `sort_order` | number |
| `status` | content_status (enum) |
| `updated_at` | string |
| `updated_by` | string (nullable) |
| `website_url` | string (nullable) |

<details>
<summary>Sample Data (1 rows)</summary>

```json
[
  {
    "id": "cafe77d8-718f-40a9-8237-654425cccc8a",
    "name": "Mahapatra Education Trust",
    "slug": "mahapatra-trust",
    "logo_url": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=400&q=80",
    "website_url": null,
    "sort_order": 0,
    "created_at": "2026-07-20T08:12:46.96641+00:00",
    "updated_at": "2026-07-20T09:12:18.229819+00:00",
    "created_by": null,
    "updated_by": null,
    "deleted_at": null,
    "deleted_by": null,
    "status": "published",
    "metadata": {}
  }
]
```

</details>

### `user_profiles`

**Rows:** 0  
**Columns:** 13

| Column | Type |
|--------|------|
| `avatar_url` | string (nullable) |
| `bio` | string (nullable) |
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `first_name` | string (nullable) |
| `id` | string |
| `last_name` | string (nullable) |
| `metadata` | jsonb |
| `status` | content_status (enum) |
| `updated_at` | string |
| `updated_by` | string (nullable) |

### `user_roles`

**Rows:** 0  
**Columns:** 16

| Column | Type |
|--------|------|
| `college_id` | string (nullable) |
| `created_at` | string |
| `created_by` | string (nullable) |
| `deleted_at` | string (nullable) |
| `deleted_by` | string (nullable) |
| `department_id` | string (nullable) |
| `id` | string |
| `institute_id` | string (nullable) |
| `metadata` | jsonb |
| `role_id` | string |
| `scope_type` | scope_level (enum) |
| `status` | content_status (enum) |
| `trust_id` | string (nullable) |
| `updated_at` | string |
| `updated_by` | string (nullable) |
| `user_id` | string |

