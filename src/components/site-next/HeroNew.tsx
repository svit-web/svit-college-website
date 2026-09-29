"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { HomepageItem } from "@/lib/homepage";
import type { MiscSettings } from "@/lib/site-settings.functions";
import { HeroPhotoLayer } from "@/components/site-next/HeroPhotoLayer";
import { pillOutline, pillPrimary } from "@/components/site-next/site-styles";
import { HOMEPAGE_ROTATE_MS, heroFadeStyles, heroTextVars, type HeroAppearance } from "@/lib/theme.functions";

const DEFAULT_IMAGE_URL =
  "https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/images/1785967226472-1d6hzb.webp";

interface HeroNewProps {
  items: HomepageItem[];
  misc: MiscSettings | null;
  appearance: HeroAppearance;
}

/**
 * Homepage hero: full-bleed photo marquee with the text on a paper fade down
 * the left side. Photo Visibility and the overlay tint apply via
 * HeroPhotoLayer; the whole-photo Background Blur does not (overlayBlur off) —
 * the fade carries its own masked blur (Homepage Blur).
 */
export function HeroNew({ items, misc, appearance }: HeroNewProps) {
  const hero = items.find((item) => item.item_type === "hero");

  const eyebrow = hero?.eyebrow ||
    (misc?.year_established ? `Est. ${misc.year_established} · Vasad, Gujarat` : "Vasad, Gujarat");
  const title = hero?.title || "Sardar Vallabhbhai Patel Institute of";
  const titleAccent = hero?.title_accent || "Technology";
  const subtitle = hero?.subtitle ||
    "A premier AICTE-approved institute on the banks of the Mahi River — shaping engineers, technologists, architects and nurses for nearly three decades.";
  const primaryLabel = hero?.link_label ?? "Enquire Now";
  const primaryHref = hero?.link_href ?? "/admissions/inquiry";
  const secondaryLabel = "Explore Courses";
  const secondaryHref = "/colleges";
  const heroNote = `95%+ placement record · ${misc?.recruiter_count || "200+"}+ recruiting partners`;
  const imageAlt = (hero?.metadata as { image_alt?: string })?.image_alt || "The SVIT Vasad campus on the banks of the Mahi River";
  const photos = appearance.homepagePhotos.length > 0 ? appearance.homepagePhotos : [hero?.image_url || DEFAULT_IMAGE_URL];
  const [photoLoaded, setPhotoLoaded] = useState(false);
  const fade = heroFadeStyles(appearance);

  return (
    <section
      className="relative min-h-[640px] w-full overflow-hidden lg:h-[100vh]"
      style={{ ["--hero-offset" as never]: "clamp(150px,18vh,200px)", ...heroTextVars(appearance) }}
    >
      {/* Full-bleed photo. Backed by cream (not navy) so an unloaded/broken photo reads as blank space, not a broken-looking dark panel; the gradient/blur chrome that assumes a photo underneath only mounts once one has actually loaded. */}
      <div className="absolute inset-0 bg-cream">
        <HeroPhotoLayer
          photos={photos}
          appearance={appearance}
          rotateMs={HOMEPAGE_ROTATE_MS}
          overlayBlur={false}
          transition="marquee"
          alt={imageAlt}
          onLoad={() => setPhotoLoaded(true)}
        />
        {photoLoaded && (
          <>
            {/* Left-to-right paper fade (with a matching masked blur) that clears by the horizontal midpoint, plus a short top fade into the floating navbar. Shared with the college heroes via heroFadeStyles(). */}
            <div className="absolute inset-0" style={fade.sideBlur} />
            <div className="absolute inset-0" style={fade.sideGradient} />
            <div className="absolute inset-x-0 top-0 h-32 lg:h-40" style={fade.topBlur} />
            <div className="absolute inset-x-0 top-0 h-32 lg:h-40" style={fade.topGradient} />
          </>
        )}
      </div>

      <div className="container-page relative flex h-full flex-col justify-between pb-[clamp(1.6rem,4vw,2.75rem)] pt-[88px] lg:pt-[var(--hero-offset)]">
        <div className="mr-auto max-w-[36ch] pt-[1.5rem] text-left lg:pt-[2.5rem]">
          <p className="inline-block text-[0.7rem] font-bold uppercase tracking-[0.22em] text-crimson">
            {eyebrow}
          </p>
          <h1 className="mt-[1.1rem] text-[clamp(1.9rem,3.6vw,3.3rem)] font-bold leading-[1.02] tracking-[-0.035em] text-[var(--hero-text)]">
            {title}{" "}
            <em className="font-serif font-medium italic tracking-[-0.01em]">
              {titleAccent}
            </em>
          </h1>
        </div>

        <div className="mr-auto grid max-w-[36ch] justify-items-start gap-[1.4rem] text-left">
          <p className="text-[clamp(1rem,1.35vw,1.18rem)] font-medium leading-[1.55] text-[var(--hero-text)]">
            {subtitle}
          </p>
          <div className="flex flex-wrap justify-start gap-[0.7rem]">
            <Link
              href={primaryHref}
              className={pillPrimary}
            >
              {primaryLabel}
              <ArrowRight className="h-[14px] w-[14px] shrink-0 transition-transform group-hover:translate-x-[3px]" />
            </Link>
            <Link
              href={secondaryHref}
              className={pillOutline}
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
