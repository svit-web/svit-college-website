import type { Metadata } from "next";
import Link from "next/link";
import { PillTabs } from "@/components/site-next/PillTabs";
import { Reveal } from "@/components/site-next/Reveal";
import { SectionHeading } from "@/components/site-next/SectionHeading";
import { getAllEvents } from "@/lib/events.functions";

export const metadata: Metadata = {
  title: "Events — SVIT Vasad",
  description: "TEDx, Prakarsh, Spandan, Malhar and other flagship events at SVIT Vasad.",
};

function scopeLabel(event: { scope_type: string; college: { name: string } | null; department: { name: string } | null }) {
  if (event.scope_type === "department" && event.department) return event.department.name;
  if (event.scope_type === "college" && event.college) return event.college.name;
  return "Institute-wide";
}

export default async function EventsIndex() {
  const events = await getAllEvents().catch(() => []);

  return (
    <div>
      <PillTabs
        ariaLabel="Events"
        items={events.map((c) => ({ label: c.title.split("—")[0].trim(), to: `/campus-life/events/${c.slug}` }))}
      />
      <SectionHeading eyebrow="Events" title="Signature moments on campus" />
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((c, i) => (
          <Reveal key={c.slug} delay={i * 0.03}>
            <Link
              href={`/campus-life/events/${c.slug}`}
              className="card-lift block h-full rounded-2xl border-2 border-navy/15 bg-white p-5 hover:border-gold"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-bold uppercase tracking-widest text-crimson">{c.accent_color ?? c.tag}</div>
                <span className="rounded-full border border-navy/15 bg-navy/5 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-navy/70">
                  {scopeLabel(c)}
                </span>
              </div>
              <h4 className="mt-1 font-display font-bold text-navy">{c.title}</h4>
              <p className="mt-2 text-sm text-muted-foreground">{c.subtitle ?? c.description}</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
