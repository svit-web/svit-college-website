import { publicSupabase } from "@/lib/supabase-public";

export async function getGlobalHomepageItems() {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from("homepage_items")
    .select(
      "id, item_type, pretitle, eyebrow, title, title_accent, subtitle, body, image_url, icon_name, link_href, link_label, secondary_link_href, secondary_link_label, sort_order, metadata",
    )
    .eq("scope_type", "global")
    .eq("is_active", true)
    .eq("status", "published")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getCollegesGrid() {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from("colleges")
    .select("id, slug, code, name, logo_url, sort_order, metadata, show_in_navigation, tagline")
    .eq("status", "published")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * Maps college_id -> uploaded hero photo, for colleges that have one set via
 * Admin -> Website CMS -> that college's homepage items. Colleges without a
 * photo are simply absent from the map (banner falls back to a color panel).
 */
export async function getCollegeHeroPhotos() {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from("homepage_items")
    .select("college_id, image_url")
    .eq("item_type", "hero")
    .eq("scope_type", "college")
    .eq("is_active", true)
    .eq("status", "published")
    .is("deleted_at", null)
    .not("image_url", "is", null);
  if (error) throw new Error(error.message);
  const map: Record<string, string> = {};
  for (const row of data ?? []) {
    if (row.college_id && row.image_url) map[row.college_id] = row.image_url;
  }
  return map;
}

export async function getRecruiterLogos() {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from("recruiters")
    .select("company_name, logo_url, sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getJobListings() {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from("homepage_items")
    .select("id, title, subtitle, body")
    .eq("item_type", "job")
    .eq("is_active", true)
    .eq("status", "published")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * Fetch homepage items scoped to a specific college (scope_type = 'college').
 * Returns same shape as getGlobalHomepageItems.
 * Used by college landing pages to get their own stats/why_choose/trust_badges.
 */
export async function getCollegeHomepageItems(collegeSlug: string) {
  const supabase = publicSupabase();
  const { data: college } = await supabase
    .from("colleges")
    .select("id")
    .eq("slug", collegeSlug)
    .maybeSingle();
  if (!college) return [];

  const { data, error } = await supabase
    .from("homepage_items")
    .select(
      "id, item_type, pretitle, eyebrow, title, title_accent, subtitle, body, image_url, icon_name, link_href, link_label, secondary_link_href, secondary_link_label, sort_order, metadata",
    )
    .eq("scope_type", "college")
    .eq("college_id", college.id)
    .eq("is_active", true)
    .eq("status", "published")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getLatestEvents() {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from("events")
    .select(
      "id, slug, title, tag, start_date, description, featured_image_url, registration_link, sort_order",
    )
    .eq("status", "published")
    .eq("is_featured", true)
    .is("deleted_at", null)
    .order("featured_at", { ascending: false })
    .limit(8);
  if (error) throw new Error(error.message);
  return data ?? [];
}
