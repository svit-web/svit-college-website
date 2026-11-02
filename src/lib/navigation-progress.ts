// Shared "is a page on its way?" state behind NavigationSpinner. Two sources
// feed it because neither covers the whole wait: a click marks the start, but
// Next changes the URL as soon as a loading.tsx fallback commits, which is well
// before the page's data arrives. So each fallback holds the state open too
// (NavigationHold) until the real page replaces it.

// A click that never changes the URL (a redirect back to the same page, a link
// whose handler cancelled it) must not leave the spinner up forever.
const CLICK_TIMEOUT_MS = 15_000;

export type NavigationDirection = "forward" | "back";

let navigating = false;
let holds = 0;
let origin: string | null = null;
let direction: NavigationDirection = "forward";
let timeout: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

export function subscribeToNavigation(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function isNavigationPending() {
  return navigating || holds > 0;
}

/** True from a click until the URL changes; loading.tsx fallbacks don't count. */
export function isNavigating() {
  return navigating;
}

/** The path a navigation in progress is leaving, so that page can animate out. */
export function getNavigationOrigin() {
  return origin;
}

export function getNavigationDirection() {
  return direction;
}

export function startNavigation(from: string, nextDirection: NavigationDirection = "forward") {
  clearTimeout(timeout);
  timeout = setTimeout(endNavigation, CLICK_TIMEOUT_MS);
  navigating = true;
  origin = from;
  direction = nextDirection;
  emit();
}

export function endNavigation() {
  clearTimeout(timeout);
  if (!navigating) return;
  navigating = false;
  emit();
}

/** Keeps the state pending until the returned function is called. */
export function holdNavigation() {
  holds += 1;
  emit();
  return () => {
    holds -= 1;
    emit();
  };
}
