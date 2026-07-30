import { createFileRoute, notFound } from "@tanstack/react-router";
import { PlacementPage, PlacementPageNotFound } from "@/components/site/PlacementPage";
import {
  getPlacementStatsByCollege,
  getRecruitersByCollege,
  getPlacementCell,
  getCollegeBySlug,
  getPlacedStudentsByCollege,
  type PlacementStatistics,
} from "@/lib/placement.functions";

type PlacementSlug = string;
interface PlacementPageContent {
  slug: PlacementSlug;
  collegeId: string;
  collegeName: string;
  shortCode: string;
  aboutText: string;
  heroTitle: string | null;
  heroSubtitle: string | null;
  details: {
    graphicalData: { year: string; studentsPlaced: number; placementPercentage: number }[];
    statHighlights: { label: string; value: string }[];
  };
  summary: {
    placedStudents: {
      studentName: string;
      companyName: string;
      department: string | null;
      photo: string | null;
      batchYear: string | null;
      packageLpa: number | null;
    }[];
  };
  recruiters: { companyName: string; logo: string | null }[];
  placementOfficer: { name: string; designation: string; phone: string; email: string; photo: string | null };
  defaultStudentPlaceholderUrl: string | null;
}

export const Route = createFileRoute("/placement/$college")({
  head: ({ params, loaderData }) => {
    const shortCode = (loaderData as any)?.content?.shortCode ?? params.college.toUpperCase();
    const collegeName = (loaderData as any)?.content?.collegeName ?? "SVIT Vasad";
    const title = `${shortCode} Placements — SVIT Vasad`;
    const desc = `Placement outcomes, recruiters and Training & Placement Cell at ${collegeName}.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },

  loader: async ({ params }) => {
    // ── Resolve college ───────────────────────────────────────
    let college: { id?: string; code: string; name: string; shortCode: string };

    if (params.college === "overview") {
      college = { code: "overview", name: "SVIT Group of Institutions", shortCode: "Overview" };
    } else {
      const found = await getCollegeBySlug({ data: params.college });
      if (!found) throw notFound();
      college = found;
    }

    const isOverview = params.college === "overview";

    // ── Parallel data fetch ───────────────────────────────────
    const [stats, collegeRecruiters, placementCell, dbPlacedStudents] = await Promise.all([
      getPlacementStatsByCollege({ data: params.college }) as Promise<PlacementStatistics[]>,
      getRecruitersByCollege({ data: params.college }),
      getPlacementCell({ data: college.code }),
      getPlacedStudentsByCollege({
        data: { collegeId: college.id ?? null, isOverview },
      }),
    ]);

    // ── Process stats ─────────────────────────────────────────
    function toDisplayYear(academicYear: string): string {
      if (!academicYear.includes("-")) return academicYear;
      const part = academicYear.split("-")[1];
      return part.length === 2 ? "20" + part : part;
    }

    let processedStats = stats;
    if (isOverview) {
      const yearMap = new Map<string, {
        academic_year: string;
        placed_students: number;
        total_students: number;
        highest_package: number;
        average_package_sum: number;
        average_package_count: number;
        recruiters_count: number;
      }>();

      for (const s of stats) {
        const year = s.academic_year;
        if (!yearMap.has(year)) {
          yearMap.set(year, {
            academic_year: year,
            placed_students: 0,
            total_students: 0,
            highest_package: 0,
            average_package_sum: 0,
            average_package_count: 0,
            recruiters_count: 0,
          });
        }
        const cur = yearMap.get(year)!;
        cur.placed_students += s.placed_students;
        cur.total_students += s.total_students;
        if (s.highest_package && s.highest_package > cur.highest_package) cur.highest_package = s.highest_package;
        if (s.average_package) { cur.average_package_sum += s.average_package; cur.average_package_count++; }
        if (s.recruiters_count) cur.recruiters_count += s.recruiters_count;
      }

      processedStats = Array.from(yearMap.values()).map(y => ({
        id: y.academic_year,
        department_id: null,
        academic_year: y.academic_year,
        placed_students: y.placed_students,
        total_students: y.total_students,
        highest_package: y.highest_package || null,
        average_package: y.average_package_count > 0
          ? Math.round((y.average_package_sum / y.average_package_count) * 10) / 10
          : null,
        recruiters_count: y.recruiters_count || null,
        status: "published" as const,
        metadata: {},
        created_at: "",
        updated_at: "",
      }));
      processedStats.sort((a, b) => b.academic_year.localeCompare(a.academic_year));
    }

    const graphicalData = [...processedStats].reverse().map(s => ({
      year: toDisplayYear(s.academic_year),
      studentsPlaced: s.placed_students,
      placementPercentage: s.total_students > 0
        ? Math.round((s.placed_students / s.total_students) * 100)
        : 0,
    }));

    const latest = processedStats[0] ?? null;
    const statHighlights = latest
      ? [
          { label: "Students Placed", value: `${latest.placed_students}+` },
          ...(latest.highest_package ? [{ label: "Highest Package", value: `₹${latest.highest_package} LPA` }] : []),
          ...(latest.average_package ? [{ label: "Average Package", value: `₹${latest.average_package} LPA` }] : []),
          ...(latest.recruiters_count ? [{ label: "Companies Visited", value: `${latest.recruiters_count}+` }] : []),
        ]
      : [];

    // ── Build page content ────────────────────────────────────
    const content: PlacementPageContent = {
      slug: params.college as PlacementSlug,
      collegeId: college.code,
      collegeName: college.name,
      shortCode: college.shortCode,
      aboutText:
        placementCell?.about_text ??
        (isOverview
          ? "The Central Training & Placement (T&P) Cell at SVIT Group of Institutions facilitates student growth and placement opportunities across all colleges."
          : ""),
      heroTitle: placementCell?.hero_title ?? null,
      heroSubtitle: placementCell?.hero_subtitle ?? null,
      details: { graphicalData, statHighlights },
      summary: {
        placedStudents: dbPlacedStudents.map(s => ({
          studentName: s.student_name,
          companyName: s.company_name,
          department: (s.department as any)?.name ?? null,
          photo: s.photo_url,
          batchYear: s.batch_year ?? null,
          packageLpa: s.package_lpa ?? null,
        })),
      },
      recruiters: collegeRecruiters.map(r => ({
        companyName: r.company_name,
        logo: r.logo_url?.trim() || null,
      })),
      placementOfficer: {
        name: placementCell?.officer_name ?? "",
        designation: placementCell?.officer_designation ?? "Training & Placement Officer",
        phone: placementCell?.officer_phone ?? "",
        email: placementCell?.officer_email ?? "",
        photo: placementCell?.officer_photo_url ?? null,
      },
      defaultStudentPlaceholderUrl: placementCell?.default_student_placeholder_url ?? null,
    };

    return { content };
  },
  notFoundComponent: PlacementPageNotFound,
  errorComponent: PlacementPageNotFound,
  component: PlacementRouteComponent,
});

function PlacementRouteComponent() {
  const data = Route.useLoaderData() as { content: PlacementPageContent } | undefined;
  if (!data?.content) return <PlacementPageNotFound />;
  return <PlacementPage content={data.content} />;
}
