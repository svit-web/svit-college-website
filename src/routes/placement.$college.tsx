import { createFileRoute, notFound } from "@tanstack/react-router";
import { PlacementPage, PlacementPageNotFound } from "@/components/site/PlacementPage";
import { getAllPlacementStats, getAllRecruiters } from "@/lib/placement.functions";
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
  svit: { code: 'svit', name: 'Sardar Vallabhbhai Patel Institute of Technology', shortCode: 'SVIT' },
  svica: { code: 'svica', name: 'SVIT College of Applied Sciences', shortCode: 'SVICA' },
  svion: { code: 'svion', name: 'SVIT Institute of Nursing', shortCode: 'SVION' },
  coa: { code: 'coa', name: 'SVIT College of Architecture', shortCode: 'COA' },
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

    const [allStats, allRecruiters] = await Promise.all([
      getAllPlacementStats(),
      getAllRecruiters(),
    ]);

    // Build graphicalData from all years' college-specific metadata (ascending order for chart)
    const graphicalData = allStats
      .filter(year => year.metadata?.colleges?.[college.code])
      .map(year => {
        const cd = year.metadata.colleges![college.code];
        // Convert "2024-25" → "2025" (use the end year for display)
        const displayYear = year.academic_year.includes('-')
          ? year.academic_year.split('-')[1].length === 2
            ? '20' + year.academic_year.split('-')[1]
            : year.academic_year.split('-')[1]
          : year.academic_year;
        return {
          year: displayYear,
          studentsPlaced: cd.studentsPlaced,
          placementPercentage: cd.placementPercentage,
        };
      })
      .reverse(); // ascending order for the chart

    // Get latest year's college data for stat highlights and extra info
    const latestYear = allStats.find(y => y.metadata?.colleges?.[college.code]);
    const latestCollegeData = latestYear?.metadata?.colleges?.[college.code];

    const statHighlights = latestCollegeData
      ? [
          { label: 'Students Placed', value: `${latestCollegeData.studentsPlaced}+` },
          { label: 'Highest Package', value: `₹${latestCollegeData.highestPackage} LPA` },
          { label: 'Average Package', value: `₹${latestCollegeData.averagePackage} LPA` },
          { label: 'Companies Visited', value: `${latestYear!.recruiters_count}+` },
        ]
      : [];

    // Filter recruiters for this college
    const collegeRecruiters = allRecruiters
      .filter(r => {
        const colleges = (r.metadata as any)?.colleges as string[] | undefined;
        return colleges?.includes(college.code);
      })
      .map(r => ({
        companyName: r.company_name,
        logo: r.logo_url || null,
      }));

    // Get aboutText, placementOfficer, placedStudents from latest year metadata
    const aboutText = latestCollegeData?.aboutText || '';
    const placementOfficer = latestCollegeData?.placementOfficer || {
      name: '',
      designation: 'Training & Placement Officer',
      phone: '',
      email: '',
      photo: null,
    };
    const placedStudents = latestCollegeData?.placedStudents || [];

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
  const { content } = Route.useLoaderData();
  return <PlacementPage content={content} />;
}
