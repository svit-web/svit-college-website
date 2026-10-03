// Training & Placement Cell — Supabase-backed data layer.
//
// Storage map for the unified placement page:
//   hero / about / officer          → placement_cells row where college_code = 'overview'
//   packages, section config,
//   highlights, trend               → placement_cells.metadata (jsonb) on that same row
//   placed student cards            → placed_students table (FK → colleges)
//   recruiter logo wall             → recruiters table
//
// Reads run through server functions so the page renders correctly under SSR.
// Writes run in the browser with the admin's session so RLS sees `authenticated`.
import { createClient as createNextBrowserClient } from "@/app/lib/supabase/client";
import { publicSupabase } from "@/lib/supabase-public";

/** The single placement_cells row that backs the unified page. */
export const OVERVIEW_CODE = "overview";

// `any` because src/integrations/supabase/types.ts is stale against the live
// schema — it is missing placed_students entirely and the placement_cells
// hero_title / hero_subtitle columns. Regenerating it is tracked separately.
function serverClient(): any {
  return publicSupabase();
}

// ── Types ───────────────────────────────────────────────────────────

export interface PlacementHighlight {
  id: string;
  icon: string; // key into ICON_MAP in PlacementPage
  label: string;
}

export interface SectionVisibility {
  about: boolean;
  trend: boolean;
  placedStudents: boolean;
  recruiters: boolean;
  officer: boolean;
}

export interface SectionConfig {
  sections: SectionVisibility;
  order: string[];
  highlights: PlacementHighlight[];
}

export interface PlacedStudent {
  id: string;
  studentName: string;
  companyName: string;
  batchYear: string;
  photo: string | null;
  /**
   * colleges.slug — resolved to colleges.id on write. Required because
   * placed_students.college_id is NOT NULL (every row needs an owning
   * college for RLS/scoping), but the unified /placement page intentionally
   * never surfaces which college a student came from — that distinction
   * was deliberately dropped when the per-college pages were merged into
   * one hub. Not a bug: keep the field for the write path, don't add UI
   * to display it.
   */
  collegeId: string;
}

export interface RecruiterItem {
  id: string;
  companyName: string;
  company_name?: string;
  logo: string | null;
  sortOrder?: number;
}

export type Recruiter = RecruiterItem;

export interface PlacementOfficer {
  name: string;
  designation: string;
  phone: string;
  email: string;
  photo: string | null;
}

export interface PlacementYearPoint {
  year: string;
  studentsPlaced: number;
  placementPercentage: number;
}

export interface CollegeOption {
  slug: string;
  name: string;
  code: string;
}

export interface FullPlacementData {
  heroTitle: string;
  heroSubtitle: string;
  highestPackage: string;
  averagePackage: string;
  aboutText: string;
  sectionConfig: SectionConfig;
  officer: PlacementOfficer;
  placedStudents: PlacedStudent[];
  recruiters: RecruiterItem[];
  graphicalData: PlacementYearPoint[];
}

// ── Fallbacks ───────────────────────────────────────────────────────
// Used only until an admin saves the overview row for the first time.

export const DEFAULT_HIGHLIGHTS: PlacementHighlight[] = [
  { id: "h1", icon: "Target", label: "Industry-aligned Skill Bootcamps & Aptitude Training" },
  { id: "h2", icon: "MessagesSquare", label: "Mock Technical & HR Interview Practice" },
  { id: "h3", icon: "Briefcase", label: "200+ Top Recruiting Partners Nationwide" },
  { id: "h4", icon: "Award", label: "Paid Internships & Pre-Placement Offers (PPOs)" },
  { id: "h5", icon: "CalendarCheck", label: "Structured Annual On-Campus Drive Schedule" },
  { id: "h6", icon: "UserCheck", label: "Dedicated Branch-Wise Student Mentorship" },
];

export const DEFAULT_SECTION_CONFIG: SectionConfig = {
  sections: {
    about: true,
    trend: true,
    placedStudents: true,
    recruiters: true,
    officer: true,
  },
  order: ["about", "trend", "placedStudents", "recruiters", "officer"],
  highlights: DEFAULT_HIGHLIGHTS,
};

export const EMPTY_PLACEMENT_DATA: FullPlacementData = {
  heroTitle: "Training & Placement Cell",
  heroSubtitle:
    "Empowering SVIT graduates with world-class career opportunities, industry mentorship, and top campus recruitment.",
  highestPackage: "—",
  averagePackage: "—",
  aboutText: "",
  sectionConfig: DEFAULT_SECTION_CONFIG,
  officer: { name: "", designation: "", phone: "", email: "", photo: null },
  placedStudents: [],
  recruiters: [],
  graphicalData: [],
};

// ── Shape helpers ───────────────────────────────────────────────────

type OverviewMeta = {
  highestPackage?: string;
  averagePackage?: string;
  sectionConfig?: Partial<SectionConfig>;
  graphicalData?: PlacementYearPoint[];
};

function readMeta(raw: unknown): OverviewMeta {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as OverviewMeta;
}

/** True for ids that came back from Postgres (as opposed to client-minted `s_123`). */
export function isPersistedId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

// ── Reads ───────────────────────────────────────────────────────────

