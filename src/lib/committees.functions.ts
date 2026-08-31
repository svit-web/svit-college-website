// Server functions for committees data from Supabase
import { publicSupabase, unwrap } from "@/lib/supabase-public";

export interface Committee {
  id: string;
  college_id: string;
  name: string;
  slug: string;
  status: "draft" | "published" | "archived";
  metadata: {
    description?: string;
    vision?: string;
    mission?: string;
    keyActivities?: string[];
  };
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all published committees for a specific college
 */
export async function getCommitteesByCollege(collegeId: string) {
  const supabase = publicSupabase();
  const result = await supabase
    .from("committees")
    .select("*")
    .eq("college_id", collegeId)
    .eq("status", "published")
    .order("name", { ascending: true });

  return unwrap<Committee[]>(result as any, "committees");
}

/**
 * Fetch all published committees (for SVIT Group-wide committees)
 */
export async function getAllCommittees() {
  const supabase = publicSupabase();
  const result = await supabase
    .from("committees")
    .select("*")
    .eq("status", "published")
    .order("name", { ascending: true });

  return unwrap<Committee[]>(result as any, "committees");
}

/**
 * Fetch a single committee by slug
 */
export async function getCommitteeBySlug(slug: string) {
  const supabase = publicSupabase();
  const result = await supabase
    .from("committees")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  return unwrap<Committee>(result as any, "committee");
}
