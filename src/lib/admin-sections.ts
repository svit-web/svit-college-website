// Classifies admin routes as either "global-only" (only scope_type ===
// "global" users may see or write to them — covers the Website CMS, Campus
// Life, and System sidebar groups in full, plus the Admissions group's
// Scholarships item) or
// "scope-following" (a college/department-scoped user gets a filtered view
// of the same section). Mirrors the RLS classification applied in
// supabase/migrations/*_scope_aware_*_rls.sql and *_global_only_write_rls.sql
// — keep the two in sync. Used by both the admin.tsx route guard (direct URL
// navigation) and AdminSidebar (link visibility).
export const GLOBAL_ONLY_ROUTE_PREFIXES = [
  "/admin/homepage",
  "/admin/tables/pages",
  "/admin/page-editors",
  "/admin/menus",
  "/admin/tables/menu_items",
  "/admin/posts",
  "/admin/tables/content_categories",
  "/admin/tnp-hub",
  "/admin/recruiters",
  "/admin/tables/board_members",
  "/admin/tables/accreditations",
  "/admin/tables/downloads",
  "/admin/media",
  "/admin/sports",
  "/admin/tables/gallery_albums",
  "/admin/tables/gallery_media",
  "/admin/tables/mous",
  "/admin/inquiries",
  "/admin/user-management",
  "/admin/tables/user_profiles",
  "/admin/tables/user_roles",
  "/admin/tables/audit_logs",
  "/admin/trash",
  "/admin/settings",
  "/admin/scholarships",
  "/admin/tables/placed_students",
  "/admin/tables/designations",
  "/admin/tables/staff_posts",
  "/admin/tables/trusts",
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

// Role codes that carry the ordinary global/trust/institute/college/
// department scope-tier semantics. Users whose roles are all outside this
// list (currently only 'sports_secretary') are section-only users: they get
// scope level "section" and see only the routes their section grants
// unlock. Keep in sync with the role-code lists hardcoded in the SQL RLS
// helpers (is_global_admin / can_write_scoped_record / is_any_admin — see
// supabase/migrations/20260806065601_global_only_write_rls.sql,
// 20260805051746_scope_aware_write_rls.sql, 20261008140000_sports_secretary_role.sql).
export const FULL_ACCESS_ROLE_CODES = [
  "admin",
  "editor",
  "department_admin",
  "college_admin",
] as const;

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
  "board_members",
  "accreditations",
  "downloads",
  "gallery_albums",
  "gallery_media",
  "mous",
  "user_profiles",
  "user_roles",
  "audit_logs",
  "placed_students",
  "recruiters",
  "designations",
  "staff_posts",
  "trusts",
]);

// Maps a route (still gated global-only by the checks above) to the
// content-section codes that can also unlock it, per
// supabase/migrations/*_admin_section_*.sql. A user with a matching
// user_section_grants row gets write access to that route even without
// global/college/department scope. Keep in sync with the RLS policies —
// each table listed in a migration's section bucket should have its owning
// route(s) listed here under the same section code. A route can list
// several codes when a dedicated section carves out part of a broader one
// (e.g. 'sports' unlocks /admin/sports and sports-category achievements
// alongside the pre-existing 'campus_life' grant).
export const ROUTE_SECTION_MAP: Record<string, string[]> = {
  "/admin/homepage": ["home_page"],
  "/admin/posts": ["news_events"],
  "/admin/tables/content_categories": ["news_events"],
  "/admin/events": ["news_events"],
  "/admin/inquiries": ["admissions"],
  "/admin/tnp-hub": ["placement"],
  "/admin/recruiters": ["placement"],
  "/admin/tables/placed_students": ["placement"],
  "/admin/tables/board_members": ["about_us"],
  "/admin/tables/committees": ["about_us"],
  "/admin/tables/committee_members": ["about_us"],
  "/admin/tables/accreditations": ["about_us"],
  "/admin/sports": ["campus_life", "sports"],
  "/admin/tables/achievements": ["campus_life", "sports"],
  "/admin/tables/gallery_albums": ["campus_life"],
  "/admin/tables/gallery_media": ["campus_life"],
  "/admin/tables/student_clubs": ["campus_life"],
  "/admin/tables/downloads": ["library"],
};

// Longest-prefix match so a route like "/admin/tables/board_members/new"
// still resolves to the same sections as its list page.
export function getRouteSections(pathname: string): string[] {
  let bestMatch: string | null = null;
  for (const prefix of Object.keys(ROUTE_SECTION_MAP)) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      if (!bestMatch || prefix.length > bestMatch.length) bestMatch = prefix;
    }
  }
  return bestMatch ? ROUTE_SECTION_MAP[bestMatch] : [];
}

// Combined route guard: a section grant can unlock a route that would
// otherwise be global-only, but it never takes away access the ordinary
// scope-tier logic already grants (e.g. a college_admin reaching a
// scope-aware table like committees without needing an explicit grant).
// Takes primitive scope level + section codes (not an AdminUser) so this
// stays importable from client components without pulling in server-only
// auth code.
//
// The "section" level covers section-only users — accounts whose roles are
// all outside FULL_ACCESS_ROLE_CODES (currently a Sports Secretary). Their
// reach comes exclusively from section grants, so everything beyond the
// dashboard home is off-limits unless a grant unlocks it above.
export function isRouteAllowedForUser(
  pathname: string,
  level: string,
  sectionCodes: string[]
): boolean {
  const sections = getRouteSections(pathname);
  if (sections.some((s) => sectionCodes.includes(s))) return true;

  if (level === "global") return true;
  if (level === "section") return pathname === "/admin";

  return isRouteAllowedForScope(pathname, level);
}
