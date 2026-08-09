import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { getAllEvents } from "@/lib/events.functions";
import { Calendar } from "lucide-react";

function NewsSkeleton() {
  return (
    <>
      <div className="relative overflow-hidden bg-navy py-20 md:py-28">
        <div className="container-page">
          <div className="h-4 w-32 rounded bg-white/20 animate-pulse mb-4" />
          <div className="h-12 w-72 rounded bg-white/20 animate-pulse" />
          <div className="mt-4 h-4 w-96 rounded bg-white/10 animate-pulse" />
        </div>
      </div>
      <section className="container-page py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl border border-border bg-white p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="h-5 w-20 rounded-full bg-navy/8" />
                <div className="h-4 w-24 rounded bg-navy/8" />
              </div>
              <div className="mt-4 h-5 w-full rounded bg-navy/8" />
              <div className="mt-2 h-4 w-4/5 rounded bg-navy/8" />
              <div className="mt-1 h-4 w-3/5 rounded bg-navy/8" />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export const Route = createFileRoute("/news")({
  head: () => ({ meta: [{ title: "News & Events — SVIT Vasad" }] }),
  loader: async () => {
    const events = await getAllEvents();
    return { events };
  },
  pendingComponent: NewsSkeleton,
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
              <article className="card-lift h-full rounded-2xl border border-border bg-white p-6 hover:border-gold/50">
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
