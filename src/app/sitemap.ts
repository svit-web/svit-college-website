import type { MetadataRoute } from "next";
import { publicSupabase } from "@/lib/supabase-public";
import { SITE_URL } from "@/lib/seo";
import { CENTERS_WITH_OWN_PAGE } from "@/lib/centers.functions";
import { ACTIVITY_EVENT_TYPES } from "@/lib/department-content.functions";

// Built per request from Supabase so content published in the admin panel
// shows up immediately. Each query mirrors the filters of the page's own
// loader (published, not deleted, has_detail_page where the route needs it)
// so the sitemap never lists a URL that 404s.
export const dynamic = "force-dynamic";

type Entry = MetadataRoute.Sitemap[number];
type ChangeFrequency = Entry["changeFrequency"];

const STATIC_ROUTES: Array<[path: string, priority: number, changeFrequency: ChangeFrequency]> = [
  ["/", 1.0, "daily"],
  ["/about/history-vision-mission", 0.8, "monthly"],
  ["/about/chairman-message", 0.6, "yearly"],
  ["/about/principal-message", 0.6, "yearly"],
  ["/about/board-of-management", 0.5, "yearly"],
  ["/about/accreditation", 0.6, "yearly"],
  ["/about/committees", 0.5, "yearly"],
  ["/about/media", 0.5, "monthly"],
  ["/admissions", 0.9, "weekly"],
  ["/admissions/inquiry", 0.8, "monthly"],
  ["/admissions/intake-fees", 0.8, "monthly"],
  ["/admissions/scholarships", 0.7, "monthly"],
  ["/colleges", 0.9, "monthly"],
  ["/courses", 0.8, "monthly"],
  ["/placement", 0.8, "monthly"],
  ["/news", 0.7, "daily"],
  ["/gallery", 0.5, "weekly"],
  ["/campus-life", 0.6, "monthly"],
  ["/campus-life/events", 0.7, "weekly"],
  ["/campus-life/facilities", 0.6, "monthly"],
  ["/campus-life/student-groups", 0.6, "monthly"],
  ["/campus-life/nss-ncc", 0.5, "monthly"],
  ["/campus-life/sports-and-athletics", 0.5, "monthly"],
  ["/coe", 0.5, "monthly"],
  ["/downloads", 0.5, "weekly"],
  ["/careers", 0.5, "weekly"],
  ["/parents", 0.4, "monthly"],
  ["/anti-ragging", 0.4, "yearly"],
  ["/grievance", 0.4, "yearly"],
];

function entry(
  path: string,
  priority: number,
  changeFrequency: ChangeFrequency,
  lastModified?: string | null,
): Entry {
  return {
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    priority,
    changeFrequency,
    ...(lastModified && { lastModified }),
  };
}

