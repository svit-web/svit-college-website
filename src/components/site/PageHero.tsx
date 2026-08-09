import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { HeroPhotoLayer } from "./HeroPhotoLayer";
import { heroAppearanceQuery } from "@/lib/homepage";
import { DEFAULT_HERO_APPEARANCE } from "@/lib/theme.functions";

export function PageHero({
  title,
  accent,
  subtitle,
  crumbs,
  children,
  rightSlot,
  backgroundImage,
}: {
  title: string;
  accent?: string;
  subtitle?: string;
  crumbs?: { label: string; to?: string }[];
  children?: ReactNode;
  rightSlot?: ReactNode;
  /** Optional admin-uploaded background photo (e.g. campus life / contact hero). */
  backgroundImage?: string | null;
}) {
  const { data: appearance } = useQuery({ ...heroAppearanceQuery, enabled: !!backgroundImage });

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
                  <Link to={c.to} className="hover:text-gold transition-colors">{c.label}</Link>
                ) : (
                  <span className="text-white">{c.label}</span>
                )}
                {i < crumbs.length - 1 && <ChevronRight className="h-3 w-3" />}
              </span>
            ))}
          </nav>
        )}
        <div className="flex items-center justify-between gap-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
            className="max-w-4xl flex-1"
          >
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
          </motion.div>
          {rightSlot && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", bounce: 0, duration: 0.5, delay: 0.05 }}
              className="hidden shrink-0 lg:block"
            >
              {rightSlot}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
