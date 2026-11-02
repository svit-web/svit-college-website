"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  getNavigationDirection,
  getNavigationOrigin,
  isNavigating,
  subscribeToNavigation,
} from "@/lib/navigation-progress";

const SLIDE_PX = 120;

/**
 * Slides pages in and out between routes: forward navigation moves left, Back
 * moves right. Keyed on the pathname, so a route change mounts a new page rather
 * than updating the old one in place. Header and Footer live outside this
 * component (in layout.tsx), so they never animate or re-fetch on navigation.
 * `initial={false}` skips the enter animation on first page load.
 *
 * The slide-out starts from the click (navigation-progress) instead of an
 * AnimatePresence exit: once the App Router swaps routes, an exiting copy would
 * render the new page, so the old one is animated away while it's still mounted.
 * A prefetched page can arrive before the slide-out finishes, which just cuts
 * straight to the slide-in.
 *
 * Also re-measures GSAP ScrollTrigger positions after the swap: client-side
 * navigation never fires the window "load" event ScrollEngineProvider's own
 * refresh relies on, so triggers on the new page would otherwise be
 * positioned against the old page's layout.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const navigating = useSyncExternalStore(subscribeToNavigation, isNavigating, () => false);
  const leaving = navigating && getNavigationOrigin() === pathname;
  const offset = getNavigationDirection() === "back" ? -SLIDE_PX : SLIDE_PX;

  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  if (reduce) return <>{children}</>;

  // overflow-x-clip: the sliding page mustn't add a horizontal scrollbar. Unlike
  // overflow-hidden it leaves position: sticky working.
  return (
    <div className="overflow-x-clip">
      <AnimatePresence initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, x: offset }}
          animate={leaving ? { opacity: 0, x: -offset } : { opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
