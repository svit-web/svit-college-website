// Server functions for centers data from Supabase
import { createServerFn } from '@tanstack/react-start';
import { supabase } from '@/integrations/supabase/client';

export interface Center {
  id: string;
  college_id: string | null;
  institute_id: string | null;
  name: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  subtitle: string | null;
  accent_color: string | null;
  description: string | null;
  metadata: {
    highlights?: Array<{ title: string; description: string }>;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all published centers
 */
export const getAllCenters = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { data, error } = await supabase
      .from('centers')
      .select('*')
      .eq('status', 'published')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching centers:', error);
      throw error;
    }

    return data as Center[];
  });

/**
 * Fetch a single center by slug
 */
export const getCenterBySlug = createServerFn({ method: 'GET' })
  .validator((slug: string) => slug)
  .handler(async (ctx) => {
    const slug = ctx.data;
    const { data, error } = await supabase
      .from('centers')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error) throw error;

    return data as Center | null;
  });
