# Featured Content Implementation

**Date**: 2026-07-23
**Feature**: Dynamic featured clubs in menu bar and key pages

---

## Overview

Added a `featured` boolean column to enable content to be highlighted in navigation menus, home pages, and other promotional areas while keeping the full list available on dedicated pages.

---

## Database Changes

### student_clubs Table

**Added Column:**
```sql
ALTER TABLE student_clubs ADD COLUMN featured boolean DEFAULT false;
```

**Current Featured Clubs:**
- ✅ AIMS Club (slug: aims)
- ✅ Apexia (slug: apexia)
- ✅ CircuitX (slug: circuitx)
- ✅ Praxis (slug: praxis)

All 4 clubs marked as `featured = true`.

---

## Code Changes

### 1. Server Functions (`src/lib/clubs.functions.ts`)

**Added Interface Field:**
```typescript
export interface StudentClub {
  // ... existing fields
  featured: boolean; // NEW
  // ... other fields
}
```

**Added New Function:**
```typescript
/**
 * Fetch only featured student clubs (for menu bar, home page, etc.)
 */
export const getFeaturedStudentClubs = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { data, error } = await supabase
      .from('student_clubs')
      .select('*')
      .eq('status', 'published')
      .eq('featured', true)  // Only featured clubs
      .order('name', { ascending: true });

    if (error) throw error;
    return data as StudentClub[];
  });
```

**Existing Function (unchanged):**
- `getAllStudentClubs()` - Returns ALL published clubs (for the /clubs page)
- `getStudentClubBySlug()` - Returns single club by slug

### 2. Header Component (`src/components/site/Header.tsx`)

**Import Changes:**
```typescript
// REMOVED: clubDetails from static data
- import { academicFacilities, sportsFacilities, centreDetails, clubDetails, eventDetails } from "@/data/campus-rfe";

// ADDED: Dynamic featured clubs function
+ import { getFeaturedStudentClubs } from "@/lib/clubs.functions";
```

**Function Update:**
```typescript
function useCampusCategories(): MegaCategory[] {
  // NEW: Fetch featured clubs dynamically
  const { data: featuredClubs } = useQuery({
    queryKey: ['featured-clubs'],
    queryFn: () => getFeaturedStudentClubs(),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  return [
    // ... other categories
    {
      key: "clubs",
      title: "Clubs",
      icon: Users,
      allLabel: "All clubs",
      allTo: "/campus-life/clubs",
      // CHANGED: Use dynamic data instead of static
      items: featuredClubs?.map((c) => ({ label: c.name, to: `/campus-life/clubs/${c.slug}` })) || [],
    },
    // ... other categories
  ];
}
```

---

## How It Works

### For Clubs Page (`/campus-life/clubs`)
- Uses `getAllStudentClubs()`
- Shows ALL published clubs (4 currently)
- List will grow as more clubs are added

### For Menu Bar (Campus Life dropdown)
- Uses `getFeaturedStudentClubs()`
- Shows ONLY featured clubs (4 currently)
- Keeps menu clean and highlights priority clubs

### For Future Use
- Home page testimonials/highlights
- Department pages
- Featured events/centers/facilities

---

## Extending to Other Tables

To add `featured` support to other tables (centers, facilities, events, etc.):

1. **Add column to table:**
   ```sql
   ALTER TABLE <table_name> ADD COLUMN featured boolean DEFAULT false;
   ```

2. **Update specific rows:**
   ```sql
   UPDATE <table_name> SET featured = true WHERE slug IN ('slug1', 'slug2');
   ```

3. **Add server function:**
   ```typescript
   export const getFeatured<TableName> = createServerFn({ method: 'GET' })
     .handler(async () => {
       const { data, error } = await supabase
         .from('<table_name>')
         .select('*')
         .eq('status', 'published')
         .eq('featured', true)
         .order('name', { ascending: true });
       if (error) throw error;
       return data;
     });
   ```

4. **Update Header/HomePage to use dynamic data**

---

## Benefits

✅ **Menu bar now matches actual club list** - No more discrepancies between menu and page
✅ **Single source of truth** - All club data comes from Supabase
✅ **Flexible control** - Can promote/demote clubs by toggling `featured` flag
✅ **Scalable** - Can add 100 clubs but only show 4-5 featured ones in navigation
✅ **No code changes needed** - Just update database to change featured items

---

## Testing

- ✅ Featured clubs column added
- ✅ All 4 clubs marked as featured
- ✅ getFeaturedStudentClubs() function created
- ✅ Header updated to use dynamic data
- ✅ RLS policy allows anonymous access
- ⏳ Browser testing needed to confirm menu displays correctly

---

## Next Steps

1. Test menu bar in browser to verify featured clubs appear
2. Consider adding featured column to:
   - `centers` (for menu bar)
   - `facilities` (for home page highlights)
   - `campus_events` (for home page upcoming events)
3. Remove static `clubDetails` from `src/data/campus-rfe.ts` after confirming everything works
