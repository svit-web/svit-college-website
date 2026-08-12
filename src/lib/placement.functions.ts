// Training & Placement Cell — Supabase-backed data layer.
//
// Storage map for the unified placement page:
//   hero / about / officer          → placement_cells row where college_code = 'overview'
//   packages, section config,
//   highlights, trend, testimonials → placement_cells.metadata (jsonb) on that same row
//   placed student cards            → placed_students table (FK → colleges)
//   recruiter logo wall             → recruiters table
//
// Reads run through server functions so the page renders correctly under SSR.
// Writes run in the browser with the admin's session so RLS sees `authenticated`.
import { supabase } from "@/integrations/supabase/client";
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
  testimonials?: boolean;
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
  /** colleges.slug — resolved to colleges.id on write */
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

export interface PlacementTestimonial {
  id: string;
  studentName: string;
  designation: string;
  companyName: string;
  batchYear: string;
  departmentName: string;
  quote: string;
  photoUrl: string | null;
  rating?: number;
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
  testimonials: PlacementTestimonial[];
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
    testimonials: true,
  },
  order: ["about", "trend", "placedStudents", "recruiters", "officer", "testimonials"],
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
  testimonials: [],
};

// ── Shape helpers ───────────────────────────────────────────────────

type OverviewMeta = {
  highestPackage?: string;
  averagePackage?: string;
  sectionConfig?: Partial<SectionConfig>;
  graphicalData?: PlacementYearPoint[];
  testimonials?: PlacementTestimonial[];
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
      testimonials: meta.testimonials ?? [],
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
 */
export async function savePlacementContent(data: FullPlacementData): Promise<void> {
  const sb = supabase as any;

  // 1 ── overview row: hero, about, officer, and everything JSON-shaped
  const { error: cellError } = await sb.from("placement_cells").upsert(
    {
      college_code: OVERVIEW_CODE,
      hero_title: data.heroTitle,
      hero_subtitle: data.heroSubtitle,
      about_text: data.aboutText,
      officer_name: data.officer.name,
      officer_designation: data.officer.designation,
      officer_phone: data.officer.phone,
      officer_email: data.officer.email,
      officer_photo_url: data.officer.photo,
      status: "published",
      metadata: {
        highestPackage: data.highestPackage,
        averagePackage: data.averagePackage,
        sectionConfig: data.sectionConfig,
        graphicalData: data.graphicalData,
        testimonials: data.testimonials,
      },
    },
    { onConflict: "college_code" },
  );
  if (cellError) throw new Error(`Placement cell: ${cellError.message}`);

  // 2 ── resolve college slugs → ids for the student cards
  const { data: colleges, error: collegeError } = await sb
    .from("colleges")
    .select("id, slug")
    .is("deleted_at", null);
  if (collegeError) throw new Error(`Colleges: ${collegeError.message}`);
  const collegeIdBySlug = new Map<string, string>(
    (colleges ?? []).map((c: any) => [c.slug, c.id]),
  );

  // 3 ── placed_students: update existing, insert new, delete removed
  const { data: existingStudents, error: studentReadError } = await sb
    .from("placed_students")
    .select("id");
  if (studentReadError) throw new Error(`Placed students: ${studentReadError.message}`);

  const keptStudentIds = new Set(
    data.placedStudents.filter((s) => isPersistedId(s.id)).map((s) => s.id),
  );
  const removedStudentIds = (existingStudents ?? [])
    .map((s: any) => s.id)
    .filter((id: string) => !keptStudentIds.has(id));

  for (const student of data.placedStudents) {
    const collegeId = collegeIdBySlug.get(student.collegeId);
    if (!collegeId) {
      throw new Error(
        `"${student.studentName}" is tagged to an unknown college (${student.collegeId || "none"}).`,
      );
    }
    // Only the fields this screen owns — package_lpa / department_id set
    // elsewhere are left untouched.
    const row = {
      college_id: collegeId,
      student_name: student.studentName,
      company_name: student.companyName,
      batch_year: student.batchYear || null,
      photo_url: student.photo,
      status: "published",
    };

    if (isPersistedId(student.id)) {
      const { error } = await sb.from("placed_students").update(row).eq("id", student.id);
      if (error) throw new Error(`Placed students: ${error.message}`);
    } else {
      const { error } = await sb.from("placed_students").insert(row);
      if (error) throw new Error(`Placed students: ${error.message}`);
    }
  }

  if (removedStudentIds.length) {
    const { error } = await sb.from("placed_students").delete().in("id", removedStudentIds);
    if (error) throw new Error(`Placed students: ${error.message}`);
  }

  // 4 ── recruiters: same update / insert / soft-delete cycle
  const { data: existingRecruiters, error: recruiterReadError } = await sb
    .from("recruiters")
    .select("id")
    .is("deleted_at", null);
  if (recruiterReadError) throw new Error(`Recruiters: ${recruiterReadError.message}`);

  const keptRecruiterIds = new Set(
    data.recruiters.filter((r) => isPersistedId(r.id)).map((r) => r.id),
  );
  const removedRecruiterIds = (existingRecruiters ?? [])
    .map((r: any) => r.id)
    .filter((id: string) => !keptRecruiterIds.has(id));

  for (const [index, recruiter] of data.recruiters.entries()) {
    const row = {
      company_name: recruiter.companyName,
      logo_url: recruiter.logo,
      sort_order: index,
      status: "published",
    };

    if (isPersistedId(recruiter.id)) {
      const { error } = await sb.from("recruiters").update(row).eq("id", recruiter.id);
      if (error) throw new Error(`Recruiters: ${error.message}`);
    } else {
      const { error } = await sb.from("recruiters").insert(row);
      if (error) throw new Error(`Recruiters: ${error.message}`);
    }
  }

  if (removedRecruiterIds.length) {
    const { error } = await sb
      .from("recruiters")
      .update({ deleted_at: new Date().toISOString() })
      .in("id", removedRecruiterIds);
    if (error) throw new Error(`Recruiters: ${error.message}`);
  }
}
