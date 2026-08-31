// Server functions for programme-level data from Supabase
import { publicSupabase, unwrap } from "@/lib/supabase-public";

export interface Programme {
  id: string;
  code: string;
  name: string;
  status: "draft" | "published" | "archived";
  is_programme: boolean;
  programme_slug: string;
  tagline: string;
  short_name: string;
  full_name: string;
  duration: string;
  eligibility: string;
  intake: number;
  color: string;
  accent: string;
  description: string;
  metadata: {
    outcomes: string[];
    highlights: string[];
  };
}

export interface EngDeptRecord {
  id: string;
  code: string;
  name: string;
  slug: string;
  status: "draft" | "published" | "archived";
  short_name: string;
  theme_color: string;
  overview: string;
  metadata: {
    labs: string[];
    careers: string[];
  };
}

/**
 * Fetch all programme-level entries (is_programme = true)
 */
export async function getAllProgrammes() {
  const supabase = publicSupabase();
  const result = await supabase
    .from("courses")
    .select("*")
    .eq("status", "published")
    .eq("is_programme", true)
    .is("department_id", null);

  return unwrap<Programme[]>(result as any, "programmes");
}

/**
 * Fetch a single programme by its code
 */
export async function getProgrammeBySlug(slug: string) {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("status", "published")
    .eq("code", slug)
    .eq("is_programme", true)
    .is("department_id", null)
    .maybeSingle();

  if (error) throw error;

  return data as unknown as Programme | null;
}

/**
 * Fetch all UG engineering departments (BE level, SVIT college)
 */
export async function getEngDepts() {
  const supabase = publicSupabase();
  const result = await supabase
    .from("departments")
    .select("id, code, name, slug, status, short_name, theme_color, overview, metadata")
    .eq("status", "published")
    .eq("level", "UG")
    .eq("degree_type", "BE")
    .not("slug", "is", null);

  return unwrap<EngDeptRecord[]>(result as any, "engineering departments");
}

/**
 * Fetch a single engineering department by its slug
 */
export async function getEngDeptBySlug(engSlug: string) {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from("departments")
    .select("id, code, name, slug, status, short_name, theme_color, overview, metadata")
    .eq("status", "published")
    .eq("slug", engSlug)
    .maybeSingle();

  if (error) throw error;

  return data as EngDeptRecord | null;
}
