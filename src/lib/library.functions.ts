// Central Library page (/campus-life/central-library): the library's facility
// row plus its repeatable lists (library_resources, library_info_items).
import { publicSupabase, unwrap } from "@/lib/supabase-public";
import { getFacilityBySlug, type Facility } from "@/lib/facilities.functions";
import { getEntryAlbum } from "@/lib/gallery.functions";
import type { EntryAlbum } from "@/lib/entry";
import { getAllColleges } from "@/lib/colleges.functions";
import { getStaffByDepartmentId, type DeptStaffMember } from "@/lib/department-content.functions";

import { LIBRARY_FACILITY_SLUG } from "@/lib/library-paths";

export { LIBRARY_FACILITY_SLUG, LIBRARY_PATH } from "@/lib/library-paths";

export type LibraryResourceCategory =
  | "e_journal"
  | "database"
  | "opac"
  | "remote_access"
  | "digital_library"
  | "other";

export interface LibraryResource {
  id: string;
  name: string;
  category: LibraryResourceCategory;
  publisher: string | null;
  description: string | null;
  website_url: string | null;
  access_note: string | null;
  logo_url: string | null;
  sort_order: number;
}

export type LibraryInfoKind = "timing" | "service" | "rule" | "stat" | "contact";

export interface LibraryInfoItem {
  id: string;
  kind: LibraryInfoKind;
  title: string;
  value: string | null;
  description: string | null;
  sort_order: number;
}

/** One college's share of the collection, from facility metadata.institute_libraries. */
export interface LibraryCollegeHolding {
  collegeId: string;
  collegeName: string;
  bookCount: number;
}

export interface LibraryDownload {
  id: string;
  title: string;
  file_url: string;
  file_type: string | null;
}

export interface LibraryPageData {
  facility: Facility;
  album: EntryAlbum | null;
  holdings: LibraryCollegeHolding[];
  resources: LibraryResource[];
  info: Record<LibraryInfoKind, LibraryInfoItem[]>;
  staff: DeptStaffMember[];
  downloads: LibraryDownload[];
}

/**
 * Fetch all published library resources (e-journals, databases, OPAC…)
 */
export async function getLibraryResources() {
  const supabase = publicSupabase();
  const result = await supabase
    .from("library_resources")
    .select(
      "id, name, category, publisher, description, website_url, access_note, logo_url, sort_order",
    )
    .eq("status", "published")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  return unwrap(result, "library resources") as LibraryResource[];
}

/**
 * Fetch all published library info items (timings, services, rules, stats, contacts)
 */
export async function getLibraryInfoItems() {
  const supabase = publicSupabase();
  const result = await supabase
    .from("library_info_items")
    .select("id, kind, title, value, description, sort_order")
    .eq("status", "published")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  return unwrap(result, "library info items") as LibraryInfoItem[];
}

/**
 * Fetch published downloads in the 'library' category (membership forms,
 * new-arrival lists…) — managed under Admin → Downloads / Forms.
 */
export async function getLibraryDownloads() {
  const supabase = publicSupabase();
  const result = await supabase
    .from("downloads")
    .select("id, title, file_url, file_type")
    .eq("category", "library")
    .eq("status", "published")
    .is("deleted_at", null)
    .order("title", { ascending: true });

  return unwrap(result, "library downloads") as LibraryDownload[];
}

/**
 * Everything the Central Library page renders. Returns null when the library
 * facility row is missing or unpublished; the list tables degrade to empty so
 * one failing query hides a section instead of the whole page.
 */
export async function getLibraryPage(): Promise<LibraryPageData | null> {
  const facility = await getFacilityBySlug(LIBRARY_FACILITY_SLUG).catch(() => null);
  if (!facility) return null;

  // Staff come from the department picked in /admin/library
  // (metadata.staff_department_id), not facilities.department_id — see
  // 20261029130000_central_library_staff_downloads.sql.
  const staffDepartmentId: string | undefined = facility.metadata?.staff_department_id || undefined;

  const [album, resources, items, colleges, staff, downloads] = await Promise.all([
    getEntryAlbum(facility.album_id).catch(() => null),
    getLibraryResources().catch(() => []),
    getLibraryInfoItems().catch(() => []),
    getAllColleges().catch(() => []),
    staffDepartmentId ? getStaffByDepartmentId(staffDepartmentId).catch(() => []) : [],
    getLibraryDownloads().catch(() => []),
  ]);

  // Holdings follow college sort order; entries for unpublished colleges drop out.
  const counts = new Map(
    (facility.metadata?.institute_libraries ?? []).map((l) => [l.college_id, l.book_count]),
  );
  const holdings: LibraryCollegeHolding[] = colleges
    .filter((c) => counts.has(c.id))
    .map((c) => ({ collegeId: c.id, collegeName: c.name, bookCount: Number(counts.get(c.id)) }));

  const info: LibraryPageData["info"] = {
    stat: [],
    timing: [],
    service: [],
    rule: [],
    contact: [],
  };
  for (const item of items) info[item.kind]?.push(item);

  return { facility, album, holdings, resources, info, staff, downloads };
}
