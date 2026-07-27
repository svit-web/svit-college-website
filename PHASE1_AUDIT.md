# Phase 1: Data Flow Audit Results
**Date:** 2026-07-23  
**Status:** In Progress

## 📊 Static Data Sources Found

### ❌ **HIGH PRIORITY - Replace with Supabase:**

#### 1. **About Page** (`about.tsx`)
- **Static Import:** `@/data/aboutPage`
- **Tables to Use:** `pages` (slug='about')
- **Impact:** About page content not editable from admin

#### 2. **Admissions** (`admissions.index.tsx`, `admissions.inquiry.tsx`)
- **Static Import:** `courses` from `@/data/site`
- **Tables to Use:** `courses`, `departments`, `branches`
- **Impact:** Course listings not editable from admin

#### 3. **Campus Life** (Multiple files)
- **Static Import:** `@/data/campus-rfe` (centreDetails, clubDetails, eventDetails, facilities)
- **Tables to Use:** `cells`, `centers`, `student_clubs`, `events`, `facilities`, `gallery_albums`
- **Impact:** Campus life content completely static

#### 4. **Colleges** (`colleges.$college.tsx`, `colleges.index.tsx`)
- **Static Import:** `@/data/colleges` (collegeMap)
- **Tables to Use:** `colleges` (already has Supabase queries!)
- **Impact:** College details using static fallback instead of database
- **Note:** ⚠️ This one is PARTIALLY working - needs priority fix

#### 5. **Courses** (Multiple files)
- **Static Import:** `courses`, `engDepts`, `recruiters` from `@/data/site`
- **Tables to Use:** `courses`, `departments`, `staff_profiles`, `recruiters`
- **Impact:** Course pages completely static

#### 6. **Departments** (`departments.$dept.tsx`)
- **Static Import:** `departments` from `@/data/academics`
- **Tables to Use:** `departments`, `staff_profiles`, `courses`
- **Impact:** Department pages using static data

#### 7. **Contact** (`contact.tsx`)
- **Static Import:** `site` from `@/data/site`
- **Tables to Use:** `contact_info`
- **Impact:** Contact information not editable

#### 8. **Careers** (`careers.tsx`)
- **Static Import:** `site` from `@/data/site`
- **Tables to Use:** `pages` (slug='careers')
- **Impact:** Careers page content static

### ✅ **WORKING - Already Using Supabase:**

#### 1. **Homepage** (`index.tsx`)
- ✅ Uses `homepageItemsQuery`, `collegesQuery`, `eventsQuery`, `recruitersQuery`
- ✅ Has static fallbacks (good for errors)
- ✅ Priority: Database-first pattern

#### 2. **Admin Portal** (All admin routes)
- ✅ Fully connected to Supabase
- ✅ CRUD operations working

### 📁 **Static Data Files to Phase Out:**

```
src/data/
├── aboutPage.ts          ❌ Replace with pages table
├── academics.ts          ❌ Replace with departments/courses tables
├── campus-life-nav.ts    ⚠️ Keep for UI structure (navigation)
├── campus-rfe.ts         ❌ Replace with campus life tables
├── colleges.ts           ❌ Already have colleges table queries!
├── departmentContent.ts  ❌ Replace with departments table
├── heroHighlights.ts     ⚠️ Can be stored in homepage_items
├── placement.ts          ❌ Replace with recruiters/placement_statistics
├── programDetails.ts     ❌ Replace with courses table
├── site.ts              ❌ Replace with various tables (contact_info, courses, etc.)
├── staff.ts             ❌ Replace with staff_profiles table
```

---

## 🎯 **Implementation Priority Order:**

### **IMMEDIATE (Critical User-Facing Content):**
1. ✅ **Homepage** - Already working!
2. 🔧 **Colleges Pages** - Partially working, needs fix (DOING NOW)
3. 🔧 **Contact Page** - Simple, single table
4. 🔧 **About Page** - Simple, single table

### **HIGH (Important Navigation & Content):**
5. 🔧 **Courses Listing** - Multiple pages
6. 🔧 **Departments Pages** - Multiple pages
7. 🔧 **Admissions** - Course selection

### **MEDIUM (Campus Life & Engagement):**
8. 🔧 **Campus Life** - Multiple sections (events, clubs, facilities)
9. 🔧 **Placement** - Recruiters & statistics

### **LOW (Secondary Content):**
10. 🔧 **Careers Page**
11. 🔧 **Other static pages**

---

## 🔍 **Current Data Flow Pattern Analysis:**

### **Bad Pattern Found (Most pages):**
```typescript
import { staticData } from "@/data/something";

function Page() {
  // Uses static data directly - admin changes won't show!
  return <div>{staticData.map(...)}</div>;
}
```

### **Good Pattern Found (Homepage):**
```typescript
import { useQuery } from "@tanstack/react-query";
import { homepageItemsQuery } from "@/lib/homepage";
import { staticData } from "@/data/something"; // Fallback only

function Page() {
  const { data } = useQuery(homepageItemsQuery);
  
  // Database first, static only on error
  const rows = data && data.length > 0 ? data : staticData;
  
  return <div>{rows.map(...)}</div>;
}
```

### **Best Pattern (What we'll implement):**
```typescript
import { useQuery } from "@tanstack/react-query";
import { myQuery } from "@/lib/mydata";

function Page() {
  const { data, isLoading, error } = useQuery(myQuery);
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage />;
  if (!data || data.length === 0) return <EmptyState />;
  
  return <div>{data.map(...)}</div>;
}
```

---

## 📋 **Missing Query Functions to Create:**

Need to create these server functions:

1. ✅ `getGlobalHomepageItems()` - Already exists
2. ✅ `getCollegesGrid()` - Already exists
3. ✅ `getRecruiterLogos()` - Already exists
4. ✅ `getLatestEvents()` - Already exists
5. ❌ `getContactInfo()` - Need to create
6. ❌ `getPageBySlug(slug)` - Need to create (for about, careers, etc.)
7. ❌ `getCoursesList()` - Need to create
8. ❌ `getDepartmentsList()` - Need to create
9. ❌ `getDepartmentBySlug(slug)` - Need to create
10. ❌ `getFacilities()` - Need to create
11. ❌ `getStudentClubs()` - Need to create
12. ❌ `getCenters()` - Need to create
13. ❌ `getGalleryAlbums()` - Need to create
14. ❌ `getPlacementStats()` - Need to create
15. ❌ `getTestimonials()` - Need to create

---

## ✅ **Next Steps:**

### **Step 1.1: Fix Colleges Page (HIGHEST PRIORITY)** ✅ STARTING NOW
- Already has Supabase queries
- Just needs to remove static fallback priority
- Test: Edit college in admin → should show on website immediately

### **Step 1.2: Create Missing Server Functions**
- Contact info
- Pages (CMS)
- Courses
- Departments
- Campus life tables

### **Step 1.3: Update Route Files**
- Replace static imports with Supabase queries
- Implement database-first pattern
- Keep static data as emergency fallback only

### **Step 1.4: Test Each Page**
- Edit in admin
- Verify shows on website within 60 seconds
- Check images load correctly

---

## 🎯 **Success Criteria:**

- [ ] All pages use Supabase queries first
- [ ] Static data only used on database errors
- [ ] Admin edits reflect on website within 60 seconds
- [ ] No 404 errors on dynamic pages
- [ ] Images load correctly from Supabase Storage
- [ ] Page load times remain under 2 seconds

---

**Status:** Ready to implement fixes
**Next:** Fix colleges page, then create missing query functions
