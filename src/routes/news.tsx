import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { events as staticEvents } from "@/data/site";
import { useSupabaseEvents, useSupabasePosts } from "@/hooks/useSupabaseData";
import { Calendar } from "lucide-react";

export const Route = createFileRoute("/news")({
  head: () => ({ meta: [{ title: "News & Events — SVIT Vasad" }] }),
  component: News,
});

function News() {
  const { data: dbEvents } = useSupabaseEvents();
  const { data: dbPosts } = useSupabasePosts();

  const formattedEvents =
    dbEvents && dbEvents.length > 0
      ? dbEvents.map((e: any) => ({
          tag: e.tag || "Event",
          date: e.start_date ? new Date(e.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Upcoming",
          title: e.title,
          excerpt: e.description || "SVIT campus announcement and news update.",
        }))
      : staticEvents;

  const formattedPosts =
    dbPosts && dbPosts.length > 0
      ? dbPosts.map((p: any) => ({
          tag: "News",
          date: p.published_at ? new Date(p.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent",
          title: p.title,
          excerpt: p.excerpt || p.content || "News update from SVIT Vasad.",
        }))
      : [];

  const items = [...formattedEvents, ...formattedPosts];

  return (
    <>
      <PageHero title="News & Events" accent="Latest at SVIT" subtitle="Announcements, event highlights and campus stories." crumbs={[{ label: "Home", to: "/" }, { label: "News" }]} />

      <section className="container-page py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((e, i) => (
            <Reveal key={i} delay={(i % 6) * 0.04}>
              <article className="card-lift h-full rounded-2xl border border-border bg-white p-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="rounded-full bg-navy/5 px-2.5 py-1 font-semibold uppercase tracking-widest text-navy">{e.tag}</span>
                  <span className="inline-flex items-center gap-1 text-muted-foreground"><Calendar className="h-3 w-3" /> {e.date}</span>
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-navy">{e.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{e.excerpt}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
