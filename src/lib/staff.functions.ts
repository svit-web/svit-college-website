// Server functions for staff data from Supabase
import { createServerFn } from '@tanstack/react-start';
import { supabase } from '@/integrations/supabase/client';

export interface StaffPublication {
  id: string;
  title: string;
  journalConference: string | null;
  publishDate: string | null;
  doiUrl: string | null;
  abstract: string | null;
}

export interface ResearchInterest {
  id: string;
  interestName: string;
}

export interface ResearchProject {
  id: string;
  title: string;
  fundingAgency: string | null;
  amount: number | null;
  durationYears: number | null;
  projectStatus: string | null;
}

export interface StaffMember {
  id: string;
  name: string;
  designation: string;
  rankGroup: string;
  employeeCode: string;
  qualification?: string | null;
  experienceYears?: number | null;
  joiningYear?: number | null;
  email?: string | null;
  phone?: string | null;
  photoUrl?: string | null;
  bio?: string | null;
  officeHours?: { day: string; time: string }[] | null;
  socialLinks?: { linkedin?: string; googleScholar?: string; orcid?: string } | null;
  isHod?: boolean;
  publications: StaffPublication[];
  researchInterests: ResearchInterest[];
  researchProjects: ResearchProject[];
}

/**
 * Fetch a single staff profile by employee code (stored in metadata->>'employeeCode').
 */
export const getStaffByEmployeeCode = createServerFn({ method: 'GET' })
  .validator((code: string) => code)
  .handler(async (ctx) => {
    const { data, error } = await supabase
      .from('staff_profiles')
      .select('id, title, first_name, last_name, email, bio, office_hours, social_links, metadata')
      .eq('status', 'published')
      .filter('metadata->>employeeCode', 'eq', ctx.data)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    // Fetch assignment, publications, research interests, research projects in parallel
    const [assignmentRes, publicationsRes, interestsRes, projectsRes] = await Promise.all([
      supabase
        .from('staff_department_assignments')
        .select('designation_id, metadata, departments(id, name, code)')
        .eq('staff_id', data.id)
        .eq('is_primary', true)
        .eq('status', 'published')
        .maybeSingle(),
      supabase
        .from('staff_publications')
        .select('publication_id, publications(id, title, journal_conference, publish_date, doi_url, abstract)')
        .eq('staff_id', data.id),
      supabase
        .from('research_interests')
        .select('id, interest_name')
        .eq('staff_id', data.id)
        .eq('status', 'published'),
      supabase
        .from('research_projects')
        .select('id, title, funding_agency, amount, duration_years, project_status')
        .eq('principal_investigator_id', data.id)
        .eq('status', 'published'),
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

    const publications: StaffPublication[] = (publicationsRes.data ?? [])
      .map((sp: any) => {
        const p = Array.isArray(sp.publications) ? sp.publications[0] : sp.publications;
        if (!p) return null;
        return {
          id: p.id,
          title: p.title,
          journalConference: p.journal_conference ?? null,
          publishDate: p.publish_date ?? null,
          doiUrl: p.doi_url ?? null,
          abstract: p.abstract ?? null,
        };
      })
      .filter(Boolean) as StaffPublication[];

    const researchInterests: ResearchInterest[] = (interestsRes.data ?? []).map((r: any) => ({
      id: r.id,
      interestName: r.interest_name,
    }));

    const researchProjects: ResearchProject[] = (projectsRes.data ?? []).map((r: any) => ({
      id: r.id,
      title: r.title,
      fundingAgency: r.funding_agency ?? null,
      amount: r.amount ?? null,
      durationYears: r.duration_years ?? null,
      projectStatus: r.project_status ?? null,
    }));

    const experienceYears = meta.experienceYears ?? null;
    const joiningYear = experienceYears
      ? new Date().getFullYear() - Number(experienceYears)
      : null;

    return {
      id: data.id,
      name: fullName,
      designation: designationTitle || assignMeta.designation || meta.designation || '',
      rankGroup: assignMeta.rankGroup ?? meta.rankGroup ?? 'Support',
      employeeCode: meta.employeeCode ?? '',
      qualification: meta.qualification ?? null,
      experienceYears,
      joiningYear,
      email: data.email,
      phone: meta.phone ?? null,
      photoUrl: meta.photoUrl ?? null,
      bio: (data as any).bio ?? null,
      officeHours: (data as any).office_hours ?? null,
      socialLinks: (data as any).social_links ?? null,
      department: dept ? { id: dept.id, name: dept.name, code: dept.code } : null,
      publications,
      researchInterests,
      researchProjects,
    };
  });

/**
 * Fetch staff assigned to a department using two queries to avoid PostgREST nested join type issues.
 */
export const getStaffByDepartmentId = createServerFn({ method: 'GET' })
  .validator((departmentId: string) => departmentId)
  .handler(async (ctx) => {
    // Step 1: get all assignments for the department
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

    // Step 2: fetch profiles and designations in parallel
    const [{ data: profiles }, { data: designations }] = await Promise.all([
      supabase
        .from('staff_profiles')
        .select('id, title, first_name, last_name, email, metadata')
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
        qualification: meta.qualification ?? null,
        experienceYears: meta.experienceYears ?? null,
        email: sp?.email ?? null,
        phone: meta.phone ?? null,
        photoUrl: meta.photoUrl ?? null,
        isHod: Boolean(a.is_primary) && (assignMeta.rankGroup === 'HOD' || meta.rankGroup === 'HOD'),
        publications: [],
        researchInterests: [],
        researchProjects: [],
      };
    });
  });
