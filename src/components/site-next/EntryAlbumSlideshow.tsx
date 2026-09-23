"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { EntryPhoto } from "@/lib/entry";
import { PhotoSlider } from "./PhotoSlider";
import { PhotoLightbox } from "./PhotoLightbox";

/** Detail page slideshow: the shared PhotoSlider, opening the shared lightbox on click. */
export function EntryAlbumSlideshow({ photos, title }: { photos: EntryPhoto[]; title: string }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <PhotoSlider
        photos={photos}
        ariaLabel={`${title} photos`}
        photoAlt={title}
        aspectRatio="16/9"
        onPhotoClick={setLightboxIndex}
      />
      <AnimatePresence>
        {lightboxIndex !== null && (
          <PhotoLightbox
            images={photos}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onChange={setLightboxIndex}
            label={title}
          />
        )}
      </AnimatePresence>
    </>
  );
}
