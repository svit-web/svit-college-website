// Server functions for staff data from Supabase
import { createServerFn } from '@tanstack/react-start';
import { supabase } from '@/integrations/supabase/client';

export interface StaffMember {
  id: string;
  name: string;
  designation: string;
  rankGroup: string;
  employeeCode: string;
  qualification?: string | null;
  experienceYears?: number | null;
  email?: string | null;
  phone?: string | null;
  photoUrl?: string | null;
  isHod?: boolean;
}

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
      .eq('status', 'published' as any);

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
    const designMap = new Map((designations ?? []).map((d: any) => [d.id, d.title as string]));

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
      };
    });
  });
