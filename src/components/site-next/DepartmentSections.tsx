import Link from "next/link";
import NextImage from "next/image";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";
import type { Department, DeptCourse } from "@/lib/departments.functions";
import type {
  DeptStaffMember,
  DeptAchievement,
  DeptClub,
} from "@/lib/department-content.functions";
import type { Facility } from "@/lib/facilities.functions";
import type { EntryCardData } from "@/lib/entry";
import { achievementCategoryLabel, achievementDetailHref } from "@/lib/achievements.functions";
import { AchievementsGrid } from "./AchievementsGrid";
import { EntryEventsGrid } from "./EntryEventsGrid";
import type { EntryAlbum } from "@/lib/entry";
import { GraduationCap, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  department: Department;
  courses?: DeptCourse[];
  staff?: DeptStaffMember[];
  achievements?: DeptAchievement[];
  clubs?: DeptClub[];
  labs?: Facility[];
  labAlbums?: Map<string, EntryAlbum>;
}

export function initials(name: string): string {
  const clean = name.replace(/^(dr\.?|mr\.?|mrs\.?|ms\.?)\s+/i, "").trim();
  const parts = clean.split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

function AvatarPlaceholder({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const dim =
    size === "lg"
      ? "h-24 w-24 text-2xl"
      : size === "sm"
        ? "h-10 w-10 text-xs"
        : "h-16 w-16 text-lg";
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border border-line bg-paper-deep font-display font-medium text-navy",
        dim,
      )}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}

export function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

const DEGREE_LABEL: Record<string, string> = {
  undergraduate: "UG",
  graduate: "PG",
  certificate: "Diploma",
};

