import { createFileRoute, Link } from "@tanstack/react-router";
import { PillTabs } from "@/components/site/PillTabs";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { eventDetails as staticEventDetails } from "@/data/campus-rfe";
import { useSupabaseEvents } from "@/hooks/useSupabaseData";

export const Route = createFileRoute("/campus-life/events/")({
  head: () => ({
    meta: [
      { title: "Events — SVIT Vasad" },
      { name: "description", content: "TEDx, Prakarsh, Spandan, Malhar and other flagship events at SVIT Vasad." },
    ],
  }),
  component: EventsIndex,
});

function EventsIndex() {
  const { data: dbEvents } = useSupabaseEvents();
  const eventList =
    dbEvents && dbEvents.length > 0
      ? dbEvents.map((e: any) => ({
          slug: e.slug || e.title.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          accent: e.tag || "Event",
          title: e.title,
          subtitle: e.description || "Campus event at SVIT Vasad.",
        }))
      : staticEventDetails;

  return (
    <div>
      <PillTabs
        ariaLabel="Events"
        items={eventList.map((c) => ({ label: c.title.split("—")[0].trim(), to: `/campus-life/events/${c.slug}` }))}
      />
      <SectionHeading eyebrow="Events" title="Signature moments on campus" />
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {eventList.map((c, i) => (
          <Reveal key={c.slug} delay={i * 0.03}>
            <Link
              to="/campus-life/events/$slug"
              params={{ slug: c.slug }}
              className="card-lift block h-full rounded-2xl border-2 border-navy/15 bg-white p-5 hover:border-gold"
            >
              <div className="text-[10px] font-bold uppercase tracking-widest text-crimson">{c.accent}</div>
              <h4 className="mt-1 font-display font-bold text-navy">{c.title}</h4>
              <p className="mt-2 text-sm text-muted-foreground">{c.subtitle}</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
