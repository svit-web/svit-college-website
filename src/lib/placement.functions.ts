// Server functions for placement — all stats auto-calculated from placed_students records
import { createServerFn } from '@tanstack/react-start';
import { supabase } from '@/integrations/supabase/client';

// ── Types ─────────────────────────────────────────────────────

export interface Recruiter {
  id: string;
  company_name: string;
  logo_url: string;
  website_url: string | null;
  sort_order: number;
  college_codes?: string[] | null;
  metadata: { colleges?: string[]; [key: string]: any };
  created_at: string;
  updated_at: string;
}

export interface PlacementCell {
  id: string;
  college_code: string;
  about_text: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  officer_name: string | null;
  officer_designation: string | null;
  officer_phone: string | null;
  officer_email: string | null;
  officer_photo_url: string | null;
  default_student_placeholder_url: string | null;
}

export interface PlacedStudent {
  id: string;
  college_id: string;
  department_id: string | null;
  student_name: string;
  company_name: string;
  photo_url: string | null;
  batch_year: string | null;
  package_lpa: number | null;
  status: string;
  created_at: string;
  updated_at: string;
  college?: { id: string; slug: string; name: string } | null;
  department?: { id: string; name: string; slug: string } | null;
}

/** Auto-calculated placement stats from placed_students table */
export interface AutoStats {
  total: number;
  highestPackage: number | null;
  averagePackage: number | null;
  /** Sorted oldest → newest for charting */
  byYear: { year: string; count: number }[];
  /** Top student (highest package) per college — only populated on overview */
  topStudents: {
    collegeName: string;
    collegeSlug: string;
    studentName: string;
    companyName: string;
    packageLpa: number | null;
    photoUrl: string | null;
    departmentName: string | null;
    batchYear: string | null;
  }[];
}

// ── Phase 4: Auto-Stats Engine ────────────────────────────────
/**
 * Calculates all placement statistics directly from placed_students records.
 * No separate placement_statistics table needed.
 * - Per-college: total, highest, avg, year-wise chart
 * - Overview: above + top student per college for highlight cards
 */
export const getAutoStatsByCollege = createServerFn({ method: 'GET' })
  .validator((input: { collegeId: string | null; isOverview: boolean }) => input)
  .handler(async (ctx): Promise<AutoStats> => {
    const empty: AutoStats = { total: 0, highestPackage: null, averagePackage: null, byYear: [], topStudents: [] };
    try {
      let query = (supabase as any)
        .from('placed_students')
        .select('id, student_name, company_name, photo_url, batch_year, package_lpa, college_id, department_id, college:colleges(id, slug, name), department:departments(id, name)')
        .eq('status', 'published');

      if (!ctx.data.isOverview && ctx.data.collegeId) {
        query = query.eq('college_id', ctx.data.collegeId);
      }

      const { data: students, error } = await query;
      if (error || !students?.length) return empty;

      const total: number = students.length;

      // Highest + average package
      const withPkg = students.filter((s: any) => s.package_lpa != null);
      const highestPackage = withPkg.length > 0
        ? Math.max(...withPkg.map((s: any) => Number(s.package_lpa)))
        : null;
      const averagePackage = withPkg.length > 0
        ? Math.round((withPkg.reduce((sum: number, s: any) => sum + Number(s.package_lpa), 0) / withPkg.length) * 10) / 10
        : null;

      // Year-wise count (oldest → newest for bar chart)
      const yearMap = new Map<string, number>();
      for (const s of students) {
        if (s.batch_year) yearMap.set(s.batch_year, (yearMap.get(s.batch_year) ?? 0) + 1);
      }
      const byYear = Array.from(yearMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([year, count]) => ({ year, count }));

      // Top student per college (for overview highlight cards)
      let topStudents: AutoStats['topStudents'] = [];
      if (ctx.data.isOverview) {
        const best = new Map<string, any>();
        for (const s of students) {
          const slug = s.college?.slug;
          if (!slug || slug === 'overview') continue;
          const prev = best.get(slug);
          const isPkgBetter = !prev
            || (s.package_lpa != null && (prev.package_lpa == null || Number(s.package_lpa) > Number(prev.package_lpa)));
          if (isPkgBetter) best.set(slug, s);
        }
        topStudents = Array.from(best.values()).map((s: any) => ({
          collegeName: s.college?.name ?? '',
          collegeSlug: s.college?.slug ?? '',
          studentName: s.student_name,
          companyName: s.company_name,
          packageLpa: s.package_lpa != null ? Number(s.package_lpa) : null,
          photoUrl: s.photo_url || null,
          departmentName: s.department?.name ?? null,
          batchYear: s.batch_year ?? null,
        }));
      }

      return { total, highestPackage, averagePackage, byYear, topStudents };
    } catch {
      return empty;
    }
  });

