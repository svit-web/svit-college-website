import { createFileRoute } from "@tanstack/react-router";
import { PillTabs } from "@/components/site/PillTabs";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { getAllEvents } from "@/lib/events.functions";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/campus-life/events/")({
  head: () => ({
    meta: [
      { title: "Events — SVIT Vasad" },
      { name: "description", content: "TEDx, Prakarsh, Spandan, Malhar and other flagship events at SVIT Vasad." },
    ],
  }),
  loader: async () => {
    const events = await getAllEvents();
    return { events };
  },
  component: EventsIndex,
});

function scopeLabel(event: { scope_type: string; college: { name: string } | null; department: { name: string } | null }) {
  if (event.scope_type === "department" && event.department) return event.department.name;
  if (event.scope_type === "college" && event.college) return event.college.name;
  return "Institute-wide";
}

function EventsIndex() {
  const { events } = Route.useLoaderData();
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
              to="/campus-life/events/$slug"
              params={{ slug: c.slug }}
              className="card-lift block h-full rounded-2xl border-2 border-navy/15 bg-white p-5 hover:border-gold"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-[10px] font-bold uppercase tracking-widest text-crimson">{c.metadata?.accent ?? c.tag}</div>
                <span className="rounded-full border border-navy/15 bg-navy/5 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-navy/70">
                  {scopeLabel(c)}
                </span>
              </div>
              <h4 className="mt-1 font-display font-bold text-navy">{c.title}</h4>
              <p className="mt-2 text-sm text-muted-foreground">{c.metadata?.subtitle ?? c.description}</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
