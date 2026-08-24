# Migration Plan: Static Data → Supabase Cloud

**Last Updated**: 2026-07-23 09:02 UTC
**Branch**: `test`
**Strategy**: Table-by-table migration with full SSR, no fallbacks

---

## Overview

Migrate SVIT college website from static TypeScript data files (`src/data/*.ts`) to dynamic Supabase-backed content. Work table-by-table: seed data → create server functions → update pages → verify → remove static files.

---

## Recent Updates (2026-07-23)

### ✅ MAJOR FIX: Clubs Index Page Rendering Issue
**Problem**: Clubs page showed empty grid, 0 clubs loaded
**Root Cause**: Missing RLS policy - `student_clubs` table had no "Anon SELECT" policy for public access
**Solution**: Added `CREATE POLICY "Anon SELECT" ON student_clubs FOR SELECT TO anon USING (true);`
**Result**: All 4 clubs now load correctly on clubs index page

### ✅ NEW FEATURE: Featured Content System
**Added**: `featured` boolean column to `student_clubs` table
**Purpose**: Distinguish between menu bar/highlight items vs full list items
**Implementation**:
- Created `getFeaturedStudentClubs()` server function
- Updated Header component to use dynamic featured clubs (removed static data)
- Marked all 4 current clubs as featured
**Benefits**: Menu bar now matches database, scalable for future growth

---

## Seeding Status

### ✅ Completed (2026-07-22)

| Table | Count | Source | Notes |
|-------|-------|--------|-------|
| trusts | 2 | - | NEST trust |
| institutes | 2 | - | SVIT Group |
| colleges | 4 | `colleges.ts` | SVIT, SVICA, SVION, COA |
| departments | 20 | `academics.ts` | All departments across colleges |
| courses | 25 | `academics.ts` | All programs/degrees |
| committees | 5 | `aboutPage.ts` | WDC, Grievance, Sexual Harassment, Anti-Ragging, IQAC |
| accreditations | 4 | `aboutPage.ts` | NBA, AICTE, GTU, NIRF |
| placement_statistics | 6 | `placement.ts` | 2019-2025 data, multi-college in metadata |
| centers | 8 | `campus-rfe.ts` | GDG, CoE, ISTE, IIPC, EDC, SSIP, etc. |
| student_clubs | 4 | `campus-rfe.ts` | Praxis, AIMS, Apexia, CircuitX |
| facilities | 13 | `campus-rfe.ts` | Academic + sports facilities |

### 🔲 Not Yet Seeded

| Table | Source | Priority | Notes |
|-------|--------|----------|-------|
| staff_profiles | `staff.ts` | High | Large file (26k+ tokens), HODs + Faculty + Support |
| campus_events | - | Medium | Need to check if static data exists |
| news_posts | - | Medium | Need to check if static data exists |
| downloads | - | Low | Files/documents section |
| admissions_inquiries | - | Low | Form submissions (empty initially) |
| contact_submissions | - | Low | Form submissions (empty initially) |
| recruiters | `placement.ts` | Medium | Company logos for placement page |

---

## Dynamic Implementation Status

### Phase 1: Foundation Tables

#### 1. ✅ Committees (About Page) - COMPLETED 2026-07-23
- [✅] **Server Function**: `src/lib/committees.functions.ts`
- [✅] **Update Pages**: About page using dynamic data
- [✅] **Test**: All 5 committees rendering
- [🔲] **Cleanup**: Remove committee exports from `src/data/aboutPage.ts`

#### 2. ✅ Accreditations (About Page) - COMPLETED 2026-07-23
- [✅] **Server Function**: `src/lib/accreditations.functions.ts`
- [✅] **Update Pages**: About page using dynamic data
- [✅] **Test**: All 4 accreditations (NBA, AICTE, GTU, NIRF) rendering
- [🔲] **Cleanup**: Remove accreditation exports from `src/data/aboutPage.ts`

