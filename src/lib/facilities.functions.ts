// Server functions for facilities data from Supabase
import { createServerFn } from '@tanstack/react-start';
import { supabase } from '@/integrations/supabase/client';

export interface Facility {
  id: string;
  facility_type: 'campus' | 'building' | 'laboratory';
  parent_id: string | null;
  institute_id: string | null;
  department_id: string | null;
  name: string;
  slug: string;
  address: string | null;
  code: string | null;
  room_number: string | null;
  status: 'draft' | 'published' | 'archived';
  metadata: {
    subtitle?: string;
    accent?: string;
    description?: string;
    category?: string;
    highlights?: Array<{
      title: string;
      description: string;
    }>;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all published facilities
 */
export const getAllFacilities = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { data, error } = await supabase
      .from('facilities')
      .select('*')
      .eq('status', 'published')
      .is('department_id', null)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching facilities:', error);
      throw error;
    }

    return data as Facility[];
  });

/**
 * Fetch facilities by type (campus, building, laboratory)
 */
export const getFacilitiesByType = createServerFn({ method: 'GET' })
  .validator((type: 'campus' | 'building' | 'laboratory') => type)
  .handler(async ({ data: type }) => {
    const { data, error } = await supabase
      .from('facilities')
      .select('*')
      .eq('status', 'published')
      .eq('facility_type', type)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching facilities by type:', error);
      throw error;
    }

    return data as Facility[];
  });

/**
 * Fetch a single facility by slug
 */
export const getFacilityBySlug = createServerFn({ method: 'GET' })
  .validator((slug: string) => slug)
  .handler(async (ctx) => {
    const slug = ctx.data;
    const { data, error } = await supabase
      .from('facilities')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error) throw error;

    return data as Facility | null;
  });

/**
 * Fetch labs for a specific department
 */
export const getLabsByDepartmentId = createServerFn({ method: 'GET' })
  .validator((departmentId: string) => departmentId)
  .handler(async ({ data: departmentId }) => {
    const { data, error } = await supabase
      .from('facilities')
      .select('*')
      .eq('status', 'published')
      .eq('facility_type', 'laboratory')
      .eq('department_id', departmentId)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching labs for department:', error);
      throw error;
    }

    return (data ?? []) as Facility[];
  });
