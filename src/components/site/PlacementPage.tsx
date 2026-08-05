import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Target, MessagesSquare, Briefcase, CalendarCheck, UserCheck, Award,
  BookOpen, GraduationCap, Building2, Sparkles, CheckCircle2, TrendingUp,
  Phone, Mail, User, ChevronRight, ChevronDown, ChevronUp
} from "lucide-react";
import { PageHero } from "./PageHero";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { PlacementTestimonialsSlider } from "./PlacementTestimonialsSlider";
import {
  type FullPlacementData,
  type PlacementHighlight,
  type PlacementTestimonial
} from "@/lib/placement.functions";

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
  const testimonials: PlacementTestimonial[] = data.testimonials || [];

  const placedStudentCount = displayStudents.length;
  const recruiterCount = data.recruiters.length;

  const totalPlacedCount = graphicalData.reduce((a, c) => a + c.studentsPlaced, 0);
  const sortedGraphicalData = [...graphicalData].sort((a, b) => b.studentsPlaced - a.studentsPlaced);
  const peakYearPoint = sortedGraphicalData[0] || { year: "N/A", studentsPlaced: 0, placementPercentage: 0 };
  const maxPct = Math.max(...graphicalData.map((d) => d.placementPercentage), 100);

  const sections = data.sectionConfig?.sections || {
    about: true,
    trend: true,
    placedStudents: true,
    recruiters: true,
    officer: true,
    testimonials: true,
  };

  const highlights: PlacementHighlight[] = data.sectionConfig?.highlights || [];

  return (
    <>
      {/* ── Section 1 — Hero ───────────────────────────────────── */}
      <PageHero
        title={data.heroTitle}
        accent="Training & Placement"
        subtitle={data.heroSubtitle}
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Placements" },
        ]}
      />

      {/* ── Section 2 — Metric ticker bar ──────────────────────── */}
      <div className="bg-navy-deep text-white py-6 border-y-4 border-navy-deep shadow-md">
        <div className="container-page max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-white/15 text-center">
            <div className="px-4">
              <div className="font-display text-3xl md:text-4xl font-extrabold text-white">
                {placedStudentCount}+
              </div>
              <div className="mt-1 text-xs font-bold uppercase tracking-widest text-white/80">
                Students Placed
              </div>
            </div>

            <div className="px-4">
              <div className="font-display text-3xl md:text-4xl font-extrabold text-gold">
                {data.highestPackage}
              </div>
              <div className="mt-1 text-xs font-bold uppercase tracking-widest text-white/80">
                Highest Package
              </div>
            </div>

            <div className="px-4">
              <div className="font-display text-3xl md:text-4xl font-extrabold text-white">
                {data.averagePackage}
              </div>
              <div className="mt-1 text-xs font-bold uppercase tracking-widest text-white/80">
                Average Package
              </div>
            </div>

            <div className="px-4">
              <div className="font-display text-3xl md:text-4xl font-extrabold text-gold">
                {recruiterCount}+
              </div>
              <div className="mt-1 text-xs font-bold uppercase tracking-widest text-white/80">
                Recruiting Partners
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Page Shell ─────────────────────────────────────────── */}
      <div className="bg-secondary/30 min-h-screen py-12">
        <div className="container-page max-w-6xl">
          <div className="min-w-0 space-y-12">

            {/* ── Section 3 — About (#about) ──────────────────── */}
            {sections.about && (
              <section id="about" className="scroll-mt-24">
                <SectionHeading
                  eyebrow="Training & Placement"
                  title="About the T&P Cell"
                  variant="eyebrow"
                />

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left column — highlights */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-navy mb-2">
                      Cell Highlights &amp; Support Services
                    </h4>
                    {highlights.map((h) => {
                      const IconComponent = ICON_MAP[h.icon] || Target;
                      return (
                        <div
                          key={h.id}
                          className="flex items-center gap-3.5 rounded-xl border-2 border-navy/15 bg-white p-4 shadow-2xs hover:border-navy transition-colors"
                        >
                          <div className="h-10 w-10 shrink-0 rounded-xl bg-navy/10 flex items-center justify-center">
                            <IconComponent className="h-5 w-5 text-navy" />
                          </div>
                          <span className="text-xs font-bold text-navy leading-snug">
                            {h.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right column — institutional overview */}
                  <div className="rounded-2xl border-2 border-navy/15 bg-white p-6 md:p-8 flex flex-col justify-between shadow-xs relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-32 w-32 bg-navy/5 rounded-bl-full pointer-events-none" />
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-navy/70 mb-3">
                        Institutional Overview
                      </div>
                      <p className="text-sm text-navy/80 leading-relaxed font-medium">
                        {aboutText}
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-navy/10 flex items-center justify-between text-xs font-extrabold text-navy">
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

                <div className="mt-6 rounded-2xl border-2 border-navy/15 bg-white p-6 md:p-8 shadow-xs">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-6">
                    <h3 className="font-display text-lg font-bold text-navy">
                      Year-wise Recruitment Percentage &amp; Intake
                    </h3>
                    <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Students placed shown per bar
                    </span>
                  </div>

                  <div className="overflow-x-auto pb-2 scrollbar-thin">
                    <div className="flex h-64 items-end gap-3 md:gap-5 pt-8 min-w-[500px] md:min-w-0">
                      {graphicalData.map((point) => {
                        const h = Math.max(
                          8,
                          Math.round((point.placementPercentage / maxPct) * 100)
                        );
                        return (
                          <div
                            key={point.year}
                            className="flex flex-1 flex-col items-center gap-2 h-full justify-end"
                          >
                            <span className="text-[11px] font-extrabold text-navy bg-navy/10 px-2 py-0.5 rounded-md">
                              {point.placementPercentage}%
                            </span>
                            <div className="flex w-full flex-1 items-end">
                              <div
                                className="w-full rounded-t-lg bg-gradient-to-t from-navy-deep via-navy to-navy-light transition-all hover:brightness-125 shadow-xs"
                                style={{ height: `${h}%` }}
                                title={`${point.year}: ${point.placementPercentage}% placement (${point.studentsPlaced} students)`}
                              />
                            </div>
                            <span className="text-xs font-bold text-navy">
                              {point.year}
                            </span>
                            <span className="text-[10px] font-semibold text-muted-foreground">
                              {point.studentsPlaced} Placed
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Summary Tiles */}
                  <div className="mt-8 pt-6 border-t-2 border-navy/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-secondary/50 rounded-xl">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Peak Placement Year
                      </div>
                      <div className="font-display text-lg font-extrabold text-navy mt-1">
                        {peakYearPoint.year}
                      </div>
                    </div>
                    <div className="p-3 bg-secondary/50 rounded-xl">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Best Intake Count
                      </div>
                      <div className="font-display text-lg font-extrabold text-navy mt-1">
                        {peakYearPoint.studentsPlaced} Students
                      </div>
                    </div>
                    <div className="p-3 bg-secondary/50 rounded-xl">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Total Placed (Shown Years)
                      </div>
                      <div className="font-display text-lg font-extrabold text-navy mt-1">
                        {totalPlacedCount} Graduates
                      </div>
                    </div>
                  </div>
                </div>
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
                  <div className="mt-6 rounded-2xl border-2 border-dashed border-navy/15 bg-white p-12 text-center">
                    <p className="text-sm font-semibold text-muted-foreground">
                      No placed student records yet. Add student cards via Admin Hub.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                      {displayStudents.slice(0, visibleStudentCount).map((s, i) => (
                        <Reveal key={s.id || `st-${i}`} delay={(i % STUDENTS_PER_PAGE) * 0.03}>
                          <div className="card-lift flex h-full flex-col items-center gap-3 rounded-2xl border-2 border-navy/15 bg-white p-4 text-center hover:border-navy transition-all shadow-2xs">
                            {s.photo ? (
                              <img
                                src={s.photo}
                                alt={s.studentName}
                                className="h-20 w-20 rounded-full border-2 border-navy/20 object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-navy/20 bg-navy font-display text-xl font-bold text-gold">
                                {initials(s.studentName)}
                              </div>
                            )}
                            <div className="min-w-0 w-full">
                              <div className="truncate text-sm font-bold text-navy">
                                {s.studentName}
                              </div>
                              <div className="truncate text-xs font-semibold text-navy/70 mt-0.5">
                                {s.companyName}
                              </div>
                              <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Batch {s.batchYear}
                              </div>
                            </div>
                          </div>
                        </Reveal>
                      ))}
                    </div>

                    {/* Pagination Controls */}
                    {displayStudents.length > STUDENTS_PER_PAGE && (
                      <div className="mt-8 text-center">
                        {visibleStudentCount < displayStudents.length ? (
                          <button
                            type="button"
                            onClick={() => setVisibleStudentCount((prev) => prev + STUDENTS_PER_PAGE)}
                            className="inline-flex items-center gap-2 rounded-xl bg-navy px-6 py-2.5 text-xs font-extrabold text-white hover:bg-navy/90 transition-all shadow-sm"
                          >
                            <span>Show More Students</span>
                            <ChevronDown className="h-4 w-4 text-gold" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setVisibleStudentCount(STUDENTS_PER_PAGE)}
                            className="inline-flex items-center gap-2 rounded-xl border-2 border-navy/20 bg-white px-6 py-2.5 text-xs font-extrabold text-navy hover:bg-navy/5 transition-all shadow-sm"
                          >
                            <span>Show Less</span>
                            <ChevronUp className="h-4 w-4 text-navy" />
                          </button>
                        )}
                      </div>
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

                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {data.recruiters.slice(0, visibleRecruiterCount).map((r, i) => (
                    <Reveal key={r.id || `rec-${i}`}>
                      <div className="card-lift flex h-24 flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-navy/15 bg-white p-3 text-center hover:border-navy transition-colors">
                        {r.logo ? (
                          <img
                            src={r.logo}
                            alt={r.companyName}
                            className="max-h-10 max-w-[80%] object-contain"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-10 w-full flex items-center justify-center rounded-md bg-navy/5 font-display text-xs font-extrabold text-navy px-2 text-center">
                            {r.companyName}
                          </div>
                        )}
                        <span className="text-xs font-bold text-navy truncate w-full">
                          {r.companyName}
                        </span>
                      </div>
                    </Reveal>
                  ))}
                </div>

                {data.recruiters.length > RECRUITERS_PER_PAGE && (
                  <div className="mt-8 text-center">
                    {visibleRecruiterCount < data.recruiters.length ? (
                      <button
                        type="button"
                        onClick={() => setVisibleRecruiterCount((prev) => prev + RECRUITERS_PER_PAGE)}
                        className="inline-flex items-center gap-2 rounded-xl bg-navy px-6 py-2.5 text-xs font-extrabold text-white hover:bg-navy/90 transition-all shadow-sm"
                      >
                        <span>Show More Partners</span>
                        <ChevronDown className="h-4 w-4 text-gold" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setVisibleRecruiterCount(RECRUITERS_PER_PAGE)}
                        className="inline-flex items-center gap-2 rounded-xl border-2 border-navy/20 bg-white px-6 py-2.5 text-xs font-extrabold text-navy hover:bg-navy/5 transition-all shadow-sm"
                      >
                        <span>Show Less</span>
                        <ChevronUp className="h-4 w-4 text-navy" />
                      </button>
                    )}
                  </div>
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

                <div className="mt-6 rounded-2xl border-2 border-navy/15 bg-white p-6 md:p-8 shadow-xs">
                  <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    {officer.photo ? (
                      <img
                        src={officer.photo}
                        alt={officer.name}
                        className="h-28 w-28 shrink-0 rounded-2xl object-cover border-2 border-navy/20"
                      />
                    ) : (
                      <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-navy text-gold font-display text-2xl font-bold">
                        {officer.name ? initials(officer.name) : <User className="h-12 w-12 text-gold" />}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="font-display text-2xl font-extrabold text-navy">
                        {officer.name || "T&P Officer"}
                      </div>
                      <div className="text-xs font-extrabold uppercase tracking-widest text-navy/70 mt-1">
                        {officer.designation || "Head — Training & Placement Cell"}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3">
                        {officer.phone && (
                          <a
                            href={`tel:${officer.phone.replace(/\s/g, "")}`}
                            className="inline-flex items-center gap-2 rounded-lg bg-secondary/60 px-3 py-1.5 text-xs font-bold text-navy hover:bg-navy hover:text-white transition-colors"
                          >
                            <Phone className="h-3.5 w-3.5 text-crimson" />
                            <span>{officer.phone}</span>
                          </a>
                        )}

                        {officer.email && (
                          <a
                            href={`mailto:${officer.email}`}
                            className="inline-flex items-center gap-2 rounded-lg bg-secondary/60 px-3 py-1.5 text-xs font-bold text-navy hover:bg-navy hover:text-white transition-colors"
                          >
                            <Mail className="h-3.5 w-3.5 text-crimson" />
                            <span>{officer.email}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ── Section 8 — Testimonials Sliding Carousel (#testimonials) ─ */}
            {sections.testimonials !== false && testimonials.length > 0 && (
              <section id="testimonials" className="scroll-mt-24">
                <SectionHeading
                  eyebrow="Student Success Stories"
                  title="What Our Placed Graduates Say"
                  variant="eyebrow"
                />

                <div className="mt-6">
                  <PlacementTestimonialsSlider items={testimonials} />
                </div>
              </section>
            )}

          </div>
        </div>
      </div>
    </>
  );
}

export function PlacementPageNotFound() {
  return (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-3xl font-bold text-navy">
        Placement Page
      </h1>
      <p className="mt-3 text-muted-foreground">
        Return to the main placement page:
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          to="/placement"
          className="rounded-xl bg-navy px-5 py-2.5 text-sm font-bold text-white hover:bg-navy/80 transition"
        >
          View Placement Page
        </Link>
      </div>
    </div>
  );
}
