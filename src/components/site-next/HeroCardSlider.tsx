'use client';

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
export interface HeroHighlight {
  id: string;
  image: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

interface Props {
  items?: HeroHighlight[];
}

export function HeroCardSlider({ items = [] }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = items.length;

  useEffect(() => {
    if (paused || count <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 4500);
    return () => clearInterval(t);
  }, [paused, count]);

  if (!count) return null;

  const next = (items[(index + 1) % count]) as HeroHighlight;
  const current = items[index] as HeroHighlight;

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Primary card — always visible */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/5 shadow-2xl backdrop-blur"
          >
            <div className="aspect-[4/5] w-full">
              <img src={current.image} alt={current.title} className="h-full w-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-navy-deep/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              {current.eyebrow && (
                <div className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-gold">
                  {current.eyebrow}
                </div>
              )}
              <div className="font-display text-lg font-bold leading-tight">{current.title}</div>
              {current.subtitle && (
                <div className="mt-1 text-xs text-white/80">{current.subtitle}</div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Secondary "peek" card — hidden on mobile */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`peek-${next.id}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 24 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4, delay: 0.05 }}
            className="relative hidden overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-xl backdrop-blur sm:block"
          >
            <div className="aspect-[4/5] w-full">
              <img src={next.image} alt={next.title} className="h-full w-full object-cover opacity-90" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/85 via-navy-deep/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              {next.eyebrow && (
                <div className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-gold/90">
                  {next.eyebrow}
                </div>
              )}
              <div className="font-display text-base font-bold leading-tight">{next.title}</div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="mt-5 flex items-center justify-between">
        <div className="flex gap-1.5">
          {items.map((it, i) => (
            <button
              key={it.id}
              onClick={() => setIndex(i)}
              aria-label={`Show ${it.title}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-8 bg-gold" : "w-3 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIndex((i) => (i - 1 + count) % count)}
            aria-label="Previous photo"
            className="rounded-full border border-white/25 bg-white/10 p-2 text-white backdrop-blur transition-[background-color,transform] duration-100 hover:bg-white/20 active:scale-90"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIndex((i) => (i + 1) % count)}
            aria-label="Next photo"
            className="rounded-full border border-white/25 bg-white/10 p-2 text-white backdrop-blur transition-[background-color,transform] duration-100 hover:bg-white/20 active:scale-90"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
