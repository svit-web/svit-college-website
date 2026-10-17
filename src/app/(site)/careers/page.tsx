import type { Metadata } from "next";
import { PageHero } from "@/components/site-next/PageHero";
import { Reveal } from "@/components/site-next/Reveal";
import { getJobListings } from "@/lib/homepage.functions";
import { getContactInfo } from "@/lib/site-settings.functions";
import { pillPrimary } from "@/components/site-next/site-styles";
import { Briefcase, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Careers at SVIT Vasad",
  description: "Teach, research and grow at SVIT Vasad — current openings and how to apply.",
  alternates: { canonical: "/careers" },
};

export default async function Careers() {
  const [jobs, contact] = await Promise.all([
    getJobListings().catch(() => []),
    getContactInfo().catch(() => null),
  ]);
  const email = contact?.email ?? null;

  return (
    <>
      <PageHero
        title="Careers at SVIT"
        accent="Join Our Team"
        subtitle="Teach, research and grow with a community that values excellence and collaboration."
        crumbs={[{ label: "Home", to: "/" }, { label: "Careers" }]}
      />

      <section className="container-page py-20">
        <div className="space-y-4">
          {jobs.map((j, i) => (
            <Reveal key={j.id} delay={i * 0.04}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-line bg-surface p-6">
                <div>
                  <h3 className="font-display font-medium text-navy">{j.title}</h3>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-ink-soft">
                    <span className="inline-flex items-center gap-1">
                      <Briefcase className="h-3 w-3" /> {j.subtitle}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {j.body}
                    </span>
                  </div>
                </div>
                {email && (
                  <a
                    href={`mailto:${email}?subject=Application: ${encodeURIComponent(j.title)}`}
                    className={`shrink-0 ${pillPrimary}`}
                  >
                    Apply
                  </a>
                )}
              </div>
            </Reveal>
          ))}
        </div>
        {jobs.length === 0 && (
          <Reveal>
            <div className="border border-line bg-surface p-8 text-center">
              <h3 className="font-display font-medium text-navy">No current openings</h3>
              <p className="mt-2 text-sm text-ink-soft">
                There are no vacancies at the moment. Please check back later.
              </p>
            </div>
          </Reveal>
        )}
        {email && (
          <div className="mt-10 border border-line bg-paper-deep p-6 text-sm text-ink-soft">
            Don't see your role? Send your CV to{" "}
            <a
              href={`mailto:${email}`}
              className="inline-block py-1 font-semibold text-navy hover:text-crimson"
            >
              {email}
            </a>
            .
          </div>
        )}
      </section>
    </>
  );
}
