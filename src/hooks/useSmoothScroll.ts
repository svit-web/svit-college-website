"use client";

import { useCallback, useEffect, useState } from "react";
import {
  initScrollEngine,
  isSmoothScrollEnabled,
  setSmoothScrollEnabled,
  subscribeSmoothScrollEnabled,
} from "@/lib/scroll-engine";

export function useSmoothScroll() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    initScrollEngine();
    setEnabled(isSmoothScrollEnabled());
    return subscribeSmoothScrollEnabled(setEnabled);
  }, []);

  const toggle = useCallback(() => setSmoothScrollEnabled(!isSmoothScrollEnabled()), []);

  return { enabled, toggle };
}
