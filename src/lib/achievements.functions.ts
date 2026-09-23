// Public data access for achievements (an Entry type, see CONTEXT.md).
// Department-scoped lists live in department-content.functions.ts; this module
// holds the shared category labels and the single-achievement Detail page query.
import { publicSupabase } from '@/lib/supabase-public';
import { getEntryAlbum } from '@/lib/gallery.functions';
import type { EntryAlbum } from '@/lib/entry';

export const ACHIEVEMENT_CATEGORY_LABELS: Record<string, string> = {
  student: 'Student',
  faculty: 'Faculty',
  college: 'College',
  department: 'Department',
  sports: 'Sports',
};

export function achievementCategoryLabel(category: string | null | undefined): string {
  if (!category) return 'Achievement';
  return (
    ACHIEVEMENT_CATEGORY_LABELS[category] ??
    category.charAt(0).toUpperCase() + category.slice(1)
  );
}

export function achievementDetailHref(slug: string): string {
  return `/achievements/${slug}`;
}

export interface AchievementDetail {
  id: string;
  slug: string;
  title: string;
  category: string;
  date: string;
  description: string | null;
  cardPhotoUrl: string | null;
  album: EntryAlbum | null;
  department: { name: string; code: string } | null;
}

/**
 * A published achievement that has a Detail page. Returns null when the slug
 * doesn't exist, isn't published, or `has_detail_page` is off, so the route
 * 404s instead of exposing a page the admin didn't enable.
 */
export async function getAchievementDetailBySlug(slug: string): Promise<AchievementDetail | null> {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from('achievements')
    .select(
      'id, slug, title, category, date, description, card_photo_url, album_id, has_detail_page, departments ( name, code )',
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .is('deleted_at', null)
    .eq('has_detail_page', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching achievement:', error);
    throw error;
  }
  if (!data) return null;

  const row = data as any;
  const album = row.album_id ? await getEntryAlbum(row.album_id).catch(() => null) : null;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    date: row.date,
    description: row.description,
    cardPhotoUrl: row.card_photo_url,
    album,
    department: row.departments ? { name: row.departments.name, code: row.departments.code } : null,
  };
}
