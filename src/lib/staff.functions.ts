// Server functions for staff data from Supabase
import { createServerFn } from '@tanstack/react-start';
import { supabase } from '@/integrations/supabase/client';

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
  phone?: string | null;
  photoUrl?: string | null;
  bio?: string | null;
  officeHours?: { day: string; time: string }[] | null;
  socialLinks?: { linkedin?: string; googleScholar?: string; orcid?: string } | null;
  isHod?: boolean;
  joiningYear?: number | null;
  pastExperienceYears?: number | null;
  achievements: StaffAchievement[];
}

/**
 * Fetch a single staff profile by employee code (stored in metadata->>'employeeCode').
 */
export const getStaffByEmployeeCode = createServerFn({ method: 'GET' })
  .validator((code: string) => code)
  .handler(async (ctx) => {
    const { data, error } = await supabase
      .from('staff_profiles')
      .select('id, title, first_name, last_name, email, phone, bio, office_hours, social_links, metadata, expertise, joining_year, past_experience_years')
      .eq('status', 'published')
      .filter('metadata->>employeeCode', 'eq', ctx.data)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const [assignmentRes, achievementsRes] = await Promise.all([
      supabase
        .from('staff_department_assignments')
        .select('designation_id, metadata, departments(id, name, code)')
        .eq('staff_id', data.id)
        .eq('is_primary', true)
        .eq('status', 'published')
        .maybeSingle(),
      (supabase as any)
        .from('staff_achievements')
        .select('id, type, title, year, description')
        .eq('staff_id', data.id)
        .is('deleted_at', null)
        .order('year', { ascending: false }),
    ]);

    const assignment = assignmentRes.data;
    const dept = assignment
      ? (Array.isArray((assignment as any).departments)
          ? (assignment as any).departments[0]
          : (assignment as any).departments)
      : null;

    let designationTitle = '';
    if (assignment?.designation_id) {
      const { data: desig } = await supabase
        .from('designations')
        .select('title')
        .eq('id', assignment.designation_id)
        .maybeSingle();
      designationTitle = desig?.title ?? '';
    }

    const meta = (data.metadata ?? {}) as Record<string, any>;
    const assignMeta = ((assignment?.metadata ?? {}) as Record<string, any>);
    const titlePrefix = data.title ? `${data.title} ` : '';
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
      designation: designationTitle || assignMeta.designation || meta.designation || '',
      rankGroup: assignMeta.rankGroup ?? meta.rankGroup ?? 'Support',
      employeeCode: meta.employeeCode ?? '',
      expertise: (data as any).expertise ?? [],
      email: data.email,
      phone: data.phone ?? meta.phone ?? null,
      photoUrl: meta.photoUrl ?? null,
      bio: (data as any).bio ?? null,
      officeHours: (data as any).office_hours ?? null,
      socialLinks: (data as any).social_links ?? null,
      joiningYear: data.joining_year ?? null,
      pastExperienceYears: data.past_experience_years ?? null,
      department: dept ? { id: dept.id, name: dept.name, code: dept.code } : null,
      achievements,
    };
  });

/**
 * Fetch staff assigned to a department.
 */
export const getStaffByDepartmentId = createServerFn({ method: 'GET' })
  .validator((departmentId: string) => departmentId)
  .handler(async (ctx) => {
    const { data: assignments, error: aErr } = await supabase
      .from('staff_department_assignments')
      .select('staff_id, designation_id, is_primary, metadata')
      .eq('department_id', ctx.data)
      .eq('status', 'published');

    if (aErr || !assignments || assignments.length === 0) return [] as StaffMember[];

    const staffIds = assignments.map((a) => a.staff_id);
    const designationIds = [
      ...new Set(
        assignments
          .map((a) => (a as any).designation_id as string | null)
          .filter((id): id is string => Boolean(id))
      ),
    ];

    const [{ data: profiles }, { data: designations }] = await Promise.all([
      supabase
        .from('staff_profiles')
        .select('id, title, first_name, last_name, email, metadata, expertise')
        .in('id', staffIds),
      supabase
        .from('designations')
        .select('id, title')
        .in('id', designationIds),
    ]);

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
    const designMap = new Map((designations ?? []).map((d) => [d.id, d.title]));

    return assignments.map((a): StaffMember => {
      const sp = profileMap.get(a.staff_id);
      const designationId = (a as any).designation_id as string | null;
      const designTitle = designationId ? (designMap.get(designationId) ?? '') : '';
      const meta = (sp?.metadata ?? {}) as Record<string, any>;
      const assignMeta = (a.metadata ?? {}) as Record<string, any>;
      const titlePrefix = sp?.title ? `${sp.title} ` : '';
      const fullName = `${titlePrefix}${sp?.first_name ?? ''} ${sp?.last_name ?? ''}`.trim();

      return {
        id: sp?.id ?? '',
        name: fullName,
        designation: designTitle || assignMeta.designation || meta.designation || '',
        rankGroup: assignMeta.rankGroup ?? meta.rankGroup ?? 'Support',
        employeeCode: meta.employeeCode ?? '',
        expertise: (sp as any)?.expertise ?? [],
        email: sp?.email ?? null,
        phone: meta.phone ?? null,
        photoUrl: meta.photoUrl ?? null,
        isHod: Boolean(a.is_primary) && (assignMeta.rankGroup === 'HOD' || meta.rankGroup === 'HOD'),
        achievements: [],
      };
    });
  });
