import { Link } from "@tanstack/react-router";
import { Mail, Phone, User, Image as ImageIcon, Info, BarChart3, GraduationCap, Building2, UserCircle2 } from "lucide-react";
import { PageHero } from "./PageHero";
import { CTABanner } from "./CTABanner";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import type { PlacementPageContent } from "@/data/placement";

interface Props {
  content: PlacementPageContent;
}

const sectionLinks = [
  { id: "about", label: "About T&P Cell", icon: Info },
  { id: "details", label: "Details", icon: BarChart3 },
  { id: "summary", label: "Placed Students", icon: GraduationCap },
  { id: "recruiters", label: "Recruiters", icon: Building2 },
  { id: "officer", label: "Placement Officer", icon: UserCircle2 },
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (first + last).toUpperCase() || "?";
}

export function PlacementPage({ content }: Props) {
  const maxPct = Math.max(...content.details.graphicalData.map((d) => d.placementPercentage), 100);

  return (
    <>
      <PageHero
        title={`${content.shortCode} — Placements`}
        accent="Training & Placement"
        subtitle={`Placement outcomes, recruiters and support at ${content.collegeName}.`}
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Placement" },
          { label: content.shortCode },
        ]}
      />

      <div className="bg-secondary/30">
        <div className="container-page py-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
              <nav
                aria-label="Placement sections"
                className="rounded-2xl border-2 border-navy/15 bg-white p-3 shadow-sm"
              >
                <div className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-widest text-crimson">
                  On this page
                </div>
                <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
                  {sectionLinks.map((s) => {
                    const Icon = s.icon;
                    return (
                      <li key={s.id} className="shrink-0 lg:shrink">
                        <a
                          href={`#${s.id}`}
                          className="flex items-center gap-2.5 rounded-xl border-2 border-transparent px-3 py-2.5 text-sm font-semibold text-navy transition-all hover:border-navy/15 hover:bg-secondary/60"
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="whitespace-nowrap lg:whitespace-normal">{s.label}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </aside>

            <div className="min-w-0 space-y-8 [&>section]:scroll-mt-24">
              {/* 1. About T&P Cell */}
              <section id="about" className="rounded-2xl border-2 border-navy/15 bg-white p-8">
                <SectionHeading eyebrow="Training & Placement" title="About the T&P Cell" variant="eyebrow" />
                <p className="mt-6 text-muted-foreground leading-relaxed">{content.aboutText}</p>
              </section>

              {/* 2. Details */}
              <section id="details" className="space-y-6">
                <SectionHeading eyebrow="Placement statistics" title="Details" variant="eyebrow" />

                {/* Stat highlights */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {content.details.statHighlights.map((s, i) => (
                    <Reveal key={s.label} delay={i * 0.04}>
                      <div className="rounded-2xl border-2 border-navy/15 bg-white p-6 text-center hover:border-gold transition-colors">
                        <div className="font-display text-3xl md:text-4xl font-bold text-navy">{s.value}</div>
                        <div className="mt-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{s.label}</div>
                      </div>
                    </Reveal>
                  ))}
                </div>

                {/* Graphical Data (bar chart) */}
                <div className="rounded-2xl border-2 border-navy/15 bg-white p-6 md:p-8">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-display text-lg font-bold text-navy">Year-wise Placement Percentage</h3>
                    <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Students placed shown per bar
                    </span>
                  </div>
                  <div className="mt-6 flex h-64 items-end gap-3 md:gap-5">
                    {content.details.graphicalData.map((d) => {
                      const h = Math.max(6, Math.round((d.placementPercentage / maxPct) * 100));
                      return (
                        <div key={d.year} className="flex flex-1 flex-col items-center gap-2">
                          <div className="text-[11px] font-bold text-navy">{d.placementPercentage}%</div>
                          <div className="flex w-full flex-1 items-end">
                            <div
                              className="w-full rounded-t-md bg-gradient-to-t from-navy to-navy-light transition-all hover:from-crimson hover:to-gold"
                              style={{ height: `${h}%` }}
                              aria-label={`${d.year}: ${d.placementPercentage}% placement, ${d.studentsPlaced} students placed`}
                            />
                          </div>
                          <div className="text-xs font-semibold text-navy">{d.year}</div>
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{d.studentsPlaced} placed</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* 3. Summary — Placed Students */}
              <section id="summary" className="space-y-6">
                <SectionHeading eyebrow="Summary" title="Placed Students" variant="eyebrow" />
                {content.summary.placedStudents.length === 0 ? (
                  <div className="rounded-2xl border-2 border-dashed border-navy/15 bg-white p-8 text-center text-sm text-muted-foreground">
                    Placed student list will appear here once added.
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {content.summary.placedStudents.map((s, i) => (
                      <Reveal key={`${s.studentName}-${i}`} delay={i * 0.04}>
                        <div className="card-lift flex items-center gap-4 rounded-2xl border-2 border-navy/15 bg-white p-5 hover:border-gold transition-colors">
                          {s.photo ? (
                            <img src={s.photo} alt={s.studentName} className="h-16 w-16 rounded-full object-cover" />
                          ) : (
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-navy/10 font-display text-lg font-bold text-navy">
                              {initials(s.studentName)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-semibold text-navy truncate">{s.studentName}</div>
                            <div className="text-xs text-muted-foreground truncate">Placed at {s.companyName}</div>
                          </div>
                        </div>
                      </Reveal>
                    ))}
                    <div className="rounded-2xl border-2 border-dashed border-navy/15 bg-secondary/40 p-5 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center justify-center">
                      Sample data — editable via admin
                    </div>
                  </div>
                )}
              </section>

              {/* 4. Recruiters */}
              <section id="recruiters" className="space-y-6">
                <SectionHeading eyebrow="Recruiting partners" title="Recruiters" variant="eyebrow" />
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {content.recruiters.map((r) => (
                    <Reveal key={r.companyName}>
                      <div className="card-lift flex h-24 flex-col items-center justify-center gap-1 rounded-md border-2 border-navy/15 bg-white p-3 text-center hover:border-gold transition-colors">
                        {r.logo ? (
                          <img src={r.logo} alt={r.companyName} className="max-h-10 object-contain" />
                        ) : (
                          <div className="flex h-10 w-full items-center justify-center rounded bg-secondary/60 text-muted-foreground">
                            <ImageIcon className="h-5 w-5" />
                          </div>
                        )}
                        <div className="font-display text-sm font-bold text-navy truncate w-full">{r.companyName}</div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </section>

              {/* 5. Placement Officer */}
              <section id="officer" className="space-y-6">
                <SectionHeading eyebrow="Get in touch" title="Placement Officer" variant="eyebrow" />
                <div className="rounded-2xl border-2 border-navy/15 bg-white p-6 md:p-8">
                  <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                    {content.placementOfficer.photo ? (
                      <img
                        src={content.placementOfficer.photo}
                        alt={content.placementOfficer.name || "Placement Officer"}
                        className="h-24 w-24 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-navy/10 text-navy">
                        {content.placementOfficer.name ? (
                          <span className="font-display text-2xl font-bold">
                            {initials(content.placementOfficer.name)}
                          </span>
                        ) : (
                          <User className="h-10 w-10" />
                        )}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="font-display text-xl font-bold text-navy">
                        {content.placementOfficer.name || "To be announced"}
                      </div>
                      <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-crimson">
                        {content.placementOfficer.designation}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {content.placementOfficer.phone && (
                          <a
                            href={`tel:${content.placementOfficer.phone.replace(/\s/g, "")}`}
                            className="inline-flex items-center gap-2 hover:text-navy"
                          >
                            <Phone className="h-4 w-4" /> {content.placementOfficer.phone}
                          </a>
                        )}
                        {content.placementOfficer.email && (
                          <a
                            href={`mailto:${content.placementOfficer.email}`}
                            className="inline-flex items-center gap-2 hover:text-navy"
                          >
                            <Mail className="h-4 w-4" /> {content.placementOfficer.email}
                          </a>
                        )}
                        {!content.placementOfficer.phone && !content.placementOfficer.email && (
                          <span className="italic">Contact details will be added soon.</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <CTABanner />
    </>
  );
}

export function PlacementPageNotFound() {
  return (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-3xl font-bold text-navy">Placement division not found</h1>
      <p className="mt-3 text-muted-foreground">Choose one of the available divisions:</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link to="/placement/$college" params={{ college: "engineering" }} className="rounded-md bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-light">
          Engineering
        </Link>
        <Link to="/placement/$college" params={{ college: "architecture" }} className="rounded-md bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-light">
          Architecture
        </Link>
      </div>
    </div>
  );
}
