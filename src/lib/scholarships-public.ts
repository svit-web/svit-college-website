// Client-safe scholarships types + reads — split out from scholarships.functions.ts
// so client components (AdminScholarshipsPage) never pull in that file's
// createServerFn/TanStack Start server runtime imports into the browser bundle.
import { publicSupabase } from '@/lib/supabase-public';

export interface Scholarship {
  id: string;
  name: string;
  type: string;
  description: string | null;
  eligibility: string | null;
  amount: string | null;
  provider: string | null;
  status: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export async function getAllScholarships() {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from('scholarships')
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching scholarships:', error);
    throw error;
  }

  return data as Scholarship[];
}

export async function getAllScholarshipsAdmin() {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from('scholarships')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching scholarships:', error);
    throw error;
  }

  return data as Scholarship[];
}
