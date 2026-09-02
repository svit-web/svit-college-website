import type { Metadata } from "next";
import { PageHero } from "@/components/site-next/PageHero";
import { Reveal } from "@/components/site-next/Reveal";
import { getJobListings } from "@/lib/homepage.functions";
import { getContactInfo } from "@/lib/site-settings.functions";
import { Briefcase, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Careers at SVIT Vasad",
};

export default async function Careers() {
  const [jobs, contact] = await Promise.all([
    getJobListings().catch(() => []),
    getContactInfo().catch(() => null),
  ]);
  const email = contact?.email ?? null;

  return (
    <>
      <PageHero title="Careers at SVIT" accent="Join Our Team" subtitle="Teach, research and grow with a community that values excellence and collaboration." crumbs={[{ label: "Home", to: "/" }, { label: "Careers" }]} />

      <section className="container-page py-20">
        <div className="space-y-4">
          {jobs.map((j, i) => (
            <Reveal key={j.id} delay={i * 0.04}>
              <div className="card-lift flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border bg-white p-6">
                <div>
                  <h3 className="font-display font-bold text-navy">{j.title}</h3>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Briefcase className="h-3 w-3" /> {j.subtitle}</span>
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {j.body}</span>
                  </div>
                </div>
                {email && (
                  <a href={`mailto:${email}?subject=Application: ${encodeURIComponent(j.title)}`} className="rounded-md bg-navy px-5 py-2.5 text-xs font-bold uppercase tracking-[0.08em] text-white hover:bg-navy-light">Apply</a>
                )}
              </div>
            </Reveal>
          ))}
        </div>
        {email && (
          <div className="mt-10 rounded-2xl border border-border bg-secondary/50 p-6 text-sm text-muted-foreground">
            Don't see your role? Send your CV to <a href={`mailto:${email}`} className="font-semibold text-navy hover:text-gold">{email}</a>.
          </div>
        )}
      </section>
    </>
  );
}
