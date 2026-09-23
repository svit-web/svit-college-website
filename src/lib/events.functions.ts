// Server functions for events from Supabase
import { publicSupabase } from '@/lib/supabase-public';
import type { EventType } from '@/lib/event-types';

export interface CampusEvent {
  id: string;
  title: string;
  slug: string;
  /** Deprecated free-text tag (superseded by `event_type`); still read by /news. */
  tag: string | null;
  description: string | null;
  start_date: string;
  end_date: string | null;
  location: string | null;
  map_url: string | null;
  registration_link: string | null;
  card_photo_url: string | null;
  has_detail_page: boolean;
  album_id: string | null;
  event_type: EventType | null;
  club_id: string | null;
  sort_order: number;
  status: 'draft' | 'published' | 'cancelled' | 'archived';
  scope_type: 'global' | 'trust' | 'institute' | 'college' | 'department';
  is_featured: boolean;
  college: { name: string; slug: string } | null;
  department: { name: string; slug: string } | null;
  club: { name: string; slug: string; has_detail_page: boolean } | null;
  subtitle: string | null;
  accent_color: string | null;
  metadata: {
    highlights?: Array<{ title: string; description: string }>;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

const EVENT_WITH_SCOPE_SELECT = [
  'id, title, slug, tag, description, start_date, end_date, location, map_url, registration_link',
  'card_photo_url, has_detail_page, album_id, event_type, club_id',
  'sort_order, status, scope_type, is_featured, subtitle, accent_color, metadata, created_at, updated_at',
  'college:colleges(name, slug), department:departments(name, slug)',
  'club:student_clubs(name, slug, has_detail_page)',
].join(', ');

/**
 * Fetch all published events newest-first by start_date, across every scope
 * (institute, college, department and club — one table per ADR 0002) for the
 * public events listing.
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