// -------- About + Programs --------
export function DeptAboutView({ department, courses = [] }: Props) {
  const m = department.metadata;
  const aboutText = m.about ?? m.description;
  const vision = m.vision;
  const mission = m.mission;
  const missionLines = Array.isArray(mission) ? mission : mission ? [mission] : [];

  return (
    <div className="space-y-12">
      <section>
        <SectionHeading eyebrow="About Us" title={`About the Department of ${department.name}`} />
        <div className="mt-6 space-y-6">
          <Reveal>
            <p className="text-base leading-relaxed text-ink">
              {aboutText ??
                `The Department of ${department.name} is committed to delivering quality education, cultivating research aptitude and preparing students for meaningful careers in industry and academia.`}
            </p>
          </Reveal>
          {(vision || missionLines.length > 0) && (
            <div className="grid border-t border-l border-line sm:grid-cols-2">
              {vision && (
                <div className="border-r border-b border-line bg-paper-deep p-5 md:p-6">
                  <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-crimson">
                    Vision
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink">{vision}</p>
                </div>
              )}
              {missionLines.length > 0 && (
                <div className="border-r border-b border-line bg-paper-deep p-5 md:p-6">
                  <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-crimson">
                    Mission
                  </div>
                  {missionLines.length === 1 ? (
                    <p className="mt-2 text-sm leading-relaxed text-ink">{missionLines[0]}</p>
                  ) : (
                    <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-ink list-disc list-inside">
                      {missionLines.map((l, i) => (
                        <li key={i}>{l}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
          {(m.intake_ug || m.intake_pg || m.established) && (
            <div className="grid auto-cols-fr grid-flow-col divide-x divide-line border-y border-line">
              {m.intake_ug && (
                <div className="px-3 py-5 text-center">
                  <div className="font-display text-2xl font-medium text-navy md:text-3xl">{m.intake_ug}</div>
                  <div className="mt-1 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-mute">UG Intake</div>
                </div>
              )}
              {m.intake_pg && (
                <div className="px-3 py-5 text-center">
                  <div className="font-display text-2xl font-medium text-navy md:text-3xl">{m.intake_pg}</div>
                  <div className="mt-1 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-mute">PG Intake</div>
                </div>
              )}
              {m.established && (
                <div className="px-3 py-5 text-center">
                  <div className="font-display text-2xl font-medium text-navy md:text-3xl">{m.established}</div>
                  <div className="mt-1 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-mute">Established</div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section>
        <SectionHeading eyebrow="Programs" title="Programs Offered" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((c, i) => (
            <Reveal key={c.id} delay={i * 0.04}>
              <Link
                href={`/programs/${c.id}`}
                className="group flex h-full flex-col border border-line bg-surface p-6 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-navy hover:bg-paper-deep active:border-navy active:bg-paper-deep"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-navy/30 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-navy">
                    {DEGREE_LABEL[c.degree_level] ?? c.degree_level}
                  </span>
                  {c.year_started && (
                    <span className="text-xs font-semibold uppercase tracking-widest text-ink-soft">
                      Since {c.year_started}
                    </span>
                  )}
                </div>
                <h3 className="mt-3 font-display text-lg font-medium leading-snug text-navy">
                  {c.short_name ?? c.name}
                </h3>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <dt className="text-ink-soft">Intake</dt>
                    <dd className="font-semibold text-navy">{c.intake ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-soft">Duration</dt>
                    <dd className="font-semibold text-navy">
                      {c.duration_years ? `${c.duration_years} yrs` : "—"}
                    </dd>
                  </div>
                </dl>
                <div className="mt-auto pt-4 text-xs font-semibold text-navy transition-colors group-hover:text-crimson">
                  View program →
                </div>
              </Link>
            </Reveal>
          ))}
          {courses.length === 0 && (
            <p className="text-sm text-ink-soft col-span-full">
              Program details will be published soon.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

// -------- Staff --------
function StaffCard({ member, featured = false }: { member: DeptStaffMember; featured?: boolean }) {
  const linked = !!member.employeeCode;
  const cardClass = cn(
    "group flex gap-5 border",
    featured
      ? "items-center border-line-strong bg-paper-deep p-6"
      : "items-start border-line bg-surface p-4",
    linked &&
      "transition-colors duration-300 hover:border-navy hover:bg-paper-deep active:border-navy active:bg-paper-deep",
  );

  const inner = (
    <>
      {/* Photo */}
      <div className="shrink-0">
        {member.avatarUrl ? (
          <div
            className={cn("relative border border-line", featured ? "h-36 w-28" : "h-28 w-22")}
          >
            <NextImage
              src={member.avatarUrl}
              alt={member.name}
              fill
              sizes="150px"
              className="object-cover object-top"
            />
          </div>
        ) : (
          <div
            className={cn(
              "flex items-center justify-center border border-line bg-paper-deep font-display font-medium text-navy",
              featured ? "h-36 w-28 text-3xl" : "h-28 w-22 text-2xl",
            )}
          >
            {initials(member.name)}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="min-w-0 flex-1 py-1">
        {featured && (
          <div className="mb-2 inline-flex items-center rounded-full border border-crimson/30 px-3 py-0.5 text-[11px] font-bold uppercase tracking-[0.16em] text-crimson">
            Head of Department
          </div>
        )}
        <h3
          className={cn(
            "font-display font-medium leading-tight text-navy",
            featured ? "text-xl" : "text-base",
          )}
        >
          {member.name}
        </h3>
        <div className="mt-1 text-sm font-semibold text-crimson">{member.designation}</div>
        {(member.industryYears || member.teachingYears) && (
          <div className="mt-2 flex flex-wrap gap-x-3 text-xs text-ink-soft">
            {!!member.industryYears && (
              <span>
                <span className="font-semibold text-navy">{member.industryYears}</span> yrs industry
              </span>
            )}
            {!!member.teachingYears && (
              <span>
                <span className="font-semibold text-navy">{member.teachingYears}</span> yrs teaching
              </span>
            )}
          </div>
        )}
        {member.email && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-ink-soft">
            <Mail className="h-3.5 w-3.5 shrink-0 text-ink-mute" />
            <span className="truncate">{member.email}</span>
          </div>
        )}
        {member.employeeCode && (
          <div className="mt-3 text-xs font-semibold text-navy transition-colors group-hover:text-crimson">
            View full profile →
          </div>
        )}
      </div>
    </>
  );

  if (member.employeeCode) {
    return (
      <Link href={`/staff/${member.employeeCode}`} className={cardClass}>
        {inner}
      </Link>
    );
  }
  return <div className={cardClass}>{inner}</div>;
}

export function DeptStaffView({ staff = [] }: Props) {
  const hod = staff.find((s) => s.rankGroup === "HOD");
  const faculty = staff.filter((s) => s.rankGroup === "Faculty");
  const support = staff.filter((s) => s.rankGroup === "Support");

  return (
    <div>
      <SectionHeading
        eyebrow="Staff"
        title="Meet the Team"
        subtitle="Faculty and support staff who lead teaching, research and lab operations. Data sourced from the official employee register."
      />

      {hod && (
        <div className="mt-8 max-w-xl">
          <StaffCard member={hod} featured />
        </div>
      )}

      {faculty.length > 0 && (
        <div className="mt-10">
          <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-crimson">
            Faculty ({faculty.length})
          </h3>
          {/* minmax(0,1fr): truncated emails must not widen the track past the screen. */}
          <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2">
            {faculty.map((m, i) => (
              <Reveal key={m.id} delay={i * 0.03}>
                <StaffCard member={m} />
              </Reveal>
            ))}
          </div>
        </div>
      )}

      {support.length > 0 && (
        <div className="mt-12">
          <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-ink-mute">
            Support Staff ({support.length})
          </h3>
          <ul className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {support.map((m) => (
              <li
                key={m.id}
                className="flex items-center gap-3 border border-line bg-surface p-3"
              >
                <AvatarPlaceholder name={m.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-navy">{m.name}</div>
                  <div className="truncate text-xs text-ink-soft">{m.designation}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {staff.length === 0 && (
        <p className="mt-10 text-center text-ink-soft">
          Staff information will be published soon.
        </p>
      )}
    </div>
  );
}

// -------- Achievements & Clubs --------
function toAchievementCard(a: DeptAchievement): EntryCardData {
  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    subtitle: `${achievementCategoryLabel(a.category)} · ${formatDate(a.date)}`,
    description: a.description,
    cardPhotoUrl: a.cardPhotoUrl,
    hasDetailPage: a.hasDetailPage,
    detailHref: a.hasDetailPage ? achievementDetailHref(a.slug) : null,
    album: a.album,
  };
}

export function DeptAchievementsView({ achievements = [], clubs = [] }: Props) {
  const sorted = [...achievements].sort((a, b) => (a.date < b.date ? 1 : -1));
  return (
    <div>
      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-crimson">
            Achievements
          </h3>
          {sorted.length === 0 ? (
            <p className="text-sm text-ink-soft">No achievements published yet.</p>
          ) : (
            <AchievementsGrid entries={sorted.map(toAchievementCard)} />
          )}
        </div>

        <div>
          <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-crimson">
            Clubs
          </h3>
          {clubs.length === 0 ? (
            <p className="text-sm text-ink-soft">No clubs listed yet.</p>
          ) : (
            <ul className="space-y-3">
              {clubs.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/campus-life/clubs/${c.slug}`}
                    className="group block border border-line bg-surface p-4 transition-colors duration-300 hover:border-navy hover:bg-paper-deep active:border-navy active:bg-paper-deep"
                  >
                    <div className="flex items-center gap-3">
                      {c.logoUrl ? (
                        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden border border-line bg-surface p-1">
                          <NextImage
                            src={c.logoUrl}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-line bg-paper-deep text-navy">
                          <GraduationCap className="h-5 w-5" />
                        </div>
                      )}
                      <div className="font-display font-medium text-navy">{c.name}</div>
                    </div>
                    {c.description && (
                      <p className="mt-2 text-xs text-ink-soft leading-relaxed">
                        {c.description}
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// -------- Labs & Facilities --------
function toLabCard(lab: Facility, deptCode: string, album: EntryAlbum | null): EntryCardData {
  return {
    id: lab.id,
    slug: lab.slug,
    title: lab.name,
    subtitle: lab.accent_color,
    description: lab.description,
    cardPhotoUrl: lab.card_photo_url,
    hasDetailPage: lab.has_detail_page,
    detailHref: lab.has_detail_page ? `/departments/${deptCode}/labs/${lab.slug}` : null,
    album,
  };
}

export function DeptLabsView({ department, labs = [], labAlbums }: Props) {
  if (labs.length === 0) {
    return (
      <div>
        <SectionHeading eyebrow="Labs & Facilities" title="Our Laboratories" />
        <p className="mt-10 text-center text-ink-soft">
          Lab information will be published soon.
        </p>
      </div>
    );
  }

  const entries = labs.map((lab) =>
    toLabCard(lab, department.code, lab.album_id ? (labAlbums?.get(lab.album_id) ?? null) : null),
  );

  return (
    <div>
      <SectionHeading eyebrow="Labs & Facilities" title="Our Laboratories" />
      <EntryEventsGrid entries={entries} />
    </div>
  );
}
