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
  metadata: {
    accent?: string;
    subtitle?: string;
    highlights?: Array<{ title: string; description: string }>;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all published events ordered by sort_order
 */
export const getAllEvents = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'published')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data as CampusEvent[];
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
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error) throw error;
    return data as CampusEvent | null;
  });
