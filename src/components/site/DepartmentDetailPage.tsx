import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  GraduationCap,
  Award,
  Building2,
  Info,
  FileText,
  Mail,
  ChevronRight,
} from "lucide-react";
import { PageHero } from "./PageHero";
import { CTABanner } from "./CTABanner";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { cn } from "@/lib/utils";
import {
  departments,
  degreeTypes,
  getProgramsForDepartment,
  type Department,
} from "@/data/academics";
import { collegeMap } from "@/data/colleges";
import {
  getStaffForDepartment,
  initialsOf,
  type StaffMember,
} from "@/data/staff";
import {
  getDepartmentContent,
  type ActivityItem,
  type ActivityType,
} from "@/data/departmentContent";

// -----------------------------------------------------------------------------
// Slug ↔ department id helpers. Slug = department.id without the `dept-` prefix.
// -----------------------------------------------------------------------------
export const deptSlugOf = (id: string) => id.replace(/^dept-/, "");
export const departmentBySlug = (slug: string): Department | undefined =>
  departments.find((d) => deptSlugOf(d.id) === slug);

// -----------------------------------------------------------------------------
// In-page nav
// -----------------------------------------------------------------------------
const SECTIONS = [
  { id: "about", label: "About Us", icon: Info },
  { id: "programs", label: "Programs", icon: GraduationCap },
  { id: "staff", label: "Staff", icon: Users },
  { id: "achievements", label: "Achievements & Clubs", icon: Award },
  { id: "activities", label: "Industry Interaction & Activities", icon: Building2 },
] as const;

function StickySubNav() {
  const [active, setActive] = useState<string>("about");
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <div className="sticky top-16 z-30 -mx-4 border-b border-navy/10 bg-white/90 backdrop-blur md:mx-0">
      <div className="container-page">
        <nav className="flex gap-1 overflow-x-auto py-2 md:gap-2">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors md:px-4 md:text-[11px]",
                active === s.id
                  ? "border-navy bg-navy text-white"
                  : "border-navy/15 text-navy hover:border-gold hover:text-gold",
              )}
            >
              <s.icon className="h-3.5 w-3.5" />
              <span>{s.label}</span>
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Placeholder avatar / image blocks (no AI photos)
// -----------------------------------------------------------------------------
function AvatarPlaceholder({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const dims =
    size === "lg" ? "h-24 w-24 text-2xl" : size === "sm" ? "h-10 w-10 text-xs" : "h-16 w-16 text-lg";
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-navy to-navy-light font-display font-bold text-white ring-2 ring-white shadow-sm",
        dims,
      )}
      aria-hidden
    >
      {initialsOf(name)}
    </div>
  );
}

function ImagePlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg border border-dashed border-navy/15 bg-navy/[0.03] text-navy/30",
        className,
      )}
      aria-hidden
    >
      <FileText className="h-6 w-6" />
    </div>
  );
}

