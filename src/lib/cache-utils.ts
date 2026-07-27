import { QueryClient } from "@tanstack/react-query";

/**
 * Cache Invalidation Utilities
 *
 * Maps Supabase table names to React Query cache keys
 * Used to invalidate cache when admin makes changes
 */

/**
 * Map of table names to their corresponding query keys
 * When a table is updated, we invalidate all related queries
 */
const TABLE_QUERY_MAP: Record<string, string[][]> = {
  // Homepage & Landing
  homepage_items: [["homepage_items"], ["homepage_items", "global"]],
  homepage_sections: [["homepage_sections"]],
  homepage_widgets: [["homepage_widgets"]],

  // Colleges & Academics
  colleges: [["colleges"]],
  departments: [["departments"], ["departments", "all"]],
  courses: [["courses"], ["courses", "all"]],
  department_activities: [["department_activities"]],
  branches: [["branches"]],
  facilities: [["facilities"]],

  // Staff & Faculty
  staff_profiles: [["staff"], ["staff_profiles"]],
  qualifications: [["qualifications"]],
  experiences: [["experiences"]],
  awards: [["awards"]],
  publications: [["publications"]],
  patents: [["patents"]],
  research_projects: [["research_projects"]],
  research_interests: [["research_interests"]],
  staff_department_assignments: [["staff"], ["departments"]],
  staff_publications: [["publications"], ["staff"]],

  // CMS & Content
  pages: [["pages"]],
  posts: [["posts"], ["blog"]],
  content_categories: [["content_categories"], ["categories"]],
  menus: [["menus"], ["navigation"]],
  menu_items: [["menu_items"], ["navigation"]],

  // Campus Life
  events: [["events"], ["events", "latest"]],
  achievements: [["achievements"]],
  gallery_albums: [["gallery"], ["gallery_albums"]],
  gallery_media: [["gallery_media"]],
  cells: [["cells"]],
  centers: [["centers"]],
  committees: [["committees"]],
  student_clubs: [["student_clubs"], ["clubs"]],
  mous: [["mous"]],

  // Placement & Recruiters
  recruiters: [["recruiters"]],
  placement_statistics: [["placement_statistics"], ["placement"]],
  testimonials: [["testimonials"]],

  // Contact & Info
  contact_info: [["contact_info"]],
  accreditations: [["accreditations"]],
  downloads: [["downloads"]],

  // Media
  media_files: [["media_files"], ["media"]],
  media_folders: [["media_folders"]],

  // SEO & Metadata
  seo_metadata: [["seo_metadata"]],
  redirects: [["redirects"]],

  // Inquiries (not cached on main site, but included for completeness)
  inquiry_submissions: [["inquiry_submissions"]],

  // System tables (not typically cached on main site)
  audit_logs: [["audit_logs"]],
  user_profiles: [["user_profiles"]],
  user_roles: [["user_roles"]],
  roles: [["roles"]],
  permissions: [["permissions"]],
  role_permissions: [["role_permissions"]],
};

/**
 * Invalidate cache for a specific table
 * This forces React Query to refetch data on next render
 *
 * @param queryClient - React Query client instance
 * @param tableName - Name of the Supabase table that was modified
 */
export function invalidateTableCache(
  queryClient: QueryClient,
  tableName: string
): void {
  const queryKeys = TABLE_QUERY_MAP[tableName];

  if (!queryKeys || queryKeys.length === 0) {
    console.warn(`⚠️ No query keys mapped for table: ${tableName}`);
    // Invalidate with table name as fallback
    queryClient.invalidateQueries({ queryKey: [tableName] });
    return;
  }

  // Invalidate all related query keys
  queryKeys.forEach((key) => {
    queryClient.invalidateQueries({ queryKey: key });
  });

  console.log(`✅ Cache invalidated for table: ${tableName} (${queryKeys.length} queries)`);
}

/**
 * Invalidate multiple tables at once
 * Useful when one action affects multiple tables
 *
 * @param queryClient - React Query client instance
 * @param tableNames - Array of table names
 */
export function invalidateMultipleTables(
  queryClient: QueryClient,
  tableNames: string[]
): void {
  tableNames.forEach((tableName) => {
    invalidateTableCache(queryClient, tableName);
  });
}

/**
 * Invalidate all cached queries
 * Use sparingly - only when you need to force a complete refetch
 *
 * @param queryClient - React Query client instance
 */
export function invalidateAllCache(queryClient: QueryClient): void {
  queryClient.invalidateQueries();
  console.log("✅ All cache invalidated");
}

/**
 * Get query keys for a specific table
 * Useful for debugging or manual invalidation
 *
 * @param tableName - Name of the Supabase table
 * @returns Array of query keys
 */
export function getQueryKeysForTable(tableName: string): string[][] {
  return TABLE_QUERY_MAP[tableName] || [[tableName]];
}

/**
 * Check if a table has cached queries
 *
 * @param tableName - Name of the Supabase table
 * @returns True if table has mapped query keys
 */
export function hasTableCache(tableName: string): boolean {
  return tableName in TABLE_QUERY_MAP;
}
