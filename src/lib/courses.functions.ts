// Server functions for courses data from Supabase
import { createServerFn } from '@tanstack/react-start';
import { supabase } from '@/integrations/supabase/client';

export interface Course {
  id: string;
  department_id: string;
  name: string;
  code: string;
  degree_level: 'undergraduate' | 'graduate' | 'doctorate' | 'certificate';
  status: 'draft' | 'published' | 'archived';
  metadata: {
    description?: string;
    duration?: string;
    eligibility?: string;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all published courses
 */
export const getAllCourses = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('status', 'published')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }

    return data as Course[];
  });

/**
 * Fetch courses by department
 */
export const getCoursesByDepartment = createServerFn({ method: 'GET' })
  .validator((departmentId: string) => departmentId)
  .handler(async (ctx) => {
    const departmentId = ctx.data;

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('department_id', departmentId)
      .eq('status', 'published')
      .order('name', { ascending: true});

    if (error) {
      console.error('Error fetching courses by department:', error);
      throw error;
    }

    return data as Course[];
  });

/**
 * Fetch courses by degree level
 */
export const getCoursesByDegreeLevel = createServerFn({ method: 'GET' })
  .validator((level: 'undergraduate' | 'graduate' | 'doctorate' | 'certificate') => level)
  .handler(async (ctx) => {
    const level = ctx.data;

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('degree_level', level)
      .eq('status', 'published')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching courses by degree level:', error);
      throw error;
    }

    return data as Course[];
  });

/**
 * Fetch a single course by code
 */
export const getCourseByCode = createServerFn({ method: 'GET' })
  .validator((code: string) => code)
  .handler(async (ctx) => {
    const code = ctx.data;

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('code', code)
      .eq('status', 'published')
      .maybeSingle();

    if (error) {
      console.error('Error fetching course by code:', error);
      throw error;
    }

    return data as Course | null;
  });

