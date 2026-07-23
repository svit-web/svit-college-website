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
  metadata: {
    subtitle?: string;
    accent?: string;
    description?: string;
    highlights?: Array<{
      title: string;
      description: string;
    }>;
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
    console.log('[getCenterBySlug] Looking for slug:', slug);

    const { data, error } = await supabase
      .from('centers')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle(); // Use maybeSingle instead of single to handle 0 rows gracefully

    console.log('[getCenterBySlug] Query result:', { found: !!data, error, slug });

    if (error) {
      console.error('[getCenterBySlug] Error fetching center:', error);
      throw error;
    }

    return data as Center | null;
  });
