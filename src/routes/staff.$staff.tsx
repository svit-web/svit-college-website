import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Mail, Phone, Building2 } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { getStaffByEmployeeCode } from "@/lib/staff.functions";

export const Route = createFileRoute("/staff/$staff")({
  loader: async ({ params }) => {
    const profile = await getStaffByEmployeeCode({ data: params.staff });
    if (!profile) throw notFound();
    return { profile };
  },
  notFoundComponent: () => (
    <div className="container-page py-32 text-center">
      <h1 className="font-display text-4xl font-bold text-navy">Staff profile not found</h1>
      <p className="mt-3 text-muted-foreground">The staff member you're looking for doesn't exist or is no longer active.</p>
    </div>
  ),
  component: StaffProfilePage,
});

function StaffProfilePage() {
  const { profile } = Route.useLoaderData();
  const dept = profile.department;

  return (
    <>
      <PageHero
        title={profile.name}
        accent={profile.designation || profile.rankGroup}
        crumbs={[
          { label: "Home", to: "/" },
          ...(dept ? [{ label: dept.name, to: `/departments/${dept.code}` }, { label: "Staff", to: `/departments/${dept.code}/staff` }] : []),
          { label: profile.name },
        ]}
      />

      <section className="container-page py-16">
        <div className="max-w-2xl space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: "Employee Code", value: profile.employeeCode || "—" },
              { label: "Designation", value: profile.designation || "—" },
              { label: "Department", value: dept?.name ?? "—" },
              { label: "Qualification", value: profile.qualification ?? "—" },
              { label: "Experience", value: profile.experienceYears ? `${profile.experienceYears}+ years` : "—" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border-2 border-navy/15 bg-white p-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-crimson">{item.label}</div>
                <div className="mt-1 font-display text-base font-bold text-navy">{item.value}</div>
              </div>
            ))}
          </div>

          {(profile.email || profile.phone) && (
            <div className="rounded-xl border-2 border-navy/15 bg-white p-4 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-widest text-crimson">Contact</div>
              {profile.email && (
                <a href={`mailto:${profile.email}`} className="flex items-center gap-2 text-sm text-navy hover:text-gold-strong">
                  <Mail className="h-4 w-4" /> {profile.email}
                </a>
              )}
              {profile.phone && (
                <a href={`tel:${profile.phone}`} className="flex items-center gap-2 text-sm text-navy hover:text-gold-strong">
                  <Phone className="h-4 w-4" /> {profile.phone}
                </a>
              )}
            </div>
          )}

          {dept && (
            <Link
              to="/departments/$dept/staff"
              params={{ dept: dept.code }}
              className="inline-flex items-center gap-2 text-sm font-semibold text-navy hover:text-gold-strong"
            >
              <ArrowLeft className="h-4 w-4" /> Back to {dept.name} Staff
            </Link>
          )}
        </div>
      </section>
    </>
  );
}
