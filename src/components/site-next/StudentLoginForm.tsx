"use client";

import { LogIn } from "lucide-react";
import { toast } from "sonner";
import { fieldInput, pillPrimary } from "./site-styles";

export function StudentLoginForm({ itEmail }: { itEmail: string }) {
  return (
    <div className="mx-auto max-w-md border border-line bg-surface p-6 md:p-8">
      <div className="flex h-12 w-12 items-center justify-center border border-line bg-paper-deep text-navy">
        <LogIn className="h-5 w-5" strokeWidth={1.5} />
      </div>
      <h3 className="mt-4 font-display text-2xl font-medium text-navy">Sign in</h3>
      <p className="mt-1 text-sm text-ink-soft">Use your enrollment number and portal password.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          toast.info("Portal integration coming soon.");
        }}
        className="mt-6 space-y-4"
      >
        <input
          required
          placeholder="Enrollment No."
          aria-label="Enrollment number"
          autoComplete="username"
          className={fieldInput}
        />
        <input
          required
          type="password"
          placeholder="Password"
          aria-label="Password"
          autoComplete="current-password"
          className={fieldInput}
        />
        <button className={`w-full ${pillPrimary}`}>Login</button>
      </form>
      <p className="mt-6 text-center text-xs text-ink-soft">
        Need help? Contact{" "}
        <a
          href={`mailto:${itEmail}`}
          className="inline-block py-1 font-semibold text-navy hover:text-crimson"
        >
          {itEmail}
        </a>
      </p>
    </div>
  );
}
