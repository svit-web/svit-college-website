import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Mail, Phone, GraduationCap, Clock, Hash } from "lucide-react";
import { getStaffByEmployeeCode } from "@/lib/staff.functions";

function initials(name: string) {
  const clean = name.replace(/^(dr\.?|mr\.?|mrs\.?|ms\.?)\s+/i, "").trim();
  const parts = clean.split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

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
    <div className="min-h-screen">
      {/* Hero — navy background, photo left, details right */}
      <section className="bg-gradient-to-br from-navy-deep via-navy to-navy pb-16 pt-10 text-white">
        <div className="container-page">
          {/* Breadcrumb */}
          <nav className="mb-8 flex flex-wrap items-center gap-1.5 text-xs text-white/50">
            <Link to="/" className="hover:text-white/80 transition-colors">Home</Link>
            {dept && (
              <>
                <span>/</span>
                <Link to="/departments/$dept" params={{ dept: dept.code }} className="hover:text-white/80 transition-colors">{dept.name}</Link>
                <span>/</span>
                <Link to="/departments/$dept/staff" params={{ dept: dept.code }} className="hover:text-white/80 transition-colors">Staff</Link>
              </>
            )}
            <span>/</span>
            <span className="text-white/80">{profile.name}</span>
          </nav>

          {/* Photo + identity */}
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-10">
            {/* Photo */}
            {profile.photoUrl ? (
              <img
                src={profile.photoUrl}
                alt={profile.name}
                className="h-52 w-40 shrink-0 rounded-2xl object-cover object-top shadow-2xl ring-4 ring-white/10"
              />
            ) : (
              <div className="flex h-52 w-40 shrink-0 items-center justify-center rounded-2xl bg-white/10 font-display text-5xl font-bold text-white shadow-2xl ring-4 ring-white/10">
                {initials(profile.name)}
              </div>
            )}

            {/* Name + role */}
            <div className="pt-1">
              {profile.rankGroup === "HOD" && (
                <div className="mb-3 inline-flex items-center rounded-full bg-gold/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gold">
                  Head of Department
                </div>
              )}
              <h1 className="font-display text-3xl font-bold leading-tight md:text-4xl">
                {profile.name}
              </h1>
              {profile.designation && (
                <div className="mt-2 text-lg font-semibold text-gold/90">{profile.designation}</div>
              )}
              {dept && (
                <div className="mt-2 text-sm text-white/60">Department of {dept.name}</div>
              )}

              {/* Quick stats inline */}
              <div className="mt-6 flex flex-wrap gap-4">
                {profile.experienceYears && (
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <Clock className="h-4 w-4 shrink-0 text-gold/60" />
                    {profile.experienceYears}+ years experience
                  </div>
                )}
                {profile.qualification && (
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <GraduationCap className="h-4 w-4 shrink-0 text-gold/60" />
                    {profile.qualification}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Details section */}
      <section className="container-page py-12">
        <div className="max-w-2xl space-y-6">

          {/* Contact */}
          {(profile.email || profile.phone) && (
            <div>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-crimson">Contact</h2>
              <div className="space-y-3">
                {profile.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className="flex items-center gap-4 rounded-xl border-2 border-navy/10 bg-white p-4 text-navy transition-all hover:border-gold hover:shadow-md"
                  >
                    <Mail className="h-5 w-5 shrink-0 text-crimson" />
                    <span className="text-sm font-semibold">{profile.email}</span>
                  </a>
                )}
                {profile.phone && (
                  <a
                    href={`tel:${profile.phone}`}
                    className="flex items-center gap-4 rounded-xl border-2 border-navy/10 bg-white p-4 text-navy transition-all hover:border-gold hover:shadow-md"
                  >
                    <Phone className="h-5 w-5 shrink-0 text-crimson" />
                    <span className="text-sm font-semibold">{profile.phone}</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Employee code */}
          {profile.employeeCode && (
            <div className="flex items-center gap-3 rounded-xl border-2 border-navy/10 bg-white p-4">
              <Hash className="h-5 w-5 shrink-0 text-navy/30" />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Employee Code</div>
                <div className="mt-0.5 font-display text-sm font-bold text-navy">{profile.employeeCode}</div>
              </div>
            </div>
          )}

          {/* Back link */}
          {dept && (
            <div className="pt-2">
              <Link
                to="/departments/$dept/staff"
                params={{ dept: dept.code }}
                className="inline-flex items-center gap-2 text-sm font-semibold text-navy/60 hover:text-navy transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back to {dept.name} Staff
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
