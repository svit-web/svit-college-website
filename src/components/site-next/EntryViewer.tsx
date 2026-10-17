"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { entryHasAlbumPhotos, type EntryCardData } from "@/lib/entry";
import { PhotoLightbox } from "./PhotoLightbox";
import { PlainText } from "./PlainText";
import { useDialogFocus } from "./useDialogFocus";
import { circleIconButton, eyebrow } from "./site-styles";

/**
 * The Entry viewer (CONTEXT.md): the lightbox a Card without a Detail page
 * opens when it has more to show. The grid that renders the Cards owns the
 * open/closed state and passes the selected Entry here (null = closed), so one
 * viewer serves a whole grid.
 */
export function EntryViewer({
  entry,
  onClose,
}: {
  entry: EntryCardData | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {entry && <EntryViewerContent key={entry.id} entry={entry} onClose={onClose} />}
    </AnimatePresence>
  );
}

function EntryText({ entry }: { entry: EntryCardData }) {
  return (
    <>
      {entry.subtitle && (
        <div className={eyebrow}>{entry.subtitle}</div>
      )}
      <h2 className="mt-2 font-display text-2xl font-medium leading-tight text-navy md:text-3xl">
        {entry.title}
      </h2>
      <PlainText
        text={entry.description}
        className="mt-4 space-y-4 text-sm leading-relaxed text-ink-soft md:text-base"
      />
    </>
  );
}

function EntryViewerContent({ entry, onClose }: { entry: EntryCardData; onClose: () => void }) {
  const [index, setIndex] = useState(0);

  if (entryHasAlbumPhotos(entry)) {
    return (
      <PhotoLightbox
        images={entry.album!.media}
        index={index}
        onChange={setIndex}
        onClose={onClose}
        label={entry.title}
      >
        <EntryText entry={entry} />
      </PhotoLightbox>
    );
  }

  // No photos: the long description was the only reason to open.
  return <EntryTextDialog entry={entry} onClose={onClose} />;
}

function EntryTextDialog({ entry, onClose }: { entry: EntryCardData; onClose: () => void }) {
  const dialogRef = useDialogFocus<HTMLDivElement>();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", bounce: 0, duration: 0.25 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 outline-none"
      role="dialog"
      aria-modal="true"
      aria-label={entry.title}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      tabIndex={-1}
      ref={dialogRef}
    >
      <div className="absolute inset-0 bg-ink/85" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ type: "spring", bounce: 0, duration: 0.25 }}
        className="relative z-10 max-h-[85dvh] w-full max-w-2xl overflow-y-auto overscroll-contain border border-line bg-paper p-6 md:p-8"
      >
        <button
          type="button"
          className={`absolute right-3 top-3 ${circleIconButton}`}
          onClick={onClose}
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="pr-12">
          <EntryText entry={entry} />
        </div>
      </motion.div>
    </motion.div>
  );
}
