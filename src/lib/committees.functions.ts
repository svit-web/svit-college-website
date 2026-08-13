// Server functions for committees data from Supabase
import { publicSupabase } from '@/lib/supabase-public';

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
export async function getCommitteesByCollege(collegeId: string) {
  const supabase = publicSupabase();
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
}

/**
 * Fetch all published committees (for SVIT Group-wide committees)
 */
export async function getAllCommittees() {
  const supabase = publicSupabase();
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
}

/**
 * Fetch a single committee by slug
 */
export async function getCommitteeBySlug(slug: string) {
  const supabase = publicSupabase();
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
}
