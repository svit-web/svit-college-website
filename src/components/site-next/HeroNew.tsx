import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { HomepageItem } from "@/lib/homepage";
import type { MiscSettings } from "@/lib/site-settings.functions";

interface HeroNewProps {
  items: HomepageItem[];
  misc: MiscSettings | null;
}

export function HeroNew({ items, misc }: HeroNewProps) {
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
  const imageUrl = hero?.image_url ||
    "https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/images/1785967226472-1d6hzb.webp";
  const imageAlt = (hero?.metadata as { image_alt?: string })?.image_alt || "The SVIT Vasad campus on the banks of the Mahi River";

  return (
    <section className="container-page pb-[clamp(2.6rem,6vw,5rem)] pt-[clamp(150px,18vh,200px)]">
      <div className="grid grid-cols-1 gap-[clamp(2.5rem,5vw,4.5rem)] lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:items-end">
        <div>
          <p className="inline-block text-[0.7rem] font-bold uppercase tracking-[0.22em] text-crimson">
            {eyebrow}
          </p>
          <h1 className="mt-[1.1rem] max-w-[16ch] text-[clamp(2.7rem,6.5vw,5.6rem)] font-bold leading-[0.98] tracking-[-0.038em]">
            {title}{" "}
            <em className="font-serif font-medium italic tracking-[-0.01em]">
              {titleAccent}
            </em>
          </h1>
        </div>

        <div className="grid justify-items-start gap-[1.4rem] border-ink/[0.14] pb-[0.4rem] lg:border-l lg:pl-[clamp(1.4rem,2.5vw,2.2rem)]">
          <p className="max-w-[34ch] text-[clamp(1rem,1.35vw,1.18rem)] font-medium leading-[1.55]">
            {subtitle}
          </p>
          <div className="flex flex-wrap gap-[0.7rem]">
            <Link
              href={primaryHref}
              className="group inline-flex items-center gap-[0.55rem] whitespace-nowrap rounded-full border border-ink bg-ink px-[1.25rem] py-[0.62rem] text-[0.84rem] font-semibold text-cream transition-all hover:bg-crimson hover:border-crimson"
            >
              {primaryLabel}
              <ArrowRight className="h-[14px] w-[14px] shrink-0 transition-transform group-hover:translate-x-[3px]" />
            </Link>
            <Link
              href={secondaryHref}
              className="group inline-flex items-center gap-[0.55rem] whitespace-nowrap rounded-full border border-line-strong px-[1.25rem] py-[0.62rem] text-[0.84rem] font-semibold transition-all hover:border-ink hover:bg-ink hover:text-cream"
            >
              {secondaryLabel}
              <ArrowRight className="h-[14px] w-[14px] shrink-0 transition-transform group-hover:translate-x-[3px]" />
            </Link>
          </div>
          <p className="text-[0.8rem] text-ink-mute">
            {heroNote}
          </p>
        </div>
      </div>

      <figure className="relative mt-[clamp(2.4rem,5vw,4rem)] aspect-[21/9] overflow-hidden rounded-[var(--radius)] bg-navy-deep">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80rem"
        />
      </figure>

      <div className="flex justify-between gap-4 pt-[0.85rem] text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-ink-mute">
        <span>Main Academic Block — 15+ acre green campus</span>
        <span className="hidden sm:inline">Vasad · Anand District · Gujarat</span>
      </div>
    </section>
  );
}
