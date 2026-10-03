// Server functions for staff data from Supabase
import { publicSupabase } from "@/lib/supabase-public";
import {
  STAFF_POST_COLUMNS,
  formatDesignationWithPosts,
  holdsDepartmentHeadPost,
  postsForIds,
} from "@/lib/staff-posts";

export interface StaffAchievement {
  id: string;
  type: string;
  title: string;
  year: number | null;
  description: string | null;
}

export interface StaffMember {
  id: string;
  name: string;
  designation: string;
  rankGroup: string;
  employeeCode: string;
  expertise: string[];
  email?: string | null;
  photoUrl?: string | null;
  bio?: string | null;
  qualification?: string | null;
  officeHours?: { day: string; time: string }[] | null;
  socialLinks?: { linkedin?: string; googleScholar?: string; orcid?: string } | null;
  isHod?: boolean;
  musterNumber?: number | null;
  joiningYear?: number | null;
  pastExperienceYears?: number | null;
  department?: { id: string; name: string; code: string } | null;
  achievements: StaffAchievement[];
}

/**
 * Fetch a single staff profile by employee code.
 */
export async function getStaffByEmployeeCode(code: string): Promise<StaffMember | null> {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from("staff_profiles")
    .select(
      "id, title, first_name, last_name, email, bio, office_hours, social_links, metadata, expertise, joining_year, past_experience_years, employee_code, photo_url, rank_group, designation, qualification",
    )
    .eq("status", "published")
    .eq("employee_code", code)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const [assignmentRes, achievementsRes, postsRes] = await Promise.all([
    supabase
      .from("staff_department_assignments")
      .select(
        "designation_id, metadata, rank_group, designation_override, post_ids, departments(id, name, code)",
      )
      .eq("staff_id", data.id)
      .eq("is_primary", true)
      .eq("status", "published")
      .maybeSingle(),
    supabase
      .from("staff_achievements")
      .select("id, type, title, year, description")
      .eq("staff_id", data.id)
      .is("deleted_at", null)
      .order("year", { ascending: false }),
    supabase
      .from("staff_posts")
      .select(STAFF_POST_COLUMNS)
      .eq("status", "published")
      .is("deleted_at", null),
  ]);

  const assignment = assignmentRes.data;
  const posts = postsRes.data ?? [];
  const dept = assignment
    ? Array.isArray((assignment as any).departments)
      ? (assignment as any).departments[0]
      : (assignment as any).departments
    : null;

  let designationTitle = "";
  if (assignment?.designation_id) {
    const { data: desig } = await supabase
      .from("designations")
      .select("title")
      .eq("id", assignment.designation_id)
      .eq("status", "published")
      .is("deleted_at", null)
      .maybeSingle();
    designationTitle = desig?.title ?? "";
  }

  const titlePrefix = data.title ? `${data.title} ` : "";
  const fullName = `${titlePrefix}${data.first_name} ${data.last_name}`.trim();

  const achievements: StaffAchievement[] = (achievementsRes.data ?? []).map((a: any) => ({
    id: a.id,
    type: a.type,
    title: a.title,
    year: a.year ?? null,
    description: a.description ?? null,
  }));

  return {
    id: data.id,
    name: fullName,
    designation: formatDesignationWithPosts(
      designationTitle || (assignment as any)?.designation_override || data.designation || "",
      postsForIds(assignment?.post_ids, posts),
    ),
    rankGroup: holdsDepartmentHeadPost(assignment?.post_ids, posts)
      ? "HOD"
      : ((assignment as any)?.rank_group ?? data.rank_group ?? "Support"),
    employeeCode: data.employee_code ?? "",
    expertise: (data.expertise as string[] | null) ?? [],
    email: data.email,
    photoUrl: data.photo_url ?? null,
    bio: data.bio ?? null,
    qualification: data.qualification ?? null,
    officeHours: data.office_hours as StaffMember["officeHours"],
    socialLinks: data.social_links as StaffMember["socialLinks"],
    joiningYear: data.joining_year ?? null,
    pastExperienceYears: data.past_experience_years ?? null,
    department: dept ? { id: dept.id, name: dept.name, code: dept.code } : null,
    achievements,
  };
}
