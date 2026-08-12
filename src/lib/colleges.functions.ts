// Server functions for colleges data from Supabase
import { publicSupabase } from '@/lib/supabase-public';

export interface College {
  id: string;
  name: string;
  slug: string;
  code: string;
  logo_url: string | null;
  website_url: string | null;
  sort_order: number;
  status: 'draft' | 'published' | 'archived';
  tagline: string | null;
  hero_kicker: string | null;
  hero_subhead: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all published colleges ordered by sort_order
 */
export async function getAllColleges() {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from('colleges')
    .select('*')
    .eq('status', 'published')
    .is('deleted_at', null)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching colleges:', error);
    throw error;
  }

  return data as College[];
}

/**
 * Fetch departments for a college by college slug
 */
export async function getDepartmentsByCollegeSlug(slug: string) {
  const supabase = publicSupabase();
  // First get the college id
  const { data: college, error: cErr } = await supabase
    .from('colleges')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();
  if (cErr || !college) return [] as { id: string; name: string; slug: string; code: string; logo_url: string | null; metadata: any }[];

  const { data, error } = await supabase
    .from('departments')
    .select('id, name, slug, code, logo_url, metadata')
    .eq('college_id', college.id)
    .eq('status', 'published')
    .order('name');
  if (error) return [] as { id: string; name: string; slug: string; code: string; metadata: any }[];

  return (data ?? []) as { id: string; name: string; slug: string; code: string; logo_url: string | null; metadata: any }[];
}

/**
 * Fetch a single college by slug
 */
export async function getCollegeBySlug(slug: string) {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from('colleges')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .is('deleted_at', null)
    .maybeSingle();

  if (error) throw error;

  return data as College | null;
}
