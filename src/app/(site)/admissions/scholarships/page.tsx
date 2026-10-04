import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site-next/PageHero";
import { SectionHeading } from "@/components/site-next/SectionHeading";
import { Reveal } from "@/components/site-next/Reveal";
import { getAllScholarships, type Scholarship } from "@/lib/scholarships.functions";
import { pillPrimary } from "@/components/site-next/site-styles";
import { GraduationCap, Heart, Building2, Trophy, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Scholarships — SVIT Vasad",
  description: "Merit, need-based, government and sports scholarships available at SVIT Vasad.",
  alternates: { canonical: "/admissions/scholarships" },
};

const TYPE_META: Record<string, { label: string; icon: typeof GraduationCap; color: string }> = {
  merit:  { label: "Merit",       icon: GraduationCap, color: "text-navy bg-gold-soft border-gold/40" },
  need:   { label: "Need-Based",  icon: Heart,         color: "text-crimson bg-crimson/10 border-crimson/20" },
  govt:   { label: "Government",  icon: Building2,     color: "text-navy bg-paper-deep border-navy/20" },
  sports: { label: "Sports",      icon: Trophy,        color: "text-navy bg-paper-deep border-line-strong" },
  other:  { label: "Other",       icon: HelpCircle,    color: "text-ink-soft bg-paper-deep border-line" },
};

function ScholarshipCard({ s }: { s: Scholarship }) {
  const meta = TYPE_META[s.type] ?? TYPE_META.other;
  const Icon = meta.icon;
  return (
    <div className="border border-line bg-surface p-6 flex flex-col gap-4 h-full">
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
        <h3 className="font-display text-lg font-medium text-navy leading-snug">{s.name}</h3>
        {s.provider && <p className="mt-0.5 text-xs text-ink-soft">{s.provider}</p>}
      </div>
      {s.description && <p className="text-sm text-ink/70 leading-relaxed flex-1">{s.description}</p>}
      {s.eligibility && (
        <div className="bg-paper-deep px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wider text-ink-soft mb-1">Eligibility</p>
          <p className="text-sm text-ink/80">{s.eligibility}</p>
        </div>
      )}
    </div>
  );
}

export default async function ScholarshipsPage() {
  const scholarships = await getAllScholarships().catch(() => []);

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
            <GraduationCap className="mx-auto h-12 w-12 text-ink-soft/30 mb-4" />
            <p className="text-ink-soft">Scholarship information will be published soon.</p>
            <p className="mt-1 text-sm text-ink-soft">Please contact the admissions office for current scholarship details.</p>
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

      <section className="mt-8 border-t border-line bg-gold-soft py-[clamp(56px,8vw,96px)]">
        <div className="container-page text-center max-w-2xl">
          <h2 className="font-display text-2xl font-medium text-navy md:text-3xl">Need Help Applying for a Scholarship?</h2>
          <p className="mt-3 text-sm text-ink-soft md:text-base">Our admissions team can guide you through the application and documentation process.</p>
          <Link
            href="/admissions/inquiry"
            className={`mt-6 ${pillPrimary}`}
          >
            Contact Admissions Office
          </Link>
        </div>
      </section>
    </>
  );
}
