"use client";

import { useState } from "react";
import { toast } from "sonner";
import { eyebrow, fieldInput, pillPrimary } from "./site-styles";
import type { CollegeDept } from "./CollegeLandingPage";

export function EnquiryForm({
  shortCode,
  departments,
}: {
  shortCode: string;
  departments: CollegeDept[];
}) {
  const [sent, setSent] = useState(false);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
        toast.success("Enquiry submitted — we'll be in touch shortly.");
      }}
      className="border border-line bg-surface p-6"
    >
      <div className={eyebrow}>Quick Enquiry</div>
      <h3 className="mt-2 font-display text-xl font-medium text-navy">Talk to {shortCode}</h3>
      {sent ? (
        <div className="mt-6 border border-line bg-paper-deep p-5 text-sm text-ink-soft">
          Thank you! We'll respond within 24 hours.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <input required placeholder="Full Name" aria-label="Full name" className={fieldInput} />
          <input
            required
            type="email"
            placeholder="Email"
            aria-label="Email"
            className={fieldInput}
          />
          <input required placeholder="Mobile" aria-label="Mobile" className={fieldInput} />
          <select aria-label="Interested programme" className={fieldInput}>
            <option>Interested Programme</option>
            {departments.map((d) => (
              <option key={d.id}>{d.name}</option>
            ))}
          </select>
          <button className={`w-full ${pillPrimary}`}>Submit Enquiry</button>
        </div>
      )}
    </form>
  );
}
