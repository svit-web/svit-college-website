'use client';

import { useState } from "react";
import { toast } from "sonner";
import type { CollegeDept } from "./CollegeLandingPage";

export function EnquiryForm({ shortCode, departments }: { shortCode: string; departments: CollegeDept[] }) {
  const [sent, setSent] = useState(false);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
        toast.success("Enquiry submitted — we'll be in touch shortly.");
      }}
      className="rounded-2xl border border-border bg-white p-6"
    >
      <div className="text-xs font-semibold uppercase tracking-widest text-crimson">Quick Enquiry</div>
      <h3 className="mt-1 font-display text-xl font-bold text-navy">Talk to {shortCode}</h3>
      {sent ? (
        <div className="mt-6 rounded-md bg-secondary p-5 text-sm">Thank you! We'll respond within 24 hours.</div>
      ) : (
        <div className="mt-4 space-y-3">
          <input required placeholder="Full Name" className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <input required type="email" placeholder="Email" className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <input required placeholder="Mobile" className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <select className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm">
            <option>Interested Programme</option>
            {departments.map((d) => (
              <option key={d.id}>{d.name}</option>
            ))}
          </select>
          <button className="w-full rounded-md bg-navy px-4 py-3 text-sm font-bold uppercase tracking-[0.08em] text-white hover:bg-navy-light transition-colors">
            Submit Enquiry
          </button>
        </div>
      )}
    </form>
  );
}
