import { createFileRoute, notFound } from "@tanstack/react-router";

export const Route = createFileRoute("/staff/$staff")({
  loader: () => { throw notFound(); },
  notFoundComponent: () => (
    <div className="container-page py-32 text-center">
      <h1 className="font-display text-4xl font-bold text-navy">Staff profile not found</h1>
    </div>
  ),
  component: () => null,
});

function initials(name: string) {
  const clean = name.replace(/^(dr\.?|mr\.?|mrs\.?|ms\.?)\s+/i, "").trim();
  const parts = clean.split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

function StaffProfile() {
  const { member, department } = Route.useLoaderData();
  const college = department ? collegeMap[department.collegeId as keyof typeof collegeMap] : null;
  return (
    <>
      <PageHero
        title={member.name}
        accent={member.designation}
        crumbs={[
          { label: "Home", to: "/" },
          ...(department ? [{ label: department.name, to: "/departments/$dept" }] : []),
          { label: member.name },
        ]}
      />
      <section className="container-page py-20">
        <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-navy via-navy-light to-crimson font-display text-4xl font-bold text-white ring-4 ring-white shadow-md">
              {initials(member.name)}
            </div>
            <div className="rounded-full border border-navy/15 bg-secondary/40 px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-navy">
              {member.rankGroup}
            </div>
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold text-navy">{member.name}</h2>
            <div className="mt-1 text-sm font-semibold text-crimson">{member.designation}</div>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border-2 border-navy/15 bg-white p-4">
                <dt className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Employee Code</dt>
                <dd className="mt-1 font-semibold text-navy">{member.employeeCode}</dd>
              </div>
              <div className="rounded-xl border-2 border-navy/15 bg-white p-4">
                <dt className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Qualification</dt>
                <dd className="mt-1 font-semibold text-navy">{member.qualification ?? "—"}</dd>
              </div>
              <div className="rounded-xl border-2 border-navy/15 bg-white p-4">
                <dt className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Experience</dt>
                <dd className="mt-1 font-semibold text-navy">{member.experienceYears ? `${member.experienceYears}+ years` : "—"}</dd>
              </div>
              <div className="rounded-xl border-2 border-navy/15 bg-white p-4">
                <dt className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Department</dt>
                <dd className="mt-1 font-semibold text-navy">{department?.name ?? "—"}</dd>
              </div>
              {college && (
                <div className="rounded-xl border-2 border-navy/15 bg-white p-4 sm:col-span-2">
                  <dt className="text-xs font-bold uppercase tracking-widest text-muted-foreground">College</dt>
                  <dd className="mt-1 font-semibold text-navy">{college.name}</dd>
                </div>
              )}
            </dl>
            <p className="mt-6 text-sm text-muted-foreground">
              A detailed profile — biography, publications, subjects taught and contact information — will be published
              here soon.
            </p>
            {department && (
              <Link
                to="/departments/$dept"
                params={{ dept: department.id }}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-navy hover:text-gold-strong"
              >
                <ArrowLeft className="h-4 w-4" /> Back to {department.name}
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
