export const SMOOTH_SCROLL_STORAGE_KEY = "svit-smooth-scroll";

export function isSmoothScrollStoredEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SMOOTH_SCROLL_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function storeSmoothScrollEnabled(enabled: boolean): void {
  try {
    window.localStorage.setItem(SMOOTH_SCROLL_STORAGE_KEY, enabled ? "1" : "0");
  } catch {
    // localStorage unavailable (private mode, etc.) — preference just won't persist.
  }
}
