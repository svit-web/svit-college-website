// Server functions for a department's Staff / Achievements & Clubs / Industry
// Interaction tabs. Split out from departments.functions.ts since these query
// different tables (staff_department_assignments, achievements,
// department_activities) keyed off a department's real id.
import { publicSupabase } from '@/lib/supabase-public';
import { compareByMuster } from '@/lib/staff-order';
import { getEntryAlbums } from '@/lib/gallery.functions';
import type { EntryAlbum } from '@/lib/entry';
import { STAFF_POST_COLUMNS, formatDesignationWithPosts, postsForIds } from '@/lib/staff-posts';

export interface DeptStaffMember {
  id: string;
  name: string;
  designation: string;
  rankGroup: 'HOD' | 'Faculty' | 'Support';
  email: string | null;
  avatarUrl: string | null;
  employeeCode: string | null;
  industryYears: number | null;
  teachingYears: number | null;
  musterNumber: number | null;
}

// A work-experience entry's length in whole years, counted to the current
// month for a "Currently Working" entry. Entries aren't deduplicated across
// overlaps — matches how a LinkedIn-style list is totalled.
function experienceYears(w: { start_month: number; start_year: number; end_month: number | null; end_year: number | null; is_current: boolean }) {
  const now = new Date();
  const endMonths = w.is_current ? now.getFullYear() * 12 + now.getMonth() : (w.end_year ?? w.start_year) * 12 + ((w.end_month ?? w.start_month) - 1);
  const startMonths = w.start_year * 12 + (w.start_month - 1);
  return Math.max(0, (endMonths - startMonths) / 12);
}

export async function getStaffByDepartmentId(departmentId: string) {
  const supabase = publicSupabase();
  const [{ data, error }, { data: posts }] = await Promise.all([
    supabase
      .from('staff_department_assignments')
      .select(`
        is_primary,
        post_ids,
        designations ( title, category ),
        staff_profiles ( id, title, first_name, last_name, email, status, deleted_at, employee_code, muster_number, photo_url )
      `)
      .eq('department_id', departmentId)
      .eq('status', 'published')
      .is('deleted_at', null)
      .eq('designations.status', 'published')
      .is('designations.deleted_at', null),
    supabase.from('staff_posts').select(STAFF_POST_COLUMNS).eq('status', 'published').is('deleted_at', null),
  ]);

  if (error) {
    console.error('Error fetching department staff:', error);
    throw error;
  }

  const staffIds = [...new Set((data ?? []).map((a: any) => a.staff_profiles?.id).filter(Boolean))];
  const { data: workExp } = staffIds.length
    ? await supabase
        .from('staff_work_experience')
        .select('staff_id, category, start_month, start_year, end_month, end_year, is_current')
        .in('staff_id', staffIds)
        .is('deleted_at', null)
    : { data: [] as any[] };

  const yearsByStaff = new Map<string, { industry: number | null; teaching: number | null }>();
  for (const w of workExp ?? []) {
    const bucket = yearsByStaff.get(w.staff_id) ?? { industry: null, teaching: null };
    const key = w.category as 'industry' | 'teaching';
    bucket[key] = (bucket[key] ?? 0) + experienceYears(w);
    yearsByStaff.set(w.staff_id, bucket);
  }

  const members = (data ?? [])
    .filter((a: any) => a.staff_profiles?.status === 'published' && !a.staff_profiles?.deleted_at)
    .map((a: any): DeptStaffMember => {
      const s = a.staff_profiles;
      const designationTitle = a.designations?.title ?? 'Faculty';
      const heldPosts = postsForIds(a.post_ids, posts ?? []);
      // Legacy combined titles ("Professor & Head of Department") still mark the head.
      const isHead = heldPosts.some((p) => p.is_department_head) || (a.is_primary && /head|hod/i.test(designationTitle));
      const rankGroup: DeptStaffMember['rankGroup'] = isHead
        ? 'HOD'
        : a.designations?.category === 'teaching' || /professor|lecturer|assistant/i.test(designationTitle)
        ? 'Faculty'
        : 'Support';
      const years = yearsByStaff.get(s.id);
      return {
        id: s.id,
        name: `${s.title ? s.title + ' ' : ''}${s.first_name} ${s.last_name}`.trim(),
        designation: formatDesignationWithPosts(designationTitle, heldPosts),
        rankGroup,
        email: s.email ?? null,
        avatarUrl: s.photo_url ?? null,
        employeeCode: s.employee_code ?? null,
        industryYears: years?.industry != null ? Math.round(years.industry) : null,
        teachingYears: years?.teaching != null ? Math.round(years.teaching) : null,
        musterNumber: s.muster_number ?? null,
      };
    });

  return members.sort(compareByMuster);
}

