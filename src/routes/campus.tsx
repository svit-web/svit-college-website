import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import { getAllFacilities, type Facility } from "@/lib/facilities.functions";
import { getSports, getSportsAchievements, type Sport, type SportAchievement } from "@/lib/sports.functions";
import campusHero from "@/assets/campus-hero.jpg";
import campusAerial from "@/assets/campus-aerial.jpg";
import { Trophy, Medal, Star, Users } from "lucide-react";

export const Route = createFileRoute("/campus")({
  head: () => ({ meta: [{ title: "Explore The Campus — SVIT Vasad" }] }),
  loader: async () => {
    const [facilities, sports, achievements] = await Promise.all([
      getAllFacilities(),
      getSports(),
      getSportsAchievements(),
    ]);
    return { facilities, sports, achievements };
  },
  component: Campus,
});

const CATEGORY_LABEL: Record<string, string> = {
  outdoor: "Outdoor",
  indoor: "Indoor",
  aquatic: "Aquatic",
  combat: "Combat",
};

const CATEGORY_COLOR: Record<string, string> = {
  outdoor: "bg-emerald-100 text-emerald-700",
  indoor:  "bg-sky-100 text-sky-700",
  aquatic: "bg-cyan-100 text-cyan-700",
  combat:  "bg-orange-100 text-orange-700",
};

const LEVEL_CONFIG: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  international: { label: "International", color: "bg-purple-600 text-white", icon: Star },
  national:      { label: "National",      color: "bg-gold text-navy-deep",   icon: Trophy },
  state:         { label: "State",         color: "bg-navy text-white",        icon: Medal },
  university:    { label: "University",    color: "bg-emerald-600 text-white", icon: Users },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

