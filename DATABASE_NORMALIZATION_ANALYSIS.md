# Database Normalization Analysis

## Executive Summary

The SVIT college website database has **49 tables with JSONB/JSON columns**, many of which store structured data that should be normalized into proper columns. This analysis identifies which metadata fields should be extracted and provides recommendations for schema improvements.

---

## Current State: Tables with JSONB Columns

| Table | JSONB Column(s) | Issue Level |
|-------|-----------------|-------------|
| `courses` | `metadata` | 🔴 High |
| `departments` | `metadata` | 🔴 High |
| `colleges` | `metadata` | 🔴 High |
| `staff_profiles` | `metadata`, `office_hours`, `social_links` | 🔴 High |
| `staff_department_assignments` | `metadata` | 🔴 High |
| `pages` | `metadata` | 🔴 High |
| `programmes` (courses subset) | `metadata` | 🔴 High |
| `events` | `metadata` | 🟡 Medium |
| `facilities` | `metadata` | 🟡 Medium |
| `student_clubs` | `metadata` | 🟡 Medium |
| `centers` | `metadata` | 🟡 Medium |
| `sports` | `metadata` | 🟡 Medium |
| `accreditations` | `metadata` | 🟡 Medium |
| `mous` | `metadata` | 🟡 Medium |
| `placement_cells` | `metadata` | 🟡 Medium |
| `contact_info` | `office_hours`, `social_links`, `metadata` | 🟡 Medium |
| `homepage_items` | `metadata` | 🟢 Low |
| `homepage_sections` | `config`, `metadata` | 🟢 Low |
| `homepage_widgets` | `config`, `metadata` | 🟢 Low |
| `menu_items` | `visibility_rules`, `metadata` | 🟢 Low |
| `seo_metadata` | `structured_data`, `metadata` | 🟢 Low |
| `inquiry_submissions` | `submitted_data`, `metadata` | 🟢 Low |
| `inquiry_forms` | `fields_config`, `metadata` | 🟢 Low |
| `audit_logs` | `old_values`, `new_values` | ✅ OK (audit) |
| `user_profiles` | `metadata` | ✅ OK (flexible) |
| `roles` | `metadata` | ✅ OK (flexible) |
| `permissions` | `metadata` | ✅ OK (flexible) |
| `user_roles` | `metadata` | ✅ OK (flexible) |
| `recruiters` | `metadata` | ✅ OK (flexible) |
| `testimonials` | `metadata` | ✅ OK (flexible) |
| `gallery_albums` | `metadata` | ✅ OK (flexible) |
| `gallery_media` | `metadata` | ✅ OK (flexible) |
| `downloads` | `metadata` | ✅ OK (flexible) |
| `achievements` | `metadata` | ✅ OK (flexible) |
| `department_activities` | `metadata` | ✅ OK (flexible) |
| `board_members` | `metadata` | ✅ OK (already has columns) |

---

## High Priority: Tables Requiring Normalization

### 1. `courses` table 🔴

**Current JSONB fields in `metadata`:**
```typescript
metadata: {
  description?: string;
  duration?: string;
  eligibility?: string;
  intake?: string;           // ⚠️ Already have `intake` column now
  shortName?: string;
  yearStarted?: number;
  durationYears?: number;
  isProgramme?: boolean;     // Used to filter programme-level entries
  slug?: string;
  tagline?: string;
  short?: string;
  fullName?: string;
  color?: string;
  accent?: string;
  outcomes?: string[];
  highlights?: string[];
}
```

**Recommended new columns:**
| Column | Type | Notes |
|--------|------|-------|
| `description` | `text` | Course description |
| `duration` | `text` | e.g. "4 years", "2 years" |
| `eligibility` | `text` | Eligibility criteria |
| `short_name` | `text` | Abbreviated name |
| `year_started` | `integer` | Year course was introduced |
| `duration_years` | `integer` | Numeric duration for sorting/filtering |
| `is_programme` | `boolean` | `false` for regular courses, `true` for programme entries |
| `programme_slug` | `text` | Slug for programme-level entries |
| `tagline` | `text` | Marketing tagline |
| `full_name` | `text` | Full official name |
| `color` | `text` | Theme color hex |
| `accent` | `text` | Accent color hex |

