// Server functions for centers data from Supabase
import { publicSupabase, unwrap } from "@/lib/supabase-public";

export interface Center {
  id: string;
  college_id: string | null;
  institute_id: string | null;
  name: string;
  slug: string;
  status: "draft" | "published" | "archived";
  subtitle: string | null;
  accent_color: string | null;
  description: string | null;
  metadata: {
    highlights?: Array<{ title: string; description: string }>;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all published centers
 */
export async function getAllCenters() {
  const supabase = publicSupabase();
  const result = await supabase
    .from("centers")
    .select("*")
    .eq("status", "published")
    .order("name", { ascending: true });

  return unwrap<Center[]>(result as any, "centers");
}

/**
 * Fetch a single center by slug
 */
export async function getCenterBySlug(slug: string) {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from("centers")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw error;

  return data as Center | null;
}
