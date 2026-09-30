"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { submitForm } from "@/lib/submissions-next";
import { fieldInput, pillPrimary } from "./site-styles";

export function GrievanceForm() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refNumber, setRefNumber] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData(e.currentTarget);
      const ref = "GRV-" + Date.now().toString(36).toUpperCase();
      await submitForm("grievance", {
        name: fd.get("name"),
        enrollment_no: fd.get("enrollment_no"),
        email: fd.get("email"),
        category: fd.get("category"),
        description: fd.get("description"),
        reference_number: ref,
      });
      setRefNumber(ref);
      setSent(true);
      toast.success("Grievance registered");
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="border border-line bg-surface p-6 md:p-8">
      {sent ? (
        <div className="text-center py-8">
          <CheckCircle2 className="mx-auto h-14 w-14 text-gold" />
          <h3 className="mt-4 font-display text-2xl font-medium text-navy">Grievance submitted</h3>
          <p className="mt-2 text-sm text-ink-soft">
            Reference: <span className="font-mono font-semibold text-navy">{refNumber}</span>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            required
            placeholder="Full Name"
            aria-label="Full name"
            className={fieldInput}
          />
          <input
            name="enrollment_no"
            required
            placeholder="Enrollment / Employee No."
            aria-label="Enrollment or employee number"
            className={fieldInput}
          />
          <input
            name="email"
            required
            type="email"
            placeholder="Email"
            aria-label="Email"
            className={fieldInput}
          />
          <select name="category" required aria-label="Category" className={fieldInput}>
            <option value="">Category</option>
            <option value="Academic">Academic</option>
            <option value="Hostel">Hostel</option>
            <option value="Administrative">Administrative</option>
            <option value="Other">Other</option>
          </select>
          <textarea
            name="description"
            required
            rows={5}
            placeholder="Describe your grievance"
            aria-label="Describe your grievance"
            className={fieldInput}
          />
          <button disabled={submitting} className={`w-full disabled:opacity-60 ${pillPrimary}`}>
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit"}
          </button>
        </form>
      )}
    </div>
  );
}
