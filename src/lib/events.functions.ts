// Server functions for events from Supabase
import { publicSupabase } from '@/lib/supabase-public';

export interface CampusEvent {
  id: string;
  title: string;
  slug: string;
  tag: string | null;
  description: string | null;
  start_date: string;
  end_date: string | null;
  featured_image_url: string | null;
  sort_order: number;
  status: 'draft' | 'published' | 'archived';
  scope_type: 'global' | 'trust' | 'institute' | 'college' | 'department';
  is_featured: boolean;
  college: { name: string; slug: string } | null;
  department: { name: string; slug: string } | null;
  subtitle: string | null;
  accent_color: string | null;
  metadata: {
    highlights?: Array<{ title: string; description: string }>;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

const EVENT_WITH_SCOPE_SELECT =
  '*, college:colleges(name, slug), department:departments(name, slug)';

/**
 * Fetch all published events newest-first by start_date, across every scope
 * (department, college and institute-wide) for the public events listing.
 */
export async function getAllEvents() {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from('events')
    .select(EVENT_WITH_SCOPE_SELECT)
    .eq('status', 'published')
    .is('deleted_at', null)
    .order('start_date', { ascending: false });

  if (error) throw error;
  return data as unknown as CampusEvent[];
}

/**
 * Fetch a single event by slug
 */
export async function getEventBySlug(slug: string) {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from('events')
    .select(EVENT_WITH_SCOPE_SELECT)
    .eq('slug', slug)
    .eq('status', 'published')
    .is('deleted_at', null)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as CampusEvent | null;
}
