// Server functions for staff data from Supabase
import { publicSupabase } from "@/lib/supabase-public";

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
  officeHours?: { day: string; time: string }[] | null;
  socialLinks?: { linkedin?: string; googleScholar?: string; orcid?: string } | null;
  isHod?: boolean;
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
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const [assignmentRes, achievementsRes] = await Promise.all([
    supabase
      .from("staff_department_assignments")
      .select(
        "designation_id, metadata, rank_group, designation_override, departments(id, name, code)",
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
  ]);

  const assignment = assignmentRes.data;
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
    designation:
      designationTitle || (assignment as any)?.designation_override || data.designation || "",
    rankGroup: (assignment as any)?.rank_group ?? data.rank_group ?? "Support",
    employeeCode: data.employee_code ?? "",
    expertise: (data.expertise as string[] | null) ?? [],
    email: data.email,
    photoUrl: data.photo_url ?? null,
    bio: data.bio ?? null,
    officeHours: data.office_hours as StaffMember["officeHours"],
    socialLinks: data.social_links as StaffMember["socialLinks"],
    joiningYear: data.joining_year ?? null,
    pastExperienceYears: data.past_experience_years ?? null,
    department: dept ? { id: dept.id, name: dept.name, code: dept.code } : null,
    achievements,
  };
}

/**
 * Fetch staff assigned to a department.
 */
export async function getStaffByDepartmentId(departmentId: string): Promise<StaffMember[]> {
  const supabase = publicSupabase();
  const { data: assignments, error: aErr } = await supabase
    .from("staff_department_assignments")
    .select("staff_id, designation_id, is_primary, metadata, rank_group, designation_override")
    .eq("department_id", departmentId)
    .eq("status", "published");

  if (aErr || !assignments || assignments.length === 0) return [] as StaffMember[];

  const staffIds = assignments.map((a) => a.staff_id);
  const designationIds = [
    ...new Set(assignments.map((a) => a.designation_id).filter((id): id is string => Boolean(id))),
  ];

  const [{ data: profiles }, { data: designations }] = await Promise.all([
    supabase
      .from("staff_profiles")
      .select(
        "id, title, first_name, last_name, email, metadata, expertise, employee_code, photo_url, rank_group, designation",
      )
      .in("id", staffIds),
    supabase.from("designations").select("id, title").in("id", designationIds),
  ]);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
  const designMap = new Map((designations ?? []).map((d) => [d.id, d.title]));

  return assignments.map((a): StaffMember => {
    const sp = profileMap.get(a.staff_id);
    const designationId = a.designation_id;
    const designTitle = designationId ? (designMap.get(designationId) ?? "") : "";
    const titlePrefix = sp?.title ? `${sp.title} ` : "";
    const fullName = `${titlePrefix}${sp?.first_name ?? ""} ${sp?.last_name ?? ""}`.trim();

    return {
      id: sp?.id ?? "",
      name: fullName,
      designation: designTitle || a.designation_override || sp?.designation || "",
      rankGroup: a.rank_group ?? sp?.rank_group ?? "Support",
      employeeCode: sp?.employee_code ?? "",
      expertise: (sp?.expertise as string[] | null) ?? [],
      email: sp?.email ?? null,
      photoUrl: sp?.photo_url ?? null,
      isHod: Boolean(a.is_primary) && (a.rank_group === "HOD" || sp?.rank_group === "HOD"),
      achievements: [],
    };
  });
}
