# SVIT College Website — Codebase Audit

**Date:** 2026-08-06
**Branch:** admin-portal-test
**Scope:** Full codebase — UI/UX and technical issues

---

## Summary

| # | Severity | File | Issue |
|---|----------|------|-------|
| 1 | Critical | `src/components/site/Carousel.tsx:20` | Hooks called after conditional return — Rules of Hooks violation |
| 2 | High | `src/components/site/Footer.tsx:34` | `/placement/overview` is a broken link (route does not exist) |
| 3 | Medium | `src/components/admin/AdminCrudManager.tsx:483,513` | Double success toast on every save and delete |
| 4 | Medium | `src/routes/admin.homepage.tsx:12` | Unused `ArrowUp` and `ArrowDown` imports |
| 5 | Medium | `src/routes/admin.appearance.tsx` | Standalone `/admin/appearance` route duplicates the "Hero Appearance" tab inside `/admin/homepage` |
| 6 | Medium | `src/routes/admin.homepage.tsx:76` | Legacy `hero_slide` item type still selectable in the add/edit form |
| 7 | Medium | `src/components/site/Header.tsx:536` | All sports entries in Campus mega-menu link to the same `/campus` page |
| 8 | Low | `src/components/site/Header.tsx` | No top-level "Courses" item in primary navigation |
| 9 | Low | `src/components/site/DepartmentLayout.tsx:7` | Hardcoded Supabase storage URL for college logos |
| 10 | Low | `src/routes/admin.tsx:103` | Loading screen uses light-mode colours while admin shell is dark |
| 11 | Low | `src/components/site/Footer.tsx:73` | Footer "Courses" links depend on `code` format matching route param |
| 12 | Low | `src/components/admin/AdminSidebar.tsx` | Collapsed sidebar items invisible on touch (no hover = no tooltip) |

---

## Issue Details

### 1. `HomeCarousel` — Rules of Hooks Violation

**File:** `src/components/site/Carousel.tsx:18-28`
**Severity:** Critical

`useState` and `useEffect` are called **after** a conditional early return, violating React's Rules of Hooks. React requires hooks to always be called in the same order on every render. This currently works only because `slides` tends to be always empty or always non-empty within a session — but if the carousel receives a non-empty slides array after an initial empty render, React will throw an "Invalid hook call" error and crash the component tree.

```tsx
// CURRENT (broken)
export function HomeCarousel({ slides: slidesProp }: Props = {}) {
  const slides = slidesProp && slidesProp.length > 0 ? slidesProp : [];
  if (slides.length === 0) return null;       // ← early return
  const [index, setIndex] = useState(0);      // ← hooks AFTER conditional = violation
  const [paused, setPaused] = useState(false);
  useEffect(() => { ... }, [paused, slides.length]);
  // ...
}
```

**Fix:** Move all hooks above the conditional return.

```tsx
// CORRECT
export function HomeCarousel({ slides: slidesProp }: Props = {}) {
  const slides = slidesProp && slidesProp.length > 0 ? slidesProp : [];
  const [index, setIndex] = useState(0);      // hooks first
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  if (slides.length === 0) return null;       // early return after hooks
  // ...
}
```

---

### 2. Footer "Placement" Link — Broken Route

**File:** `src/components/site/Footer.tsx:34`
**Severity:** High

```tsx
{ label: "Placement", to: "/placement/overview" },
```

No route exists at `/placement/overview`. The existing routes are:
- `/placement/` → `placement.index.tsx`
- `/placement/$college` → `placement.$college.tsx`

The path `/placement/overview` will be matched by the `$college` dynamic segment with value `"overview"`, which calls `getCollegeBySlug("overview")`, returns nothing, and throws `notFound()` — resulting in a 404 page.

**Fix:** Change the link to `/placement`.

```tsx
{ label: "Placement", to: "/placement" },
```

---

### 3. Double Toast Notifications on Save/Delete

**File:** `src/components/admin/AdminCrudManager.tsx:483,500,513,551,571`
**Severity:** Medium

Every successful save and delete triggers two back-to-back success toasts. For example, on update:

```tsx
toast.success("Record updated successfully!");         // first toast
// ... invalidateTableCache ...
toast.success("✨ Changes will appear on website within seconds!", { duration: 3000 }); // second toast
```

And on delete:

