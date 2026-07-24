import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { getAllEvents } from "@/lib/events.functions";
import { Calendar } from "lucide-react";

export const Route = createFileRoute("/news")({
  head: () => ({ meta: [{ title: "News & Events — SVIT Vasad" }] }),
  loader: async () => {
    const events = await getAllEvents();
    return { events };
  },
  component: News,
});

function News() {
  const { events } = Route.useLoaderData();
  return (
    <>
      <PageHero title="News & Events" accent="Latest at SVIT" subtitle="Announcements, event highlights and campus stories." crumbs={[{ label: "Home", to: "/" }, { label: "News" }]} />

      <section className="container-page py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((e, i) => (
            <Reveal key={e.id} delay={(i % 6) * 0.04}>
              <article className="card-lift h-full rounded-2xl border border-border bg-white p-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="rounded-full bg-navy/5 px-2.5 py-1 font-semibold uppercase tracking-widest text-navy">{e.tag}</span>
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(e.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-navy">{e.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{e.description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