function Campus() {
  const { facilities, sports, achievements } = Route.useLoaderData();

  // Split facilities by category for better organization
  const academicFacilities = facilities.filter((f) => f.category === "academic");
  const wellnessFacilities = facilities.filter((f) => f.category === "wellness");
  const amenityFacilities  = facilities.filter((f) => f.category === "amenity");
  const hostelFacilities   = facilities.filter((f) => f.category === "hostel");
  const sportsFacilities   = facilities.filter((f) => f.category === "sports");

  return (
    <>
      <PageHero
        title="Explore The Campus"
        accent="15+ Acres · Green Campus"
        subtitle="A living, learning environment with modern labs, hostels, sports and green open spaces."
        crumbs={[{ label: "Home", to: "/" }, { label: "Campus" }]}
      />

      {/* Hero images */}
      <section className="container-page py-20">
        <div className="grid gap-6 md:grid-cols-2">
          <img src={campusHero}   alt="Campus"  className="rounded-2xl object-cover w-full h-72 md:h-96" loading="lazy" />
          <img src={campusAerial} alt="Aerial"  className="rounded-2xl object-cover w-full h-72 md:h-96" loading="lazy" />
        </div>
      </section>

      {/* Academic Facilities */}
      {academicFacilities.length > 0 && (
        <section className="bg-secondary/50 py-20">
          <div className="container-page">
            <SectionHeading center eyebrow="Academic" title="World-Class Learning Infrastructure" />
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {academicFacilities.map((f, i) => (
                <Reveal key={f.id} delay={i * 0.04}>
                  <div className="card-lift h-full rounded-2xl border border-border bg-white p-6">
                    <h4 className="font-display font-bold text-navy">{f.name}</h4>
                    <p className="mt-2 text-sm text-muted-foreground">{f.description ?? f.subtitle ?? ""}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Wellness & Student Support */}
      {wellnessFacilities.length > 0 && (
        <section className="container-page py-20">
          <SectionHeading center eyebrow="Wellness" title="Your Health & Well-Being Matter" />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {wellnessFacilities.map((f, i) => (
              <Reveal key={f.id} delay={i * 0.04}>
                <div className="card-lift h-full rounded-2xl border-2 border-emerald-100 bg-white p-6">
                  {f.accent_color && (
                    <div className="mb-3 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                      {f.accent_color}
                    </div>
                  )}
                  <h4 className="font-display text-lg font-bold text-navy">{f.name}</h4>
                  {f.subtitle && (
                    <p className="mt-1 text-xs font-semibold text-crimson">{f.subtitle}</p>
                  )}
                  <p className="mt-3 text-sm text-muted-foreground">{f.description ?? ""}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Campus Amenities */}
      {amenityFacilities.length > 0 && (
        <section className="bg-secondary/50 py-20">
          <div className="container-page">
            <SectionHeading center eyebrow="Amenities" title="Everyday Conveniences On Campus" />
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {amenityFacilities.map((f, i) => (
                <Reveal key={f.id} delay={i * 0.04}>
                  <div className="card-lift h-full rounded-2xl border border-border bg-white p-5">
                    <h4 className="font-display text-base font-bold text-navy">{f.name}</h4>
                    {f.subtitle && (
                      <p className="mt-1 text-xs font-semibold text-slate-500">{f.subtitle}</p>
                    )}
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{f.description ?? ""}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Hostel & Living */}
      <section className="container-page py-20">
        <SectionHeading center eyebrow="Hostel & Living" title="A home away from home" />
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {hostelFacilities.length > 0 ? (
            hostelFacilities.map((h, i) => (
              <Reveal key={h.id} delay={i * 0.05}>
                <div className="card-lift rounded-2xl border-2 border-navy/10 bg-white p-8">
                  <h3 className="font-display text-2xl font-bold text-navy">{h.name}</h3>
                  {h.subtitle && (
                    <p className="mt-1 text-sm font-semibold text-crimson">{h.subtitle}</p>
                  )}
                  <p className="mt-3 text-muted-foreground">{h.description ?? ""}</p>
                </div>
              </Reveal>
            ))
          ) : (
            // Fallback if DB not populated yet
            [
              { t: "Boys' Hostel", d: "600-bed capacity, mess, Wi-Fi, common room, gymnasium and 24×7 security." },
              { t: "Girls' Hostel", d: "400-bed capacity, dedicated warden, mess, indoor games and safe environment." },
            ].map((h) => (
              <Reveal key={h.t}>
                <div className="card-lift rounded-2xl border-2 border-navy/10 bg-white p-8">
                  <h3 className="font-display text-2xl font-bold text-navy">{h.t}</h3>
                  <p className="mt-3 text-muted-foreground">{h.d}</p>
                </div>
              </Reveal>
            ))
          )}
        </div>
      </section>

      {/* Sports Section */}
      <SportsSection sports={sports} achievements={achievements} sportsFacilities={sportsFacilities} />
    </>
  );
}

function SportsSection({ sports, achievements, sportsFacilities }: { sports: Sport[]; achievements: SportAchievement[]; sportsFacilities: Facility[] }) {
  const totalTrophies = achievements.length;
  const nationalPlus = achievements.filter((a) => ["national", "international"].includes(a.level)).length;
  const outdoorCount = sports.filter((s) => s.category === "outdoor").length;
  const indoorCount  = sports.filter((s) => s.category === "indoor").length;

  return (
    <>
      {/* Sports hero band */}
      <section className="bg-navy text-white py-20">
        <div className="container-page">
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold">Sports & Athletics</div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">Champions On and Off the Field</h2>
            <p className="mt-4 text-base md:text-lg text-white/70 leading-relaxed max-w-3xl">
              SVIT believes sports build character as much as academics. Our state-of-the-art grounds and courts have produced university, state, and national-level athletes.
            </p>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { value: `${sports.length}+`,   label: "Sports Offered" },
              { value: `${outdoorCount}`,      label: "Outdoor Disciplines" },
              { value: `${indoorCount}`,       label: "Indoor Disciplines" },
              { value: `${totalTrophies}+`,    label: "Trophies & Medals" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
                <div className="font-display text-4xl font-bold text-gold">{s.value}</div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-white/60">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sports grid */}
      {sports.length > 0 && (
        <section className="container-page py-20">
          <SectionHeading center eyebrow="Our Sports" title="Disciplines We Offer" />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sports.map((sport, i) => (
              <Reveal key={sport.id} delay={i * 0.04}>
                <div className="card-lift group h-full overflow-hidden rounded-2xl border border-border bg-white">
                  {/* Cover photo */}
                  <div className="relative h-44 w-full overflow-hidden bg-navy/5">
                    {sport.cover_image_url ? (
                      <img
                        src={sport.cover_image_url}
                        alt={sport.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Trophy className="h-14 w-14 text-navy/20" />
                      </div>
                    )}
                    {/* Category badge */}
                    <span className={`absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${CATEGORY_COLOR[sport.category] ?? "bg-slate-100 text-slate-600"}`}>
                      {CATEGORY_LABEL[sport.category] ?? sport.category}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="font-display text-lg font-bold text-navy">{sport.name}</h3>
                    {sport.description && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{sport.description}</p>
                    )}
                    {sport.players_count && (
                      <div className="mt-3 flex items-center gap-1 text-xs text-slate-500">
                        <Users className="h-3.5 w-3.5" />
                        <span>{sport.players_count} players</span>
                      </div>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Sports Facilities / Courts */}
      {sportsFacilities.length > 0 && (
        <section className="container-page py-16">
          <SectionHeading center eyebrow="Courts & Facilities" title="Where Champions Train" />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sportsFacilities.map((f, i) => (
              <Reveal key={f.id} delay={i * 0.04}>
                <div className="card-lift h-full rounded-2xl border border-border bg-white p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-display font-bold text-navy">{f.name}</h4>
                    {f.accent_color && (
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        f.accent_color === "Indoor"
                          ? "bg-sky-100 text-sky-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {f.accent_color}
                      </span>
                    )}
                  </div>
                  {f.subtitle && (
                    <p className="mt-1 text-xs font-semibold text-crimson">{f.subtitle}</p>
                  )}
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                    {f.description ?? ""}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <section className="bg-secondary/50 py-20">
          <div className="container-page">
            <SectionHeading
              center
              eyebrow="Hall of Fame"
              title="Our Achievements"
              subtitle="Notable wins and medals from university, state, and national competitions."
            />
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {achievements.map((a, i) => {
                const cfg = LEVEL_CONFIG[a.level] ?? LEVEL_CONFIG.university;
                const Icon = cfg.icon;
                return (
                  <Reveal key={a.id} delay={i * 0.04}>
                    <div className="card-lift h-full overflow-hidden rounded-2xl border border-border bg-white">
                      {a.image_url && (
                        <img src={a.image_url} alt={a.title} className="h-40 w-full object-cover" loading="lazy" />
                      )}
                      <div className="p-5">
                        {/* Level + Position badges */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${cfg.color}`}>
                            <Icon className="h-3 w-3" />
                            {cfg.label}
                          </span>
                          {a.position && (
                            <span className="rounded-full border border-slate-200 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                              {a.position}
                            </span>
                          )}
                        </div>

                        <h4 className="font-display font-bold text-navy leading-snug">{a.title}</h4>
                        {a.description && (
                          <p className="mt-1.5 text-sm text-muted-foreground line-clamp-3">{a.description}</p>
                        )}

                        {/* Sport name + date footer */}
                        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                          {a.sport?.name && <span className="font-semibold text-crimson">{a.sport.name}</span>}
                          {a.achievement_date && <span>{formatDate(a.achievement_date)}</span>}
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
