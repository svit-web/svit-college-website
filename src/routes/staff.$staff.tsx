import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Mail, Phone, GraduationCap, Clock, Hash, ExternalLink, Linkedin, BookOpen, FlaskConical, Calendar } from "lucide-react";
import { getStaffByEmployeeCode } from "@/lib/staff.functions";
import { cn } from "@/lib/utils";

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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-crimson">{children}</h2>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="text-sm text-muted-foreground italic">{text}</p>;
}

function StaffProfilePage() {
  const { profile } = Route.useLoaderData();
  const dept = profile.department;

  return (
    <div className="min-h-screen bg-secondary/20">
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-navy-deep via-navy to-navy pb-16 pt-10 text-white">
        <div className="container-page">
          {/* Breadcrumb */}
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

          {/* Photo + identity */}
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

              {/* Quick chips */}
              <div className="mt-5 flex flex-wrap gap-3">
                {profile.joiningYear && (
                  <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                    <Calendar className="h-3.5 w-3.5 text-gold/70" />
                    Working since {profile.joiningYear}
                  </div>
                )}
                {profile.experienceYears && (
                  <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                    <Clock className="h-3.5 w-3.5 text-gold/70" />
                    {profile.experienceYears}+ yrs experience
                  </div>
                )}
                {profile.qualification && (
                  <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                    <GraduationCap className="h-3.5 w-3.5 text-gold/70" />
                    {profile.qualification}
                  </div>
                )}
              </div>

              {/* Social links */}
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

          {/* Left column — contact + meta */}
          <div className="space-y-8 lg:col-span-1">

            {/* Contact */}
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

            {/* Academic details */}
            <div>
              <SectionLabel>Academic Details</SectionLabel>
              <dl className="space-y-3">
                {[
                  { label: "Designation", value: profile.designation },
                  { label: "Qualification", value: profile.qualification },
                  { label: "Experience", value: profile.experienceYears ? `${profile.experienceYears}+ years` : null },
                  { label: "Working since", value: profile.joiningYear ? String(profile.joiningYear) : null },
                  { label: "Department", value: dept?.name },
                  { label: "Employee Code", value: profile.employeeCode },
                ].filter(d => d.value).map(d => (
                  <div key={d.label} className="rounded-xl border-2 border-navy/10 bg-white px-4 py-3">
                    <dt className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{d.label}</dt>
                    <dd className="mt-0.5 text-sm font-semibold text-navy">{d.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Research interests */}
            <div>
              <SectionLabel>Research Interests</SectionLabel>
              {profile.researchInterests.length === 0 ? (
                <EmptyState text="No research interests listed yet." />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.researchInterests.map(r => (
                    <span key={r.id}
                      className="rounded-full border border-navy/15 bg-white px-3 py-1 text-xs font-semibold text-navy">
                      {r.interestName}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Office hours */}
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

          {/* Right column — bio, publications, projects */}
          <div className="space-y-10 lg:col-span-2">

            {/* Bio */}
            {profile.bio && (
              <div>
                <SectionLabel>About</SectionLabel>
                <div className="rounded-2xl border-2 border-navy/10 bg-white p-6">
                  <p className="text-sm leading-relaxed text-ink">{profile.bio}</p>
                </div>
              </div>
            )}

            {/* Research projects */}
            <div>
              <SectionLabel>Research Projects</SectionLabel>
              {profile.researchProjects.length === 0 ? (
                <EmptyState text="No research projects recorded yet." />
              ) : (
                <div className="space-y-4">
                  {profile.researchProjects.map(p => (
                    <div key={p.id} className="rounded-2xl border-2 border-navy/10 bg-white p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-display text-base font-bold text-navy">{p.title}</h3>
                        {p.projectStatus && (
                          <span className={cn(
                            "shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest",
                            p.projectStatus === "ongoing" ? "bg-green-100 text-green-700" : "bg-secondary text-muted-foreground"
                          )}>
                            {p.projectStatus}
                          </span>
                        )}
                      </div>
                      <dl className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                        {p.fundingAgency && <div><span className="font-semibold text-ink">Funded by:</span> {p.fundingAgency}</div>}
                        {p.amount && <div><span className="font-semibold text-ink">Amount:</span> ₹{p.amount.toLocaleString()}</div>}
                        {p.durationYears && <div><span className="font-semibold text-ink">Duration:</span> {p.durationYears} yr{p.durationYears > 1 ? "s" : ""}</div>}
                      </dl>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Publications */}
            <div>
              <SectionLabel>Publications</SectionLabel>
              {profile.publications.length === 0 ? (
                <EmptyState text="No publications recorded yet." />
              ) : (
                <ol className="space-y-4 list-none">
                  {profile.publications.map((pub, i) => (
                    <li key={pub.id} className="flex gap-4 rounded-2xl border-2 border-navy/10 bg-white p-5">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy text-[10px] font-bold text-white">
                        {i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-sm font-bold text-navy leading-snug">{pub.title}</h3>
                        {pub.journalConference && (
                          <div className="mt-1 text-xs font-semibold italic text-crimson">{pub.journalConference}</div>
                        )}
                        {pub.publishDate && (
                          <div className="mt-1 text-xs text-muted-foreground">{new Date(pub.publishDate).getFullYear()}</div>
                        )}
                        {pub.abstract && (
                          <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-3">{pub.abstract}</p>
                        )}
                        {pub.doiUrl && (
                          <a href={pub.doiUrl} target="_blank" rel="noreferrer"
                            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-navy hover:text-gold-strong">
                            <ExternalLink className="h-3 w-3" /> DOI
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>

        {/* Back link */}
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