// -----------------------------------------------------------------------------
// Sections
// -----------------------------------------------------------------------------
function AboutSection({
  dept,
  content,
  programNameOf,
}: {
  dept: Department;
  content: ReturnType<typeof getDepartmentContent>;
  programNameOf: (id: string) => string;
}) {
  return (
    <section id="about" className="container-page scroll-mt-32 py-16">
      <SectionHeading eyebrow="About Us" title={`Department of ${dept.name}`} />
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <p className="text-base leading-relaxed text-muted-foreground">{content.about}</p>
        </div>
        {(content.vision || content.mission) && (
          <div className="space-y-4">
            {content.vision && (
              <div className="rounded-xl border-2 border-navy/15 bg-white p-5">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-crimson">Vision</div>
                <p className="mt-2 text-sm text-ink">{content.vision}</p>
              </div>
            )}
            {content.mission && (
              <div className="rounded-xl border-2 border-navy/15 bg-white p-5">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-crimson">Mission</div>
                <p className="mt-2 text-sm text-ink">{content.mission}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-12">
        <h3 className="font-display text-xl font-bold text-navy">Programs Offered</h3>
        <div className="mt-4 overflow-x-auto rounded-xl border-2 border-navy/15 bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-navy/5 text-[11px] font-semibold uppercase tracking-wider text-navy">
              <tr>
                <th className="px-4 py-3">Program</th>
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Year Started</th>
                <th className="px-4 py-3">Intake</th>
                <th className="px-4 py-3">Duration</th>
              </tr>
            </thead>
            <tbody>
              {content.programTable.map((row) => (
                <tr key={row.programId} className="border-t border-navy/10">
                  <td className="px-4 py-3 font-medium text-ink">{programNameOf(row.programId)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-navy">
                      {row.degreeLevel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{row.yearStarted ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.intake ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.duration}</td>
                </tr>
              ))}
              {content.programTable.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                    No programs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function ProgramsSection({
  dept,
  content,
  programNameOf,
}: {
  dept: Department;
  content: ReturnType<typeof getDepartmentContent>;
  programNameOf: (id: string) => string;
}) {
  return (
    <section id="programs" className="scroll-mt-32 bg-secondary/40 py-16">
      <div className="container-page">
        <SectionHeading eyebrow="Programs" title={`${dept.name} Programs`} />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {content.programTable.map((row) => (
            <Reveal key={row.programId}>
              <Link
                to="/departments/$dept/programs/$program"
                params={{ dept: deptSlugOf(dept.id), program: row.programId }}
                className="card-lift group flex h-full flex-col rounded-xl border-2 border-navy/15 bg-white p-5 transition-colors hover:border-gold"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-navy">
                    {row.degreeLevel}
                  </span>
                  <span className="text-xs text-muted-foreground">{row.duration}</span>
                </div>
                <h4 className="mt-3 flex-1 font-display text-base font-bold text-navy">
                  {programNameOf(row.programId)}
                </h4>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-navy transition-colors group-hover:text-gold">
                  Program details <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            </Reveal>
          ))}
          {content.programTable.length === 0 && (
            <p className="text-sm text-muted-foreground">No programs listed yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function StaffCard({
  member,
  featured = false,
  compact = false,
}: {
  member: StaffMember;
  featured?: boolean;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-navy/10 bg-white p-3">
        <AvatarPlaceholder name={member.name} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-navy">{member.name}</div>
          <div className="truncate text-xs text-muted-foreground">{member.designation}</div>
        </div>
        <Link
          to="/staff/$staff"
          params={{ staff: member.id }}
          className="text-[11px] font-semibold text-navy hover:text-gold"
        >
          View
        </Link>
      </div>
    );
  }

  return (
    <article
      className={cn(
        "card-lift group flex h-full flex-col rounded-2xl border-2 bg-white p-6 transition-colors",
        featured ? "border-gold shadow-md" : "border-navy/15 hover:border-gold",
      )}
    >
      <div className="flex items-start gap-4">
        <AvatarPlaceholder name={member.name} size={featured ? "lg" : "md"} />
        <div className="min-w-0 flex-1">
          {featured && (
            <div className="text-[11px] font-semibold uppercase tracking-widest text-crimson">
              Head of Department
            </div>
          )}
          <h4 className={cn("font-display font-bold text-navy", featured ? "text-xl" : "text-base")}>
            {member.name}
          </h4>
          <div className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-navy/70">
            {member.designation}
          </div>
        </div>
      </div>
      <dl className="mt-4 space-y-1 text-xs text-muted-foreground">
        {member.qualification && (
          <div>
            <span className="font-semibold text-ink">Qualification:</span> {member.qualification}
          </div>
        )}
        {member.experienceYears != null && (
          <div>
            <span className="font-semibold text-ink">Experience:</span> {member.experienceYears}+ yrs
          </div>
        )}
        <div>
          <span className="font-semibold text-ink">Emp Code:</span> {member.employeeCode}
        </div>
      </dl>
      <div className="mt-auto pt-4">
        <Link
          to="/staff/$staff"
          params={{ staff: member.id }}
          className="inline-flex items-center gap-1 text-xs font-semibold text-navy transition-colors hover:text-gold"
        >
          View Profile <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}

function StaffSection({ members }: { members: StaffMember[] }) {
  const hod = members.filter((m) => m.rankGroup === "HOD");
  const faculty = members.filter((m) => m.rankGroup === "Faculty");
  const support = members.filter((m) => m.rankGroup === "Support");

  return (
    <section id="staff" className="container-page scroll-mt-32 py-16">
      <SectionHeading eyebrow="Our Team" title="Faculty & Staff" />

      {hod.length > 0 && (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {hod.map((m) => (
            <Reveal key={m.id}>
              <StaffCard member={m} featured />
            </Reveal>
          ))}
        </div>
      )}

      {faculty.length > 0 && (
        <div className="mt-10">
          <h3 className="font-display text-lg font-bold text-navy">Faculty</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {faculty.map((m, i) => (
              <Reveal key={m.id} delay={i * 0.03}>
                <StaffCard member={m} />
              </Reveal>
            ))}
          </div>
        </div>
      )}

      {support.length > 0 && (
        <div className="mt-10">
          <h3 className="font-display text-lg font-bold text-navy">Teaching Assistants & Support Staff</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {support.map((m) => (
              <StaffCard key={m.id} member={m} compact />
            ))}
          </div>
        </div>
      )}

      {members.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">Staff list will appear here once populated.</p>
      )}
    </section>
  );
}

function AchievementsSection({
  content,
}: {
  content: ReturnType<typeof getDepartmentContent>;
}) {
  const sorted = [...content.achievements].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <section id="achievements" className="scroll-mt-32 bg-secondary/40 py-16">
      <div className="container-page">
        <SectionHeading eyebrow="Achievements & Clubs" title="Highlights & Student Groups" />
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h3 className="font-display text-lg font-bold text-navy">Recent Achievements</h3>
            <div className="mt-4 space-y-4">
              {sorted.map((a) => (
                <Reveal key={a.id}>
                  <article className="flex gap-4 rounded-xl border-2 border-navy/15 bg-white p-4">
                    <ImagePlaceholder className="h-20 w-28 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-crimson">
                        {new Date(a.date).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <h4 className="mt-1 font-display font-bold text-navy">{a.title}</h4>
                      <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
                    </div>
                  </article>
                </Reveal>
              ))}
              {sorted.length === 0 && (
                <div className="rounded-xl border border-dashed border-navy/20 p-6 text-center text-sm text-muted-foreground">
                  Achievements will be published here soon.
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-display text-lg font-bold text-navy">Student Clubs</h3>
            <div className="mt-4 space-y-3">
              {content.clubs.map((c) => (
                <div key={c.id} className="rounded-xl border-2 border-navy/15 bg-white p-4">
                  <div className="font-display font-bold text-navy">{c.name}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{c.description}</p>
                </div>
              ))}
              {content.clubs.length === 0 && (
                <div className="rounded-xl border border-dashed border-navy/20 p-4 text-center text-xs text-muted-foreground">
                  No clubs listed yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const ACTIVITY_TABS: { type: ActivityType; label: string }[] = [
  { type: "sttp_fdp", label: "STTP / FDP / Conferences" },
  { type: "expert_lecture", label: "Expert Lectures" },
  { type: "seminar_workshop", label: "Seminars & Workshops" },
  { type: "mou", label: "MOUs" },
  { type: "industry_visit", label: "Industry Visits" },
];

function formatDateRange(a: ActivityItem) {
  const s = new Date(a.startDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  if (!a.endDate) return s;
  const e = new Date(a.endDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  return `${s} – ${e}`;
}

function ActivitiesSection({
  content,
}: {
  content: ReturnType<typeof getDepartmentContent>;
}) {
  const [tab, setTab] = useState<ActivityType>("sttp_fdp");
  const items = content.activities
    .filter((a) => a.type === tab)
    .sort((a, b) => b.startDate.localeCompare(a.startDate));

  return (
    <section id="activities" className="container-page scroll-mt-32 py-16">
      <SectionHeading
        eyebrow="Industry Interaction & Activities"
        title="Workshops, Lectures, MOUs & Visits"
      />
      <div className="mt-6 flex flex-wrap gap-2">
        {ACTIVITY_TABS.map((t) => (
          <button
            key={t.type}
            onClick={() => setTab(t.type)}
            className={cn(
              "rounded-full border-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors",
              tab === t.type
                ? "border-navy bg-navy text-white"
                : "border-navy/15 text-navy hover:border-gold hover:text-gold",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "mou" ? (
          <div className="overflow-x-auto rounded-xl border-2 border-navy/15 bg-white">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-navy/5 text-[11px] font-semibold uppercase tracking-wider text-navy">
                <tr>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">MOU Date</th>
                  <th className="px-4 py-3">Activities</th>
                </tr>
              </thead>
              <tbody>
                {items.map((a) => (
                  <tr key={a.id} className="border-t border-navy/10">
                    <td className="px-4 py-3 font-medium text-ink">{a.company ?? a.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(a.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{a.notes ?? "—"}</td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">
                      No MOUs recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {items.map((a) => (
              <Reveal key={a.id}>
                <article className="flex gap-3 rounded-xl border-2 border-navy/15 bg-white p-4">
                  <ImagePlaceholder className="h-16 w-20 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-display font-bold text-navy">{a.title}</h4>
                    <div className="mt-1 text-xs text-muted-foreground">{formatDateRange(a)}</div>
                    {a.company && (
                      <div className="mt-1 text-xs text-muted-foreground">Partner: {a.company}</div>
                    )}
                    {a.documentUrl && (
                      <a
                        href={a.documentUrl}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-navy hover:text-gold"
                      >
                        <FileText className="h-3.5 w-3.5" /> View More
                      </a>
                    )}
                  </div>
                </article>
              </Reveal>
            ))}
            {items.length === 0 && (
              <div className="rounded-xl border border-dashed border-navy/20 p-8 text-center text-sm text-muted-foreground md:col-span-2">
                No entries in this category yet.
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------
export function DepartmentDetailPage({ dept }: { dept: Department }) {
  const college = collegeMap[dept.collegeId];
  const degreeType = dept.degreeTypeId
    ? degreeTypes.find((d) => d.id === dept.degreeTypeId)
    : null;
  const programs = useMemo(() => getProgramsForDepartment(dept.id), [dept.id]);
  const programNameOf = (id: string) =>
    programs.find((p) => p.id === id)?.name ?? id;
  const content = useMemo(
    () => getDepartmentContent(dept.id, programs, dept.degreeTypeId),
    [dept.id, dept.degreeTypeId, programs],
  );
  const staffList = useMemo(() => getStaffForDepartment(dept.id), [dept.id]);

  const accent = degreeType
    ? `${college.shortCode} · ${degreeType.name}`
    : college.shortCode;

  return (
    <>
      <PageHero
        title={dept.name}
        accent={accent}
        subtitle={`Department under ${college.name}${degreeType ? ` (${degreeType.name})` : ""}.`}
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Colleges", to: "/colleges" },
          { label: college.shortCode, to: "/colleges/$college" as never },
          { label: dept.name },
        ]}
      />

      <StickySubNav />

      <AboutSection dept={dept} content={content} programNameOf={programNameOf} />
      <ProgramsSection dept={dept} content={content} programNameOf={programNameOf} />
      <StaffSection members={staffList} />
      <AchievementsSection content={content} />
      <ActivitiesSection content={content} />

      <CTABanner />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="sr-only"
        aria-hidden
      >
        {/* keeps framer-motion tree-shake honest */}
      </motion.div>
    </>
  );
}

// Small helper re-export so route files stay tiny.
export { departmentBySlug as findDepartmentBySlug };

// Icons re-export to avoid unused import warnings in some build modes.
export const _iconRefs = { Mail };
