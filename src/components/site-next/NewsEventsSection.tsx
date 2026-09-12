"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Reveal } from "./Reveal";
import { CurtainImage } from "./CurtainImage";
import { SplitHeading } from "./SplitHeading";
import type { EventRow } from "@/lib/homepage";

const EVENT_TAGS = new Set(["Event", "Culture"]);

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateRange(start: string, end: string | null): string {
  if (!end || end === start) return formatDate(start);
  const s = new Date(start);
  const e = new Date(end);
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  if (sameMonth) {
    return `${s.getDate()}–${e.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
  }
  return `${formatDate(start)} – ${formatDate(end)}`;
}

function splitEvents(events: EventRow[]) {
  const newsItems = events.filter((e) => !EVENT_TAGS.has(e.tag ?? ""));
  const eventItems = [...events]
    .filter((e) => EVENT_TAGS.has(e.tag ?? ""))
    .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
  const [featured, ...restEvents] = eventItems;
  return { newsItems, featured: featured ?? null, restEvents };
}

function PillLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-navy transition-colors hover:border-navy hover:bg-navy hover:text-white"
    >
      {children}
      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

function eventHref(slug: string | null) {
  return slug ? `/campus-life/events/${slug}` : "/campus-life/events";
}

export function NewsEventsSection({ events }: { events: EventRow[] }) {
  const { newsItems, featured, restEvents } = splitEvents(events ?? []);

  if (newsItems.length === 0 && !featured) return null;

  return (
    <section className="container-page py-20">
      <div className="relative pb-6">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-crimson">
          Latest from campus
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-x-8 gap-y-6">
          <SplitHeading
            parts={[
              { text: "News &" },
              { text: "Events", className: "font-display italic font-medium" },
            ]}
            className="font-display text-[clamp(2.1rem,4.6vw,3.6rem)] font-bold leading-[1.04] tracking-[-0.035em] text-navy"
          />
          <PillLink href="/campus-life/events">All news &amp; events</PillLink>
        </div>
        <motion.span
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.9 }}
          transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1] }}
          style={{ transformOrigin: "0 50%" }}
          className="absolute inset-x-0 bottom-0 h-px bg-border"
        />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] md:gap-0">
        {/* News column */}
        <div className="md:pr-[clamp(1.5rem,3vw,3rem)]">
          {newsItems.map((item, i) => (
            <Reveal key={item.id} delay={i * 0.05}>
              <article className="grid gap-5 border-b border-border py-[clamp(1.8rem,3.5vw,2.6rem)] first:pt-0">
                <div className="flex flex-wrap items-baseline justify-between gap-4">
                  <h3 className="max-w-[28ch] font-display text-[clamp(1.25rem,2.2vw,1.75rem)] font-bold leading-[1.16] tracking-[-0.02em] text-navy">
                    {item.title}
                  </h3>
                  <time className="whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {formatDate(item.start_date)}
                  </time>
                </div>
                <div className="grid grid-cols-1 items-start gap-[clamp(1.2rem,2.5vw,2.2rem)] md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
                  <div className="grid content-start justify-items-start gap-5 text-[0.95rem] text-muted-foreground">
                    {item.description && <p>{item.description}</p>}
                    <PillLink href={eventHref(item.slug)}>Read more</PillLink>
                  </div>
                  {item.featured_image_url && (
                    <CurtainImage
                      src={item.featured_image_url}
                      alt={item.title}
                      className="group aspect-video w-full rounded-xl"
                    />
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Events column */}
        {featured && (
          <aside className="border-t border-border pt-8 md:border-l md:border-t-0 md:pl-[clamp(1.5rem,3vw,3rem)] md:pt-0">
            <h3 className="pb-3 font-display text-2xl font-bold tracking-[-0.02em] text-navy">
              Upcoming <em className="font-medium italic">Events</em>
            </h3>

            <Reveal>
              <article className="grid gap-3.5 border-b border-border pb-7">
                <CurtainImage
                  src={featured.featured_image_url ?? ""}
                  alt={featured.title}
                  className="group aspect-[4/3] w-full rounded-xl [&_img]:object-top"
                />
                <h4 className="font-display text-[1.08rem] font-bold leading-[1.3] tracking-[-0.01em] text-navy">
                  {featured.title}
                </h4>
                <div className="flex items-center justify-between gap-4">
                  <time className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {formatDateRange(featured.start_date, featured.end_date)}
                  </time>
                  <PillLink href={eventHref(featured.slug)}>Read more</PillLink>
                </div>
                {featured.description && (
                  <p className="text-[0.9rem] text-muted-foreground">{featured.description}</p>
                )}
              </article>
            </Reveal>

            <ul>
              {restEvents.map((event, i) => (
                <Reveal key={event.id} delay={0.05 + i * 0.05}>
                  <li className="grid gap-2.5 border-b border-border py-5 last:border-b-0">
                    <h4 className="font-display text-[1.08rem] font-bold leading-[1.3] tracking-[-0.01em] text-navy">
                      {event.title}
                    </h4>
                    <div className="flex items-center justify-between gap-4">
                      <time className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {formatDate(event.start_date)}
                      </time>
                      <PillLink href={eventHref(event.slug)}>Read more</PillLink>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </section>
  );
}
