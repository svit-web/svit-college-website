import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { AlertTriangle, Mail, Phone } from "lucide-react";

export const Route = createFileRoute("/anti-ragging")({
  head: () => ({ meta: [{ title: "Anti-Ragging — SVIT Vasad" }] }),
  component: AntiRagging,
});

function AntiRagging() {
  return (
    <>
      <PageHero title="Anti-Ragging" accent="Zero Tolerance" subtitle="SVIT Vasad maintains a strict anti-ragging policy in compliance with UGC regulations." crumbs={[{ label: "Home", to: "/" }, { label: "Anti-Ragging" }]} />

      <section className="container-page py-20">
        <div className="max-w-3xl">
          <div className="flex items-start gap-3 rounded-2xl border border-crimson/20 bg-crimson/5 p-6">
            <AlertTriangle className="h-6 w-6 text-crimson shrink-0" />
            <div>
              <h3 className="font-display font-bold text-crimson">Ragging is a criminal offence</h3>
              <p className="mt-1 text-sm">Any act of physical or mental abuse, targeted at another student, is punishable under Indian law and SVIT's Code of Conduct.</p>
            </div>
          </div>

          <h2 className="mt-10 font-display text-2xl font-bold text-navy">Our Policy</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground leading-relaxed">
            <li>• 24×7 anti-ragging monitoring across hostels, classrooms and campus areas.</li>
            <li>• Every student signs an anti-ragging undertaking at the start of the academic year.</li>
            <li>• Confidential complaints handled by the Anti-Ragging Committee within 48 hours.</li>
            <li>• Penalties range from suspension and hostel expulsion to police FIR.</li>
          </ul>

          <div className="mt-12 rounded-2xl bg-navy p-8 text-white">
            <h3 className="font-display text-xl font-bold">Report Ragging</h3>
            <p className="mt-2 text-sm text-white/80">Reach out anonymously or with full details. All complaints are kept strictly confidential.</p>
            <div className="mt-5 space-y-2 text-sm">
              <a href="tel:1800-180-5522" className="flex items-center gap-2 text-gold"><Phone className="h-4 w-4" /> UGC Anti-Ragging Helpline: 1800-180-5522</a>
              <a href="mailto:antiragging@svitvasad.ac.in" className="flex items-center gap-2 text-gold"><Mail className="h-4 w-4" /> antiragging@svitvasad.ac.in</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
