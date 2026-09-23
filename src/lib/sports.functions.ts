import { publicSupabase } from '@/lib/supabase-public';

/** A sports highlight carried over from the old `facilities` row (see the entry-model migration). */
export interface SportHighlight {
  title: string;
  description?: string | null;
}

/**
 * `metadata` on sports merged in from `facilities` (Carrom, Pickleball,
 * Weightlifting, …) carries the old venue name, subtitle and highlights.
 */
export interface SportMetadata {
  venue_name?: string | null;
  subtitle?: string | null;
  highlights?: SportHighlight[] | null;
  [key: string]: unknown;
}

export interface Sport {
  id: string;
  name: string;
  slug: string;
  category: "outdoor" | "indoor" | "aquatic" | "combat";
  description: string | null;
  card_photo_url: string | null;
  has_detail_page: boolean;
  album_id: string | null;
  is_active: boolean;
  sort_order: number;
  status: "draft" | "published" | "archived";
  players_count: number | null;
  coach_name: string | null;
  coach_image_url: string | null;
  metadata: SportMetadata;
  created_at: string;
}

// Sports achievements used to live in `sports_achievements`; that table was
// merged into `achievements` (category = 'sports') and dropped.

export async function getSports() {
  const supabase = publicSupabase();
  const { data, error } = await (supabase as any)
    .from("sports")
    .select(
      "id, name, slug, category, description, card_photo_url, has_detail_page, album_id, is_active, sort_order, status, players_count, coach_name, coach_image_url, metadata, created_at",
    )
    .eq("status", "published")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as Sport[]).map((s) => ({ ...s, metadata: s.metadata ?? {} }));
}
