// Server functions for News (posts-based, see CONTEXT.md: Entry, Card, Detail
// page). News is announcements — "something that happened or will happen, not
// itself something to attend" — kept separate from Events. Mirrors
// events.functions.ts's conventions.
import { publicSupabase } from '@/lib/supabase-public';

export interface Post {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string | null;
  card_photo_url: string | null;
  album_id: string | null;
  is_featured: boolean;
  scope_type: 'global' | 'trust' | 'institute' | 'college' | 'department';
  published_at: string | null;
  expires_at: string | null;
  category: { name: string; slug: string } | null;
  college: { name: string; slug: string } | null;
  department: { name: string; slug: string } | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

const POST_SELECT = [
  'id, title, slug, summary, content, card_photo_url, album_id, is_featured',
  'scope_type, published_at, expires_at, metadata, created_at, updated_at',
  'category:content_categories(name, slug)',
  'college:colleges(name, slug), department:departments(name, slug)',
].join(', ');

/**
 * Fetch all published, non-expired posts newest-first for the public
 * News listing.
 */
export async function getAllPosts() {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('status', 'published')
    .is('deleted_at', null)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as unknown as Post[];
}

/**
 * Fetch a single post by slug. Posts always have a Detail page (no
 * `has_detail_page` toggle), so any published, non-expired, non-deleted post
 * resolves.
 */
export async function getPostBySlug(slug: string) {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('slug', slug)
    .eq('status', 'published')
    .is('deleted_at', null)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as Post | null;
}

/**
 * Featured posts for the homepage "Latest from campus" News column.
 */
export async function getFeaturedPosts(limit = 6) {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('status', 'published')
    .eq('is_featured', true)
    .is('deleted_at', null)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as unknown as Post[];
}
