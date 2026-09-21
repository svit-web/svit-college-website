"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { HomepageItem } from "@/lib/homepage";
import type { MiscSettings } from "@/lib/site-settings.functions";
import { HeroPhotoLayer } from "@/components/site-next/HeroPhotoLayer";
import { HOMEPAGE_ROTATE_MS, type HeroAppearance } from "@/lib/theme.functions";

const DEFAULT_IMAGE_URL =
  "https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/images/1785967226472-1d6hzb.webp";

interface HeroNewProps {
  items: HomepageItem[];
  misc: MiscSettings | null;
  appearance: HeroAppearance;
}

/**
 * Split hero: photo (or slideshow) fills its own column/band, text sits
 * alongside it. Unlike the site's other heroes, no text is ever rendered on
 * top of the photo, so it renders HeroPhotoLayer with overlay={false}.
 */
export function HeroNew({ items, misc, appearance }: HeroNewProps) {
  const hero = items.find((item) => item.item_type === "hero");

  const eyebrow = hero?.eyebrow ||
    (misc?.year_established ? `Est. ${misc.year_established} · Vasad, Gujarat` : "Vasad, Gujarat");
  const title = hero?.title || "Sardar Vallabhbhai Patel Institute of";
  const titleAccent = hero?.title_accent || "Technology";
  const subtitle = hero?.subtitle ||
    "A premier AICTE-approved institute on the banks of the Mahi River — shaping engineers, technologists, architects and nurses for nearly three decades.";
  const primaryLabel = hero?.link_label ?? "Apply Now 2026–27";
  const primaryHref = hero?.link_href ?? "/admissions/inquiry";
  const secondaryLabel = "Explore Courses";
  const secondaryHref = "/colleges";
  const heroNote = `95%+ placement record · ${misc?.recruiter_count || "200+"}+ recruiting partners`;
  const imageAlt = (hero?.metadata as { image_alt?: string })?.image_alt || "The SVIT Vasad campus on the banks of the Mahi River";
  const photos = appearance.homepagePhotos.length > 0 ? appearance.homepagePhotos : [hero?.image_url || DEFAULT_IMAGE_URL];
  const [photoLoaded, setPhotoLoaded] = useState(false);

  return (
    <section
      className="relative min-h-[640px] w-full overflow-hidden lg:h-[100vh]"
      style={{ ["--hero-offset" as never]: "clamp(150px,18vh,200px)" }}
    >
      {/* Full-bleed photo. Backed by cream (not navy) so an unloaded/broken photo reads as blank space, not a broken-looking dark panel; the gradient/blur chrome that assumes a photo underneath only mounts once one has actually loaded. */}
      <div className="absolute inset-0 bg-cream">
        <HeroPhotoLayer
          photos={photos}
          appearance={appearance}
          rotateMs={HOMEPAGE_ROTATE_MS}
          overlay={false}
          transition="marquee"
          alt={imageAlt}
          onLoad={() => setPhotoLoaded(true)}
        />
        {photoLoaded && (
          <>
            {/* Left-to-right gradient, faded to nothing by the horizontal midpoint, so the right half of the photo stays clear while the text on the left stays readable. Backdrop-blur is masked with the same falloff so the photo softens under the gradient without blurring the clear right half. */}
            <div
              className="absolute inset-0"
              style={{
                backdropFilter: `blur(${appearance.homepageBlurPx}px)`,
                WebkitBackdropFilter: `blur(${appearance.homepageBlurPx}px)`,
                WebkitMaskImage: "linear-gradient(to right, black 0%, black 32%, transparent 50%)",
                maskImage: "linear-gradient(to right, black 0%, black 32%, transparent 50%)",
              }}
            />
            <div 
              className="absolute inset-0" 
              style={{
                background: `linear-gradient(to right, rgba(251, 248, 241, ${appearance.homepageGradientOpacity / 100}) 0%, rgba(251, 248, 241, ${appearance.homepageGradientOpacity / 100 * 0.87}) 16%, rgba(251, 248, 241, ${appearance.homepageGradientOpacity / 100 * 0.51}) 32%, transparent 50%)`
              }}
            />
            {/* Cream fade at the very top so the full-bleed photo blends into the floating navbar card */}
            <div
              className="absolute inset-x-0 top-0 h-32 lg:h-40"
              style={{
                backdropFilter: `blur(${appearance.homepageBlurPx}px)`,
                WebkitBackdropFilter: `blur(${appearance.homepageBlurPx}px)`,
                WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
                maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
              }}
            />
            <div 
              className="absolute inset-x-0 top-0 h-32 lg:h-40" 
              style={{
                background: `linear-gradient(to bottom, rgba(251, 248, 241, ${appearance.homepageGradientOpacity / 100 * 0.82}) 0%, transparent 100%)`
              }}
            />
          </>
        )}
      </div>

      <div className="container-page relative flex h-full flex-col justify-between pb-[clamp(1.6rem,4vw,2.75rem)] pt-[88px] lg:pt-[var(--hero-offset)]">
        <div className="mr-auto max-w-[36ch] pt-[1.5rem] text-left lg:pt-[2.5rem]">
          <p className="inline-block text-[0.7rem] font-bold uppercase tracking-[0.22em] text-crimson">
            {eyebrow}
          </p>
          <h1 className="mt-[1.1rem] text-[clamp(1.9rem,3.6vw,3.3rem)] font-bold leading-[1.02] tracking-[-0.035em] text-ink">
            {title}{" "}
            <em className="font-serif font-medium italic tracking-[-0.01em]">
              {titleAccent}
            </em>
          </h1>
        </div>

        <div className="mr-auto grid max-w-[36ch] justify-items-start gap-[1.4rem] text-left">
          <p className="text-[clamp(1rem,1.35vw,1.18rem)] font-medium leading-[1.55] text-ink">
            {subtitle}
          </p>
          <div className="flex flex-wrap justify-start gap-[0.7rem]">
            <Link
              href={primaryHref}
              className="group inline-flex items-center gap-[0.55rem] whitespace-nowrap rounded-full border border-ink bg-ink px-[1.25rem] py-[0.62rem] text-[0.84rem] font-semibold text-cream transition-all hover:bg-crimson hover:border-crimson"
            >
              {primaryLabel}
              <ArrowRight className="h-[14px] w-[14px] shrink-0 transition-transform group-hover:translate-x-[3px]" />
            </Link>
            <Link
              href={secondaryHref}
              className="group inline-flex items-center gap-[0.55rem] whitespace-nowrap rounded-full border border-line-strong px-[1.25rem] py-[0.62rem] text-[0.84rem] font-semibold text-ink transition-all hover:border-ink hover:bg-ink hover:text-cream"
            >
              {secondaryLabel}
              <ArrowRight className="h-[14px] w-[14px] shrink-0 transition-transform group-hover:translate-x-[3px]" />
            </Link>
          </div>
          <p className="text-[0.8rem] text-ink-mute">
            {heroNote}
          </p>
        </div>

        <div className="flex shrink-0 justify-between gap-4 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-ink-mute">
          <span>Main Academic Block — 15+ acre green campus</span>
          <span className="hidden sm:inline">Vasad · Anand District · Gujarat</span>
        </div>
      </div>
    </section>
  );
}
