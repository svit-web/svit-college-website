# SVIT College Website — Full Codebase Context for Admin Panel Design

> Generated from 5 parallel agents exploring the entire frontend codebase
> Date: 2026-07-21

---

## 1. Project Identity

| Attribute | Value |
|-----------|-------|
| Name | `tanstack_start_ts` — SVIT Vasad College Website |
| Framework | **TanStack Start** (SSR React 19 on Vite 8) |
| Router | TanStack Router v1 (file-based, auto-generated route tree) |
| Server State | TanStack React Query v5 |
| Client State | **None currently** (no Zustand, no Redux) |
| Styling | Tailwind CSS v4 + Shadcn/ui (New York) + `tw-animate-css` |
| Forms | react-hook-form + zod + @hookform/resolvers |
| Animation | Framer Motion v12 |
| Icons | Lucide React |
| Charts | Recharts (for placement) |
| Backend | Supabase (PostgreSQL, Auth, Storage) |
| Package Manager | Bun |
| Deployment | Lovable Cloud (`@lovable.dev/vite-tanstack-config`) |

---

## 2. Project Structure

```
C:\Users\Jwalin\dev\svit-college-website\
├── .env                          # Supabase env vars
├── src/
│   ├── assets/                   # Static images + JSON metadata
│   ├── components/
│   │   ├── site/                 # Business-level components (20 files)
│   │   └── ui/                   # Shadcn/ui primitives (46 files)
│   ├── data/                     # Static "CMS fallback" data (11 files)
│   ├── hooks/
│   │   ├── use-mobile.tsx        # Responsive breakpoint
│   │   └── useSupabaseData.ts    # 16 React Query hooks (664 lines)
│   ├── integrations/supabase/
│   │   ├── client.ts             # Client-side Supabase (anon key)
│   │   ├── client.server.ts      # Server admin client (service_role) [UNUSED]
│   │   ├── auth-attacher.ts      # Client fn middleware [REGISTERED]
│   │   ├── auth-middleware.ts     # JWT validation [UNUSED]
│   │   └── types.ts              # Generated DB types (1117 lines, ~21 tables)
│   ├── lib/
│   │   ├── homepage.functions.ts # 4 server functions [UNUSED]
│   │   ├── homepage.ts           # Query options [UNUSED]
│   │   ├── faculty.ts            # Mock faculty generator
│   │   ├── utils.ts              # cn() classname merger
│   │   ├── error-capture.ts      # SSR error capture
│   │   └── error-page.ts         # 500 error HTML
│   ├── routes/                   # 43 route files
│   ├── routeTree.gen.ts          # Auto-generated (935 lines)
│   ├── router.tsx                # Router factory
│   ├── server.ts                 # SSR entry
│   ├── start.ts                  # Start config
│   └── styles.css                # Tailwind v4 + theme tokens
├── supabase/
│   ├── config.toml
│   └── migrations/               # Existing migration
├── supabase-schema.md            # Full 52-table schema doc
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 3. All 43 Frontend Routes

| Route Path | File | Description |
|---|---|---|
| `/` | `index.tsx` | Homepage — hero, colleges, carousel, stats, why-choose, events, enquiry |
| `/about` | `about.tsx` | About SVIT — history, vision, mission, leadership, accreditation, committees |
| `/admissions` | `admissions.index.tsx` | Admissions info page |
| `/admissions/inquiry` | `admissions.inquiry.tsx` | Admissions enquiry form |
| `/alumni` | `alumni.tsx` | Alumni page |
| `/anti-ragging` | `anti-ragging.tsx` | Anti-ragging policy |
| `/campus` | `campus.tsx` | Campus overview |
| `/campus-life` | `campus-life.tsx` | Layout (sidebar + Outlet) |
| `/campus-life/` | `campus-life.index.tsx` | Campus Life overview |
| `/campus-life/facilities` | `campus-life.facilities.index.tsx` | Facilities index |
| `/campus-life/facilities/*` | `campus-life.facilities.$.tsx` | Facility detail (splat) |
| `/campus-life/events` | `campus-life.events.index.tsx` | Events index |
| `/campus-life/events/:slug` | `campus-life.events.$slug.tsx` | Event detail |
| `/campus-life/clubs` | `campus-life.clubs.index.tsx` | Clubs index |
| `/campus-life/clubs/:slug` | `campus-life.clubs.$slug.tsx` | Club detail |
| `/campus-life/centre` | `campus-life.centre.index.tsx` | Co-curricular centres index |
| `/campus-life/centre/:slug` | `campus-life.centre.$slug.tsx` | Centre detail |
| `/careers` | `careers.tsx` | Careers at SVIT |
| `/colleges` | `colleges.index.tsx` | All colleges listing |
| `/colleges/:college` | `colleges.$college.tsx` | College landing page (SVIT/SVICA/SVION/COA) |
| `/contact` | `contact.tsx` | Contact page |
| `/courses` | `courses.index.tsx` | All courses listing |
| `/courses/:course` | `courses.$course.tsx` | Course detail |
| `/courses/:course/faculty` | `courses.$course.faculty.tsx` | Faculty for a course |
| `/courses/engineering/:dept` | `courses.engineering.$dept.tsx` | Engineering dept course detail |
| `/courses/engineering/:dept/faculty` | `courses.engineering.$dept.faculty.tsx` | Faculty for eng dept |
| `/departments/:dept` | `departments.$dept.tsx` | Layout (sidebar + Outlet) |
| `/departments/:dept/` | `departments.$dept.index.tsx` | Dept about & programs |
| `/departments/:dept/staff` | `departments.$dept.staff.tsx` | Dept staff listing |
| `/departments/:dept/achievements` | `departments.$dept.achievements.tsx` | Dept achievements & clubs |
| `/departments/:dept/activities` | `departments.$dept.activities.tsx` | Dept activities & industry interaction |
| `/downloads` | `downloads.tsx` | Downloads page |
| `/grievance` | `grievance.tsx` | Grievance redressal |
| `/news` | `news.tsx` | News & events |
| `/parents` | `parents.tsx` | Parents information |
| `/placement` | `placement.index.tsx` | Placement overview |
| `/placement/:college` | `placement.$college.tsx` | Placement per college |
| `/programs/:program` | `programs.$program.tsx` | Program detail |
| `/staff/:staff` | `staff.$staff.tsx` | Individual staff profile |
| `/student-login` | `student-login.tsx` | Student login portal (static placeholder) |

---

## 4. Database Schema (52 Tables)

### 4.1 Custom ENUMs

| Enum | Values |
|------|--------|
| `content_status` | `'draft'`, `'published'`, `'archived'` |
| `degree_level` | `'undergraduate'`, `'graduate'`, `'doctorate'`, `'certificate'` |
| `event_status` | `'draft'`, `'published'`, `'cancelled'` |
| `facility_type` | `'campus'`, `'building'`, `'laboratory'` |
| `link_type` | `'internal'`, `'external'` |
| `scope_level` | `'global'`, `'trust'`, `'institute'`, `'college'`, `'department'` |
| `staff_type` | `'faculty'`, `'office_staff'` |
| `submission_status` | `'unread'`, `'read'`, `'replied'` |

### 4.2 Hierarchy Tables

| Table | Columns | FKs |
|-------|---------|-----|
| `trusts` | id, name, slug, logo_url, website_url, sort_order, *(audit)* | — |
| `institutes` | id, trust_id, name, slug, logo_url, website_url, sort_order, *(audit)* | → trusts |
| `colleges` | id, institute_id, name, slug, code, logo_url, website_url, sort_order, *(audit)* | → institutes |
| `departments` | id, college_id, name, slug, code, head_of_department_id, *(audit)* | → colleges, staff_profiles |

### 4.3 Academic Structure

| Table | Columns | FKs |
|-------|---------|-----|
| `courses` | id, department_id, name, code, degree_level, *(audit)* | → departments |
| `branches` | id, course_id, name, code, *(audit)* | → courses |
| `cells` | id, college_id, name, slug, *(audit)* | → colleges |
| `committees` | id, college_id, name, slug, *(audit)* | → colleges |
| `centers` | id, college_id, institute_id, name, slug, *(audit)* | → colleges, institutes |
| `facilities` | id, facility_type, parent_id, institute_id, department_id, name, slug, address, code, room_number, *(audit)* | self-ref, → institutes, → departments |

### 4.4 Users, Roles & Permissions

| Table | Columns | FKs |
|-------|---------|-----|
| `user_profiles` | id (→ auth.users), first_name, last_name, avatar_url, bio, *(audit)* | auth.users |
| `roles` | id, name, code, *(audit)* | — |
| `permissions` | id, name, code, *(audit)* | — |
| `role_permissions` | role_id, permission_id | → roles, → permissions |
| `user_roles` | id, user_id, role_id, scope_type, trust_id, institute_id, college_id, department_id, *(audit)* | → user_profiles, roles, trusts, institutes, colleges, departments |

### 4.5 Staff Tables

| Table | Columns | FKs |
|-------|---------|-----|
| `staff_profiles` | id, user_id, title, first_name, last_name, email, phone, avatar_url, bio, office_hours, social_links, *(audit)* | → user_profiles |
| `designations` | id, title, *(audit)* | — |
| `staff_department_assignments` | id, staff_id, department_id, designation_id, is_primary, *(audit)* | → staff_profiles, departments, designations |
| `qualifications` | id, staff_id, degree, institution, year, *(audit)* | → staff_profiles |
| `experiences` | id, staff_id, organization, role, start_date, end_date, is_academic, *(audit)* | → staff_profiles |
| `publications` | id, title, journal_conference, publish_date, doi_url, abstract, *(audit)* | — |
| `staff_publications` | staff_id, publication_id | → staff_profiles, publications |
| `research_projects` | id, title, funding_agency, amount, duration_years, project_status, principal_investigator_id, *(audit)* | → staff_profiles |
| `research_interests` | id, staff_id, interest_name, *(audit)* | → staff_profiles |
| `awards` | id, staff_id, title, awarding_body, received_year, description, *(audit)* | → staff_profiles |
| `patents` | id, staff_id, title, patent_number, patent_status, publication_date, inventors, *(audit)* | → staff_profiles |

### 4.6 Content Management

| Table | Columns | FKs |
|-------|---------|-----|
| `content_categories` | id, name, slug, module_type, *(audit)* | — |
| `posts` | id, scope_type, department_id, title, slug, summary, content, featured_image_url, category_id, is_featured, published_at, expires_at, seo_id, *(audit)* | → departments, content_categories, seo_metadata |
| `pages` | id, title, slug, content, parent_id, is_homepage, seo_id, *(audit)* | self-ref, → seo_metadata |
| `events` | id, scope_type, department_id, title, slug, description, tag, start_date, end_date, location, map_url, registration_link, featured_image_url, sort_order, seo_id, *(audit)* | → departments, seo_metadata |
| `achievements` | id, scope_type, department_id, title, slug, description, date, category, featured_image_url, *(audit)* | → departments |
| `downloads` | id, title, file_url, file_type, file_size, category, publish_date, *(audit)* | — |
| `contact_info` | id, address, phone, email, office_hours, map_iframe_url, social_links, *(audit)* | — |
| `seo_metadata` | id, meta_title, meta_description, meta_keywords, canonical_url, og_title, og_description, og_image_url, twitter_card, structured_data, robots_directives, *(audit)* | — |
| `redirects` | id, source_path, target_path, status_code, *(audit)* | — |
| `testimonials` | id, author_name, author_role, company_or_institution, quote, avatar_url, *(audit)* | — |

### 4.7 Homepage Builder

| Table | Columns | FKs |
|-------|---------|-----|
| `homepage_sections` | id, scope_type, department_id, title, section_type, sort_order, is_active, config, *(audit)* | → departments |
| `homepage_items` | id, scope_type, department_id, item_type, eyebrow, title, title_accent, subtitle, body, image_url, icon_name, link_href, link_label, secondary_link_href, secondary_link_label, sort_order, is_active, *(audit)* | → departments |
| `homepage_widgets` | id, section_id, title, widget_type, config, sort_order, *(audit)* | → homepage_sections |

### 4.8 Navigation

| Table | Columns | FKs |
|-------|---------|-----|
| `menus` | id, name, code, *(audit)* | — |
| `menu_items` | id, menu_id, parent_id, title, link_type, url, page_id, icon, sort_order, permissions_required, visibility_rules, *(audit)* | → menus, self-ref, → pages |

### 4.9 Media

| Table | Columns | FKs |
|-------|---------|-----|
| `media_folders` | id, scope_type, department_id, name, parent_id, *(audit)* | self-ref, → departments |
| `media_files` | id, scope_type, department_id, folder_id, filename, file_path, mime_type, file_size, alt_text, caption, tags, *(audit)* | → media_folders, → departments |
| `gallery_albums` | id, scope_type, department_id, title, slug, description, cover_image_url, *(audit)* | → departments |
| `gallery_media` | id, album_id, media_type, url, caption, sort_order, *(audit)* | → gallery_albums |

### 4.10 Placements & Recruitment

| Table | Columns | FKs |
|-------|---------|-----|
| `recruiters` | id, company_name, logo_url, website_url, sort_order, *(audit)* | — |
| `placement_statistics` | id, academic_year, total_students, placed_students, highest_package, average_package, recruiters_count, *(audit)* | — |
| `mous` | id, partner_organization, logo_url, purpose, signed_date, expiry_date, *(audit)* | — |
| `accreditations` | id, organization, value, received_year, expiry_date, *(audit)* | — |

### 4.11 Inquiry Forms

| Table | Columns | FKs |
|-------|---------|-----|
| `inquiry_forms` | id, form_name, fields_config, recipient_emails, *(audit)* | — |
| `inquiry_submissions` | id, form_id, submitted_data, status, notes, *(audit)* | → inquiry_forms |

### 4.12 Other

| Table | Columns | FKs |
|-------|---------|-----|
| `student_clubs` | id, name, slug, description, logo_url, coordinator_id, student_coordinator_name, *(audit)* | → staff_profiles |
| `audit_logs` | id, user_id, action, table_name, record_id, old_values, new_values, client_ip, user_agent, created_at | → user_profiles |

### 4.13 Common Audit Column Pattern

Every table except junction/audit tables has:
```sql
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
created_by uuid REFERENCES user_profiles(id),
updated_by uuid REFERENCES user_profiles(id),
deleted_at timestamptz,          -- soft delete
deleted_by uuid REFERENCES user_profiles(id),
status content_status DEFAULT 'published',
metadata jsonb DEFAULT '{}'
```

### 4.14 Conventions

- All `id` columns: `uuid DEFAULT gen_random_uuid()`
- Soft deletes: `deleted_at IS NULL` = active records
- Status enums where applicable
- `metadata` JSONB on all audit-tracked tables
- Slug validation: `^[a-z0-9]+(?:-[a-z0-9]+)*$`
- College codes: `^[A-Z0-9]+$`

---

## 5. Existing Supabase Integration

### 5.1 Client Setup

**Client-side** (`integrations/supabase/client.ts`):
- Lazy singleton via Proxy
- Uses `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY`
- Custom fetch for new API key format
- Auth: localStorage, persistSession, autoRefreshToken

**Server-side** (`integrations/supabase/client.server.ts`):
- Admin client with `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS)
- **Currently not imported anywhere**

### 5.2 Auth Middleware (unused)

- `auth-attacher.ts` — global client middleware that attaches Bearer token to server function RPCs
- `auth-middleware.ts` — validates JWT and returns authenticated Supabase client
- Both exist but are not actively used for any protected operations

### 5.3 Current React Query Hooks

File: `hooks/useSupabaseData.ts` (664 lines)

| Hook | Table(s) | Fallback |
|-------|----------|----------|
| `useSupabaseMenu(code)` | menus + menu_items | `null` |
| `useSupabaseInstitutes()` | institutes | `[]` |
| `useSupabaseColleges()` | colleges | `staticColleges` |
| `useSupabaseDepartments()` | departments | `staticDepartments` |
| `useSupabaseCourses()` | courses | `staticCourses` |
| `useSupabaseHomepageItems(type?)` | homepage_items | Varies by type |
| `useSupabaseRecruiters()` | recruiters | `staticRecruiters` |
| `useSupabaseEvents()` | events | `[]` |
| `useSupabasePosts()` | posts | `[]` |
| `useSupabaseStaffProfiles()` | staff_profiles | `staticStaff` |
| `useSupabasePlacementStats()` | placement_statistics | `null` |
| `useSupabaseFacilities(type?)` | facilities | Static academic/sports |
| `useSupabaseStudentClubs()` | student_clubs | `staticClubDetails` |
| `useSupabaseCenters()` | centers | `staticCentreDetails` |
| `useSupabaseDownloads()` | downloads | `null` |
| `useSubmitInquiry()` | inquiry_submissions (mutation) | Logs locally |

**Key characteristics:**
- All use `staleTime: 5000` (5 seconds — aggressive)
- No custom `gcTime` (default 5 min)
- No `refetchOnWindowFocus` configured (defaults to true)
- Every hook falls back to static data from `src/data/`
- With `placeholderData`, routes render static data instantly then update when Supabase responds
- Loading/error states are **never surfaced** to the user — errors are silently downgraded to static data

### 5.4 Server Functions (unused)

File: `lib/homepage.functions.ts`
- `getGlobalHomepageItems()` — homepage_items
- `getCollegesGrid()` — colleges
- `getRecruiterLogos()` — recruiters
- `getLatestEvents()` — events

These are exposed as `queryOptions` in `lib/homepage.ts` (staleTime: 60s) but **not consumed by any route**.

---

## 6. Current State Management

| Technique | Status |
|-----------|--------|
| TanStack React Query | ✅ Active — 16 hooks for server state |
| Zustand | ❌ Not installed |
| Redux / RTK | ❌ Not installed |
| SWR | ❌ Not installed |
| React Context | ✅ Only in shadcn/ui primitives (carousel, form, sidebar, chart) |
| TanStack Router context | ✅ Used for queryClient injection |

**All client state is local `useState`** — no store persists state across navigation.

---

## 7. UI Component Inventory (Shadcn/ui)

All 46 UI primitives exist in `components/ui/`. Key ones for admin panel:

| Component | File | Use in Admin |
|-----------|------|-------------|
| `Button` | `button.tsx` | CRUD actions, save, cancel |
| `Card` | `card.tsx` | Dashboard widgets, detail panels |
| `Input` | `input.tsx` | Text fields |
| `Textarea` | `textarea.tsx` | Long text / content |
| `Select` | `select.tsx` | Enum/foreign key dropdowns |
| `Checkbox` | `checkbox.tsx` | Boolean toggles |
| `Switch` | `switch.tsx` | Active/status toggles |
| `Dialog` | `dialog.tsx` | Confirm delete, quick edit |
| `Sheet` | `sheet.tsx` | Slide-in edit panel |
| `Popover` | `popover.tsx` | Quick actions |
| `DropdownMenu` | `dropdown-menu.tsx` | Row actions |
| `Tabs` | `tabs.tsx` | Tabbed record editors |
| `Table` | `table.tsx` | Data tables |
| `Form` | `form.tsx` | react-hook-form wrapper |
| `Badge` | `badge.tsx` | Status badges |
| `Skeleton` | `skeleton.tsx` | Loading states |
| `Breadcrumb` | `breadcrumb.tsx` | Navigation path |
| `Pagination` | `pagination.tsx` | Paginated data |
| `Sidebar` | `sidebar.tsx` | Admin sidebar (unused currently) |
| `Avatar` | `avatar.tsx` | User/staff avatars |
| `Command` | `command.tsx` | Quick search palette |
| `Separator` | `separator.tsx` | Visual dividers |
| `ScrollArea` | `scroll-area.tsx` | Scrollable tables/editors |
| `Sonner` | `sonner.tsx` | Toast notifications |
| `AlertDialog` | `alert-dialog.tsx` | Destructive confirmations |
| `Calendar` | `calendar.tsx` | Date pickers |
| `Chart` | `chart.tsx` | Dashboard charts |
| `Tooltip` | `tooltip.tsx` | Help hints |
| `Accordion` | `accordion.tsx` | Collapsible sections |
| `Toggle` | `toggle.tsx` | View mode switches |
| `Menubar` | `menubar.tsx` | Complex toolbar actions |
| `NavigationMenu` | `navigation-menu.tsx` | Admin top navigation |

---

## 8. Business Components That Will Be Rendered by Admin Data

These are the frontend components that consume database data. The admin panel writes to the same tables they read from.

| Component | File | Data Source |
|-----------|------|-------------|
| `Header` | `components/site/Header.tsx` | menus + menu_items |
| `Footer` | `components/site/Footer.tsx` | Static links + institutes |
| `HomeCarousel` | `components/site/Carousel.tsx` | homepage_items (type: "carousel_slide") |
| `HeroCardSlider` | `components/site/HeroCardSlider.tsx` | homepage_items (type: "highlight_card") |
| `CollegeLandingPage` | `components/site/CollegeLandingPage.tsx` | colleges, homepage_items, events, recruiters |
| `DepartmentLayout` | `components/site/DepartmentLayout.tsx` | departments |
| `DepartmentSections` | `components/site/DepartmentSections.tsx` | departments, staff_profiles |
| `FacultyGrid` | `components/site/FacultyGrid.tsx` | staff_profiles |
| `PlacementPage` | `components/site/PlacementPage.tsx` | placement_statistics, recruiters |
| `CampusLeafPage` | `components/site/CampusLeafPage.tsx` | facilities, student_clubs, centers, events |
| `PageHero` | `components/site/PageHero.tsx` | Static props from route |
| `CTABanner` | `components/site/CTABanner.tsx` | homepage_items (slot-based) |
| `PageHero` + `SectionHeading` | `components/site/*.tsx` | Across all routes |

---

## 9. Static Data Files (Current Fallbacks — Will Be Replaced by Admin)

| File | Exports | Replaces DB Table |
|------|---------|-------------------|
| `data/site.ts` | site, primaryNav, topNav, courses, engDepts, stats, whyChoose, events, recruiters | menus, menu_items, courses, homepage_items, events, recruiters |
| `data/colleges.ts` | colleges, collegeMap | colleges |
| `data/academics.ts` | departments, programs, degreeTypes | departments, courses |
| `data/placement.ts` | placementPages, placementDivisions | placement_statistics, recruiters |
| `data/heroHighlights.ts` | heroHighlights | homepage_items |
| `data/campus-rfe.ts` | academicFacilities, sportsFacilities, centreDetails, clubDetails, eventDetails | facilities, centers, student_clubs, events |
| `data/campus-life-nav.ts` | campusLifeNav | menus + menu_items |
| `data/staff.ts` | staff (3253 lines) | staff_profiles |
| `data/programDetails.ts` | programDetails | courses metadata |
| `data/departmentContent.ts` | departmentContent | departments (content fields) |
| `data/aboutPage.ts` | About page content | pages |
| `data/faculty.ts` | Deterministic mock faculty generator | staff_profiles |

---

## 10. Existing RLS & Migration State

Current RLS policies (from migration):
- `homepage_items`: `USING (is_active = true AND status = 'published')`
- `colleges`: `USING (true)`
- `recruiters`: `USING (true)`
- `events`: `USING (status = 'published')`
- `posts`: `USING (status = 'published')`
- Grants: `SELECT TO anon, authenticated` for all, `ALL TO service_role`

**No INSERT/UPDATE/DELETE policies exist** for any table (except service_role bypass).

---

## 11. Key Architectural Observations

1. **No admin panel exists** — all data is read-only from frontend, with static fallbacks
2. **No user-facing auth** — student-login is a static placeholder
3. **Only 1 mutation** exists in the entire codebase (inquiry form submission)
4. **Zustand not installed** — all state is local useState or React Query
5. **Server functions are unused** — infrastructure exists but not consumed
6. **TypeScript types are incomplete** — only ~21 of 52 tables are typed
7. **No optimized re-renders** — staleTime is 5s across all hooks, no selectors, no memoization
8. **Sidebar shadcn component exists but is unused** — ready for admin layout
9. **Dual data pattern** — static files = instant render, Supabase = live overlay
10. **Soft deletes everywhere** — `deleted_at` pattern on all content tables

---

## 12. Zustand Store Design (To Be Built)

Following LobeHub conventions from the zustand skill:

```
src/store/
├── index.ts                 → Root store creation + exports
├── initialState.ts          → Aggregate all slice initial states
├── selectors.ts             → Aggregate all slice selectors
└── slices/
    ├── auth/
    │   ├── initialState.ts  → user, session, permissions, isAuthenticated
    │   ├── action.ts        → login, logout, refreshSession, checkPermission
    │   └── selectors.ts     → isAdmin, hasPermission, currentUser
    ├── admin/
    │   ├── initialState.ts  → currentTable, selectedRowIds, editMode, filters
    │   ├── action.ts        → setTable, setFilters, toggleRowSelection
    │   └── selectors.ts     → isEditing, currentSelection
    └── ui/
        ├── initialState.ts  → sidebarOpen, activeSection, theme
        ├── action.ts        → toggleSidebar, setActiveSection
        └── selectors.ts     → isSidebarOpen, currentNavPath
```

Key principles:
- Zustand holds only cross-cutting state (auth, UI layout, active table metadata)
- Form state stays local in react-hook-form
- Server data stays in React Query cache
- Use `subscribeWithSelector` + `shallow` for min re-renders
- Class-based action pattern with `ActionImpl` classes

---

## 13. Generic CRUD Engine (To Be Built)

Core concept: a configuration-driven system that works with any table.

```typescript
interface TableConfig {
  name: string;            // Supabase table name
  label: string;           // Human-readable (e.g., "Departments")
  icon: string;            // Lucide icon name
  columns: ColumnConfig[]; // Column definitions for table + form
  searchFields?: string[]; // Fields to search against
  defaultSort?: string;    // Default sort column
  hiddenColumns?: string[];// Columns to hide in table view
  relations?: Relation[];  // FK relations for lookup selects
  permissions?: string[];  // Required permissions
  enableSoftDelete?: boolean; // Use deleted_at instead of hard delete
  enableAudit?: boolean;   // Log changes to audit_logs
}
```

Components:
- `GenericDataTable` — renders any table with sort, filter, pagination, row selection
- `GenericForm` — auto-generates form fields from table schema + config
- `GenericDetailPanel` — view record with field values rendered appropriately

---

## 14. Admin Routes Plan

```
/admin                       → redirect → /admin/dashboard
/admin/login                 → Login page (Supabase Auth)

/admin/dashboard             → Stats, recent activity, quick actions

/admin/cms/:table            → Generic data table list
/admin/cms/:table/new        → Create record
/admin/cms/:table/:id        → View record
/admin/cms/:table/:id/edit   → Edit record

/admin/menus                 → Menu listing
/admin/menus/:id             → Visual menu tree editor

/admin/homepage              → Section listing
/admin/homepage/sections/:id → Section editor with items/widgets

/admin/pages                 → Page CRUD (tree view for hierarchy)
/admin/posts                 → Post CRUD
/admin/events                → Event CRUD

/admin/media                 → Media library (folders + files)
/admin/gallery               → Gallery albums + media

/admin/staff                 → Staff profile CRUD
/admin/staff/:id             → Complete staff editor (profile, qualifications, etc.)

/admin/users                 → User CRUD
/admin/roles                 → Role + permission management

/admin/placement             → Placement stats CRUD
/admin/recruiters            → Recruiter CRUD
/admin/mous                  → MoU CRUD
/admin/accreditations        → Accreditation CRUD

/admin/downloads             → Download CRUD
/admin/testimonials          → Testimonial CRUD
/admin/redirects             → Redirect CRUD
/admin/seo                   → SEO metadata management

/admin/inquiry-forms         → Form builder
/admin/inquiry-submissions   → View submissions

/admin/audit-log             → Read-only audit trail viewer

/admin/trusts                → Trust CRUD
/admin/institutes            → Institute CRUD
/admin/colleges              → College CRUD
/admin/departments           → Department CRUD
/admin/courses               → Course CRUD
/admin/branches              → Branch CRUD
/admin/cells                 → Cell CRUD
/admin/committees            → Committee CRUD
/admin/centers               → Center CRUD
/admin/facilities            → Facility CRUD (tree)
/admin/clubs                 → Student club CRUD

/admin/content-categories    → Content category CRUD
/admin/settings              → Site settings
```

---

## 15. Implementation Phases

| Phase | Scope | Depends On |
|-------|-------|------------|
| **P1** | Auth + layout shell (install Zustand, admin login, sidebar layout, auth slice) | — |
| **P2** | Generic CRUD engine (DataTable, GenericForm, tableConfigs.ts, 5-6 core tables) | P1 |
| **P3** | Menu builder (visual tree editor for menus + menu_items) | P2 |
| **P4** | Homepage builder (section, item, widget editors) | P2 |
| **P5** | Media library (folder tree, file upload, gallery albums) | P2 |
| **P6** | Content management (posts, events, pages, downloads, seo, redirects) | P2 |
| **P7** | Staff management (full profile editor with qualifications, experience, etc.) | P2 |
| **P8** | User & role management (user list, role assignment, permission grid) | P1 |
| **P9** | Placement & misc (stats, recruiters, MoUs, accreditations, clubs, committees) | P2 |
| **P10** | Polish (audit log viewer, dashboard stats, error boundaries, loading skeletons, RLS policies) | All |

---

## 16. Performance Strategy

| Concern | Solution |
|---------|----------|
| Unnecessary re-renders from Zustand | `subscribeWithSelector` + `shallow` equality, selectors returning primitives |
| Unnecessary re-fetches | Increase `staleTime` to 30s for admin queries |
| Large tables (e.g., staff_profiles: 3k+ rows) | Server-side pagination via Supabase `.range()` |
| Form state causing re-renders | Keep in react-hook-form (local state), not in Zustand |
| Table row re-renders | React.memo + virtualized rows (react-virtual) for large datasets |
| Debounced search | 300ms debounce on search inputs before querying |
| Optimistic updates | Zustand optimistic pattern for CRUD writes, then invalidate query |
| Avoid layout shift | Skeleton placeholders for all async data |
| Image loading | Lazy loading for media library thumbnails |

---

## 17. TypeScript Types Gap

The generated `integrations/supabase/types.ts` only covers ~21 tables. Missing tables that need types added:

- `cells`, `committees`, `centers`, `facilities`, `roles`, `permissions`, `user_roles`, `pages`, `menu_items`, `menus`, `content_categories`, `achievements`, `contact_info`, `seo_metadata`, `redirects`, `testimonials`, `student_clubs`, `mous`, `accreditations`, `research_projects`, `research_interests`, `awards`, `patents`, `experiences`, `qualifications`, `publications`, `staff_publications`, `gallery_albums`, `gallery_media`, `media_folders`, `media_files`, `homepage_widgets`, `inquiry_forms`, `inquiry_submissions`, `placement_statistics`, `downloads`, `branches`, `trusts`, `institutes`

**Action:** Regenerate Supabase types or manually add the missing table definitions before building the admin panel.

---

## 18. Existing Dependencies (package.json)

```json
{
  "dependencies": {
    "@hookform/resolvers": "^*",
    "@radix-ui/*": "~30 packages",
    "@supabase/supabase-js": "^2.49.4",
    "@tanstack/react-form": "^1.2.0",
    "@tanstack/react-query": "^5.101.1",
    "@tanstack/react-router": "^1.170.16",
    "@tanstack/react-start": "^1.168.26",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "embla-carousel-react": "^8.6.0",
    "framer-motion": "^12.9.2",
    "lucide-react": "^0.487.0",
    "react": "^19.1.0",
    "react-day-picker": "^9.6.6",
    "react-dom": "^19.1.0",
    "react-hook-form": "^7.55.1",
    "recharts": "^2.15.3",
    "sonner": "^2.0.3",
    "tailwind-merge": "^3.2.0",
    "tw-animate-css": "^1.2.9",
    "vaul": "^1.1.2",
    "zod": "^3.24.3"
  },
  "devDependencies": {
    "@lovable.dev/vite-tanstack-config": "^0.13.10",
    "@tailwindcss/vite": "^4.1.6",
    "@types/react": "^19.1.4",
    "@types/react-dom": "^19.1.5",
    "eslint": "^9.26.0",
    "nitro": "^2.11.9",
    "prettier": "^3.5.3",
    "tailwindcss": "^4.1.6",
    "typescript": "~5.8.3",
    "vite": "^8.1.0",
    "vite-tsconfig-paths": "^5.1.4"
  }
}
```

**Needs adding:** `zustand`
