import {
  ArrowUpRight,
  Award,
  CalendarDays,
  Clock,
  Handshake,
  MapPin,
  Users,
  Wrench,
} from "lucide-react";
import { StaffCard } from "@/components/site-next/DepartmentSections";
import { SectionHeading } from "@/components/site-next/SectionHeading";
import { Reveal } from "@/components/site-next/Reveal";
import { AchievementsGrid } from "@/components/site-next/AchievementsGrid";
import { EntryEventsGrid } from "@/components/site-next/EntryEventsGrid";
import type { CenterPageData, CenterProgramType } from "@/lib/center-page.functions";

// centers.metadata.lab — the single lab a centre runs (the CoE has one), edited
// on the admin page's "Lab" tab. Every field is optional; the section hides
// when there is no lab name.
export interface CenterLab {
  name?: string;
  location?: string;
  established?: string;
  capacity?: string;
  timings?: string;
  partner?: string;
  description?: string;
}

const PROGRAM_TYPE_LABELS: Record<CenterProgramType, string> = {
  training: "Training",
  certification: "Certification",
  workshop: "Workshop",
  internship: "Internship",
  other: "Programme",
};

const TEAM_GROUPS = [
  { key: "faculty", title: "Faculty coordinators" },
  { key: "student", title: "Student team" },
  { key: "external", title: "Mentors & partners" },
] as const;

