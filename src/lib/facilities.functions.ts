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
    console.log('[getFacilityBySlug] Handler looking for slug:', slug);

    const { data, error } = await supabase
      .from('facilities')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    console.log('[getFacilityBySlug] Query result:', { data: data?.name || null, error, slug });

    if (error) {
      console.error('[getFacilityBySlug] Error fetching facility:', error);
      throw error;
    }

    return data as Facility | null;
  });
