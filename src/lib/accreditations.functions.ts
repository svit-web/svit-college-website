// Server functions for accreditations data from Supabase
import { createServerFn } from '@tanstack/react-start';
import { supabase } from '@/integrations/supabase/client';

export interface Accreditation {
  id: string;
  organization: string;
  value: string;
  received_year: number;
  expiry_date: string | null;
  status: 'draft' | 'published' | 'archived';
  accreditation_body: string | null;
  description: string | null;
  document_url: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all published accreditations
 */
export const getAllAccreditations = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { data, error } = await supabase
      .from('accreditations')
      .select('*')
      .eq('status', 'published')
      .order('organization', { ascending: true });

    if (error) {
      console.error('Error fetching accreditations:', error);
      throw error;
    }

    return data as Accreditation[];
  });

/**
 * Fetch a single accreditation by organization
 */
export const getAccreditationByOrg = createServerFn({ method: 'GET' })
  .validator((org: string) => org)
  .handler(async ({ data: org }) => {
    const { data, error } = await supabase
      .from('accreditations')
      .select('*')
      .eq('organization', org)
      .eq('status', 'published')
      .single();

    if (error) {
      console.error('Error fetching accreditation:', error);
      throw error;
    }

    return data as Accreditation;
  });
