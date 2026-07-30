import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Mail, ExternalLink, Linkedin, BookOpen, Tag } from "lucide-react";
import { getStaffByEmployeeCode } from "@/lib/staff.functions";

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

function StaffProfilePage() {
  const { profile } = Route.useLoaderData();
  const dept = profile.department;

  const achievementGroups: Record<string, typeof profile.achievements> = {};
  for (const a of profile.achievements) {
    if (!achievementGroups[a.type]) achievementGroups[a.type] = [];
    achievementGroups[a.type].push(a);
  }

  const totalExp =
    (profile.pastExperienceYears ?? 0) +
    (profile.joiningYear ? new Date().getFullYear() - profile.joiningYear : 0);

  return (
    <div className="min-h-screen bg-white">
      <div className="container-page py-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-navy">Home</Link>
          {dept && (
            <>
              <span>/</span>
              <Link to="/departments/$dept" params={{ dept: dept.code }} className="transition-colors hover:text-navy">{dept.name}</Link>
              <span>/</span>
              <Link to="/departments/$dept/staff" params={{ dept: dept.code }} className="transition-colors hover:text-navy">Staff</Link>
            </>
          )}
          <span>/</span>
          <span className="text-navy font-medium">{profile.name}</span>
        </nav>

        {/* Profile card */}
        <div className="rounded-2xl border border-navy/10 bg-white shadow-sm overflow-hidden">
          <div className="flex flex-col lg:flex-row min-h-[420px]">

            {/* LEFT — photo + info + bio */}
            <div className="flex-1 p-8 lg:p-10">
              <div className="flex flex-col sm:flex-row gap-7">
                {/* Photo */}
                <div className="shrink-0 flex flex-col items-start gap-4">
                  {profile.photoUrl ? (
                    <img
                      src={profile.photoUrl}
                      alt={profile.name}
                      className="h-40 w-32 rounded-2xl object-cover object-top shadow-md"
                    />
                  ) : (
                    <div className="flex h-40 w-32 shrink-0 items-center justify-center rounded-2xl bg-navy/10 font-display text-4xl font-bold text-navy shadow-md">
                      {initials(profile.name)}
                    </div>
                  )}
                  {profile.email && (
                    <a
                      href={`mailto:${profile.email}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border-2 border-navy/15 bg-secondary/40 px-3 py-1.5 text-xs font-semibold text-navy transition-all hover:border-crimson hover:text-crimson"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {profile.email}
                    </a>
                  )}
                </div>

                {/* Name + position + bio */}
                <div className="flex-1 min-w-0">
                  {profile.rankGroup === "HOD" && (
                    <div className="mb-3 inline-flex items-center rounded-full bg-gold/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-gold-strong">
                      Head of Department
                    </div>
                  )}
                  <h1 className="font-display text-2xl font-bold text-navy leading-tight md:text-3xl">
                    {profile.name}
                  </h1>
                  {profile.designation && (
                    <div className="mt-1 text-base font-bold text-crimson">{profile.designation}</div>
                  )}
                  {dept && (
                    <div className="mt-0.5 text-sm font-bold text-navy/70">Department of {dept.name}</div>
                  )}
                  {totalExp > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <span className="font-semibold text-navy">{totalExp}</span> years experience
                    </div>
                  )}

                  {/* Social links */}
                  {profile.socialLinks && (
                    <div className="mt-4 flex flex-wrap gap-3">
                      {profile.socialLinks.linkedin && (
                        <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-navy">
                          <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                        </a>
                      )}
                      {profile.socialLinks.googleScholar && (
                        <a href={profile.socialLinks.googleScholar} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-navy">
                          <BookOpen className="h-3.5 w-3.5" /> Google Scholar
                        </a>
                      )}
                      {profile.socialLinks.orcid && (
                        <a href={profile.socialLinks.orcid} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-navy">
                          <ExternalLink className="h-3.5 w-3.5" /> ORCID
                        </a>
                      )}
                    </div>
                  )}

                  {profile.bio && (
                    <p className="mt-5 text-sm leading-relaxed text-ink">
                      {profile.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Office hours (if any) */}
              {profile.officeHours && profile.officeHours.length > 0 && (
                <div className="mt-8 pt-6 border-t border-navy/10">
                  <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-crimson">Office Hours</h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.officeHours.map((oh: { day: string; time: string }, i: number) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg border border-navy/10 bg-secondary/30 px-3 py-1.5 text-xs">
                        <span className="font-semibold text-navy">{oh.day}</span>
                        <span className="text-muted-foreground">{oh.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Vertical divider */}
            <div className="hidden lg:block w-px bg-navy/10 self-stretch my-6" />
            <div className="block lg:hidden h-px bg-navy/10 mx-8" />

            {/* RIGHT — interests + achievements */}
            <div className="w-full lg:w-80 xl:w-96 shrink-0 p-8 lg:p-10 space-y-8">

              {/* Interests */}
              {profile.expertise.length > 0 && (
                <div>
                  <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-crimson">Interests</h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.expertise.map((tag: string) => (
                      <span key={tag} className="inline-flex items-center gap-1.5 rounded-full border border-navy/15 bg-secondary/40 px-3 py-1 text-xs font-medium text-navy">
                        <Tag className="h-3 w-3 text-gold/70 shrink-0" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Achievements */}
              {Object.entries(achievementGroups).map(([type, items]) => (
                <div key={type}>
                  <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-crimson">
                    {ACHIEVEMENT_LABELS[type] ?? type}
                  </h2>
                  <div className="space-y-2">
                    {items.map((a) => (
                      <div key={a.id} className="rounded-xl border border-navy/10 bg-secondary/30 p-3">
                        <p className="text-sm font-semibold text-navy leading-snug">{a.title}</p>
                        {(a.year || a.description) && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
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

              {profile.expertise.length === 0 && profile.achievements.length === 0 && (
                <p className="text-xs text-muted-foreground italic">No additional details listed yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Back link */}
        {dept && (
          <div className="mt-8">
            <Link to="/departments/$dept/staff" params={{ dept: dept.code }}
              className="text-sm font-semibold text-navy/50 transition-colors hover:text-navy">
              ← Back to {dept.name} Staff
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
