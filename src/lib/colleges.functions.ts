// Server functions for colleges data from Supabase
import { createServerFn } from '@tanstack/react-start';
import { supabase } from '@/integrations/supabase/client';

export interface College {
  id: string;
  name: string;
  slug: string;
  code: string;
  logo_url: string | null;
  website_url: string | null;
  sort_order: number;
  status: 'draft' | 'published' | 'archived';
  metadata: {
    shortCode?: string;
    tagline?: string;
    hero?: {
      kicker?: string;
      subhead?: string;
    };
  };
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all published colleges ordered by sort_order
 */
export const getAllColleges = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { data, error } = await supabase
      .from('colleges')
      .select('*')
      .eq('status', 'published')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching colleges:', error);
      throw error;
    }

    return data as College[];
  });

/**
 * Fetch a single college by slug
 */
export const getCollegeBySlug = createServerFn({ method: 'GET' })
  .validator((slug: string) => slug)
  .handler(async (ctx) => {
    const slug = ctx.data;
    const { data, error } = await supabase
      .from('colleges')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error) throw error;

    return data as College | null;
  });
