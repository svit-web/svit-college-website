import { publicSupabase, unwrap } from "@/lib/supabase-public";

// Admin-only reads for the Admissions ▸ Details tab. Writes go through
// updateAdmissionsDetails in src/lib/admissions-details-next.ts.
// Scoped to regular courses only (is_programme = false, department_id set) —
// programme landing-page rows are a separate, global-admin-only concern.

export interface CourseAdmissionsDetails {
  id: string;
  name: string;
  code: string;
  intake: number | null;
  fees_per_semester: string | null;
  duration: string | null;
  eligibility: string | null;
  brochure_file_url: string | null;
  department: { name: string; college: { name: string } } | null;
}

export async function getAllCourseAdmissionsDetails() {
  const supabase = publicSupabase();
  const result = await supabase
    .from("courses")
    .select(
      "id, name, code, intake, fees_per_semester, duration, eligibility, brochure_file_url, department:departments(name, college:colleges(name))",
    )
    .eq("is_programme", false)
    .not("department_id", "is", null)
    .is("deleted_at", null)
    .order("name", { ascending: true });

  return unwrap<CourseAdmissionsDetails[]>(result as any, "courses");
}
