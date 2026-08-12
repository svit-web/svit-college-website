import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { HeroPhotoLayer } from "./HeroPhotoLayer";
import { DEFAULT_HERO_APPEARANCE, type HeroAppearance } from "@/lib/theme";

export function PageHero({
  title,
  accent,
  subtitle,
  crumbs,
  children,
  rightSlot,
  backgroundImage,
  appearance,
}: {
  title: string;
  accent?: string;
  subtitle?: string;
  crumbs?: { label: string; to?: string }[];
  children?: ReactNode;
  rightSlot?: ReactNode;
  /** Optional admin-uploaded background photo (e.g. campus life / contact hero). */
  backgroundImage?: string | null;
  /** Hero appearance settings — only needed when backgroundImage is set. */
  appearance?: HeroAppearance | null;
}) {
  return (
    <section className="relative overflow-hidden bg-navy text-white">
      {backgroundImage ? (
        <HeroPhotoLayer photos={[backgroundImage]} appearance={appearance ?? DEFAULT_HERO_APPEARANCE} />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,color-mix(in_oklab,var(--gold)_18%,transparent),transparent_50%),radial-gradient(circle_at_80%_80%,color-mix(in_oklab,var(--crimson)_20%,transparent),transparent_55%)]" />
      )}
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-crimson/20 blur-3xl" />
      <div className="container-page relative py-20 md:py-28">
        {crumbs && crumbs.length > 0 && (
          <nav className="mb-6 flex items-center gap-1.5 text-xs text-white/70">
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {c.to ? (
                  <Link href={c.to} className="hover:text-gold transition-colors">{c.label}</Link>
                ) : (
                  <span className="text-white">{c.label}</span>
                )}
                {i < crumbs.length - 1 && <ChevronRight className="h-3 w-3" />}
              </span>
            ))}
          </nav>
        )}
        <div className="flex items-center justify-between gap-10">
          <div className="max-w-4xl flex-1">
            {accent && (
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
                {accent}
              </div>
            )}
            <h1 className="font-display text-4xl md:text-6xl font-bold leading-[1.05]">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-5 text-base md:text-lg text-white/80 max-w-2xl leading-relaxed">
                {subtitle}
              </p>
            )}
            {children && <div className="mt-6">{children}</div>}
          </div>
          {rightSlot && (
            <div className="hidden shrink-0 lg:block">
              {rightSlot}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