#### 3. ✅ Student Clubs (Campus Life) - COMPLETED 2026-07-23
- [✅] **Server Function**: `src/lib/clubs.functions.ts`
  - getAllStudentClubs() - for clubs page
  - getFeaturedStudentClubs() - for menu bar
  - getStudentClubBySlug() - for detail pages
- [✅] **Update Pages**: Index + detail pages using dynamic data
- [✅] **Test**: All 4 clubs rendering on both index and detail pages
- [✅] **Header Integration**: Menu bar now uses dynamic featured clubs
- [✅] **RLS Fix**: Added "Anon SELECT" policy for public access
- [✅] **Featured System**: Added featured column and logic
- [🔲] **Cleanup**: Remove club exports from `src/data/campus-rfe.ts`

#### 4. ✅ Centers (Campus Life) - COMPLETED 2026-07-23
- [✅] **Server Function**: `src/lib/centers.functions.ts`
- [✅] **Update Pages**: Index + detail pages using dynamic data
- [✅] **Test**: All 8 centers rendering
- [🔲] **Cleanup**: Remove center exports from `src/data/campus-rfe.ts`

#### 5. 🔲 Facilities (Campus Life)
- [ ] **Server Function**: Create `src/lib/facilities.functions.ts`
- [ ] **Update Pages**: Replace static imports in campus life pages
- [ ] **Test**: Verify facilities display correctly (academic + sports)
- [ ] **Cleanup**: Remove facility exports from `src/data/campus-rfe.ts`

### Phase 2: Academic Hierarchy

#### 6. 🔲 Departments (Academics Pages)
- [ ] **Server Function**: Create `src/lib/departments.functions.ts`
- [ ] **Update Pages**: Replace static imports across all academic pages
- [ ] **Test**: Verify department listings and filtering work
- [ ] **Cleanup**: Remove department exports from `src/data/academics.ts`

#### 7. 🔲 Courses (Academics Pages)
- [ ] **Server Function**: Create `src/lib/courses.functions.ts`
- [ ] **Update Pages**: Replace static imports in program/course pages
- [ ] **Test**: Verify course listings by department/college work
- [ ] **Cleanup**: Remove program exports from `src/data/academics.ts`

### Phase 3: Placement & Stats

#### 8. 🔲 Placement Statistics (Placement Pages)
- [ ] **Server Function**: Create `src/lib/placement.functions.ts`
- [ ] **Update Pages**: Replace static imports in all 4 college placement pages
- [ ] **Test**: Verify yearly stats + graphs display for each college
- [ ] **Cleanup**: Remove placement exports from `src/data/placement.ts`

#### 9. 🔲 Recruiters (Placement Pages)
- [ ] **Seed Data**: Extract from `placement.ts` and seed to `recruiters` table
- [ ] **Server Function**: Add recruiter queries to `src/lib/placement.functions.ts`
- [ ] **Update Pages**: Replace static recruiter logos
- [ ] **Cleanup**: Remove recruiter exports from `src/data/placement.ts`

### Phase 4: Staff Profiles (Large Dataset)

#### 10. 🔲 Staff Profiles (Staff Directory)
- [ ] **Seed Data**: Process `staff.ts` (26k+ tokens) and seed to `staff_profiles`
- [ ] **Server Function**: Create `src/lib/staff.functions.ts`
- [ ] **Update Pages**: Replace static imports in faculty/staff pages
- [ ] **Test**: Verify staff listings by department work
- [ ] **Cleanup**: Remove `src/data/staff.ts`

### Phase 5: Dynamic Content (Optional)

#### 11. 🔲 Campus Events
- [ ] Check if static data exists
- [ ] Seed if needed
- [ ] Create server functions
- [ ] Update pages

#### 12. 🔲 News Posts
- [ ] Check if static data exists
- [ ] Seed if needed
- [ ] Create server functions
- [ ] Update pages

---

## Important Notes

