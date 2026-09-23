"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { entryHasAlbumPhotos, type EntryCardData } from "@/lib/entry";
import { PhotoLightbox } from "./PhotoLightbox";
import { PlainText } from "./PlainText";

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
        <div className="text-xs font-bold uppercase tracking-widest text-crimson">
          {entry.subtitle}
        </div>
      )}
      <h2 className="mt-1 font-display text-2xl font-bold text-navy">{entry.title}</h2>
      <PlainText
        text={entry.description}
        className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base"
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
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", bounce: 0, duration: 0.25 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 outline-none"
      role="dialog"
      aria-modal="true"
      aria-label={entry.title}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      tabIndex={0}
      // eslint-disable-next-line jsx-a11y/no-autofocus
      autoFocus
    >
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ type: "spring", bounce: 0, duration: 0.25 }}
        className="relative z-10 max-h-[85dvh] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-2xl bg-white p-6 md:p-8"
      >
        <button
          className="absolute right-3 top-3 rounded-full p-2 text-navy/60 hover:bg-navy/5 hover:text-navy active:scale-90 transition-[background-color,color] duration-150"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="pr-8">
          <EntryText entry={entry} />
        </div>
      </motion.div>
    </motion.div>
  );
}
