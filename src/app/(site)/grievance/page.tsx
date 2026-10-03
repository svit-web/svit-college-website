import type { Metadata } from "next";
import { PageHero } from "@/components/site-next/PageHero";
import { GrievanceForm } from "@/components/site-next/GrievanceForm";

export const metadata: Metadata = {
  title: "Grievance Redressal — SVIT Vasad",
};

export default function Grievance() {
  return (
    <>
      <PageHero title="Grievance Redressal" accent="We're Listening" subtitle="Raise your concerns confidentially. The grievance committee reviews every submission." crumbs={[{ label: "Home", to: "/" }, { label: "Grievance" }]} />

      <section className="container-page py-20">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <GrievanceForm />
          <aside className="border border-line bg-paper-deep p-6">
            <h4 className="font-display font-medium text-navy">What happens next</h4>
            <ol className="mt-4 space-y-3 text-sm text-ink-soft list-decimal list-inside">
              <li>You'll receive a reference number for your records.</li>
              <li>The grievance committee reviews your submission.</li>
              <li>You may be contacted using the email or enrollment details you provided.</li>
              <li>Keep your reference number handy if you need to follow up.</li>
            </ol>
          </aside>
        </div>
      </section>
    </>
  );
}