// ── Recruiters ────────────────────────────────────────────────

export const getRecruitersByCollege = createServerFn({ method: 'GET' })
  .validator((collegeSlug: string) => collegeSlug)
  .handler(async (ctx) => {
    const fetchAll = async () => {
      const { data } = await supabase
        .from('recruiters').select('*').eq('status', 'published').order('sort_order', { ascending: true });
      return (data ?? []) as unknown as Recruiter[];
    };
    if (ctx.data === 'overview') return fetchAll();
    try {
      const { data, error } = await (supabase as any)
        .from('recruiters').select('*').eq('status', 'published')
        .or(`college_codes.cs.{${ctx.data}},college_codes.is.null`)
        .order('sort_order', { ascending: true });
      if (error) { console.warn('college_codes fallback:', error.message); return fetchAll(); }
      return (data ?? []) as unknown as Recruiter[];
    } catch { return fetchAll(); }
  });

/** Alias: fetch all published recruiters (used by non-placement routes) */
export const getAllRecruiters = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { data } = await supabase
      .from('recruiters').select('*').eq('status', 'published').order('sort_order', { ascending: true });
    return (data ?? []) as unknown as Recruiter[];
  });

// ── Placement Cell ────────────────────────────────────────────

export const getPlacementCell = createServerFn({ method: 'GET' })
  .validator((collegeCode: string) => collegeCode)
  .handler(async (ctx) => {
    const { data, error } = await (supabase as any)
      .from('placement_cells').select('*').eq('college_code', ctx.data).maybeSingle();
    if (error) { console.error('Error fetching placement cell:', error); return null; }
    return data as PlacementCell | null;
  });

// ── College Lookup ────────────────────────────────────────────

export const getCollegeBySlug = createServerFn({ method: 'GET' })
  .validator((slug: string) => slug)
  .handler(async (ctx) => {
    const { data, error } = await supabase
      .from('colleges').select('id, slug, code, name, metadata')
      .eq('slug', ctx.data).eq('status', 'published').is('deleted_at', null).maybeSingle();
    if (error || !data) return null;
    return {
      id: data.id as string,
      code: data.slug,
      name: data.name,
      shortCode: (data.metadata as any)?.shortCode ?? data.code,
    };
  });

/** All colleges for admin dropdowns */
export const getAllColleges = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { data, error } = await supabase
      .from('colleges').select('id, slug, name').eq('status', 'published').order('sort_order', { ascending: true });
    if (error) return [];
    return (data ?? []) as unknown as { id: string; slug: string; name: string }[];
  });

/** Departments for a college — admin dropdowns */
export const getDepartmentsByCollege = createServerFn({ method: 'GET' })
  .validator((collegeId: string) => collegeId)
  .handler(async (ctx) => {
    const { data, error } = await supabase
      .from('departments').select('id, name, slug')
      .eq('college_id', ctx.data).eq('status', 'published').order('name', { ascending: true });
    if (error) return [];
    return (data ?? []) as { id: string; name: string; slug: string }[];
  });

// ── Placed Students ───────────────────────────────────────────

/** Fetch placed students for a college — used by public pages */
export const getPlacedStudentsByCollege = createServerFn({ method: 'GET' })
  .validator((input: { collegeId: string | null; isOverview: boolean }) => input)
  .handler(async (ctx) => {
    try {
      let query = (supabase as any)
        .from('placed_students')
        .select('*, college:colleges(id, slug, name), department:departments(id, name, slug)')
        .eq('status', 'published')
        .order('batch_year', { ascending: false })
        .order('created_at', { ascending: false });

      if (!ctx.data.isOverview && ctx.data.collegeId) {
        query = query.eq('college_id', ctx.data.collegeId);
      }

      const { data, error } = await query;
      if (error) {
        if (error.code === 'PGRST205' || error.code === '42P01') return [] as PlacedStudent[];
        return [] as PlacedStudent[];
      }
      return (data ?? []) as unknown as PlacedStudent[];
    } catch {
      return [] as PlacedStudent[];
    }
  });
