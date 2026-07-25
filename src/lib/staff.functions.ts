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
 * Fetch staff assigned to a department, joined with designation titles.
 */
export const getStaffByDepartmentId = createServerFn({ method: 'GET' })
  .validator((departmentId: string) => departmentId)
  .handler(async (ctx) => {
    const { data, error } = await supabase
      .from('staff_department_assignments')
      .select(`
        is_primary,
        metadata,
        staff_profiles (
          id,
          title,
          first_name,
          last_name,
          email,
          metadata
        ),
        designations (
          title
        )
      `)
      .eq('department_id', ctx.data)
      .eq('status', 'published');

    if (error) {
      console.error('Error fetching staff:', error);
      throw error;
    }

    return (data ?? []).map((row): StaffMember => {
      const sp = Array.isArray(row.staff_profiles) ? row.staff_profiles[0] : row.staff_profiles;
      const desig = Array.isArray(row.designations) ? row.designations[0] : row.designations;
      const meta = (sp?.metadata ?? {}) as Record<string, any>;
      const assignMeta = (row.metadata ?? {}) as Record<string, any>;

      const titlePrefix = sp?.title ? `${sp.title} ` : '';
      const fullName = `${titlePrefix}${sp?.first_name ?? ''} ${sp?.last_name ?? ''}`.trim();

      return {
        id: sp?.id ?? '',
        name: fullName,
        designation: desig?.title ?? assignMeta.designation ?? meta.designation ?? '',
        rankGroup: assignMeta.rankGroup ?? meta.rankGroup ?? 'Support',
        employeeCode: meta.employeeCode ?? '',
        qualification: meta.qualification ?? null,
        experienceYears: meta.experienceYears ?? null,
        email: sp?.email ?? null,
        phone: meta.phone ?? null,
        photoUrl: meta.photoUrl ?? null,
        isHod: row.is_primary && (assignMeta.rankGroup === 'HOD' || meta.rankGroup === 'HOD'),
      };
    });
  });
