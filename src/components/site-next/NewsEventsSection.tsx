"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { PillLink } from "./PillLink";
import { Reveal } from "./Reveal";
import { CurtainImage } from "./CurtainImage";
import { SplitHeading } from "./SplitHeading";
import { pillLink } from "./site-styles";
import type { EventRow, PostRow } from "@/lib/homepage";

// The card's whole area is already a link (see CardLink below), so "Read
// more" here is a decorative pill, not a nested <a> — a real link duplicates
// it and nested <a> tags are invalid HTML.
function ReadMorePill() {
  return (
    <span className={pillLink}>
      Read more
      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
    </span>
  );
}

// Makes the whole card clickable, not just the "Read more" pill. Renders a
// plain div when there's no href (e.g. an event without a Detail page).
function CardLink({
  href,
  className,
  children,
}: {
  href: string | null;
  className?: string;
  children: React.ReactNode;
}) {
  if (!href) return <div className={className}>{children}</div>;
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

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

// Only a real link when there's a page behind it — events can be featured
// without ever getting a Detail page (has_detail_page is admin-controlled,
// separate from is_featured). Linking regardless would send someone to a
// 404 on /campus-life/events/[slug] (that route calls notFound() when
// has_detail_page is false — see campus-life/events/[slug]/page.tsx).
function eventHref(event: { slug: string | null; has_detail_page?: boolean }) {
  return event.has_detail_page && event.slug ? `/campus-life/events/${event.slug}` : null;
}

// This is a homepage teaser, not the full list (that's what "All news &
// events" is for) — capped so a growing list doesn't make the section
// balloon.
const MAX_EVENTS_SHOWN = 4;
// A news row (image + title + summary) is taller than a compact event row,
// so matching *count* doesn't match *height* — 4 news rows next to 4 events
// (1 featured + 3 compact) measurably outgrows the events column. 3 news
// rows lines the two columns up much closer. Only applies when the events
// column is actually there to line up with; with no events, news gets the
// full width in a 2-column grid instead, where this isn't a concern.
const MAX_NEWS_SHOWN_BESIDE_EVENTS = 3;
const MAX_NEWS_SHOWN_ALONE = 4;

export function NewsEventsSection({ events, posts }: { events: EventRow[]; posts: PostRow[] }) {
  // Soonest first, so the event coming up next is the one featured — not
  // whichever one happens to be furthest in the future.
  const sortedEvents = [...(events ?? [])].sort(
    (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
  );
  const [featured, ...restEvents] = sortedEvents.slice(0, MAX_EVENTS_SHOWN);
  const newsItems = (posts ?? []).slice(
    0,
    featured ? MAX_NEWS_SHOWN_BESIDE_EVENTS : MAX_NEWS_SHOWN_ALONE,
  );

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

      <div
        className={
          featured
            ? "mt-10 grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] md:gap-0"
            : "mt-10 grid grid-cols-1 gap-10"
        }
      >
        {/* News column. No upcoming events to share the row with, so it gets
            the full width — laid out as a 2-column grid of compact cards
            instead of one narrow stacked list, to actually use that width. */}
        <div className={featured ? "md:pr-[clamp(1.5rem,3vw,3rem)]" : undefined}>
          {newsItems.length === 0 && (
            <p className="py-10 text-sm text-muted-foreground">
              No news posted yet — check back soon.
            </p>
          )}
          {featured ? (
            newsItems.map((item, i) => (
              <Reveal key={item.id} delay={i * 0.05}>
                <CardLink
                  href={`/news/${item.slug}`}
                  className="group grid gap-5 border-b border-border py-[clamp(1.8rem,3.5vw,2.6rem)] first:pt-0"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-4">
                    <h3 className="max-w-[28ch] font-display text-[clamp(1.25rem,2.2vw,1.75rem)] font-bold leading-[1.16] tracking-[-0.02em] text-navy transition-colors group-hover:text-crimson">
                      {item.title}
                    </h3>
                    {item.published_at && (
                      <time className="whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {formatDate(item.published_at)}
                      </time>
                    )}
                  </div>
                  <div className="grid grid-cols-1 items-start gap-[clamp(1.2rem,2.5vw,2.2rem)] md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
                    <div className="grid content-start justify-items-start gap-5 text-[0.95rem] text-muted-foreground">
                      {item.summary && <p className="line-clamp-3">{item.summary}</p>}
                      <ReadMorePill />
                    </div>
                    {item.card_photo_url && (
                      <CurtainImage
                        src={item.card_photo_url}
                        alt={item.title}
                        className="group aspect-video w-full"
                      />
                    )}
                  </div>
                </CardLink>
              </Reveal>
            ))
          ) : (
            <div className="grid grid-cols-1 gap-x-10 gap-y-[clamp(1.8rem,3.5vw,2.6rem)] sm:grid-cols-2">
              {newsItems.map((item, i) => (
                <Reveal key={item.id} delay={i * 0.05}>
                  <CardLink href={`/news/${item.slug}`} className="group grid gap-4">
                    {item.card_photo_url ? (
                      <CurtainImage
                        src={item.card_photo_url}
                        alt={item.title}
                        className="group aspect-video w-full"
                      />
                    ) : (
                      <div className="aspect-video w-full rounded-sm bg-paper-deep" aria-hidden />
                    )}
                    <div className="grid gap-2.5">
                      <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <h3 className="font-display text-[1.2rem] font-bold leading-[1.2] tracking-[-0.02em] text-navy transition-colors group-hover:text-crimson">
                          {item.title}
                        </h3>
                        {item.published_at && (
                          <time className="whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {formatDate(item.published_at)}
                          </time>
                        )}
                      </div>
                      {item.summary && (
                        <p className="line-clamp-3 text-[0.9rem] text-muted-foreground">
                          {item.summary}
                        </p>
                      )}
                      <ReadMorePill />
                    </div>
                  </CardLink>
                </Reveal>
              ))}
            </div>
          )}
        </div>

        {/* Events column */}
        {featured && (
          <aside className="border-t border-border pt-8 md:border-l md:border-t-0 md:pl-[clamp(1.5rem,3vw,3rem)] md:pt-0">
            <h3 className="pb-3 font-display text-2xl font-bold tracking-[-0.02em] text-navy">
              Upcoming <em className="font-medium italic">Events</em>
            </h3>

            <Reveal>
              <CardLink
                href={eventHref(featured)}
                className="group grid gap-3.5 border-b border-border pb-7"
              >
                {featured.card_photo_url ? (
                  <CurtainImage
                    src={featured.card_photo_url}
                    alt={featured.title}
                    className="group aspect-[4/3] w-full [&_img]:object-top"
                  />
                ) : (
                  <div className="aspect-[4/3] w-full rounded-sm bg-paper-deep" aria-hidden />
                )}
                <h4 className="font-display text-[1.08rem] font-bold leading-[1.3] tracking-[-0.01em] text-navy transition-colors group-hover:text-crimson">
                  {featured.title}
                </h4>
                <div className="flex items-center justify-between gap-4">
                  <time className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {formatDateRange(featured.start_date, featured.end_date)}
                  </time>
                  {eventHref(featured) && <ReadMorePill />}
                </div>
                {featured.description && (
                  <p className="line-clamp-3 text-[0.9rem] text-muted-foreground">
                    {featured.description}
                  </p>
                )}
              </CardLink>
            </Reveal>

            <ul>
              {restEvents.map((event, i) => (
                <Reveal key={event.id} delay={0.05 + i * 0.05}>
                  <li className="border-b border-border py-5 last:border-b-0">
                    <CardLink
                      href={eventHref(event)}
                      className="group grid grid-cols-[4.5rem_1fr] items-center gap-3.5"
                    >
                      {event.card_photo_url ? (
                        <CurtainImage
                          src={event.card_photo_url}
                          alt={event.title}
                          className="group aspect-square w-full"
                        />
                      ) : (
                        <div
                          className="aspect-square w-full rounded-sm bg-paper-deep"
                          aria-hidden
                        />
                      )}
                      <div className="grid gap-2.5">
                        <h4 className="font-display text-[1.08rem] font-bold leading-[1.3] tracking-[-0.01em] text-navy transition-colors group-hover:text-crimson">
                          {event.title}
                        </h4>
                        <div className="flex items-center justify-between gap-4">
                          <time className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {formatDate(event.start_date)}
                          </time>
                          {eventHref(event) && <ReadMorePill />}
                        </div>
                      </div>
                    </CardLink>
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
