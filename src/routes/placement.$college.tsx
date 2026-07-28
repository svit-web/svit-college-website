import { createFileRoute, notFound } from "@tanstack/react-router";
import { PlacementPage, PlacementPageNotFound } from "@/components/site/PlacementPage";
import { getPlacementStatsByCollege, getAllRecruiters, getPlacementCell, getCollegeBySlug, type PlacementStatistics } from "@/lib/placement.functions";

type PlacementSlug = string;
interface PlacementPageContent {
  slug: PlacementSlug; collegeId: string; collegeName: string; shortCode: string; aboutText: string;
  details: { graphicalData: { year: string; studentsPlaced: number; placementPercentage: number }[]; statHighlights: { label: string; value: string }[] };
  summary: { placedStudents: { studentName: string; companyName: string; photo: string | null }[] };
  recruiters: { companyName: string; logo: string | null }[];
  placementOfficer: { name: string; designation: string; phone: string; email: string; photo: string | null };
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
    const college = await getCollegeBySlug({ data: params.college });
    if (!college) throw notFound();

    const [stats, allRecruiters, placementCell] = await Promise.all([
      getPlacementStatsByCollege({ data: params.college }) as Promise<PlacementStatistics[]>,
      getAllRecruiters(),
      getPlacementCell({ data: params.college }),
    ]);

    function toDisplayYear(academicYear: string): string {
      if (!academicYear.includes('-')) return academicYear;
      const part = academicYear.split('-')[1];
      return part.length === 2 ? '20' + part : part;
    }

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

    const collegeRecruiters = allRecruiters
      .filter(r => {
        const cols = (r.metadata as any)?.colleges as string[] | undefined;
        return !cols || cols.includes(college.code);
      })
      .map(r => ({ companyName: r.company_name, logo: r.logo_url || null }));

    const content: PlacementPageContent = {
      slug: params.college as PlacementSlug,
      collegeId: college.code,
      collegeName: college.name,
      shortCode: college.shortCode,
      aboutText: placementCell?.about_text ?? '',
      details: { graphicalData, statHighlights },
      summary: { placedStudents: [] },
      recruiters: collegeRecruiters,
      placementOfficer: {
        name: placementCell?.officer_name ?? '',
        designation: placementCell?.officer_designation ?? 'Training & Placement Officer',
        phone: placementCell?.officer_phone ?? '',
        email: placementCell?.officer_email ?? '',
        photo: placementCell?.officer_photo_url ?? null,
      },
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
