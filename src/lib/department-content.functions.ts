// Server functions for a department's Staff / Achievements & Clubs / Industry
// Interaction tabs. Split out from departments.functions.ts since these query
// different tables (staff_department_assignments, achievements,
// department_activities) keyed off a department's real id.
import { createServerFn } from '@tanstack/react-start';
import { supabase } from '@/integrations/supabase/client';

export interface DeptStaffMember {
  id: string;
  name: string;
  designation: string;
  rankGroup: 'HOD' | 'Faculty' | 'Support';
  email: string | null;
  avatarUrl: string | null;
  employeeCode: string | null;
}

export const getStaffByDepartmentId = createServerFn({ method: 'GET' })
  .validator((departmentId: string) => departmentId)
  .handler(async (ctx) => {
    const departmentId = ctx.data;

    const { data, error } = await supabase
      .from('staff_department_assignments')
      .select(`
        is_primary,
        designations ( title ),
        staff_profiles ( id, title, first_name, last_name, email, avatar_url, status, metadata )
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
          avatarUrl: (s.metadata as any)?.photoUrl || s.avatar_url || null,
          employeeCode: (s.metadata as any)?.employeeCode ?? null,
        };
      });
  });

export interface DeptAchievement {
  id: string;
  title: string;
  date: string;
  description: string | null;
}

export const getAchievementsByDepartmentId = createServerFn({ method: 'GET' })
  .validator((departmentId: string) => departmentId)
  .handler(async (ctx) => {
    const departmentId = ctx.data;

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
  });

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

export const getDepartmentActivities = createServerFn({ method: 'GET' })
  .validator((departmentId: string) => departmentId)
  .handler(async (ctx) => {
    const departmentId = ctx.data;

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
  });
