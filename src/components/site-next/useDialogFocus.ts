"use client";

import { useEffect, useRef } from "react";

/**
 * Moves focus into a custom dialog when it mounts (so its onKeyDown sees
 * Escape / arrow keys) and hands focus back to whatever opened it on close.
 * React's `autoFocus` only focuses form controls, not a `tabIndex` div.
 */
export function useDialogFocus<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    ref.current?.focus({ preventScroll: true });
    return () => opener?.focus?.({ preventScroll: true });
  }, []);
  return ref;
}