```tsx
toast.success("Record soft-deleted!");
// ...
toast.success("✨ Record deleted! Changes will appear on website within seconds!", { duration: 3000 });
```

Two toasts stack on screen simultaneously, which is noisy and looks broken.

**Fix:** Remove the first (generic) toast in each case and keep only the descriptive second one. Or consolidate into a single message.

---

### 4. Unused Imports in `admin.homepage.tsx`

**File:** `src/routes/admin.homepage.tsx:12`
**Severity:** Medium

```tsx
import {
  Layout,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,    // ← never used
  ArrowDown,  // ← never used
  Loader2,
  Grid,
  Palette,
} from "lucide-react";
```

`ArrowUp` and `ArrowDown` are imported but not referenced anywhere in the file. They were likely left over from a sort-order drag UI that was removed.

**Fix:** Remove both from the import.

---

### 5. Duplicate Entry Point for Hero Appearance Settings

**File:** `src/routes/admin.appearance.tsx`
**Severity:** Medium

`/admin/appearance` is a standalone route that renders `HeroAppearancePanel` directly. The identical panel is also rendered as the "Hero Appearance" tab within `/admin/homepage`. This means:

- The sidebar links to "Homepage Layout" (`/admin/homepage`) where the appearance tab lives.
- But `/admin/appearance` is also independently accessible (there is a `createFileRoute("/admin/appearance")` with `component: AdminAppearancePage`).
- The standalone page shows only the appearance panel with no "Homepage Items" tab context, making it look incomplete/orphaned.

**Fix:** Either remove the standalone `/admin/appearance` route entirely and rely on the tab inside `/admin/homepage`, or add a redirect from `/admin/appearance` to `/admin/homepage` with the appearance tab pre-selected.

---

### 6. Legacy `hero_slide` Item Type Still Selectable

**File:** `src/routes/admin.homepage.tsx:76`
**Severity:** Medium

```tsx
const ITEM_TYPE_LABELS: Record<string, string> = {
  hero: "Hero Section",
  carousel_slide: "Carousel Slides",
  // ...
  hero_slide: "Hero Slides (legacy)",  // ← still in the dropdown
  job: "Job Listings",
};
```

The `hero_slide` type is explicitly labelled as legacy, but it remains in the item type dropdown when adding or editing homepage items. Admins can still create new legacy-type items. The frontend has no renderer for `hero_slide` items — they will be silently ignored on the site.

**Fix:** Remove `hero_slide` from `ITEM_TYPE_LABELS` and `ITEM_TYPES` so it cannot be selected when creating new items. Existing records are unaffected.

---

### 7. All Sports Links in Campus Mega-Menu Go to the Same Page

**File:** `src/components/site/Header.tsx:536-539`
**Severity:** Medium

```tsx
{
  key: "sports",
  title: "Sports",
  icon: Trophy,
  allLabel: "Sports & Athletics",
  allTo: "/campus",
  items: (sports ?? []).map((s) => ({
    label: s.name,
    to: "/campus",   // ← every sport links to the same generic page
  })),
},
```

Every individual sport item in the "Sports" sub-panel of the Campus mega-menu links to the same `/campus` page regardless of which sport is clicked. Users see distinct sport names (e.g. "Cricket", "Football", "Basketball") but all navigate to the same destination.

**Fix:** If individual sport detail pages don't exist yet, either remove the individual items and just keep the "Sports & Athletics" link, or link to the campus page with an anchor hash (e.g. `/campus#cricket`). Once individual sport pages exist, update `to` to use the sport's slug.

---

### 8. No "Courses" Entry in Primary Navigation

**File:** `src/components/site/Header.tsx:6-13`
**Severity:** Low

```tsx
const primaryNav = [
  { label: "Home", to: "/" },
  { label: "About SVIT", to: "/about" },
  { label: "Colleges", to: "/colleges" },
  { label: "Admissions", to: "/admissions" },
  { label: "Campus Life", to: "/campus-life" },
  { label: "Placement", to: "/placement" },
] as const;
```

There is no direct "Courses" link in the primary navigation bar. Users can discover courses only through:
- The Colleges mega-menu → department hover panel → individual department links
- The footer "Courses" column

The `/courses` route and its sub-routes (`/courses/$course`, `/courses/$course/faculty`, etc.) are fully implemented but not surfaced at the top level. For a college website, courses are a primary discovery path for prospective students.

