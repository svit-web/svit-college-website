"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initScrollEngine } from "@/lib/scroll-engine";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function ScrollEngineProvider() {
  useEffect(() => {
    initScrollEngine();

    // GSAP ScrollTrigger positions computed before images/fonts settle (or
    // during React Strict Mode's mount->cleanup->mount cycle) can go stale,
    // leaving triggers that never fire. One refresh once layout has truly
    // settled recalculates every registered trigger, fixing all of them.
    const refresh = () => ScrollTrigger.refresh();
    const raf = requestAnimationFrame(() => requestAnimationFrame(refresh));
    window.addEventListener("load", refresh);
    document.fonts?.ready?.then(refresh);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("load", refresh);
    };
  }, []);

  return null;
}
