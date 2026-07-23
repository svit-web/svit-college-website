// Server functions for departments data from Supabase
import { createServerFn } from '@tanstack/react-start';
import { supabase } from '@/integrations/supabase/client';

export interface Department {
  id: string;
  college_id: string;
  name: string;
  slug: string;
  code: string;
  head_of_department_id: string | null;
  status: 'draft' | 'published' | 'archived';
  metadata: {
    description?: string;
    vision?: string;
    mission?: string;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all published departments
 */
export const getAllDepartments = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('status', 'published')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }

    return data as Department[];
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
      .select('*')
      .eq('college_id', collegeId)
      .eq('status', 'published')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching departments by college:', error);
      throw error;
    }

    return data as Department[];
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
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error) {
      console.error('Error fetching department by slug:', error);
      throw error;
    }

    return data as Department | null;
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
      .select('*')
      .eq('code', code)
      .eq('status', 'published')
      .maybeSingle();

    if (error) {
      console.error('Error fetching department by code:', error);
      throw error;
    }

    return data as Department | null;
  });