**Fix:** Add a "Courses" item to `primaryNav` (either as a direct link or with a mega-menu listing programme types).

---

### 9. Hardcoded Supabase Storage URL in `DepartmentLayout`

**File:** `src/components/site/DepartmentLayout.tsx:7`
**Severity:** Low

```tsx
const BASE = "https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/logos";

const COLLEGE_MAP: Record<string, { ... }> = {
  "svit-degree": { ..., logo: `${BASE}/svit.jpg` },
  "svit-diploma": { ..., logo: `${BASE}/svit.jpg` },
  svica:          { ..., logo: `${BASE}/svica.jpg` },
  svion:          { ..., logo: `${BASE}/svion.png` },
  "svit-coa":     { ..., logo: `${BASE}/coa-svit.png` },
};
```

Five college logo URLs are hardcoded with an absolute Supabase project URL. This creates two problems:
1. **Brittleness:** If the Supabase project is migrated, the media bucket is renamed, or the project URL changes, all five logos silently break.
2. **Environment coupling:** The code references production storage in all environments (dev, staging, production).

The rest of the site fetches logo URLs dynamically from the `colleges` table (`logo_url` column). The `COLLEGE_MAP` in this file is a manual override that bypasses the dynamic data.

**Fix:** Remove `COLLEGE_MAP` and derive the college name, shortCode, route, and logo from the `department.college_slug` and a dynamic colleges query — the same data already loaded in the colleges query used elsewhere.

---

### 10. Admin Loading Screen Colour Mismatch

**File:** `src/routes/admin.tsx:100-107`
**Severity:** Low

```tsx
if (loading) {
  return (
    <div className="flex h-screen w-screen items-center justify-center admin-bg">
      {/* admin-bg is a light slate colour */}
      <p className="text-sm font-medium text-navy animate-pulse">Loading Admin Portal...</p>
    </div>
  );
}
```

The loading screen uses `admin-bg` (light slate) with `text-navy` (dark). Once auth resolves and the admin layout renders, the shell background switches to `bg-slate-50` (also light), so there is no dramatic flash. However, if the user goes to the login page after loading, the login page may have its own background, causing a visible transition.

Minor issue — the loading screen and the main admin shell are visually consistent enough. No fix strictly required, but aligning with `bg-white` or making loading screen background match the login page would be cleaner.

---

### 11. Footer "Courses" Column Link Format Assumption

**File:** `src/components/site/Footer.tsx:73`
**Severity:** Low

```tsx
<FooterCol
  title="Courses"
  links={(programmes ?? []).map((c) => ({ label: c.name, to: `/courses/${c.code}` }))}
/>
```

Links are built as `/courses/${c.code}`. The route is `courses.$course.tsx`, and the loader does:

```tsx
// courses.$course.tsx
const { course } = Route.useParams();
```

This means the URL param must match what the DB stores in the `code` column. If any programme has a `code` with mixed casing, spaces, or special characters that differ from how the route param is normalised, the link will 404. Worth verifying all programme codes are URL-safe lowercase slugs.

---

### 12. Collapsed Sidebar Unusable on Touch Devices

**File:** `src/components/admin/AdminSidebar.tsx:247-264`
**Severity:** Low

In collapsed mode, individual nav items render as tiny `h-1.5 w-1.5` circles:

```tsx
// Collapsed mode item
<Link className="flex justify-center rounded-lg p-2 ...">
  <div className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
</Link>
```

The only hint is a `title` attribute (tooltip) on the wrapping element, which requires mouse hover. On touch devices (iPad, which admins may use), there is no hover state, making the collapsed sidebar completely unnavigable without expanding it.

**Fix:** In collapsed mode, show the group icon for each item rather than a dot, so each item is at least identifiable by its group. Or disable the collapse toggle on touch devices.

---

## Not Issues (Investigated, Confirmed Intentional)

- **HeroCardSlider secondary card `y: 24`** — The secondary "peek" card is intentionally offset downward 24px for a stacked/offset visual effect. This is by design.
- **AdminCrudManager search with ILIKE** — String interpolation into Supabase `.or()` filter is safe because PostgREST handles parameterization server-side. No SQL injection risk.
- **`admin.tsx` unauthorized redirect flash** — The brief spinner shown while redirecting to `/admin/login` is intentional to avoid a null layout flash.