**Keep in JSONB:**
- `outcomes` (array) — varies per course
- `highlights` (array) — marketing bullets
- Any truly flexible/extension fields

---

### 2. `departments` table 🔴

**Current JSONB fields in `metadata`:**
```typescript
metadata: {
  about?: string;
  description?: string;
  vision?: string;
  mission?: string | string[];
  intake_ug?: number;
  intake_pg?: number;
  established?: number;
  level?: string;           // "UG", "PG", etc.
  degreeType?: string;      // "BE", "M.Tech", etc.
  engSlug?: string;         // Engineering department URL slug
  short?: string;           // Short name
  color?: string;           // Theme color
  overview?: string;
  labs?: string[];          // List of lab names
  careers?: string[];       // Career opportunities
}
```

**Recommended new columns:**
| Column | Type | Notes |
|--------|------|-------|
| `about` | `text` | Department description |
| `vision` | `text` | Vision statement |
| `mission` | `text` | Mission statement (if array, join with \n) |
| `intake_ug` | `integer` | UG intake capacity |
| `intake_pg` | `integer` | PG intake capacity |
| `established_year` | `integer` | Year department was established |
| `level` | `text` | "UG", "PG", "Diploma", etc. |
| `degree_type` | `text` | "BE", "B.Tech", "M.Tech", etc. |
| `short_name` | `text` | Abbreviated name |
| `theme_color` | `text` | Theme color hex |
| `overview` | `text` | Extended overview |

**Keep in JSONB:**
- `labs` (array) — list of lab names
- `careers` (array) — career paths

**Note:** `engSlug` should be replaced with proper URL routing based on `slug` column.

---

### 3. `colleges` table 🔴

**Current JSONB fields in `metadata`:**
```typescript
metadata: {
  shortCode?: string;       // e.g. "SVIT", "SVICA", "SVION"
  tagline?: string;
  hero?: {
    kicker?: string;
    subhead?: string;
  };
}
```

**Recommended new columns:**
| Column | Type | Notes |
|--------|------|-------|
| `short_code` | `text` | Already exists as `code` column — use that instead |
| `tagline` | `text` | College tagline |
| `hero_kicker` | `text` | Hero section kicker text |
| `hero_subhead` | `text` | Hero section subhead |

**Action:** Remove `shortCode` from metadata (redundant with `code` column).

---

### 4. `staff_profiles` table 🔴

**Current JSONB fields:**
```typescript
// In metadata:
{
  employeeCode?: string;    // ⚠️ Critical for lookups
  designation?: string;     // Fallback designation
  rankGroup?: string;       // "HOD", "Professor", "Support", etc.
  photoUrl?: string;        // Already have photo_url column?
}

// Separate JSONB columns:
office_hours: { day: string; time: string }[];
social_links: { linkedin?: string; googleScholar?: string; orcid?: string };
```

**Recommended new columns:**
| Column | Type | Notes |
|--------|------|-------|
| `employee_code` | `text` | **UNIQUE** — used for staff lookups |
| `photo_url` | `text` | Check if already exists |
| `rank_group` | `text` | "HOD", "Professor", "Associate Professor", "Support" |

**Keep as JSONB:**
- `office_hours` — semi-structured, varies per faculty
- `social_links` — optional, varies per person
- `metadata` for truly flexible fields

**Also normalize `staff_department_assignments`:**
| Column | Type | Notes |
|--------|------|-------|
| `rank_group` | `text` | Should move here from metadata |
| `designation_override` | `text` | If different from designation table |

---

### 5. `pages` table 🔴

**Current usage:**
```typescript
// pages.metadata stores ENTIRE page content as nested JSONB
{
  hero: { accent, title, introText, portraitUrl };
  quickFacts: { label, value }[];
  coreValues: string[];
  history: { introText, milestones, closingText };
  vision: { visionText };
  mission: { missionPoints };
  leadership: { intro, chairman, principal, boardOfManagement };
  accreditation: { recognitions, nbaText, nirfText, ... };
  facilities: { intro, library, scholarships, sports, ... };
  media: { intro, publications, socialMedia };
  contact: { address, phone, email, website };
}
```

**This is the WORST offender** — entire page content is stored as deeply nested JSONB.

**Recommended approach:**

