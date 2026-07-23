// Server functions for student clubs data from Supabase
import { createServerFn } from '@tanstack/react-start';
import { supabase } from '@/integrations/supabase/client';

export interface StudentClub {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  coordinator_id: string | null;
  student_coordinator_name: string | null;
  featured: boolean;
  status: 'draft' | 'published' | 'archived';
  metadata: {
    subtitle?: string;
    accent?: string;
    highlights?: Array<{
      title: string;
      description: string;
    }>;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all published student clubs
 */
export const getAllStudentClubs = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { data, error } = await supabase
      .from('student_clubs')
      .select('*')
      .eq('status', 'published')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching student clubs:', error);
      throw error;
    }

    return data as StudentClub[];
  });

/**
 * Fetch only featured student clubs (for menu bar, home page, etc.)
 */
export const getFeaturedStudentClubs = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { data, error } = await supabase
      .from('student_clubs')
      .select('*')
      .eq('status', 'published')
      .eq('featured', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching featured student clubs:', error);
      throw error;
    }

    return data as StudentClub[];
  });

/**
 * Fetch a single student club by slug
 */
export const getStudentClubBySlug = createServerFn({ method: 'GET' })
  .validator((slug: string) => slug)
  .handler(async (ctx) => {
    const slug = ctx.data;
    console.log('[getStudentClubBySlug] Looking for slug:', slug);

    const { data, error } = await supabase
      .from('student_clubs')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle(); // Use maybeSingle instead of single to handle 0 rows gracefully

    console.log('[getStudentClubBySlug] Query result:', { found: !!data, error, slug });

    if (error) {
      console.error('[getStudentClubBySlug] Error fetching student club:', error);
      throw error;
    }

    return data as StudentClub | null;
  });
