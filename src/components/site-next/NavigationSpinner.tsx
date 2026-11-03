"use client";

import { Suspense, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  endNavigation,
  holdNavigation,
  isNavigationPending,
  startNavigation,
  subscribeToNavigation,
} from "@/lib/navigation-progress";

// Fast navigations never show it; once shown it stays long enough not to flicker.
const SHOW_DELAY_MS = 200;
const MIN_VISIBLE_MS = 300;

/** True for a click that will move to another page in this tab. */
function isPageNavigation(event: MouseEvent) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return false;
  }
  const link = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
  if (!link || link.hasAttribute("download")) return false;
  if (link.target && link.target !== "_self") return false;

  const url = new URL(link.href, window.location.href);
  if (url.origin !== window.location.origin) return false;
  // Covers #section links and links to the current page.
  if (url.pathname === window.location.pathname && url.search === window.location.search) {
    return false;
  }
  // Files served from /public open or download rather than navigate.
  return !/\.[a-z0-9]{2,5}$/i.test(url.pathname);
}

function NavigationWatcher() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const currentPath = useRef(pathname);

  useEffect(() => {
    currentPath.current = pathname;
    endNavigation();
  }, [pathname, search]);

  useEffect(() => {
    // Capture phase: next/link cancels the click's default action further down,
    // which is indistinguishable from a link that doesn't navigate at all.
    const onClick = (event: MouseEvent) => {
      if (isPageNavigation(event)) startNavigation(currentPath.current);
    };
    const onPopState = () => {
      if (window.location.pathname !== currentPath.current) {
        startNavigation(currentPath.current, "back");
      }
    };
    // Back to a page the browser restored from its cache: nothing else ends it.
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) endNavigation();
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  return null;
}

/**
 * Goes in a loading.tsx: keeps the spinner up for as long as that fallback is
 * on screen, since by then the URL has already changed.
 */
export function NavigationHold() {
  useEffect(() => holdNavigation(), []);
  return null;
}

/**
 * Centred "Loading…" indicator over a faded screen, for route changes on the
 * public site and admin. Clicks pass through, so the menu and other links stay
 * usable behind it.
 */
export function NavigationSpinner() {
  const pending = useSyncExternalStore(subscribeToNavigation, isNavigationPending, () => false);
  const [visible, setVisible] = useState(false);
  const shownAt = useRef(0);

  useEffect(() => {
    if (pending === visible) return;
    const delay = pending
      ? SHOW_DELAY_MS
      : Math.max(MIN_VISIBLE_MS - (Date.now() - shownAt.current), 50);
    const timer = setTimeout(() => {
      shownAt.current = Date.now();
      setVisible(pending);
    }, delay);
    return () => clearTimeout(timer);
  }, [pending, visible]);

  return (
    <>
      <Suspense fallback={null}>
        <NavigationWatcher />
      </Suspense>
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center"
      >
        {visible && (
          <>
            <div className="absolute inset-0 bg-paper/70 animate-in fade-in-0 duration-200 motion-reduce:animate-none" />
            <div className="relative flex items-center gap-4 rounded-2xl border border-line bg-surface px-8 py-5 shadow-xl animate-in fade-in-0 duration-200 motion-reduce:animate-none">
              <span
                aria-hidden
                className="h-9 w-9 animate-spin rounded-full border-[3px] border-crimson/25 border-t-crimson motion-reduce:hidden"
              />
              <span className="text-lg font-semibold text-navy">Loading…</span>
            </div>
          </>
        )}
      </div>
    </>
  );
}
