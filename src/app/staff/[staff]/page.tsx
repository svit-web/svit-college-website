import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Mail, ExternalLink, Linkedin, BookOpen, ChevronDown } from "lucide-react";
import { getStaffByEmployeeCode } from "@/lib/staff.functions";

function initials(name: string) {
  const clean = name.replace(/^(dr\.?|mr\.?|mrs\.?|ms\.?)\s+/i, "").trim();
  const parts = clean.split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

const ACHIEVEMENT_LABELS: Record<string, string> = {
  qualification: "Qualifications",
  research: "Research",
  publication: "Publications",
  patent: "Patents",
  award: "Awards & Honors",
  experience: "Experience",
};

// Order the accordion sections appear in, after the bio-driven "Profile" card
const ACHIEVEMENT_ORDER = ["qualification", "research", "publication", "patent", "award", "experience"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ staff: string }>;
}): Promise<Metadata> {
  const { staff } = await params;
  const profile = await getStaffByEmployeeCode(staff).catch(() => null);
  if (!profile) return { title: "Staff profile not found" };
  return { title: `${profile.name} — SVIT Vasad` };
}

export default async function StaffProfilePage({
  params,
}: {
  params: Promise<{ staff: string }>;
}) {
  const { staff: employeeCode } = await params;
  const profile = await getStaffByEmployeeCode(employeeCode).catch(() => null);
  if (!profile) notFound();

  const dept = (profile as any).department;

  const achievementGroups: Record<string, typeof profile.achievements> = {};
  for (const a of profile.achievements) {
    if (!achievementGroups[a.type]) achievementGroups[a.type] = [];
    achievementGroups[a.type].push(a);
  }

  const topQualification = achievementGroups.qualification?.[0];

  const sections: { key: string; title: string; body: ReactNode }[] = [];

  if (profile.bio) {
    sections.push({
      key: "profile",
      title: "Profile",
      body: <p className="text-sm leading-relaxed text-ink">{profile.bio}</p>,
    });
  }

  for (const key of ACHIEVEMENT_ORDER) {
    const items = achievementGroups[key];
    if (!items || items.length === 0) continue;
    sections.push({
      key,
      title: ACHIEVEMENT_LABELS[key] ?? key,
      body: (
        <ul className="space-y-2 pl-4.5 list-disc marker:text-crimson">
          {items.map((a) => (
            <li key={a.id} className="text-sm leading-relaxed text-ink">
              <span className="font-semibold text-navy">{a.title}</span>
              {(a.year || a.description) && (
                <span className="text-muted-foreground">
                  {a.year && ` (${a.year})`}
                  {a.description && ` — ${a.description}`}
                </span>
              )}
            </li>
          ))}
        </ul>
      ),
    });
  }

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <div className="container-page flex items-center gap-1.5 pt-6 pb-2 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-navy transition-colors">Home</Link>
        {dept && (
          <>
            <span>/</span>
            <Link href={`/departments/${dept.code}`} className="hover:text-navy transition-colors">{dept.name}</Link>
            <span>/</span>
            <Link href={`/departments/${dept.code}/staff`} className="hover:text-navy transition-colors">Staff</Link>
          </>
        )}
        <span>/</span>
        <span className="text-navy font-medium truncate">{profile.name}</span>
      </div>

      <div className="container-page pb-16">
        {dept && (
          <div className="mb-8 border-b border-navy/10 pb-4">
            <div className="mb-1 text-xs font-bold uppercase tracking-widest text-crimson">Department</div>
            <h1 className="font-display text-3xl font-bold text-navy md:text-4xl">{dept.name}</h1>
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* LEFT — identity & contact */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            {profile.photoUrl ? (
              <img
                src={profile.photoUrl}
                alt={profile.name}
                className="aspect-3/4 w-full rounded-2xl object-cover object-top shadow-md"
              />
            ) : (
              <div className="flex aspect-3/4 w-full items-center justify-center rounded-2xl bg-navy/10 font-display text-5xl font-bold text-navy shadow-md">
                {initials(profile.name)}
              </div>
            )}

            {profile.rankGroup === "HOD" && (
              <div className="mt-4.5 mb-1 inline-flex items-center rounded-full bg-gold/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-widest text-gold-strong">
                Head of Department
              </div>
            )}
            <h2 className="mt-3.5 font-display text-xl font-bold leading-tight text-navy">{profile.name}</h2>
            {profile.designation && (
              <p className="mt-1 text-sm font-bold text-crimson">{profile.designation}</p>
            )}
            {topQualification && (
              <p className="mt-1 text-sm font-semibold text-ink">{topQualification.title}</p>
            )}

            {profile.email && (
              <div className="mt-4.5 flex flex-col gap-2">
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-center gap-2 text-xs font-semibold text-navy transition-colors hover:text-crimson"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{profile.email}</span>
                </a>
              </div>
            )}

            {profile.socialLinks && (profile.socialLinks.linkedin || profile.socialLinks.googleScholar || profile.socialLinks.orcid) && (
              <div className="mt-4.5 flex flex-wrap gap-4 border-t border-navy/10 pt-4.5">
                {profile.socialLinks.linkedin && (
                  <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-navy">
                    <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                  </a>
                )}
                {profile.socialLinks.googleScholar && (
                  <a href={profile.socialLinks.googleScholar} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-navy">
                    <BookOpen className="h-3.5 w-3.5" /> Scholar
                  </a>
                )}
                {profile.socialLinks.orcid && (
                  <a href={profile.socialLinks.orcid} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-navy">
                    <ExternalLink className="h-3.5 w-3.5" /> ORCID
                  </a>
                )}
              </div>
            )}

            {profile.officeHours && profile.officeHours.length > 0 && (
              <div className="mt-4.5 border-t border-navy/10 pt-4.5">
                <div className="mb-2 text-xs font-bold uppercase tracking-widest text-crimson">Office Hours</div>
                <ul className="flex flex-col gap-1">
                  {profile.officeHours.map((oh: { day: string; time: string }, i: number) => (
                    <li key={i} className="text-xs text-ink">
                      <span className="font-semibold text-navy">{oh.day}:</span> {oh.time}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {dept && (
              <div className="mt-4.5 border-t border-navy/10 pt-4.5">
                <Link href={`/departments/${dept.code}/staff`}
                  className="text-xs font-semibold text-navy/50 transition-colors hover:text-navy">
                  ← Back to {dept.name} Staff
                </Link>
              </div>
            )}
          </aside>

          {/* RIGHT — expertise + accordion */}
          <div className="min-w-0">
            {profile.expertise.length > 0 && (
              <p className="mb-7 text-sm leading-relaxed text-ink">
                <span className="font-bold text-navy">Areas of Expertise: </span>
                {profile.expertise.join(", ")}
              </p>
            )}

            {sections.length > 0 ? (
              <div className="border-y border-navy/10">
                {sections.map((section, i) => (
                  <details key={section.key} open={i === 0} className="group border-b border-navy/10 py-4.5 last:border-b-0">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                      <h3 className="font-display text-lg font-bold text-navy">{section.title}</h3>
                      <ChevronDown className="h-4 w-4 shrink-0 text-crimson transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="pt-3">{section.body}</div>
                  </details>
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-muted-foreground">No additional details listed yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
