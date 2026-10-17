"use client";

import "./globals.css";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="container-page py-32 text-center">
          <h1 className="font-display text-4xl font-bold text-navy">Something went wrong</h1>
          <p className="mt-3 text-muted-foreground">
            A critical error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            className="mt-6 rounded-md bg-navy px-5 py-2.5 text-xs font-bold uppercase tracking-[0.08em] text-white hover:bg-navy-light"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