**Option A: Keep JSONB but with proper types (recommended for CMS pages)**
- Page content is highly variable and editorial
- JSONB provides flexibility for different page types
- Add TypeScript validation at the application layer
- Create a `page_type` column to distinguish schemas

**Option B: Normalize into separate tables (complex)**
- Create `page_sections` table with `page_id`, `section_type`, `content` (JSONB)
- Create `page_hero` table
- Create `page_leadership` table
- This is overkill for a CMS

**Recommendation:** Keep JSONB but add:
| Column | Type | Notes |
|--------|------|-------|
| `page_type` | `text` | "about", "alumni", "contact", etc. |
| `schema_version` | `integer` | For future migrations |

---

### 6. `programmes` (subset of courses) 🔴

The `programmes.functions.ts` queries `courses` table with `metadata->>isProgramme = 'true'`. This is a **code smell** — using metadata as a discriminator.

**Recommendation:**
- Add `is_programme` boolean column to `courses` table
- Index it for efficient filtering
- Migrate existing data

---

### 7. `events` table 🟡

**Current JSONB:**
```typescript
metadata: {
  accent?: string;
  subtitle?: string;
  highlights?: { title: string; description: string }[];
}
```

**Recommended new columns:**
| Column | Type | Notes |
|--------|------|-------|
| `subtitle` | `text` | Event subtitle |
| `accent_color` | `text` | Theme color |

**Keep in JSONB:** `highlights` array

---

### 8. `facilities` table 🟡

**Current JSONB:**
```typescript
metadata: {
  subtitle?: string;
  accent?: string;
  description?: string;
  category?: string;        // Should be enum column
  highlights?: { title, description }[];
}
```

**Recommended new columns:**
| Column | Type | Notes |
|--------|------|-------|
| `subtitle` | `text` | Facility subtitle |
| `description` | `text` | Full description |
| `category` | `text` | Or ENUM: 'academic', 'sports', 'residential', 'support' |
| `accent_color` | `text` | Theme color |

---

### 9. `student_clubs` / `centers` tables 🟡

**Same pattern:**
```typescript
metadata: {
  subtitle?: string;
  accent?: string;
  highlights?: { title, description }[];
}
```

**Recommended new columns:**
| Column | Type |
|--------|------|
| `subtitle` | `text` |
| `description` | `text` |
| `accent_color` | `text` |

---

### 10. `sports` table 🟡

**Current JSONB:**
```typescript
metadata: {
  players_count?: number;
  coach?: string;
  coach_image_url?: string;
  achievements_count?: number;
}
```

**Recommended new columns:**
| Column | Type | Notes |
|--------|------|-------|
| `players_count` | `integer` | Number of players |
| `coach_name` | `text` | Coach name |
| `coach_image_url` | `text` | Coach photo |
| `achievements_count` | `integer` | Denormalized count |

---

### 11. `accreditations` table 🟡

**Current JSONB:**
```typescript
metadata: {
  body?: string;            // Accreditation body name
  description?: string;
  document_url?: string;
}
```

**Recommended new columns:**
| Column | Type | Notes |
|--------|------|-------|
| `accreditation_body` | `text` | Already have `organization` column? |
| `description` | `text` | Full description |
| `document_url` | `text` | Link to certificate |

---

### 12. `mous` table 🟡

**Current JSONB:**
```typescript
metadata: {
  activities?: string[];
  department?: string;      // Should be FK to departments
  location?: string;
}
```

**Recommended changes:**
| Column | Type | Notes |
|--------|------|-------|
| `department_id` | `uuid` | FK to departments (replace `department` string) |
| `location` | `text` | City/country of partner |
| `activities` | `text[]` | Array of activity types |

---

### 13. `contact_info` table 🟡

**Current JSONB:**
```typescript
office_hours: { weekdays?, saturday?, sunday? };
social_links: { linkedin?, facebook?, twitter?, ... };
metadata: { name?, fullName?, website? };
```

**Recommended new columns:**
| Column | Type | Notes |
|--------|------|-------|
| `institute_name` | `text` | Already have `name` in metadata |
| `full_name` | `text` | Official name |
| `website_url` | `text` | Already have `website` in metadata |

**Keep as JSONB:**
- `office_hours` — structured but variable
- `social_links` — platform keys vary

---

### 14. `placement_cells` table 🟡

