// Server functions for facilities data from Supabase
import { publicSupabase, unwrap } from "@/lib/supabase-public";

export interface Facility {
  id: string;
  facility_type: "campus" | "building" | "laboratory";
  parent_id: string | null;
  institute_id: string | null;
  department_id: string | null;
  name: string;
  slug: string;
  address: string | null;
  code: string | null;
  room_number: string | null;
  status: "draft" | "published" | "archived";
  subtitle: string | null;
  accent_color: string | null;
  description: string | null;
  category: string | null;
  card_photo_url: string | null;
  has_detail_page: boolean;
  album_id: string | null;
  metadata: {
    highlights?: Array<{ title: string; description: string }>;
    institute_libraries?: Array<{ college_id: string; book_count: number }>;
    gallery?: {
      aspectRatio?: string;
      images?: Array<{
        id: string;
        url: string;
        focalX?: "left" | "center" | "right";
        focalY?: "top" | "center" | "bottom";
      }>;
    };
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all published facilities
 */
export async function getAllFacilities() {
  const supabase = publicSupabase();
  const result = await supabase
    .from("facilities")
    .select("*")
    .eq("status", "published")
    .is("department_id", null)
    .is("deleted_at", null)
    .order("name", { ascending: true });

  return unwrap<Facility[]>(result as any, "facilities");
}

/**
 * Fetch facilities by type (campus, building, laboratory)
 */
export async function getFacilitiesByType(type: "campus" | "building" | "laboratory") {
  const supabase = publicSupabase();
  const result = await supabase
    .from("facilities")
    .select("*")
    .eq("status", "published")
    .eq("facility_type", type)
    .order("name", { ascending: true });

  return unwrap<Facility[]>(result as any, "facilities by type");
}

/**
 * Fetch a single facility by slug. Excludes lab rows (`department_id IS NOT
 * NULL`) — labs have their own resolver (`getLabBySlug`) and their own URL
 * (`/departments/[dept]/labs/[slug]`); the campus/building facility slug
 * namespace must not accidentally resolve them (see
 * docs/audits/2026-09-23-entry-model-drift.md).
 */
export async function getFacilityBySlug(slug: string) {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from("facilities")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .is("department_id", null)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw error;

  return data as Facility | null;
}

/**
 * Fetch labs for a specific department
 */
export async function getLabsByDepartmentId(departmentId: string) {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from("facilities")
    .select("*")
    .eq("status", "published")
    .eq("facility_type", "laboratory")
    .eq("department_id", departmentId)
    .is("deleted_at", null)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching labs for department:", error);
    throw error;
  }

  return (data ?? []) as Facility[];
}

/**
 * Fetch a single lab by department + slug — the counterpart to
 * `getFacilityBySlug` that only ever resolves laboratory rows, scoped to one
 * department so two departments can't collide on the same slug.
 */
export async function getLabBySlug(departmentId: string, slug: string) {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from("facilities")
    .select("*")
    .eq("slug", slug)
    .eq("facility_type", "laboratory")
    .eq("department_id", departmentId)
    .eq("status", "published")
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw error;

  return data as Facility | null;
}
