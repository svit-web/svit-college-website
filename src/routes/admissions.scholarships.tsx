import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import { getAllScholarships, type Scholarship } from "@/lib/scholarships.functions";
import { GraduationCap, Heart, Building2, Trophy, HelpCircle } from "lucide-react";

export const Route = createFileRoute("/admissions/scholarships")({
  head: () => ({
    meta: [
      { title: "Scholarships — SVIT Vasad" },
      { name: "description", content: "Merit, need-based, government and sports scholarships available at SVIT Vasad." },
    ],
  }),
  loader: async () => {
    const scholarships = await getAllScholarships();
    return { scholarships };
  },
  component: ScholarshipsPage,
});

const TYPE_META: Record<string, { label: string; icon: typeof GraduationCap; color: string }> = {
  merit:  { label: "Merit",       icon: GraduationCap, color: "text-gold bg-gold/10 border-gold/20" },
  need:   { label: "Need-Based",  icon: Heart,         color: "text-crimson bg-crimson/10 border-crimson/20" },
  govt:   { label: "Government",  icon: Building2,     color: "text-navy bg-navy/10 border-navy/20" },
  sports: { label: "Sports",      icon: Trophy,        color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  other:  { label: "Other",       icon: HelpCircle,    color: "text-slate-500 bg-slate-50 border-slate-200" },
};

function ScholarshipCard({ s }: { s: Scholarship }) {
  const meta = TYPE_META[s.type] ?? TYPE_META.other;
  const Icon = meta.icon;
  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-sm flex flex-col gap-4 card-lift h-full">
      <div className="flex items-start justify-between gap-3">
        <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.color}`}>
          <Icon className="h-3.5 w-3.5" />
          {meta.label}
        </div>
        {s.amount && (
          <span className="text-xs font-bold text-navy bg-gold/10 border border-gold/20 rounded-full px-2.5 py-1">
            {s.amount}
          </span>
        )}
      </div>
      <div>
        <h3 className="font-display text-lg font-bold text-navy leading-snug">{s.name}</h3>
        {s.provider && <p className="mt-0.5 text-xs text-muted-foreground">{s.provider}</p>}
      </div>
      {s.description && <p className="text-sm text-ink/70 leading-relaxed flex-1">{s.description}</p>}
      {s.eligibility && (
        <div className="rounded-lg bg-secondary/60 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Eligibility</p>
          <p className="text-sm text-ink/80">{s.eligibility}</p>
        </div>
      )}
    </div>
  );
}

function ScholarshipsPage() {
  const { scholarships } = Route.useLoaderData();

  const grouped = scholarships.reduce<Record<string, Scholarship[]>>((acc, s) => {
    (acc[s.type] ??= []).push(s);
    return acc;
  }, {});

  const order = ["merit", "govt", "need", "sports", "other"];
  const types = order.filter((t) => grouped[t]?.length);

  return (
    <>
      <PageHero
        title="Scholarships"
        accent="& Financial Aid"
        subtitle="We believe financial constraints should never stand in the way of education. Explore available scholarships and support programmes."
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Admissions", to: "/admissions" },
          { label: "Scholarships" },
        ]}
      />

      <section className="container-page py-16">
        {scholarships.length === 0 ? (
          <div className="text-center py-24">
            <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">Scholarship information will be published soon.</p>
            <p className="mt-1 text-sm text-muted-foreground">Please contact the admissions office for current scholarship details.</p>
          </div>
        ) : (
          <div className="space-y-14">
            {types.map((type) => {
              const meta = TYPE_META[type] ?? TYPE_META.other;
              return (
                <div key={type}>
                  <SectionHeading eyebrow="Category" title={`${meta.label} Scholarships`} />
                  <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {grouped[type].map((s, i) => (
                      <Reveal key={s.id} delay={i * 0.05}>
                        <ScholarshipCard s={s} />
                      </Reveal>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="bg-navy text-white py-14 mt-8">
        <div className="container-page text-center max-w-2xl">
          <h2 className="font-display text-2xl font-bold">Need Help Applying for a Scholarship?</h2>
          <p className="mt-3 text-white/70 text-sm">Our admissions team can guide you through the application and documentation process.</p>
          <a
            href="/contact"
            className="mt-6 inline-flex rounded-md bg-gold px-6 py-3 text-sm font-bold uppercase tracking-[0.08em] text-navy-deep hover:bg-gold-soft transition-colors"
          >
            Contact Admissions Office
          </a>
        </div>
      </section>
    </>
  );
}
