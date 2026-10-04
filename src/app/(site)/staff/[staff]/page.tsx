import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Mail, ExternalLink, Linkedin, BookOpen, ChevronDown, ChevronRight } from "lucide-react";
import { getStaffByEmployeeCode } from "@/lib/staff.functions";
import { metaDescription } from "@/lib/seo";

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
  activity: "Activities",
};

// Order the accordion sections appear in, after the bio-driven "Profile" card
const ACHIEVEMENT_ORDER = [
  "qualification",
  "research",
  "publication",
  "patent",
  "award",
  "experience",
  "activity",
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ staff: string }>;
}): Promise<Metadata> {
  const { staff } = await params;
  const profile = await getStaffByEmployeeCode(staff).catch(() => null);
  if (!profile) return { title: "Staff profile not found", robots: { index: false } };
  const role = [profile.designation, profile.department?.name].filter(Boolean).join(", ");
  return {
    title: `${profile.name} — SVIT Vasad`,
    description:
      metaDescription(profile.bio) ?? `${profile.name}${role ? `, ${role}` : ""} at SVIT Vasad.`,
    alternates: { canonical: `/staff/${encodeURIComponent(profile.employeeCode)}` },
  };
}

export default async function StaffProfilePage({ params }: { params: Promise<{ staff: string }> }) {
  const { staff: employeeCode } = await params;
  const profile = await getStaffByEmployeeCode(employeeCode).catch(() => null);
  if (!profile) notFound();

  const dept = profile.department;

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
                <span className="text-ink-soft">
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
    <div className="bg-paper">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="container-page hidden flex-wrap items-center gap-1.5 pb-6 pt-[clamp(112px,16vh,180px)] md:flex text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-ink-mute"
      >
        <Link href="/" className="-my-1.5 inline-block py-1.5 transition-colors hover:text-crimson">
          Home
        </Link>
        {dept && (
          <>
            <ChevronRight aria-hidden className="h-3 w-3" />
            <Link
              href={`/departments/${dept.code}`}
              className="-my-1.5 inline-block py-1.5 transition-colors hover:text-crimson"
            >
              {dept.name}
            </Link>
            <ChevronRight aria-hidden className="h-3 w-3" />
            <Link
              href={`/departments/${dept.code}/staff`}
              className="-my-1.5 inline-block py-1.5 transition-colors hover:text-crimson"
            >
              Staff
            </Link>
          </>
        )}
        <ChevronRight aria-hidden className="h-3 w-3" />
        <span aria-current="page" className="truncate text-ink-soft">
          {profile.name}
        </span>
      </nav>

      {/* Phones: breadcrumbs hidden (the back link covers it), so clear the fixed header here. */}
      <div className="container-page pb-16 pt-20 md:pt-0">
        {dept && (
          <Link
            href={`/departments/${dept.code}/staff`}
            className="mb-4 inline-block py-1.5 text-xs font-semibold text-navy transition-colors hover:text-crimson"
          >
            ← Back to {dept.name} Staff
          </Link>
        )}
        {dept && (
          <div className="mb-5 border-b border-line pb-4 md:mb-8">
            <div className="mb-1 text-xs font-bold uppercase tracking-widest text-crimson">
              Department
            </div>
            <h1 className="font-display text-3xl font-medium text-navy md:text-4xl">{dept.name}</h1>
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* LEFT — identity & contact */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            {profile.photoUrl ? (
              <div className="relative aspect-3/4 w-full overflow-hidden">
                <Image
                  src={profile.photoUrl}
                  alt={profile.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 280px"
                  priority
                  className="object-cover object-top"
                />
              </div>
            ) : (
              <div className="flex h-40 w-full items-center justify-center border border-line bg-paper-deep font-display text-4xl font-medium text-navy md:aspect-3/4 md:h-auto md:text-5xl">
                {initials(profile.name)}
              </div>
            )}

            {profile.rankGroup === "HOD" && (
              <div className="mt-4.5 mb-1 inline-flex items-center rounded-full border border-crimson/30 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.16em] text-crimson">
                Head of Department
              </div>
            )}
            <h2 className="mt-3.5 font-display text-xl font-medium leading-tight text-navy">
              {profile.name}
            </h2>
            {profile.designation && (
              <p className="mt-1 text-sm font-bold text-crimson">{profile.designation}</p>
            )}
            {dept && <p className="mt-1 text-sm text-ink-soft">{dept.name}</p>}
            {profile.qualification && (
              <p className="mt-1 text-sm font-semibold text-ink">{profile.qualification}</p>
            )}
            {topQualification && (
              <p className="mt-1 text-sm font-semibold text-ink">{topQualification.title}</p>
            )}

            {profile.email && (
              <div className="mt-4.5 flex flex-col gap-2">
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-start gap-2 py-1 text-xs font-semibold text-navy transition-colors hover:text-crimson"
                >
                  <Mail className="mt-px h-3.5 w-3.5 shrink-0" />
                  <span className="min-w-0 [overflow-wrap:anywhere]">{profile.email}</span>
                </a>
              </div>
            )}

            {profile.socialLinks &&
              (profile.socialLinks.linkedin ||
                profile.socialLinks.googleScholar ||
                profile.socialLinks.orcid) && (
                <div className="mt-4.5 flex flex-wrap gap-4 border-t border-line pt-4.5">
                  {profile.socialLinks.linkedin && (
                    <a
                      href={profile.socialLinks.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs font-semibold text-ink-soft transition-colors hover:text-navy"
                    >
                      <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                    </a>
                  )}
                  {profile.socialLinks.googleScholar && (
                    <a
                      href={profile.socialLinks.googleScholar}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs font-semibold text-ink-soft transition-colors hover:text-navy"
                    >
                      <BookOpen className="h-3.5 w-3.5" /> Scholar
                    </a>
                  )}
                  {profile.socialLinks.orcid && (
                    <a
                      href={profile.socialLinks.orcid}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs font-semibold text-ink-soft transition-colors hover:text-navy"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> ORCID
                    </a>
                  )}
                </div>
              )}

            {profile.officeHours && profile.officeHours.length > 0 && (
              <div className="mt-4.5 border-t border-line pt-4.5">
                <div className="mb-2 text-xs font-bold uppercase tracking-widest text-crimson">
                  Office Hours
                </div>
                <ul className="flex flex-col gap-1">
                  {profile.officeHours.map((oh: { day: string; time: string }, i: number) => (
                    <li key={i} className="text-xs text-ink">
                      <span className="font-semibold text-navy">{oh.day}:</span> {oh.time}
                    </li>
                  ))}
                </ul>
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
              <div className="border-y border-line">
                {sections.map((section, i) => (
                  <details
                    key={section.key}
                    open={i === 0}
                    className="group border-b border-line py-4.5 last:border-b-0"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                      <h3 className="font-display text-lg font-medium text-navy">
                        {section.title}
                      </h3>
                      <ChevronDown className="h-4 w-4 shrink-0 text-crimson transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="pt-3">{section.body}</div>
                  </details>
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-ink-soft">No additional details listed yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
