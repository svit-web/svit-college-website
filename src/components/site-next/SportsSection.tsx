import Image from "next/image";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";
import type { Facility } from "@/lib/facilities.functions";
import type { Sport, SportAchievement } from "@/lib/sports.functions";
import { Trophy, Medal, Star, Users } from "lucide-react";

const CATEGORY_LABEL: Record<string, string> = {
  outdoor: "Outdoor",
  indoor: "Indoor",
  aquatic: "Aquatic",
  combat: "Combat",
};

const CATEGORY_COLOR: Record<string, string> = {
  outdoor: "bg-emerald-100 text-emerald-700",
  indoor: "bg-sky-100 text-sky-700",
  aquatic: "bg-cyan-100 text-cyan-700",
  combat: "bg-orange-100 text-orange-700",
};

const LEVEL_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ComponentType<{ className?: string }> }
> = {
  international: { label: "International", color: "bg-purple-600 text-white", icon: Star },
  national: { label: "National", color: "bg-gold text-navy-deep", icon: Trophy },
  state: { label: "State", color: "bg-navy text-white", icon: Medal },
  university: { label: "University", color: "bg-emerald-600 text-white", icon: Users },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

function SportsStats({
  sports,
  totalTrophies,
  outdoorCount,
  indoorCount,
}: {
  sports: Sport[];
  totalTrophies: number;
  outdoorCount: number;
  indoorCount: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {[
        { value: `${sports.length}+`, label: "Sports Offered" },
        { value: `${outdoorCount}`, label: "Outdoor Disciplines" },
        { value: `${indoorCount}`, label: "Indoor Disciplines" },
        { value: `${totalTrophies}+`, label: "Trophies & Medals" },
      ].map((s) => (
        <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
          <div className="font-display text-4xl font-bold text-gold">{s.value}</div>
          <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-white/60">
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function SportsGrid({ sports }: { sports: Sport[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {sports.map((sport, i) => (
        <Reveal key={sport.id} delay={i * 0.04}>
          <div className="card-lift group h-full overflow-hidden rounded-2xl border border-border bg-white">
            <div className="relative h-44 w-full overflow-hidden bg-navy/5">
              {sport.cover_image_url ? (
                <Image
                  src={sport.cover_image_url}
                  alt={sport.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Trophy className="h-14 w-14 text-navy/20" />
                </div>
              )}
              <span
                className={`absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${CATEGORY_COLOR[sport.category] ?? "bg-slate-100 text-slate-600"}`}
              >
                {CATEGORY_LABEL[sport.category] ?? sport.category}
              </span>
            </div>

            <div className="p-5">
              <h3 className="font-display text-lg font-bold text-navy">{sport.name}</h3>
              {sport.description && (
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                  {sport.description}
                </p>
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
  );
}

function SportsFacilitiesGrid({ sportsFacilities }: { sportsFacilities: Facility[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {sportsFacilities.map((f, i) => (
        <Reveal key={f.id} delay={i * 0.04}>
          <div className="card-lift h-full rounded-2xl border border-border bg-white p-5">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-display font-bold text-navy">{f.name}</h4>
              {f.accent_color && (
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${
                    f.accent_color === "Indoor"
                      ? "bg-sky-100 text-sky-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {f.accent_color}
                </span>
              )}
            </div>
            {f.subtitle && <p className="mt-1 text-xs font-semibold text-crimson">{f.subtitle}</p>}
            <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{f.description ?? ""}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

function AchievementsGrid({ achievements }: { achievements: SportAchievement[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {achievements.map((a, i) => {
        const cfg = LEVEL_CONFIG[a.level] ?? LEVEL_CONFIG.university;
        const Icon = cfg.icon;
        return (
          <Reveal key={a.id} delay={i * 0.04}>
            <div className="card-lift h-full overflow-hidden rounded-2xl border border-border bg-white">
              {a.image_url && (
                <div className="relative h-40 w-full">
                  <Image
                    src={a.image_url}
                    alt={a.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-5">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${cfg.color}`}
                  >
                    <Icon className="h-3 w-3" />
                    {cfg.label}
                  </span>
                  {a.position && (
                    <span className="rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                      {a.position}
                    </span>
                  )}
                </div>

                <h4 className="font-display font-bold text-navy leading-snug">{a.title}</h4>
                {a.description && (
                  <p className="mt-1.5 text-sm text-muted-foreground line-clamp-3">
                    {a.description}
                  </p>
                )}

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
  );
}

/**
 * Shared "Sports & Athletics" content, sourced from the sports/sports_achievements
 * tables. `variant="standalone"` (default) renders full-bleed colored bands, for
 * use on a bare page like /campus. `variant="embedded"` renders the same data as
 * plain stacked sections, for use inside a constrained layout like the Campus
 * Life sidebar page, which already provides its own container and padding.
 */
export function SportsSection({
  sports,
  achievements,
  sportsFacilities,
  variant = "standalone",
}: {
  sports: Sport[];
  achievements: SportAchievement[];
  sportsFacilities: Facility[];
  variant?: "standalone" | "embedded";
}) {
  const totalTrophies = achievements.length;
  const outdoorCount = sports.filter((s) => s.category === "outdoor").length;
  const indoorCount = sports.filter((s) => s.category === "indoor").length;

  if (variant === "embedded") {
    return (
      <div className="space-y-12">
        <section className="rounded-2xl bg-navy p-8 text-white md:p-10">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Sports & Athletics
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white">
            Champions On and Off the Field
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/70 md:text-base">
            SVIT believes sports build character as much as academics. Our state-of-the-art
            grounds and courts have produced university, state, and national-level athletes.
          </p>
          <div className="mt-10">
            <SportsStats
              sports={sports}
              totalTrophies={totalTrophies}
              outdoorCount={outdoorCount}
              indoorCount={indoorCount}
            />
          </div>
        </section>

        {sports.length > 0 && (
          <section>
            <SectionHeading eyebrow="Our Sports" title="Disciplines We Offer" />
            <div className="mt-6">
              <SportsGrid sports={sports} />
            </div>
          </section>
        )}

        {sportsFacilities.length > 0 && (
          <section>
            <SectionHeading eyebrow="Courts & Facilities" title="Where Champions Train" />
            <div className="mt-6">
              <SportsFacilitiesGrid sportsFacilities={sportsFacilities} />
            </div>
          </section>
        )}

        {achievements.length > 0 && (
          <section>
            <SectionHeading
              eyebrow="Hall of Fame"
              title="Our Achievements"
              subtitle="Notable wins and medals from university, state, and national competitions."
            />
            <div className="mt-6">
              <AchievementsGrid achievements={achievements} />
            </div>
          </section>
        )}
      </div>
    );
  }

  return (
    <>
      <section className="bg-navy text-white py-20">
        <div className="container-page">
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              Sports & Athletics
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
              Champions On and Off the Field
            </h2>
            <p className="mt-4 text-base md:text-lg text-white/70 leading-relaxed max-w-3xl">
              SVIT believes sports build character as much as academics. Our state-of-the-art
              grounds and courts have produced university, state, and national-level athletes.
            </p>
          </div>

          <div className="mt-12">
            <SportsStats
              sports={sports}
              totalTrophies={totalTrophies}
              outdoorCount={outdoorCount}
              indoorCount={indoorCount}
            />
          </div>
        </div>
      </section>

      {sports.length > 0 && (
        <section className="container-page py-20">
          <SectionHeading center eyebrow="Our Sports" title="Disciplines We Offer" />
          <div className="mt-12">
            <SportsGrid sports={sports} />
          </div>
        </section>
      )}

      {sportsFacilities.length > 0 && (
        <section className="container-page py-16">
          <SectionHeading center eyebrow="Courts & Facilities" title="Where Champions Train" />
          <div className="mt-10">
            <SportsFacilitiesGrid sportsFacilities={sportsFacilities} />
          </div>
        </section>
      )}

      {achievements.length > 0 && (
        <section className="bg-secondary/50 py-20">
          <div className="container-page">
            <SectionHeading
              center
              eyebrow="Hall of Fame"
              title="Our Achievements"
              subtitle="Notable wins and medals from university, state, and national competitions."
            />
            <div className="mt-12">
              <AchievementsGrid achievements={achievements} />
            </div>
          </div>
        </section>
      )}
    </>
  );
}
