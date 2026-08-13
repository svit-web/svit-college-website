'use client';

import { LogIn } from "lucide-react";
import { toast } from "sonner";

export function StudentLoginForm({ itEmail }: { itEmail: string }) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-border bg-white p-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-navy/5 text-navy"><LogIn className="h-5 w-5" /></div>
      <h3 className="mt-4 font-display text-2xl font-bold text-navy">Sign in</h3>
      <p className="mt-1 text-sm text-muted-foreground">Use your enrollment number and portal password.</p>
      <form onSubmit={(e) => { e.preventDefault(); toast.info("Portal integration coming soon."); }} className="mt-6 space-y-4">
        <input required placeholder="Enrollment No." className="input" />
        <input required type="password" placeholder="Password" className="input" />
        <button className="w-full rounded-md bg-navy px-6 py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-white hover:bg-navy-light">Login</button>
      </form>
      <p className="mt-6 text-xs text-muted-foreground text-center">
        Need help? Contact <a href={`mailto:${itEmail}`} className="font-semibold text-navy hover:text-gold">{itEmail}</a>
      </p>
      <style>{`.input{width:100%;border-radius:0.375rem;border:1px solid var(--input);background:transparent;padding:0.625rem 0.75rem;font-size:0.875rem}.input:focus{outline:none;box-shadow:0 0 0 2px var(--ring)}`}</style>
    </div>
  );
}
