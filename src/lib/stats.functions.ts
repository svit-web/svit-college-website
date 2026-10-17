// Live, exact counts derived from real content tables — shared by the
// homepage stats strip and the Placement nav panel so the two can never
// disagree. Deliberately unrounded: rounding was tried and dropped since it
// broke down on the small counts (Programmes, Years of Excellence).
import { publicSupabase } from "@/lib/supabase-public";
import { getMiscSettings } from "@/lib/site-settings.functions";

export interface LiveStats {
  recruitersCount: number;
  placedStudentsCount: number;
  facultyCount: number;
  programmesCount: number;
  yearsOfExcellence: number;
}

export async function getLiveStats(): Promise<LiveStats> {
  const supabase = publicSupabase();

  const [recruitersRes, placedRes, facultyRes, coursesRes, misc] = await Promise.all([
    supabase
      .from("recruiters")
      .select("company_name")
      .eq("status", "published")
      .is("deleted_at", null),
    supabase
      .from("placed_students")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("staff_profiles")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .is("deleted_at", null),
    supabase.from("courses").select("id", { count: "exact", head: true }).eq("status", "published"),
    getMiscSettings(),
  ]);

  const distinctRecruiters = new Set((recruitersRes.data ?? []).map((r) => r.company_name)).size;
  const currentYear = new Date().getFullYear();
  const yearEstablished = misc?.year_established;

  return {
    recruitersCount: distinctRecruiters,
    placedStudentsCount: placedRes.count ?? 0,
    facultyCount: facultyRes.count ?? 0,
    programmesCount: coursesRes.count ?? 0,
    yearsOfExcellence: yearEstablished ? currentYear - yearEstablished : 0,
  };
}
