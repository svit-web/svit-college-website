import {
  BadgeCheck,
  Briefcase,
  CircuitBoard,
  Cpu,
  Gauge,
  GraduationCap,
  Landmark,
  Milestone,
  Plane,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/components/site-next/Reveal";
import { cn } from "@/lib/utils";

export type HistoryMilestone = { year: string; milestone: string };

// Each milestone gets an icon and a short label picked from its own text, so
// new milestones added in the admin get a fitting one without an extra field.
// First match wins: "NBA accreditation of … Computer" is an accreditation,
// "M.E. programmes in … Computer" is postgraduate.
const KINDS: { test: RegExp; icon: LucideIcon; label: string }[] = [
  { test: /\bestablish|\bfounded|\binaugurat/i, icon: Landmark, label: "Founded" },
  { test: /\bNBA\b|\bNAAC\b|accredit/i, icon: BadgeCheck, label: "Accreditation" },
  { test: /aeronautic|aerospace/i, icon: Plane, label: "New programme" },
  {
    test: /\bM\.?E\.?\b|\bM\.?Tech\b|\bPh\.?D\b|post-?graduate/i,
    icon: GraduationCap,
    label: "Postgraduate",
  },
  { test: /vocational|diploma/i, icon: Wrench, label: "Diploma & vocational" },
  { test: /\bBBA\b|\bMBA\b|management/i, icon: Briefcase, label: "Management" },
  { test: /instrumentation/i, icon: Gauge, label: "New programme" },
  { test: /electronics/i, icon: CircuitBoard, label: "New programme" },
  { test: /computer|information technology|\bIT\b|\bMCA\b/i, icon: Cpu, label: "New programme" },
];

function kindOf(text: string) {
  return KINDS.find((k) => k.test.test(text)) ?? { icon: Milestone, label: "Milestone" };
}

// Oldest first, by the year's leading number ("1997", "2008-09"); entries
// without one keep their admin order at the end.
function yearOf(y: unknown) {
  const n = parseInt(String(y ?? ""), 10);
  return Number.isNaN(n) ? Infinity : n;
}

export function HistoryTimeline({ milestones }: { milestones: HistoryMilestone[] }) {
  const items = [...milestones].sort((a, b) => yearOf(a.year) - yearOf(b.year));
  if (items.length === 0) return null;

  return (
    <div className="relative mt-12">
      {/* Spine: centred on desktop, along the icons on phones. */}
      <div
        aria-hidden
        className="absolute inset-y-6 left-6 w-px -translate-x-1/2 bg-gradient-to-b from-navy/10 via-navy/40 to-navy/10 md:left-1/2"
      />
      <ol className="relative space-y-6 md:space-y-2">
        {items.map((m, i) => {
          const { icon: Icon, label } = kindOf(m.milestone);
          // Cards alternate sides on desktop; the year sits across the spine.
          const cardLeft = i % 2 === 0;
          return (
            <Reveal key={`${m.year}-${i}`} delay={Math.min(i, 6) * 0.05}>
              <li className="group grid grid-cols-[3rem_minmax(0,1fr)] items-center gap-x-4 md:grid-cols-[minmax(0,1fr)_3.5rem_minmax(0,1fr)] md:gap-x-6">
                {/* Year (desktop) */}
                <div
                  className={cn(
                    "hidden md:block md:row-start-1",
                    cardLeft ? "md:col-start-3 md:text-left" : "md:col-start-1 md:text-right",
                  )}
                >
                  <div className="font-display text-4xl font-medium leading-none text-navy/80 transition-colors group-hover:text-crimson lg:text-5xl">
                    {m.year}
                  </div>
                </div>

                {/* Icon node on the spine */}
                <div className="col-start-1 row-start-1 flex justify-center md:col-start-2">
                  <span
                    className={cn(
                      "relative z-10 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-md ring-4 ring-paper-deep transition-all duration-300 group-hover:scale-110 group-hover:bg-crimson",
                      i === 0 ? "bg-crimson" : "bg-navy",
                    )}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                </div>

                {/* Card */}
                <div
                  className={cn(
                    "col-start-2 row-start-1",
                    cardLeft ? "md:col-start-1" : "md:col-start-3",
                  )}
                >
                  <div className="relative border border-line bg-surface p-5 shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-crimson/40 group-hover:shadow-md md:p-6">
                    {/* Pointer toward the spine */}
                    <span
                      aria-hidden
                      className={cn(
                        "absolute top-1/2 -left-[7px] h-3 w-3 -translate-y-1/2 rotate-45 border-b border-l border-line bg-surface transition-colors group-hover:border-crimson/40",
                        cardLeft &&
                          "md:left-auto md:-right-[7px] md:border-b-0 md:border-l-0 md:border-t md:border-r",
                      )}
                    />
                    {/* Accent that grows on hover */}
                    <span
                      aria-hidden
                      className="absolute left-0 top-0 h-0.5 w-10 bg-crimson transition-all duration-500 group-hover:w-full"
                    />
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-crimson">
                        {label}
                      </span>
                      <span className="font-display text-xl font-medium text-navy md:hidden">
                        {m.year}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-navy">{m.milestone}</p>
                  </div>
                </div>
              </li>
            </Reveal>
          );
        })}
      </ol>
    </div>
  );
}