export async function getPlacementContent(): Promise<FullPlacementData> {
  const sb = serverClient();

    const [cellRes, studentsRes, recruitersRes] = await Promise.all([
      sb
        .from("placement_cells")
        .select(
          "about_text, hero_title, hero_subtitle, officer_name, officer_designation, officer_phone, officer_email, officer_photo_url, metadata",
        )
        .eq("college_code", OVERVIEW_CODE)
        .maybeSingle(),
      sb
        .from("placed_students")
        .select("id, student_name, company_name, batch_year, photo_url, colleges(slug)")
        .eq("status", "published")
        .is("deleted_at", null)
        .order("batch_year", { ascending: false })
        .order("student_name", { ascending: true }),
      sb
        .from("recruiters")
        .select("id, company_name, logo_url, sort_order")
        .eq("status", "published")
        .is("deleted_at", null)
        .order("sort_order", { ascending: true }),
    ]);

    if (cellRes.error) throw new Error(cellRes.error.message);
    if (studentsRes.error) throw new Error(studentsRes.error.message);
    if (recruitersRes.error) throw new Error(recruitersRes.error.message);

    const cell = cellRes.data as Record<string, any> | null;
    const meta = readMeta(cell?.metadata);

    return {
      heroTitle: cell?.hero_title || EMPTY_PLACEMENT_DATA.heroTitle,
      heroSubtitle: cell?.hero_subtitle || EMPTY_PLACEMENT_DATA.heroSubtitle,
      highestPackage: meta.highestPackage || EMPTY_PLACEMENT_DATA.highestPackage,
      averagePackage: meta.averagePackage || EMPTY_PLACEMENT_DATA.averagePackage,
      aboutText: cell?.about_text || "",
      sectionConfig: {
        sections: { ...DEFAULT_SECTION_CONFIG.sections, ...meta.sectionConfig?.sections },
        order: meta.sectionConfig?.order || DEFAULT_SECTION_CONFIG.order,
        highlights: meta.sectionConfig?.highlights || DEFAULT_HIGHLIGHTS,
      },
      officer: {
        name: cell?.officer_name || "",
        designation: cell?.officer_designation || "",
        phone: cell?.officer_phone || "",
        email: cell?.officer_email || "",
        photo: cell?.officer_photo_url || null,
      },
      placedStudents: (studentsRes.data ?? []).map((s: any) => ({
        id: s.id,
        studentName: s.student_name,
        companyName: s.company_name,
        batchYear: s.batch_year ?? "",
        photo: s.photo_url ?? null,
        collegeId: s.colleges?.slug ?? "",
      })),
      recruiters: (recruitersRes.data ?? []).map((r: any) => ({
        id: r.id,
        companyName: r.company_name,
        company_name: r.company_name,
        logo: r.logo_url ?? null,
        sortOrder: r.sort_order ?? 0,
      })),
      graphicalData: meta.graphicalData ?? [],
    };
}

/** Recruiter list for pages outside the placement hub (e.g. course pages). */
export async function getAllRecruiters(): Promise<RecruiterItem[]> {
  const sb = serverClient();
  const { data, error } = await sb
    .from("recruiters")
    .select("id, company_name, logo_url, sort_order")
    .eq("status", "published")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: any) => ({
    id: r.id,
    companyName: r.company_name,
    company_name: r.company_name,
    logo: r.logo_url ?? null,
    sortOrder: r.sort_order ?? 0,
  }));
}

/** Colleges available to tag a placed student against. */
export async function getPlacementColleges(): Promise<CollegeOption[]> {
  const sb = serverClient();
  const { data, error } = await sb
    .from("colleges")
    .select("slug, name, code")
    .eq("status", "published")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((c: any) => ({ slug: c.slug, name: c.name, code: c.code }));
}

// ── Write ───────────────────────────────────────────────────────────

/**
 * Persists the whole hub in one pass. Runs in the browser so the admin's
 * Supabase session supplies the `authenticated` role that RLS requires.
 * Throws on failure — callers surface the message rather than swallowing it.
 *
 * Note on the recruiters table specifically: it's also reachable directly
 * at /admin/recruiters (a generic AdminCrudManager table editor exposing
 * every column, including website_url, which this hub's recruiters tab
 * does not). This is an intentional split, not duplication to merge —
 * /admin/tnp-hub's "Recruiting Partners" tab is the quick logo-wall curator
 * (name + logo, reordered by drag position) that most admins want, while
 * /admin/recruiters is the full-schema fallback for fields the hub doesn't
 * surface. Both write the same `recruiters` table; this RPC reads the full
 * table and writes back the full array each save, so edits made via
 * /admin/recruiters survive a later hub save (sort_order is the one field
 * the hub save always overwrites, from array position).
 */
export async function savePlacementContent(data: FullPlacementData): Promise<void> {
  const sb = createNextBrowserClient() as any;

  // Runs as one Postgres function (save_placement_content) so the overview
  // row, student cards, and recruiter list all commit or all roll back
  // together — previously these were ~10 sequential unguarded calls with no
  // transaction, so a failure partway through left the hub half-saved.
  const { error } = await sb.rpc("save_placement_content", {
    p_cell: {
      heroTitle: data.heroTitle,
      heroSubtitle: data.heroSubtitle,
      aboutText: data.aboutText,
      officer: data.officer,
      highestPackage: data.highestPackage,
      averagePackage: data.averagePackage,
      sectionConfig: data.sectionConfig,
      graphicalData: data.graphicalData,
    },
    p_students: data.placedStudents,
    p_recruiters: data.recruiters,
  });
  if (error) throw new Error(error.message);
}
