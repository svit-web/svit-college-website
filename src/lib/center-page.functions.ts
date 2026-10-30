// Public data for the dedicated centre pages (/campus-life/centre-of-excellence,
// /campus-life/nss-ncc). The core is the centers row; the lists come from
// center_equipment / center_programs / center_members plus the MoUs, events
// and achievements tagged with center_id — see
// supabase/migrations/20261030140000_centre_pages.sql.
import { publicSupabase, unwrap } from "@/lib/supabase-public";
import { getCenterBySlug, type Center } from "@/lib/centers.functions";
import { getEntryAlbum, getEntryAlbums } from "@/lib/gallery.functions";
import { achievementCategoryLabel, achievementDetailHref } from "@/lib/achievements.functions";
import { formatEventDates } from "@/lib/event-types";
import type { EntryAlbum, EntryCardData } from "@/lib/entry";
import type { DeptStaffMember } from "@/lib/department-content.functions";

export { COE_PATH, COE_SLUG, NSS_NCC_PATH, NSS_NCC_SLUG } from "@/lib/center-paths";

/** How many of the newest events / achievements a centre page shows. */
export const CENTER_RECENT_LIMIT = 6;

export interface CenterEquipment {
  id: string;
  name: string;
  make_model: string | null;
  quantity: number | null;
  specifications: string | null;
  description: string | null;
  image_url: string | null;
}

export type CenterProgramType = "training" | "certification" | "workshop" | "internship" | "other";

export interface CenterProgram {
  id: string;
  title: string;
  program_type: CenterProgramType;
  certifying_body: string | null;
  duration: string | null;
  eligibility: string | null;
  mode: string | null;
  description: string | null;
  registration_url: string | null;
}

export interface CenterMou {
  id: string;
  partner_organization: string;
  purpose: string | null;
  signed_date: string | null;
  expiry_date: string | null;
  logo_url: string | null;
  activities: string[] | null;
}

export type CenterMemberGroup = "faculty" | "student" | "external";

export interface CenterPageData {
  center: Center;
  album: EntryAlbum | null;
  equipment: CenterEquipment[];
  programs: CenterProgram[];
  mous: CenterMou[];
  events: EntryCardData[];
  achievements: EntryCardData[];
  team: Record<CenterMemberGroup, DeptStaffMember[]>;
}

async function getCenterEquipment(centerId: string) {
  const result = await publicSupabase()
    .from("center_equipment")
    .select("id, name, make_model, quantity, specifications, description, image_url")
    .eq("center_id", centerId)
    .eq("status", "published")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });
  return unwrap(result, "centre equipment") as CenterEquipment[];
}

async function getCenterPrograms(centerId: string) {
  const result = await publicSupabase()
    .from("center_programs")
    .select(
      "id, title, program_type, certifying_body, duration, eligibility, mode, description, registration_url",
    )
    .eq("center_id", centerId)
    .eq("status", "published")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });
  return unwrap(result, "centre programmes") as CenterProgram[];
}

async function getCenterMous(centerId: string) {
  const result = await publicSupabase()
    .from("mous")
    .select("id, partner_organization, purpose, signed_date, expiry_date, logo_url, activities")
    .eq("center_id", centerId)
    .eq("status", "published")
    .is("deleted_at", null)
    .order("signed_date", { ascending: false });
  return unwrap(result, "centre MoUs") as CenterMou[];
}

async function getCenterEvents(centerId: string): Promise<EntryCardData[]> {
  const result = await publicSupabase()
    .from("events")
    .select("id, slug, title, description, start_date, end_date, has_detail_page, album_id")
    .eq("center_id", centerId)
    .eq("status", "published")
    .is("deleted_at", null)
    .order("start_date", { ascending: false })
    .limit(CENTER_RECENT_LIMIT);
  const rows = unwrap(result, "centre events") ?? [];
  const albums = await getEntryAlbums(rows.map((r) => r.album_id)).catch(
    () => new Map<string, EntryAlbum>(),
  );
  return rows.map((e) => {
    const album = e.album_id ? (albums.get(e.album_id) ?? null) : null;
    return {
      id: e.id,
      slug: e.slug,
      title: e.title,
      subtitle: formatEventDates(e.start_date, e.end_date),
      description: e.description,
      cardPhotoUrl: album?.coverUrl ?? null,
      hasDetailPage: !!e.has_detail_page,
      detailHref: e.has_detail_page ? `/campus-life/events/${e.slug}` : null,
      album: e.has_detail_page ? null : album,
    };
  });
}

