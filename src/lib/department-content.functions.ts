// Server functions for a department's Staff / Achievements & Clubs / Industry
// Interaction tabs. Split out from departments.functions.ts since these query
// different tables (staff_department_assignments, achievements,
// department_activities) keyed off a department's real id.
import { publicSupabase } from '@/lib/supabase-public';

export interface DeptStaffMember {
  id: string;
  name: string;
  designation: string;
  rankGroup: 'HOD' | 'Faculty' | 'Support';
  email: string | null;
  avatarUrl: string | null;
  employeeCode: string | null;
  joiningYear: number | null;
  pastExperienceYears: number | null;
}

export async function getStaffByDepartmentId(departmentId: string) {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from('staff_department_assignments')
    .select(`
      is_primary,
      designations ( title ),
      staff_profiles ( id, title, first_name, last_name, email, joining_year, past_experience_years, status, employee_code, photo_url )
    `)
    .eq('department_id', departmentId)
    .eq('status', 'published');

  if (error) {
    console.error('Error fetching department staff:', error);
    throw error;
  }

  return (data ?? [])
    .filter((a: any) => a.staff_profiles?.status === 'published')
    .map((a: any): DeptStaffMember => {
      const s = a.staff_profiles;
      const designation = a.designations?.title ?? 'Faculty';
      const rankGroup: DeptStaffMember['rankGroup'] = a.is_primary && /head|hod/i.test(designation)
        ? 'HOD'
        : /professor|lecturer|assistant/i.test(designation)
        ? 'Faculty'
        : 'Support';
      return {
        id: s.id,
        name: `${s.title ? s.title + ' ' : ''}${s.first_name} ${s.last_name}`.trim(),
        designation,
        rankGroup,
        email: s.email ?? null,
        avatarUrl: s.photo_url ?? null,
        employeeCode: s.employee_code ?? null,
        joiningYear: s.joining_year ?? null,
        pastExperienceYears: s.past_experience_years ?? null,
      };
    });
}

export interface DeptAchievement {
  id: string;
  title: string;
  date: string;
  description: string | null;
}

export async function getAchievementsByDepartmentId(departmentId: string) {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from('achievements')
    .select('id, title, date, description')
    .eq('department_id', departmentId)
    .eq('status', 'published')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching department achievements:', error);
    throw error;
  }

  return (data ?? []) as DeptAchievement[];
}

export interface DeptClub {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
}

/**
 * Clubs mapped to this department via student_clubs.department_id.
 * Admin sets this on the club itself (/admin/tables/student_clubs) —
 * same row also powers /campus-life/clubs, so one edit updates both.
 */
export async function getClubsByDepartmentId(departmentId: string) {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from('student_clubs')
    .select('id, name, slug, description, logo_url')
    .eq('department_id', departmentId)
    .eq('status', 'published')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching department clubs:', error);
    throw error;
  }

  return (data ?? []).map((c): DeptClub => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    logoUrl: c.logo_url,
  }));
}

export type DeptActivityType = 'sttp_fdp' | 'expert_lecture' | 'seminar_workshop' | 'mou' | 'industry_visit';

export interface DeptActivity {
  id: string;
  type: DeptActivityType;
  title: string;
  startDate: string;
  endDate: string | null;
  notes: string | null;
  documentUrl: string | null;
  company: string | null;
}

export async function getDepartmentActivities(departmentId: string) {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from('department_activities')
    .select('*')
    .eq('department_id', departmentId)
    .eq('status', 'published')
    .order('start_date', { ascending: false });

  if (error) {
    console.error('Error fetching department activities:', error);
    throw error;
  }

  return (data ?? []).map((a: any): DeptActivity => ({
    id: a.id,
    type: a.activity_type,
    title: a.title,
    startDate: a.start_date,
    endDate: a.end_date,
    notes: a.notes,
    documentUrl: a.document_url,
    company: a.company,
  }));
}
