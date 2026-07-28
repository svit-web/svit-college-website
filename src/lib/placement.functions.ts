// Server functions for placement statistics and recruiters from Supabase
import { createServerFn } from '@tanstack/react-start';
import { supabase } from '@/integrations/supabase/client';

export interface PlacementStatistics {
  id: string;
  college_id: string | null;
  academic_year: string;
  total_students: number;
  placed_students: number;
  highest_package: number | null;
  average_package: number | null;
  recruiters_count: number | null;
  status: 'draft' | 'published' | 'archived';
  metadata: { [key: string]: string | number | boolean | null };
  created_at: string;
  updated_at: string;
}

export interface Recruiter {
  id: string;
  company_name: string;
  logo_url: string;
  website_url: string | null;
  sort_order: number;
  metadata: {
    colleges?: string[];
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Fetch published placement statistics for a specific college (by college slug).
 * Returns rows ordered newest-first.
 */
export const getPlacementStatsByCollege = createServerFn({ method: 'GET' })
  .validator((collegeSlug: string) => collegeSlug)
  .handler(async (ctx) => {
    // Resolve slug → id first
    const { data: college } = await supabase
      .from('colleges')
      .select('id')
      .eq('slug', ctx.data)
      .maybeSingle();

    if (!college) return [] as PlacementStatistics[];

    const { data, error } = await supabase
      .from('placement_statistics')
      .select('*')
      .eq('college_id' as any, college.id)
      .eq('status', 'published')
      .order('academic_year', { ascending: false });

    if (error) {
      console.error('Error fetching placement statistics:', error);
      throw error;
    }

    return (data ?? []) as unknown as PlacementStatistics[];
  });

/**
 * Fetch published recruiters, optionally filtered by college slug via metadata.colleges array.
 */
export const getAllRecruiters = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { data, error } = await supabase
      .from('recruiters')
      .select('*')
      .eq('status', 'published')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching recruiters:', error);
      throw error;
    }

    return (data ?? []) as Recruiter[];
  });
