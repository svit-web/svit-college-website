// Server functions for committees data from Supabase
import { createServerFn } from '@tanstack/react-start';
import { supabase } from '@/integrations/supabase/client';

export interface Committee {
  id: string;
  college_id: string;
  name: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  metadata: {
    description?: string;
    vision?: string;
    mission?: string;
    keyActivities?: string[];
  };
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all published committees for a specific college
 */
export const getCommitteesByCollege = createServerFn({ method: 'GET' })
  .validator((collegeId: string) => collegeId)
  .handler(async ({ data: collegeId }) => {
    const { data, error } = await supabase
      .from('committees')
      .select('*')
      .eq('college_id', collegeId)
      .eq('status', 'published')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching committees:', error);
      throw error;
    }

    return data as Committee[];
  });

/**
 * Fetch all published committees (for SVIT Group-wide committees)
 */
export const getAllCommittees = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { data, error } = await supabase
      .from('committees')
      .select('*')
      .eq('status', 'published')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching committees:', error);
      throw error;
    }

    return data as Committee[];
  });

/**
 * Fetch a single committee by slug
 */
export const getCommitteeBySlug = createServerFn({ method: 'GET' })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const { data, error } = await supabase
      .from('committees')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error) {
      console.error('Error fetching committee:', error);
      throw error;
    }

    return data as Committee;
  });
