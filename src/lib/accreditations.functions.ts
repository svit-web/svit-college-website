// Server functions for accreditations data from Supabase
import { publicSupabase } from '@/lib/supabase-public';

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
export async function getAllAccreditations() {
  const supabase = publicSupabase();
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
}

/**
 * Fetch a single accreditation by organization
 */
export async function getAccreditationByOrg(org: string) {
  const supabase = publicSupabase();
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
}
