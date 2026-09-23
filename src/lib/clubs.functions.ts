// Server functions for student clubs data from Supabase
import { publicSupabase } from '@/lib/supabase-public';

export interface StudentClub {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  coordinator_id: string | null;
  student_coordinator_name: string | null;
  featured: boolean;
  status: 'draft' | 'published' | 'archived';
  department_id: string | null;
  departmentName: string | null;
  subtitle: string | null;
  accent_color: string | null;
  metadata: {
    highlights?: Array<{ title: string; description: string }>;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

const CLUB_SELECT_WITH_DEPARTMENT = '*, departments(name)';

function mapClubRow(row: any): StudentClub {
  const dept = Array.isArray(row.departments) ? row.departments[0] : row.departments;
  return {
    ...row,
    departmentName: dept?.name ?? null,
    departments: undefined,
  } as StudentClub;
}

/**
 * Fetch all published student clubs
 */
export async function getAllStudentClubs() {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from('student_clubs')
    .select(CLUB_SELECT_WITH_DEPARTMENT)
    .eq('status', 'published')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching student clubs:', error);
    throw error;
  }

  return (data ?? []).map(mapClubRow);
}

/**
 * Fetch only featured student clubs (for menu bar, home page, etc.)
 */
export async function getFeaturedStudentClubs() {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from('student_clubs')
    .select(CLUB_SELECT_WITH_DEPARTMENT)
    .eq('status', 'published')
    .eq('featured' as any, true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching featured student clubs:', error);
    throw error;
  }

  return (data ?? []).map(mapClubRow);
}

/**
 * Fetch a single student club by slug
 */
export async function getStudentClubBySlug(slug: string) {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from('student_clubs')
    .select(CLUB_SELECT_WITH_DEPARTMENT)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (error) throw error;

  return data ? mapClubRow(data) : null;
}

export interface ClubEvent {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  eventDate: string;
  imageUrl: string | null;
  hasDetailPage: boolean;
}

function mapClubEventRow(e: any): ClubEvent {
  return {
    id: e.id,
    slug: e.slug,
    title: e.title,
    description: e.description,
    eventDate: e.start_date,
    imageUrl: e.card_photo_url,
    hasDetailPage: !!e.has_detail_page,
  };
}

/**
 * Fetch a club's own events — events.club_id (club_events was merged into
 * events, see docs/adr/0002-one-events-table.md). This preview is capped at
 * the 3 most recent for the slider, plus the true total so callers know
 * whether to show "View more".
 */
export async function getClubEvents(clubId: string) {
  const supabase = publicSupabase();
  const { data, error, count } = await supabase
    .from('events')
    .select('id, slug, title, description, start_date, card_photo_url, has_detail_page', { count: 'exact' })
    .eq('club_id', clubId)
    .eq('status', 'published')
    .is('deleted_at', null)
    .order('start_date', { ascending: false })
    .limit(3);

  if (error) {
    console.error('Error fetching club events:', error);
    throw error;
  }

  return {
    events: (data ?? []).map(mapClubEventRow),
    total: count ?? 0,
  };
}

/**
 * Fetch all of a club's published events (no cap) — backs the "View more"
 * destination linked from the club page's events preview.
 */
export async function getAllClubEvents(clubId: string) {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from('events')
    .select('id, slug, title, description, start_date, card_photo_url, has_detail_page')
    .eq('club_id', clubId)
    .eq('status', 'published')
    .is('deleted_at', null)
    .order('start_date', { ascending: false });

  if (error) {
    console.error('Error fetching all club events:', error);
    throw error;
  }

  return (data ?? []).map(mapClubEventRow);
}
