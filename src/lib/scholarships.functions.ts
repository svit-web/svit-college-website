import { publicSupabase, unwrap } from "@/lib/supabase-public";

// Next.js admin panel writes go through upsertScholarshipNext / deleteScholarshipNext
// in src/lib/scholarships-next.ts instead.

export interface Scholarship {
  id: string;
  name: string;
  type: string;
  description: string | null;
  eligibility: string | null;
  amount: string | null;
  provider: string | null;
  status: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export async function getAllScholarships() {
  const supabase = publicSupabase();
  const result = await supabase
    .from("scholarships")
    .select("*")
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return unwrap<Scholarship[]>(result as any, "scholarships");
}

export async function getAllScholarshipsAdmin() {
  const supabase = publicSupabase();
  const result = await supabase
    .from("scholarships")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return unwrap<Scholarship[]>(result as any, "scholarships");
}
