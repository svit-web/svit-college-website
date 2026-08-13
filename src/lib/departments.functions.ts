// Server functions for departments data from Supabase
import { publicSupabase } from '@/lib/supabase-public';

export interface Department {
  id: string;
  college_id: string;
  college_slug: string; // from joined colleges table
  name: string;
  slug: string;
  code: string;
  static_id: string; // maps DB code → legacy static dept ID for content/staff/programs lookup
  head_of_department_id: string | null;
  logo_url: string | null;
  status: 'draft' | 'published' | 'archived';
  about: string | null;
  vision: string | null;
  mission: string | string[] | null;
  intake_ug: number | null;
  intake_pg: number | null;
  established_year: number | null;
  level: string | null;
  degree_type: string | null;
  short_name: string | null;
  theme_color: string | null;
  overview: string | null;
  metadata: {
    labs?: string[];
    careers?: string[];
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

// Maps DB department code → legacy static department ID used in departmentContent.ts, academics.ts, staff.ts
const CODE_TO_STATIC_ID: Record<string, string> = {
  // Other colleges
  CA:   'dept-svica-ca',
  GN:   'dept-svion-gn',
  ARCH: 'dept-coa-arch',
  // SVIT Degree
  AE:   'dept-svit-be-aeronautical',
  CE:   'dept-svit-be-computer',
  CIV:  'dept-svit-be-civil',
  CSD:  'dept-svit-be-csd',
  EC:   'dept-svit-be-ec',
  EE:   'dept-svit-be-electrical',
  IT:   'dept-svit-be-it',
  MBA:  'dept-svit-mba',
  MCA:  'dept-svit-mca',
  ME:   'dept-svit-be-mechanical',
  // SVIT Diploma
  'DP-CE':  'dept-svit-dip-computer',
  'DP-CIV': 'dept-svit-dip-civil',
  'DP-EE':  'dept-svit-dip-electrical',
  'DP-IT':  'dept-svit-dip-it',
  'DP-ME':  'dept-svit-dip-mechanical',
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
export async function getAllDepartments() {
  const supabase = publicSupabase();
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
}

/**
 * Fetch departments by college
 */
export async function getDepartmentsByCollege(collegeId: string) {
  const supabase = publicSupabase();
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
}

/**
 * Fetch a single department by slug
 */
export async function getDepartmentBySlug(slug: string) {
  const supabase = publicSupabase();
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
}

/**
 * Fetch a single department by code
 */
export async function getDepartmentByCode(code: string) {
  const supabase = publicSupabase();
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
}

export interface DeptCourse {
  id: string;
  name: string;
  code: string;
  degree_level: 'undergraduate' | 'graduate' | 'certificate';
  short_name: string | null;
  year_started: number | null;
  duration_years: number | null;
  intake: number | null;
  metadata: { [key: string]: any };
}

/**
 * Fetch courses linked to a department
 */
export async function getCoursesByDepartmentId(departmentId: string) {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from('courses')
    .select('id, name, code, degree_level, metadata, short_name, year_started, duration_years, intake')
    .eq('department_id', departmentId)
    .eq('status', 'published')
    .order('degree_level', { ascending: true });

  if (error) throw error;
  return (data ?? []) as DeptCourse[];
}

/**
 * Fetch a single course by ID
 */
export async function getCourseById(id: string) {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from('courses')
    .select('id, name, code, degree_level, metadata, department_id, short_name, year_started, duration_years, intake')
    .eq('id', id)
    .eq('status', 'published')
    .maybeSingle();

  if (error) throw error;
  return data as (DeptCourse & { department_id: string }) | null;
}

/**
 * Fetch a course by ID with its department info
 */
export async function getCourseWithDept(id: string) {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from('courses')
    .select('id, name, code, degree_level, metadata, department_id, short_name, year_started, duration_years, intake, departments(id, name, code, slug)')
    .eq('id', id)
    .eq('status', 'published')
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const dept = Array.isArray(data.departments) ? data.departments[0] : data.departments;
  return {
    id: data.id,
    name: data.name,
    code: data.code,
    degree_level: data.degree_level as DeptCourse['degree_level'],
    metadata: data.metadata as DeptCourse['metadata'],
    short_name: data.short_name,
    year_started: data.year_started,
    duration_years: data.duration_years,
    intake: data.intake,
    dept: dept ? { name: dept.name, code: dept.code, slug: dept.slug } : null,
  };
}
