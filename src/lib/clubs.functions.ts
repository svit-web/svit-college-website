// Server functions for student clubs data from Supabase
import { createServerFn } from '@tanstack/react-start';
import { supabase } from '@/integrations/supabase/client';

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
  metadata: {
    subtitle?: string;
    accent?: string;
    highlights?: Array<{
      title: string;
      description: string;
    }>;
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
export const getAllStudentClubs = createServerFn({ method: 'GET' })
  .handler(async () => {
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
  });

/**
 * Fetch only featured student clubs (for menu bar, home page, etc.)
 */
export const getFeaturedStudentClubs = createServerFn({ method: 'GET' })
  .handler(async () => {
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
  });

/**
 * Fetch a single student club by slug
 */
export const getStudentClubBySlug = createServerFn({ method: 'GET' })
  .validator((slug: string) => slug)
  .handler(async (ctx) => {
    const slug = ctx.data;
    const { data, error } = await supabase
      .from('student_clubs')
      .select(CLUB_SELECT_WITH_DEPARTMENT)
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error) throw error;

    return data ? mapClubRow(data) : null;
  });

export interface ClubEvent {
  id: string;
  title: string;
  description: string | null;
  eventDate: string;
  imageUrl: string | null;
}

/**
 * Fetch a club's own events — a dedicated table (club_events), separate
 * from the general campus-life events. Admin-managed at
 * /admin/tables/club_events via the Club Id field. Events accumulate with
 * no auto-archiving; this preview is capped at the 3 most recent for the
 * slider, plus the true total so callers know whether to show "View more".
 */
export const getClubEvents = createServerFn({ method: 'GET' })
  .validator((clubId: string) => clubId)
  .handler(async (ctx) => {
    const clubId = ctx.data;
    const { data, error, count } = await supabase
      .from('club_events')
      .select('id, title, description, event_date, image_url', { count: 'exact' })
      .eq('club_id', clubId)
      .eq('status', 'published')
      .order('event_date', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Error fetching club events:', error);
      throw error;
    }

    return {
      events: (data ?? []).map((e): ClubEvent => ({
        id: e.id,
        title: e.title,
        description: e.description,
        eventDate: e.event_date,
        imageUrl: e.image_url,
      })),
      total: count ?? 0,
    };
  });

/**
 * Fetch all of a club's published events (no cap) — backs the "View more"
 * destination linked from the club page's events preview.
 */
export const getAllClubEvents = createServerFn({ method: 'GET' })
  .validator((clubId: string) => clubId)
  .handler(async (ctx) => {
    const clubId = ctx.data;
    const { data, error } = await supabase
      .from('club_events')
      .select('id, title, description, event_date, image_url')
      .eq('club_id', clubId)
      .eq('status', 'published')
      .order('event_date', { ascending: false });

    if (error) {
      console.error('Error fetching all club events:', error);
      throw error;
    }

    return (data ?? []).map((e): ClubEvent => ({
      id: e.id,
      title: e.title,
      description: e.description,
      eventDate: e.event_date,
      imageUrl: e.image_url,
    }));
  });
