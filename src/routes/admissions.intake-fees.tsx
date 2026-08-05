import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { getAllCoursesWithIntakeFees, type CourseWithCollegeInfo } from "@/lib/intake-fees.functions";
import { getMiscSettings } from "@/lib/site-settings.functions";

export const Route = createFileRoute("/admissions/intake-fees")({
  head: ({ loaderData }) => {
    const yr = loaderData?.admissionYear;
    return { meta: [{ title: yr ? `Intake & Fees ${yr} — SVIT Vasad` : "Intake & Fees — SVIT Vasad" }, { name: "description", content: "Programme-wise annual intake and tuition fees per semester across all colleges at SVIT Vasad." }] };
  },
  loader: async () => {
    const [courses, misc] = await Promise.all([getAllCoursesWithIntakeFees(), getMiscSettings()]);
    return { courses, admissionYear: misc.admission_year };
  },
  component: IntakeFeesPage,
});

const DEGREE_LABEL: Record<string, string> = {
  undergraduate: "Undergraduate",
  graduate: "Postgraduate",
  doctorate: "Doctorate",
  certificate: "Certificate / Diploma",
};

function groupByCollege(courses: CourseWithCollegeInfo[]) {
  const map = new Map<string, { name: string; slug: string; courses: CourseWithCollegeInfo[] }>();
  for (const c of courses) {
    if (!map.has(c.college_slug)) {
      map.set(c.college_slug, { name: c.college_name, slug: c.college_slug, courses: [] });
    }
    map.get(c.college_slug)!.courses.push(c);
  }
  return Array.from(map.values());
}

function IntakeFeesPage() {
  const { courses, admissionYear } = Route.useLoaderData();
  const groups = groupByCollege(courses);

  return (
    <>
      <PageHero
        title="Intake & Fees"
        accent={admissionYear}
        subtitle="Programme-wise annual intake and tuition fees (per semester) across all SVIT colleges."
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Admissions", to: "/admissions" },
          { label: "Intake & Fees" },
        ]}
      />

      <section className="container-page py-16 space-y-14">
        {groups.length === 0 && (
          <p className="text-center text-muted-foreground py-20">Fee information will be published soon.</p>
        )}
        {groups.map((college) => (
          <div key={college.slug}>
            <SectionHeading eyebrow="College" title={college.name} />
            <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-navy text-white text-xs uppercase tracking-wider">
                  <tr>
                    <th className="p-4 text-left">Programme</th>
                    <th className="p-4 text-left">Level</th>
                    <th className="p-4 text-left">Duration</th>
                    <th className="p-4 text-center">Annual Intake</th>
                    <th className="p-4 text-left">Tuition Fees (Per Sem)</th>
                  </tr>
                </thead>
                <tbody>
                  {college.courses.map((c, i) => (
                    <tr key={c.id} className={`border-t border-border ${i % 2 === 1 ? "bg-secondary/30" : ""}`}>
                      <td className="p-4 font-semibold text-navy">{c.name}</td>
                      <td className="p-4 text-muted-foreground">{DEGREE_LABEL[c.degree_level] ?? c.degree_level}</td>
                      <td className="p-4 text-muted-foreground">{c.duration ?? "—"}</td>
                      <td className="p-4 text-center font-semibold text-navy">
                        {c.intake != null ? c.intake : "—"}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {c.fees_per_semester ? `₹${c.fees_per_semester}` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-secondary/40">
                  <tr className="border-t border-border">
                    <td colSpan={3} className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Total Seats
                    </td>
                    <td className="p-4 text-center font-bold text-navy">
                      {college.courses.reduce((s, c) => s + (c.intake ?? 0), 0) || "—"}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              * Fees are subject to revision by the respective university/regulatory authority. Contact the admissions office for the latest fee structure.
            </p>
          </div>
        ))}
      </section>
    </>
  );
}
