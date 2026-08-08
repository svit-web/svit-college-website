import { useEffect, useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import type { PlacementTestimonial } from "@/lib/placement.functions";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase() || "?";
}

function Card({ testimonial: t }: { testimonial: PlacementTestimonial }) {
  return (
    <div className="block h-full w-full rounded-2xl border-2 border-navy/15 bg-white p-6 shadow-sm hover:border-navy transition-all relative overflow-hidden select-none flex flex-col justify-between">
      {/* Top star rating & quote mark */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-amber-400">
          {Array.from({ length: t.rating || 5 }).map((_, starIdx) => (
            <Star key={starIdx} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <Quote className="h-8 w-8 text-navy/15 shrink-0" />
      </div>

      {/* Quote text */}
      <div className="my-3">
        <p className="text-xs md:text-sm text-navy/85 leading-relaxed font-medium italic line-clamp-4">
          &ldquo;{t.quote}&rdquo;
        </p>
      </div>

      {/* Author details */}
      <div className="pt-3 border-t border-navy/10 flex items-center gap-3.5">
        {t.photoUrl ? (
          <img
            src={t.photoUrl}
            alt={t.studentName}
            className="h-10 w-10 shrink-0 rounded-full object-cover border-2 border-navy/20"
            loading="lazy"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy font-display text-xs font-bold text-gold">
            {initials(t.studentName)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="font-bold text-xs text-navy truncate">
            {t.studentName}
          </div>
          <div className="text-xs font-semibold text-crimson truncate">
            {t.designation} @ {t.companyName}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {t.departmentName} &bull; Batch {t.batchYear}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PlacementTestimonialsSlider({ items }: { items: PlacementTestimonial[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = items.length;

  useEffect(() => {
    if (paused || count <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 5000);
    return () => clearInterval(t);
  }, [paused, count]);

  if (count === 0) return null;

  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + count) % count);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60) go(1);
    else if (info.offset.x > 60) go(-1);
  };

  const relativePosition = (i: number) => {
    const diff = i - index;
    const wrapped = ((diff + count + count / 2) % count) - count / 2;
    return Math.round(wrapped);
  };

  return (
    <div
      className="relative max-w-5xl mx-auto py-2"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Desktop 3D coverflow */}
      <div className="relative hidden h-80 [perspective:1400px] md:block">
        {items.map((t, i) => {
          const pos = relativePosition(i);
          if (Math.abs(pos) > 1) return null;
          const isActive = pos === 0;
          return (
            <motion.div
              key={t.id || i}
              className="absolute inset-y-0 left-1/2 w-[350px] -translate-x-1/2 cursor-pointer"
              style={{ transformStyle: "preserve-3d" }}
              animate={{
                x: pos * 270,
                rotateY: pos * -35,
                scale: isActive ? 1 : 0.82,
                opacity: isActive ? 1 : 0.55,
                zIndex: isActive ? 10 : 5 - Math.abs(pos),
              }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => !isActive && setIndex(i)}
            >
              <Card testimonial={t} />
            </motion.div>
          );
        })}
      </div>

      {/* Mobile single card swipeable */}
      <div className="relative h-80 md:hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            className="absolute inset-0 px-2"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
          >
            <Card testimonial={items[index]} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      {count > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            className="absolute left-0 top-1/2 z-20 hidden -translate-x-1/2 -translate-y-1/2 rounded-full border border-navy/20 bg-white p-2.5 text-navy shadow-sm hover:bg-navy hover:text-white transition-all md:flex cursor-pointer"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => go(1)}
            className="absolute right-0 top-1/2 z-20 hidden translate-x-1/2 -translate-y-1/2 rounded-full border border-navy/20 bg-white p-2.5 text-navy shadow-sm hover:bg-navy hover:text-white transition-all md:flex cursor-pointer"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Indicators */}
          <div className="mt-6 flex justify-center gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  i === index ? "w-8 bg-crimson" : "w-3 bg-navy/15 hover:bg-navy/30"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
