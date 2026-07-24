import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";
import type { Department, DeptCourse } from "@/lib/departments.functions";

type StaffMember = { id: string; name: string; designation: string; rankGroup: string; employeeCode: string; qualification?: string | null; experienceYears?: number | null; email?: string | null; phone?: string | null; photoUrl?: string | null; isHod?: boolean };
type ActivityType = "seminar" | "workshop" | "expert_lecture" | "industrial_visit" | "mou" | "other" | "sttp_fdp" | "seminar_workshop" | "industry_visit";
type DeptActivity = { id: string; title: string; type: ActivityType; date: string; startDate: string; endDate?: string | null; description?: string | null; speaker?: string | null; organization?: string | null; company?: string | null; notes?: string | null; documentUrl?: string | null; imageUrl?: string | null };

const getStaffForDepartment = (_id: string) => [] as StaffMember[];
import {
  GraduationCap,
  Users,
  Calendar,
  FileText,
  Handshake,
  Presentation,
  Building2,
  Mic,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  department: Department;
  courses?: DeptCourse[];
}

function initials(name: string): string {
  const clean = name.replace(/^(dr\.?|mr\.?|mrs\.?|ms\.?)\s+/i, "").trim();
  const parts = clean.split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

function AvatarPlaceholder({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const dim = size === "lg" ? "h-24 w-24 text-2xl" : size === "sm" ? "h-10 w-10 text-xs" : "h-16 w-16 text-lg";
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-navy via-navy-light to-crimson font-display font-bold text-white ring-2 ring-white shadow-sm",
        dim
      )}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}

