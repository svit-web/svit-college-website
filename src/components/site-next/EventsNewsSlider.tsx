"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar, Image as ImageIcon } from "lucide-react";
import { circleIconButton } from "./site-styles";

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
      <div className="relative aspect-video w-full overflow-hidden bg-paper-deep">
        {slide.imageUrl ? (
          <Image
            src={slide.imageUrl}
            alt={slide.title}
            fill
            sizes="(max-width: 768px) 100vw, 340px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-mute">
            <ImageIcon className="h-10 w-10" aria-hidden />
          </div>
        )}
      </div>
      <div className="mt-4">
        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-crimson">{slide.tag}</div>
        <h3 className="mt-1.5 line-clamp-2 font-display text-lg font-medium leading-snug text-navy">
          {slide.title}
        </h3>
        {slide.date && (
          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-mute">
            <Calendar className="h-3.5 w-3.5" /> {slide.date}
          </div>
        )}
      </div>
    </>
  );

  const className = `group block h-full w-full border border-line bg-surface p-4 ${
    slide.slug ? "transition-colors duration-300 hover:border-navy hover:bg-paper-deep" : ""
  }`;

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
      <div className="flex h-64 items-center justify-center border border-line bg-surface text-sm text-ink-soft">
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
            className={`absolute left-0 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 bg-paper max-md:hidden ${circleIconButton}`}
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => go(1)}
            className={`absolute right-0 top-1/2 z-20 translate-x-1/2 -translate-y-1/2 bg-paper max-md:hidden ${circleIconButton}`}
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="mt-4 flex flex-wrap justify-center">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                className="group/dot flex h-11 items-center px-1"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all ${
                    i === index ? "w-8 bg-navy" : "w-3 bg-line-strong group-hover/dot:bg-ink-mute"
                  }`}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
