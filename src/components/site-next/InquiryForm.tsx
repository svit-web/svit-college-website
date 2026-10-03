"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Phone } from "lucide-react";
import { toast } from "sonner";
import { submitForm } from "@/lib/submissions-next";
import { eyebrow, fieldInput, fieldLabel, pillPrimary, sectionSpacing } from "./site-styles";
import type { Programme } from "@/lib/programmes.functions";

export function InquiryForm({
  programmes,
  phone,
  admissionYear,
  placementPct,
}: {
  programmes: Programme[];
  phone?: string | null;
  admissionYear?: string;
  placementPct?: number;
}) {
  const yr = admissionYear;
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData(e.currentTarget);
      await submitForm(
        "admission-inquiry",
        {
          first_name: fd.get("first_name"),
          last_name: fd.get("last_name"),
          email: fd.get("email"),
          mobile: fd.get("mobile"),
          city: fd.get("city"),
          state: fd.get("state"),
          programme: fd.get("programme"),
          year: fd.get("year"),
          message: fd.get("message"),
        },
        String(fd.get("website_url") ?? "")
      );
      setSent(true);
      toast.success("Inquiry submitted!");
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={`container-page ${sectionSpacing}`}>
      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="border border-line bg-surface p-6 md:p-8">
          {sent ? (
            <div className="flex flex-col items-center py-10 text-center">
              <CheckCircle2 className="h-14 w-14 text-gold" />
              <h3 className="mt-4 font-display text-2xl font-medium text-navy">Thank you!</h3>
              <p className="mt-2 max-w-md text-sm text-ink-soft">
                Your inquiry has been received. Our admissions counsellor will reach out shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Honeypot: hidden from real visitors, a bot that fills every
                  field trips it. Not a visible label/Field — those are for
                  humans. */}
              <input
                type="text"
                name="website_url"
                tabIndex={-1}
                autoComplete="off"
                className="sr-only"
                aria-hidden="true"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First Name *">
                  <input name="first_name" required className={fieldInput} />
                </Field>
                <Field label="Last Name *">
                  <input name="last_name" required className={fieldInput} />
                </Field>
                <Field label="Email *">
                  <input name="email" required type="email" className={fieldInput} />
                </Field>
                <Field label="Mobile *">
                  <input name="mobile" required className={fieldInput} />
                </Field>
                <Field label="City">
                  <input name="city" className={fieldInput} />
                </Field>
                <Field label="State">
                  <input name="state" className={fieldInput} />
                </Field>
                <Field label="Programme *">
                  <select name="programme" required className={fieldInput}>
                    <option value="">Select programme</option>
                    {programmes.map((c) => (
                      <option key={c.code} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Admission Year">
                  <input type="hidden" name="year" value={yr} />
                  <div className={`${fieldInput} flex items-center text-ink-soft`}>{yr}</div>
                </Field>
              </div>
              <Field label="Message">
                <textarea name="message" rows={4} className={fieldInput} />
              </Field>
              <label className="flex items-start gap-2.5 py-1 text-sm text-ink-soft">
                <input type="checkbox" required className="mt-1 h-4 w-4 shrink-0 accent-navy" />I
                agree to be contacted by SVIT admissions team.
              </label>
              <button disabled={submitting} className={`w-full disabled:opacity-60 ${pillPrimary}`}>
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit Inquiry"}
              </button>
            </form>
          )}
        </div>

        <aside className="space-y-4">
          <div className="border border-line bg-paper-deep p-6">
            <div className={eyebrow}>Why Apply</div>
            <h3 className="mt-2 font-display text-xl font-medium text-navy">
              Join a legacy of 20 years
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-ink-soft">
              <li>&bull; AICTE approved programmes</li>
              {placementPct && <li>&bull; {placementPct}%+ placement record</li>}
              <li>&bull; Scholarships available</li>
              <li>&bull; Modern hostels</li>
            </ul>
          </div>
          <div className="border border-line bg-surface p-6">
            <div className={eyebrow}>Helpline</div>
            <h3 className="mt-2 font-display text-lg font-medium text-navy">Talk to admissions</h3>
            {phone && (
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="mt-3 inline-flex items-center gap-2 py-1 font-semibold text-navy hover:text-crimson"
              >
                <Phone className="h-4 w-4" /> {phone}
              </a>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className={fieldLabel}>{label}</span>
      {children}
    </label>
  );
}
