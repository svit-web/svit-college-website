// Server functions for placement statistics and recruiters from Supabase
import { createServerFn } from '@tanstack/react-start';
import { supabase } from '@/integrations/supabase/client';

export interface PlacementStatistics {
  id: string;
  academic_year: string;
  total_students: number;
  placed_students: number;
  highest_package: number;
  average_package: number;
  recruiters_count: number;
  status: 'draft' | 'published' | 'archived';
  metadata: {
    colleges?: {
      [collegeCode: string]: {
        totalStudents: number;
        studentsPlaced: number;
        placementPercentage: number;
        highestPackage: number;
        averagePackage: number;
        aboutText?: string;
        placementOfficer?: {
          name: string;
          designation: string;
          phone: string;
          email: string;
          photo: string | null;
        };
        placedStudents?: Array<{
          studentName: string;
          companyName: string;
          photo: string | null;
        }>;
      };
    };
    [key: string]: any;
  };
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
 * Fetch all published placement statistics
 */
export const getAllPlacementStats = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { data, error } = await supabase
      .from('placement_statistics')
      .select('*')
      .eq('status', 'published')
      .order('academic_year', { ascending: false });

    if (error) {
      console.error('Error fetching placement statistics:', error);
      throw error;
    }

    return data as PlacementStatistics[];
  });

/**
 * Fetch all recruiters
 */
export const getAllRecruiters = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { data, error } = await supabase
      .from('recruiters')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching recruiters:', error);
      throw error;
    }

    return data as Recruiter[];
  });
