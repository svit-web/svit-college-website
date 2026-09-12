"use client";

// Singleton scroll-velocity feed shared by every scroll-reactive animation on
// the site (currently the recruiters marquee). Velocity keeps updating the
// same way whether or not Lenis smooth-scrolling is turned on — Lenis only
// changes how scrolling *feels*, never whether reactive animations work.
import type Lenis from "lenis";
import { isSmoothScrollStoredEnabled, storeSmoothScrollEnabled } from "./smooth-scroll";

let velocity = 0;
let lastY = 0;
let nativeRafId: number | null = null;
let lenisInstance: Lenis | null = null;
let lenisRafId: number | null = null;
let started = false;
let smoothEnabled = false;
const listeners = new Set<(enabled: boolean) => void>();

function nativeTick() {
  const y = window.scrollY;
  velocity = y - lastY;
  lastY = y;
  nativeRafId = requestAnimationFrame(nativeTick);
}

function stopNativeTick() {
  if (nativeRafId !== null) {
    cancelAnimationFrame(nativeRafId);
    nativeRafId = null;
  }
}

async function enableLenis() {
  if (lenisInstance) return;
  const { default: LenisCtor } = await import("lenis");
  stopNativeTick();
  lenisInstance = new LenisCtor({ duration: 1.15, smoothWheel: true });
  lenisInstance.on("scroll", (e: { velocity: number }) => {
    velocity = e.velocity;
  });
  const raf = (time: number) => {
    lenisInstance?.raf(time);
    if (lenisInstance) lenisRafId = requestAnimationFrame(raf);
  };
  lenisRafId = requestAnimationFrame(raf);
}

function disableLenis() {
  if (lenisRafId !== null) {
    cancelAnimationFrame(lenisRafId);
    lenisRafId = null;
  }
  lenisInstance?.destroy();
  lenisInstance = null;
  lastY = window.scrollY;
  if (nativeRafId === null) nativeRafId = requestAnimationFrame(nativeTick);
}

export function initScrollEngine() {
  if (started || typeof window === "undefined") return;
  started = true;
  lastY = window.scrollY;
  smoothEnabled = isSmoothScrollStoredEnabled();
  if (smoothEnabled) void enableLenis();
  else nativeRafId = requestAnimationFrame(nativeTick);
}

export function getScrollVelocity(): number {
  return velocity;
}

export function isSmoothScrollEnabled(): boolean {
  return smoothEnabled;
}

export function setSmoothScrollEnabled(next: boolean): void {
  smoothEnabled = next;
  storeSmoothScrollEnabled(next);
  if (next) void enableLenis();
  else disableLenis();
  listeners.forEach((l) => l(next));
}

export function subscribeSmoothScrollEnabled(cb: (enabled: boolean) => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
