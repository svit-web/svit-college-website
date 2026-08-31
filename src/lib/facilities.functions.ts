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
  metadata: {
    highlights?: Array<{ title: string; description: string }>;
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
 * Fetch a single facility by slug
 */
export async function getFacilityBySlug(slug: string) {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from("facilities")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
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
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching labs for department:", error);
    throw error;
  }

  return (data ?? []) as Facility[];
}
