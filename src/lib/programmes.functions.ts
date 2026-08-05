// Server functions for programme-level data from Supabase
import { createServerFn } from '@tanstack/react-start';
import { supabase } from '@/integrations/supabase/client';

export interface Programme {
  id: string;
  code: string;
  name: string;
  status: 'draft' | 'published' | 'archived';
  is_programme: boolean;
  programme_slug: string;
  tagline: string;
  short_name: string;
  full_name: string;
  duration: string;
  eligibility: string;
  intake: number;
  color: string;
  accent: string;
  description: string;
  metadata: {
    outcomes: string[];
    highlights: string[];
  };
}

export interface EngDeptRecord {
  id: string;
  code: string;
  name: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  short_name: string;
  theme_color: string;
  overview: string;
  metadata: {
    labs: string[];
    careers: string[];
  };
}

/**
 * Fetch all programme-level entries (is_programme = true)
 */
export const getAllProgrammes = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('status', 'published')
      .eq('is_programme', true)
      .is('department_id', null);

    if (error) {
      console.error('Error fetching programmes:', error);
      throw error;
    }

    return data as unknown as Programme[];
  });

/**
 * Fetch a single programme by its code
 */
export const getProgrammeBySlug = createServerFn({ method: 'GET' })
  .validator((slug: string) => slug)
  .handler(async (ctx) => {
    const slug = ctx.data;
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('status', 'published')
      .eq('code', slug)
      .eq('is_programme', true)
      .is('department_id', null)
      .maybeSingle();

    if (error) throw error;

    return data as unknown as Programme | null;
  });

/**
 * Fetch all UG engineering departments (BE level, SVIT college)
 */
export const getEngDepts = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { data, error } = await supabase
      .from('departments')
      .select('id, code, name, slug, status, short_name, theme_color, overview, metadata')
      .eq('status', 'published')
      .eq('level', 'UG')
      .eq('degree_type', 'BE')
      .not('slug', 'is', null);

    if (error) {
      console.error('Error fetching engineering departments:', error);
      throw error;
    }

    return data as EngDeptRecord[];
  });

/**
 * Fetch a single engineering department by its slug
 */
export const getEngDeptBySlug = createServerFn({ method: 'GET' })
  .validator((engSlug: string) => engSlug)
  .handler(async (ctx) => {
    const engSlug = ctx.data;
    const { data, error } = await supabase
      .from('departments')
      .select('id, code, name, slug, status, short_name, theme_color, overview, metadata')
      .eq('status', 'published')
      .eq('slug', engSlug)
      .maybeSingle();

    if (error) throw error;

    return data as EngDeptRecord | null;
  });
