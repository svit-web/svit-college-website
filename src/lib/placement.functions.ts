// Server functions for placement statistics and recruiters from Supabase
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
  metadata: {
    colleges?: string[];
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Fetch published placement statistics for a college (by slug).
 * Aggregates across all departments belonging to that college.
 * Returns rows ordered newest-first.
 */
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
      throw error;
    }

    return (data ?? []) as unknown as PlacementStatistics[];
  });

/**
 * Fetch published recruiters, optionally filtered by college slug via metadata.colleges array.
 */
export const getAllRecruiters = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { data, error } = await supabase
      .from('recruiters')
      .select('*')
      .eq('status', 'published')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching recruiters:', error);
      throw error;
    }

    return (data ?? []) as Recruiter[];
  });

export interface PlacementCell {
  id: string;
  college_code: string;
  about_text: string;
  officer_name: string;
  officer_designation: string;
  officer_phone: string;
  officer_email: string;
  officer_photo_url: string | null;
  placed_students: { studentName: string; companyName: string; photo: string | null }[];
  default_student_placeholder_url: string | null;
}

/**
 * Fetch placement cell info for a college by its code/slug.
 */
export const getPlacementCell = createServerFn({ method: 'GET' })
  .validator((collegeCode: string) => collegeCode)
  .handler(async (ctx) => {
    const { data, error } = await (supabase as any)
      .from('placement_cells')
      .select('*')
      .eq('college_code', ctx.data)
      .eq('status', 'published')
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      console.error('Error fetching placement cell:', error);
      return null;
    }

    return data as PlacementCell | null;
  });

/**
 * Fetch a college by slug for placement page routing.
 */
export const getCollegeBySlug = createServerFn({ method: 'GET' })
  .validator((slug: string) => slug)
  .handler(async (ctx) => {
    const { data, error } = await supabase
      .from('colleges')
      .select('slug, code, name, metadata')
      .eq('slug', ctx.data)
      .eq('status', 'published')
      .is('deleted_at', null)
      .maybeSingle();

    if (error) return null;
    if (!data) return null;

    return {
      code: data.slug,
      name: data.name,
      shortCode: (data.metadata as any)?.shortCode ?? data.code,
    };
  });

export interface PlacedStudent {
  id: string;
  college_code: string;
  student_name: string;
  company_name: string;
  photo_url: string | null;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

/**
 * Fetch published placed students for a college by its code.
 * If overview, returns all published placed students.
 */
export const getPlacedStudentsByCollege = createServerFn({ method: 'GET' })
  .validator((collegeCode: string) => collegeCode)
  .handler(async (ctx) => {
    let query = supabase
      .from('placed_students' as any)
      .select('*')
      .eq('status', 'published');

    if (ctx.data !== 'overview') {
      query = query.eq('college_code', ctx.data);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching placed students:', error);
      return [] as PlacedStudent[];
    }

    return (data ?? []) as unknown as PlacedStudent[];
  });
