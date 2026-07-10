import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/grievance")({
  head: () => ({ meta: [{ title: "Grievance Redressal — SVIT Vasad" }] }),
  component: Grievance,
});

function Grievance() {
  const [sent, setSent] = useState(false);
  const ref = "GRV-" + Math.floor(Math.random() * 90000 + 10000);
  return (
    <>
      <PageHero title="Grievance Redressal" accent="We're Listening" subtitle="Raise your concerns confidentially. Our committee responds within 5 working days." crumbs={[{ label: "Home", to: "/" }, { label: "Grievance" }]} />

      <section className="container-page py-20">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-2xl border border-border bg-white p-8">
            {sent ? (
              <div className="text-center py-8">
                <CheckCircle2 className="mx-auto h-14 w-14 text-gold" />
                <h3 className="mt-4 font-display text-2xl font-bold text-navy">Grievance submitted</h3>
                <p className="mt-2 text-sm text-muted-foreground">Reference: <span className="font-mono font-semibold text-navy">{ref}</span></p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSent(true); toast.success("Grievance registered"); }} className="space-y-4">
                <input required placeholder="Full Name" className="input" />
                <input required placeholder="Enrollment / Employee No." className="input" />
                <input required type="email" placeholder="Email" className="input" />
                <select required className="input">
                  <option value="">Category</option>
                  <option>Academic</option>
                  <option>Hostel</option>
                  <option>Administrative</option>
                  <option>Other</option>
                </select>
                <textarea required rows={5} placeholder="Describe your grievance" className="input" />
                <button className="w-full rounded-md bg-navy px-6 py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-white hover:bg-navy-light">Submit</button>
              </form>
            )}
          </div>
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
      <style>{`.input{width:100%;border-radius:0.375rem;border:1px solid var(--input);background:transparent;padding:0.625rem 0.75rem;font-size:0.875rem}.input:focus{outline:none;box-shadow:0 0 0 2px var(--ring)}`}</style>
    </>
  );
}
