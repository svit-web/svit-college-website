import { createFileRoute, notFound } from "@tanstack/react-router";
import { PlacementPage, PlacementPageNotFound } from "@/components/site/PlacementPage";
import { getPlacementStatsByCollege, getAllRecruiters, getPlacementCell, getCollegeBySlug, getPlacedStudentsByCollege, type PlacementStatistics } from "@/lib/placement.functions";

type PlacementSlug = string;
interface PlacementPageContent {
  slug: PlacementSlug; collegeId: string; collegeName: string; shortCode: string; aboutText: string;
  details: { graphicalData: { year: string; studentsPlaced: number; placementPercentage: number }[]; statHighlights: { label: string; value: string }[] };
  summary: { placedStudents: { studentName: string; companyName: string; photo: string | null }[] };
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
    let college;
    if (params.college === 'overview') {
      college = {
        code: 'overview',
        name: 'SVIT Group of Institutions',
        shortCode: 'Overview'
      };
    } else {
      college = await getCollegeBySlug({ data: params.college });
      if (!college) throw notFound();
    }

    const [stats, allRecruiters, placementCell, dbPlacedStudents] = await Promise.all([
      getPlacementStatsByCollege({ data: params.college }) as Promise<PlacementStatistics[]>,
      getAllRecruiters(),
      getPlacementCell({ data: college.code }),
      getPlacedStudentsByCollege({ data: college.code }),
    ]);

    function toDisplayYear(academicYear: string): string {
      if (!academicYear.includes('-')) return academicYear;
      const part = academicYear.split('-')[1];
      return part.length === 2 ? '20' + part : part;
    }

    let processedStats = stats;
    if (params.college === 'overview') {
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
        const current = yearMap.get(year)!;
        current.placed_students += s.placed_students;
        current.total_students += s.total_students;
        if (s.highest_package && s.highest_package > current.highest_package) {
          current.highest_package = s.highest_package;
        }
        if (s.average_package) {
          current.average_package_sum += s.average_package;
          current.average_package_count += 1;
        }
        if (s.recruiters_count) {
          current.recruiters_count += s.recruiters_count;
        }
      }

      processedStats = Array.from(yearMap.values()).map(yearData => ({
        id: yearData.academic_year,
        department_id: null,
        academic_year: yearData.academic_year,
        placed_students: yearData.placed_students,
        total_students: yearData.total_students,
        highest_package: yearData.highest_package || null,
        average_package: yearData.average_package_count > 0 
          ? Math.round((yearData.average_package_sum / yearData.average_package_count) * 10) / 10 
          : null,
        recruiters_count: yearData.recruiters_count || null,
        status: 'published',
        metadata: {},
        created_at: '',
        updated_at: '',
      } as any));
      
      processedStats.sort((a, b) => b.academic_year.localeCompare(a.academic_year));
    }

    const graphicalData = [...processedStats]
      .reverse()
      .map(s => ({
        year: toDisplayYear(s.academic_year),
        studentsPlaced: s.placed_students,
        placementPercentage: s.total_students > 0
          ? Math.round((s.placed_students / s.total_students) * 100)
          : 0,
      }));

    const latest = processedStats[0] ?? null;
    const statHighlights = latest
      ? [
          { label: 'Students Placed', value: `${latest.placed_students}+` },
          ...(latest.highest_package ? [{ label: 'Highest Package', value: `₹${latest.highest_package} LPA` }] : []),
          ...(latest.average_package ? [{ label: 'Average Package', value: `₹${latest.average_package} LPA` }] : []),
          ...(latest.recruiters_count ? [{ label: 'Companies Visited', value: `${latest.recruiters_count}+` }] : []),
        ]
      : [];

    const collegeRecruiters = allRecruiters
      .filter(r => {
        if (params.college === 'overview') return true;
        const cols = (r.metadata as any)?.colleges as string[] | undefined;
        return !cols || cols.includes(college.code);
      })
      .map(r => ({ companyName: r.company_name, logo: r.logo_url || null }));

    const content: PlacementPageContent = {
      slug: params.college as PlacementSlug,
      collegeId: college.code,
      collegeName: college.name,
      shortCode: college.shortCode,
      aboutText: placementCell?.about_text ?? (params.college === 'overview'
        ? 'The Central Training & Placement (T&P) Cell at SVIT Group of Institutions facilitates student growth and placement opportunities across all colleges, including Engineering, Architecture, Nursing, and Applied Sciences. We collaborate with national and multinational companies to bridge academic training and corporate demands.'
        : ''),
      details: { graphicalData, statHighlights },
      summary: {
        placedStudents: dbPlacedStudents.map(s => ({
          studentName: s.student_name,
          companyName: s.company_name,
          photo: s.photo_url
        }))
      },
      recruiters: collegeRecruiters,
      placementOfficer: {
        name: placementCell?.officer_name ?? '',
        designation: placementCell?.officer_designation ?? 'Training & Placement Officer',
        phone: placementCell?.officer_phone ?? '',
        email: placementCell?.officer_email ?? '',
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
