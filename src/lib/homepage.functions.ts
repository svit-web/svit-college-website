import { publicSupabase } from "@/lib/supabase-public";
import { getEntryAlbums } from "@/lib/gallery.functions";

export async function getGlobalHomepageItems() {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from("homepage_items")
    .select(
      "id, item_type, pretitle, eyebrow, title, title_accent, subtitle, body, image_url, icon_name, link_href, link_label, link_entity_type, link_entity_id, secondary_link_href, secondary_link_label, sort_order, metadata",
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

const CAMPUS_LIFE_SECTION_PATHS: Record<string, string> = {
  overview: "/campus-life",
  facilities: "/campus-life/facilities",
  student_groups: "/campus-life/student-groups",
  events: "/campus-life/events",
  sports_and_athletics: "/campus-life/sports-and-athletics",
  nss_ncc: "/campus-life/nss-ncc",
};

/**
 * Resolve each campus_life_tile's destination at render time, per ADR 0006 —
 * a tile linked to a Facility/Student Club/Event never stores a URL, only the
 * entity's id, so a later rename/recategorize/detail-page toggle can't leave
 * a stale link. Tiles with no entity link (legacy rows, 'custom', 'none')
 * fall back to the existing free-text link_href, or null.
 */
export async function resolveCampusLifeTileLinks(
  tiles: {
    id: string;
    link_entity_type: string | null;
    link_entity_id: string | null;
    link_href: string | null;
  }[],
): Promise<Map<string, string | null>> {
  const supabase = publicSupabase();
  const result = new Map<string, string | null>();

  const idsOf = (type: string) =>
    tiles
      .filter((t) => t.link_entity_type === type && t.link_entity_id)
      .map((t) => t.link_entity_id as string);

  const facilityIds = idsOf("facility");
  const clubIds = idsOf("student_club");
  const eventIds = idsOf("event");

  const [facilities, clubs, events] = await Promise.all([
    facilityIds.length
      ? supabase
          .from("facilities")
          .select("id, slug, category")
          .in("id", facilityIds)
          .eq("status", "published")
          .eq("has_detail_page", true)
          .is("department_id", null) // excludes lab rows — those resolve via /departments/[dept]/labs/[slug], not this path
          .is("deleted_at", null)
      : Promise.resolve({ data: [] as { id: string; slug: string; category: string | null }[] }),
    clubIds.length
      ? supabase
          .from("student_clubs")
          .select("id, slug")
          .in("id", clubIds)
          .eq("status", "published")
          .eq("has_detail_page", true)
          .is("deleted_at", null)
      : Promise.resolve({ data: [] as { id: string; slug: string }[] }),
    eventIds.length
      ? supabase
          .from("events")
          .select("id, slug")
          .in("id", eventIds)
          .eq("status", "published")
          .eq("has_detail_page", true)
          .is("deleted_at", null)
      : Promise.resolve({ data: [] as { id: string; slug: string }[] }),
  ]);

  const facilityMap = new Map((facilities.data ?? []).map((f) => [f.id, f]));
  const clubMap = new Map((clubs.data ?? []).map((c) => [c.id, c]));
  const eventMap = new Map((events.data ?? []).map((e) => [e.id, e]));

  for (const tile of tiles) {
    switch (tile.link_entity_type) {
      case "facility": {
        const f = tile.link_entity_id ? facilityMap.get(tile.link_entity_id) : null;
        result.set(
          tile.id,
          f ? `/campus-life/facilities/${f.category ?? "academic"}/${f.slug}` : null,
        );
        break;
      }
      case "student_club": {
        const c = tile.link_entity_id ? clubMap.get(tile.link_entity_id) : null;
        result.set(tile.id, c ? `/campus-life/clubs/${c.slug}` : null);
        break;
      }
      case "event": {
        const e = tile.link_entity_id ? eventMap.get(tile.link_entity_id) : null;
        result.set(tile.id, e ? `/campus-life/events/${e.slug}` : null);
        break;
      }
      case "section":
        result.set(
          tile.id,
          (tile.link_href && CAMPUS_LIFE_SECTION_PATHS[tile.link_href]) || tile.link_href || null,
        );
        break;
      case "none":
        result.set(tile.id, null);
        break;
      default:
        // Legacy rows (link_entity_type not set yet) and 'custom' both use link_href as-is.
        result.set(tile.id, tile.link_href || null);
    }
  }

  return result;
}

export async function getCollegesGrid() {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from("colleges")
    .select(
      "slug, code, nav_label, name, logo_url, sort_order, metadata, show_in_navigation, tagline",
    )
    .eq("status", "published")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getRecruiterLogos() {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from("recruiters")
    .select("company_name, logo_url, website_url, sort_order")
    .eq("status", "published")
    .is("deleted_at", null)
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
    .is("deleted_at", null)
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
      "id, item_type, pretitle, eyebrow, title, title_accent, subtitle, body, image_url, icon_name, link_href, link_label, link_entity_type, link_entity_id, secondary_link_href, secondary_link_label, sort_order, metadata",
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
      "id, slug, title, tag, start_date, end_date, description, card_photo_url, album_id, registration_link, sort_order",
    )
    .eq("status", "published")
    .eq("is_featured", true)
    .is("deleted_at", null)
    .order("featured_at", { ascending: false })
    .limit(8);
  if (error) throw new Error(error.message);
  const rows = data ?? [];
  const albums = await getEntryAlbums(rows.map((r) => r.album_id));
  return rows.map(({ album_id, ...row }) => ({
    ...row,
    card_photo_url: albums.get(album_id ?? "")?.coverUrl ?? null,
  }));
}