// A failing table query drops that section instead of 500ing the sitemap.
async function rows<T>(query: PromiseLike<{ data: T[] | null; error: unknown }>, label: string) {
  const { data, error } = await query;
  if (error) {
    console.error(`sitemap: failed to load ${label}`, error);
    return [] as T[];
  }
  return data ?? [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sb = publicSupabase();
  const published = <Q extends { eq: any; is: any }>(q: Q): Q =>
    q.eq("status", "published").is("deleted_at", null);

  const [
    colleges,
    departments,
    programmes,
    deptCourses,
    posts,
    events,
    albums,
    staff,
    clubs,
    facilities,
    labs,
    centers,
    achievements,
    activityDeptIds,
  ] = await Promise.all([
    rows(published(sb.from("colleges").select("slug, updated_at")), "colleges"),
    rows(published(sb.from("departments").select("id, code, updated_at")), "departments"),
    rows(
      published(sb.from("courses").select("code, updated_at"))
        .eq("is_programme", true)
        .is("department_id", null),
      "programmes",
    ),
    rows(
      published(sb.from("courses").select("id, updated_at")).not("department_id", "is", null),
      "department courses",
    ),
    rows(published(sb.from("posts").select("slug, updated_at")), "posts"),
    rows(
      published(sb.from("events").select("slug, updated_at")).eq("has_detail_page", true),
      "events",
    ),
    rows(
      published(sb.from("gallery_albums").select("slug, updated_at")).eq(
        "show_in_public_gallery",
        true,
      ),
      "gallery albums",
    ),
    rows(
      published(sb.from("staff_profiles").select("employee_code, updated_at")).not(
        "employee_code",
        "is",
        null,
      ),
      "staff",
    ),
    rows(
      published(sb.from("student_clubs").select("slug, updated_at")).eq("has_detail_page", true),
      "clubs",
    ),
    rows(
      published(sb.from("facilities").select("slug, category, updated_at"))
        .eq("has_detail_page", true)
        .is("department_id", null),
      "facilities",
    ),
    rows(
      published(sb.from("facilities").select("slug, department_id, updated_at"))
        .eq("has_detail_page", true)
        .eq("facility_type", "laboratory")
        .not("department_id", "is", null),
      "labs",
    ),
    rows(
      published(sb.from("centers").select("slug, updated_at")).eq("has_detail_page", true),
      "centers",
    ),
    rows(
      published(sb.from("achievements").select("slug, department_id, updated_at")).eq(
        "has_detail_page",
        true,
      ),
      "achievements",
    ),
    rows(
      published(sb.from("events").select("department_id"))
        .in("event_type", ACTIVITY_EVENT_TYPES)
        .not("department_id", "is", null),
      "department activities",
    ),
  ]);

  const deptCodeById = new Map(departments.map((d) => [d.id, d.code]));
  const deptsWithLabs = new Set(labs.map((l) => l.department_id));
  const deptsWithActivities = new Set(activityDeptIds.map((e) => e.department_id));
  const deptsWithAchievements = new Set(achievements.map((a) => a.department_id).filter(Boolean));

  const out: MetadataRoute.Sitemap = STATIC_ROUTES.map(([path, priority, freq]) =>
    entry(path, priority, freq),
  );

  for (const c of colleges) out.push(entry(`/colleges/${c.slug}`, 0.9, "monthly", c.updated_at));

  for (const d of departments) {
    if (!d.code) continue;
    const base = `/departments/${d.code}`;
    out.push(entry(base, 0.8, "monthly", d.updated_at));
    out.push(entry(`${base}/staff`, 0.6, "monthly"));
    if (deptsWithLabs.has(d.id)) out.push(entry(`${base}/labs`, 0.5, "monthly"));
    if (deptsWithActivities.has(d.id)) out.push(entry(`${base}/activities`, 0.5, "weekly"));
    if (deptsWithAchievements.has(d.id)) out.push(entry(`${base}/achievements`, 0.5, "monthly"));
  }

  for (const p of programmes) out.push(entry(`/courses/${p.code}`, 0.8, "monthly", p.updated_at));
  for (const c of deptCourses) out.push(entry(`/programs/${c.id}`, 0.7, "monthly", c.updated_at));
  for (const p of posts) out.push(entry(`/news/${p.slug}`, 0.6, "monthly", p.updated_at));
  for (const e of events) {
    out.push(entry(`/campus-life/events/${e.slug}`, 0.6, "monthly", e.updated_at));
  }
  for (const a of albums) out.push(entry(`/gallery/${a.slug}`, 0.4, "monthly", a.updated_at));
  for (const s of staff) {
    out.push(entry(`/staff/${encodeURIComponent(s.employee_code!)}`, 0.4, "monthly", s.updated_at));
  }
  for (const c of clubs) {
    out.push(entry(`/campus-life/clubs/${c.slug}`, 0.5, "monthly", c.updated_at));
    out.push(entry(`/campus-life/clubs/${c.slug}/events`, 0.4, "weekly"));
  }
  for (const f of facilities) {
    if (f.category !== "academic" && f.category !== "amenities") continue;
    out.push(
      entry(`/campus-life/facilities/${f.category}/${f.slug}`, 0.5, "monthly", f.updated_at),
    );
  }
  for (const l of labs) {
    const code = l.department_id && deptCodeById.get(l.department_id);
    if (code) out.push(entry(`/departments/${code}/labs/${l.slug}`, 0.4, "monthly", l.updated_at));
  }
  for (const c of centers) {
    if (CENTERS_WITH_OWN_PAGE.has(c.slug)) continue;
    out.push(entry(`/student-corner/${c.slug}`, 0.5, "monthly", c.updated_at));
  }
  for (const a of achievements) {
    out.push(entry(`/achievements/${a.slug}`, 0.4, "yearly", a.updated_at));
  }

  return out;
}