// Admin-entered links: only render http(s) ones (never javascript: etc.).
function safeHref(url: string | null | undefined): string | null {
  return url && /^https?:\/\//i.test(url.trim()) ? url.trim() : null;
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

/**
 * The sections of a dedicated centre page (CoE, NSS / NCC) below the shared
 * Detail layout heading. Every section comes from Supabase and is omitted when
 * it has no published rows.
 */
export function CenterPageSections({ data }: { data: CenterPageData }) {
  const { center, equipment, programs, mous, events, achievements, team } = data;
  const highlights = center.metadata?.highlights ?? [];
  const lab: CenterLab = center.metadata?.lab ?? {};
  const labFacts = [
    { icon: MapPin, label: "Location", value: lab.location },
    { icon: CalendarDays, label: "Established", value: lab.established },
    { icon: Users, label: "Capacity", value: lab.capacity },
    { icon: Clock, label: "Timings", value: lab.timings },
    { icon: Handshake, label: "Industry partner", value: lab.partner },
  ].filter((f) => f.value?.trim());
  const teamGroups = TEAM_GROUPS.filter((g) => team[g.key].length > 0);

  return (
    <div className="space-y-14">
      {highlights.length > 0 && (
        <div>
          <SectionHeading eyebrow="Highlights" title="What makes it special" variant="eyebrow" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {highlights.map((h, i) => (
              <Reveal key={h.title} delay={i * 0.04}>
                <div className="h-full border border-line bg-surface p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper-deep text-xs font-bold text-navy">
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-display font-medium text-navy">{h.title}</div>
                      <p className="mt-1 text-sm text-ink-soft">{h.description}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      )}

      {lab.name?.trim() && (
        <div>
          <SectionHeading eyebrow="The Lab" title={lab.name} variant="eyebrow" />
          {lab.description && (
            <p className="mt-4 whitespace-pre-line text-justify text-base leading-relaxed text-ink-soft">
              {lab.description}
            </p>
          )}
          {labFacts.length > 0 && (
            <dl className="mt-6 grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
              {labFacts.map((f) => (
                <div key={f.label} className="flex items-start gap-3 bg-surface p-5">
                  <f.icon className="mt-0.5 h-4 w-4 shrink-0 text-crimson" />
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                      {f.label}
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-navy">{f.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}

      {equipment.length > 0 && (
        <div>
          <SectionHeading eyebrow="Infrastructure" title="Equipment details" variant="eyebrow" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {equipment.map((e, i) => (
              <Reveal key={e.id} delay={i * 0.03}>
                <div className="flex h-full items-start gap-4 border border-line bg-surface p-5">
                  {e.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={e.image_url}
                      alt=""
                      className="h-16 w-16 shrink-0 border border-line object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-paper-deep text-navy">
                      <Wrench className="h-5 w-5" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="font-display font-medium text-navy">{e.name}</div>
                      {e.quantity != null && (
                        <span className="shrink-0 text-xs font-semibold text-crimson">
                          Qty {e.quantity}
                        </span>
                      )}
                    </div>
                    {e.make_model && <div className="text-xs text-ink-soft">{e.make_model}</div>}
                    {e.specifications && (
                      <p className="mt-2 whitespace-pre-line text-sm text-ink-soft">
                        {e.specifications}
                      </p>
                    )}
                    {e.description && (
                      <p className="mt-2 whitespace-pre-line text-sm text-ink-soft">
                        {e.description}
                      </p>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      )}

      {programs.length > 0 && (
        <div>
          <SectionHeading
            eyebrow="Learn & certify"
            title="Training & certification programmes"
            variant="eyebrow"
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {programs.map((p, i) => {
              const href = safeHref(p.registration_url);
              const facts = [
                { label: "Duration", value: p.duration },
                { label: "Mode", value: p.mode },
                { label: "Eligibility", value: p.eligibility },
              ].filter((f) => f.value?.trim());
              return (
                <Reveal key={p.id} delay={i * 0.03}>
                  <div className="flex h-full flex-col border border-line bg-surface p-5">
                    <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-crimson">
                      {PROGRAM_TYPE_LABELS[p.program_type] ?? "Programme"}
                    </div>
                    <div className="mt-1.5 font-display text-lg font-medium leading-tight text-navy">
                      {p.title}
                    </div>
                    {p.certifying_body && (
                      <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-navy/70">
                        <Award className="h-3.5 w-3.5 shrink-0" /> {p.certifying_body}
                      </div>
                    )}
                    {p.description && (
                      <p className="mt-2 whitespace-pre-line text-sm text-ink-soft">
                        {p.description}
                      </p>
                    )}
                    {facts.length > 0 && (
                      <dl className="mt-3 space-y-1 text-sm">
                        {facts.map((f) => (
                          <div key={f.label} className="flex gap-2">
                            <dt className="shrink-0 font-semibold text-navy">{f.label}:</dt>
                            <dd className="text-ink-soft">{f.value}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                    {href && (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-auto inline-flex items-center gap-1 pt-4 text-xs font-bold uppercase tracking-widest text-crimson hover:text-navy"
                      >
                        Register <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      )}

      {mous.length > 0 && (
        <div>
          <SectionHeading
            eyebrow="Collaborations"
            title="MoUs & industry partners"
            variant="eyebrow"
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {mous.map((m, i) => {
              const signed = formatDate(m.signed_date);
              const expires = formatDate(m.expiry_date);
              return (
                <Reveal key={m.id} delay={i * 0.03}>
                  <div className="flex h-full items-start gap-4 border border-line bg-surface p-5">
                    {m.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.logo_url} alt="" className="h-12 w-12 shrink-0 object-contain" />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-paper-deep text-navy">
                        <Handshake className="h-5 w-5" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="font-display font-medium text-navy">
                        {m.partner_organization}
                      </div>
                      {(signed || expires) && (
                        <div className="mt-0.5 text-xs text-ink-soft">
                          {signed && <>Signed {signed}</>}
                          {signed && expires && " · "}
                          {expires && <>Valid till {expires}</>}
                        </div>
                      )}
                      {m.purpose && <p className="mt-2 text-sm text-ink-soft">{m.purpose}</p>}
                      {m.activities && m.activities.length > 0 && (
                        <ul className="mt-2 flex flex-wrap gap-1.5">
                          {m.activities.map((a) => (
                            <li
                              key={a}
                              className="rounded-full border border-line px-2.5 py-0.5 text-xs text-navy"
                            >
                              {a}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      )}

      {events.length > 0 && (
        <div>
          <SectionHeading eyebrow="Events" title="Recent events & workshops" variant="eyebrow" />
          <EntryEventsGrid entries={events} />
        </div>
      )}

      {achievements.length > 0 && (
        <div>
          <SectionHeading eyebrow="Achievements" title="Recent achievements" variant="eyebrow" />
          <div className="mt-6">
            <AchievementsGrid entries={achievements} />
          </div>
        </div>
      )}

      {teamGroups.length > 0 && (
        <div>
          <SectionHeading eyebrow="People" title="Coordinators & team" variant="eyebrow" />
          <div className="mt-6 space-y-8">
            {teamGroups.map((g) => (
              <div key={g.key}>
                {teamGroups.length > 1 && (
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-ink-soft">
                    {g.title}
                  </h3>
                )}
                {/* minmax(0,1fr): truncated emails must not widen the track past the screen. */}
                <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2">
                  {team[g.key].map((m, i) => (
                    <Reveal key={m.id} delay={i * 0.03}>
                      <StaffCard member={m} />
                    </Reveal>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
