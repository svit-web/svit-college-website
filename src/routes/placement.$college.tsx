import { createFileRoute, notFound } from "@tanstack/react-router";
import { PlacementPage, PlacementPageNotFound } from "@/components/site/PlacementPage";
import {
  getAutoStatsByCollege,
  getRecruitersByCollege,
  getPlacementCell,
  getCollegeBySlug,
  getPlacedStudentsByCollege,
  getDynamicPlacementDivisions,
  type AutoStats,
} from "@/lib/placement.functions";

// ── Page content shape ─────────────────────────────────────────
export interface PlacementPageContent {
  slug: string;
  collegeId: string;
  collegeName: string;
  shortCode: string;
  aboutText: string;
  heroTitle: string | null;
  heroSubtitle: string | null;
  /** All auto-calculated from placed_students — no manual entry */
  autoStats: AutoStats;
  placedStudents: {
    studentName: string;
    companyName: string;
    department: string | null;
    photo: string | null;
    batchYear: string | null;
    packageLpa: number | null;
  }[];
  recruiters: { companyName: string; logo: string | null }[];
  placementOfficer: {
    name: string;
    designation: string;
    phone: string;
    email: string;
    photo: string | null;
  };
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
    const isOverview = params.college === "overview";

    // ── Resolve college ───────────────────────────────────────
    let college: { id?: string; code: string; name: string; shortCode: string };
    if (isOverview) {
      college = { code: "overview", name: "SVIT Group of Institutions", shortCode: "Placements" };
    } else {
      const found = await getCollegeBySlug({ data: params.college });
      if (!found) throw notFound();
      college = found;
    }

    // ── Parallel fetch ────────────────────────────────────────
    const [autoStats, collegeRecruiters, placementCell, dbPlacedStudents, dynamicDivisions] = await Promise.all([
      getAutoStatsByCollege({ data: { collegeId: college.id ?? null, isOverview, collegeSlug: params.college } }),
      getRecruitersByCollege({ data: params.college }),
      getPlacementCell({ data: college.code }),
      getPlacedStudentsByCollege({ data: { collegeId: college.id ?? null, isOverview } }),
      getDynamicPlacementDivisions(),
    ]);

    // ── Build content ─────────────────────────────────────────
    const content: PlacementPageContent = {
      slug: params.college,
      collegeId: college.code,
      collegeName: college.name,
      shortCode: college.shortCode,
      aboutText:
        placementCell?.about_text?.trim() ||
        (isOverview
          ? "The Central Training & Placement (T&P) Cell at SVIT Group of Institutions facilitates student growth and placement opportunities across all colleges — Engineering, Architecture, Nursing, and Applied Sciences. We collaborate with national and multinational companies to bridge academic training and corporate demands."
          : `The Training & Placement Cell at ${college.name} conducts career guidance programs, industry interactions, mock interviews, and campus placement drives with premier recruitment partners.`),
      heroTitle: placementCell?.hero_title ?? null,
      heroSubtitle: placementCell?.hero_subtitle ?? null,
      autoStats,
      placedStudents: dbPlacedStudents.map((s) => ({
        studentName: s.student_name,
        companyName: s.company_name,
        department: (s.department as any)?.name ?? null,
        photo: s.photo_url,
        batchYear: s.batch_year ?? null,
        packageLpa: s.package_lpa != null ? Number(s.package_lpa) : null,
      })),
      recruiters: collegeRecruiters.map((r) => ({
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
      divisions: dynamicDivisions,
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
