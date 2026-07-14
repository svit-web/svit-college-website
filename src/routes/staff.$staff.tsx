import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { CTABanner } from "@/components/site/CTABanner";
import { getStaffById, initialsOf } from "@/data/staff";
import { departments } from "@/data/academics";
import { collegeMap } from "@/data/colleges";
import { deptSlugOf } from "@/components/site/DepartmentDetailPage";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/staff/$staff")({
  loader: ({ params }) => {
    const member = getStaffById(params.staff);
    if (!member) throw notFound();
    const dept = departments.find((d) => d.id === member.departmentId);
    return { member, dept };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Staff not found" }, { name: "robots", content: "noindex" }] };
    }
    return {
      meta: [
        { title: `${loaderData.member.name} — SVIT Group` },
        {
          name: "description",
          content: `${loaderData.member.name}, ${loaderData.member.designation} at SVIT Group.`,
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="container-page py-32 text-center">
      <h1 className="font-display text-4xl font-bold text-navy">Staff member not found</h1>
    </div>
  ),
  component: StaffProfile,
});

function StaffProfile() {
  const { member, dept } = Route.useLoaderData();
  const college = dept ? collegeMap[dept.collegeId as keyof typeof collegeMap] : null;

  return (
    <>
      <PageHero
        title={member.name}
        accent={member.designation}
        crumbs={[
          { label: "Home", to: "/" },
          ...(dept
            ? [{ label: dept.name, to: "/departments/$dept" as never }]
            : []),
          { label: member.name },
        ]}
      />
      <section className="container-page py-16">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <div className="flex flex-col items-center">
            <div className="flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-navy to-navy-light font-display text-4xl font-bold text-white shadow-md ring-4 ring-white">
              {initialsOf(member.name)}
            </div>
            <div className="mt-4 text-xs font-semibold uppercase tracking-widest text-crimson">
              {member.rankGroup}
            </div>
          </div>

          <div className="rounded-2xl border-2 border-navy/15 bg-white p-8">
            <dl className="grid gap-4 sm:grid-cols-2 text-sm">
              <Field label="Designation" value={member.designation} />
              <Field label="Department" value={dept?.name ?? "—"} />
              <Field label="College" value={college?.name ?? "—"} />
              <Field label="Employee Code" value={member.employeeCode} />
              <Field label="Qualification" value={member.qualification ?? "—"} />
              <Field
                label="Experience"
                value={member.experienceYears != null ? `${member.experienceYears}+ yrs` : "—"}
              />
              <Field label="Gender" value={member.gender || "—"} />
              <Field label="Status" value={member.status} />
            </dl>
            <p className="mt-6 text-sm text-muted-foreground">
              Full profile (publications, courses taught, research interests) will appear here once
              added by the administrator.
            </p>
            {dept && (
              <Link
                to="/departments/$dept"
                params={{ dept: deptSlugOf(dept.id) }}
                className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-navy hover:text-gold"
              >
                <ArrowLeft className="h-4 w-4" /> Back to {dept.name}
              </Link>
            )}
          </div>
        </div>
      </section>
      <CTABanner />
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-widest text-navy/60">{label}</dt>
      <dd className="mt-1 text-ink">{value}</dd>
    </div>
  );
}