**Current JSONB in `metadata`:**
```typescript
{
  highlights?: { id, icon, label }[];
  sections?: { about, trend, placedStudents, recruiters, officer, testimonials };
  order?: string[];
  testimonials?: { id, name, company, quote, image }[];
}
```

This is complex configuration data that's editorial. **Recommendation: Keep as JSONB** but ensure proper TypeScript types and validation.

---

## Tables Where JSONB is Appropriate ✅

These tables use JSONB correctly for flexible/extension data:

| Table | Reason |
|-------|--------|
| `audit_logs` | `old_values`/`new_values` must be flexible for any table |
| `user_profiles` | User preferences, settings, extensions |
| `roles` / `permissions` | Flexible permission metadata |
| `inquiry_submissions` | Dynamic form data |
| `inquiry_forms` | Form field configuration |
| `seo_metadata` | Structured data varies by page type |
| `homepage_sections` / `homepage_widgets` | Layout configuration |
| `menu_items` | Visibility rules are complex |
| `gallery_albums` / `gallery_media` | Optional metadata |
| `testimonials` | Flexible quote metadata |
| `downloads` | File metadata varies |
| `recruiters` | Company details, optional fields |
| `achievements` | Achievement details vary |
| `board_members` | Already has proper columns, metadata for extensions |

---

## Migration Strategy

### Phase 1: Critical Tables (courses, departments, colleges)
1. Create new columns
2. Backfill from JSONB: `UPDATE courses SET description = metadata->>'description'`
3. Update TypeScript interfaces
4. Update all server functions
5. Update admin CRUD forms
6. Remove from JSONB after verification

### Phase 2: Staff & Pages
1. `staff_profiles` — add `employee_code`, `rank_group`
2. `pages` — add `page_type`, `schema_version`, consider normalization
3. Update lookup functions

### Phase 3: Content Tables
1. `events`, `facilities`, `student_clubs`, `centers`, `sports`
2. Add common columns: `subtitle`, `description`, `accent_color`

### Phase 4: Remaining
1. `accreditations`, `mous`, `contact_info`
2. Clean up redundant data

---

## Quick Wins (Immediate Actions)

### 1. Remove redundant `metadata.intake` from courses
Already have `intake` column. Clean up:
```sql
UPDATE courses SET metadata = metadata - 'intake' WHERE metadata ? 'intake';
```

### 2. Add `is_programme` column to courses
```sql
ALTER TABLE courses ADD COLUMN is_programme boolean DEFAULT false;
UPDATE courses SET is_programme = (metadata->>'isProgramme')::boolean WHERE metadata->>'isProgramme' IS NOT NULL;
CREATE INDEX idx_courses_is_programme ON courses(is_programme) WHERE is_programme = true;
```

### 3. Add `employee_code` to staff_profiles
```sql
ALTER TABLE staff_profiles ADD COLUMN employee_code text UNIQUE;
UPDATE staff_profiles SET employee_code = metadata->>'employeeCode' WHERE metadata->>'employeeCode' IS NOT NULL;
CREATE INDEX idx_staff_employee_code ON staff_profiles(employee_code);
```

### 4. Add `tagline` to colleges
```sql
ALTER TABLE colleges ADD COLUMN tagline text;
UPDATE colleges SET tagline = metadata->>'tagline' WHERE metadata->>'tagline' IS NOT NULL;
```

---

## Summary Statistics

| Category | Count |
|----------|-------|
| Tables with JSONB | 49 |
| High priority to normalize | 6 |
| Medium priority | 8 |
| OK to keep JSONB | 35 |
| Estimated new columns needed | ~40 |
| Quick wins | 4 |

---

## Questions for Discussion

1. **Programmes vs Courses:** Should programmes be a separate table, or keep using `courses.is_programme = true`?

2. **Pages table:** Do you want full normalization (page_sections table) or keep JSONB with better typing?

3. **Staff data:** Should `rank_group` be an ENUM or text? Values observed: "HOD", "Professor", "Associate Professor", "Assistant Professor", "Support"

4. **Facility categories:** Should `facilities.category` be an ENUM? What are the valid values?

5. **Migration approach:** Do you want to do this incrementally (per table) or all at once?

6. **Backward compatibility:** Should we keep old metadata fields during transition, or remove immediately after migration?
