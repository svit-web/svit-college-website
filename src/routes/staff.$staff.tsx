import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Mail, Phone, ExternalLink, Linkedin, BookOpen, Tag } from "lucide-react";
import { getStaffByEmployeeCode } from "@/lib/staff.functions";
import { cn } from "@/lib/utils";

function initials(name: string) {
  const clean = name.replace(/^(dr\.?|mr\.?|mrs\.?|ms\.?)\s+/i, "").trim();
  const parts = clean.split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

const ACHIEVEMENT_LABELS: Record<string, string> = {
  award: "Awards & Honors",
  patent: "Patents",
  publication: "Publications",
  research: "Research Projects",
  qualification: "Qualifications",
  experience: "Experience",
};

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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-crimson">{children}</h2>;
}

function StaffProfilePage() {
  const { profile } = Route.useLoaderData();
  const dept = profile.department;

  // Group achievements by type
  const achievementGroups: Record<string, typeof profile.achievements> = {};
  for (const a of profile.achievements) {
    if (!achievementGroups[a.type]) achievementGroups[a.type] = [];
    achievementGroups[a.type].push(a);
  }

  return (
    <div className="min-h-screen bg-secondary/20">
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-navy-deep via-navy to-navy pb-16 pt-10 text-white">
        <div className="container-page">
          <nav className="mb-8 flex flex-wrap items-center gap-1.5 text-xs text-white/50">
            <Link to="/" className="transition-colors hover:text-white/80">Home</Link>
            {dept && (
              <>
                <span>/</span>
                <Link to="/departments/$dept" params={{ dept: dept.code }} className="transition-colors hover:text-white/80">{dept.name}</Link>
                <span>/</span>
                <Link to="/departments/$dept/staff" params={{ dept: dept.code }} className="transition-colors hover:text-white/80">Staff</Link>
              </>
            )}
            <span>/</span>
            <span className="text-white/80">{profile.name}</span>
          </nav>

          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-10">
            {profile.photoUrl ? (
              <img
                src={profile.photoUrl}
                alt={profile.name}
                className="h-56 w-44 shrink-0 rounded-2xl object-cover object-top shadow-2xl ring-4 ring-white/10"
              />
            ) : (
              <div className="flex h-56 w-44 shrink-0 items-center justify-center rounded-2xl bg-white/10 font-display text-5xl font-bold text-white shadow-2xl ring-4 ring-white/10">
                {initials(profile.name)}
              </div>
            )}

            <div className="pt-1">
              {profile.rankGroup === "HOD" && (
                <div className="mb-3 inline-flex items-center rounded-full bg-gold/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gold">
                  Head of Department
                </div>
              )}
              <h1 className="font-display text-3xl font-bold leading-tight md:text-4xl">{profile.name}</h1>
              {profile.designation && (
                <div className="mt-2 text-lg font-semibold text-gold/90">{profile.designation}</div>
              )}
              {dept && (
                <div className="mt-1.5 text-sm text-white/60">Department of {dept.name}</div>
              )}

              {/* Expertise tags */}
              {profile.expertise.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {profile.expertise.map((tag: string) => (
                    <span key={tag} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                      <Tag className="h-3 w-3 text-gold/70" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {profile.socialLinks && (
                <div className="mt-4 flex gap-3">
                  {profile.socialLinks.linkedin && (
                    <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs text-white/60 transition-colors hover:text-gold">
                      <Linkedin className="h-4 w-4" /> LinkedIn
                    </a>
                  )}
                  {profile.socialLinks.googleScholar && (
                    <a href={profile.socialLinks.googleScholar} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs text-white/60 transition-colors hover:text-gold">
                      <BookOpen className="h-4 w-4" /> Google Scholar
                    </a>
                  )}
                  {profile.socialLinks.orcid && (
                    <a href={profile.socialLinks.orcid} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs text-white/60 transition-colors hover:text-gold">
                      <ExternalLink className="h-4 w-4" /> ORCID
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <section className="container-page py-12">
        <div className="grid gap-10 lg:grid-cols-3">

          {/* Left column */}
          <div className="space-y-8 lg:col-span-1">
            {(profile.email || profile.phone) && (
              <div>
                <SectionLabel>Contact</SectionLabel>
                <div className="space-y-2">
                  {profile.email && (
                    <a href={`mailto:${profile.email}`}
                      className="flex items-center gap-3 rounded-xl border-2 border-navy/10 bg-white p-3.5 text-navy transition-all hover:border-gold hover:shadow-sm">
                      <Mail className="h-4 w-4 shrink-0 text-crimson" />
                      <span className="truncate text-sm font-medium">{profile.email}</span>
                    </a>
                  )}
                  {profile.phone && (
                    <a href={`tel:${profile.phone}`}
                      className="flex items-center gap-3 rounded-xl border-2 border-navy/10 bg-white p-3.5 text-navy transition-all hover:border-gold hover:shadow-sm">
                      <Phone className="h-4 w-4 shrink-0 text-crimson" />
                      <span className="text-sm font-medium">{profile.phone}</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            <div>
              <SectionLabel>Academic Details</SectionLabel>
              <dl className="space-y-3">
                {[
                  { label: "Designation", value: profile.designation },
                  { label: "Department", value: dept?.name },
                  { label: "Employee Code", value: profile.employeeCode },
                  { label: "Joining Year", value: profile.joiningYear ? String(profile.joiningYear) : null },
                  {
                    label: "Total Experience",
                    value: (profile.joiningYear || profile.pastExperienceYears != null)
                      ? `${(profile.pastExperienceYears ?? 0) + (profile.joiningYear ? new Date().getFullYear() - profile.joiningYear : 0)} years`
                      : null,
                  },
                ].filter((d) => d.value).map((d) => (
                  <div key={d.label} className="rounded-xl border-2 border-navy/10 bg-white px-4 py-3">
                    <dt className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{d.label}</dt>
                    <dd className="mt-0.5 text-sm font-semibold text-navy">{d.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {profile.officeHours && profile.officeHours.length > 0 && (
              <div>
                <SectionLabel>Office Hours</SectionLabel>
                <ul className="space-y-2">
                  {profile.officeHours.map((oh: { day: string; time: string }, i: number) => (
                    <li key={i} className="flex items-center justify-between rounded-xl border-2 border-navy/10 bg-white px-4 py-3 text-sm">
                      <span className="font-semibold text-navy">{oh.day}</span>
                      <span className="text-muted-foreground">{oh.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-10 lg:col-span-2">
            {profile.bio && (
              <div>
                <SectionLabel>About</SectionLabel>
                <div className="rounded-2xl border-2 border-navy/10 bg-white p-6">
                  <p className="text-sm leading-relaxed text-ink">{profile.bio}</p>
                </div>
              </div>
            )}

            {/* Achievements grouped by type */}
            {Object.entries(achievementGroups).map(([type, items]) => (
              <div key={type}>
                <SectionLabel>{ACHIEVEMENT_LABELS[type] ?? type}</SectionLabel>
                <div className="space-y-3">
                  {items.map((a) => (
                    <div key={a.id} className="rounded-2xl border-2 border-navy/10 bg-white p-5">
                      <h3 className="font-semibold text-navy text-sm">{a.title}</h3>
                      {(a.year || a.description) && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {a.year && <span className="font-semibold text-ink">{a.year}</span>}
                          {a.year && a.description && " · "}
                          {a.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {profile.achievements.length === 0 && !profile.bio && (
              <p className="text-sm text-muted-foreground italic">No additional details listed yet.</p>
            )}
          </div>
        </div>

        {dept && (
          <div className="mt-12 border-t border-navy/10 pt-8">
            <Link to="/departments/$dept/staff" params={{ dept: dept.code }}
              className="inline-flex items-center gap-2 text-sm font-semibold text-navy/60 transition-colors hover:text-navy">
              <ArrowLeft className="h-4 w-4" /> Back to {dept.name} Staff
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
