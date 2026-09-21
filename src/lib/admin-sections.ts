// Classifies admin routes as either "global-only" (only scope_type ===
// "global" users may see or write to them — covers the Website CMS, Campus
// Life, and System sidebar groups in full, plus the Scholarships item that
// lives in the otherwise scope-following Academics group) or
// "scope-following" (a college/department-scoped user gets a filtered view
// of the same section). Mirrors the RLS classification applied in
// supabase/migrations/*_scope_aware_*_rls.sql and *_global_only_write_rls.sql
// — keep the two in sync. Used by both the admin.tsx route guard (direct URL
// navigation) and AdminSidebar (link visibility).
export const GLOBAL_ONLY_ROUTE_PREFIXES = [
  "/admin/homepage",
  "/admin/tables/pages",
  "/admin/menus",
  "/admin/tables/menu_items",
  "/admin/posts",
  "/admin/tables/content_categories",
  "/admin/tnp-hub",
  "/admin/recruiters",
  "/admin/tables/testimonials",
  "/admin/tables/board_members",
  "/admin/tables/committees",
  "/admin/tables/accreditations",
  "/admin/tables/downloads",
  "/admin/media",
  "/admin/events",
  "/admin/sports",
  "/admin/tables/achievements",
  "/admin/tables/gallery_albums",
  "/admin/tables/gallery_media",
  "/admin/tables/student_clubs",
  "/admin/tables/club_events",
  "/admin/tables/mous",
  "/admin/inquiries",
  "/admin/user-management",
  "/admin/tables/user_profiles",
  "/admin/tables/user_roles",
  "/admin/tables/audit_logs",
  "/admin/trash",
  "/admin/settings",
  "/admin/library",
  "/admin/nss-ncc",
  "/admin/scholarships",
  "/admin/tables/placed_students",
] as const;

export function isGlobalOnlyRoute(pathname: string): boolean {
  return GLOBAL_ONLY_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

// Routes that require at least "college" scope. A department-scoped admin
// manages only their own department's content -- they have no reason to
// browse the full Colleges list or college-wide Societies entries, even
// though those sections aren't global-only (a college-scoped admin does
// need them). RLS already returns zero rows for a department-scoped user
// here (can_write_scoped_record never matches a department scope_type when
// the department param is null), but the UI should hide the dead-end link
// rather than route them to an empty read-only page.
export const COLLEGE_OR_ABOVE_ROUTE_PREFIXES = [
  "/admin/colleges",
  "/admin/tables/centers",
] as const;

export function isCollegeOrAboveRoute(pathname: string): boolean {
  return COLLEGE_OR_ABOVE_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

// Single source of truth for "can this scope level reach this route at
// all" -- shared by the admin.tsx route guard (direct navigation) and
// AdminSidebar (link visibility) so the two can never drift apart.
export function isRouteAllowedForScope(pathname: string, level: string): boolean {
  if (level === "global") return true;
  if (isGlobalOnlyRoute(pathname)) return false;
  if (level === "department" && isCollegeOrAboveRoute(pathname)) return false;
  return true;
}

// Generic-table ids (used by AdminCrudManager via /admin/tables/:tableId)
// that must stay locked to global admins regardless of whether the table
// happens to carry a college_id/department_id column.
export const GLOBAL_ONLY_TABLE_IDS = new Set([
  "pages",
  "menu_items",
  "content_categories",
  "testimonials",
  "board_members",
  "committees",
  "accreditations",
  "downloads",
  "achievements",
  "gallery_albums",
  "gallery_media",
  "student_clubs",
  "club_events",
  "mous",
  "user_profiles",
  "user_roles",
  "audit_logs",
  "placed_students",
  "recruiters",
]);

// Maps a route (still gated global-only by the checks above) to the
// content-section code that can also unlock it, per
// supabase/migrations/*_admin_section_*.sql. A user with a matching
// user_section_grants row gets write access to that route even without
// global/college/department scope. Keep in sync with the RLS policies —
// each table listed in a migration's section bucket should have its owning
// route(s) listed here under the same section code.
export const ROUTE_SECTION_MAP: Record<string, string> = {
  "/admin/homepage": "home_page",
  "/admin/posts": "news_events",
  "/admin/tables/content_categories": "news_events",
  "/admin/events": "news_events",
  "/admin/inquiries": "admissions",
  "/admin/tnp-hub": "placement",
  "/admin/recruiters": "placement",
  "/admin/tables/placed_students": "placement",
  "/admin/tables/board_members": "about_us",
  "/admin/tables/committees": "about_us",
  "/admin/tables/accreditations": "about_us",
  "/admin/sports": "campus_life",
  "/admin/tables/gallery_albums": "campus_life",
  "/admin/tables/gallery_media": "campus_life",
  "/admin/tables/student_clubs": "campus_life",
  "/admin/tables/club_events": "campus_life",
  "/admin/library": "library",
};

// Longest-prefix match so a route like "/admin/tables/board_members/new"
// still resolves to the same section as its list page.
export function getRouteSection(pathname: string): string | null {
  let bestMatch: string | null = null;
  for (const prefix of Object.keys(ROUTE_SECTION_MAP)) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      if (!bestMatch || prefix.length > bestMatch.length) bestMatch = prefix;
    }
  }
  return bestMatch ? ROUTE_SECTION_MAP[bestMatch] : null;
}

// Combined route guard: section grants are checked first (they can unlock a
// route that would otherwise be global-only), then falls back to the
// existing scope-tier logic unchanged. Takes primitive scope level + section
// codes (not an AdminUser) so this stays importable from client components
// without pulling in server-only auth code.
export function isRouteAllowedForUser(
  pathname: string,
  level: string,
  sectionCodes: string[]
): boolean {
  if (level === "global") return true;

  const section = getRouteSection(pathname);
  if (section) return sectionCodes.includes(section);

  return isRouteAllowedForScope(pathname, level);
}
