"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type LightboxPhoto = { id?: string; url: string; caption: string | null };

const NAV_BUTTON =
  "absolute top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 active:scale-90 transition-[background-color] duration-150 disabled:opacity-20";

/**
 * Single-photo lightbox: swipe up/down to dismiss, arrow keys, prev/next
 * buttons, counter, Escape / backdrop / X to close. Shared by the public
 * Gallery, the Entry viewer and the Detail page slideshow. Render it inside
 * <AnimatePresence> so the exit animation plays.
 *
 * `children` is an optional info panel (e.g. an Entry's title and full
 * description) shown beneath the photo; without it the photo fills the screen
 * exactly as the Gallery lightbox always has.
 */
export function PhotoLightbox({
  images,
  index,
  onClose,
  onChange,
  label,
  children,
}: {
  images: LightboxPhoto[];
  index: number;
  onClose: () => void;
  onChange: (i: number) => void;
  label?: string;
  children?: ReactNode;
}) {
  const img = images[index];
  const dragY = useMotionValue(0);
  const bgOpacity = useTransform(dragY, [-200, 0, 200], [0, 0.9, 0]);
  const hasPanel = children != null;

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft" && index > 0) onChange(index - 1);
    if (e.key === "ArrowRight" && index < images.length - 1) onChange(index + 1);
    if (e.key === "Escape") onClose();
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (Math.abs(info.offset.y) > 80 || Math.abs(info.velocity.y) > 500) {
      onClose();
    } else {
      dragY.set(0);
    }
  }

  if (!img) return null;

  const counter = (
    <div
      className={`rounded-full bg-black/40 px-4 py-1.5 text-sm text-white/80 ${hasPanel ? "relative z-10" : "absolute bottom-4 left-1/2 z-10 -translate-x-1/2"}`}
    >
      {index + 1} / {images.length}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", bounce: 0, duration: 0.25 }}
      className="fixed inset-0 z-50 flex items-center justify-center outline-none"
      role="dialog"
      aria-modal="true"
      aria-label={label ?? "Photo viewer"}
      onKeyDown={handleKey}
      tabIndex={0}
      // eslint-disable-next-line jsx-a11y/no-autofocus
      autoFocus
    >
      {/* Background — dims with drag distance */}
      <motion.div
        className="absolute inset-0 bg-black"
        style={{ opacity: bgOpacity }}
        onClick={onClose}
      />

      {/* Close */}
      <button
        className="absolute right-4 top-4 z-20 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 active:scale-90 transition-[background-color] duration-150"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Prev */}
      <button
        className={`${NAV_BUTTON} left-4`}
        onClick={(e) => {
          e.stopPropagation();
          onChange(index - 1);
        }}
        disabled={index === 0}
        aria-label="Previous"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <div
        className={
          hasPanel
            ? "pointer-events-none relative z-10 flex max-h-[100dvh] w-full flex-col items-center gap-4 px-4 py-16 md:px-16"
            : "contents"
        }
      >
        {/* Draggable image — swipe up/down to dismiss */}
        <motion.div
          style={{ y: dragY }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.25}
          onDragEnd={handleDragEnd}
          className="pointer-events-auto relative z-10 cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              key={img.url}
              src={img.url}
              alt={img.caption || ""}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ type: "spring", bounce: 0, duration: 0.25 }}
              className={`${hasPanel ? "max-h-[55dvh]" : "max-h-[90vh]"} max-w-[90vw] rounded-lg object-contain pointer-events-none select-none`}
            />
          </AnimatePresence>
        </motion.div>

        {hasPanel && (
          <>
            {images.length > 1 && counter}
            <div
              className="pointer-events-auto w-full max-w-3xl min-h-0 overflow-y-auto overscroll-contain rounded-2xl bg-white p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </div>
          </>
        )}
      </div>

      {/* Next */}
      <button
        className={`${NAV_BUTTON} right-4`}
        onClick={(e) => {
          e.stopPropagation();
          onChange(index + 1);
        }}
        disabled={index === images.length - 1}
        aria-label="Next"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Counter */}
      {!hasPanel && counter}
    </motion.div>
  );
}
