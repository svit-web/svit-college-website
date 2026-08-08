import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { HeroPhotoLayer } from "./HeroPhotoLayer";
import { heroAppearanceQuery, miscSettingsQuery } from "@/lib/homepage";
import { DEFAULT_HERO_APPEARANCE } from "@/lib/theme.functions";
import { ABOUT_SECTIONS } from "@/lib/about-sections";
import { cn } from "@/lib/utils";

const route = getRouteApi("/about");

export function AboutLayout() {
  const { aboutPage: c } = route.useLoaderData();
  const { data: appearance } = useQuery(heroAppearanceQuery);
  const { data: misc } = useQuery(miscSettingsQuery);
  const resolvedAppearance = appearance ?? DEFAULT_HERO_APPEARANCE;
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy via-navy to-navy-deep text-white">
        <HeroPhotoLayer
          photos={resolvedAppearance.aboutPhoto ? [resolvedAppearance.aboutPhoto] : []}
          appearance={resolvedAppearance}
        />
        <div className="container-page relative py-14 md:py-20">
          <div className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              {c?.hero?.accent}
            </div>
            <h1 className="mt-3 font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              {c?.hero?.title}
            </h1>
            <p className="mt-6 text-base md:text-lg text-white/80 leading-relaxed">
              {c?.hero?.introText}
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wider text-white/70">
              <span className="rounded-full border border-white/20 bg-white/5 px-4 py-2">
                Est. {misc?.year_established}
              </span>
              <span className="rounded-full border border-white/20 bg-white/5 px-4 py-2">
                AICTE Approved
              </span>
              <span className="rounded-full border border-white/20 bg-white/5 px-4 py-2">
                NBA Accredited
              </span>
              <span className="rounded-full border border-white/20 bg-white/5 px-4 py-2">
                GTU Affiliated
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Vertical sidebar + content */}
      <div className="bg-secondary/30">
        <div className="container-page py-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
              <nav
                aria-label="About sections"
                className="rounded-2xl border-2 border-navy/15 bg-white p-3 shadow-sm"
              >
                <div className="px-3 pb-2 pt-1 text-xs font-bold uppercase tracking-widest text-crimson">
                  About SVIT
                </div>
                <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
                  {ABOUT_SECTIONS.map((s) => {
                    const isActive = pathname === s.to || pathname.startsWith(s.to + "/");
                    return (
                      <li key={s.to} className="shrink-0 lg:shrink">
                        <Link
                          to={s.to}
                          className={cn(
                            "flex items-center gap-2.5 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-all",
                            isActive
                              ? "border-gold bg-navy text-white shadow-sm"
                              : "border-transparent text-navy hover:border-navy/15 hover:bg-secondary/60"
                          )}
                        >
                          <span className="whitespace-nowrap lg:whitespace-normal">{s.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </aside>

            <div className="min-w-0">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
