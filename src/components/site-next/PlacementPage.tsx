"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Target,
  MessagesSquare,
  Briefcase,
  CalendarCheck,
  UserCheck,
  Award,
  BookOpen,
  GraduationCap,
  Building2,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Phone,
  Mail,
  User,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { PageHero } from "./PageHero";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { eyebrow, pillOutline } from "./site-styles";
import { type FullPlacementData, type PlacementHighlight } from "@/lib/placement.functions";

const STUDENTS_PER_PAGE = 10;
const RECRUITERS_PER_PAGE = 12;

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Target,
  MessagesSquare,
  Briefcase,
  CalendarCheck,
  UserCheck,
  Award,
  BookOpen,
  GraduationCap,
  Building2,
  Sparkles,
  CheckCircle2,
  TrendingUp,
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase() || "?";
}

export interface PlacementPageProps {
  data: FullPlacementData;
}

export function PlacementPage({ data }: PlacementPageProps) {
  const [visibleStudentCount, setVisibleStudentCount] = useState(STUDENTS_PER_PAGE);
  const [visibleRecruiterCount, setVisibleRecruiterCount] = useState(RECRUITERS_PER_PAGE);

  const aboutText = data.aboutText;
  const officer = data.officer;
  const graphicalData = data.graphicalData || [];
  const displayStudents = data.placedStudents;

  const placedStudentCount = displayStudents.length;
  const recruiterCount = data.recruiters.length;

  const totalPlacedCount = graphicalData.reduce((a, c) => a + c.studentsPlaced, 0);
  const sortedGraphicalData = [...graphicalData].sort(
    (a, b) => b.studentsPlaced - a.studentsPlaced,
  );
  const peakYearPoint = sortedGraphicalData[0] || {
    year: "N/A",
    studentsPlaced: 0,
    placementPercentage: 0,
  };
  const maxPct = Math.max(...graphicalData.map((d) => d.placementPercentage), 100);

  const sections = data.sectionConfig?.sections || {
    about: true,
    trend: true,
    placedStudents: true,
    recruiters: true,
    officer: true,
  };

  const highlights: PlacementHighlight[] = data.sectionConfig?.highlights || [];

  const statCell = "bg-paper px-3 py-6 text-center";
  const statValue = "font-display text-3xl font-medium text-navy md:text-4xl";
  const statLabel = "mt-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-mute";

  const toggleButton = (
    showMore: boolean,
    more: string,
    onMore: () => void,
    onLess: () => void,
  ) => (
    <div className="mt-8 text-center">
      {showMore ? (
        <button type="button" onClick={onMore} className={pillOutline}>
          <span>{more}</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      ) : (
        <button type="button" onClick={onLess} className={pillOutline}>
          <span>Show Less</span>
          <ChevronUp className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* ── Section 1 — Hero ───────────────────────────────────── */}
      <PageHero
        title={data.heroTitle}
        accent="Training & Placement"
        subtitle={data.heroSubtitle}
        crumbs={[{ label: "Home", to: "/" }, { label: "Placements" }]}
      />

      {/* ── Section 2 — Metric strip (homepage numbers-strip style) ── */}
      <section className="border-b border-line bg-paper py-8 md:py-10">
        <div className="container-page max-w-6xl">
          <div className="grid grid-cols-2 gap-px bg-line md:grid-cols-4">
            <div className={statCell}>
              <div className={statValue}>{placedStudentCount}+</div>
              <div className={statLabel}>Students Placed</div>
            </div>
            <div className={statCell}>
              <div className={statValue}>{data.highestPackage}</div>
              <div className={statLabel}>Highest Package</div>
            </div>
            <div className={statCell}>
              <div className={statValue}>{data.averagePackage}</div>
              <div className={statLabel}>Average Package</div>
            </div>
            <div className={statCell}>
              <div className={statValue}>{recruiterCount}+</div>
              <div className={statLabel}>Recruiting Partners</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Page Shell ─────────────────────────────────────────── */}
      <div className="bg-paper py-[clamp(56px,8vw,96px)]">
        <div className="container-page max-w-6xl">
          <div className="min-w-0 space-y-[clamp(56px,8vw,96px)]">
            {/* ── Section 3 — About (#about) ──────────────────── */}
            {sections.about && (
              <section id="about" className="scroll-mt-24">
                <SectionHeading
                  eyebrow="Training & Placement"
                  title="About the T&P Cell"
                  variant="eyebrow"
                />

                <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div>
                    <h4 className={`mb-3 ${eyebrow}`}>Cell Highlights &amp; Support Services</h4>
                    <ul className="border-t border-line">
                      {highlights.map((h) => {
                        const IconComponent = ICON_MAP[h.icon] || Target;
                        return (
                          <li
                            key={h.id}
                            className="flex items-center gap-3.5 border-b border-line py-3.5"
                          >
                            <IconComponent className="h-5 w-5 shrink-0 text-navy" />
                            <span className="text-sm font-semibold leading-snug text-navy">
                              {h.label}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <div className="flex flex-col justify-between border border-line bg-paper-deep p-6 md:p-8">
                    <div>
                      <div className={`mb-3 ${eyebrow}`}>Institutional Overview</div>
                      <p className="text-sm leading-relaxed text-ink-soft md:text-base">
                        {aboutText}
                      </p>
                    </div>
                    <div className="mt-6 flex items-center justify-between border-t border-line pt-4 text-xs font-semibold uppercase tracking-wider text-navy">
                      <span>SVIT Group Placement Office</span>
                      <ChevronRight className="h-4 w-4 text-crimson" />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ── Section 4 — Trend chart (#trend) ────────────── */}
            {sections.trend && (
              <section id="trend" className="scroll-mt-24">
                <SectionHeading
                  eyebrow="Placement Statistics"
                  title="Year-on-Year Placement Trend"
                  variant="eyebrow"
                />

                {graphicalData.length === 0 ? (
                  // No yearly data entered yet: a note, not an empty chart reading "N/A / 0".
                  <div className="mt-8 border border-dashed border-line-strong bg-surface p-12 text-center">
                    <p className="text-sm text-ink-soft">
                      Year-wise placement statistics will be published soon.
                    </p>
                  </div>
                ) : (
                  <div className="mt-8 border border-line bg-surface p-5 md:p-8">
                    <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-display text-lg font-medium text-navy">
                        Year-wise Recruitment Percentage &amp; Intake
                      </h3>
                      <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
                        Students placed shown per bar
                      </span>
                    </div>

                    {/* Scrolls sideways inside the panel on narrow phones. */}
                    <div className="overflow-x-auto pb-2">
                      <div className="flex h-64 min-w-[500px] items-end gap-3 border-b border-line pt-8 md:min-w-0 md:gap-5">
                        {graphicalData.map((point) => {
                          const h = Math.max(
                            8,
                            Math.round((point.placementPercentage / maxPct) * 100),
                          );
                          return (
                            <div
                              key={point.year}
                              className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                            >
                              <span className="text-xs font-semibold text-navy">
                                {point.placementPercentage}%
                              </span>
                              <div className="flex w-full flex-1 items-end">
                                <div
                                  className="w-full bg-navy transition-colors hover:bg-navy-light"
                                  style={{ height: `${h}%` }}
                                  title={`${point.year}: ${point.placementPercentage}% placement (${point.studentsPlaced} students)`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex min-w-[500px] gap-3 pt-2 md:min-w-0 md:gap-5">
                        {graphicalData.map((point) => (
                          <div key={point.year} className="flex-1 text-center">
                            <div className="text-xs font-semibold text-navy">{point.year}</div>
                            <div className="text-[11px] text-ink-mute">
                              {point.studentsPlaced} Placed
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 divide-y divide-line border-y border-line text-center sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                      <div className="px-3 py-4">
                        <div className={statLabel.replace("mt-2 ", "")}>Peak Placement Year</div>
                        <div className="mt-1 font-display text-lg font-medium text-navy">
                          {peakYearPoint.year}
                        </div>
                      </div>
                      <div className="px-3 py-4">
                        <div className={statLabel.replace("mt-2 ", "")}>Best Intake Count</div>
                        <div className="mt-1 font-display text-lg font-medium text-navy">
                          {peakYearPoint.studentsPlaced} Students
                        </div>
                      </div>
                      <div className="px-3 py-4">
                        <div className={statLabel.replace("mt-2 ", "")}>
                          Total Placed (Shown Years)
                        </div>
                        <div className="mt-1 font-display text-lg font-medium text-navy">
                          {totalPlacedCount} Graduates
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* ── Section 5 — Placed students (#placedStudents) ─ */}
            {sections.placedStudents && (
              <section id="placedStudents" className="scroll-mt-24">
                <SectionHeading
                  eyebrow="Hall of Fame"
                  title="Placed Students Showcase"
                  variant="eyebrow"
                />

                {displayStudents.length === 0 ? (
                  <div className="mt-8 border border-dashed border-line-strong bg-surface p-12 text-center">
                    <p className="text-sm text-ink-soft">
                      No placed student records yet. Add student cards via Admin Hub.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-5">
                      {displayStudents.slice(0, visibleStudentCount).map((s, i) => (
                        <Reveal key={s.id || `st-${i}`} delay={(i % STUDENTS_PER_PAGE) * 0.03}>
                          <div className="flex h-full flex-col items-center gap-3 border border-line bg-surface p-4 text-center">
                            {s.photo ? (
                              <div className="relative h-20 w-20 overflow-hidden rounded-full border border-line">
                                <Image
                                  src={s.photo}
                                  alt={s.studentName}
                                  fill
                                  sizes="80px"
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-line bg-paper-deep font-display text-xl font-medium text-navy">
                                {initials(s.studentName)}
                              </div>
                            )}
                            <div className="w-full min-w-0">
                              <div className="truncate text-sm font-semibold text-navy">
                                {s.studentName}
                              </div>
                              <div className="mt-0.5 truncate text-xs text-ink-soft">
                                {s.companyName}
                              </div>
                              <div className="mt-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
                                Batch {s.batchYear}
                              </div>
                            </div>
                          </div>
                        </Reveal>
                      ))}
                    </div>

                    {displayStudents.length > STUDENTS_PER_PAGE &&
                      toggleButton(
                        visibleStudentCount < displayStudents.length,
                        "Show More Students",
                        () => setVisibleStudentCount((prev) => prev + STUDENTS_PER_PAGE),
                        () => setVisibleStudentCount(STUDENTS_PER_PAGE),
                      )}
                  </>
                )}
              </section>
            )}

            {/* ── Section 6 — Recruiter logo wall (#recruiters) ── */}
            {sections.recruiters && (
              <section id="recruiters" className="scroll-mt-24">
                <SectionHeading
                  eyebrow="Corporate Partners"
                  title="Recruiting Partners Logo Wall"
                  variant="eyebrow"
                />

                {/* Joined hairline grid: frame draws top/left, each cell right/bottom. */}
                <div className="mt-8 grid grid-cols-2 border-t border-l border-line sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {data.recruiters.slice(0, visibleRecruiterCount).map((r, i) => (
                    <Reveal key={r.id || `rec-${i}`} className="border-r border-b border-line">
                      <div className="flex h-28 flex-col items-center justify-center gap-2 bg-surface p-3 text-center">
                        {r.logo ? (
                          <div className="relative h-10 w-[80%]">
                            <Image
                              src={r.logo}
                              alt={r.companyName}
                              fill
                              sizes="120px"
                              className="object-contain"
                            />
                          </div>
                        ) : (
                          <div className="flex h-10 w-full items-center justify-center bg-paper-deep px-2 text-center font-display text-xs font-medium text-navy">
                            {r.companyName}
                          </div>
                        )}
                        <span className="w-full truncate text-xs font-semibold text-ink-soft">
                          {r.companyName}
                        </span>
                      </div>
                    </Reveal>
                  ))}
                </div>

                {data.recruiters.length > RECRUITERS_PER_PAGE &&
                  toggleButton(
                    visibleRecruiterCount < data.recruiters.length,
                    "Show More Partners",
                    () => setVisibleRecruiterCount((prev) => prev + RECRUITERS_PER_PAGE),
                    () => setVisibleRecruiterCount(RECRUITERS_PER_PAGE),
                  )}
              </section>
            )}

            {/* ── Section 7 — Officer card (#officer) ──────────── */}
            {sections.officer && (
              <section id="officer" className="scroll-mt-24">
                <SectionHeading
                  eyebrow="Placement Leadership"
                  title="T&P Officer & Coordinators"
                  variant="eyebrow"
                />

                <div className="mt-8 border border-line bg-surface p-6 md:p-8">
                  <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                    {officer.photo ? (
                      <div className="relative h-28 w-28 shrink-0 overflow-hidden border border-line">
                        <Image
                          src={officer.photo}
                          alt={officer.name}
                          fill
                          sizes="112px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-28 w-28 shrink-0 items-center justify-center border border-line bg-paper-deep font-display text-2xl font-medium text-navy">
                        {officer.name ? (
                          initials(officer.name)
                        ) : (
                          <User className="h-12 w-12 text-navy/50" strokeWidth={1.5} />
                        )}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="font-display text-2xl font-medium text-navy">
                        {officer.name || "T&P Officer"}
                      </div>
                      <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
                        {officer.designation || "Head — Training & Placement Cell"}
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        {officer.phone && (
                          <a
                            href={`tel:${officer.phone.replace(/\s/g, "")}`}
                            className={pillOutline}
                          >
                            <Phone className="h-3.5 w-3.5" />
                            <span>{officer.phone}</span>
                          </a>
                        )}
                        {officer.email && (
                          <a
                            href={`mailto:${officer.email}`}
                            className={`max-w-full ${pillOutline}`}
                          >
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{officer.email}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
