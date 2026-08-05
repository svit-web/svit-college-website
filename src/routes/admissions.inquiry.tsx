import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { getAllProgrammes } from "@/lib/programmes.functions";
import { getContactInfo } from "@/lib/pages.functions";
import { getMiscSettings } from "@/lib/site-settings.functions";
import { submitForm } from "@/lib/submissions";
import { useState } from "react";
import { CheckCircle2, Loader2, Phone } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admissions/inquiry")({
  head: ({ loaderData }) => {
    const yr = loaderData?.admissionYear ?? "2026-27";
    return { meta: [{ title: "Admission Inquiry — SVIT Vasad" }, { name: "description", content: `Submit an admission enquiry for ${yr} at SVIT Vasad.` }] };
  },
  loader: async () => {
    const [programmes, contact, misc] = await Promise.all([
      getAllProgrammes(),
      getContactInfo(),
      getMiscSettings(),
    ]);
    return { programmes, phone: contact?.phone ?? "+91 2692 274766", admissionYear: misc.admission_year, placementPct: misc.placement_percentage };
  },
  component: Inquiry,
});

function Inquiry() {
  const { programmes, phone, admissionYear, placementPct } = Route.useLoaderData();
  const yr = admissionYear ?? "2026-27";
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData(e.currentTarget);
      await submitForm("admission-inquiry", {
        first_name: fd.get("first_name"),
        last_name: fd.get("last_name"),
        email: fd.get("email"),
        mobile: fd.get("mobile"),
        city: fd.get("city"),
        state: fd.get("state"),
        programme: fd.get("programme"),
        year: fd.get("year"),
        message: fd.get("message"),
      });
      setSent(true);
      toast.success("Inquiry submitted!");
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHero title="Admission Inquiry" accent={yr} subtitle="Share your details — our admissions team will guide you within 24 hours." crumbs={[{ label: "Home", to: "/" }, { label: "Admissions", to: "/admissions" }, { label: "Inquiry" }]} />

      <section className="container-page py-20">
        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-2xl border border-border bg-white p-8">
            {sent ? (
              <div className="flex flex-col items-center py-10 text-center">
                <CheckCircle2 className="h-14 w-14 text-gold" />
                <h3 className="mt-4 font-display text-2xl font-bold text-navy">Thank you!</h3>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">Your inquiry has been received. Our admissions counsellor will reach out shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="First Name *"><input name="first_name" required className="input" /></Field>
                  <Field label="Last Name *"><input name="last_name" required className="input" /></Field>
                  <Field label="Email *"><input name="email" required type="email" className="input" /></Field>
                  <Field label="Mobile *"><input name="mobile" required className="input" /></Field>
                  <Field label="City"><input name="city" className="input" /></Field>
                  <Field label="State"><input name="state" className="input" /></Field>
                  <Field label="Programme *">
                    <select name="programme" required className="input">
                      <option value="">Select programme</option>
                      {programmes.map((c) => <option key={c.code} value={c.name}>{c.name}</option>)}
                    </select>
                  </Field>
                  <Field label="Year *">
                    <select name="year" required className="input">
                      <option value={yr}>{yr}</option>
                    </select>
                  </Field>
                </div>
                <Field label="Message"><textarea name="message" rows={4} className="input" /></Field>
                <label className="flex items-start gap-2 text-xs text-muted-foreground">
                  <input type="checkbox" required className="mt-0.5" />
                  I agree to be contacted by SVIT admissions team.
                </label>
                <button disabled={submitting} className="w-full rounded-md bg-navy px-6 py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-white hover:bg-navy-light transition-colors disabled:opacity-60">
                  {submitting ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "Submit Inquiry"}
                </button>
              </form>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl bg-gradient-to-br from-navy to-navy-light p-6 text-white">
              <div className="text-xs font-semibold uppercase tracking-widest text-gold">Why Apply</div>
              <h3 className="mt-2 font-display text-xl font-bold">Join a legacy of 20 years</h3>
              <ul className="mt-4 space-y-2 text-sm text-white/85">
                <li>&bull; AICTE approved programmes</li>
                <li>&bull; {placementPct ?? 95}%+ placement record</li>
                <li>&bull; Scholarships available</li>
                <li>&bull; Modern hostels</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-white p-6">
              <div className="text-xs font-semibold uppercase tracking-widest text-crimson">Helpline</div>
              <h3 className="mt-1 font-display text-lg font-bold text-navy">Talk to admissions</h3>
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="mt-3 inline-flex items-center gap-2 text-navy hover:text-gold">
                <Phone className="h-4 w-4" /> {phone}
              </a>
            </div>
          </aside>
        </div>
      </section>
      <style>{`.input{width:100%;border-radius:0.375rem;border:1px solid var(--input);background:transparent;padding:0.625rem 0.75rem;font-size:0.875rem}.input:focus{outline:none;box-shadow:0 0 0 2px var(--ring)}`}</style>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-ink">{label}</span>
      {children}
    </label>
  );
}