function ImagePlaceholder({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center rounded-lg bg-secondary/70 text-muted-foreground", className)}>
      <ImageIcon className="h-8 w-8" aria-hidden />
    </div>
  );
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

const DEGREE_LABEL: Record<string, string> = {
  undergraduate: "B.E. / B.Tech / UG",
  graduate: "M.E. / M.Tech / PG",
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
            <div className="grid gap-4 sm:grid-cols-2">
              {vision && (
                <div className="rounded-2xl border-2 border-navy/15 bg-secondary/40 p-5">
                  <div className="text-xs font-bold uppercase tracking-widest text-crimson">Vision</div>
                  <p className="mt-2 text-sm leading-relaxed text-ink">{vision}</p>
                </div>
              )}
              {missionLines.length > 0 && (
                <div className="rounded-2xl border-2 border-navy/15 bg-secondary/40 p-5">
                  <div className="text-xs font-bold uppercase tracking-widest text-crimson">Mission</div>
                  {missionLines.length === 1 ? (
                    <p className="mt-2 text-sm leading-relaxed text-ink">{missionLines[0]}</p>
                  ) : (
                    <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-ink list-disc list-inside">
                      {missionLines.map((l, i) => <li key={i}>{l}</li>)}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
          {(m.intake_ug || m.intake_pg || m.established) && (
            <div className="flex flex-wrap gap-4">
              {m.intake_ug && (
                <div className="rounded-xl border border-navy/15 bg-white px-4 py-3 text-center">
                  <div className="font-display text-2xl font-bold text-navy">{m.intake_ug}</div>
                  <div className="text-xs text-muted-foreground">UG Intake</div>
                </div>
              )}
              {m.intake_pg && (
                <div className="rounded-xl border border-navy/15 bg-white px-4 py-3 text-center">
                  <div className="font-display text-2xl font-bold text-navy">{m.intake_pg}</div>
                  <div className="text-xs text-muted-foreground">PG Intake</div>
                </div>
              )}
              {m.established && (
                <div className="rounded-xl border border-navy/15 bg-white px-4 py-3 text-center">
                  <div className="font-display text-2xl font-bold text-navy">{m.established}</div>
                  <div className="text-xs text-muted-foreground">Established</div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {courses.length > 0 && (
        <section>
          <SectionHeading eyebrow="Programs" title="Programs Offered" />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {courses.map((c, i) => (
              <Reveal key={c.id} delay={i * 0.04}>
                <div className="flex h-full flex-col rounded-2xl border-2 border-navy/15 bg-white p-6">
                  <span className="w-fit rounded-full bg-navy px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                    {DEGREE_LABEL[c.degree_level] ?? c.degree_level}
                  </span>
                  <h3 className="mt-3 font-display text-base font-bold text-navy leading-snug">
                    {c.metadata.shortName ?? c.name}
                  </h3>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// -------- Staff --------
function fieldOrNA(v: string | number | null | undefined, suffix = "") {
  if (v === null || v === undefined || v === "") return <span className="italic text-muted-foreground/70">Not available</span>;
  return <>{v}{suffix}</>;
}

function StaffCard({ member, featured = false }: { member: StaffMember; featured?: boolean }) {
  return (
    <Link
      to="/staff/$staff"
      params={{ staff: member.id }}
      className={cn(
        "card-lift group flex h-full flex-col rounded-2xl border-2 border-navy/15 bg-white p-6 hover:border-gold",
        featured && "lg:flex-row lg:items-center lg:gap-6 lg:p-8"
      )}
    >
      <div className={cn("flex items-center gap-4", featured && "lg:flex-col lg:items-start lg:gap-3")}>
        <AvatarPlaceholder name={member.name} size={featured ? "lg" : "md"} />
        {!featured && (
          <div className="min-w-0">
            <div className="font-display font-bold text-navy leading-tight">{member.name}</div>
            <div className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-crimson">
              {member.designation}
            </div>
          </div>
        )}
      </div>
      <div className={cn("mt-4 space-y-1.5 text-xs text-muted-foreground", featured && "lg:mt-0 lg:flex-1")}>
        {featured && (
          <>
            <div className="font-display text-xl font-bold text-navy">{member.name}</div>
            <div className="text-xs font-bold uppercase tracking-widest text-gold-strong">Head of Department</div>
            <div className="mt-1 text-sm font-semibold text-crimson">{member.designation}</div>
          </>
        )}
        <div><span className="font-semibold text-ink">Qualification:</span> {fieldOrNA(member.qualification)}</div>
        <div>
          <span className="font-semibold text-ink">Experience:</span> {member.experienceYears ? `${member.experienceYears}+ yrs` : <span className="italic text-muted-foreground/70">Not available</span>}
        </div>
        <div><span className="font-semibold text-ink">Employee Code:</span> {member.employeeCode}</div>
      </div>
      <div className={cn("mt-4 text-xs font-semibold text-navy transition-colors group-hover:text-gold-strong", featured && "lg:mt-2")}>
        View profile →
      </div>
    </Link>
  );
}

export function DeptStaffView({ department }: Props) {
  const staff = getStaffForDepartment(department.static_id);
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
        <div className="mt-8">
          <StaffCard member={hod} featured />
        </div>
      )}

      {faculty.length > 0 && (
        <div className="mt-10">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-crimson">Faculty ({faculty.length})</h3>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Support Staff ({support.length})
          </h3>
          <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {support.map((m) => (
              <li key={m.id} className="flex items-center gap-3 rounded-lg border border-navy/10 bg-secondary/30 p-3">
                <AvatarPlaceholder name={m.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-navy">{m.name}</div>
                  <div className="truncate text-[11px] text-muted-foreground">{m.designation}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {staff.length === 0 && (
        <p className="mt-10 text-center text-muted-foreground">Staff information will be published soon.</p>
      )}
    </div>
  );
}

// -------- Achievements & Clubs --------
export function DeptAchievementsView({ department }: Props) {
  const sorted: { id: string; title: string; year: string; description?: string | null }[] = [];
  const clubs: { id: string; name: string; description?: string | null }[] = [];
  return (
    <div>
      <SectionHeading eyebrow="Achievements & Clubs" title="Milestones and Student Groups" />

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-crimson">Recent Achievements</h3>
          {sorted.length === 0 ? (
            <p className="text-sm text-muted-foreground">No achievements published yet.</p>
          ) : (
            <ul className="space-y-4">
              {sorted.map((a, i) => (
                <Reveal key={a.id} delay={i * 0.04}>
                  <article className="flex flex-col gap-4 rounded-2xl border-2 border-navy/15 bg-white p-5 sm:flex-row">
                    <ImagePlaceholder className="h-28 w-full shrink-0 sm:h-24 sm:w-32" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs font-semibold text-crimson">
                        <Calendar className="h-3.5 w-3.5" /> {a.year}
                      </div>
                      <h4 className="mt-1 font-display text-base font-bold text-navy">{a.title}</h4>
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{a.description}</p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-crimson">Student Clubs</h3>
          {clubs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No clubs listed yet.</p>
          ) : (
            <ul className="space-y-3">
              {clubs.map((c) => (
                <li key={c.id} className="rounded-2xl border-2 border-navy/15 bg-white p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy/5 text-navy">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div className="font-display font-bold text-navy">{c.name}</div>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{c.description}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// -------- Industry Activities --------
const ACTIVITY_TABS: { id: ActivityType; label: string; icon: typeof Mic }[] = [
  { id: "sttp_fdp", label: "STTP / FDP / Conference", icon: Presentation },
  { id: "expert_lecture", label: "Expert Lectures", icon: Mic },
  { id: "seminar_workshop", label: "Seminars & Workshops", icon: Users },
  { id: "mou", label: "MOUs", icon: Handshake },
  { id: "industry_visit", label: "Industry Visits", icon: Building2 },
];

function ActivityList({ items }: { items: DeptActivity[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No entries yet.</p>;
  }
  return (
    <ul className="space-y-3">
      {items.map((a) => (
        <li key={a.id} className="rounded-xl border-2 border-navy/15 bg-white p-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-crimson">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(a.startDate)}
            {a.endDate && a.endDate !== a.startDate && <span>— {formatDate(a.endDate)}</span>}
          </div>
          <div className="mt-1 font-display text-sm font-bold text-navy">{a.title}</div>
          {a.company && <div className="text-xs text-muted-foreground">{a.company}</div>}
          {a.notes && <p className="mt-1 text-xs text-muted-foreground">{a.notes}</p>}
          {a.documentUrl && (
            <a href={a.documentUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-navy hover:text-gold-strong">
              <FileText className="h-3.5 w-3.5" /> View more
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}

export function DeptActivitiesView({ department }: Props) {
  const activities: DeptActivity[] = [];
  const [tab, setTab] = useState<ActivityType>("sttp_fdp");
  const items = activities
    .filter((a) => a.type === tab)
    .sort((a, b) => (a.startDate < b.startDate ? 1 : -1));


  return (
    <div>
      <SectionHeading eyebrow="Industry Interaction & Activities" title="Learning Beyond the Classroom" />

      <div className="mt-6 flex flex-wrap gap-2">
        {ACTIVITY_TABS.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 text-xs font-semibold transition-all",
                isActive ? "border-gold bg-navy text-white" : "border-navy/15 bg-white text-navy hover:border-gold"
              )}
            >
              <Icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <ActivityList items={items} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
