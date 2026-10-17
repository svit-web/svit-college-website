"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Crossfades {children} between routes so navigation doesn't feel like a hard
 * cut. Keyed on the pathname, so a route change is treated as the old page
 * exiting and the new one entering rather than an in-place update. Header and
 * Footer live outside this component (in layout.tsx), so they never animate
 * or re-fetch on navigation — only the page content between them does.
 * `initial={false}` skips the enter animation on first page load.
 *
 * Also re-measures GSAP ScrollTrigger positions after the swap: client-side
 * navigation never fires the window "load" event ScrollEngineProvider's own
 * refresh relies on, so triggers on the new page would otherwise be
 * positioned against the old page's layout.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  if (reduce) return <>{children}</>;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
