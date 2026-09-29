"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { pillPrimary, sectionSpacing } from "./site-styles";

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

const arrowButton =
  "hidden h-10 w-10 items-center justify-center rounded-full border border-line-strong text-ink transition-colors hover:border-ink hover:bg-ink hover:text-cream md:inline-flex";

// Split layout (like the homepage hero): the photo and the text occupy separate
// regions, so photos are shown untinted and text stays legible on any upload.
export function HomeCarousel({ slides: slidesProp }: Props = {}) {
  const slides = slidesProp && slidesProp.length > 0 ? slidesProp : [];
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  if (slides.length === 0) return null;

  const go = (delta: number) => setIndex((i) => (i + delta + slides.length) % slides.length);
  const s = slides[index] ?? slides[0];

  return (
    <section
      className={`border-y border-line bg-paper ${sectionSpacing}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="container-page grid items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
        <div
          className="relative aspect-[4/3] overflow-hidden border border-line bg-paper-deep"
          onTouchStart={(e) => {
            touchX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            touchX.current = null;
            if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          }}
        >
          <AnimatePresence initial={false}>
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              {s.image && (
                <Image
                  src={s.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  priority={index === 0}
                  className="object-cover"
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="md:order-first">
          {/* All slides share one grid cell so the block keeps the tallest slide's
              height and the page doesn't jump as slides rotate. */}
          <div className="grid">
            {slides.map((slide, i) => (
              <div
                key={i}
                aria-hidden={i !== index}
                className={`[grid-area:1/1] transition-[opacity,transform,visibility] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  i === index
                    ? "visible translate-y-0 opacity-100"
                    : "invisible translate-y-3 opacity-0"
                }`}
              >
                {slide.eyebrow && (
                  <div className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-crimson">
                    {slide.eyebrow}
                  </div>
                )}
                <h2 className="font-display text-[clamp(2rem,4.2vw,3.3rem)] font-medium leading-[1.1] tracking-[-0.01em] text-navy">
                  {slide.title}
                </h2>
                {slide.subtitle && (
                  <p className="mt-4 text-base leading-relaxed text-ink-soft md:text-lg">
                    {slide.subtitle}
                  </p>
                )}
                <Link href={slide.cta.to} className={`mt-8 w-full sm:w-auto ${pillPrimary}`}>
                  {slide.cta.label}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            ))}
          </div>

          {slides.length > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4 md:mt-10 md:justify-start">
              <button
                type="button"
                onClick={() => go(-1)}
                className={arrowButton}
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    aria-current={i === index}
                    className={`h-1.5 rounded-full transition-all ${
                      i === index ? "w-8 bg-navy" : "w-3 bg-line-strong hover:bg-ink-mute"
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => go(1)}
                className={arrowButton}
                aria-label="Next slide"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