### Database Schema Rules
- **DO NOT modify schema** - adapt frontend to match existing database
- Use `metadata` JSONB column for extended attributes
- Enum mappings:
  - Degree level: `undergraduate`, `graduate`, `doctorate`, `certificate` (not `UG`/`PG`/`Diploma`)
  - Status: `draft`, `published`, `archived`

### Multi-College Architecture
- Trust → Institute → Colleges → Departments → Courses
- Some tables have `college_id`, some have `institute_id`
- Placement stats store per-college data in `metadata.colleges` due to unique constraint on `academic_year`

### SSR & No Fallbacks
- Everything uses `createServerFn()` for SSR
- NO client-side fallbacks - if data missing, page shows blank
- This makes bugs obvious during development
- Fix by ensuring data exists in Supabase

### Row Level Security (RLS)
- **CRITICAL**: All public-facing tables need "Anon SELECT" policy
- Pattern: `CREATE POLICY "Anon SELECT" ON <table> FOR SELECT TO anon USING (true);`
- Already applied to: committees, accreditations, centers, student_clubs
- Need to verify for: facilities, departments, courses, etc.

### Featured Content System
- Use `featured` boolean column to distinguish menu/highlight items from full lists
- Pattern:
  1. Add column: `ALTER TABLE <table> ADD COLUMN featured boolean DEFAULT false;`
  2. Mark items: `UPDATE <table> SET featured = true WHERE slug IN (...);`
  3. Create function: `getFeatured<Table>()` with `.eq('featured', true)`
  4. Use in menus/home page while keeping full list on dedicated page

---

## Progress Tracking

**Current Phase**: Phase 1 - Foundation Tables
**Current Task**: Ready to implement Facilities (Phase 1, Task 5)
**Tables Completed**: 4 / 11 seeded tables made dynamic (36%)
**Overall Progress**: 11 / 20+ tables seeded, 4 / 11 made dynamic

---

## Testing Strategy

1. Test on dev branch first
2. Verify each page individually
3. Check both desktop and mobile
4. Use browser devtools to catch errors
5. Only move to next table after current table is fully verified
6. Check RLS policies for each table before making dynamic

---

## Recent Fixes Applied

### Database Fixes (2026-07-23)
1. ✅ Fixed slug typo: `circutx` → `circuitx` in student_clubs
2. ✅ Fixed slug typo: `sc-ist` → `sc-st` in centers
3. ✅ Fixed name: "Ramesh CLub" → "AIMS Club" in student_clubs
4. ✅ Added RLS policy: "Anon SELECT" on student_clubs
5. ✅ Added featured column to student_clubs
6. ✅ Marked 4 clubs as featured

### Code Fixes (2026-07-23)
1. ✅ Created getFeaturedStudentClubs() function
2. ✅ Updated Header to use dynamic featured clubs (removed static import)
3. ✅ Added featured field to StudentClub TypeScript interface

---

## Next Steps

**Immediate (Phase 1, Task 5):**
1. Implement Facilities dynamic loading
2. Verify RLS policies exist
3. Test both academic and sports facilities pages
4. Clean up static imports

**After Phase 1:**
1. Move to Phase 2 (Departments & Courses)
2. Consider adding featured column to centers, facilities
3. Verify all RLS policies before going to production

---

## Team Collaboration

### Before Starting Work
1. Pull latest from `test` branch
2. Check this PLAN.md for current status
3. Pick the next unchecked task in sequence

### While Working
1. Mark task as in-progress: Change `[ ]` to `[🚧]`
2. Commit frequently with descriptive messages
3. Update progress in this file

### After Completing Task
1. Run full test checklist
2. Mark task as done: Change `[🚧]` to `[✅]`
3. Fill in verification checkboxes
4. Commit with summary of changes
5. Move to next task

---

## Git Workflow
```bash
# Stay on test branch
git checkout test
git pull origin test

# Make changes, test thoroughly

# Commit with descriptive message
git add .
git commit -m "feat(clubs): add featured column and dynamic menu integration"

# Push to remote
git push origin test
```
