// Server functions for programme-level data from Supabase
import { createServerFn } from '@tanstack/react-start';
import { supabase } from '@/integrations/supabase/client';

export interface Programme {
  id: string;
  code: string;
  name: string;
  status: 'draft' | 'published' | 'archived';
  metadata: {
    isProgramme: boolean;
    slug: string;
    tagline: string;
    short: string;
    fullName: string;
    duration: string;
    eligibility: string;
    intake: string;
    color: string;
    accent: string;
    description: string;
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
  metadata: {
    engSlug: string;
    short: string;
    color: string;
    overview: string;
    labs: string[];
    careers: string[];
  };
}

/**
 * Fetch all programme-level entries (isProgramme: true in metadata)
 */
export const getAllProgrammes = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('status', 'published')
      .eq('metadata->>isProgramme', 'true')
      .is('department_id', null);

    if (error) {
      console.error('Error fetching programmes:', error);
      throw error;
    }

    return data as Programme[];
  });

/**
 * Fetch a single programme by its slug (stored as metadata->>'slug' = code)
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
      .eq('metadata->>isProgramme', 'true')
      .is('department_id', null)
      .maybeSingle();

    if (error) throw error;

    return data as Programme | null;
  });

/**
 * Fetch all UG engineering departments (BE level, SVIT college)
 * ordered by engSlug for consistent display
 */
export const getEngDepts = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { data, error } = await supabase
      .from('departments')
      .select('id, code, name, slug, status, metadata')
      .eq('status', 'published')
      .eq('metadata->>level', 'UG')
      .eq('metadata->>degreeType', 'BE')
      .not('metadata->>engSlug', 'is', null);

    if (error) {
      console.error('Error fetching engineering departments:', error);
      throw error;
    }

    return data as EngDeptRecord[];
  });

/**
 * Fetch a single engineering department by its engSlug
 */
export const getEngDeptBySlug = createServerFn({ method: 'GET' })
  .validator((engSlug: string) => engSlug)
  .handler(async (ctx) => {
    const engSlug = ctx.data;
    const { data, error } = await supabase
      .from('departments')
      .select('id, code, name, slug, status, metadata')
      .eq('status', 'published')
      .eq('metadata->>engSlug', engSlug)
      .maybeSingle();

    if (error) throw error;

    return data as EngDeptRecord | null;
  });