export interface DeptAchievement {
  id: string;
  slug: string;
  title: string;
  date: string;
  category: string;
  description: string | null;
  cardPhotoUrl: string | null;
  hasDetailPage: boolean;
  album: EntryAlbum | null;
}

export async function getAchievementsByDepartmentId(departmentId: string) {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from('achievements')
    .select('id, slug, title, date, category, description, card_photo_url, has_detail_page, album_id')
    .eq('department_id', departmentId)
    .eq('status', 'published')
    .is('deleted_at', null)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching department achievements:', error);
    throw error;
  }

  const rows = data ?? [];
  // Albums only matter for Cards that open the Entry viewer (no Detail page).
  const albums = await getEntryAlbums(
    rows.filter((r) => !r.has_detail_page).map((r) => r.album_id),
  ).catch(() => new Map<string, EntryAlbum>());

  return rows.map((r): DeptAchievement => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    date: r.date,
    category: r.category,
    description: r.description,
    cardPhotoUrl: r.card_photo_url,
    hasDetailPage: !!r.has_detail_page,
    album: (r.album_id ? albums.get(r.album_id) : null) ?? null,
  }));
}

export interface DeptClub {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
}

/**
 * Clubs mapped to this department via student_clubs.department_id.
 * Admin sets this on the club itself (/admin/tables/student_clubs) —
 * same row also powers /campus-life/clubs, so one edit updates both.
 */
export async function getClubsByDepartmentId(departmentId: string) {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from('student_clubs')
    .select('id, name, slug, description, logo_url')
    .eq('department_id', departmentId)
    .eq('status', 'published')
    .is('deleted_at', null)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching department clubs:', error);
    throw error;
  }

  return (data ?? []).map((c): DeptClub => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    logoUrl: c.logo_url,
  }));
}

// department_activities was merged into events (see docs/adr/0002); an
// "activity" is just a department-scoped event of one of these types.
export type DeptActivityType =
  | 'expert_session'
  | 'industrial_visit'
  | 'seminar'
  | 'workshop'
  | 'sttp'
  | 'fdp';

export const ACTIVITY_EVENT_TYPES: DeptActivityType[] = [
  'expert_session',
  'industrial_visit',
  'seminar',
  'workshop',
  'sttp',
  'fdp',
];

export interface DeptActivity {
  id: string;
  slug: string;
  type: DeptActivityType | null;
  title: string;
  startDate: string;
  endDate: string | null;
  notes: string | null;
  cardPhotoUrl: string | null;
  hasDetailPage: boolean;
}

export async function getDepartmentActivities(departmentId: string) {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from('events')
    .select('id, slug, event_type, title, start_date, end_date, description, card_photo_url, has_detail_page')
    .eq('department_id', departmentId)
    .eq('status', 'published')
    .is('deleted_at', null)
    .in('event_type', ACTIVITY_EVENT_TYPES)
    .order('start_date', { ascending: false });

  if (error) {
    console.error('Error fetching department activities:', error);
    throw error;
  }

  return (data ?? []).map((a: any): DeptActivity => ({
    id: a.id,
    slug: a.slug,
    type: a.event_type,
    title: a.title,
    startDate: a.start_date,
    endDate: a.end_date,
    notes: a.description,
    cardPhotoUrl: a.card_photo_url,
    hasDetailPage: !!a.has_detail_page,
  }));
}
