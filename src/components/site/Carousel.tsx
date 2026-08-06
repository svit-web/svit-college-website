import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CarouselSlide {
  image: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: { label: string; to: string };
}

interface Props {
  slides?: CarouselSlide[];
}

export function HomeCarousel({ slides: slidesProp }: Props = {}) {
  const slides = slidesProp && slidesProp.length > 0 ? slidesProp : [];
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  if (slides.length === 0) return null;

  const s = slides[index] ?? slides[0];
  return (
    <section
      className="relative overflow-hidden bg-navy-deep"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-[520px] md:h-[620px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <img src={s.image} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/90 via-navy-deep/70 to-transparent" />
          </motion.div>
        </AnimatePresence>

        <div className="container-page relative z-10 flex h-full items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="max-w-2xl text-white"
            >
              <div className="mb-4 inline-block rounded-full border border-gold/50 bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
                {s.eyebrow}
              </div>
              <h2 className="font-display text-4xl md:text-6xl font-bold leading-[1.05]">
                {s.title}
              </h2>
              <p className="mt-4 text-lg text-white/85">{s.subtitle}</p>
              <Link
                to={s.cta.to}
                className="mt-8 inline-flex items-center gap-2 rounded-md bg-gold px-6 py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-navy-deep hover:bg-gold-soft transition-colors"
              >
                {s.cta.label} <ChevronRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
          className="absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-white/30 bg-white/10 p-2 text-white backdrop-blur hover:bg-white/20 md:block"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => setIndex((i) => (i + 1) % slides.length)}
          className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-white/30 bg-white/10 p-2 text-white backdrop-blur hover:bg-white/20 md:block"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-8 bg-gold" : "w-3 bg-white/40 hover:bg-white/70"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
