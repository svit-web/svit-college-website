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

// Header is h-9 (top bar 36px) + h-20 (nav 80px) = 116px
const HEADER_H = "116px";

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
    <div
      className="flex flex-col bg-white overflow-hidden"
      style={{ height: `calc(100dvh - ${HEADER_H})` }}
    >
      {/* Breadcrumb */}
      <div className="container-page flex items-center gap-1.5 py-2 text-xs text-muted-foreground shrink-0">
        <Link to="/" className="hover:text-navy transition-colors">Home</Link>
        {dept && (
          <>
            <span>/</span>
            <Link to="/departments/$dept" params={{ dept: dept.code }} className="hover:text-navy transition-colors">{dept.name}</Link>
            <span>/</span>
            <Link to="/departments/$dept/staff" params={{ dept: dept.code }} className="hover:text-navy transition-colors">Staff</Link>
          </>
        )}
        <span>/</span>
        <span className="text-navy font-medium truncate">{profile.name}</span>
      </div>

      {/* Main card — fills remaining height */}
      <div className="container-page flex-1 overflow-hidden pb-4">
        <div className="h-full rounded-2xl border border-navy/10 bg-white shadow-sm flex flex-col lg:flex-row overflow-hidden">

          {/* LEFT */}
          <div className="flex-1 overflow-y-auto px-7 py-6 space-y-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

            {/* Photo + identity */}
            <div className="flex gap-6 items-start">
              <div className="shrink-0 flex flex-col gap-3">
                {profile.photoUrl ? (
                  <img
                    src={profile.photoUrl}
                    alt={profile.name}
                    className="h-32 w-24 rounded-xl object-cover object-top shadow-md"
                  />
                ) : (
                  <div className="flex h-32 w-24 items-center justify-center rounded-xl bg-navy/10 font-display text-3xl font-bold text-navy shadow-md">
                    {initials(profile.name)}
                  </div>
                )}
                {profile.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-navy/15 bg-secondary/40 px-2.5 py-1.5 text-[11px] font-semibold text-navy transition-all hover:border-crimson hover:text-crimson w-24"
                  >
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="truncate">{profile.email.split("@")[0]}</span>
                  </a>
                )}
              </div>

              <div className="min-w-0 flex-1 pt-1">
                {profile.rankGroup === "HOD" && (
                  <div className="mb-2 inline-flex items-center rounded-full bg-gold/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-gold-strong">
                    Head of Department
                  </div>
                )}
                <h1 className="font-display text-xl font-bold text-navy leading-tight md:text-2xl">
                  {profile.name}
                </h1>
                {profile.designation && (
                  <div className="mt-0.5 text-sm font-bold text-crimson">{profile.designation}</div>
                )}
                {dept && (
                  <div className="mt-0.5 text-xs font-bold text-navy/60">Department of {dept.name}</div>
                )}
                {totalExp > 0 && (
                  <div className="mt-1.5 text-xs text-muted-foreground">
                    <span className="font-semibold text-navy">{totalExp}</span> years experience
                  </div>
                )}

                {profile.socialLinks && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {profile.socialLinks.linkedin && (
                      <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-navy transition-colors">
                        <Linkedin className="h-3 w-3" /> LinkedIn
                      </a>
                    )}
                    {profile.socialLinks.googleScholar && (
                      <a href={profile.socialLinks.googleScholar} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-navy transition-colors">
                        <BookOpen className="h-3 w-3" /> Scholar
                      </a>
                    )}
                    {profile.socialLinks.orcid && (
                      <a href={profile.socialLinks.orcid} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-navy transition-colors">
                        <ExternalLink className="h-3 w-3" /> ORCID
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div>
                <h2 className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-crimson">About</h2>
                <p className="text-sm leading-relaxed text-ink">{profile.bio}</p>
              </div>
            )}

            {/* Office hours */}
            {profile.officeHours && profile.officeHours.length > 0 && (
              <div>
                <h2 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-crimson">Office Hours</h2>
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

            {/* Back link at bottom of left */}
            {dept && (
              <div className="pt-2">
                <Link to="/departments/$dept/staff" params={{ dept: dept.code }}
                  className="text-xs font-semibold text-navy/40 hover:text-navy transition-colors">
                  ← Back to {dept.name} Staff
                </Link>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px bg-navy/10 my-5 shrink-0" />
          <div className="block lg:hidden h-px bg-navy/10 mx-6 shrink-0" />

          {/* RIGHT */}
          <div className="w-full lg:w-72 xl:w-80 shrink-0 overflow-y-auto px-6 py-6 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

            {profile.expertise.length > 0 && (
              <div>
                <h2 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-crimson">Interests</h2>
                <div className="flex flex-wrap gap-1.5">
                  {profile.expertise.map((tag: string) => (
                    <span key={tag} className="inline-flex items-center gap-1 rounded-full border border-navy/15 bg-secondary/40 px-2.5 py-1 text-[11px] font-medium text-navy">
                      <Tag className="h-2.5 w-2.5 text-gold/70 shrink-0" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {Object.entries(achievementGroups).map(([type, items]) => (
              <div key={type}>
                <h2 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-crimson">
                  {ACHIEVEMENT_LABELS[type] ?? type}
                </h2>
                <div className="space-y-1.5">
                  {items.map((a) => (
                    <div key={a.id} className="rounded-lg border border-navy/10 bg-secondary/30 p-2.5">
                      <p className="text-xs font-semibold text-navy leading-snug">{a.title}</p>
                      {(a.year || a.description) && (
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
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
    </div>
  );
}
