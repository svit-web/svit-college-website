import { createFileRoute, notFound } from "@tanstack/react-router";
import { PlacementPage, PlacementPageNotFound } from "@/components/site/PlacementPage";
import { getPlacementStatsByCollege, getAllRecruiters, type PlacementStatistics } from "@/lib/placement.functions";
type PlacementSlug = string;
interface PlacementPageContent {
  slug: PlacementSlug; collegeId: string; collegeName: string; shortCode: string; aboutText: string;
  details: { graphicalData: { year: string; studentsPlaced: number; placementPercentage: number }[]; statHighlights: { label: string; value: string }[] };
  summary: { placedStudents: { studentName: string; companyName: string; photo: string | null }[] };
  recruiters: { companyName: string; logo: string | null }[];
  placementOfficer: { name: string; designation: string; phone: string; email: string; photo: string | null };
}

// Map of valid college slugs
const collegeMapping: Record<string, { code: string; name: string; shortCode: string }> = {
  'svit-degree': { code: 'svit-degree', name: 'Sardar Vallabhbhai Patel Institute of Technology', shortCode: 'SVIT' },
  svica: { code: 'svica', name: 'SVIT College of Applied Sciences', shortCode: 'SVICA' },
  svion: { code: 'svion', name: 'SVIT Institute of Nursing', shortCode: 'SVION' },
  'svit-coa': { code: 'svit-coa', name: 'College of Architecture', shortCode: 'COA' },
};

export const Route = createFileRoute("/placement/$college")({
  head: ({ params }) => {
    const college = collegeMapping[params.college];
    const title = college ? `${college.shortCode} Placements — SVIT Vasad` : "Placements — SVIT Vasad";
    const desc = college
      ? `Placement outcomes, recruiters and Training & Placement Cell at ${college.name}.`
      : "SVIT Vasad Placement.";
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
    const college = collegeMapping[params.college];
    if (!college) throw notFound();

    const [stats, allRecruiters] = await Promise.all([
      getPlacementStatsByCollege({ data: params.college }) as Promise<PlacementStatistics[]>,
      getAllRecruiters(),
    ]);

    function toDisplayYear(academicYear: string): string {
      if (!academicYear.includes('-')) return academicYear;
      const part = academicYear.split('-')[1];
      return part.length === 2 ? '20' + part : part;
    }

    // Build chart data — ascending order
    const graphicalData = [...stats]
      .reverse()
      .map(s => ({
        year: toDisplayYear(s.academic_year),
        studentsPlaced: s.placed_students,
        placementPercentage: s.total_students > 0
          ? Math.round((s.placed_students / s.total_students) * 100)
          : 0,
      }));

    const latest = stats[0] ?? null;
    const statHighlights = latest
      ? [
          { label: 'Students Placed', value: `${latest.placed_students}+` },
          ...(latest.highest_package ? [{ label: 'Highest Package', value: `₹${latest.highest_package} LPA` }] : []),
          ...(latest.average_package ? [{ label: 'Average Package', value: `₹${latest.average_package} LPA` }] : []),
          ...(latest.recruiters_count ? [{ label: 'Companies Visited', value: `${latest.recruiters_count}+` }] : []),
        ]
      : [];

    // Filter recruiters for this college via metadata.colleges array
    const collegeRecruiters = allRecruiters
      .filter(r => {
        const cols = (r.metadata as any)?.colleges as string[] | undefined;
        return !cols || cols.includes(college.code);
      })
      .map(r => ({ companyName: r.company_name, logo: r.logo_url || null }));

    const aboutText = '';
    const placementOfficer = { name: '', designation: 'Training & Placement Officer', phone: '', email: '', photo: null };
    const placedStudents: { studentName: string; companyName: string; photo: string | null }[] = [];

    const content: PlacementPageContent = {
      slug: params.college as PlacementSlug,
      collegeId: college.code,
      collegeName: college.name,
      shortCode: college.shortCode,
      aboutText,
      details: {
        graphicalData,
        statHighlights,
      },
      summary: {
        placedStudents,
      },
      recruiters: collegeRecruiters,
      placementOfficer,
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
