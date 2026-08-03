import { Link } from "@tanstack/react-router";
import {
  Mail, Phone, User, Image as ImageIcon, Info,
  BarChart3, GraduationCap, Building2, UserCircle2,
  LayoutDashboard, TrendingUp, Award, Users,
} from "lucide-react";
import { PageHero } from "./PageHero";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import type { PlacementPageContent } from "@/routes/placement.$college";

const collegesList = [
  { slug: "overview",   label: "Overview",              icon: LayoutDashboard },
  { slug: "svit-degree",label: "SVIT (Degree)",         icon: Building2 },
  { slug: "svit-coa",   label: "COA (Architecture)",    icon: Building2 },
  { slug: "svica",      label: "SVICA (Comp. Apps)",    icon: Building2 },
  { slug: "svion",      label: "SVION (Nursing)",       icon: Building2 },
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase() || "?";
}

// ── Sub-components ─────────────────────────────────────────────

/** Auto-calculated stat highlights bar */
function StatsBar({ stats }: { stats: PlacementPageContent["autoStats"] }) {
  if (stats.total === 0) return null;
  const items = [
    { label: "Students Placed", value: `${stats.total}+`, icon: Users },
    ...(stats.highestPackage
      ? [{ label: "Highest Package", value: `₹${stats.highestPackage} LPA`, icon: Award }]
      : []),
    ...(stats.averagePackage
      ? [{ label: "Average Package", value: `₹${stats.averagePackage} LPA`, icon: TrendingUp }]
      : []),
  ];
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <Reveal key={item.label} delay={i * 0.06}>
            <div className="flex flex-col items-center rounded-2xl border-2 border-navy/15 bg-white p-6 text-center hover:border-gold transition-colors">
              <Icon className="h-5 w-5 text-crimson mb-2" />
              <div className="font-display text-3xl md:text-4xl font-bold text-navy">{item.value}</div>
              <div className="mt-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{item.label}</div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}

/** Auto bar chart from year-wise student counts */
function YearChart({ byYear }: { byYear: PlacementPageContent["autoStats"]["byYear"] }) {
  if (!byYear.length) return null;
  const maxCount = Math.max(...byYear.map((d) => d.count), 1);
  return (
    <div className="rounded-2xl border-2 border-navy/15 bg-white p-6 md:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-6">
        <h3 className="font-display text-lg font-bold text-navy">Year-wise Placements</h3>
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Auto-calculated from student records
        </span>
      </div>
      <div className="overflow-x-auto pb-2 scrollbar-thin">
        <div className="flex h-56 min-w-[400px] md:min-w-0 items-end gap-3 md:gap-6">
          {byYear.map((d) => {
            const h = Math.max(8, Math.round((d.count / maxCount) * 100));
            return (
              <div key={d.year} className="flex flex-1 flex-col items-center gap-2">
                <div className="text-[11px] font-bold text-navy">{d.count}</div>
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-navy to-navy/60 transition-all hover:from-crimson hover:to-gold cursor-default"
                    style={{ height: `${h}%` }}
                    title={`${d.year}: ${d.count} students placed`}
                  />
                </div>
                <div className="text-xs font-semibold text-navy">{d.year}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">placed</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Student portrait card */
function StudentCard({
  student,
  placeholder,
}: {
  student: PlacementPageContent["placedStudents"][0];
  placeholder: string | null;
}) {
  return (
    <div className="card-lift flex flex-col overflow-hidden rounded-2xl border-2 border-navy/15 bg-white hover:border-gold transition-colors">
      <div className="aspect-square w-full bg-secondary/20 flex items-center justify-center relative overflow-hidden">
        {student.photo || placeholder ? (
          <img
            src={student.photo || placeholder!}
            alt={student.companyName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-navy/5 to-navy/15">
            <UserCircle2 className="h-14 w-14 text-navy/20" />
          </div>
        )}
      </div>
      <div className="p-3.5 border-t border-navy/8 text-center min-w-0">
        {student.studentName && student.studentName !== "Student" && (
          <div className="font-bold text-navy truncate text-xs mb-0.5">{student.studentName}</div>
        )}
        <div className="font-semibold text-slate-800 truncate text-sm">{student.companyName}</div>
        <div className="mt-1 flex items-center justify-center">
          <span className="rounded-full bg-navy/8 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-navy/60">
            Batch {student.batchYear || "2024"}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Overview highlight card — top student per college */
function TopStudentCard({ s }: { s: PlacementPageContent["autoStats"]["topStudents"][0] }) {
  return (
    <Reveal>
      <Link
        to="/placement/$college"
        params={{ college: s.collegeSlug }}
        className="group flex flex-col overflow-hidden rounded-2xl border-2 border-navy/15 bg-white hover:border-gold transition-colors"
      >
        {/* Photo */}
        <div className="aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-navy/5 to-navy/15 flex items-center justify-center relative">
          {s.photoUrl ? (
            <img src={s.photoUrl} alt={s.studentName} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <span className="text-4xl font-bold text-navy/20">{initials(s.studentName)}</span>
          )}
          {/* Package badge */}
          {s.packageLpa && (
            <div className="absolute top-2 right-2 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white shadow">
              ₹{s.packageLpa} LPA
            </div>
          )}
        </div>
        {/* Info */}
        <div className="p-4 border-t border-navy/8">
          <div className="text-[10px] font-bold uppercase tracking-widest text-crimson mb-1">{s.collegeName}</div>
          <div className="font-display font-bold text-navy text-base truncate">{s.studentName}</div>
          {s.departmentName && (
            <div className="text-[11px] text-slate-500 truncate mt-0.5">{s.departmentName}</div>
          )}
          <div className="text-sm font-semibold text-slate-600 mt-1 truncate">@ {s.companyName}</div>
          {s.batchYear && (
            <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-navy/40">Batch {s.batchYear}</div>
          )}
        </div>
      </Link>
    </Reveal>
  );
}

/** Placement officer & coordinator card */
function OfficerCard({ officer }: { officer: PlacementPageContent["placementOfficer"] }) {
  const name = officer.name || "Training & Placement Officer";
  const designation = officer.designation || "Head - Training & Placement Cell";
  const phone = officer.phone || "+91 2692 274489";
  const email = officer.email || "tnp@svitvasad.ac.in";
  const photo = officer.photo;

  return (
    <div className="rounded-2xl border-2 border-navy/15 bg-white p-6 md:p-8 hover:border-gold transition-colors">
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        {photo ? (
          <img
            src={photo}
            alt={name}
            className="h-24 w-24 shrink-0 rounded-full object-cover border-2 border-navy/10"
          />
        ) : (
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-navy/10 text-navy font-display text-2xl font-bold">
            {name ? initials(name) : <User className="h-10 w-10 text-navy" />}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="font-display text-xl font-bold text-navy">{name}</div>
          <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-crimson">{designation}</div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            {phone && (
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 hover:text-navy font-medium">
                <Phone className="h-4 w-4 text-crimson" /> {phone}
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} className="inline-flex items-center gap-2 hover:text-navy font-medium">
                <Mail className="h-4 w-4 text-crimson" /> {email}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export function PlacementPage({ content }: { content: PlacementPageContent }) {
  const isOverview = content.slug === "overview";
  const hasStudents = content.placedStudents.length > 0;
  const hasTopStudents = content.autoStats.topStudents.length > 0;
  const activeDivisions = (content.divisions && content.divisions.length > 0)
    ? content.divisions
    : collegesList;

  return (
    <>
      <PageHero
        title={
          isOverview
            ? (content.heroTitle?.replace(/OVERVIEW\s*—\s*/i, "") || "Training & Placement Cell")
            : (content.heroTitle || `${content.shortCode} — Placements`)
        }
        accent="Training & Placement"
        subtitle={content.heroSubtitle || `Placement outcomes, recruiters and support across all SVIT institutions.`}
        crumbs={
          isOverview
            ? [
                { label: "Home", to: "/" },
                { label: "Placements" },
              ]
            : [
                { label: "Home", to: "/" },
                { label: "Placements", to: "/placement/overview" },
                { label: content.shortCode },
              ]
        }
      />

      <div className="bg-secondary/30">
        <div className="container-page py-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">

            {/* ── Sidebar ─────────────────────────────────── */}
            <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start space-y-4">
              <nav
                aria-label="College placement divisions"
                className="rounded-2xl border-2 border-navy/15 bg-white p-3 shadow-sm"
              >
                <div className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-widest text-crimson">
                  Placements Dashboard
                </div>
                <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible scrollbar-none pb-1 lg:pb-0">
                  {activeDivisions.map((item) => {
                    const isActive =
                      content.slug === item.slug ||
                      (item.slug === "svit-degree" && content.slug === "svit") ||
                      (item.slug === "svit-coa" && content.slug === "coa");
                    const Icon = item.slug === "overview" ? LayoutDashboard : Building2;
                    return (
                      <li key={item.slug} className="shrink-0 lg:shrink">
                        <Link
                          to="/placement/$college"
                          params={{ college: item.slug }}
                          title={item.label}
                          className={`flex items-center gap-2.5 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-all whitespace-nowrap lg:whitespace-normal ${
                            isActive
                              ? "border-gold bg-navy text-white shadow-sm"
                              : "border-transparent text-navy hover:border-navy/15 hover:bg-secondary/60"
                          }`}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* On this page section navigation for overview */}
              {isOverview && (
                <nav
                  aria-label="Placement sections"
                  className="rounded-2xl border-2 border-navy/15 bg-white p-3 shadow-sm"
                >
                  <div className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-widest text-crimson">
                    On this page
                  </div>
                  <ul className="flex flex-col gap-1">
                    {[
                      { id: "about", label: "About T&P Cell", icon: Info },
                      { id: "stats", label: "Statistics", icon: BarChart3 },
                      { id: "highlights", label: "Top Performers", icon: Award },
                      { id: "recruiters", label: "Recruiters", icon: Building2 },
                      { id: "officer", label: "TNP Officer & Coordinator", icon: UserCircle2 },
                    ].map((s) => {
                      const Icon = s.icon;
                      return (
                        <li key={s.id}>
                          <a
                            href={`#${s.id}`}
                            className="flex items-center gap-2.5 rounded-xl border-2 border-transparent px-3 py-2 text-sm font-semibold text-navy transition-all hover:border-navy/15 hover:bg-secondary/60"
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            <span>{s.label}</span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              )}

              {/* Quick stats in sidebar */}
              {isOverview && content.autoStats.total > 0 && (
                <div className="rounded-2xl border-2 border-navy/15 bg-white p-4 shadow-sm space-y-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-crimson">Quick Stats</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 font-medium">Total Placed</span>
                      <span className="font-bold text-navy">{content.autoStats.total}</span>
                    </div>
                    {content.autoStats.highestPackage && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 font-medium">Highest</span>
                        <span className="font-bold text-emerald-600">₹{content.autoStats.highestPackage} LPA</span>
                      </div>
                    )}
                    {content.autoStats.averagePackage && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 font-medium">Average</span>
                        <span className="font-bold text-emerald-700">₹{content.autoStats.averagePackage} LPA</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </aside>

            {/* ── Main content ─────────────────────────────── */}
            <div className="min-w-0 space-y-10 [&>section]:scroll-mt-24">

              {/* OVERVIEW ONLY: About T&P Cell */}
              {isOverview && content.aboutText && (
                <section id="about" className="rounded-2xl border-2 border-navy/15 bg-white p-8">
                  <SectionHeading eyebrow="Training & Placement" title="About the T&P Cell" variant="eyebrow" />
                  <p className="mt-6 text-muted-foreground leading-relaxed">{content.aboutText}</p>
                </section>
              )}

              {/* OVERVIEW ONLY: Auto-Stats bar & chart */}
              {isOverview && content.autoStats.total > 0 && (
                <section id="stats">
                  <SectionHeading
                    eyebrow="Placement statistics"
                    title="Group-wide Statistics"
                    variant="eyebrow"
                  />
                  <div className="mt-6 space-y-6">
                    <StatsBar stats={content.autoStats} />
                    <YearChart byYear={content.autoStats.byYear} />
                  </div>
                </section>
              )}

              {/* OVERVIEW ONLY: Top student highlight per college */}
              {isOverview && hasTopStudents && (
                <section id="highlights">
                  <SectionHeading eyebrow="Top performers" title="Highest Package per Institute" variant="eyebrow" />
                  <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
                    {content.autoStats.topStudents.map((s) => (
                      <TopStudentCard key={s.collegeSlug} s={s} />
                    ))}
                  </div>
                </section>
              )}

              {/* PER-COLLEGE ONLY: Student Album */}
              {!isOverview && (
                <section id="students">
                  <SectionHeading
                    eyebrow="Placed Students"
                    title={`${content.shortCode} Placed Students`}
                    variant="eyebrow"
                  />
                  {content.placedStudents.length > 0 ? (
                    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      {content.placedStudents.map((s, i) => (
                        <Reveal key={`${s.companyName}-${i}`} delay={i * 0.03}>
                          <StudentCard student={s} placeholder={content.defaultStudentPlaceholderUrl} />
                        </Reveal>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-10 text-center text-xs text-slate-400">
                      No placement student cards added yet for {content.shortCode}.
                    </div>
                  )}
                </section>
              )}

              {/* OVERVIEW ONLY: Recruiters */}
              {isOverview && content.recruiters.length > 0 && (
                <section id="recruiters">
                  <SectionHeading eyebrow="Recruiting partners" title="Recruiters" variant="eyebrow" />
                  <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {content.recruiters.map((r) => (
                      <Reveal key={r.companyName}>
                        <div className="card-lift flex h-24 flex-col items-center justify-center gap-1 rounded-xl border-2 border-navy/15 bg-white p-3 text-center hover:border-gold transition-colors">
                          {r.logo ? (
                            <img src={r.logo} alt={r.companyName} className="max-h-10 w-full object-contain" />
                          ) : (
                            <div className="flex h-10 w-full items-center justify-center rounded bg-secondary/60 text-muted-foreground">
                              <ImageIcon className="h-5 w-5" />
                            </div>
                          )}
                          <div className="font-display text-xs font-bold text-navy truncate w-full">{r.companyName}</div>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                </section>
              )}

              {/* OVERVIEW ONLY: TNP Officer & Coordinator (Last section) */}
              {isOverview && (
                <section id="officer">
                  <SectionHeading eyebrow="Get in touch" title="TNP Officer & Coordinator" variant="eyebrow" />
                  <div className="mt-6">
                    <OfficerCard officer={content.placementOfficer} />
                  </div>
                </section>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function PlacementPageNotFound() {
  return (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-3xl font-bold text-navy">Placement division not found</h1>
      <p className="mt-3 text-muted-foreground">Choose one of the available divisions:</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {(["overview", "svit-degree", "svica", "svion", "svit-coa"] as const).map((slug) => (
          <Link
            key={slug}
            to="/placement/$college"
            params={{ college: slug }}
            className="rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy/80 transition"
          >
            {slug.toUpperCase()}
          </Link>
        ))}
      </div>
    </div>
  );
}
