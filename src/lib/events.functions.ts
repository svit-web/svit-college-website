// Server functions for events from Supabase
import { createServerFn } from '@tanstack/react-start';
import { supabase } from '@/integrations/supabase/client';

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
  metadata: {
    accent?: string;
    subtitle?: string;
    highlights?: Array<{ title: string; description: string }>;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

const EVENT_WITH_SCOPE_SELECT =
  '*, college:colleges(name, slug), department:departments(name, slug)';

/**
 * Fetch all published events ordered by sort_order, across every scope
 * (department, college and institute-wide) for the public events listing.
 */
export const getAllEvents = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { data, error } = await supabase
      .from('events')
      .select(EVENT_WITH_SCOPE_SELECT)
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data as unknown as CampusEvent[];
  });

/**
 * Fetch a single event by slug
 */
export const getEventBySlug = createServerFn({ method: 'GET' })
  .validator((slug: string) => slug)
  .handler(async (ctx) => {
    const slug = ctx.data;
    const { data, error } = await supabase
      .from('events')
      .select(EVENT_WITH_SCOPE_SELECT)
      .eq('slug', slug)
      .eq('status', 'published')
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    return data as unknown as CampusEvent | null;
  });
