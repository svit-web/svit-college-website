// Server functions for departments data from Supabase
import { createServerFn } from '@tanstack/react-start';
import { supabase } from '@/integrations/supabase/client';

export interface Department {
  id: string;
  college_id: string;
  college_slug: string; // from joined colleges table
  name: string;
  slug: string;
  code: string;
  static_id: string; // maps DB code → legacy static dept ID for content/staff/programs lookup
  head_of_department_id: string | null;
  status: 'draft' | 'published' | 'archived';
  metadata: {
    about?: string;
    description?: string;
    vision?: string;
    mission?: string | string[];
    intake_ug?: number;
    intake_pg?: number;
    established?: number;
    level?: string;
    degreeType?: string | null;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

// Maps DB department code → legacy static department ID used in departmentContent.ts, academics.ts, staff.ts
const CODE_TO_STATIC_ID: Record<string, string> = {
  CA: 'dept-svica-ca',
  GN: 'dept-svion-gn',
  AE: 'dept-svit-be-aeronautical',
  CE: 'dept-svit-be-computer',
  'CE-DIP': 'dept-svit-dip-computer',
  'CE-PG': 'dept-svit-me-computer',
  CIV: 'dept-svit-be-civil',
  'CIV-DIP': 'dept-svit-dip-civil',
  'CIV-PG': 'dept-svit-me-civil',
  CSD: 'dept-svit-be-csd',
  EC: 'dept-svit-be-ec',
  EE: 'dept-svit-be-electrical',
  'EE-DIP': 'dept-svit-dip-electrical',
  IT: 'dept-svit-be-it',
  'IT-DIP': 'dept-svit-dip-it',
  MBA: 'dept-svit-mba',
  MCA: 'dept-svit-mca',
  ME: 'dept-svit-be-mechanical',
  'ME-DIP': 'dept-svit-dip-mechanical',
  ARCH: 'dept-coa-arch',
};

function mapRow(row: any): Department {
  const college = Array.isArray(row.colleges) ? row.colleges[0] : row.colleges;
  return {
    ...row,
    college_slug: college?.slug ?? '',
    static_id: CODE_TO_STATIC_ID[row.code] ?? row.code,
    colleges: undefined, // strip the joined sub-object
  };
}

/**
 * Fetch all published departments
 */
export const getAllDepartments = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { data, error } = await supabase
      .from('departments')
      .select('*, colleges(slug)')
      .eq('status', 'published')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }

    return (data ?? []).map(mapRow) as Department[];
  });

/**
 * Fetch departments by college
 */
export const getDepartmentsByCollege = createServerFn({ method: 'GET' })
  .validator((collegeId: string) => collegeId)
  .handler(async (ctx) => {
    const collegeId = ctx.data;

    const { data, error } = await supabase
      .from('departments')
      .select('*, colleges(slug)')
      .eq('college_id', collegeId)
      .eq('status', 'published')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching departments by college:', error);
      throw error;
    }

    return (data ?? []).map(mapRow) as Department[];
  });

/**
 * Fetch a single department by slug
 */
export const getDepartmentBySlug = createServerFn({ method: 'GET' })
  .validator((slug: string) => slug)
  .handler(async (ctx) => {
    const slug = ctx.data;

    const { data, error } = await supabase
      .from('departments')
      .select('*, colleges(slug)')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error) {
      console.error('Error fetching department by slug:', error);
      throw error;
    }

    return data ? mapRow(data) as Department : null;
  });

/**
 * Fetch a single department by code
 */
export const getDepartmentByCode = createServerFn({ method: 'GET' })
  .validator((code: string) => code)
  .handler(async (ctx) => {
    const code = ctx.data;

    const { data, error } = await supabase
      .from('departments')
      .select('*, colleges(slug)')
      .eq('code', code)
      .eq('status', 'published')
      .maybeSingle();

    if (error) {
      console.error('Error fetching department by code:', error);
      throw error;
    }

    return data ? mapRow(data) as Department : null;
  });

export interface DeptCourse {
  id: string;
  name: string;
  code: string;
  degree_level: 'undergraduate' | 'graduate' | 'certificate';
  metadata: { shortName?: string; [key: string]: any };
}

/**
 * Fetch courses linked to a department
 */
export const getCoursesByDepartmentId = createServerFn({ method: 'GET' })
  .validator((departmentId: string) => departmentId)
  .handler(async (ctx) => {
    const { data, error } = await supabase
      .from('courses')
      .select('id, name, code, degree_level, metadata')
      .eq('department_id', ctx.data)
      .eq('status', 'published')
      .order('degree_level', { ascending: true });

    if (error) throw error;
    return (data ?? []) as DeptCourse[];
  });
