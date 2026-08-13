import type { Metadata } from "next";
import { PageHero } from "@/components/site-next/PageHero";
import { GrievanceForm } from "@/components/site-next/GrievanceForm";

export const metadata: Metadata = {
  title: "Grievance Redressal — SVIT Vasad",
};

export default function Grievance() {
  return (
    <>
      <PageHero title="Grievance Redressal" accent="We're Listening" subtitle="Raise your concerns confidentially. Our committee responds within 5 working days." crumbs={[{ label: "Home", to: "/" }, { label: "Grievance" }]} />

      <section className="container-page py-20">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <GrievanceForm />
          <aside className="rounded-2xl bg-secondary/50 p-6">
            <h4 className="font-display font-bold text-navy">What happens next</h4>
            <ol className="mt-4 space-y-3 text-sm text-muted-foreground list-decimal list-inside">
              <li>You'll receive a reference number.</li>
              <li>The committee reviews within 48 hours.</li>
              <li>A resolution or update is sent within 5 working days.</li>
              <li>Escalation is available if unresolved.</li>
            </ol>
          </aside>
        </div>
      </section>
    </>
  );
}
