'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar, Image as ImageIcon } from "lucide-react";

export interface EventSlide {
  id: string;
  slug: string | null;
  title: string;
  tag: string;
  date: string;
  imageUrl: string | null;
}

function Card({ slide }: { slide: EventSlide }) {
  const content = (
    <>
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-secondary/60">
        {slide.imageUrl ? (
          <img src={slide.imageUrl} alt={slide.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageIcon className="h-10 w-10" aria-hidden />
          </div>
        )}
      </div>
      <div className="mt-4">
        <div className="text-xs font-bold uppercase tracking-widest text-crimson">{slide.tag}</div>
        <h3 className="mt-1 font-display text-lg font-bold leading-snug text-navy line-clamp-2">{slide.title}</h3>
        {slide.date && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" /> {slide.date}
          </div>
        )}
      </div>
    </>
  );

  const className = "block h-full w-full rounded-2xl border border-border bg-white p-4 shadow-sm";

  return slide.slug ? (
    <Link href={`/campus-life/events/${slide.slug}`} className={className}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}

export function EventsNewsSlider({ items }: { items: EventSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = items.length;

  useEffect(() => {
    if (paused || count <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 5000);
    return () => clearInterval(t);
  }, [paused, count]);

  if (count === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-border bg-white text-sm text-muted-foreground">
        No events or news published yet.
      </div>
    );
  }

  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + count) % count);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60) go(1);
    else if (info.offset.x > 60) go(-1);
  };

  // Position of each slide relative to the active one: 0 = center, -1 = left neighbour, 1 = right neighbour, else hidden.
  const relativePosition = (i: number) => {
    const diff = i - index;
    const wrapped = ((diff + count + count / 2) % count) - count / 2;
    return Math.round(wrapped);
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Desktop: 3D coverflow */}
      <div className="relative hidden h-80 [perspective:1400px] md:block">
        {items.map((slide, i) => {
          const pos = relativePosition(i);
          if (Math.abs(pos) > 1) return null;
          const isActive = pos === 0;
          return (
            <motion.div
              key={slide.id}
              className="absolute inset-y-0 left-1/2 w-[340px] -translate-x-1/2 cursor-pointer"
              style={{ transformStyle: "preserve-3d" }}
              animate={{
                x: pos * 260,
                rotateY: pos * -35,
                scale: isActive ? 1 : 0.82,
                opacity: isActive ? 1 : 0.55,
                zIndex: isActive ? 10 : 5 - Math.abs(pos),
              }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              onClick={() => !isActive && setIndex(i)}
            >
              <Card slide={slide} />
            </motion.div>
          );
        })}
      </div>

      {/* Mobile: single card, swipeable */}
      <div className="relative h-80 md:hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ type: "spring", bounce: 0, duration: 0.35 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
          >
            <Card slide={items[index]} />
          </motion.div>
        </AnimatePresence>
      </div>

      {count > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            className="absolute left-0 top-1/2 z-20 hidden -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-white p-2 text-navy shadow-sm hover:bg-secondary active:scale-90 transition-[background-color,transform] duration-100 md:flex"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => go(1)}
            className="absolute right-0 top-1/2 z-20 hidden translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-white p-2 text-navy shadow-sm hover:bg-secondary active:scale-90 transition-[background-color,transform] duration-100 md:flex"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="mt-6 flex justify-center gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-8 bg-crimson" : "w-3 bg-navy/15 hover:bg-navy/30"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