async function getCenterAchievements(centerId: string): Promise<EntryCardData[]> {
  const result = await publicSupabase()
    .from("achievements")
    .select("id, slug, title, date, category, description, has_detail_page, album_id")
    .eq("center_id", centerId)
    .eq("status", "published")
    .is("deleted_at", null)
    .order("date", { ascending: false })
    .limit(CENTER_RECENT_LIMIT);
  const rows = unwrap(result, "centre achievements") ?? [];
  const albums = await getEntryAlbums(rows.map((r) => r.album_id)).catch(
    () => new Map<string, EntryAlbum>(),
  );
  return rows.map((a) => {
    const album = a.album_id ? (albums.get(a.album_id) ?? null) : null;
    return {
      id: a.id,
      slug: a.slug,
      title: a.title,
      subtitle: `${achievementCategoryLabel(a.category)} · ${formatEventDates(a.date)}`,
      description: a.description,
      cardPhotoUrl: album?.coverUrl ?? null,
      hasDetailPage: !!a.has_detail_page,
      detailHref: a.has_detail_page ? achievementDetailHref(a.slug) : null,
      album: a.has_detail_page ? null : album,
    };
  });
}

// A member is either a linked staff profile (name, photo and profile link come
// from it) or a free-text person; `role` is always the card's designation line.
async function getCenterTeam(centerId: string): Promise<CenterPageData["team"]> {
  const result = await publicSupabase()
    .from("center_members")
    .select(
      "id, name, role, member_group, email, photo_url, staff:staff_profiles(id, title, first_name, last_name, email, photo_url, employee_code, status, deleted_at)",
    )
    .eq("center_id", centerId)
    .eq("status", "published")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });
  const rows = unwrap(result, "centre team") ?? [];

  const team: CenterPageData["team"] = { faculty: [], student: [], external: [] };
  for (const r of rows as any[]) {
    const s = r.staff && r.staff.status === "published" && !r.staff.deleted_at ? r.staff : null;
    const name = s
      ? `${s.title ? s.title + " " : ""}${s.first_name} ${s.last_name}`.trim()
      : (r.name ?? "").trim();
    if (!name) continue;
    const group = (r.member_group in team ? r.member_group : "faculty") as CenterMemberGroup;
    team[group].push({
      id: r.id,
      name,
      designation: r.role,
      rankGroup: "Faculty",
      email: r.email ?? s?.email ?? null,
      avatarUrl: r.photo_url ?? s?.photo_url ?? null,
      employeeCode: s?.employee_code ?? null,
      industryYears: null,
      teachingYears: null,
      musterNumber: null,
    });
  }
  return team;
}

/**
 * Everything a centre page renders. Returns null when the centre row is missing
 * or unpublished; each list degrades to empty so one failing query hides a
 * section instead of the whole page.
 */
export async function getCenterPage(slug: string): Promise<CenterPageData | null> {
  const center = await getCenterBySlug(slug).catch(() => null);
  if (!center) return null;

  const [album, equipment, programs, mous, events, achievements, team] = await Promise.all([
    getEntryAlbum(center.album_id).catch(() => null),
    getCenterEquipment(center.id).catch(() => []),
    getCenterPrograms(center.id).catch(() => []),
    getCenterMous(center.id).catch(() => []),
    getCenterEvents(center.id).catch(() => []),
    getCenterAchievements(center.id).catch(() => []),
    getCenterTeam(center.id).catch(() => ({ faculty: [], student: [], external: [] })),
  ]);

  return { center, album, equipment, programs, mous, events, achievements, team };
}
