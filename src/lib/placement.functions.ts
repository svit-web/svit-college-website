// Server functions for placement statistics, recruiters and placed students from Supabase
import { createServerFn } from '@tanstack/react-start';
import { supabase } from '@/integrations/supabase/client';

export interface PlacementStatistics {
  id: string;
  department_id: string | null;
  academic_year: string;
  total_students: number;
  placed_students: number;
  highest_package: number | null;
  average_package: number | null;
  recruiters_count: number | null;
  status: 'draft' | 'published' | 'archived';
  metadata: { [key: string]: string | number | boolean | null };
  created_at: string;
  updated_at: string;
}

export interface Recruiter {
  id: string;
  company_name: string;
  logo_url: string;
  website_url: string | null;
  sort_order: number;
  college_codes?: string[] | null;
  metadata: { colleges?: string[]; [key: string]: any };
  created_at: string;
  updated_at: string;
}

// ── Placement Statistics ──────────────────────────────────────

export const getPlacementStatsByCollege = createServerFn({ method: 'GET' })
  .validator((collegeSlug: string) => collegeSlug)
  .handler(async (ctx) => {
    let query = supabase
      .from('departments')
      .select('id, colleges!inner(slug)')
      .eq('status', 'published');

    if (ctx.data !== 'overview') {
      query = query.eq('colleges.slug' as any, ctx.data);
    }

    const { data: depts } = await query;
    if (!depts?.length) return [] as PlacementStatistics[];

    const deptIds = depts.map((d: any) => d.id);

    const { data, error } = await supabase
      .from('placement_statistics')
      .select('*')
      .in('department_id', deptIds)
      .eq('status', 'published')
      .order('academic_year', { ascending: false });

    if (error) {
      console.error('Error fetching placement statistics:', error);
      return [] as PlacementStatistics[];
    }

    return (data ?? []) as unknown as PlacementStatistics[];
  });

// ── Recruiters ────────────────────────────────────────────────

export const getAllRecruiters = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { data } = await supabase
      .from('recruiters')
      .select('*')
      .eq('status', 'published')
      .order('sort_order', { ascending: true });
    return (data ?? []) as unknown as Recruiter[];
  });

export const getRecruitersByCollege = createServerFn({ method: 'GET' })
  .validator((collegeSlug: string) => collegeSlug)
  .handler(async (ctx) => {
    const fetchAll = async () => {
      const { data } = await supabase
        .from('recruiters')
        .select('*')
        .eq('status', 'published')
        .order('sort_order', { ascending: true });
      return (data ?? []) as unknown as Recruiter[];
    };

    if (ctx.data === 'overview') return fetchAll();

    try {
      const { data, error } = await (supabase as any)
        .from('recruiters')
        .select('*')
        .eq('status', 'published')
        .or(`college_codes.cs.{${ctx.data}},college_codes.is.null`)
        .order('sort_order', { ascending: true });

      if (error) {
        console.warn('college_codes not available, falling back:', error.message);
        return fetchAll();
      }
      return (data ?? []) as unknown as Recruiter[];
    } catch {
      return fetchAll();
    }
  });

// ── Placement Cell ────────────────────────────────────────────

export interface PlacementCell {
  id: string;
  college_code: string;
  about_text: string;
  hero_title: string | null;
  hero_subtitle: string | null;
  officer_name: string | null;
  officer_designation: string | null;
  officer_phone: string | null;
  officer_email: string | null;
  officer_photo_url: string | null;
  default_student_placeholder_url: string | null;
}

export const getPlacementCell = createServerFn({ method: 'GET' })
  .validator((collegeCode: string) => collegeCode)
  .handler(async (ctx) => {
    const { data, error } = await (supabase as any)
      .from('placement_cells')
      .select('*')
      .eq('college_code', ctx.data)
      .maybeSingle();

    if (error) {
      console.error('Error fetching placement cell:', error);
      return null;
    }
    return data as PlacementCell | null;
  });

// ── College Lookup ────────────────────────────────────────────

export const getCollegeBySlug = createServerFn({ method: 'GET' })
  .validator((slug: string) => slug)
  .handler(async (ctx) => {
    const { data, error } = await supabase
      .from('colleges')
      .select('id, slug, code, name, metadata')
      .eq('slug', ctx.data)
      .eq('status', 'published')
      .is('deleted_at', null)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id as string,                                        // UUID for FK queries
      code: data.slug,
      name: data.name,
      shortCode: (data.metadata as any)?.shortCode ?? data.code,
    };
  });

/** Fetch all published colleges — used by admin dropdowns */
export const getAllColleges = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { data, error } = await supabase
      .from('colleges')
      .select('id, slug, name')
      .eq('status', 'published')
      .order('sort_order', { ascending: true });
    if (error) return [];
    return (data ?? []) as unknown as { id: string; slug: string; name: string; short_code: string }[];
  });

/** Fetch departments for a given college UUID — used by admin dropdowns */
export const getDepartmentsByCollege = createServerFn({ method: 'GET' })
  .validator((collegeId: string) => collegeId)
  .handler(async (ctx) => {
    const { data, error } = await supabase
      .from('departments')
      .select('id, name, slug')
      .eq('college_id', ctx.data)
      .eq('status', 'published')
      .order('name', { ascending: true });
    if (error) return [];
    return (data ?? []) as { id: string; name: string; slug: string }[];
  });

// ── Placed Students ───────────────────────────────────────────

export interface PlacedStudent {
  id: string;
  college_id: string;
  department_id: string | null;
  student_name: string;
  company_name: string;
  photo_url: string | null;
  batch_year: string | null;
  package_lpa: number | null;
  status: string;
  created_at: string;
  updated_at: string;
  // From join:
  college?: { id: string; slug: string; name: string } | null;
  department?: { id: string; name: string; slug: string } | null;
}

/**
 * Fetch published placed students for a college by its UUID.
 * Joins college + department for display names.
 * Returns [] gracefully if table is missing.
 */
export const getPlacedStudentsByCollege = createServerFn({ method: 'GET' })
  .validator((input: { collegeId: string | null; isOverview: boolean }) => input)
  .handler(async (ctx) => {
    try {
      let query = (supabase as any)
        .from('placed_students')
        .select('*, college:colleges(id, slug, name), department:departments(id, name, slug)')
        .eq('status', 'published')
        .order('batch_year', { ascending: false })
        .order('created_at', { ascending: false });

      if (!ctx.data.isOverview && ctx.data.collegeId) {
        query = query.eq('college_id', ctx.data.collegeId);
      }

      const { data, error } = await query;

      if (error) {
        if (error.code === 'PGRST205' || error.code === '42P01') return [] as PlacedStudent[];
        console.error('Error fetching placed students:', error);
        return [] as PlacedStudent[];
      }

      return (data ?? []) as unknown as PlacedStudent[];
    } catch {
      return [] as PlacedStudent[];
    }
  });
